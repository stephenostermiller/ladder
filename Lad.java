/*
 * Part of Ladder, a game.
 * Copyright (C) 1999  Stephen Ostermiller <Ladder@Ostermiller.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * See COPYING.TXT for details.
 */

package com.Ostermiller.Ladder;

import java.util.*;

public class Lad extends Creature{
    private int command;
	private int futureCommand;
	private boolean futureJump;
    private boolean jumpCommand;
    private int futureDirection;
    private int jump;
    public static final int STOP = 5;
    public static final int LEFT = 4;
    public static final int RIGHT = 6;
    public static final int UP = 8;
    public static final int DOWN = 2;
    public static final int NONE = 0;
    public static final int JUMP = 10;
    public static final int FALL = 11;
    public static final int UPLEFT = 7;
    public static final int UPRIGHT = 9;
    public static final int DOWNLEFT = 1;
    public static final int DOWNRIGHT = 3;
	private Random rand;
	// the environment around the character
	private char one, two, three, four, five, six, seven, eight, nine;
    
    public Lad(int xpos, int ypos, int direction){
        this.xpos = xpos;
        this.ypos = ypos;
        this.direction = direction;
        symbol = 'g';
		command = Lad.NONE;
		futureJump = false;
		jumpCommand = false;
		futureDirection = Creature.STATIONARY;
		jump = 0;
		rand = new Random();
    }
    
    public void setJump(){
        jumpCommand = true;
    }        
    
    public void setCommand(int command){
        this.command = command;
    }
	
	private boolean canMoveUp(){
	    // nothing solid can be above us to be able to move up.
	    return(eight != '=' && eight != '|' && eight != '-'); 
	}
	
	private boolean canClimbUp(){
	    // must be a ladder above us to be able to climb up
		// a $ can hide a ladder
	    return(eight == 'H' || eight == '$');
    }
	
	private boolean canMoveDown(){
	    // nothing solid can be below us to be able move down.
	    return(two != '=' && two != '|' && two != '-');
	}
	
	private boolean canMoveUpLeft(){
	    // nothing solid can be there to be able move there.
	    return(seven != '=' && seven != '|' && seven != '-');
	}
	
	private boolean canMoveDownLeft(){
	    // nothing solid can be there to be able move there.
	    return(one != '=' && one != '|' && one != '-');
	}
	
	private boolean canMoveUpRight(){
	    // nothing solid can be there to be able move there.
	    return(nine != '=' && nine != '|' && nine != '-');
	}
	
	private boolean canMoveDownRight(){
	    // nothing solid can be there to be able move there.
	    return(three != '=' && three != '|' && three != '-');
	}
	
	private boolean canMoveRight(){
	    // nothing solid can be there to be able move there.
	    return(six != '=' && six != '|' && six != '-');
	}
	
	private boolean canMoveLeft(){
	    // nothing solid can be there to be able move there.
	    return(four != '=' && four != '|' && four != '-');
	}
	
	private boolean canStayPut(){
	    // we have to be standing on something solid,
		// or be hanging on to something solid
	    return(two == '=' || two == '|' || two == '-' || five == 'H');
	}
	
	private boolean inAJump(){
	    // if we are in the middle of a jump
		// we know we are in the middle of a jump if the jump
		// variable is 1,2,3,4, or 5 representing the various
		// stages of a jump.
		// If it is 0 we are not jumping and if it is 6, we just
		// ended a jump.
		return(jump > 0 && jump < 6);
	}
	
	private boolean JumpJustOver(){
	    return (jump>5);
	}
	
	private boolean moveScheduled(){
	    return(command != Lad.NONE && futureCommand != Lad.NONE && !jumpCommand && !futureJump);
	}
	
