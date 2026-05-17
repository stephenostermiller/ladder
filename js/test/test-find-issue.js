/*
 * Find where the issue starts
 */

"use strict";

const Lad = require('../src/Lad');
const GameEngine = require('../src/GameEngine');
const GameSimulation = require('./GameSimulation');
const { DeterministicBarrelProducerRandom, CyclingBarrelRandom } = require('./RandomMocks');

let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(name, fn) {
	testCount++;
	try {
		fn();
		passCount++;
		console.log(`✓ ${name}`);
	} catch (err) {
		failCount++;
		console.error(`✗ ${name}`);
		console.error(`  ${err.message.split('\n')[0]}`);
	}
}

test('hittingSpikeEndsGame', () => {
	const sim = new GameSimulation(" ^\np \n");
	sim.step().assertScreen(" ^\ng \n");
	sim.step().assertGameOver(GameEngine.G_O_SPIKE);
});

test('hittingBarrelEndsGame', () => {
	const sim = new GameSimulation('o\np\n');
	sim.step().assertGameOver(GameEngine.G_O_BARREL);
});

test('asteriskCollectsBarrels', () => {
	const sim = new GameSimulation(
		' V\np*\n',
		new DeterministicBarrelProducerRandom(100),
		null
	);
	sim.step().assertScreen(' o\ng*\n');
	sim.step().assertScreen(' V\ngo\n');
	sim.step().assertScreen(' V\ng*\n');
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
		'* Vp\n',
		new DeterministicBarrelProducerRandom(5),
		new CyclingBarrelRandom()
	);
	sim.step().assertScreen('* og\n');
	sim.step().assertScreen('* og\n');
	sim.step().assertScreen('*oVg\n');
	sim.step(Lad.LEFT).assertScreen('o q \n');
	sim.step(Lad.STOP).assertScreen('* g \n');
	sim.step().assertScreen('* g \n');
	sim.assertGameOver(GameEngine.G_O_BARREL);
});

test('barrelsFindLadder', () => {
	const sim = new GameSimulation(
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
});

console.log(`\n==================================================`);
console.log(`Tests: ${testCount}, Passed: ${passCount}, Failed: ${failCount}`);
