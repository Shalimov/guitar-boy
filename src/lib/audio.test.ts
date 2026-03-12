import * as Tone from "tone";
import {
	__resetAudioForTests,
	getEqualizerLevels,
	playFrequency,
	playFretPosition,
	playNote,
	subscribeToPlaybackState,
} from "./audio";
import { getFrequencyAtFret } from "./music";

const toneMock = Tone as typeof Tone & {
	__toneMock: {
		reset: () => void;
		getLastPolySynth: () => { triggerAttackRelease: jest.Mock };
	};
};

describe("audio helpers", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		toneMock.__toneMock.reset();
		__resetAudioForTests();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("plays note names using sharp pitch labels", async () => {
		await playNote("C#/Db", "4n");

		const synth = toneMock.__toneMock.getLastPolySynth();
		expect(synth.triggerAttackRelease).toHaveBeenCalledWith("C#4", "4n");
	});

	it("starts the audio context before playback when needed", async () => {
		(Tone.getContext as jest.Mock).mockReturnValueOnce({ state: "suspended" });

		await playFrequency(440, "2n");

		expect(Tone.start).toHaveBeenCalled();
	});

	it("maps fret positions to their frequencies", async () => {
		const expectedFrequency = getFrequencyAtFret({ string: 0, fret: 5 });

		await playFretPosition({ string: 0, fret: 5 });

		const synth = toneMock.__toneMock.getLastPolySynth();
		expect(synth.triggerAttackRelease).toHaveBeenCalledWith(expectedFrequency, "8n");
	});

	it("emits playback state during note playback", async () => {
		const listener = jest.fn();
		const unsubscribe = subscribeToPlaybackState(listener);

		await playFrequency(440, "4n");

		expect(listener).toHaveBeenNthCalledWith(1, false);
		expect(listener).toHaveBeenNthCalledWith(2, true);

		jest.advanceTimersByTime(500);

		expect(listener).toHaveBeenNthCalledWith(3, false);
		unsubscribe();
	});

	it("returns equalizer bars from analyser data", async () => {
		await playFrequency(440, "8n");

		const bars = getEqualizerLevels(12);

		expect(bars).toHaveLength(12);
		expect(bars.every((value) => value >= 0 && value <= 1)).toBe(true);
	});
});