	// assume that canStayPut() has already been checked
	// assume any future jump commands have been moved to jump command
	// assume there is no command or future command
	// assume not in the middle of a jump
    private void moveMomentum(){
	    if (inAJump()){
		    return; // we can't handle this.
		}
		if (five == '.'){
		    return; // we can't handle this.
		}
	    // we are going one of the four directions
	    if (direction == Creature.DOWN){
		    // we can go down but not jump down
		    if (canMoveDown() && !JumpJustOver()){
		        command = Lad.DOWN;
			} else {
			    command = Lad.STOP;
			}
			// cancel any jump commands
			if (jumpCommand){
			    jumpCommand = false;
			}			
		} else if (direction == Creature.LEFT){
		    if (jumpCommand){
			    if (canMoveUpLeft()){
				    command = Lad.LEFT;
					return;
				} else {
				    futureJump = true;
					jumpCommand = false;
				}
			} 
			if (canMoveLeft()){   
		        command = Lad.LEFT;
			} else {
			    command = Lad.STOP;
			}
		} else if (direction == Creature.RIGHT){
		    if (jumpCommand){
			    if (canMoveUpRight()){
				    command = Lad.RIGHT;
					return;
				} else {
				    futureJump = true;
					jumpCommand = false;
				}
			} 
			if (canMoveRight()){   
		        command = Lad.RIGHT;
			} else {
			    command = Lad.STOP;
			}
		} else if (direction == Creature.UP){
		    if (canClimbUp()){
			    if (jumpCommand){
    			    futureJump = true;
    				jumpCommand = false;
				}
				command = Lad.UP;
			} else if (canMoveUp() && jumpCommand){
			    command = Lad.UP;
			} else {
			    command = Lad.STOP;
		    }
		} else if (jumpCommand){
		    if (canMoveUp()){
			    command = Lad.UP;
			} else {
			    futureJump = true;
				jumpCommand = false;
				command = Lad.STOP;
			}   
		} else {
		    command = Lad.STOP;
		}
	}
	
	private boolean moveJump(){
        if (five == 'H'){
            // end a jump on a ladder.
            jump = 0;
            if (!moveScheduled()){
                command = Lad.STOP;
            }
            return(moveNoJump());
        } else if (canStayPut() && moveScheduled() && moveNoJump()){ // end jump if we can
		    jump = 0;
			return(true);
		} else if (command == Lad.LEFT){
		    if (direction == Creature.LEFT){
			    futureCommand = Lad.LEFT;
			} else {
                direction = Creature.LEFT;
			}
        } else if (command == Lad.RIGHT){
            if (direction == Creature.RIGHT){
			    futureCommand = Lad.RIGHT;
			} else {
                direction = Creature.RIGHT;
			}
        } else if (command == Lad.UP){
            futureCommand = Lad.UP;
        } else if (command == Lad.DOWN){
            futureCommand = Lad.DOWN;
        } else if (command == Lad.STOP){
            direction = Creature.STATIONARY;
        }
		if (jumpCommand){
		    jumpCommand = false;
			futureJump = true;
		}
        if (jump == 1){            
            if (direction == Creature.LEFT){
			    if (canMoveUpLeft()){
				    command = Lad.UPLEFT;
				} else if (canStayPut()){
				    if (canMoveLeft()){
					    command = Lad.LEFT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
					if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.LEFT;
                    }
				}				    
            } else if (direction == Creature.RIGHT){
                if (canMoveUpRight()){
				    command = Lad.UPRIGHT;
				} else if (canStayPut()){
				    if (canMoveRight()){
					    command = Lad.RIGHT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
				    if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.RIGHT;
                    }
				}
            } else {
			    if (canMoveUp()){
				    command = Lad.UP;
				} else if (canStayPut()){
				    command = Lad.STOP;
				} else {
				    command = Lad.FALL;
				}
            }
            jump++;
        } else if (jump == 2 || jump == 3){
            if (direction == Creature.LEFT){
                if (canMoveLeft()){
				    command = Lad.LEFT;
				} else if (canStayPut()){
				    if (canMoveLeft()){
					    command = Lad.LEFT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
					if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.LEFT;
                    }
				}	
            } else if (direction == Creature.RIGHT){
                if (canMoveRight()){
				    command = Lad.RIGHT;
				} else if (canStayPut()){
				    if (canMoveRight()){
					    command = Lad.RIGHT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
					if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.RIGHT;
                    }
				}
            } else {
                command = Lad.STOP; // we can stop here even if we can't hang on.
                jump = 3; // straight up and down jumps don't last as long
            }
            jump++;
        } else if (jump == 4 || jump == 5){
            if (direction == Creature.LEFT){
                if (canMoveDownLeft()){
				    command = Lad.DOWNLEFT;
				} else if (canStayPut()){
				    if (canMoveLeft()){
					    command = Lad.LEFT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
					if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.LEFT;
                    }
				}	
            } else if (direction == Creature.RIGHT){
                if (canMoveDownRight()){
				    command = Lad.DOWNRIGHT;
				} else if (canStayPut()){
				    if (canMoveRight()){
					    command = Lad.RIGHT;
					} else {
				        command = Lad.STOP;
					}
				} else {
				    command = Lad.FALL;
					if(futureCommand != Lad.DOWN){
					    futureCommand = Lad.RIGHT;
                    }
				}
            } else {
                if (canMoveDown()){
				    command = Lad.DOWN;
				} else if (canStayPut()){
				    command = Lad.STOP;
				} else {
				    command = Lad.FALL;
				}	
            }
            jump++;
		}
		return(true);   
	}
	
