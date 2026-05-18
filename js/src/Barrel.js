/*
 * LADDER GAME - Barrel
 * Barrel creature logic
 */

"use strict";

import Creature from './Creature.js';

class DefaultBarrelRandom {
	nextInt(bound) {
		return Math.floor(Math.random() * bound);
	}
}

class Barrel extends Creature {
	static DOWN = 2;
	static LEFT = 4;
	static RIGHT = 6;
	static STOP = 5;

	constructor(xpos = 0, ypos = 0, direction = Creature.STATIONARY, barrelRandom = null) {
		super(xpos, ypos, direction);
		this.symbol = 'o';
		this.markedForRecycling = false;
		this.justReset = true;
		this.barrelRandom = barrelRandom || new DefaultBarrelRandom();
	}

	setRandom(barrelRandom) {
		this.barrelRandom = barrelRandom || new DefaultBarrelRandom();
	}

	resetRandom(barrelRandom) {
		this.barrelRandom = barrelRandom || new DefaultBarrelRandom();
	}

	markForRecycling() {
		this.markedForRecycling = true;
	}

	isMarkedForRecycling() {
		return this.markedForRecycling;
	}

	resetRecyclingFlag() {
		this.markedForRecycling = false;
	}

	resetState() {
		this.direction = Creature.STATIONARY;
		this.justReset = true;
	}

	update(one, two, three, four, five, six, seven, eight, nine) {
		let go = Barrel.STOP;

		// If sticky direction hits a wall, cancel it so barrel queries random
		if (this.direction === Creature.LEFT && (four === '=' || four === '-' || four === '|')) {
			this.direction = Creature.STATIONARY;
		} else if (this.direction === Creature.RIGHT && (six === '=' || six === '-' || six === '|')) {
			this.direction = Creature.STATIONARY;
		} else if (this.direction === Creature.DOWN && (two === '=' || two === '-' || two === '|')) {
			this.direction = Creature.STATIONARY;
		}

		if (two === 'H' && five === 'H' && this.direction === Creature.DOWN) {
			go = Barrel.DOWN;
		} else if (five === 'H' && two === 'H') {
			go = Barrel.LEFT_RIGHT_DOWN_DECISIONS[this.barrelRandom.nextInt(Barrel.LEFT_RIGHT_DOWN_DECISIONS.length)];
		} else if (two !== '=' && two !== '-' && two !== '|') {
			go = Barrel.DOWN;
		} else if (five === 'H') {
			go = Barrel.LEFT_RIGHT_DECISIONS[this.barrelRandom.nextInt(Barrel.LEFT_RIGHT_DECISIONS.length)];
		} else if (this.justReset) {
			go = Barrel.LEFT_RIGHT_DECISIONS[this.barrelRandom.nextInt(Barrel.LEFT_RIGHT_DECISIONS.length)];
			this.justReset = false;
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
			go = Barrel.LEFT_RIGHT_DECISIONS[this.barrelRandom.nextInt(Barrel.LEFT_RIGHT_DECISIONS.length)];
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

// Define decision arrays for testing (must match Java Barrel class)
Barrel.LEFT_RIGHT_DECISIONS = [Barrel.STOP, Barrel.LEFT, Barrel.RIGHT];
Barrel.LEFT_RIGHT_DOWN_DECISIONS = [Barrel.STOP, Barrel.LEFT, Barrel.RIGHT, Barrel.DOWN];

export default Barrel;
