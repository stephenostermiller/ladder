/*
 * Test helper that wraps GameEngine for frame-by-frame simulation
 */

"use strict";

let GameEngine, Lad, BarrelProducer;
if (typeof module !== 'undefined' && module.exports) {
	GameEngine = require('../src/GameEngine');
	Lad = require('../src/Lad');
	BarrelProducer = require('../src/BarrelProducer');
}

class GameSimulation {
	constructor(levelString, barrelProducerRandom = null, barrelRandom = null) {
		// Mark this as a new test context for logging
		console.log(`[TEST] New GameSimulation created`);
		BarrelProducer.clearBarrelPool();
		// Reset random state if it has a reset method
		if (barrelRandom && typeof barrelRandom.reset === 'function') {
			barrelRandom.reset();
		}
		this.engine = new GameEngine(levelString, barrelProducerRandom, barrelRandom);
	}

	step(commandOrCount = Lad.NONE, count = undefined) {
		// If count is provided, run commandOrCount for count frames
		if (count !== undefined) {
			for (let i = 0; i < count; i++) {
				this.engine.tick(commandOrCount, false);
			}
		} else {
			// Single parameter: either a command or frame count
			// If it's a large number (>10), treat as frame count with no input
			// Otherwise treat as a command
			if (commandOrCount > 10) {
				for (let i = 0; i < commandOrCount; i++) {
					this.engine.tick(Lad.NONE, false);
				}
			} else {
				this.engine.tick(commandOrCount, false);
			}
		}
		return this;
	}

	jump(command = Lad.NONE) {
		this.engine.tick(command, true);
		return this;
	}

	assertScreen(expected) {
		const actual = this.getScreen();
		if (actual !== expected) {
			throw new Error(
				`Screen mismatch!\nExpected:\n${expected}\nActual:\n${actual}`
			);
		}
		return this;
	}

	assertGameOver(reason) {
		const actual = this.engine.getGameOver();
		if (actual !== reason) {
			const reasonNames = {
				0: 'G_O_NOT_OVER',
				1: 'G_O_BARREL',
				2: 'G_O_TIME',
				3: 'G_O_MONEY',
				5: 'G_O_SPIKE'
			};
			throw new Error(
				`Game over mismatch! Expected ${reasonNames[reason]}(${reason}), got ${reasonNames[actual]}(${actual})`
			);
		}
		return this;
	}

	getScreen() {
		return this.engine.getScreenState();
	}

	getGameOver() {
		return this.engine.getGameOver();
	}

	isGameOver() {
		return this.engine.getGameOver() !== GameEngine.G_O_NOT_OVER;
	}

	getScore() {
		return this.engine.getScore();
	}

	getCycles() {
		return this.engine.getCycles();
	}

	getLadX() {
		return this.engine.getLadX();
	}

	getLadY() {
		return this.engine.getLadY();
	}
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = GameSimulation;
}
