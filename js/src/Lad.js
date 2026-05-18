/*
 * LADDER GAME - Lad
 * Player character logic
 */

"use strict";

import Creature from './Creature.js';

function randNextInt(max) {
	return Math.floor(Math.random() * (Math.floor(max) + 1));
}

class Lad extends Creature {
	static STOP = 5;
	static LEFT = 4;
	static RIGHT = 6;
	static UP = 8;
	static DOWN = 2;
	static NONE = 0;
	static JUMP = 10;
	static FALL = 11;
	static UPLEFT = 7;
	static UPRIGHT = 9;
	static DOWNLEFT = 1;
	static DOWNRIGHT = 3;

	constructor(xpos, ypos, direction) {
		super(xpos, ypos, direction);
		this.one = ' ';
		this.two = ' ';
		this.three = ' ';
		this.four = ' ';
		this.five = ' ';
		this.six = ' ';
		this.seven = ' ';
		this.eight = ' ';
		this.nine = ' ';
		this.reset(xpos, ypos, direction);
	}

	reset(xpos, ypos, direction) {
		this.xpos = xpos;
		this.ypos = ypos;
		this.direction = direction;
		this.symbol = 'g';
		this.command = Lad.NONE;
		this.futureCommand = Lad.NONE;
		this.futureJump = false;
		this.jumpCommand = false;
		this.futureDirection = Creature.STATIONARY;
		this.jump = 0;
	}

	setJump() {
		this.jumpCommand = true;
	}

	setCommand(command) {
		this.command = command;
	}

	canMoveUp() {
		return this.eight !== '=' && this.eight !== '|' && this.eight !== '-';
	}

	canClimbUp() {
		return (this.eight === 'H' || this.eight === '$') && this.canMoveUp();
	}

	canMoveDown() {
		return this.two !== '=' && this.two !== '|' && this.two !== '-';
	}

	canMoveUpLeft() {
		return this.seven !== '=' && this.seven !== '|' && this.seven !== '-';
	}

	canMoveDownLeft() {
		return this.one !== '=' && this.one !== '|' && this.one !== '-';
	}

	canMoveUpRight() {
		return this.nine !== '=' && this.nine !== '|' && this.nine !== '-';
	}

	canMoveDownRight() {
		return this.three !== '=' && this.three !== '|' && this.three !== '-';
	}

	canMoveRight() {
		return this.six !== '=' && this.six !== '|' && this.six !== '-';
	}

	canMoveLeft() {
		return this.four !== '=' && this.four !== '|' && this.four !== '-';
	}

	canStayPut() {
		return this.two === '=' || this.two === '|' || this.two === '-' || this.five === 'H';
	}

	inAJump() {
		return this.jump > 0 && this.jump < 6;
	}

	jumpJustOver() {
		return this.jump > 5;
	}

	moveScheduled() {
		return this.command !== Lad.NONE || this.futureCommand !== Lad.NONE || this.jumpCommand || this.futureJump;
	}

	moveMomentum() {
		if (this.inAJump()) {
			return;
		}
		if (this.five === '.') {
			return;
		}
		if (this.direction === Creature.DOWN) {
			if (this.canMoveDown() && !this.jumpJustOver()) {
				this.command = Lad.DOWN;
			} else {
				this.command = Lad.STOP;
			}
			if (this.jumpCommand) {
				this.jumpCommand = false;
			}
		} else if (this.direction === Creature.LEFT) {
			if (this.jumpCommand) {
				if (this.canMoveUpLeft()) {
					this.command = Lad.LEFT;
					return;
				} else {
					this.futureJump = true;
					this.jumpCommand = false;
				}
			}
			if (this.canMoveLeft()) {
				this.command = Lad.LEFT;
			} else {
				this.command = Lad.STOP;
			}
		} else if (this.direction === Creature.RIGHT) {
			if (this.jumpCommand) {
				if (this.canMoveUpRight()) {
					this.command = Lad.RIGHT;
					return;
				} else {
					this.futureJump = true;
					this.jumpCommand = false;
				}
			}
			if (this.canMoveRight()) {
				this.command = Lad.RIGHT;
			} else {
				this.command = Lad.STOP;
			}
		} else if (this.direction === Creature.UP) {
			if (this.canClimbUp()) {
				if (this.jumpCommand) {
					this.futureJump = true;
					this.jumpCommand = false;
				}
				this.command = Lad.UP;
			} else if (this.canMoveUp() && this.jumpCommand) {
				this.command = Lad.UP;
			} else {
				this.command = Lad.STOP;
				this.jumpCommand = false;
			}
		} else if (this.jumpCommand) {
			if (this.canMoveUp()) {
				this.command = Lad.UP;
			} else {
				this.futureJump = true;
				this.jumpCommand = false;
				this.command = Lad.STOP;
			}
		} else {
			this.command = Lad.STOP;
		}
	}

