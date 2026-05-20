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

// Default control key bindings - each action can have multiple keys
const DEFAULT_CONTROLS = {
	up: ['ArrowUp', '8'],
	down: ['ArrowDown', '2'],
	left: ['ArrowLeft', '4'],
	right: ['ArrowRight', '6'],
	jump: [' '],
	pause: ['Escape', 'p'],
	keypadEnabled: false
};
const CONTROLS_STORAGE_KEY = 'ladderControls';

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

	static BUTTON_GRID = [
		[
			[{ label: 'PAUSE', name: 'pause-left' }],
			[{ label: 'JUMP', name: 'jump-left' }],
			[{ label: 'STOP', name: 'stop-left' }]
		],
		[
			[{}, { label: '↑', name: 'up-right' }],
			[{ label: '←', name: 'left-right' }, { label: '→', name: 'right-right' }],
			[{}, { label: '↓', name: 'down-right' }]
		]
	];

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
		this.keysHeldDown = new Set();
		this.keysRecentlyDown = [];
		this.lastCommandKeyPressed = null;
		this.pauseKeyPressed = false;
		this.pauseTouchWasActive = false;

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
		this.offsetX = 0;
		this.offsetY = 0;

		// Callback for when game ends
		this.onGameOver = null;

		// Game loop timing
		this.lastUpdateTime = Date.now();

		// Track number of levels played
		this.levelsPlayed = 1;

		// Load custom controls from localStorage
		const hasPointerInput = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
		this.hasPointerInput = hasPointerInput;
		this.controls = this.loadControls(!hasPointerInput);

		// Touch controls
		this.activeTouches = new Map();
		this.BTN = 50;   // Button size
		this.GAP = 8;   // Gap between buttons
		this.fullscreenButtonWasActive = false;

		this.setupKeyboardControls();
		this.setupTouchControls();

		this.gameRunning = false;
		this.startGameLoop();
	}

	loadControls(defaultKeypadEnabled) {
		try {
			const saved = JSON.parse(localStorage.getItem(CONTROLS_STORAGE_KEY));
			if (!saved) return { ...DEFAULT_CONTROLS, keypadEnabled: defaultKeypadEnabled };
			if (!('keypadEnabled' in saved)) {
				saved.keypadEnabled = defaultKeypadEnabled;
			}
			return saved;
		} catch {
			return { ...DEFAULT_CONTROLS, keypadEnabled: defaultKeypadEnabled };
		}
	}

	saveControls() {
		localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(this.controls));
	}

	isGameControlKeyEvent(e) {
		if (e.ctrlKey || e.altKey || e.metaKey) return false;
		return this.controls.up.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			this.controls.down.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			this.controls.left.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			this.controls.right.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			this.controls.jump.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			this.controls.pause.map(k => k.toLowerCase()).includes(e.key.toLowerCase()) ||
			e.key.length === 1  // Single character keys (letters, numbers, space)
	}

	setupKeyboardControls() {
		document.addEventListener('keydown', (e) => {
			if (!this.isGameControlKeyEvent(e)) return
			e.preventDefault()
			// Handle pause, immediate action (only once per key press)
			if (this.controls.pause.map(k => k.toLowerCase()).includes(e.key.toLowerCase())) {
				this.handlePauseAction('key');
				return
			}

			// Track non-pause keys for direction/jump commands
			this.keysHeldDown.add(e.key);
			this.keysRecentlyDown.push(e.key);
		})
		document.addEventListener('keyup', (e) => {
			if (!this.isGameControlKeyEvent(e)) e.preventDefault()
			// Reset pause key flag on key up
			if (this.controls.pause.map(k => k.toLowerCase()).includes(e.key.toLowerCase())) {
				this.pauseKeyPressed = false;
			}
			this.keysHeldDown.delete(e.key);
		})
		document.addEventListener('keypress', (e) => {
			if (this.isGameControlKeyEvent(e)) e.preventDefault()
		})
	}

	updateCommandsFromPressedKeys() {
		[...this.keysRecentlyDown,...this.keysHeldDown].forEach(key => {
			if (this.controls.jump.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
				this.jumpCommand = true;
			} else if (this.controls.up.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
				this.nextCommand = Lad.UP;
			} else if (this.controls.down.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
				this.nextCommand = Lad.DOWN;
			} else if (this.controls.left.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
				this.nextCommand = Lad.LEFT;
			} else if (this.controls.right.map(k => k.toLowerCase()).includes(key.toLowerCase())) {
				this.nextCommand = Lad.RIGHT;
			} else {
				this.nextCommand = Lad.STOP;
			}
		})
		this.keysRecentlyDown = [];
	}

	setupTouchControls() {
		let mouseDown = false;

		// Touch start
		this.canvas.addEventListener('touchstart', (e) => {
			e.preventDefault();
			// Track active touches first to check for fullscreen button
			for (const touch of e.changedTouches) {
				const pos = this.getCanvasPos(touch.clientX, touch.clientY);
				const button = this.getButtonAtPoint(pos.x, pos.y);
				this.activeTouches.set(touch.identifier, button);
			}
			// On title/game-over, tap to start (but only if no button was touched)
			if (this.isShowingTitle || this.gameOver !== GameCanvas.G_O_NOT_OVER) {
				const buttons = [...this.activeTouches.values()];
				if (!buttons.some(b => b)) {
					this.isShowingTitle = false;
					this.restartGame();
					updateGameUIState();
				}
			}
		}, { passive: false });

		// Touch move
		this.canvas.addEventListener('touchmove', (e) => {
			e.preventDefault();
			for (const touch of e.changedTouches) {
				const pos = this.getCanvasPos(touch.clientX, touch.clientY);
				this.activeTouches.set(touch.identifier, this.getButtonAtPoint(pos.x, pos.y));
			}
		}, { passive: false });

		// Touch end
		this.canvas.addEventListener('touchend', (e) => {
			e.preventDefault();
			for (const touch of e.changedTouches) {
				this.activeTouches.delete(touch.identifier);
			}
		}, { passive: false });

		// Touch cancel
		this.canvas.addEventListener('touchcancel', (e) => {
			e.preventDefault();
			for (const touch of e.changedTouches) {
				this.activeTouches.delete(touch.identifier);
			}
		}, { passive: false });

		// Mouse events (for desktop testing)
		this.canvas.addEventListener('mousedown', (e) => {
			mouseDown = true;
			const pos = this.getCanvasPos(e.clientX, e.clientY);
			const button = this.getButtonAtPoint(pos.x, pos.y);
			this.activeTouches.set('mouse', button);
			// On title/game-over, click to start (but only if no button was clicked)
			if (this.isShowingTitle || this.gameOver !== GameCanvas.G_O_NOT_OVER) {
				if (!button) {
					this.isShowingTitle = false;
					this.restartGame();
					updateGameUIState();
				}
			}
		});

		this.canvas.addEventListener('mousemove', (e) => {
			if (!mouseDown) return;
			const pos = this.getCanvasPos(e.clientX, e.clientY);
			this.activeTouches.set('mouse', this.getButtonAtPoint(pos.x, pos.y));
		});

		this.canvas.addEventListener('mouseup', () => {
			mouseDown = false;
			this.activeTouches.delete('mouse');
		});

		this.canvas.addEventListener('mouseleave', () => {
			mouseDown = false;
			this.activeTouches.delete('mouse');
		});
	}

	getCanvasPos(clientX, clientY) {
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		return {
			x: (clientX - rect.left) * scaleX,
			y: (clientY - rect.top) * scaleY
		};
	}

	getButtonAtPoint(x, y) {
		const w = this.canvas.width;
		const h = this.canvas.height;
		const gridLeft = this.GAP;
		const gridHeight = 3 * this.BTN + 2 * this.GAP;
		const gridTop = (h - gridHeight) / 2;
		const gridWidth = 2 * this.BTN + this.GAP;

		const checkGrid = (gridX, side) => {
			const col1Start = gridX;
			const col1End = gridX + this.BTN;
			const col2Start = gridX + this.BTN + this.GAP;
			const col2End = gridX + 2*this.BTN + this.GAP;

			for (let row = 0; row < 3; row++) {
				if (!GameCanvas.BUTTON_GRID[side][row]) continue;
				const rowStart = gridTop + row * (this.BTN + this.GAP);
				const rowEnd = rowStart + this.BTN;

				if (y >= rowStart && y < rowEnd) {
					if (x >= col1Start && x < col1End) {
						const button = GameCanvas.BUTTON_GRID[side][row][0];
						if (button && button.name) return button.name;
					}
					if (x >= col2Start && x < col2End) {
						const button = GameCanvas.BUTTON_GRID[side][row][1];
						if (button && button.name) return button.name;
					}
				}
			}
			return null;
		};

		// Check left side grid (x: 0 to w/2)
		if (x >= 0 && x < w/2) {
			const result = checkGrid(gridLeft, 0);
			if (result) return result;
		}

		// Check right side grid (x: w/2 to w)
		if (x >= w/2 && x <= w) {
			const gridXRight = w - gridWidth - gridLeft;
			const result = checkGrid(gridXRight, 1);
			if (result) return result;
		}

		// Check fullscreen button in bottom right
		const fsBtn = w - this.BTN - this.GAP;
		const fsTop = h - this.BTN - this.GAP;
		if (x >= fsBtn && x <= w - this.GAP && y >= fsTop && y <= h - this.GAP) {
			return 'fullscreen';
		}

		return null;
	}

	processFullscreenButton() {
		const activeButtons = [...this.activeTouches.values()].filter(b => b);
		const fullscreenButtonIsActive = activeButtons.includes('fullscreen');

		// Toggle fullscreen only on button press (transition from inactive to active)
		if (fullscreenButtonIsActive && !this.fullscreenButtonWasActive) {
			const container = document.getElementById('gameContainer');
			if (!document.fullscreenElement) {
				container.requestFullscreen().catch(err => {
					console.error(`Error attempting to enable fullscreen: ${err.message}`);
				});
			} else {
				document.exitFullscreen();
			}
		}

		this.fullscreenButtonWasActive = fullscreenButtonIsActive;
	}

	updateCommandsFromTouches() {
		const activeButtons = [...this.activeTouches.values()].filter(b => b);

		// Jump is independent - check for jump on either side
		if (activeButtons.some(b => b === 'jump-left' || b === 'jump-right')) {
			this.jumpCommand = true;
		}

		// Direction: priority left/right > up/down > stop
		if (activeButtons.some(b => b === 'left-left' || b === 'left-right')) {
			this.nextCommand = Lad.LEFT;
		} else if (activeButtons.some(b => b === 'right-left' || b === 'right-right')) {
			this.nextCommand = Lad.RIGHT;
		} else if (activeButtons.some(b => b === 'up-left' || b === 'up-right')) {
			this.nextCommand = Lad.UP;
		} else if (activeButtons.some(b => b === 'down-left' || b === 'down-right')) {
			this.nextCommand = Lad.DOWN;
		} else if (activeButtons.some(b => b === 'stop-left' || b === 'stop-right')) {
			this.nextCommand = Lad.STOP;
		}
	}

	renderTouchControls() {
		const w = this.canvas.width;
		const h = this.canvas.height;
		const active = new Set([...this.activeTouches.values()].filter(b => b));

		const drawButton = (x, y, width, height, label, buttonName) => {
			const isActive = active.has(buttonName);
			this.ctx.fillStyle = isActive ? 'rgba(0, 200, 0, 0.35)' : 'rgba(0, 80, 0, 0.25)';
			this.ctx.fillRect(x, y, width, height);

			this.ctx.strokeStyle = 'rgba(0, 150, 0, 0.30)';
			this.ctx.lineWidth = 1;
			this.ctx.strokeRect(x, y, width, height);

			const fontSize = Math.max(12, Math.floor(height * 0.3));
			this.ctx.font = fontSize + 'px monospace';
			this.ctx.fillStyle = isActive ? 'rgba(0, 255, 0, 0.70)' : 'rgba(0, 180, 0, 0.40)';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText(label, x + width / 2, y + height / 2);
		};

		const gridLeft = this.GAP;
		const gridHeight = 3 * this.BTN + 2 * this.GAP;
		const gridTop = (h - gridHeight) / 2;
		const gridWidth = 2 * this.BTN + this.GAP;

		const drawGrid = (gridX, side) => {
			for (let row = 0; row < 3; row++) {
				if (!GameCanvas.BUTTON_GRID[side][row]) continue;
				const rowY = gridTop + row * (this.BTN + this.GAP);
				for (let col = 0; col < 2; col++) {
					const colX = gridX + col * (this.BTN + this.GAP);
					const button = GameCanvas.BUTTON_GRID[side][row][col];
					if (button && button.label && button.name) {
						drawButton(colX, rowY, this.BTN, this.BTN, button.label, button.name);
					}
				}
			}
		};

		// Draw keypads only if not on title screen and keypad is enabled
		if (!this.isShowingTitle && this.controls.keypadEnabled) {
			drawGrid(gridLeft, 0);
			drawGrid(w - gridWidth - gridLeft, 1);
		}

		// Always draw fullscreen button
		const fsX = w - this.BTN - this.GAP;
		const fsY = h - this.BTN - this.GAP;
		drawButton(fsX, fsY, this.BTN, this.BTN, '⛶', 'fullscreen');
	}

	togglePause() {
		this.paused = !this.paused;
	}

	handlePauseAction(inputSource) {
		if (inputSource === 'key') {
			if (!this.pauseKeyPressed) {
				this.pauseKeyPressed = true;
				this.executePauseAction();
			}
		} else if (inputSource === 'touch') {
			if (!this.pauseTouchWasActive) {
				this.pauseTouchWasActive = true;
				this.executePauseAction();
			}
		}
	}

	executePauseAction() {
		// If showing title screen or game is over, start the game
		if (this.isShowingTitle || this.gameOver !== GameCanvas.G_O_NOT_OVER) {
			this.isShowingTitle = false;
			this.restartGame();
		} else {
			// Otherwise toggle pause
			this.togglePause();
		}
		updateGameUIState();
	}

	processPauseButtonInput() {
		const activeButtons = [...this.activeTouches.values()].filter(b => b);
		if (activeButtons.some(b => b === 'pause-left' || b === 'pause-right')) {
			this.handlePauseAction('touch');
		} else {
			this.pauseTouchWasActive = false;
		}
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
		// Check for pause button input before checking pause state
		// This allows unpausing via the pause button while paused
		this.processPauseButtonInput();

		// Handle bonus countdown (UI concern)
		if (this.inBonusCountdown) {
			if (this.engine.cycles > 0) {
				this.engine.scoreMoney();
				this.engine.cycles -= 100;
			} else {
				this.inBonusCountdown = false;
				this.loadingNextLevel = true;
				this.levelsPlayed++;
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

				if (this.engine.getLadsLeft() <= 0) {
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

		// Update commands based on currently pressed keys
		this.updateCommandsFromPressedKeys();

		// Update commands from touch/mouse input (excluding pause button)
		this.updateCommandsFromTouches();

		const result = this.engine.tick(this.nextCommand, this.jumpCommand);
		this.nextCommand = Lad.NONE;
		this.jumpCommand = false;

		if (result === GameEngine.G_O_MONEY) {
			this.inBonusCountdown = true;
		} else if (result === GameEngine.G_O_BARREL || result === GameEngine.G_O_TIME || result === GameEngine.G_O_SPIKE) {
			this.engine.loseLad();
			this.pendingGameOver = result;
			this.startDeathAnimation(this.engine.getLadX(), this.engine.getLadY());
		}

		this.render();
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

	resizeCanvas() {
		const container = this.canvas.parentElement;
		const containerWidth = container.clientWidth;
		const containerHeight = container.clientHeight;

		// Calculate aspect ratio to maintain square pixels
		const levelWidth = this.engine.screenLevel.getWidth();
		const levelHeight = this.engine.screenLevel.getHeight();

		// Calculate scale to fit in container while maintaining aspect ratio
		// Account for stats row at the bottom
		const statsRowHeight = this.letterHeight;
		const scaleX = containerWidth / (levelWidth * this.letterWidth);
		const scaleY = (containerHeight - statsRowHeight) / (levelHeight * this.letterHeight);
		const scale = Math.min(scaleX, scaleY);

		// Calculate game content size
		const gameWidth = levelWidth * this.letterWidth * scale;
		const gameHeight = levelHeight * this.letterHeight * scale;

		// Set canvas to fill container
		this.canvas.width = containerWidth;
		this.canvas.height = containerHeight;

		// Calculate offsets to center the game with letterboxing
		this.offsetX = (containerWidth - gameWidth) / 2;
		this.offsetY = (containerHeight - gameHeight) / 2;

		// Store scale for use in rendering
		this.canvasScale = scale;
	}

	render() {
		// Update canvas size to fill container
		this.resizeCanvas();

		// Clear canvas
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw touch control overlays
		this.renderTouchControls();

		// Set text properties with scaled font
		const fontSize = Math.floor(14 * this.canvasScale);
		this.ctx.font = fontSize + 'px monospace';
		this.ctx.fillStyle = '#0f0';
		this.ctx.textAlign = 'start';
		this.ctx.textBaseline = 'alphabetic';

		// Draw level (iterate 0-based array, use 0-based for getCharAt)
		for (let y = 0; y < this.engine.screenLevel.getHeight(); y++) {
			for (let x = 0; x < this.engine.screenLevel.getWidth(); x++) {
				const char = this.engine.screenLevel.getCharAt(y, x);
				if (char !== ' ') {
					this.ctx.fillText(char, this.offsetX + x * this.letterWidth * this.canvasScale, this.offsetY + (y + 1) * this.letterHeight * this.canvasScale);
				}
			}
		}

		// Draw stats at the bottom (not on title screen)
		if (!this.isShowingTitle) {
			const levelHeight = this.engine.screenLevel.getHeight();
			const statsY = this.offsetY + levelHeight * this.letterHeight * this.canvasScale;
			const score = String(this.engine.getScore()).padEnd(6);
			const lives = String(this.engine.getLadsLeft()).padEnd(2);
			const level = String(this.levelsPlayed).padEnd(2);
			const statsText = `Score: ${score}  Lives: ${lives}  Level: ${level}  Bonus: ${Math.max(0, this.engine.getCycles())}`;
			this.ctx.fillText(statsText, this.offsetX, statsY + this.letterHeight * this.canvasScale);
		}


		// Draw pause message
		if (this.paused) {
			const levelWidth = this.engine.screenLevel.getWidth();
			const levelHeight = this.engine.screenLevel.getHeight();
			const gameWidth = levelWidth * this.letterWidth * this.canvasScale;
			const gameHeight = (levelHeight + 1) * this.letterHeight * this.canvasScale + 4 * this.canvasScale;
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			this.ctx.fillRect(this.offsetX, this.offsetY, gameWidth, gameHeight);
			this.ctx.fillStyle = '#0f0';
			this.ctx.font = 'bold ' + Math.floor(24 * this.canvasScale) + 'px Arial';
			this.ctx.textAlign = 'center';
			this.ctx.fillText('PAUSED', this.offsetX + gameWidth / 2, this.offsetY + gameHeight / 2);
			this.ctx.textAlign = 'left';
		}

		// Draw game over message
		if (this.gameOver !== GameCanvas.G_O_NOT_OVER) {
			const levelWidth = this.engine.screenLevel.getWidth();
			const levelHeight = this.engine.screenLevel.getHeight();
			const gameWidth = levelWidth * this.letterWidth * this.canvasScale;
			const gameHeight = (levelHeight + 1) * this.letterHeight * this.canvasScale + 4 * this.canvasScale;
			this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			this.ctx.fillRect(this.offsetX, this.offsetY, gameWidth, gameHeight);
			this.ctx.fillStyle = '#f00';
			this.ctx.font = 'bold ' + Math.floor(24 * this.canvasScale) + 'px Arial';
			this.ctx.textAlign = 'center';

			let message = 'GAME OVER';

			this.ctx.fillText(message, this.offsetX + gameWidth / 2, this.offsetY + gameHeight / 2);
			this.ctx.textAlign = 'left';
		}
	}

	startGameLoop() {
		this.gameRunning = true;
		this.lastUpdateTime = Date.now();

		const gameLoop = () => {
			const currentTime = Date.now();
			const elapsed = currentTime - this.lastUpdateTime;

			// Process fullscreen button every frame
			this.processFullscreenButton();

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
			this.engine.resetLads();
			this.engine.resetScore();
			this.levelsPlayed = 1;
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
		this.gameOver = GameCanvas.G_O_NOT_OVER;
		this.inBonusCountdown = false;
		this.loadingNextLevel = false;
		this.startGameLoop();
		document.getElementById('levelSelect').value = this.currentLevelIndex;
	}

	formatKeyName(key) {
		const keyMap = {
			' ': 'Space',
			'ArrowUp': '↑',
			'ArrowDown': '↓',
			'ArrowLeft': '←',
			'ArrowRight': '→',
			'Escape': 'Esc'
		};
		return keyMap[key] || key.toUpperCase();
	}

	openControlsModal() {
		let modalOverlay = document.getElementById('controlsModalOverlay');

		// Create modal if it doesn't exist
		if (!modalOverlay) {
			modalOverlay = document.createElement('div');
			modalOverlay.id = 'controlsModalOverlay';
			modalOverlay.className = 'modal-overlay';

			const modalContent = document.createElement('div');
			modalContent.className = 'modal-content';

			const title = document.createElement('h3');
			title.textContent = 'Customize Controls';
			modalContent.appendChild(title);

			const table = document.createElement('table');
			table.className = 'controls-table';

			const actions = [
				{ key: 'up', label: 'Move Up' },
				{ key: 'down', label: 'Move Down' },
				{ key: 'left', label: 'Move Left' },
				{ key: 'right', label: 'Move Right' },
				{ key: 'jump', label: 'Jump' },
				{ key: 'pause', label: 'Pause / Play' }
			];

			actions.forEach(action => {
				const row = document.createElement('tr');

				const labelCell = document.createElement('td');
				labelCell.textContent = action.label;
				row.appendChild(labelCell);

				const keysCell = document.createElement('td');
				keysCell.className = 'keys-cell';
				keysCell.setAttribute('data-action', action.key);

				const keysContainer = document.createElement('div');
				keysContainer.className = 'key-bindings';
				keysContainer.setAttribute('data-action', action.key);

				const updateKeyBindings = () => {
					keysContainer.innerHTML = '';
					this.controls[action.key].forEach(key => {
						const binding = document.createElement('div');
						binding.className = 'key-binding';
						binding.textContent = this.formatKeyName(key);

						const removeBtn = document.createElement('button');
						removeBtn.className = 'remove-key';
						removeBtn.textContent = '✕';
						removeBtn.setAttribute('aria-label', `Remove ${key}`);
						removeBtn.addEventListener('click', (e) => {
							e.stopPropagation();
							this.controls[action.key] = this.controls[action.key].filter(k => k !== key);
							updateKeyBindings();
						});

						binding.appendChild(removeBtn);
						keysContainer.appendChild(binding);
					});

					const addBtn = document.createElement('button');
					addBtn.className = 'add-key-btn';
					addBtn.textContent = '+ Add Key';
					addBtn.addEventListener('click', () => {
						addBtn.classList.add('capturing');
						addBtn.textContent = 'Press any key...';
						addBtn.disabled = true;

						const captureHandler = (e) => {
							if (e.key === 'Escape') {
								// Cancel capture
								document.removeEventListener('keydown', captureHandler);
								addBtn.classList.remove('capturing');
								addBtn.textContent = '+ Add Key';
								addBtn.disabled = false;
								return;
							}

							e.preventDefault();
							const newKey = e.key;

							// Check if key already exists in this action
							if (!this.controls[action.key].includes(newKey)) {
								this.controls[action.key].push(newKey);
							}

							document.removeEventListener('keydown', captureHandler);
							addBtn.classList.remove('capturing');
							addBtn.textContent = '+ Add Key';
							addBtn.disabled = false;
							updateKeyBindings();
						};

						document.addEventListener('keydown', captureHandler);
					});

					keysContainer.appendChild(addBtn);
				};

				updateKeyBindings();
				keysCell.appendChild(keysContainer);
				row.appendChild(keysCell);
				table.appendChild(row);
			});

			// Add onscreen keypad settings as a table row
			const keypadRow = document.createElement('tr');

			const keypadLabel = document.createElement('td');
			keypadLabel.textContent = 'Onscreen Keypad';
			keypadRow.appendChild(keypadLabel);

			const keypadCell = document.createElement('td');
			keypadCell.className = 'keys-cell';

			const checkboxContainer = document.createElement('div');
			checkboxContainer.style.display = 'flex';
			checkboxContainer.style.alignItems = 'center';
			checkboxContainer.style.gap = '5px';

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.id = 'keypad-toggle';
			checkbox.checked = this.controls.keypadEnabled;
			checkbox.addEventListener('change', () => {
				this.controls.keypadEnabled = checkbox.checked;
			});

			const label = document.createElement('label');
			label.htmlFor = 'keypad-toggle';
			label.textContent = 'Enabled';
			label.style.cursor = 'pointer';

			checkboxContainer.appendChild(checkbox);
			checkboxContainer.appendChild(label);
			keypadCell.appendChild(checkboxContainer);
			keypadRow.appendChild(keypadCell);
			table.appendChild(keypadRow);

			modalContent.appendChild(table);

			const buttonContainer = document.createElement('div');
			buttonContainer.className = 'modal-buttons';

			const resetBtn = document.createElement('button');
			resetBtn.textContent = 'Reset to Defaults';
			resetBtn.addEventListener('click', () => {
				this.controls = {
					...DEFAULT_CONTROLS,
					keypadEnabled: !this.hasPointerInput
				};
				// Update keypad checkbox
				const keypadCheckbox = modalContent.querySelector('#keypad-toggle');
				if (keypadCheckbox) {
					keypadCheckbox.checked = this.controls.keypadEnabled;
				}
				// Re-render all key bindings
				actions.forEach(action => {
					const container = modalContent.querySelector(`.key-bindings[data-action="${action.key}"]`);
					if (container) {
						const updateKeyBindings = () => {
							container.innerHTML = '';
							this.controls[action.key].forEach(key => {
								const binding = document.createElement('div');
								binding.className = 'key-binding';
								binding.textContent = this.formatKeyName(key);

								const removeBtn = document.createElement('button');
								removeBtn.className = 'remove-key';
								removeBtn.textContent = '✕';
								removeBtn.addEventListener('click', (e) => {
									e.stopPropagation();
									this.controls[action.key] = this.controls[action.key].filter(k => k !== key);
									updateKeyBindings();
								});

								binding.appendChild(removeBtn);
								container.appendChild(binding);
							});

							const addBtn = document.createElement('button');
							addBtn.className = 'add-key-btn';
							addBtn.textContent = '+ Add Key';
							addBtn.addEventListener('click', () => {
								addBtn.classList.add('capturing');
								addBtn.textContent = 'Press any key...';
								addBtn.disabled = true;

								const captureHandler = (e) => {
									if (e.key === 'Escape') {
										document.removeEventListener('keydown', captureHandler);
										addBtn.classList.remove('capturing');
										addBtn.textContent = '+ Add Key';
										addBtn.disabled = false;
										return;
									}

									e.preventDefault();
									const newKey = e.key;

									if (!this.controls[action.key].includes(newKey)) {
										this.controls[action.key].push(newKey);
									}

									document.removeEventListener('keydown', captureHandler);
									addBtn.classList.remove('capturing');
									addBtn.textContent = '+ Add Key';
									addBtn.disabled = false;
									updateKeyBindings();
								};

								document.addEventListener('keydown', captureHandler);
							});

							container.appendChild(addBtn);
						};
						updateKeyBindings();
					}
				});
			});
			buttonContainer.appendChild(resetBtn);

			const closeBtn = document.createElement('button');
			closeBtn.textContent = 'Close';
			closeBtn.addEventListener('click', () => {
				this.saveControls();
				this.setupKeyboardControls();
				modalOverlay.classList.remove('open');
				updateControlsDisplay();
			});
			buttonContainer.appendChild(closeBtn);

			modalContent.appendChild(buttonContainer);
			modalOverlay.appendChild(modalContent);
			document.body.appendChild(modalOverlay);

			// Close modal on overlay click
			modalOverlay.addEventListener('click', (e) => {
				if (e.target === modalOverlay) {
					this.saveControls();
					this.setupKeyboardControls();
					modalOverlay.classList.remove('open');
					updateControlsDisplay();
				}
			});
		}

		// Show the modal
		modalOverlay.classList.add('open');
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
		return (await response.text()).trimEnd();
	} catch (error) {
		console.error('Error loading level file:', error);
		return null;
	}
}

// Initialize the game
let game = null;

function updateGameUIState() {
	const button = document.getElementById('startButton');
	const difficultySelect = document.getElementById('difficultySelect');
	const levelSelect = document.getElementById('levelSelect');
	if (!game) return;

	// Update button text
	if (game.isShowingTitle || game.gameOver !== GameCanvas.G_O_NOT_OVER) {
		button.textContent = 'Start Game';
	} else if (game.paused) {
		button.textContent = 'Resume';
	} else {
		button.textContent = 'Pause';
	}

	// Enable/disable controls based on game state
	// Selects are only enabled when game hasn't started (title screen) or is over
	const isGameInProgress = !game.isShowingTitle && game.gameOver === GameCanvas.G_O_NOT_OVER;
	if (isGameInProgress) {
		difficultySelect.disabled = true;
		levelSelect.disabled = true;
	} else {
		difficultySelect.disabled = false;
		levelSelect.disabled = false;
	}
}

function updateControlsDisplay() {
	if (!game) return;

	// Check if controls are at default values
	const isDefault = JSON.stringify(game.controls) === JSON.stringify(DEFAULT_CONTROLS);
	const defaultControls = document.getElementById('defaultControls');
	const customControls = document.getElementById('customControls');

	if (defaultControls && customControls) {
		if (isDefault) {
			defaultControls.style.display = '';
			customControls.style.display = 'none';
		} else {
			defaultControls.style.display = 'none';
			customControls.style.display = '';
		}
	}
}

window.addEventListener('DOMContentLoaded', async () => {
	const canvas = document.getElementById('gameCanvas');
	const difficultySelect = document.getElementById('difficultySelect');
	const levelSelect = document.getElementById('levelSelect');
	const startButton = document.getElementById('startButton');
	const controlsLink = document.getElementById('controlsLink');

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
	updateGameUIState();
	updateControlsDisplay();

	// Set game over callback
	game.onGameOver = () => {
		updateGameUIState();
	};

	// Handle start button click
	startButton.addEventListener('click', async () => {
		if (game) {
			// If showing title or game over, start the game
			if (game.isShowingTitle || game.gameOver !== GameCanvas.G_O_NOT_OVER) {
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

				// Load the selected level
				const levelIdx = parseInt(levelSelect.value);
				const levelData = await loadLevelFile(LEVEL_FILES[levelIdx]);
				if (levelData) {
					game.currentLevelIndex = levelIdx;
					game.currentLevelData = levelData;
					game.restartGame();
				}

				// Hide title and start the actual game
				game.isShowingTitle = false;
				game.paused = false;
			} else {
				// Otherwise toggle pause
				game.togglePause();
			}
			updateGameUIState();
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
			game.currentLevelData = levelData;
			// Reset lives if game is not in progress (showing title or game over)
			if (game.isShowingTitle || game.gameOver !== GameCanvas.G_O_NOT_OVER) {
				game.restartGame();
			} else {
				game.changeLevel(levelData);
			}
			updateGameUIState();
		}
	});

	// Handle controls link click
	if (controlsLink) {
		controlsLink.addEventListener('click', (e) => {
			e.preventDefault();
			if (game) {
				game.openControlsModal();
			}
		});
	}
});
