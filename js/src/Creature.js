/*
 * LADDER GAME - Creature
 * Base class for creatures in the game
 */

"use strict";

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

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Creature;
}
