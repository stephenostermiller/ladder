/*
 * LADDER GAME - JavaScript Port
 * A classic arcade game originally written for CPM operating system
 * Converted from Java to JavaScript for HTML5 Canvas
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
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1335 USA
 */

"use strict";

function randNextInt(max) {
	return Math.floor(Math.random() * (Math.floor(max) + 1));
}

// Game Level class - stores and manages the game map
class Level {
	constructor(levelString) {
		this.level = [];
		if (levelString) {
			this.setLevel(levelString);
		} else {
			this.level = [[' ']];
		}
	}

	setLevel(levelString) {
		const lines = levelString.split('\n');
		this.level = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (this.level.length <= i) {
				this.level[i] = [];
			}
			for (let j = 0; j < line.length; j++) {
				this.level[i][j] = line[j] || ' ';
			}
		}

		// Ensure all rows have same length (pad with spaces if needed)
		let maxLen = 0;
		for (let row of this.level) {
			maxLen = Math.max(maxLen, row.length);
		}

		for (let i = 0; i < this.level.length; i++) {
			while (this.level[i].length < maxLen) {
				this.level[i].push(' ');
			}
		}
	}

	getCharAt(row, col) {
		// 0-based coordinate system with boundary walls at negative indices
		if (row < 0 || col < 0 || row >= this.level.length || col >= this.level[0].length) {
			return '|';
		}
		return this.level[row][col];
	}

	setCharAt(row, col, char) {
		// 0-based coordinate system
		if (row >= 0 && col >= 0 && row < this.level.length && col < this.level[0].length) {
			this.level[row][col] = char;
		}
	}

	getHeight() {
		return this.level.length;
	}

	getWidth() {
		return this.level.length > 0 ? this.level[0].length : 0;
	}

	clone() {
		const newLevel = new Level();
		newLevel.level = this.level.map(row => [...row]);
		return newLevel;
	}

	positionOf(char) {
		for (let i = 0; i < this.level.length; i++) {
			for (let j = 0; j < this.level[i].length; j++) {
				if (this.level[i][j] === char) {
					// Return 0-based array indices
					return { x: j, y: i };
				}
			}
		}
		return null;
	}
}

// Base Creature class
class Creature {
	static UP = 8;
	static DOWN = 2;
	static RIGHT = 6;
	static LEFT = 4;
	static UPLEFT = 7;
	static UPRIGHT = 9;
	static DOWNLEFT = 1;
	static DOWNRIGHT = 3;
	static STATIONARY = 5;

	constructor(xpos = 0, ypos = 0, direction = Creature.STATIONARY) {
		this.xpos = xpos;
		this.ypos = ypos;
		this.direction = direction;
		this.symbol = ' ';
	}

	getSymbol() {
		return this.symbol;
	}

	getXPos() {
		return this.xpos;
	}

	getYPos() {
		return this.ypos;
	}

	setXPos(xpos) {
		this.xpos = xpos;
	}

	setYPos(ypos) {
		this.ypos = ypos;
	}

	getDirection() {
		return this.direction;
	}

	setDirection(direction) {
		this.direction = direction;
	}
}

