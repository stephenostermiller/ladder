/*
 * LADDER GAME - BarrelProducer
 * Manages barrel creation and lifetime
 */

"use strict";

import Barrel from './Barrel.js';
import Creature from './Creature.js';

class BarrelProducer {
	static MAX_BARRELS = 30;
	static allBarrels = [];

	constructor(xpos, ypos) {
		this.xpos = xpos;
		this.ypos = ypos;
		this.barrels = [];
		this.barrelProducerRandom = null;
		this.barrelRandom = null;
	}

	static clearBarrelPool() {
		BarrelProducer.allBarrels = [];
	}

	setRandom(barrelProducerRandom, barrelRandom) {
		this.barrelProducerRandom = barrelProducerRandom;
		this.barrelRandom = barrelRandom;
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
			BarrelProducer.allBarrels.push(barrel);
		}
	}

	clear() {
		while (this.barrels.length > 0) {
			const b = this.barrels.pop();
			b.resetRecyclingFlag();
			BarrelProducer.allBarrels.push(b);
		}
	}

	update(barrelProducerRandom = null) {
		// Use injected random if provided, otherwise use instance random
		const random = barrelProducerRandom || this.barrelProducerRandom;

		if (this.barrels.length < BarrelProducer.MAX_BARRELS) {
			let shouldCreate = false;

			if (random) {
				shouldCreate = random.nextDouble() < 1.0 / 15.0;
			} else {
				shouldCreate = Math.random() < 1.0 / 15.0;
			}

			if (shouldCreate) {
				this.spitOutBarrel();
			}
		}
	}

	spitOutBarrel() {
		let barrel;
		if (BarrelProducer.allBarrels.length > 0) {
			barrel = BarrelProducer.allBarrels.pop();
			barrel.resetState();
		} else {
			barrel = new Barrel(0, 0, Creature.STATIONARY, null);
		}
		barrel.setXPos(this.xpos);
		barrel.setYPos(this.ypos);
		barrel.resetRecyclingFlag();
		barrel.setRandom(this.barrelRandom);
		this.barrels.push(barrel);
	}
}

export default BarrelProducer;
