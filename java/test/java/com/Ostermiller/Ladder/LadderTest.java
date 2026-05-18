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

public class LadderTest {

	@Test
	public void standingStillShowsGSymbol() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("standing-still-shows-g-symbol.yaml")
		);
	}

	@Test
	public void moveRightAndContinueUntilWall() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("move-right-and-continue-until-wall.yaml")
		);
	}

	@Test
	public void moveLeftAndContinueUntilWall() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("move-left-and-continue-until-wall.yaml")
		);
	}

	@Test
	public void basicFall() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("basic-fall.yaml")
		);
	}

	@Test
	public void jumpInPlaceAllFrames() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-in-place-all-frames.yaml")
		);
	}

	@Test
	public void jumpRightAllFrames() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-right-all-frames.yaml")
		);
	}

	@Test
	public void jumpRightSimultaneous() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-right-simultaneous.yaml")
		);
	}

	@Test
	public void jumpLeftAllFrames() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-left-all-frames.yaml")
		);
	}

	@Test
	public void jumpRightLandOnLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-right-land-on-ladder.yaml")
		);
	}

	@Test
	public void moveRightAndClimbLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("move-right-and-climb-ladder.yaml")
		);
	}

	@Test
	public void jumpClimbsLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("jump-climbs-ladder.yaml")
		);
	}

	@Test
	public void upClimbsLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("up-climbs-ladder.yaml")
		);
	}

	@Test
	public void ladMovesThroughLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("lad-moves-through-ladder.yaml")
		);
	}

	@Test
	public void reachingGoalEndsLevel() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("reaching-goal-ends-level.yaml")
		);
	}

	@Test
	public void hittingSpikeEndsGame() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("hitting-spike-ends-game.yaml")
		);
	}

	@Test
	public void hittingBarrelEndsGame() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("hitting-barrel-ends-game.yaml")
		);
	}

	@Test
	public void asteriskCollectsBarrels() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("asterisk-collects-barrels.yaml")
		);
	}

	@Test
	public void ladDeathOnAsterisk() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("lad-death-on-asterisk.yaml")
		);
	}

	@Test
	public void ladDeathOnProducer() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("lad-death-on-producer.yaml")
		);
	}

	@Test
	public void barrelsFindLadder() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("barrels-find-ladder.yaml")
		);
	}

	@Test
	public void collectStatueIncreasesScore() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("collect-statue-increases-score.yaml")
		);
	}

	@Test
	public void cyclesDecrementEachFrame() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("cycles-decrement-each-frame.yaml")
		);
	}

	@Test
	public void timeRunningOutEndsGame() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("time-running-out-ends-game.yaml")
		);
	}

	@Test
	public void disappearingFloorTest() throws Exception {
		YamlTestExecutor.executeTest(
			YamlTestLoader.loadTest("disappearing-floor-test.yaml")
		);
	}
}
