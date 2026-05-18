/*
 * Part of Ladder, a game.
 * Copyright (C) 1999-2020
 * Stephen Ostermiller http://ostermiller.org/contact.pl?regarding=Ladder
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

import static org.junit.Assert.assertEquals;
import java.util.Random;

/**
 * Test helper that wraps GameEngine for frame-by-frame simulation.
 *
 * <p>Usage:
 * <pre>
 * GameSimulation sim = new GameSimulation(
 *     "p   \n" +
 *     "====\n"
 * );
 * sim.step(Lad.RIGHT).assertScreen(
 *     " p  \n" +
 *     "====\n"
 * );
 * </pre>
 *
 * <p>Level characters:
 * <ul>
 *   <li>{@code p} - starting position of the lad (required)</li>
 *   <li>{@code =} - solid floor / ceiling</li>
 *   <li>{@code |} - wall</li>
 *   <li>{@code -} - disappearing floor tile</li>
 *   <li>{@code H} - ladder rung</li>
 *   <li>{@code V} - barrel producer</li>
 *   <li>{@code $} - goal (reaching it ends the level)</li>
 *   <li>{@code &} - statue (collect for bonus points)</li>
 *   <li>{@code ^} - spike (instant death)</li>
 *   <li>{@code *} - barrel recycling square</li>
 *   <li>{@code .} - trampoline</li>
 * </ul>
 *
 * <p>Lad symbols shown on screen:
 * <ul>
 *   <li>{@code p} - initial position marker / moving right or up</li>
 *   <li>{@code q} - moving left</li>
 *   <li>{@code g} - standing still</li>
 *   <li>{@code b} - falling</li>
 * </ul>
 */
public class GameSimulation {

	private final GameEngine engine;

	/**
	 * Initialise a simulation with the given level string.
	 * The level string uses newlines to separate rows. The {@code p} character
	 * marks the lad's starting position; it will appear as {@code p} on the
	 * initial screen and transition to other symbols after movement.
	 *
	 * @param levelString ASCII art level (newline-delimited rows)
	 */
	public GameSimulation(String levelString) {
		engine = new GameEngine(levelString);
	}

	/**
	 * Initialise a simulation with the given level string and custom Random sources.
	 *
	 * @param levelString ASCII art level (newline-delimited rows)
	 * @param barrelProducerRandom Random instance for barrel producer decisions
	 * @param barrelRandom Random instance for barrel movement decisions
	 */
	public GameSimulation(String levelString, Random barrelProducerRandom, Random barrelRandom) {
		engine = new GameEngine(levelString, barrelProducerRandom, barrelRandom);
	}

	/**
	 * Run one frame with no player input (lad continues its momentum or stands still).
	 *
	 * @return this, for chaining
	 */
	public GameSimulation step() {
		engine.tick(Lad.NONE, false);
		return this;
	}

	/**
	 * Run one frame applying the given directional command.
	 *
	 * @param command Lad.LEFT, Lad.RIGHT, Lad.UP, Lad.DOWN, or Lad.STOP
	 * @return this, for chaining
	 */
	public GameSimulation step(int command) {
		engine.tick(command, false);
		return this;
	}

	/**
	 * Run one frame with no direction but with jump pressed.
	 *
	 * @return this, for chaining
	 */
	public GameSimulation jump() {
		engine.tick(Lad.NONE, true);
		return this;
	}

	/**
	 * Run one frame with a direction and jump pressed simultaneously.
	 *
	 * @param command Lad.LEFT or Lad.RIGHT
	 * @return this, for chaining
	 */
	public GameSimulation jump(int command) {
		engine.tick(command, true);
		return this;
	}

	/**
	 * Run {@code n} frames with no player input.
	 *
	 * @param n number of frames to advance
	 * @return this, for chaining
	 */
	public GameSimulation step(int command, int n) {
		for (int i = 0; i < n; i++) {
			engine.tick(command, false);
		}
		return this;
	}

	/**
	 * Assert that the current screen matches the expected string, then return
	 * {@code this} for further chaining.
	 *
	 * <p>Each row in the expected string must end with {@code \n}. Trailing
	 * spaces within a row must match the level width exactly.
	 *
	 * @param expected expected screen state
	 * @return this, for chaining
	 */
	public GameSimulation assertScreen(String expected) {
		assertEquals(stripTrailingNewlines(expected), stripTrailingNewlines(getScreen()));
		return this;
	}

	private static String stripTrailingNewlines(String s) {
		return s.replaceAll("\\n+$", "");
	}

	/**
	 * Assert that the game is over for the given reason.
	 *
	 * @param reason one of {@link GameEngine#G_O_BARREL}, {@link GameEngine#G_O_TIME},
	 *               {@link GameEngine#G_O_MONEY}, {@link GameEngine#G_O_SPIKE}
	 * @return this, for chaining
	 */
	public GameSimulation assertGameOver(int reason) {
		assertEquals(reason, engine.getGameOver());
		return this;
	}

	/** Return the current screen as a string (rows separated by {@code \n}). */
	public String getScreen() {
		return engine.getScreenState();
	}

	/** Return the current game-over state ({@link GameEngine#G_O_NOT_OVER} while running). */
	public int getGameOver() {
		return engine.getGameOver();
	}

	/** Return {@code true} if the game has ended for any reason. */
	public boolean isGameOver() {
		return engine.getGameOver() != GameEngine.G_O_NOT_OVER;
	}

	/** Return the current score. */
	public long getScore() {
		return engine.getScore();
	}

	/** Return the remaining time (cycles). */
	public int getCycles() {
		return engine.getCycles();
	}

	/** Return the lad's current 1-indexed x position. */
	public int getLadX() {
		return engine.getLadX();
	}

	/** Return the lad's current 1-indexed y position. */
	public int getLadY() {
		return engine.getLadY();
	}
}
