import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function loadTest(filename) {
	const testsDir = findTestsDirectory();
	const testFile = path.join(testsDir, filename);
	const content = fs.readFileSync(testFile, 'utf8');
	return yaml.load(content);
}

export function listTestFiles() {
	const testsDir = findTestsDirectory();
	if (!fs.existsSync(testsDir)) {
		return [];
	}
	return fs.readdirSync(testsDir)
		.filter(f => f.endsWith('.yaml'))
		.sort();
}

function findTestsDirectory() {
	let cwd = process.cwd();

	if (fs.existsSync(path.join(cwd, 'tests'))) {
		return path.join(cwd, 'tests');
	}

	if (fs.existsSync(path.join(cwd, '..', 'tests'))) {
		return path.join(cwd, '..', 'tests');
	}

	throw new Error('Could not find tests directory');
}

export function createRng(type, config) {
	if (!type) return null;

	switch (type) {
		case 'DeterministicBarrelProducerRandom':
			const barrelInterval = config?.barrelInterval || 1;
			return new DeterministicBarrelProducerRandom(barrelInterval);
		case 'CyclingBarrelRandom':
			return new CyclingBarrelRandom();
		default:
			throw new Error(`Unknown RNG type: ${type}`);
	}
}

export class DeterministicBarrelProducerRandom {
	constructor(barrelInterval) {
		this.barrelInterval = barrelInterval;
		this.callCount = 0;
	}

	nextDouble() {
		const frame = this.callCount++;
		if (frame % this.barrelInterval === 0) {
			return 0.0;
		}
		return 1.0;
	}
}

export class CyclingBarrelRandom {
	constructor() {
		this.leftRightCount = 0;
		this.leftRightDownCount = 0;
	}

	nextInt(bound) {
		// These bounds are from Barrel.LEFT_RIGHT_DECISIONS.length and Barrel.LEFT_RIGHT_DOWN_DECISIONS.length
		// We'll need to match them properly - they are 3 and 4 respectively
		if (bound === 3) {  // LEFT_RIGHT_DECISIONS
			return this.leftRightCount++ % bound;
		} else if (bound === 4) {  // LEFT_RIGHT_DOWN_DECISIONS
			return this.leftRightDownCount++ % bound;
		}
		throw new Error(`Unexpected random bound: ${bound}`);
	}
}
