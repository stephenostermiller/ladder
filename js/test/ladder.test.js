/*
 * Ladder Game Tests - Data-driven from YAML
 */

"use strict";

import { test } from 'vitest';
import { loadTest } from './yamlTestLoader';
import { executeTest } from './yamlTestExecutor';

test('standingStillShowsGSymbol', async () => {
	await executeTest(loadTest('standing-still-shows-g-symbol.yaml'));
});

test('moveRightAndContinueUntilWall', async () => {
	await executeTest(loadTest('move-right-and-continue-until-wall.yaml'));
});

test('moveLeftAndContinueUntilWall', async () => {
	await executeTest(loadTest('move-left-and-continue-until-wall.yaml'));
});

test('basicFall', async () => {
	await executeTest(loadTest('basic-fall.yaml'));
});

test('jumpInPlaceAllFrames', async () => {
	await executeTest(loadTest('jump-in-place-all-frames.yaml'));
});

test('jumpRightAllFrames', async () => {
	await executeTest(loadTest('jump-right-all-frames.yaml'));
});

test('jumpRightSimultaneous', async () => {
	await executeTest(loadTest('jump-right-simultaneous.yaml'));
});

test('jumpLeftAllFrames', async () => {
	await executeTest(loadTest('jump-left-all-frames.yaml'));
});

test('jumpRightLandOnLadder', async () => {
	await executeTest(loadTest('jump-right-land-on-ladder.yaml'));
});

test('moveRightAndClimbLadder', async () => {
	await executeTest(loadTest('move-right-and-climb-ladder.yaml'));
});

test('jumpClimbsLadder', async () => {
	await executeTest(loadTest('jump-climbs-ladder.yaml'));
});

test('upClimbsLadder', async () => {
	await executeTest(loadTest('up-climbs-ladder.yaml'));
});

test('ladMovesThroughLadder', async () => {
	await executeTest(loadTest('lad-moves-through-ladder.yaml'));
});

test('reachingGoalEndsLevel', async () => {
	await executeTest(loadTest('reaching-goal-ends-level.yaml'));
});

test('hittingSpikeEndsGame', async () => {
	await executeTest(loadTest('hitting-spike-ends-game.yaml'));
});

test('hittingBarrelEndsGame', async () => {
	await executeTest(loadTest('hitting-barrel-ends-game.yaml'));
});

test('asteriskCollectsBarrels', async () => {
	await executeTest(loadTest('asterisk-collects-barrels.yaml'));
});

test('ladDeathOnAsterisk', async () => {
	await executeTest(loadTest('lad-death-on-asterisk.yaml'));
});

test('ladDeathOnProducer', async () => {
	await executeTest(loadTest('lad-death-on-producer.yaml'));
});

test('barrelsFindLadder', async () => {
	await executeTest(loadTest('barrels-find-ladder.yaml'));
});

test('collectStatueIncreasesScore', async () => {
	await executeTest(loadTest('collect-statue-increases-score.yaml'));
});

test('cyclesDecrementEachFrame', async () => {
	await executeTest(loadTest('cycles-decrement-each-frame.yaml'));
});

test('timeRunningOutEndsGame', async () => {
	await executeTest(loadTest('time-running-out-ends-game.yaml'));
});

test('disappearingFloorTest', async () => {
	await executeTest(loadTest('disappearing-floor-test.yaml'));
});
