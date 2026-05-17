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
import java.util.Random;
import static org.junit.Assert.*;

/**
 * Frame-by-frame tests for Ladder game logic.
 *
 * Each test builds a minimal level string, drives the simulation with
 * {@link GameSimulation}, and asserts the resulting screen state or
 * game-over condition.
 */
public class LadderTest {

	static class DeterministicBarrelProducerRandom extends Random {
		private int callCount = 0;
		private int barrelInterval;

		DeterministicBarrelProducerRandom(int barrelInterval) {
			this.barrelInterval = barrelInterval;
		}

		@Override
		public double nextDouble() {
			int frame = callCount++;
			if (frame % barrelInterval == 0) {
				return 0.0;
			}
			return 1.0;
		}
	}

	static class CyclingBarrelRandom extends Random {
		private int leftRightCount = 0;
		private int leftRightDownCount = 0;

		@Override
		public int nextInt(int bound) {
			if (bound == Barrel.LEFT_RIGHT_DECISIONS.length) {
				return leftRightCount++ % bound;
			} else if (bound == Barrel.LEFT_RIGHT_DOWN_DECISIONS.length) {
				return leftRightDownCount++ % bound;
			}
			throw new UnsupportedOperationException("Unexpected random bound: " + bound);
		}
	}

	@Test
	public void standingStillShowsGSymbol() {
		GameSimulation sim = new GameSimulation(
			"p   \n"
		);
		// Initial score is zero
		assertEquals(0L, sim.getScore());
		sim.assertScreen(
			"p   \n"
		);
		sim.step().assertScreen(
			"g   \n"
		);
	}

	@Test
	public void moveRightAndContinueUntilWall() {
		GameSimulation sim = new GameSimulation(
			"p   \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p  \n"
		);
		sim.step().assertScreen(
			"  p \n"
		);
		sim.step().assertScreen(
			"   p\n"
		);
		sim.step().assertScreen(
			"   g\n"
		);
	}

	@Test
	public void moveLeftAndContinueUntilWall() {
		GameSimulation sim = new GameSimulation(
			"   p\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"  q \n"
		);
		sim.step(Lad.LEFT).assertScreen(
			" q  \n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"q   \n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"g   \n"
		);
	}


	@Test
	public void basicFall() {
		GameSimulation sim = new GameSimulation(
			"p\n" +
			" \n" +
			" \n" +
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			"b\n" +
			" \n"+
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"b\n"+
			"=\n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"g\n"+
			"=\n"
		);
	}

	@Test
	public void jumpInPlaceAllFrames() {
		GameSimulation sim = new GameSimulation(
			" \n" +
			" \n" +
			"p\n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"g\n"
		);
		sim.jump().assertScreen(
			" \n" +
			"g\n" +
			" \n"
		);
		sim.step().assertScreen(
			"g\n" +
			" \n" +
			" \n"
		);
		sim.step().assertScreen(
			"g\n" +
			" \n" +
			" \n"
		);
		sim.step().assertScreen(
			" \n" +
			"g\n" +
			" \n"
		);
		sim.step().assertScreen(
			" \n" +
			" \n" +
			"g\n"
		);
	}

	@Test
	public void jumpRightAllFrames() {
		GameSimulation sim = new GameSimulation(
			"        \n" +
			"        \n" +
			"p       \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"g       \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			"        \n" +
			"        \n" +
			" p      \n"
		);
		sim.jump().assertScreen(
			"        \n" +
			"  p     \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"   p    \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"    p   \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"     p  \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"      p \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       p\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       g\n"
		);
	}

	@Test
	public void jumpRightSimultaneous() {
		GameSimulation sim = new GameSimulation(
			"        \n" +
			"        \n" +
			"p       \n"
		);
		sim.jump(Lad.RIGHT).assertScreen(
			"        \n" +
			" p      \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"  p     \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"   p    \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"    p   \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"     p  \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"      p \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       p\n"
		);
	}

	@Test
	public void jumpLeftAllFrames() {
		GameSimulation sim = new GameSimulation(
			"        \n" +
			"        \n" +
			"       p\n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"       g\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"        \n" +
			"        \n" +
			"      q \n"
		);
		sim.jump().assertScreen(
			"        \n" +
			"     q  \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"    q   \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"   q    \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"  q     \n" +
			"        \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			" q      \n" +
			"        \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"q       \n"
		);
		sim.step().assertScreen(
			"        \n" +
			"        \n" +
			"g       \n"
		);
	}

