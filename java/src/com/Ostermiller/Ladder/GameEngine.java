/*
 * Part of Ladder, a game.
 * Copyright (C) 1999-2020
 * Stephen Ostermiller http://ostermiller.org/contact.pl?regarding=Ladder
 * Anthony Howe https://github.com/SirWumpus/Ladder
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * See COPYING.TXT for details.
 */

package com.Ostermiller.Ladder;

import java.awt.Dimension;
import java.util.*;

/**
 * Core game logic for Ladder, decoupled from rendering and threading.
 * Each call to tick() advances the game by one frame.
 */
public class GameEngine {

	/** Callback interface for UI updates triggered by game events. */
	public interface Callback {
		void onScoreChanged(long score);
		void onLadsChanged(int lads);
		void onBonusTimeChanged(int time);
		void onBeep();
	}

	private static final Callback NO_OP = new Callback() {
		public void onScoreChanged(long score) {}
		public void onLadsChanged(int lads) {}
		public void onBonusTimeChanged(int time) {}
		public void onBeep() {}
	};

	/** Game over reasons. */
	public static final int G_O_NOT_OVER = 0;
	public static final int G_O_BARREL   = 1;
	public static final int G_O_TIME     = 2;
	public static final int G_O_MONEY    = 3;
	public static final int G_O_QUIT     = 4;
	public static final int G_O_SPIKE    = 5;

	/** Score event types. */
	public static final int SCORE_RESET  = 0;
	public static final int SCORE_BARREL = 1;
	public static final int SCORE_STATUE = 2;
	public static final int SCORE_MONEY  = 3;

	/** The terrain that is modified during play (statues removed, floors destroyed). */
	Level realLevel;
	/** The terrain plus current creature positions, used for rendering. */
	Level screenLevel;
	/** The player. */
	private Lad lad;
	/** 1-indexed starting position of the lad. */
	private int ladStartPosX;
	private int ladStartPosY;
	/** Active barrel producers and their barrels. */
	private Vector<BarrelProducer> barrelProducers;

	public int gameOver;
	public int cycles;
	private long score;
	private int ladsLeft;
	private long nextNewLad;

	private Callback callback;

	private Random barrelProducerRandom;
	private Random barrelRandom;

	public GameEngine(String levelString) {
		this(new Level(levelString), NO_OP);
	}

	public GameEngine(Level level) {
		this(level, NO_OP);
	}

	public GameEngine(String levelString, Random barrelProducerRandom, Random barrelRandom) {
		this(new Level(levelString), NO_OP, barrelProducerRandom, barrelRandom);
	}

	public GameEngine(Level level, Callback callback) {
		this(level, callback, null, null);
	}

	public GameEngine(Level level, Callback callback, Random barrelProducerRandom, Random barrelRandom) {
		this.callback = callback;
		this.barrelProducerRandom = barrelProducerRandom;
		this.barrelRandom = barrelRandom;
		barrelProducers = new Vector<BarrelProducer>();
		score = 0;
		ladsLeft = 3;
		nextNewLad = 10000;

		realLevel = new Level(level);

		Dimension p = realLevel.positionOf('p');
		if (p == null) {
			ladStartPosX = 1;
			ladStartPosY = 1;
		} else {
			ladStartPosX = p.width + 1;
			ladStartPosY = p.height + 1;
		}

		lad = new Lad(ladStartPosX, ladStartPosY, Creature.STATIONARY);
		reset();
	}

	/**
	 * Reset the lad position, barrel producers, and timer back to level start.
	 * Score and lives are preserved.
	 */
	public void reset() {
		gameOver = G_O_NOT_OVER;
		cycles = 2000;
		screenLevel = new Level(realLevel);

		BarrelProducer.clearBarrelPool();

		lad.reset(ladStartPosX, ladStartPosY, Creature.STATIONARY);
		screenLevel.setCharAt(ladStartPosY - 1, ladStartPosX - 1, 'p');
		realLevel.setCharAt(ladStartPosY - 1, ladStartPosX - 1, ' ');

		Dimension pos = realLevel.positionOf('V');
		int i;
		for (i = 0; i < barrelProducers.size(); i++) {
			barrelProducers.elementAt(i).clear();
		}
		for (i = 0; pos != null; i++) {
			if (i < barrelProducers.size()) {
				BarrelProducer bp = barrelProducers.elementAt(i);
				bp.reset(pos.width + 1, pos.height + 1);
				bp.setRandom(barrelProducerRandom, barrelRandom);
			} else {
				barrelProducers.addElement(new BarrelProducer(pos.width + 1, pos.height + 1, barrelProducerRandom, barrelRandom));
			}
			pos.width++;
			pos = realLevel.positionOf('V', pos);
		}
		barrelProducers.setSize(i);
		System.gc();

		callback.onLadsChanged(ladsLeft);
		callback.onBonusTimeChanged(cycles);
	}