// Lad (Player Character) class
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
		// Store the 3x3 context grid (like Java version)
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
			return; // we can't handle this.
		}
		if (this.five === '.') {
			return; // we can't handle this.
		}
		// we are going one of the four directions
		if (this.direction === Creature.DOWN) {
			// we can go down but not jump down
			if (this.canMoveDown() && !this.jumpJustOver()) {
				this.command = Lad.DOWN;
			} else {
				this.command = Lad.STOP;
			}
			// cancel any jump commands
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
		// Move future commands and future jumps into position if there are none in position
		if (this.command === Lad.NONE) {
			this.command = this.futureCommand;
			this.futureCommand = Lad.NONE;
		}
		if (!this.jumpCommand) {
			this.jumpCommand = this.futureJump;
			this.futureJump = false;
		}
		// Special logic if we are on a ladder
		if (this.five === 'H') {
			this.jump = 0;  // the jump is over, set it for new jump
			if (this.jumpCommand && this.canMoveUp()) {
				// set it to jump up the ladder
				this.command = Lad.STOP;
				this.futureCommand = Lad.NONE;
				this.jumpCommand = true;
				this.futureJump = false;
				this.direction = Creature.STATIONARY;
				this.futureDirection = Creature.STATIONARY;
			} else if (this.moveScheduled()) {
				// Cancel all moves except up and down the ladder moves
				if (this.command !== Lad.UP && this.command !== Lad.DOWN) {
					this.command = Lad.STOP;
				}
				this.futureCommand = Lad.NONE;
				this.jumpCommand = false;
				this.futureJump = false;
				this.direction = Creature.STATIONARY;
				this.futureDirection = Creature.STATIONARY;
			} else {
				// just stop the lad on the ladder
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
				this.command = Lad.STOP; // we can stop here even if we can't hang on.
				this.jump = 3; // straight up and down jumps don't last as long
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
		if (this.command !== Lad.NONE) { // any directional changes cancel future jumps and commands
			this.futureJump = false;
			this.futureCommand = Lad.NONE;
		}
		if (!this.canStayPut() && this.five !== '.') {
			// move any command and jumps to the future and go down because we are falling
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

		// move future commands and future jumps into position if there are none in position
		if (this.command === Lad.NONE) {
			this.command = this.futureCommand;
			this.futureCommand = Lad.NONE;
		}
		if (!this.jumpCommand) {
			this.jumpCommand = this.futureJump;
			this.futureJump = false;
		}

		// go through commands
		if (this.command === Lad.STOP) {
			if (this.jumpCommand && !this.canMoveUp()) { // we'll have to jump later
				this.futureJump = true;
				this.jumpCommand = false;
			}
			return true;
		} else if (this.command === Lad.DOWN) {
			if (this.canMoveDown()) {
				if (this.jumpCommand) { // move down and jump????   Maybe not.
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
					this.direction = Lad.NONE; // We hit a wall, so cancel our directional moving.
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
					this.direction = Lad.NONE; // We hit a wall, so cancel our directional moving.
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


	/**
	 * Figure out where we should go if we are on a trampoline
	 *
	 * @return true if it was able to act immediately on a command or
	 *     future command
	 */
	moveOnTrampoline(){
		let count, choice;
		// allow us to stop on the trampoline and and get a command next time.
		if (this.inAJump()){
			// the choices here are:
			// continue the jump as planned
			// switch direction and continue the jump
			// cancel the jump and do something different
			choice = randNextInt(4);
			if (choice == 0){
				this.moveJump();
				return(true);
			} else if (choice == 1){
				if (this.direction == Creature.LEFT){
					this.direction = Creature.RIGHT;
				} else if (this.direction == Creature.RIGHT){
					this.direction = Creature.LEFT;
				}
				this.moveJump();
				return(true);
			} else {
				jump = 0;
				this.moveOnTrampoline();
				return(true);
			}
		} else {
			if (this.moveScheduled() && this.moveNoJump()){
				return(true); //we found somewhere to move
			} else if (this.direction == Creature.STATIONARY || this.direction == Creature.DOWN){
				// if we are right on top of the thing, jump on it, if we can
				if (this.canMoveUp()){
					this.jumpCommand = true;
					this.direction = Creature.STATIONARY;
					this.command = Lad.NONE;
					return(true); //we found somewhere to move
				} else {
					this.command = Lad.STOP;
					return(false); //we were unable to find somewhere to move
				}
			} else {
				// we moved into it some other way
				// there are five possible ways in which you might wan
				// to throw somebody off the trampoline.
				// count the number of ways possible for the lad to
				// move and throw it equally likely in all directions
				// possible
				count = 0;
				if (this.canMoveLeft()){
					count ++;
				}
				if (this.canMoveUpLeft()){
					count ++;
				}
				if (this.canMoveUp()){
					count ++;
				}
				if (this.canMoveUpRight()){
					count ++;
				}
				if (this.canMoveRight()){
					count ++;
				}
				if (count == 0){
					this.command = Lad.STOP;
					return(false); //we were unable to find somewhere to move
				} else {
					choice = randNextInt(count);
					count = 0;
					if (this.canMoveLeft()){
						if (count == choice){
							this.command = Lad.LEFT;
							return(true); //we found somewhere to move
						}
						count++;
					}
					if (this.canMoveUpLeft()){
						if (count == choice){
							this.jumpCommand = true;
							this.command = Lad.LEFT;
							return(true); //we found somewhere to move
						}
						count++;
					}
					if (this.canMoveUp()){
						if (count == choice){
							this.jumpCommand = true;
							this.direction = Creature.STATIONARY;
							return(true); //we found somewhere to move
						}
						count++;
					}
					if (this.canMoveUpRight()){
						if (count == choice){
							this.command = Lad.RIGHT;
							this.jumpCommand = true;
							return(true); //we found somewhere to move
						}
						count++;
					}
					if (this.canMoveRight()){
						if (count == choice){
							this.command = Lad.RIGHT;
							return(true); //we found somewhere to move
						}
					}
				}
			}
		}
		this.command = Lad.STOP;
		return(false); //we were unable to find somewhere to move
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

		if (five === '.'){
			this.moveOnTrampoline();
		} else if (this.inAJump()){
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

// Barrel class
class Barrel extends Creature {
	static DOWN = 2;
	static LEFT = 4;
	static RIGHT = 6;
	static STOP = 5;

	constructor(xpos = 0, ypos = 0, direction = Creature.STATIONARY) {
		super(xpos, ypos, direction);
		this.symbol = 'o';
	}

	update(one, two, three, four, five, six, seven, eight, nine) {
		let go = Barrel.STOP;
		if (two === 'H' && five === 'H' && this.direction === Creature.DOWN) {
			go = Barrel.DOWN;
		} else if (five === 'H' && two === 'H') {
			const num = Math.random();
			if (num < 0.25) {
				go = Barrel.STOP;
			} else if (num < 0.5) {
				go = Barrel.DOWN;
			} else if (num < 0.75) {
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		} else if (two !== '=' && two !== '-' && two !== '|') {
			go = Barrel.DOWN;
		} else if (five === 'H') {
			const num = Math.random();
			if (num < 1/3) {
				go = Barrel.STOP;
			} else if (num < 2/3) {
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		} else if (this.direction === Creature.LEFT) {
			go = Barrel.LEFT;
			if (four === '=' || four === '-' || four === '|') {
				go = Barrel.RIGHT;
			}
		} else if (this.direction === Creature.RIGHT) {
			go = Barrel.RIGHT;
			if (six === '=' || six === '-' || six === '|') {
				go = Barrel.LEFT;
			}
		} else {
			const num = Math.random();
			if (num < 1/3) {
				go = Barrel.STOP;
			} else if (num < 2/3) {
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		}
		if (go === Barrel.RIGHT) {
			if (six !== '=' && six !== '-' && six !== '|') {
				this.xpos++;
				this.direction = Creature.RIGHT;
			}
		} else if (go === Barrel.LEFT) {
			if (four !== '=' && four !== '-' && four !== '|') {
				this.xpos--;
				this.direction = Creature.LEFT;
			}
		} else if (go === Barrel.DOWN) {
			if (two !== '=' && two !== '-' && two !== '|') {
				this.ypos++;
				this.direction = Creature.DOWN;
			}
		}
	}
}

// BarrelProducer class
class BarrelProducer {
	static MAX_BARRELS = 30;

	constructor(xpos, ypos) {
		this.xpos = xpos;
		this.ypos = ypos;
		this.barrels = [];
	}

	getBarrelCount() {
		return this.barrels.length;
	}

	getBarrelAt(index) {
		return this.barrels[index];
	}

	recycleBarrel(barrel) {
		const idx = this.barrels.indexOf(barrel);
		if (idx > -1) {
			this.barrels.splice(idx, 1);
		}
	}

	clear() {
		this.barrels = [];
	}

	update() {
		if (this.barrels.length < BarrelProducer.MAX_BARRELS && Math.random() < 1.0 / 15.0) {
			this.spitOutBarrel();
		}
	}

	spitOutBarrel() {
		// Always create new barrels - JavaScript GC is efficient enough
		const barrel = new Barrel();
		barrel.setXPos(this.xpos);  // 1-based coordinate
		barrel.setYPos(this.ypos);  // 1-based coordinate
		this.barrels.push(barrel);
	}
}

// Game Canvas/Engine class
class GameCanvas {
	static SCORE_RESET = 0;
	static SCORE_BARREL = 1;
	static SCORE_STATUE = 2;
	static SCORE_MONEY = 3;

	static G_O_NOT_OVER = 0;
	static G_O_BARREL = 1;
	static G_O_TIME = 2;
	static G_O_MONEY = 3;
	static G_O_SPIKE = 5;

	static EASY = 3;
	static MEDIUM = 5;
	static HARD = 7;
	static VERY_HARD = 10;
	static IMPOSSIBLE = 15;

	static EASY_SPEED = 130;
	static MEDIUM_SPEED = 100;
	static HARD_SPEED = 80;
	static VERY_HARD_SPEED = 65;
	static IMPOSSIBLE_SPEED = 55;

	constructor(canvas, levelString, levelIndex = 0) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		this.currentLevelIndex = levelIndex;
		this.currentLevelData = levelString;  // Store for restarting the game
		this.titleScreen = null;  // Will hold the title level data
		this.isShowingTitle = false;  // Flag to indicate we're showing title
		this.realLevel = new Level(levelString);
		this.screenLevel = new Level(levelString);

		// Find the starting position marked by 'p' in the level (0-based from positionOf)
		const startPos = this.realLevel.positionOf('p');
		const ladX = startPos ? startPos.x + 1 : 1;  // Convert 0-based to 1-based for Lad
		const ladY = startPos ? startPos.y + 1 : 1;  // Convert 0-based to 1-based for Lad

		// Save the starting position for respawning
		this.startLadX = ladX;
		this.startLadY = ladY;

		// Replace the 'p' marker with a space (positions are 0-based)
		if (startPos) {
			this.realLevel.setCharAt(startPos.y, startPos.x, ' ');
			this.screenLevel.setCharAt(startPos.y, startPos.x, ' ');
		}

		this.lad = new Lad(ladX, ladY, Creature.STATIONARY);
		this.barrelProducers = [];

		this.nextCommand = Lad.STOP;
		this.jumpCommand = false;

		this.score = 0;
		this.ladsLeft = 3;
		this.cycles = 2000;
		this.gameOver = GameCanvas.G_O_NOT_OVER;
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
		this.paused = false;
		this.running = true;
		this.difficulty = GameCanvas.MEDIUM;
		this.gameSpeed = GameCanvas.MEDIUM_SPEED;
		this.nextNewLad = 10000;

		// Death animation state
		this.deathAnimationFrame = -1;
		this.deathAnimationX = 0;
		this.deathAnimationY = 0;
		this.deathAnimationSymbols = ['!', '@', '#', '/', '+', '%', '?', '\\', '*', 'b'];

		this.letterWidth = 8;
		this.letterHeight = 16;
		this.canvasScale = 1;

		// Callback for when game ends
		this.onGameOver = null;

		// Game loop timing
		this.lastUpdateTime = Date.now();

		this.setupLevelProducers();
		this.setupKeyboardControls();

		this.gameRunning = false;
		this.startGameLoop();
	}

	setupLevelProducers() {
		this.barrelProducers = [];
		const level = this.realLevel;

		for (let y = 0; y < level.getHeight(); y++) {
			for (let x = 0; x < level.getWidth(); x++) {
				// Use 0-based coordinates for Level methods
				if (level.getCharAt(y, x) === 'V') {
					// BarrelProducer receives 1-based coordinates
					this.barrelProducers.push(new BarrelProducer(x + 1, y + 1));
				}
			}
		}
	}

	setupKeyboardControls() {
		document.addEventListener('keydown', (e) => {
			// Prevent default for arrow keys and space to avoid page scrolling
			if (e.key === ' ' || e.key.startsWith('Arrow')) {
				e.preventDefault();
			}

			// Match Java behavior: tap a direction key and it persists until another key is pressed
			if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
				// If showing title screen or game is over, start the game with P
				if (this.isShowingTitle || this.gameOver !== GameCanvas.G_O_NOT_OVER) {
					this.isShowingTitle = false;
					this.restartGame();
				} else {
					// Otherwise toggle pause
					this.togglePause();
				}
			} else if (e.key === 'ArrowUp' || e.key === '8') {
				this.nextCommand = Lad.UP;
			} else if (e.key === 'ArrowDown' || e.key === '2') {
				this.nextCommand = Lad.DOWN;
			} else if (e.key === 'ArrowLeft' || e.key === '4') {
				this.nextCommand = Lad.LEFT;
			} else if (e.key === 'ArrowRight' || e.key === '6') {
				this.nextCommand = Lad.RIGHT;
			} else if (e.key === ' ') {
				this.jumpCommand = true;
			} else {
				// Any other key stops movement
				this.nextCommand = Lad.STOP;
			}
		});
	}

	togglePause() {
		this.paused = !this.paused;
	}

	setGameOverState(state) {
		const wasNotOver = this.gameOver === GameCanvas.G_O_NOT_OVER;
		this.gameOver = state;
		if (wasNotOver && state !== GameCanvas.G_O_NOT_OVER && this.onGameOver) {
			this.onGameOver();
		}
	}

	setDifficulty(diff) {
		this.difficulty = diff;
		switch (diff) {
			case GameCanvas.EASY:
				this.gameSpeed = GameCanvas.EASY_SPEED;
				break;
			case GameCanvas.MEDIUM:
				this.gameSpeed = GameCanvas.MEDIUM_SPEED;
				break;
			case GameCanvas.HARD:
				this.gameSpeed = GameCanvas.HARD_SPEED;
				break;
			case GameCanvas.VERY_HARD:
				this.gameSpeed = GameCanvas.VERY_HARD_SPEED;
				break;
			case GameCanvas.IMPOSSIBLE:
				this.gameSpeed = GameCanvas.IMPOSSIBLE_SPEED;
				break;
		}
	}

	getContext(x, y) {
		// Get 3x3 grid around position for collision detection from screenLevel
		// x,y are 1-based (from Lad position), convert to 0-based for Level
		// Positions numbered like a keypad: 7 8 9, 4 5 6, 1 2 3
		// Parameters are: one(1), two(2), three(3), four(4), five(5), six(6), seven(7), eight(8), nine(9)
		const context = [];
		const offsets = [
			[-1, 1],   // one: down-left
			[0, 1],    // two: down
			[1, 1],    // three: down-right
			[-1, 0],   // four: left
			[0, 0],    // five: center
			[1, 0],    // six: right
			[-1, -1],  // seven: up-left
			[0, -1],   // eight: up
			[1, -1]    // nine: up-right
		];

		// Convert from 1-based Lad coordinates to 0-based Level coordinates
		const ladRow = y - 1;
		const ladCol = x - 1;

		for (let offset of offsets) {
			const cx = ladCol + offset[0];
			const cy = ladRow + offset[1];
			context.push(this.screenLevel.getCharAt(cy, cx));
		}
		return context;
	}

	getContextFromRealLevel(x, y) {
		// Get 3x3 grid around position from realLevel for barrel collision detection
		// This prevents barrels from seeing each other and making incorrect decisions
		// x,y are 1-based (from Barrel position), convert to 0-based for Level
		// Positions numbered like a keypad: 7 8 9, 4 5 6, 1 2 3
		const context = [];
		const offsets = [
			[-1, 1],   // one: down-left
			[0, 1],    // two: down
			[1, 1],    // three: down-right
			[-1, 0],   // four: left
			[0, 0],    // five: center
			[1, 0],    // six: right
			[-1, -1],  // seven: up-left
			[0, -1],   // eight: up
			[1, -1]    // nine: up-right
		];

		// Convert from 1-based creature coordinates to 0-based Level coordinates
		const barrelRow = y - 1;
		const barrelCol = x - 1;

		for (let offset of offsets) {
			const cx = barrelCol + offset[0];
			const cy = barrelRow + offset[1];
			context.push(this.realLevel.getCharAt(cy, cx));
		}
		return context;
	}

	updateGame() {
		// Handle bonus countdown (like Java's dollarCountdown)
		if (this.inBonusCountdown) {
			if (this.cycles > 0) {
				this.addScore(GameCanvas.SCORE_MONEY*100);
				this.cycles-=100;
				this.updateStats();
			} else {
				// Countdown complete, move to next level
				this.inBonusCountdown = false;
				this.loadingNextLevel = true;
				this.nextLevel();
			}
			this.render();
			return;
		}

		// Wait for next level to load
		if (this.loadingNextLevel) {
			this.render();
			return;
		}

		// Handle death animation frames
		if (this.deathAnimationFrame >= 0) {
			this.deathAnimationFrame++;
			if (this.deathAnimationFrame < this.deathAnimationSymbols.length) {
				this.screenLevel.setCharAt(this.deathAnimationY - 1, this.deathAnimationX - 1, this.deathAnimationSymbols[this.deathAnimationFrame]);
				this.render();
				return;
			} else {
				// Death animation complete
				this.deathAnimationFrame = -1;
				this.screenLevel.setCharAt(this.deathAnimationY - 1, this.deathAnimationX - 1, ' ');

				if (this.ladsLeft <= 0) {
					this.setGameOverState(GameCanvas.G_O_BARREL);
				} else {
					this.resetLad();
				}
				this.render();
				return;
			}
		}

		// Render pause/game over message and return early if needed
		if (this.paused || this.gameOver !== GameCanvas.G_O_NOT_OVER || this.isShowingTitle) {
			this.render();
			return;
		}


		this.cycles--;
		if (this.cycles <= 0) {
			this.ladsLeft--;
			this.updateStats();
			if (this.ladsLeft <= 0) {
				this.setGameOverState(GameCanvas.G_O_TIME);
			} else {
				this.cycles = 2000;
				this.resetLad();
			}
			this.render();
			return
		}

		// Update lad (Lad positions are 1-based, Level methods use 0-based)
		// Clear lad's old position before updating
		const oldLadX = this.lad.getXPos();
		const oldLadY = this.lad.getYPos();
		this.screenLevel.setCharAt(oldLadY - 1, oldLadX - 1, this.realLevel.getCharAt(oldLadY - 1, oldLadX - 1));
		this.lad.setCommand(this.nextCommand);
		this.nextCommand = Lad.NONE;

		if (this.jumpCommand) {
			this.lad.setJump();
		}
		this.jumpCommand = false;

		this.lad.update(...this.getContext(this.lad.getXPos(), this.lad.getYPos()));

		// Draw lad at new position (convert 1-based to 0-based for Level)
		this.screenLevel.setCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1, this.lad.getSymbol());

		// Check if lad touched goal (check realLevel like Java does, convert 1-based to 0-based)
		const realLadChar = this.realLevel.getCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1);
		if (realLadChar === '$') {
			// Start bonus countdown mode (like Java's dollarCountdown)
			this.inBonusCountdown = true;
			return;
		}

		if(realLadChar == '^'){
			this.gameOver = G_O_SPIKE; // Impaled, game over
			return;
		}

		// Check for statue (gives bonus score but doesn't end level)
		if (realLadChar === '&') {
			this.addScore(GameCanvas.SCORE_STATUE);
			this.realLevel.setCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1, ' ');
		}

		// Check for disappearing platforms (walk on '-' causes it to disappear)
		if (oldLadX !== this.lad.getXPos() && this.lad.getYPos() >= oldLadY) {
			// Lad moved horizontally without jumping, convert 1-based to 0-based
			const platformBelow = this.realLevel.getCharAt(oldLadY, oldLadX - 1);
			if (platformBelow === '-') {
				// Platform disappears
				this.realLevel.setCharAt(oldLadY, oldLadX - 1, ' ');
				this.screenLevel.setCharAt(oldLadY, oldLadX - 1, ' ');
			}
		}

		// Update and repaint all the barrels
		for (let k = 0; k < this.barrelProducers.length; k++) {
			const BP = this.barrelProducers[k];
			BP.update();

			for (let j = 0; j < BP.getBarrelCount(); j++) {
				const barrel = BP.getBarrelAt(j);
				if (barrel !== null) {
					// Check collision with lad before update
					if (barrel.getYPos() === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos()) {
						this.ladsLeft--;
						this.updateStats();
						this.startDeathAnimation(this.lad.getXPos(), this.lad.getYPos());
					}

					// First barrel jump score check (before barrel update)
					// No score if on a ladder
					const realLadPos = this.realLevel.getCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1);
					if (realLadPos !== 'H') {
						// Check if barrel is directly above lad
						if (barrel.getYPos() - 1 === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos()) {
							this.addScore(GameCanvas.SCORE_BARREL);
						}
						// Check if barrel is 2 above lad and lad isn't on solid ground
						else if (barrel.getYPos() - 2 === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos() &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '=' &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '|' &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '-') {
							this.addScore(GameCanvas.SCORE_BARREL);
						}
					}

					// Clear barrel from its previous position (convert 1-based to 0-based for Level)
					this.screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1,
						this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1));

					// Get context for barrel from realLevel
					const bctx = this.getContextFromRealLevel(barrel.getXPos(), barrel.getYPos());
					barrel.update(...bctx);

					// Draw barrel at new position (convert 1-based to 0-based for Level)
					this.screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1, barrel.getSymbol());

					// Check collision with lad after update
					if (barrel.getYPos() === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos()) {
						this.ladsLeft--;
						this.updateStats();
						this.startDeathAnimation(this.lad.getXPos(), this.lad.getYPos());
					}

					// Second barrel jump score check (after barrel update)
					// No score if lad is moving up or down (to avoid double counting)
					// No score if on a ladder
					if (this.lad.getDirection() !== Creature.UP && this.lad.getDirection() !== Creature.DOWN && realLadPos !== 'H') {
						// Check if barrel is directly above lad
						if (barrel.getYPos() - 1 === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos()) {
							this.addScore(GameCanvas.SCORE_BARREL);
						}
						// Check if barrel is 2 above lad and lad isn't on solid ground
						else if (barrel.getYPos() - 2 === this.lad.getYPos() && this.lad.getXPos() === barrel.getXPos() &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '=' &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '|' &&
							this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '-') {
							this.addScore(GameCanvas.SCORE_BARREL);
						}
					}

					// Check if barrel hit an asterisk (convert 1-based to 0-based for Level)
					const realCharAtBarrel = this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1);
					if (realCharAtBarrel === '*') {
						// Keep the asterisk visible
						this.screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1,
							this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1));
						// Remove barrel from producer
						BP.recycleBarrel(barrel);
					}
				}
			}
		}

		this.cycles--;
		if (this.cycles <= 0) {
			this.ladsLeft--;
			this.updateStats();
			if (this.ladsLeft <= 0) {
				this.setGameOverState(GameCanvas.G_O_TIME);
			} else {
				this.cycles = 2000;
				this.resetLad();
			}
		}

		this.render();
		updateDebugDisplay(this);
		this.updateStats();
	}

	resetLad() {
		// Restore screenLevel from realLevel to preserve ladders and other level elements
		this.screenLevel = this.realLevel.clone();

		// Use the saved starting position (1-based for Lad)
		this.lad.reset(this.startLadX, this.startLadY, Creature.STATIONARY);

		// Place the lad at starting position (convert 1-based to 0-based for Level)
		this.screenLevel.setCharAt(this.startLadY - 1, this.startLadX - 1, 'p');

		// Reset all barrel producers (clear their barrels)
		for (let producer of this.barrelProducers) {
			producer.clear();
		}

		// Reset bonus countdown state
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
	}

	async nextLevel() {
		// Move to next level in the array
		this.currentLevelIndex = (this.currentLevelIndex + 1) % LEVEL_FILES.length;
		const nextLevelFile = LEVEL_FILES[this.currentLevelIndex];
		const levelData = await loadLevelFile(nextLevelFile);
		if (levelData) {
			this.changeLevel(levelData);
		}
	}

	addScore(scoreType) {
		switch (scoreType) {
			case GameCanvas.SCORE_STATUE:
				// Statue gives bonus based on remaining time
				this.score += this.cycles;
				break;
			case GameCanvas.SCORE_BARREL:
				// Jumping over barrel
				this.score += 200;
				break;
			case GameCanvas.SCORE_MONEY:
				// Collecting money
				this.score += 10;
				break;
		}

		// Check if score threshold for extra life
		if (this.score >= this.nextNewLad) {
			this.ladsLeft++;
			this.nextNewLad += 10000;
		}
	}

	startDeathAnimation(x, y) {
		this.deathAnimationFrame = 0;
		this.deathAnimationX = x;
		this.deathAnimationY = y;
	}

	updateStats() {
		document.getElementById('score').textContent = this.score;
		document.getElementById('lives').textContent = this.ladsLeft;
		document.getElementById('bonusTime').textContent = Math.max(0, this.cycles);
	}

	resizeCanvas() {
		const container = this.canvas.parentElement;
		const maxWidth = container.clientWidth;
		const maxHeight = container.clientHeight;

		// Calculate aspect ratio to maintain square pixels
		const levelWidth = this.screenLevel.getWidth();
		const levelHeight = this.screenLevel.getHeight();

		// Calculate scale to fit in container
		const scaleX = Math.floor(maxWidth / (levelWidth * this.letterWidth));
		const scaleY = Math.floor(maxHeight / ((levelHeight + 1) * this.letterHeight));
		const scale = Math.max(1, Math.min(scaleX, scaleY));

		// Set canvas display size and internal resolution
		const newWidth = levelWidth * this.letterWidth * scale;
		const newHeight = (levelHeight + 1) * this.letterHeight * scale;

		this.canvas.width = newWidth;
		this.canvas.height = newHeight;

		// Store scale for use in rendering
		this.canvasScale = scale;
	}

	render() {
		// Update canvas size to fill container
		this.resizeCanvas();

		// Clear canvas
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Set text properties with scaled font
		const fontSize = Math.floor(14 * this.canvasScale);
		this.ctx.font = fontSize + 'px monospace';
		this.ctx.fillStyle = '#0f0';

		// Draw level (iterate 0-based array, use 0-based for getCharAt)
		for (let y = 0; y < this.screenLevel.getHeight(); y++) {
			for (let x = 0; x < this.screenLevel.getWidth(); x++) {
				const char = this.screenLevel.getCharAt(y, x);
				if (char !== ' ') {
					this.ctx.fillText(char, x * this.letterWidth * this.canvasScale, (y + 1) * this.letterHeight * this.canvasScale);
				}
			}
		}

		// Draw pause message
		if (this.paused) {
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = '#0f0';
			this.ctx.font = 'bold ' + Math.floor(24 * this.canvasScale) + 'px Arial';
			this.ctx.textAlign = 'center';
			this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.textAlign = 'left';
		}

		// Draw game over message
		if (this.gameOver !== GameCanvas.G_O_NOT_OVER) {
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = '#f00';
			this.ctx.font = 'bold ' + Math.floor(24 * this.canvasScale) + 'px Arial';
			this.ctx.textAlign = 'center';

			let message = 'GAME OVER';

			this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
			this.ctx.textAlign = 'left';
		}
	}

	startGameLoop() {
		this.gameRunning = true;
		this.lastUpdateTime = Date.now();

		const gameLoop = () => {
			const currentTime = Date.now();
			const elapsed = currentTime - this.lastUpdateTime;

			if (this.isShowingTitle) {
				// Show title screen and wait for start
				this.render();
			} else if (this.gameRunning) {
				if (elapsed >= this.gameSpeed) {
					this.lastUpdateTime = currentTime;
					this.updateGame();
				}
			}

			requestAnimationFrame(gameLoop);
		};
		requestAnimationFrame(gameLoop);
	}

	stopGameLoop() {
		this.gameRunning = false;
	}

	restartGame() {
		// Restart the current level from the beginning
		if (this.currentLevelData) {
			this.changeLevel(this.currentLevelData);
		}
	}

	loadTitle(titleData) {
		// Load the title screen for display before game starts
		this.titleScreen = new Level(titleData);
		this.isShowingTitle = true;
	}

	showTitle() {
		// Display the title screen and render it
		if (this.titleScreen) {
			this.screenLevel = this.titleScreen.clone();
		}
	}

	changeLevel(levelData) {
		this.stopGameLoop();
		this.currentLevelData = levelData;  // Store for restarting
		this.realLevel = new Level(levelData);
		this.screenLevel = new Level(levelData);

		// Find the starting position marked by 'p' in the level (0-based from positionOf)
		const startPos = this.realLevel.positionOf('p');
		const ladX = startPos ? startPos.x + 1 : 1;  // Convert 0-based to 1-based for Lad
		const ladY = startPos ? startPos.y + 1 : 1;  // Convert 0-based to 1-based for Lad

		// Save the starting position for respawning
		this.startLadX = ladX;
		this.startLadY = ladY;

		// Replace the 'p' marker with a space (positions are 0-based)
		if (startPos) {
			this.realLevel.setCharAt(startPos.y, startPos.x, ' ');
			this.screenLevel.setCharAt(startPos.y, startPos.x, ' ');
		}

		this.lad.reset(ladX, ladY, Creature.STATIONARY);
		this.ladsLeft = 3;
		this.cycles = 2000;
		this.gameOver = GameCanvas.G_O_NOT_OVER;
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
		this.barrelProducers = [];
		this.setupLevelProducers();
		this.updateStats();
		this.startGameLoop();
	}
}