	@Test
	public void jumpRightLandOnLadder() {
		GameSimulation sim = new GameSimulation(
			"    H \n" +
			"    H \n" +
			"p   H \n"
		);
		sim.jump(Lad.RIGHT).assertScreen(
			"    H \n" +
			" p  H \n" +
			"    H \n"
		);
		sim.jump().assertScreen(
			"  p H \n" +
			"    H \n" +
			"    H \n"
		);
		sim.jump().assertScreen(
			"   pH \n" +
			"    H \n" +
			"    H \n"
		);
		sim.step().assertScreen(
			"    p \n" +
			"    H \n" +
			"    H \n"
		);
		sim.step().assertScreen(
			"    g \n" +
			"    H \n" +
			"    H \n"
		);
	}

	@Test
	public void moveRightAndClimbLadder() {
		GameSimulation sim = new GameSimulation(
			"    H \n" +
			"    H \n" +
			"p   H \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			"    H \n" +
			"    H \n" +
			" p  H \n"
		);
		sim.step(Lad.UP).assertScreen(
			"    H \n" +
			"    H \n" +
			"  p H \n"
		);
		sim.step().assertScreen(
			"    H \n" +
			"    H \n" +
			"   pH \n"
		);
		sim.step().assertScreen(
			"    H \n" +
			"    H \n" +
			"    p \n"
		);
		sim.step().assertScreen(
			"    H \n" +
			"    p \n" +
			"    H \n"
		);
		sim.step().assertScreen(
			"    p \n" +
			"    H \n" +
			"    H \n"
		);
		sim.step().assertScreen(
			"    g \n" +
			"    H \n" +
			"    H \n"
		);
	}

	@Test
	public void jumpClimbsLadder() {
		GameSimulation sim = new GameSimulation(
			" H \n" +
			" H \n" +
			"pH \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" H \n" +
			" H \n" +
			" p \n"
		);
		sim.step(Lad.STOP).assertScreen(
			" H \n" +
			" H \n" +
			" g \n"
		);
		sim.jump().assertScreen(
			" H \n" +
			" g \n" +
			" H \n"
		);
		sim.step().assertScreen(
			" p \n" +
			" H \n" +
			" H \n"
		);
		sim.step().assertScreen(
			" g \n" +
			" H \n" +
			" H \n"
		);
	}

	@Test
	public void upClimbsLadder() {
		GameSimulation sim = new GameSimulation(
			" H \n" +
			" H \n" +
			"pH \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" H \n" +
			" H \n" +
			" p \n"
		);
		sim.step(Lad.STOP).assertScreen(
			" H \n" +
			" H \n" +
			" g \n"
		);
		sim.step(Lad.UP).assertScreen(
			" H \n" +
			" p \n" +
			" H \n"
		);
		sim.step().assertScreen(
			" p \n" +
			" H \n" +
			" H \n"
		);
		sim.step().assertScreen(
			" g \n" +
			" H \n" +
			" H \n"
		);
	}

	@Test
	public void ladMovesThroughLadder() {
		// Verify that the game recognizes ladder tiles
		GameSimulation sim = new GameSimulation(
			"pH \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p \n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" Hp\n"
		);
	}
	@Test
	public void reachingGoalEndsLevel() {
		GameSimulation sim = new GameSimulation(
			"p$\n"
		);
		// Walk right until the lad reaches '$'
		sim.step(Lad.RIGHT).assertGameOver(GameEngine.G_O_MONEY);
	}

	@Test
	public void hittingSpikeEndsGame() {
		GameSimulation sim = new GameSimulation(
			"p^\n"
		);
		sim.step(Lad.RIGHT).assertGameOver(GameEngine.G_O_SPIKE);
	}

	@Test
	public void hittingBarrelEndsGame() {
		GameSimulation sim = new GameSimulation(
			"V\n" +
			"p\n",
			new DeterministicBarrelProducerRandom(1),
			null
		);
		sim.step().assertScreen(
			"o\n" +
			"g\n"
		);
		sim.step().assertGameOver(GameEngine.G_O_BARREL);
	}

