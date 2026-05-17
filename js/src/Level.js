/*
 * LADDER GAME - Level
 * Level layout and terrain management
 */

"use strict";

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
		let lines = levelString.split('\n');

		// Remove trailing empty line if levelString ends with \n
		if (lines.length > 0 && lines[lines.length - 1] === '') {
			lines = lines.slice(0, -1);
		}

		this.level = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			this.level[i] = [];
			for (let j = 0; j < line.length; j++) {
				this.level[i][j] = line[j] || ' ';
			}
		}

		// Ensure all rows have same length
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
		if (row < 0 || col < 0 || row >= this.level.length || col >= this.level[0].length) {
			return '|';
		}
		return this.level[row][col];
	}

	setCharAt(row, col, char) {
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
					return { x: j, y: i };
				}
			}
		}
		return null;
	}
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
	module.exports = Level;
}
