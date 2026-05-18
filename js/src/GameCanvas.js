/*
 * LADDER GAME - GameCanvas
 * Browser canvas rendering and game UI
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

"use strict";

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
