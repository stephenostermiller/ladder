/*
 * Random number generator mocks for deterministic testing
 */

"use strict";

class DeterministicBarrelProducerRandom {
	constructor(barrelInterval) {
		this.callCount = 0;
		this.barrelInterval = barrelInterval;
	}

	nextDouble() {
		const frame = this.callCount++;
		if (frame % this.barrelInterval === 0) {
			return 0.0;
		}
		return 1.0;
	}
}

class CyclingBarrelRandom {
	constructor() {
		this.leftRightCount = 0;
		this.leftRightDownCount = 0;
	}

	reset() {
		this.leftRightCount = 0;
		this.leftRightDownCount = 0;
	}

	resetForBarrelReuse() {
		this.leftRightCount = 0;
		this.leftRightDownCount = 0;
	}

	nextInt(bound) {
		if (bound === 3) {
			return this.leftRightCount++ % bound;
		} else if (bound === 4) {
			return this.leftRightDownCount++ % bound;
		}
		throw new Error(`Unexpected random bound: ${bound}`);
	}
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		DeterministicBarrelProducerRandom,
		CyclingBarrelRandom
	};
}
