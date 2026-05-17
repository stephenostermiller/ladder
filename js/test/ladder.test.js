/*
 * Ladder Game Tests - Ported from Java
 */

"use strict";

import { test, expect } from 'vitest';
const Level = require('../src/Level');
const Creature = require('../src/Creature');
const Lad = require('../src/Lad');
const Barrel = require('../src/Barrel');
const BarrelProducer = require('../src/BarrelProducer');
const GameEngine = require('../src/GameEngine');
const GameSimulation = require('./GameSimulation');
const { DeterministicBarrelProducerRandom, CyclingBarrelRandom } = require('./RandomMocks');

// Make Barrel available in the test file
if (typeof global !== 'undefined') {
	global.Barrel = Barrel;
}

// Tests
test('standingStillShowsGSymbol', () => {
	const sim = new GameSimulation("p   \n");
	expect(sim.getScore()).toBe(0);
	sim.assertScreen("p   \n");
	sim.step().assertScreen("g   \n");
});

test('moveRightAndContinueUntilWall', () => {
	const sim = new GameSimulation("p   \n");
	sim.step(Lad.RIGHT).assertScreen(" p  \n");
	sim.step().assertScreen("  p \n");
	sim.step().assertScreen("   p\n");
	sim.step().assertScreen("   g\n");
});

test('moveLeftAndContinueUntilWall', () => {
	const sim = new GameSimulation("   p\n");
	sim.step(Lad.LEFT).assertScreen("  q \n");
	sim.step(Lad.LEFT).assertScreen(" q  \n");
	sim.step(Lad.LEFT).assertScreen("q   \n");
	sim.step(Lad.LEFT).assertScreen("g   \n");
});

test('basicFall', () => {
	const sim = new GameSimulation("p\n \n \n=\n");
	sim.step().assertScreen(" \nb\n \n=\n");
	sim.step().assertScreen(" \n \nb\n=\n");
	sim.step().assertScreen(" \n \ng\n=\n");
});

test('jumpInPlaceAllFrames', () => {
	const sim = new GameSimulation(" \n \np\n");
	sim.step().assertScreen(" \n \ng\n");
	sim.jump().assertScreen(" \ng\n \n");
	sim.step().assertScreen("g\n \n \n");
	sim.step().assertScreen("g\n \n \n");
	sim.step().assertScreen(" \ng\n \n");
	sim.step().assertScreen(" \n \ng\n");
});

test('jumpRightAllFrames', () => {
	const sim = new GameSimulation("        \n        \np       \n");
	sim.step().assertScreen("        \n        \ng       \n");
	sim.step(Lad.RIGHT).assertScreen("        \n        \n p      \n");
	sim.jump().assertScreen("        \n  p     \n        \n");
	sim.step().assertScreen("   p    \n        \n        \n");
	sim.step().assertScreen("    p   \n        \n        \n");
	sim.step().assertScreen("     p  \n        \n        \n");
	sim.step().assertScreen("        \n      p \n        \n");
	sim.step().assertScreen("        \n        \n       p\n");
	sim.step().assertScreen("        \n        \n       g\n");
});

test('jumpRightSimultaneous', () => {
	const sim = new GameSimulation("        \n        \np       \n");
	sim.jump(Lad.RIGHT).assertScreen("        \n p      \n        \n");
	sim.step().assertScreen("  p     \n        \n        \n");
	sim.step().assertScreen("   p    \n        \n        \n");
	sim.step().assertScreen("    p   \n        \n        \n");
	sim.step().assertScreen("        \n     p  \n        \n");
	sim.step().assertScreen("        \n        \n      p \n");
	sim.step().assertScreen("        \n        \n       p\n");
});

test('jumpLeftAllFrames', () => {
	const sim = new GameSimulation("        \n        \n       p\n");
	sim.step().assertScreen("        \n        \n       g\n");
	sim.step(Lad.LEFT).assertScreen("        \n        \n      q \n");
	sim.jump().assertScreen("        \n     q  \n        \n");
	sim.step().assertScreen("    q   \n        \n        \n");
	sim.step().assertScreen("   q    \n        \n        \n");
	sim.step().assertScreen("  q     \n        \n        \n");
	sim.step().assertScreen("        \n q      \n        \n");
	sim.step().assertScreen("        \n        \nq       \n");
	sim.step().assertScreen("        \n        \ng       \n");
});