	// returns true if it was able to act immediatly on a command or future command
	private boolean moveNoJump(){
	    if (command != Lad.NONE){ // any directional changes cancel future jumps and commands
		    futureJump = false;
			futureCommand = Lad.NONE;
		}     
        if (!canStayPut() && five != '.'){
		    // move any command and jumps to the future and go down because we are falling
			if (direction == Creature.LEFT && futureCommand != Lad.DOWN){
			    futureCommand = Lad.LEFT;
			} else if (direction == Creature.RIGHT && futureCommand != Lad.DOWN){
			    futureCommand = Lad.RIGHT;
			}
			if (command != Lad.NONE){
			    futureCommand = command;
		    }
			if (jumpCommand){
        	    futureJump = true;
		        jumpCommand = false;	
			}
			command = Lad.FALL;
			
			return(false);
	    }
		// move future commands and future jumps into position if there are none in position
		if (command == Lad.NONE){
            command = futureCommand;
			futureCommand = Lad.NONE;
        }
        if (!jumpCommand){
            jumpCommand = futureJump;
			futureJump = false;
        }
		
		// go through commands    
		if (command == Lad.STOP){
            if (jumpCommand && !canMoveUp()){ // we'll have to jump later
                futureJump = true;
                jumpCommand = false;
            }                   
            return(true);
        } else if (command == Lad.DOWN){
            if(canMoveDown()){ 
			    if (jumpCommand){ // move down and jump????   Maybe not.
    				jumpCommand = false;
    			}  
				return(true);
			} else {
			    futureCommand = Lad.DOWN;
				moveMomentum();
				return(false);
			}
        } else if (command == Lad.UP){
            if (canClimbUp()){
			    if (jumpCommand){
    			    futureJump = true;
    				jumpCommand = false;
				}
				command = Lad.UP;
				return(true);
			} else if (canMoveUp() && jumpCommand){
			    command = Lad.UP;
				return(true);
			} else {
			    futureCommand = Lad.UP;
			    moveMomentum();
				return(false);
		    }
        } else if (command == Lad.RIGHT){
            if (jumpCommand){
			    if (canMoveUpRight()){
				    command = Lad.RIGHT;
					return (true);
				} else if (canMoveUp()){
				    command = Lad.UP;
					futureCommand = Lad.RIGHT;
					return(true);
				} else {
				    futureJump = true;
					jumpCommand = false;
				}
			} 
			if (canMoveRight()){   
		        command = Lad.RIGHT;
				return (true);
			} else {
			    futureCommand = Lad.RIGHT;
			    moveMomentum();
				return(false);
			}
        } else if (command == Lad.LEFT){
		    if (jumpCommand){
			    if (canMoveUpLeft()){
				    command = Lad.LEFT;
					return (true);
				} else if (canMoveUp()){
				    command = Lad.UP;
					futureCommand = Lad.LEFT;
					return(true);
				} else {
				    futureJump = true;
					jumpCommand = false;
				}
			} 
			if (canMoveLeft()){
			    command = Lad.LEFT;
				return(true);
			} else {
			    futureCommand = Lad.LEFT;
			    moveMomentum();
				return(false);
			}
        }
		moveMomentum();
		return (false);
	}
	