// Available level files
const LEVEL_FILES = [
	'EasyStreet.lvl',
	'LongIsland.lvl',
	'GhostTown.lvl',
	'TunnelVision.lvl',
	'GangLand.lvl',
	'BugCity.lvl',
	'AroundTheWorld.lvl',
	'AWalkInThePark.lvl',
	'DerRockFalls.lvl',
	'FireDownBelow.lvl',
	'IdlePlace.lvl',
	'LongWalk.lvl',
	'MysticIslands.lvl',
	'OneChance.lvl',
	'Plinko.lvl',
	'PointOfNoReturn.lvl',
	'SNP.lvl',
	'SNPNotForBeginners.lvl',
	'SecretRoad.lvl',
	'StairwayToTreasure.lvl',
	'WallsOfDoom.lvl'
];

// Load a level from a file
async function loadLevelFile(filename) {
	try {
		const response = await fetch(filename);
		if (!response.ok) {
			throw new Error(`Failed to load level: ${response.statusText}`);
		}
		return await response.text();
	} catch (error) {
		console.error('Error loading level file:', error);
		return null;
	}
}

// Initialize the game
let game = null;

function disableGameControls() {
	document.getElementById('difficultySelect').disabled = true;
	document.getElementById('levelSelect').disabled = true;
	document.getElementById('startButton').disabled = true;
}

