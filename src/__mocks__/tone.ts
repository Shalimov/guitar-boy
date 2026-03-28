const mockContext = { state: "running" };

const polySynthInstances: PolySynth[] = [];

export const start = jest.fn(async () => undefined);
export const getContext = jest.fn(() => mockContext);

export const __toneMock = {
	getLastPolySynth: () => polySynthInstances[polySynthInstances.length - 1],
	reset() {
		polySynthInstances.length = 0;
		start.mockClear();
		getContext.mockClear();
		getContext.mockReturnValue(mockContext);
	},
};

export class Synth {}

export class PolySynth {
	public toDestination = jest.fn(() => this);
	public connect = jest.fn(() => this);
	public triggerAttackRelease = jest.fn();

	constructor(..._args: unknown[]) {
		polySynthInstances.push(this);
	}
}

export class Analyser {
	public getValue = jest.fn(() => new Float32Array(128).fill(-100));
}
