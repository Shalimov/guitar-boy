import * as Tone from "tone";
import { __resetAudioForTests, playFrequency, playFretPosition, playNote } from "./audio";
import { getFrequencyAtFret } from "./music";

const toneMock = Tone as typeof Tone & {
	__toneMock: {
		reset: () => void;
		getLastPolySynth: () => { triggerAttackRelease: jest.Mock };
	};
};

describe("audio helpers", () => {
	beforeEach(() => {
		toneMock.__toneMock.reset();
		__resetAudioForTests();
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
});
