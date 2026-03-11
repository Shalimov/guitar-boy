export type RNG = {
	random: () => number;
};

export function createRNG(seed: number): RNG {
	let current = seed;
	return {
		random: () => {
			current = (current * 1103515245 + 12345) & 0x7fffffff;
			return current / 0x7fffffff;
		},
	};
}

export function defaultRNG(): RNG {
	return {
		random: Math.random,
	};
}

export function shuffle<T>(arr: T[], rng: RNG = defaultRNG()): T[] {
	const result = [...arr];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(rng.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}
