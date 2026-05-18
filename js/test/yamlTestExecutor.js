import { expect } from 'vitest';
import GameSimulation from './GameSimulation';
import { createRng, CyclingBarrelRandom } from './yamlTestLoader';
import Lad from '../src/Lad';
import GameEngine from '../src/GameEngine';

export async function executeTest(testData) {
	// Create RNG instances
	let producerRng = null;
	let directionRng = null;

	if (testData.producer) {
		producerRng = createRng(testData.producer.type, testData.producer);
	}

	if (testData.direction) {
		directionRng = createRng(testData.direction.type, testData.direction);
	}

	// Create simulation
	const sim = new GameSimulation(testData.level.trim(), producerRng, directionRng);

	// Check initial state
	if (testData.initialCheck) {
		const check = testData.initialCheck;
		if (check.score !== undefined) {
			expect(sim.getScore()).toBe(check.score);
		}
		if (check.direction) {
			checkDirectionState(directionRng, check.direction);
		}
	}

	// Execute steps
	let previousCycles = -1;
	for (const stepMap of testData.steps) {
		const step = parseStep(stepMap);

		// Record cycles before step for cycle checks
		if (step.checkCycles !== undefined && previousCycles === -1) {
			previousCycles = sim.getCycles();
		}

		// Execute action only if action is specified
		if (step.action !== null && step.action !== '') {
			executeAction(sim, step);
		}

		// Check screen state
		if (step.assertScreen) {
			sim.assertScreen(step.assertScreen);
		}

		// Check game over
		if (step.assertGameOver) {
			const expectedState = parseGameOverState(step.assertGameOver);
			sim.assertGameOver(expectedState);
		}

		// Check direction RNG state
		if (step.checkDirection && directionRng) {
			checkDirectionState(directionRng, step.checkDirection);
		}

		// Check score
		if (step.checkScore) {
			expect(sim.getScore()).toBe(sim.getCycles());
		}

		// Check cycles decrement
		if (step.checkCycles !== undefined) {
			const expected = previousCycles + step.checkCycles;
			expect(sim.getCycles()).toBe(expected);
		}
	}
}

function parseStep(stepMap) {
	return {
		action: stepMap.action !== undefined ? stepMap.action : 'step',
		command: stepMap.command || 'NONE',
		frames: stepMap.frames || 1,
		assertScreen: stepMap.assertScreen,
		assertGameOver: stepMap.assertGameOver,
		checkDirection: stepMap.checkDirection,
		checkScore: stepMap.checkScore,
		checkCycles: stepMap.checkCycles
	};
}

function executeAction(sim, step) {
	const command = parseCommand(step.command);
	const frames = step.frames || 1;

	if (step.action === 'jump') {
		if (frames === 1 && step.command === 'NONE') {
			sim.jump();
		} else {
			sim.jump(command);
		}
	} else {
		if (frames === 1) {
			sim.step(command);
		} else {
			sim.step(command, frames);
		}
	}
}

function parseCommand(command) {
	if (!command || command === 'NONE') {
		return Lad.NONE;
	}
	switch (command) {
		case 'LEFT': return Lad.LEFT;
		case 'RIGHT': return Lad.RIGHT;
		case 'UP': return Lad.UP;
		case 'DOWN': return Lad.DOWN;
		case 'STOP': return Lad.STOP;
		case 'JUMP': return Lad.JUMP;
		default: return Lad.NONE;
	}
}

function parseGameOverState(state) {
	switch (state) {
		case 'G_O_BARREL': return GameEngine.G_O_BARREL;
		case 'G_O_MONEY': return GameEngine.G_O_MONEY;
		case 'G_O_SPIKE': return GameEngine.G_O_SPIKE;
		case 'G_O_TIME': return GameEngine.G_O_TIME;
		default: throw new Error(`Unknown game over state: ${state}`);
	}
}

function checkDirectionState(rng, checks) {
	if (checks.leftRightCount !== undefined) {
		expect(rng.leftRightCount).toBe(checks.leftRightCount);
	}
	if (checks.leftRightDownCount !== undefined) {
		expect(rng.leftRightDownCount).toBe(checks.leftRightDownCount);
	}
}