function enableGameControls() {
	document.getElementById('difficultySelect').disabled = false;
	document.getElementById('levelSelect').disabled = false;
	document.getElementById('startButton').disabled = false;
}

window.addEventListener('DOMContentLoaded', async () => {
	const canvas = document.getElementById('gameCanvas');
	const difficultySelect = document.getElementById('difficultySelect');
	const levelSelect = document.getElementById('levelSelect');
	const startButton = document.getElementById('startButton');

	// Populate level select dropdown
	levelSelect.innerHTML = '';
	LEVEL_FILES.forEach((filename, index) => {
		const option = document.createElement('option');
		option.value = index;
		option.textContent = filename.replace('.lvl', '')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1 $2');
		levelSelect.appendChild(option);
	});

	// Load first level but don't start it yet
	const firstLevelData = await loadLevelFile(LEVEL_FILES[0]);
	if (firstLevelData) {
		game = new GameCanvas(canvas, firstLevelData, 0);
		game.setDifficulty(GameCanvas.MEDIUM);
		game.updateStats();
		game.stopGameLoop();
	} else {
		console.error('Failed to load initial level');
	}

	// Load and display title screen
	const titleData = await loadLevelFile('ladder.title');
	if (titleData && game) {
		game.loadTitle(titleData);
		game.showTitle();
		game.startGameLoop();  // Start rendering the title screen
	}

	// Disable controls initially (except start button)
	startButton.disabled = false;
	difficultySelect.disabled = false;
	levelSelect.disabled = false;

	// Set game over callback
	game.onGameOver = () => {
		enableGameControls();
	};

	// Handle start button click
	startButton.addEventListener('click', () => {
		if (game) {
			// Read the selected difficulty and apply it
			const selectedDifficulty = difficultySelect.value;
			const diffMap = {
				'EASY': GameCanvas.EASY,
				'MEDIUM': GameCanvas.MEDIUM,
				'HARD': GameCanvas.HARD,
				'VERY_HARD': GameCanvas.VERY_HARD,
				'IMPOSSIBLE': GameCanvas.IMPOSSIBLE
			};
			game.setDifficulty(diffMap[selectedDifficulty]);

			// Hide title and start the actual game
			game.isShowingTitle = false;
			disableGameControls();
			game.restartGame();  // Properly restart from the beginning
		}
	});

	// Handle difficulty changes
	difficultySelect.addEventListener('change', (e) => {
		const diff = e.target.value;
		const diffMap = {
			'EASY': GameCanvas.EASY,
			'MEDIUM': GameCanvas.MEDIUM,
			'HARD': GameCanvas.HARD,
			'VERY_HARD': GameCanvas.VERY_HARD,
			'IMPOSSIBLE': GameCanvas.IMPOSSIBLE
		};
		if (game) {
			game.setDifficulty(diffMap[diff]);
		}
	});

	// Handle level changes
	levelSelect.addEventListener('change', async (e) => {
		const levelIdx = parseInt(e.target.value);
		const levelData = await loadLevelFile(LEVEL_FILES[levelIdx]);
		if (levelData && game) {
			game.currentLevelIndex = levelIdx;
			game.changeLevel(levelData);
		}
	});
});

