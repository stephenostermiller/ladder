/*
 * Part of Ladder, a game.
 * Copyright (C) 2026
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

import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Frame-by-frame tests for Ladder game logic.
 *
 * Each test builds a minimal level string, drives the simulation with
 * {@link GameSimulation}, and asserts the resulting screen state or
 * game-over condition.
 */
public class LadderTest {

	@Test
	public void standingStillShowsGSymbol() {
		GameSimulation sim = new GameSimulation(
			"p   \n" +
			"====\n"
		);
		// Initial score is zero
		assertEquals(0L, sim.getScore());
		sim.assertScreen(
			"p   \n" +
			"====\n"
		);
		sim.step().assertScreen(
			"g   \n" +
			"====\n"
		);
	}

	// -----------------------------------------------------------------------
	// Horizontal movement
	// -----------------------------------------------------------------------

	@Test
	public void moveRightAndContinueUntilWall() {
		GameSimulation sim = new GameSimulation(
			"p   \n" +
			"====\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p  \n" +
			"====\n"
		);
		sim.step().assertScreen(
			"  p \n" +
			"====\n"
		);
		sim.step().assertScreen(
			"   p\n" +
			"====\n"
		);
		sim.step().assertScreen(
			"   g\n" +
			"====\n"
		);
	}

	@Test
	public void moveLeftAndContinueUntilWall() {
		GameSimulation sim = new GameSimulation(
			"   p\n" +
			"====\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"  q \n" +
			"====\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			" q  \n" +
			"====\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"q   \n" +
			"====\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"g   \n" +
			"====\n"
		);
	}

	@Test
	public void jumpInPlaceAllFrames() {
		GameSimulation sim = new GameSimulation(
			" \n" +
			" \n" +
			"p\n" +
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"g\n" +
			"=\n"
		);
		sim.jump().assertScreen(
			" \n" +
			"g\n" +
			" \n" +
			"=\n"
		);
		sim.step().assertScreen(
			"g\n" +
			" \n" +
			" \n" +
			"=\n"
		);
		sim.step().assertScreen(
			"g\n" +
			" \n" +
			" \n" +
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			"g\n" +
			" \n" +
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"g\n" +
			"=\n"
		);
	}

	@Test
	public void jumpRightAllFrames() {
		GameSimulation sim = new GameSimulation(
			"        \n" +
			"        \n" +
			"p       \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"g       \n" +
			"========\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			"        \n" +
			"        \n" +
			" p      \n" +
			"========\n"
		);
		sim.jump().assertScreen(
			"        \n" +
			"  p     \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"   p    \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"    p   \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"     p  \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"      p \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       p\n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       g\n" +
			"========\n"
		);
	}

	@Test
	public void jumpLeftAllFrames() {
		GameSimulation sim = new GameSimulation(
			"        \n" +
			"        \n" +
			"       p\n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       g\n" +
			"========\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"        \n" +
			"        \n" +
			"      q \n" +
			"========\n"
		);
		sim.jump().assertScreen(
			"        \n" +
			"     q  \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"    q   \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"   q    \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"  q     \n" +
			"        \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			" q      \n" +
			"        \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"q       \n" +
			"========\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"g       \n" +
			"========\n"
		);
	}

	@Test
	public void ladMovesThroughLadder() {
		// Verify that the game recognizes ladder tiles
		GameSimulation sim = new GameSimulation(
			"pH \n" +
			"===\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p \n" +
			"===\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" Hp\n" +
			"===\n"
		);
	}
	@Test
	public void reachingGoalEndsLevel() {
		GameSimulation sim = new GameSimulation(
			"p$\n" +
			"==\n"
		);
		// Walk right until the lad reaches '$'
		sim.step(Lad.RIGHT);
		sim.assertGameOver(GameEngine.G_O_MONEY);
	}

	@Test
	public void hittingSpikeEndsGame() {
		GameSimulation sim = new GameSimulation(
			"p^\n" +
			"==\n"
		);
		sim.step(Lad.RIGHT);
		sim.assertGameOver(GameEngine.G_O_SPIKE);
	}

	@Test
	public void collectStatueIncreasesScore() {
		GameSimulation sim = new GameSimulation(
			"p&\n" +
			"==\n"
		);
		assertEquals(0L, sim.getScore());
		sim.step(Lad.RIGHT);
		assertEquals(sim.getCycles(), sim.getScore());
	}

	// -----------------------------------------------------------------------
	// Timer
	// -----------------------------------------------------------------------

	@Test
	public void cyclesDecrementEachFrame() {
		GameSimulation sim = new GameSimulation(
			"p   \n" +
			"====\n"
		);
		int before = sim.getCycles();
		sim.step();
		assertEquals(before - 1, sim.getCycles());
	}

	@Test
	public void timeRunningOutEndsGame() {
		// Levels start with 2000 cycles; run enough frames to exhaust them
		GameSimulation sim = new GameSimulation(
			"p   \n" +
			"====\n"
		);
		sim.step(Lad.NONE, 2001);
		sim.assertGameOver(GameEngine.G_O_TIME);
	}

	@Test
	public void disappearingFloorTest() {
		GameSimulation sim = new GameSimulation(
			"p  \n" +
			"---\n" +
			"===\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p \n" +
			" --\n" +
			"===\n"
		);
		sim.step().assertScreen(
			"  p\n" +
			"  -\n" +
			"===\n"
		);
		sim.step().assertScreen(
			"  g\n" +
			"  -\n" +
			"===\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			" q \n" +
			"   \n" +
			"===\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"   \n" +
			" b \n" +
			"===\n"
		);
	}
}
