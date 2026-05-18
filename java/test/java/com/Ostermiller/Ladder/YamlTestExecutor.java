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

import java.util.Map;
import java.util.Random;

import static org.junit.Assert.*;

public class YamlTestExecutor {

	public static void executeTest(YamlTestData testData) throws Exception {
		// Create RNG instances
		Random producerRng = null;
		Random directionRng = null;

		if (testData.producer != null) {
			String type = (String) testData.producer.get("type");
			producerRng = YamlTestLoader.createRng(type, testData.producer);
		}

		if (testData.direction != null) {
			String type = (String) testData.direction.get("type");
			directionRng = YamlTestLoader.createRng(type, testData.direction);
		}

		// Create simulation
		GameSimulation sim = new GameSimulation(testData.level, producerRng, directionRng);

		// Check initial state
		if (testData.initialCheck != null) {
			Map<String, Object> check = testData.initialCheck;
			if (check.containsKey("score")) {
				Long expected = ((Number) check.get("score")).longValue();
				assertEquals("Initial score mismatch", expected, Long.valueOf(sim.getScore()));
			}
			if (check.containsKey("direction")) {
				Map<String, Object> directionCheck = (Map<String, Object>) check.get("direction");
				CyclingBarrelRandom cyclingRng = (CyclingBarrelRandom) directionRng;
				checkDirectionState(cyclingRng, directionCheck);
			}
		}

		// Execute steps
		long previousCycles = -1;
		for (Map<String, Object> stepMap : testData.steps) {
			YamlTestData.StepData step = new YamlTestData.StepData(stepMap);

			// Record cycles before step for cycle checks
			if (step.checkCycles != null && previousCycles == -1) {
				previousCycles = sim.getCycles();
			}

			// Execute action only if action is specified
			if (step.action != null && !"".equals(step.action)) {
				executeAction(sim, step);
			}

			// Check screen state
			if (step.assertScreen != null) {
				sim.assertScreen(step.assertScreen);
			}

			// Check game over
			if (step.assertGameOver != null) {
				sim.assertGameOver(parseGameOverState(step.assertGameOver));
			}

			// Check direction RNG state
			if (step.checkDirection != null && directionRng != null) {
				CyclingBarrelRandom cyclingRng = (CyclingBarrelRandom) directionRng;
				checkDirectionState(cyclingRng, step.checkDirection);
			}

			// Check score
			if (step.checkScore != null && step.checkScore) {
				assertEquals("Score should equal cycles", sim.getCycles(), sim.getScore());
			}

			// Check cycles decrement
			if (step.checkCycles != null) {
				long expected = previousCycles + step.checkCycles;
				assertEquals("Cycles mismatch", expected, sim.getCycles());
			}
		}
	}

	private static void executeAction(GameSimulation sim, YamlTestData.StepData step) {
		int command = parseCommand(step.command);
		int frames = step.frames != null ? step.frames : 1;

		if ("jump".equals(step.action)) {
			if (frames == 1 && "NONE".equals(step.command)) {
				sim.jump();
			} else {
				sim.jump(command);
			}
		} else {
			if (frames == 1) {
				sim.step(command);
			} else {
				sim.step(command, frames);
			}
		}
	}

	private static int parseCommand(String command) {
		if (command == null || "NONE".equals(command)) {
			return Lad.NONE;
		}
		switch (command) {
			case "LEFT": return Lad.LEFT;
			case "RIGHT": return Lad.RIGHT;
			case "UP": return Lad.UP;
			case "DOWN": return Lad.DOWN;
			case "STOP": return Lad.STOP;
			case "JUMP": return Lad.JUMP;
			default: return Lad.NONE;
		}
	}

	private static int parseGameOverState(String state) {
		switch (state) {
			case "G_O_BARREL": return GameEngine.G_O_BARREL;
			case "G_O_MONEY": return GameEngine.G_O_MONEY;
			case "G_O_SPIKE": return GameEngine.G_O_SPIKE;
			case "G_O_TIME": return GameEngine.G_O_TIME;
			default: throw new IllegalArgumentException("Unknown game over state: " + state);
		}
	}

	private static void checkDirectionState(CyclingBarrelRandom rng,
		Map<String, Object> checks) {
		if (checks.containsKey("leftRightCount")) {
			Integer expected = ((Number) checks.get("leftRightCount")).intValue();
			assertEquals("leftRightCount mismatch", expected.intValue(), rng.leftRightCount);
		}
		if (checks.containsKey("leftRightDownCount")) {
			Integer expected = ((Number) checks.get("leftRightDownCount")).intValue();
			assertEquals("leftRightDownCount mismatch", expected.intValue(), rng.leftRightDownCount);
		}
	}
}
