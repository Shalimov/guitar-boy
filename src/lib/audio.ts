import * as Tone from "tone";
import { getDisplayNoteName, getFrequencyAtFret } from "@/lib/music";
import type { FretPosition, NoteName } from "@/types";

type NoteDuration = string;

let synth: Tone.PolySynth<Tone.Synth> | null = null;

function getSynth() {
	if (synth) {
		return synth;
	}

	synth = new Tone.PolySynth(Tone.Synth, {
		oscillator: {
			type: "triangle",
		},
		envelope: {
			attack: 0.01,
			decay: 0.12,
			sustain: 0.18,
			release: 0.5,
		},
	}).toDestination();

	return synth;
}

async function ensureAudioReady() {
	if (Tone.getContext().state !== "running") {
		await Tone.start();
	}
}

function toPlayablePitch(note: NoteName, octave = 4) {
	return `${getDisplayNoteName(note, "sharp")}${octave}`;
}

export async function playNote(note: NoteName, duration: NoteDuration = "8n") {
	await ensureAudioReady();
	getSynth().triggerAttackRelease(toPlayablePitch(note), duration);
}

export async function playFrequency(frequency: number, duration: NoteDuration = "8n") {
	await ensureAudioReady();
	getSynth().triggerAttackRelease(frequency, duration);
}

export async function playFretPosition(position: FretPosition, duration: NoteDuration = "8n") {
	await playFrequency(getFrequencyAtFret(position), duration);
}

export function __resetAudioForTests() {
	synth = null;
}