	/**
	 * Figure out where we should go if we are on a trampoline
	 */
	private boolean moveOnTrampoline(){
	    int count, choice;
		// allow us to stop on the trampoline and and get a command next time.
        if (inAJump()){
		    // the choices here are:
			// continue the jump as planned
			// switch direction and continue the jump
			// cancel the jump and do something different
            choice = rand.nextInt(4);
			if (choice == 0){
			    moveJump();
				return(true);
			} else if (choice == 1){
			    if (direction == Creature.LEFT){
				    direction = Creature.RIGHT;
				} else if (direction == Creature.RIGHT){
				    direction = Creature.LEFT;
				}
				moveJump();
				return(true);
			} else {
			    jump = 0;
				moveOnTrampoline();
				return(true);
			}
		} else {
		    if (moveScheduled() && moveNoJump()){
			    return(true); //we found somewhere to move
			} else if (direction == Creature.STATIONARY || direction == Creature.DOWN){
			    // if we are right on top of the thing, jump on it, if we can
				if (canMoveUp()){
                    jumpCommand = true;
					return(true); //we found somewhere to move
				} else {
				    command = Lad.STOP;
					return(false); //we were unable to find somewhere to move
				}				    
            } else {
			    // we moved into it some other way
				// there are five possible ways in which you might want
				// to throw somebody off the trampoline.
				// count the number of ways possible for the lad to
				// move and throw it equally likely in all directions
				// possible
				count = 0;
				if (canMoveLeft()){
				    count ++;
				}
				if (canMoveUpLeft()){
				    count ++;
				}
				if (canMoveUp()){
				    count ++;
				}
				if (canMoveUpRight()){
				    count ++;
				}
				if (canMoveRight()){
				    count ++;				
                }
				if (count == 0){
				    command = Lad.STOP;
					return(false); //we were unable to find somewhere to move
				} else {
				    choice = rand.nextInt(count);
				    count = 0;
					if (canMoveLeft()){
					    if (count == choice){
						    command = Lad.LEFT;
						    return(true); //we found somewhere to move
						}						
    				    count++;
    				}
    				if (canMoveUpLeft()){
    				    if (count == choice){
						    jumpCommand = true;
							command = Lad.LEFT;
							return(true); //we found somewhere to move
						}						
    				    count++;
    				}
    				if (canMoveUp()){
    				    if (count == choice){
						    jumpCommand = true;
							return(true); //we found somewhere to move
						}						
    				    count++;
    				}
    				if (canMoveUpRight()){
    				    if (count == choice){
						    command = Lad.RIGHT;
						    jumpCommand = true;
							return(true); //we found somewhere to move
						}						
    				    count++;
    				}
    				if (canMoveRight()){
    				    if (count == choice){
						    command = Lad.RIGHT;
						    return(true); //we found somewhere to move
						}				
                    }				
				}
			}
        }
		command = Lad.STOP;
		return(false); //we were unable to find somewhere to move	
	}
    
    public void update(char one, char two, char three, char four, char five, char six,
        char seven, char eight, char nine){
		this.one = one;
		this.two = two;
		this.three = three;
		this.four = four;
		this.five = five;
		this.six = six;
		this.seven = seven;
		this.eight = eight;
		this.nine = nine;

		if (five == '.'){
		    moveOnTrampoline();
	    } else if (inAJump()){
		    moveJump();
		} else {
		    moveNoJump();
		}
		
		if (jumpCommand){
		    jump = 1;
			jumpCommand = false;
			if (command == Lad.LEFT){
			    command = Lad.UPLEFT;
			} else if (command == Lad.RIGHT){  
			    command = Lad.UPRIGHT;
			} else {
			    command = Lad.UP;
			}
		}
		
		if (jump == 6){
		    jump = 7;
		}else if (jump ==7){
		    jump = 0;
		}
				
		if (command == Lad.STOP){
            symbol = 'g';
            direction = Creature.STATIONARY;
        } else if (command == Lad.UP){
            if (symbol == 'g' && jump == 0){
                symbol = 'p';
            }
            direction = Creature.UP;
            ypos--;
        } else if (command == Lad.DOWN){
            if (symbol == 'g' && jump == 0){
                symbol = 'p';
            }
            direction = Creature.DOWN;
            ypos++;
        } else if (command == Lad.RIGHT){
            xpos++;
            direction = Creature.RIGHT;
            symbol = 'p';
	    } else if (command == Lad.LEFT){
            xpos--;
            direction = Creature.LEFT;
            symbol = 'q';
        } else if (command == Lad.UPRIGHT){
            direction = Creature.RIGHT;
			xpos++;
            ypos--;
            symbol = 'p';
        } else if (command == Lad.UPLEFT){
			direction = Creature.LEFT;
            xpos--;
            ypos--;
            symbol = 'q';
        } else if (command == Lad.DOWNRIGHT){
            direction = Creature.RIGHT;
			xpos++;
            ypos++;
            symbol = 'p';
        } else if (command == Lad.DOWNLEFT){
            direction = Creature.LEFT;
			xpos--;
            ypos++;
            symbol = 'q';
        } else if (command == Lad.FALL){
            direction = Creature.DOWN;
			ypos++;
            symbol = 'b';
        }
    }
}
    