	@Test
	public void asteriskCollectsBarrels() {
		GameSimulation sim = new GameSimulation(
			" V\n" +
			"p*\n",
			new DeterministicBarrelProducerRandom(100),
			null
		);
		sim.step().assertScreen(
			" o\n" +
			"g*\n"
		);
		sim.step().assertScreen(
			" V\n" +
			"go\n"
		);
		sim.step().assertScreen(
			" V\n" +
			"g*\n"
		);
	}

	@Test
	public void ladDeathOnAsterisk() {
		GameSimulation sim = new GameSimulation(
			" V\n" +
			"p*\n",
			new DeterministicBarrelProducerRandom(100),
			null
		);
		sim.step(Lad.RIGHT).assertScreen(
			" o\n" +
			" p\n"
		);
		sim.step(Lad.STOP).assertScreen(
			" V\n" +
			" o\n"
		);
		sim.assertGameOver(GameEngine.G_O_BARREL);
	}

	@Test
	public void ladDeathOnProducer() {
		GameSimulation sim = new GameSimulation(
			"* Vp\n",
			new DeterministicBarrelProducerRandom(5),
			new CyclingBarrelRandom()
		);
		sim.step().assertScreen(
			"* og\n"
		);
		sim.step().assertScreen(
			"* og\n"
		);
		sim.step().assertScreen(
			"*oVg\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"o q \n"
		);
		sim.step(Lad.STOP).assertScreen(
			"* g \n"
		);
		sim.step().assertScreen(
			"* g \n"
		);
		sim.assertGameOver(GameEngine.G_O_BARREL);
	}

	@Test
	public void barrelsFindLadder() {
		GameSimulation sim = new GameSimulation(
			"|VH*\n" +
			"==H=\n" +
			"p*H*\n",
			new DeterministicBarrelProducerRandom(8),
			new CyclingBarrelRandom()
		);
		sim.step().assertScreen(
			"|oH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|oH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|oH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|Vo*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|Vo*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|oH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|Vo*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|VHo\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|oH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|Vo*\n" +
			"==H=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|VH*\n" +
			"==o=\n" +
			"g*H*\n"
		);
		sim.step().assertScreen(
			"|VH*\n" +
			"==H=\n" +
			"g*o*\n"
		);
		sim.step().assertScreen(
			"|VH*\n" +
			"==H=\n" +
			"g*o*\n"
		);
		sim.step().assertScreen(
			"|VH*\n" +
			"==H=\n" +
			"goH*\n"
		);
		sim.step().assertScreen(
			"|VH*\n" +
			"==H=\n" +
			"g*H*\n"
		);
	}

	@Test
	public void collectStatueIncreasesScore() {
		GameSimulation sim = new GameSimulation(
			"p&\n"
		);
		assertEquals(0L, sim.getScore());
		sim.step(Lad.RIGHT);
		assertEquals(sim.getCycles(), sim.getScore());
	}

	@Test
	public void cyclesDecrementEachFrame() {
		GameSimulation sim = new GameSimulation(
			"p   \n"
		);
		int before = sim.getCycles();
		sim.step();
		assertEquals(before - 1, sim.getCycles());
	}

	@Test
	public void timeRunningOutEndsGame() {
		// Levels start with 2000 cycles; run enough frames to exhaust them
		GameSimulation sim = new GameSimulation(
			"p   \n"
		);
		sim.step(Lad.NONE, 2001);
		sim.assertGameOver(GameEngine.G_O_TIME);
	}

	@Test
	public void disappearingFloorTest() {
		GameSimulation sim = new GameSimulation(
			"p  \n" +
			"---\n"
		);
		sim.step(Lad.RIGHT).assertScreen(
			" p \n" +
			" --\n"
		);
		sim.step().assertScreen(
			"  p\n" +
			"  -\n"
		);
		sim.step().assertScreen(
			"  g\n" +
			"  -\n"
		);
		sim.step(Lad.LEFT).assertScreen(
			" q \n" +
			"   \n"
		);
		sim.step(Lad.LEFT).assertScreen(
			"   \n" +
			" b \n"
		);
	}
}
