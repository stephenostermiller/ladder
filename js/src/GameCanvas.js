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
		this.currentLevelData = levelString;

		this.engine = new GameEngine(levelString);
		this.startLadX = this.engine.ladStartPosX;
		this.startLadY = this.engine.ladStartPosY;

		this.titleScreen = null;
		this.isShowingTitle = false;

		this.nextCommand = Lad.STOP;
		this.jumpCommand = false;

		this.ladsLeft = 3;
		this.gameOver = GameCanvas.G_O_NOT_OVER;
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
		this.paused = false;
		this.running = true;
		this.difficulty = GameCanvas.MEDIUM;
		this.gameSpeed = GameCanvas.MEDIUM_SPEED;
		this.pendingGameOver = GameCanvas.G_O_NOT_OVER;

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

		this.setupKeyboardControls();

		this.gameRunning = false;
		this.startGameLoop();
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


	updateGame() {
		// Handle bonus countdown (UI concern)
		if (this.inBonusCountdown) {
			if (this.engine.cycles > 0) {
				this.engine.scoreMoney();
				this.engine.cycles -= 100;
				this.updateStats();
			} else {
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
				this.engine.screenLevel.setCharAt(
					this.deathAnimationY - 1, this.deathAnimationX - 1,
					this.deathAnimationSymbols[this.deathAnimationFrame]);
				this.render();
				return;
			} else {
				this.deathAnimationFrame = -1;
				this.engine.screenLevel.setCharAt(
					this.deathAnimationY - 1, this.deathAnimationX - 1, ' ');

				if (this.ladsLeft <= 0) {
					this.setGameOverState(this.pendingGameOver);
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

		// Sync extra lives earned through score milestones
		const prevEngineLadsLeft = this.engine.getLadsLeft();

		const result = this.engine.tick(this.nextCommand, this.jumpCommand);
		this.nextCommand = Lad.NONE;
		this.jumpCommand = false;

		// Sync extra lives from engine
		const engineLadsIncrease = this.engine.getLadsLeft() - prevEngineLadsLeft;
		if (engineLadsIncrease > 0) {
			this.ladsLeft += engineLadsIncrease;
		}

		if (result === GameEngine.G_O_MONEY) {
			this.inBonusCountdown = true;
		} else if (result === GameEngine.G_O_BARREL ||
		           result === GameEngine.G_O_TIME ||
		           result === GameEngine.G_O_SPIKE) {
			this.ladsLeft--;
			this.updateStats();
			this.pendingGameOver = result;
			this.startDeathAnimation(this.engine.getLadX(), this.engine.getLadY());
		}

		this.render();
		updateDebugDisplay(this);
		this.updateStats();
	}

	resetLad() {
		this.engine.reset();
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


	startDeathAnimation(x, y) {
		this.deathAnimationFrame = 0;
		this.deathAnimationX = x;
		this.deathAnimationY = y;
	}

	updateStats() {
		document.getElementById('score').textContent = this.engine.getScore();
		document.getElementById('lives').textContent = this.ladsLeft;
		document.getElementById('bonusTime').textContent = Math.max(0, this.engine.getCycles());
	}

	resizeCanvas() {
		const container = this.canvas.parentElement;
		const maxWidth = container.clientWidth;
		const maxHeight = container.clientHeight;

		// Calculate aspect ratio to maintain square pixels
		const levelWidth = this.engine.screenLevel.getWidth();
		const levelHeight = this.engine.screenLevel.getHeight();

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
		for (let y = 0; y < this.engine.screenLevel.getHeight(); y++) {
			for (let x = 0; x < this.engine.screenLevel.getWidth(); x++) {
				const char = this.engine.screenLevel.getCharAt(y, x);
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
			this.engine.screenLevel = this.titleScreen.clone();
		}
	}

	changeLevel(levelData) {
		this.stopGameLoop();
		this.currentLevelData = levelData;
		this.engine.setLevel(levelData);
		this.startLadX = this.engine.ladStartPosX;
		this.startLadY = this.engine.ladStartPosY;
		this.ladsLeft = 3;
		this.gameOver = GameCanvas.G_O_NOT_OVER;
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
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

	const lad = gameCanvas.engine.lad;

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