test('jumpRightLandOnLadder', () => {
	const sim = new GameSimulation("    H \n    H \np   H \n");
	sim.jump(Lad.RIGHT).assertScreen("    H \n p  H \n    H \n");
	sim.jump().assertScreen("  p H \n    H \n    H \n");
	sim.jump().assertScreen("   pH \n    H \n    H \n");
	sim.step().assertScreen("    p \n    H \n    H \n");
	sim.step().assertScreen("    g \n    H \n    H \n");
});

test('moveRightAndClimbLadder', () => {
	const sim = new GameSimulation("    H \n    H \np   H \n");
	sim.step(Lad.RIGHT).assertScreen("    H \n    H \n p  H \n");
	sim.step(Lad.UP).assertScreen("    H \n    H \n  p H \n");
	sim.step().assertScreen("    H \n    H \n   pH \n");
	sim.step().assertScreen("    H \n    H \n    p \n");
	sim.step().assertScreen("    H \n    p \n    H \n");
	sim.step().assertScreen("    p \n    H \n    H \n");
	sim.step().assertScreen("    g \n    H \n    H \n");
});

test('jumpClimbsLadder', () => {
	const sim = new GameSimulation(" H \n H \npH \n");
	sim.step(Lad.RIGHT).assertScreen(" H \n H \n p \n");
	sim.step(Lad.STOP).assertScreen(" H \n H \n g \n");
	sim.jump().assertScreen(" H \n g \n H \n");
	sim.step().assertScreen(" p \n H \n H \n");
	sim.step().assertScreen(" g \n H \n H \n");
});

test('upClimbsLadder', () => {
	const sim = new GameSimulation(" H \n H \npH \n");
	sim.step(Lad.RIGHT).assertScreen(" H \n H \n p \n");
	sim.step(Lad.STOP).assertScreen(" H \n H \n g \n");
	sim.step(Lad.UP).assertScreen(" H \n p \n H \n");
	sim.step().assertScreen(" p \n H \n H \n");
	sim.step().assertScreen(" g \n H \n H \n");
});

test('ladMovesThroughLadder', () => {
	const sim = new GameSimulation("pH \n");
	sim.step(Lad.RIGHT).assertScreen(" p \n");
	sim.step(Lad.RIGHT).assertScreen(" Hp\n");
});

test('reachingGoalEndsLevel', () => {
	const sim = new GameSimulation("p$\n");
	sim.step(Lad.RIGHT).assertGameOver(GameEngine.G_O_MONEY);
});

test('hittingSpikeEndsGame', () => {
	const sim = new GameSimulation("p^\n");
	sim.step(Lad.RIGHT).assertGameOver(GameEngine.G_O_SPIKE);
});

test('hittingBarrelEndsGame', () => {
	const sim = new GameSimulation(
		"V\np\n",
		new DeterministicBarrelProducerRandom(1),
		null
	);
	sim.step().assertScreen("o\ng\n");
	sim.step().assertGameOver(GameEngine.G_O_BARREL);
});

test('asteriskCollectsBarrels', () => {
	const sim = new GameSimulation(
		" V\np*\n",
		new DeterministicBarrelProducerRandom(100),
		null
	);
	sim.step().assertScreen(" o\ng*\n");
	sim.step().assertScreen(" V\ngo\n");
	sim.step().assertScreen(" V\ng*\n");
});

test('ladDeathOnAsterisk', () => {
	const sim = new GameSimulation(
		" V\np*\n",
		new DeterministicBarrelProducerRandom(100),
		null
	);
	sim.step(Lad.RIGHT).assertScreen(" o\n p\n");
	sim.step(Lad.STOP).assertScreen(" V\n o\n");
	sim.assertGameOver(GameEngine.G_O_BARREL);
});

test('ladDeathOnProducer', () => {
	const sim = new GameSimulation(
		"* Vp\n",
		new DeterministicBarrelProducerRandom(4),
		new CyclingBarrelRandom()
	);
	sim.step().assertScreen("* og\n");
	sim.step().assertScreen("* og\n");
	sim.step().assertScreen("*oVg\n");
	sim.step(Lad.LEFT).assertScreen("o q \n");
	sim.step(Lad.STOP).assertScreen("* g \n");
	sim.step().assertScreen("* g \n");
	sim.assertGameOver(GameEngine.G_O_BARREL);
});