// Debug helper functions
function toggleDebug() {
	const debugPanel = document.getElementById('debugPanel');
	debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
}

function getDirectionName(direction) {
	switch (direction) {
		case Creature.UP: return 'UP';
		case Creature.DOWN: return 'DOWN';
		case Creature.LEFT: return 'LEFT';
		case Creature.RIGHT: return 'RIGHT';
		case Creature.STATIONARY: return 'STATIONARY';
		case Creature.UPLEFT: return 'UPLEFT';
		case Creature.UPRIGHT: return 'UPRIGHT';
		case Creature.DOWNLEFT: return 'DOWNLEFT';
		case Creature.DOWNRIGHT: return 'DOWNRIGHT';
		default: return 'UNKNOWN';
	}
}

function getCommandName(command) {
	switch (command) {
		case Lad.STOP: return 'STOP';
		case Lad.LEFT: return 'LEFT';
		case Lad.RIGHT: return 'RIGHT';
		case Lad.UP: return 'UP';
		case Lad.DOWN: return 'DOWN';
		case Lad.NONE: return 'NONE';
		case Lad.JUMP: return 'JUMP';
		case Lad.FALL: return 'FALL';
		case Lad.UPLEFT: return 'UPLEFT';
		case Lad.UPRIGHT: return 'UPRIGHT';
		case Lad.DOWNLEFT: return 'DOWNLEFT';
		case Lad.DOWNRIGHT: return 'DOWNRIGHT';
		default: return 'UNKNOWN';
	}
}

