/*
 * LADDER GAME - GameEngine
 * Core game logic separated from rendering
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

"use strict";

import Level from './Level.js';
import Creature from './Creature.js';
import Lad from './Lad.js';
import Barrel from './Barrel.js';
import BarrelProducer from './BarrelProducer.js';

class GameEngine {
	static G_O_NOT_OVER = 0;
	static G_O_BARREL = 1;
	static G_O_TIME = 2;
	static G_O_MONEY = 3;
	static G_O_SPIKE = 5;

	static SCORE_RESET = 0;
	static SCORE_BARREL = 1;
	static SCORE_STATUE = 2;
	static SCORE_MONEY = 3;

	constructor(levelString, barrelProducerRandom = null, barrelRandom = null) {
		this.realLevel = new Level(levelString);
		this.screenLevel = new Level(levelString);

		const startPos = this.realLevel.positionOf('p');
		const ladX = startPos ? startPos.x + 1 : 1;
		const ladY = startPos ? startPos.y + 1 : 1;

		this.ladStartPosX = ladX;
		this.ladStartPosY = ladY;

		if (startPos) {
			this.realLevel.setCharAt(startPos.y, startPos.x, ' ');
			this.screenLevel.setCharAt(startPos.y, startPos.x, ' ');
		}

		this.lad = new Lad(ladX, ladY, Creature.STATIONARY);
		this.barrelProducers = [];
		this.barrelProducerRandom = barrelProducerRandom;
		this.barrelRandom = barrelRandom;

		this.gameOver = GameEngine.G_O_NOT_OVER;
		this.cycles = 2000;
		this.score = 0;
		this.ladsLeft = 3;
		this.nextNewLad = 10000;

		// Display lad on initial screen
		this.screenLevel.setCharAt(ladY - 1, ladX - 1, 'p');

		this.setupLevelProducers();
	}

	setupLevelProducers() {
		this.barrelProducers = [];
		const level = this.realLevel;

		for (let y = 0; y < level.getHeight(); y++) {
			for (let x = 0; x < level.getWidth(); x++) {
				const char = level.getCharAt(y, x);
				if (char === 'V') {
					const producer = new BarrelProducer(x + 1, y + 1);
					if (this.barrelProducerRandom) {
						producer.setRandom(this.barrelProducerRandom, this.barrelRandom);
					}
					this.barrelProducers.push(producer);
				}
			}
		}
	}

	tick(command, jump) {
		if (this.gameOver !== GameEngine.G_O_NOT_OVER) {
			return this.gameOver;
		}

		// Remove barrels marked for recycling
		for (const producer of this.barrelProducers) {
			for (let j = producer.getBarrelCount() - 1; j >= 0; j--) {
				const barrel = producer.getBarrelAt(j);
				if (barrel && barrel.isMarkedForRecycling && barrel.isMarkedForRecycling()) {
					this.screenLevel.setCharAt(
						barrel.getYPos() - 1, barrel.getXPos() - 1,
						this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1)
					);
					producer.recycleBarrel(barrel);
				}
			}
		}

		this.cycles--;
		if (this.cycles <= 0) {
			this.gameOver = GameEngine.G_O_TIME;
			return this.gameOver;
		}

		// Clear lad's old position
		this.screenLevel.setCharAt(
			this.lad.getYPos() - 1, this.lad.getXPos() - 1,
			this.realLevel.getCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1)
		);

		const oldX = this.lad.getXPos();
		const oldY = this.lad.getYPos();

		this.lad.setCommand(command);
		if (jump) {
			this.lad.setJump();
		}

		// Update lad with context from realLevel
		const context = this.getContextFromLevel(this.lad.getXPos(), this.lad.getYPos(), this.realLevel);
		this.lad.update(...context);

		// Draw lad at new position
		this.screenLevel.setCharAt(
			this.lad.getYPos() - 1, this.lad.getXPos() - 1,
			this.lad.getSymbol()
		);

		// Check goal
		const realLadChar = this.realLevel.getCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1);
		if (realLadChar === '$') {
			this.gameOver = GameEngine.G_O_MONEY;
			return this.gameOver;
		}

		if (realLadChar === '^') {
			this.gameOver = GameEngine.G_O_SPIKE;
			return this.gameOver;
		}

		if (realLadChar === '&') {
			this.updateScore(GameEngine.SCORE_STATUE);
			this.realLevel.setCharAt(this.lad.getYPos() - 1, this.lad.getXPos() - 1, ' ');
		}

		// Remove disappearing floor
		if (oldX !== this.lad.getXPos() && this.lad.getYPos() >= oldY) {
			const platformBelow = this.realLevel.getCharAt(oldY, oldX - 1);
			if (platformBelow === '-') {
				this.realLevel.setCharAt(oldY, oldX - 1, ' ');
				this.screenLevel.setCharAt(oldY, oldX - 1, ' ');
			}
		}

		// Update barrels
		for (const producer of this.barrelProducers) {
			const barrelCountBefore = producer.getBarrelCount();
			producer.update(this.barrelProducerRandom);

			for (let j = 0; j < producer.getBarrelCount(); j++) {
				const barrel = producer.getBarrelAt(j);
				if (!barrel) continue;

				if (barrel.isMarkedForRecycling && barrel.isMarkedForRecycling()) {
					continue;
				}

				const isNewlyProduced = j >= barrelCountBefore;

				// Check collision before barrel moves
				if (barrel.getYPos() === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos()) {
					this.gameOver = GameEngine.G_O_BARREL;
					return this.gameOver;
				}

				// Score for jumping over barrel (pre-move)
				if (realLadChar !== 'H') {
					if (barrel.getYPos() - 1 === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos()) {
						this.updateScore(GameEngine.SCORE_BARREL);
					} else if (barrel.getYPos() - 2 === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos() &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '=' &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '|' &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '-') {
						this.updateScore(GameEngine.SCORE_BARREL);
					}
				}

				// Move barrel if not newly produced
				if (!isNewlyProduced) {
					this.screenLevel.setCharAt(
						barrel.getYPos() - 1, barrel.getXPos() - 1,
						this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1)
					);

					const barrelContext = this.getContextFromLevel(barrel.getXPos(), barrel.getYPos(), this.realLevel);
					barrel.update(...barrelContext);
				}

				// Draw barrel at position
				const barrelRealChar = this.realLevel.getCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1);
				this.screenLevel.setCharAt(
					barrel.getYPos() - 1, barrel.getXPos() - 1,
					barrel.getSymbol()
				);

				// Check for recycling square
				if (barrelRealChar === '*') {
					barrel.markForRecycling && barrel.markForRecycling();
				}

				// Check collision after barrel moves
				if (barrel.getYPos() === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos()) {
					this.gameOver = GameEngine.G_O_BARREL;
					return this.gameOver;
				}

				// Score for jumping over barrel (post-move)
				if (this.lad.getDirection() !== Creature.UP && this.lad.getDirection() !== Creature.DOWN &&
					realLadChar !== 'H') {
					if (barrel.getYPos() - 1 === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos()) {
						this.updateScore(GameEngine.SCORE_BARREL);
					} else if (barrel.getYPos() - 2 === this.lad.getYPos() && barrel.getXPos() === this.lad.getXPos() &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '=' &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '|' &&
						this.realLevel.getCharAt(this.lad.getYPos(), this.lad.getXPos() - 1) !== '-') {
						this.updateScore(GameEngine.SCORE_BARREL);
					}
				}
			}
		}

		return GameEngine.G_O_NOT_OVER;
	}

	getContextFromLevel(x, y, level) {
		const context = [];
		const offsets = [
			[-1, 1], [0, 1], [1, 1],
			[-1, 0], [0, 0], [1, 0],
			[-1, -1], [0, -1], [1, -1]
		];

		const row = y - 1;
		const col = x - 1;

		for (const offset of offsets) {
			const cx = col + offset[0];
			const cy = row + offset[1];
			context.push(level.getCharAt(cy, cx));
		}
		return context;
	}

	updateScore(type) {
		switch (type) {
			case GameEngine.SCORE_STATUE:
				this.score += this.cycles;
				break;
			case GameEngine.SCORE_BARREL:
				this.score += 200;
				break;
			case GameEngine.SCORE_MONEY:
				this.score += GameEngine.SCORE_MONEY * 100;
				break;
		}

		if (this.score > this.nextNewLad) {
			this.ladsLeft++;
			this.nextNewLad += 10000;
		}
	}

	scoreMoney() {
		this.updateScore(GameEngine.SCORE_MONEY);
	}

	reset() {
		this.gameOver = GameEngine.G_O_NOT_OVER;
		this.cycles = 2000;
		this.screenLevel = this.realLevel.clone();

		this.lad.reset(this.ladStartPosX, this.ladStartPosY, Creature.STATIONARY);
		this.screenLevel.setCharAt(this.ladStartPosY - 1, this.ladStartPosX - 1, 'p');

		for (const producer of this.barrelProducers) {
			producer.clear();
		}
	}

	setLevel(levelString) {
		this.realLevel = new Level(levelString);
		const startPos = this.realLevel.positionOf('p');
		this.ladStartPosX = startPos ? startPos.x + 1 : 1;
		this.ladStartPosY = startPos ? startPos.y + 1 : 1;
		if (startPos) {
			this.realLevel.setCharAt(startPos.y, startPos.x, ' ');
		}
		this.setupLevelProducers();
		this.reset();
	}

	getLadsLeft() {
		return this.ladsLeft;
	}

	loseLad() {
		if (this.ladsLeft > 0) {
			this.ladsLeft--;
		}
	}

	resetLads() {
		this.ladsLeft = 3;
	}

	getScreenState() {
		let result = '';
		for (let y = 0; y < this.screenLevel.getHeight(); y++) {
			for (let x = 0; x < this.screenLevel.getWidth(); x++) {
				result += this.screenLevel.getCharAt(y, x);
			}
			result += '\n';
		}
		return result;
	}

	getGameOver() { return this.gameOver; }
	getScore() { return this.score; }
	getCycles() { return this.cycles; }
	getLadX() { return this.lad.getXPos(); }
	getLadY() { return this.lad.getYPos(); }
}

export default GameEngine;