test('barrelsFindLadder', () => {
	const barrelRand = new CyclingBarrelRandom();
	const sim = new GameSimulation(
		" *HV\n" +
		"==H=\n" +
		"p*H*\n",
		new DeterministicBarrelProducerRandom(20),
		barrelRand
	);
	expect(barrelRand.leftRightCount).toBe(0);
	expect(barrelRand.leftRightDownCount).toBe(0);
	// Step 1: A barrel is produced at the site of the barrel producer
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(0);
	// Step 2: the barrel queries the deterministic nextInt(left/right) which says to stay put
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(1);
	// Step 3: the barrel queries the deterministic nextInt(left/right) which says to move left
	sim.step().assertScreen(
		" *oV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(2);
	// Step 4: the barrel queries the deterministic nextInt(left/right/down) which says to stay put
	sim.step().assertScreen(
		" *oV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightDownCount).toBe(1);
	// Step 5: the barrel queries the deterministic nextInt(left/right/down) which says to move left
	sim.step().assertScreen(
		" oHV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightDownCount).toBe(2);
	// Step 6: the old barrel is removed
	sim.step().assertScreen(
		" *HV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	// step 7: a new barrel is produced at the site of the barrel producer
	sim.step(Lad.NONE, 15).assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	// Step 8: the barrel queries the deterministic nextInt(left/right) which says to move right, but it can't
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(3)
	// Step 9: the barrel queries the deterministic nextInt(left/right) which says to stay put
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(4)
	// Step 10: the barrel queries the deterministic nextInt(left/right) which says to move left
	sim.step().assertScreen(
		" *oV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(5)
	// Step 11: the barrel queries the deterministic nextInt(left/right/down) which says to move right
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightDownCount).toBe(3)
	// Step 12: the barrel queries the deterministic nextInt(left/right) which says to move right, but it can't
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(6)
	// Step 13: the barrel queries the deterministic nextInt(left/right) which says to stay put
	sim.step().assertScreen(
		" *Ho\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(7)
	// Step 14: the barrel queries the deterministic nextInt(left/right) which says move left
	sim.step().assertScreen(
		" *oV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(8)
	// Step 15: the barrel queries the deterministic nextInt(left/right/down) which says to move down
	sim.step().assertScreen(
		" *HV\n" +
		"==o=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightDownCount).toBe(4)
	// Step 16: the barrel continues down the ladder
	sim.step().assertScreen(
		" *HV\n" +
		"==H=\n" +
		"g*o*\n"
	);
	// Step 17: the barrel queries the deterministic nextInt(left/right) which says move right
	sim.step().assertScreen(
		" *HV\n" +
		"==H=\n" +
		"g*Ho\n"
	);
	expect(barrelRand.leftRightCount).toBe(9)
	// Step 18: the barrel gets removed
	sim.step().assertScreen(
		" *HV\n" +
		"==H=\n" +
		"g*H*\n"
	);
	expect(barrelRand.leftRightCount).toBe(9)
	expect(barrelRand.leftRightDownCount).toBe(4)
});

test('collectStatueIncreasesScore', () => {
	const sim = new GameSimulation("p&\n");
	expect(sim.getScore()).toBe(0);
	sim.step(Lad.RIGHT);
	expect(sim.getScore()).toBe(sim.getCycles());
});

test('cyclesDecrementEachFrame', () => {
	const sim = new GameSimulation("p   \n");
	const before = sim.getCycles();
	sim.step();
	expect(sim.getCycles()).toBe(before - 1);
});

test('timeRunningOutEndsGame', () => {
	const sim = new GameSimulation("p   \n");
	sim.step(Lad.NONE, 2001);
	sim.assertGameOver(GameEngine.G_O_TIME);
});

test('disappearingFloorTest', () => {
	const sim = new GameSimulation("p  \n---\n");
	sim.step(Lad.RIGHT).assertScreen(" p \n --\n");
	sim.step().assertScreen("  p\n  -\n");
	sim.step().assertScreen("  g\n  -\n");
	sim.step(Lad.LEFT).assertScreen(" q \n   \n");
	sim.step(Lad.LEFT).assertScreen("   \n b \n");
});