	/**
	 * Reset score and lives to their initial values, then reset the level.
	 */
	public void resetGame() {
		score = 0;
		ladsLeft = 3;
		nextNewLad = 10000;
		callback.onScoreChanged(score);
		callback.onLadsChanged(ladsLeft);
		reset();
	}

	/**
	 * Switch to a new level. Preserves score and lives.
	 */
	public void setLevel(Level level) {
		realLevel = new Level(level);

		Dimension p = realLevel.positionOf('p');
		if (p == null) {
			ladStartPosX = 1;
			ladStartPosY = 1;
		} else {
			ladStartPosX = p.width + 1;
			ladStartPosY = p.height + 1;
		}
		reset();
	}

	/**
	 * Advance the game by one frame.
	 *
	 * @param command  Player direction command (Lad.LEFT, Lad.RIGHT, Lad.UP, Lad.DOWN,
	 *                 Lad.STOP, or Lad.NONE).
	 * @param jump     True if the player pressed the jump key this frame.
	 * @return The current game-over state (G_O_NOT_OVER while game is still running).
	 */
	public int tick(int command, boolean jump) {
		if (gameOver != G_O_NOT_OVER) {
			return gameOver;
		}

		// Remove barrels that were marked for recycling in the previous frame
		for (int k = 0; k < barrelProducers.size(); k++) {
			BarrelProducer bp = barrelProducers.elementAt(k);
			for (int j = bp.getBarrelCount() - 1; j >= 0; j--) {
				Barrel barrel = bp.getBarrelAt(j);
				if (barrel != null && barrel.isMarkedForRecycling()) {
					screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1,
						realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1));
					bp.recycleBarrel(barrel);
				}
			}
		}

		cycles--;
		callback.onBonusTimeChanged(cycles);
		if (cycles <= 0) {
			gameOver = G_O_TIME;
			return gameOver;
		}

		// Clear the lad's current screen position before moving
		screenLevel.setCharAt(lad.getYPos() - 1, lad.getXPos() - 1,
			realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1));

		int oldx = lad.getXPos();
		int oldy = lad.getYPos();

		lad.setCommand(command);
		if (jump) {
			lad.setJump();
		}

		// Tell the lad about its surroundings and let it update its position
		lad.update(
			realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1 - 1),
			realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1),
			realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1 + 1),
			realLevel.charAt(lad.getYPos() - 1,     lad.getXPos() - 1 - 1),
			realLevel.charAt(lad.getYPos() - 1,     lad.getXPos() - 1),
			realLevel.charAt(lad.getYPos() - 1,     lad.getXPos() - 1 + 1),
			realLevel.charAt(lad.getYPos() - 1 - 1, lad.getXPos() - 1 - 1),
			realLevel.charAt(lad.getYPos() - 1 - 1, lad.getXPos() - 1),
			realLevel.charAt(lad.getYPos() - 1 - 1, lad.getXPos() - 1 + 1));

		// Draw the lad at its new position
		screenLevel.setCharAt(lad.getYPos() - 1, lad.getXPos() - 1, lad.getSymbol());

		if (realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) == '$') {
			gameOver = G_O_MONEY;
			return gameOver;
		}
		if (realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) == '^') {
			gameOver = G_O_SPIKE;
			return gameOver;
		}
		if (realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) == '&') {
			updateScore(SCORE_STATUE);
			realLevel.setCharAt(lad.getYPos() - 1, lad.getXPos() - 1, ' ');
		}

		// Remove disappearing floor tiles the lad walked over
		if (lad.getXPos() != oldx && lad.getYPos() >= oldy &&
			realLevel.charAt(oldy - 1 + 1, oldx - 1) == '-') {
			screenLevel.setCharAt(oldy, oldx - 1, ' ');
			realLevel.setCharAt(oldy, oldx - 1, ' ');
		}

		// Update all barrel producers and their barrels
		for (int k = 0; k < barrelProducers.size(); k++) {
			BarrelProducer bp = barrelProducers.elementAt(k);
			int barrelCountBefore = bp.getBarrelCount();
			bp.update();
			for (int j = 0; j < bp.getBarrelCount(); j++) {
				Barrel barrel = bp.getBarrelAt(j);
				if (barrel == null) {
					continue;
				}

				// Skip processing barrels marked for recycling from previous frame
				if (barrel.isMarkedForRecycling()) {
					continue;
				}

				boolean isNewlyProduced = j >= barrelCountBefore;

				// Check collision before barrel moves
				if (barrel.getYPos() == lad.getYPos() && lad.getXPos() == barrel.getXPos()) {
					gameOver = G_O_BARREL;
					return gameOver;
				}
				// Score for jumping over a barrel (pre-move)
				if (realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) != 'H') {
					if (barrel.getYPos() - 1 == lad.getYPos() && lad.getXPos() == barrel.getXPos()) {
						updateScore(SCORE_BARREL);
					} else if (barrel.getYPos() - 2 == lad.getYPos() && lad.getXPos() == barrel.getXPos() &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '=' &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '|' &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '-') {
						updateScore(SCORE_BARREL);
					}
				}

				// If a barrel is newly produced, it doesn't move this frame, so skip the update and just draw it at its starting position
				if (!isNewlyProduced) {
					// Clear barrel's old screen position
					screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1,
						realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1));
					// Move the barrel
					barrel.update(
						realLevel.charAt(barrel.getYPos() - 1 + 1, barrel.getXPos() - 1 - 1),
						realLevel.charAt(barrel.getYPos() - 1 + 1, barrel.getXPos() - 1),
						realLevel.charAt(barrel.getYPos() - 1 + 1, barrel.getXPos() - 1 + 1),
						realLevel.charAt(barrel.getYPos() - 1,     barrel.getXPos() - 1 - 1),
						realLevel.charAt(barrel.getYPos() - 1,     barrel.getXPos() - 1),
						realLevel.charAt(barrel.getYPos() - 1,     barrel.getXPos() - 1 + 1),
						realLevel.charAt(barrel.getYPos() - 1 - 1, barrel.getXPos() - 1 - 1),
						realLevel.charAt(barrel.getYPos() - 1 - 1, barrel.getXPos() - 1),
						realLevel.charAt(barrel.getYPos() - 1 - 1, barrel.getXPos() - 1 + 1));
				}

				// Draw barrel at position
				screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1, barrel.getSymbol());

				// Check collision after barrel moves
				if (barrel.getYPos() == lad.getYPos() && lad.getXPos() == barrel.getXPos()) {
					gameOver = G_O_BARREL;
					return gameOver;
				}
				// Score for jumping over a barrel (post-move, avoid double-counting vertical movement)
				if (lad.getDirection() != Creature.UP && lad.getDirection() != Creature.DOWN &&
					realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) != 'H') {
					if (barrel.getYPos() - 1 == lad.getYPos() && lad.getXPos() == barrel.getXPos()) {
						updateScore(SCORE_BARREL);
					} else if (barrel.getYPos() - 2 == lad.getYPos() && lad.getXPos() == barrel.getXPos() &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '=' &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '|' &&
						realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '-') {
						updateScore(SCORE_BARREL);
					}
				}

				// Mark barrel for recycling if it reached a recycling square
				if (realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1) == '*') {
					barrel.markForRecycling();
				}
			}
		}

		return G_O_NOT_OVER;
	}

	/** Add one money point to the score (called by LadderCanvas during end-of-level countdown). */
	public void scoreMoney() {
		updateScore(SCORE_MONEY);
	}

	private void updateScore(int type) {
		switch (type) {
		case SCORE_STATUE:
			score += cycles;
			callback.onBeep();
			break;
		case SCORE_RESET:
			score = 0;
			break;
		case SCORE_BARREL:
			score += 200;
			callback.onBeep();
			break;
		case SCORE_MONEY:
			score += SCORE_MONEY * 10;
			callback.onBeep();
			break;
		}
		if (score > nextNewLad) {
			ladsLeft++;
			callback.onLadsChanged(ladsLeft);
			nextNewLad += 10000;
		}
		callback.onScoreChanged(score);
	}

	/**
	 * Return a string representation of the current screen, one line per row
	 * with a newline after each row.
	 */
	public String getScreenState() {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < screenLevel.getRowCount(); i++) {
			sb.append(screenLevel.getCharsAt(i, 0, screenLevel.getColumnCount()));
			sb.append('\n');
		}
		return sb.toString();
	}

	public int getGameOver()  { return gameOver; }
	public long getScore()    { return score; }
	public int getLadsLeft()  { return ladsLeft; }
	public int getCycles()    { return cycles; }
	public int getLadX()      { return lad.getXPos(); }
	public int getLadY()      { return lad.getYPos(); }

	public void loseLad() {
		if (ladsLeft > 0) {
			ladsLeft--;
			callback.onLadsChanged(ladsLeft);
		}
	}

	public void resetLads() {
		ladsLeft = 3;
		callback.onLadsChanged(ladsLeft);
	}
}