	moveJump() {
		if (this.command === Lad.NONE) {
			this.command = this.futureCommand;
			this.futureCommand = Lad.NONE;
		}
		if (!this.jumpCommand) {
			this.jumpCommand = this.futureJump;
			this.futureJump = false;
		}
		if (this.five === 'H') {
			this.jump = 0;
			if (this.jumpCommand && this.canMoveUp()) {
				this.command = Lad.STOP;
				this.futureCommand = Lad.NONE;
				this.jumpCommand = true;
				this.futureJump = false;
				this.direction = Creature.STATIONARY;
				this.futureDirection = Creature.STATIONARY;
			} else if (this.moveScheduled()) {
				if (this.command !== Lad.UP && this.command !== Lad.DOWN) {
					this.command = Lad.STOP;
				}
				this.futureCommand = Lad.NONE;
				this.jumpCommand = false;
				this.futureJump = false;
				this.direction = Creature.STATIONARY;
				this.futureDirection = Creature.STATIONARY;
			} else {
				this.command = Lad.STOP;
				this.futureCommand = Lad.NONE;
				this.jumpCommand = false;
				this.futureJump = false;
				this.direction = Creature.STATIONARY;
				this.futureDirection = Creature.STATIONARY;
			}
			return this.moveNoJump();
		} else if (this.canStayPut() && this.moveScheduled() && this.moveNoJump()) {
			this.jump = 0;
			return true;
		} else if (this.command === Lad.LEFT) {
			if (this.direction === Creature.LEFT) {
				this.futureCommand = Lad.LEFT;
			} else {
				this.direction = Creature.LEFT;
			}
		} else if (this.command === Lad.RIGHT) {
			if (this.direction === Creature.RIGHT) {
				this.futureCommand = Lad.RIGHT;
			} else {
				this.direction = Creature.RIGHT;
			}
		} else if (this.command === Lad.UP) {
			this.futureCommand = Lad.UP;
		} else if (this.command === Lad.DOWN) {
			this.futureCommand = Lad.DOWN;
		} else if (this.command === Lad.STOP) {
			this.direction = Creature.STATIONARY;
		}
		if (this.jumpCommand) {
			this.jumpCommand = false;
			this.futureJump = true;
		}
		if (this.jump === 1) {
			if (this.direction === Creature.LEFT) {
				if (this.canMoveUpLeft()) {
					this.command = Lad.UPLEFT;
				} else if (this.canStayPut()) {
					if (this.canMoveLeft()) {
						this.command = Lad.LEFT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.jump = 5;
				}
			} else if (this.direction === Creature.RIGHT) {
				if (this.canMoveUpRight()) {
					this.command = Lad.UPRIGHT;
				} else if (this.canStayPut()) {
					if (this.canMoveRight()) {
						this.command = Lad.RIGHT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.jump = 5;
				}
			} else {
				if (this.canMoveUp()) {
					this.command = Lad.UP;
				} else if (this.canStayPut()) {
					this.command = Lad.STOP;
				} else {
					this.command = Lad.FALL;
				}
			}
		}

		if (this.jump === 2 || this.jump === 3) {
			if (this.direction === Creature.LEFT) {
				if (this.canMoveLeft()) {
					this.command = Lad.LEFT;
				} else if (this.canStayPut()) {
					if (this.canMoveLeft()) {
						this.command = Lad.LEFT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.command = Lad.FALL;
					if (this.futureCommand !== Lad.DOWN) {
						this.futureCommand = Lad.LEFT;
					}
				}
			} else if (this.direction === Creature.RIGHT) {
				if (this.canMoveRight()) {
					this.command = Lad.RIGHT;
				} else if (this.canStayPut()) {
					if (this.canMoveRight()) {
						this.command = Lad.RIGHT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.command = Lad.FALL;
					if (this.futureCommand !== Lad.DOWN) {
						this.futureCommand = Lad.RIGHT;
					}
				}
			} else {
				this.command = Lad.STOP;
				this.jump = 3;
			}
		}
		if (this.jump === 4 || this.jump === 5) {
			if (this.direction === Creature.LEFT) {
				if (this.canMoveDownLeft()) {
					this.command = Lad.DOWNLEFT;
				} else if (this.canStayPut()) {
					if (this.canMoveLeft()) {
						this.command = Lad.LEFT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.command = Lad.FALL;
					if (this.futureCommand !== Lad.DOWN) {
						this.futureCommand = Lad.LEFT;
					}
				}
			} else if (this.direction === Creature.RIGHT) {
				if (this.canMoveDownRight()) {
					this.command = Lad.DOWNRIGHT;
				} else if (this.canStayPut()) {
					if (this.canMoveRight()) {
						this.command = Lad.RIGHT;
					} else {
						this.command = Lad.STOP;
					}
				} else {
					this.command = Lad.FALL;
					if (this.futureCommand !== Lad.DOWN) {
						this.futureCommand = Lad.RIGHT;
					}
				}
			} else {
				if (this.canMoveDown()) {
					this.command = Lad.DOWN;
				} else if (this.canStayPut()) {
					this.command = Lad.STOP;
				} else {
					this.command = Lad.FALL;
				}
			}
		}
		this.jump++;
		return true;
	}

	moveNoJump() {
		if (this.command !== Lad.NONE) {
			this.futureJump = false;
			this.futureCommand = Lad.NONE;
		}
		if (!this.canStayPut() && this.five !== '.') {
			if (this.direction === Creature.LEFT && this.futureCommand !== Lad.DOWN) {
				this.futureCommand = Lad.LEFT;
			} else if (this.direction === Creature.RIGHT && this.futureCommand !== Lad.DOWN) {
				this.futureCommand = Lad.RIGHT;
			}
			if (this.command !== Lad.NONE) {
				this.futureCommand = this.command;
			}
			if (this.jumpCommand) {
				this.futureJump = true;
				this.jumpCommand = false;
			}
			this.command = Lad.FALL;
			return false;
		}

		if (this.command === Lad.NONE) {
			this.command = this.futureCommand;
			this.futureCommand = Lad.NONE;
		}
		if (!this.jumpCommand) {
			this.jumpCommand = this.futureJump;
			this.futureJump = false;
		}

		if (this.command === Lad.STOP) {
			if (this.jumpCommand && !this.canMoveUp()) {
				this.futureJump = true;
				this.jumpCommand = false;
			}
			return true;
		} else if (this.command === Lad.DOWN) {
			if (this.canMoveDown()) {
				if (this.jumpCommand) {
					this.jumpCommand = false;
				}
				return true;
			} else {
				this.futureCommand = Lad.DOWN;
				this.moveMomentum();
				return false;
			}
		} else if (this.command === Lad.UP) {
			if (this.canClimbUp()) {
				if (this.jumpCommand) {
					this.futureJump = true;
					this.jumpCommand = false;
				}
				this.command = Lad.UP;
				return true;
			} else if (this.canMoveUp() && this.jumpCommand) {
				this.command = Lad.UP;
				return true;
			} else {
				this.futureCommand = Lad.UP;
				this.moveMomentum();
				return false;
			}
		} else if (this.command === Lad.RIGHT) {
			if (this.jumpCommand) {
				if (this.canMoveUpRight()) {
					this.command = Lad.RIGHT;
					return true;
				} else if (this.canMoveUp()) {
					this.command = Lad.UP;
					this.futureCommand = Lad.RIGHT;
					this.direction = Lad.NONE;
					return true;
				} else {
					this.futureJump = true;
					this.jumpCommand = false;
				}
			}
			if (this.canMoveRight()) {
				this.command = Lad.RIGHT;
				return true;
			} else {
				this.futureCommand = Lad.RIGHT;
				this.moveMomentum();
				return false;
			}
		} else if (this.command === Lad.LEFT) {
			if (this.jumpCommand) {
				if (this.canMoveUpLeft()) {
					this.command = Lad.LEFT;
					return true;
				} else if (this.canMoveUp()) {
					this.command = Lad.UP;
					this.futureCommand = Lad.LEFT;
					this.direction = Lad.NONE;
					return true;
				} else {
					this.futureJump = true;
					this.jumpCommand = false;
				}
			}
			if (this.canMoveLeft()) {
				this.command = Lad.LEFT;
				return true;
			} else {
				this.futureCommand = Lad.LEFT;
				this.moveMomentum();
				return false;
			}
		}
		this.moveMomentum();
		return false;
	}

	moveOnTrampoline() {
		let count, choice;
		if (this.inAJump()) {
			choice = randNextInt(4);
			if (choice == 0) {
				this.moveJump();
				return true;
			} else if (choice == 1) {
				if (this.direction == Creature.LEFT) {
					this.direction = Creature.RIGHT;
				} else if (this.direction == Creature.RIGHT) {
					this.direction = Creature.LEFT;
				}
				this.moveJump();
				return true;
			} else {
				this.jump = 0;
				this.moveOnTrampoline();
				return true;
			}
		} else {
			if (this.moveScheduled() && this.moveNoJump()) {
				return true;
			} else if (this.direction == Creature.STATIONARY || this.direction == Creature.DOWN) {
				if (this.canMoveUp()) {
					this.jumpCommand = true;
					this.direction = Creature.STATIONARY;
					this.command = Lad.NONE;
					return true;
				} else {
					this.command = Lad.STOP;
					return false;
				}
			} else {
				count = 0;
				if (this.canMoveLeft()) {
					count++;
				}
				if (this.canMoveUpLeft()) {
					count++;
				}
				if (this.canMoveUp()) {
					count++;
				}
				if (this.canMoveUpRight()) {
					count++;
				}
				if (this.canMoveRight()) {
					count++;
				}
				if (count == 0) {
					this.command = Lad.STOP;
					return false;
				} else {
					choice = randNextInt(count);
					count = 0;
					if (this.canMoveLeft()) {
						if (count == choice) {
							this.command = Lad.LEFT;
							return true;
						}
						count++;
					}
					if (this.canMoveUpLeft()) {
						if (count == choice) {
							this.jumpCommand = true;
							this.command = Lad.LEFT;
							return true;
						}
						count++;
					}
					if (this.canMoveUp()) {
						if (count == choice) {
							this.jumpCommand = true;
							this.direction = Creature.STATIONARY;
							return true;
						}
						count++;
					}
					if (this.canMoveUpRight()) {
						if (count == choice) {
							this.command = Lad.RIGHT;
							this.jumpCommand = true;
							return true;
						}
						count++;
					}
					if (this.canMoveRight()) {
						if (count == choice) {
							this.command = Lad.RIGHT;
							return true;
						}
					}
				}
			}
		}
		this.command = Lad.STOP;
		return false;
	}

	update(one, two, three, four, five, six, seven, eight, nine) {
		this.one = one;
		this.two = two;
		this.three = three;
		this.four = four;
		this.five = five;
		this.six = six;
		this.seven = seven;
		this.eight = eight;
		this.nine = nine;

		if (five === '.') {
			this.moveOnTrampoline();
		} else if (this.inAJump()) {
			this.moveJump();
		} else {
			this.moveNoJump();
		}

		if (this.jumpCommand) {
			this.jump = 1;
			this.jumpCommand = false;
			if (this.command === Lad.LEFT) {
				this.command = Lad.UPLEFT;
			} else if (this.command === Lad.RIGHT) {
				this.command = Lad.UPRIGHT;
			} else if (this.direction === Creature.LEFT) {
				this.futureCommand = this.command;
				this.command = Lad.UPLEFT;
			} else if (this.direction === Creature.RIGHT) {
				this.futureCommand = this.command;
				this.command = Lad.UPRIGHT;
			} else {
				this.futureCommand = this.command;
				this.command = Lad.UP;
			}
		}

		if (this.jump === 6) {
			this.jump = 7;
		} else if (this.jump === 7) {
			this.jump = 0;
		}

		if (this.command === Lad.STOP) {
			this.symbol = 'g';
			this.direction = Creature.STATIONARY;
		} else if (this.command === Lad.UP) {
			if (this.symbol === 'g' && this.jump === 0) {
				this.symbol = 'p';
			}
			this.direction = Creature.UP;
			this.ypos--;
		} else if (this.command === Lad.DOWN) {
			if (this.symbol === 'g' && this.jump === 0) {
				this.symbol = 'p';
			}
			this.direction = Creature.DOWN;
			this.ypos++;
		} else if (this.command === Lad.RIGHT) {
			this.xpos++;
			this.direction = Creature.RIGHT;
			this.symbol = 'p';
		} else if (this.command === Lad.LEFT) {
			this.xpos--;
			this.direction = Creature.LEFT;
			this.symbol = 'q';
		} else if (this.command === Lad.UPRIGHT) {
			this.direction = Creature.RIGHT;
			this.xpos++;
			this.ypos--;
			this.symbol = 'p';
		} else if (this.command === Lad.UPLEFT) {
			this.direction = Creature.LEFT;
			this.xpos--;
			this.ypos--;
			this.symbol = 'q';
		} else if (this.command === Lad.DOWNRIGHT) {
			this.direction = Creature.RIGHT;
			this.xpos++;
			this.ypos++;
			this.symbol = 'p';
		} else if (this.command === Lad.DOWNLEFT) {
			this.direction = Creature.LEFT;
			this.xpos--;
			this.ypos++;
			this.symbol = 'q';
		} else if (this.command === Lad.FALL) {
			this.direction = Creature.DOWN;
			this.ypos++;
			this.symbol = 'b';
		}
	}
}

export default Lad;