function updateDebugDisplay(gameCanvas) {
	// Only update if debug panel is visible
	const debugPanel = document.getElementById('debugPanel');
	if (debugPanel.style.display === 'none') {
		return;
	}

	const lad = gameCanvas.lad;

	// Update position
	document.getElementById('debug-pos').textContent = `${lad.getXPos()}, ${lad.getYPos()}`;

	// Update direction
	document.getElementById('debug-direction').textContent = getDirectionName(lad.direction);

	// Update command
	document.getElementById('debug-command').textContent = getCommandName(lad.command);

	// Update futureDirection
	document.getElementById('debug-future-direction').textContent = getDirectionName(lad.futureDirection);

	// Update jumpCommand
	document.getElementById('debug-jump-command').textContent = lad.jumpCommand ? 'true' : 'false';

	// Update jump counter
	document.getElementById('debug-jump-counter').textContent = lad.jump;

	// Update next command
	let cmdStr = 'STOP';
	if (gameCanvas.nextCommand === Lad.UP) cmdStr = 'UP';
	else if (gameCanvas.nextCommand === Lad.DOWN) cmdStr = 'DOWN';
	else if (gameCanvas.nextCommand === Lad.LEFT) cmdStr = 'LEFT';
	else if (gameCanvas.nextCommand === Lad.RIGHT) cmdStr = 'RIGHT';
	document.getElementById('debug-keys-held').textContent = 'nextCommand: ' + cmdStr;

	// Update in jump
	document.getElementById('debug-in-jump').textContent = lad.inAJump() ? 'true' : 'false';

	// Update game speed
	document.getElementById('debug-game-speed').textContent = gameCanvas.gameSpeed + 'ms';
}
