import * as Tone from "tone";
import {
	CHORD_FORMULAS,
	getConstructNotes,
	getDisplayNoteName,
	getFrequencyAtFret,
} from "@/lib/music";
import type { FretPosition, NoteName } from "@/types";

type NoteDuration = string;

let synth: Tone.PolySynth<Tone.Synth> | null = null;
let analyser: Tone.Analyser | null = null;
let analyserMode: "fft" | "waveform" = "waveform";
const playbackListeners = new Set<(isPlaying: boolean) => void>();
const playbackTimeouts = new Set<ReturnType<typeof setTimeout>>();
let activePlaybackCount = 0;

function getAnalyser() {
	if (analyser) {
		return analyser;
	}

	analyserMode = "waveform";
	analyser = new Tone.Analyser("waveform", 256);
	return analyser;
}

function emitPlaybackState() {
	const isPlaying = activePlaybackCount > 0;
	for (const listener of playbackListeners) {
		listener(isPlaying);
	}
}

function parseDurationToMs(duration: NoteDuration) {
	const noteMatch = duration.match(/^(\d+(?:\.\d+)?)n$/);
	if (noteMatch) {
		const denominator = Number(noteMatch[1]);
		if (denominator > 0) {
			return 2000 / denominator;
		}
	}

	const measureMatch = duration.match(/^(\d+(?:\.\d+)?)m$/);
	if (measureMatch) {
		const measures = Number(measureMatch[1]);
		if (measures > 0) {
			return measures * 2000;
		}
	}

	const seconds = Number(duration);
	if (!Number.isNaN(seconds) && seconds > 0) {
		return seconds * 1000;
	}

	return 250;
}

function trackPlayback(duration: NoteDuration) {
	activePlaybackCount += 1;
	emitPlaybackState();

	const timeoutId = setTimeout(() => {
		playbackTimeouts.delete(timeoutId);
		activePlaybackCount = Math.max(0, activePlaybackCount - 1);
		emitPlaybackState();
	}, parseDurationToMs(duration));

	playbackTimeouts.add(timeoutId);
}

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
	});

	synth.connect(getAnalyser());
	synth.toDestination();

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
	trackPlayback(duration);
	getSynth().triggerAttackRelease(toPlayablePitch(note), duration);
}

export async function playFrequency(frequency: number, duration: NoteDuration = "8n") {
	await ensureAudioReady();
	trackPlayback(duration);
	getSynth().triggerAttackRelease(frequency, duration);
}

export async function playFretPosition(position: FretPosition, duration: NoteDuration = "8n") {
	await playFrequency(getFrequencyAtFret(position), duration);
}

/** Play multiple notes simultaneously as a chord */
export async function playChord(notes: string[], duration: NoteDuration = "8n") {
	await ensureAudioReady();
	trackPlayback(duration);
	getSynth().triggerAttackRelease(notes, duration);
}

/** Build pitched chord notes from a root, quality, and octave */
function buildChordPitches(root: NoteName, quality: string, octave: number): string[] {
	const formula = CHORD_FORMULAS[quality];
	if (!formula) return [toPlayablePitch(root, octave)];
	const noteNames = getConstructNotes(root, formula);
	return noteNames.map((n, i) => {
		// If a note wraps around (lower index than root), bump octave
		const noteOctave = i > 0 && n <= noteNames[0] ? octave + 1 : octave;
		return `${getDisplayNoteName(n, "sharp")}${noteOctave}`;
	});
}

/** Play two fret positions sequentially with a pause between them */
export async function playFretSequence(
	positions: FretPosition[],
	duration: NoteDuration = "1n",
	gapMs = 600,
) {
	await ensureAudioReady();
	for (let i = 0; i < positions.length; i++) {
		trackPlayback(duration);
		getSynth().triggerAttackRelease(getFrequencyAtFret(positions[i]), duration);
		if (i < positions.length - 1) {
			await new Promise<void>((resolve) => {
				const id = setTimeout(resolve, parseDurationToMs(duration) + gapMs);
				playbackTimeouts.add(id);
			});
		}
	}
}

/** Play the root note as a reference tone (non-penalized anchor) */
export async function playRootReference(root: NoteName, octave = 4) {
	await playNote(root, "2n");
	// Also play one octave above softly for a fuller reference
	await ensureAudioReady();
	const higherPitch = toPlayablePitch(root, octave + 1);
	getSynth().triggerAttackRelease(higherPitch, "4n", undefined, 0.3);
}

/**
 * Play a I-IV-V-I cadence to establish tonal context.
 * Returns a Promise that resolves when the cadence finishes (~2.2s).
 */
export async function playCadence(root: NoteName, octave = 3): Promise<void> {
	await ensureAudioReady();

	const chords: { notes: string[]; durationMs: number }[] = [
		{ notes: buildChordPitches(root, "Major", octave), durationMs: 500 },
		{
			notes: buildChordPitches(getConstructNotes(root, ["4"])[0], "Major", octave),
			durationMs: 500,
		},
		{
			notes: buildChordPitches(getConstructNotes(root, ["5"])[0], "Major", octave),
			durationMs: 500,
		},
		{ notes: buildChordPitches(root, "Major", octave), durationMs: 700 },
	];

	for (const chord of chords) {
		const durationSec = chord.durationMs / 1000;
		trackPlayback(String(durationSec));
		getSynth().triggerAttackRelease(chord.notes, durationSec);
		await new Promise((resolve) => setTimeout(resolve, chord.durationMs));
	}
}

/**
 * Play a short I-V-I cadence (~1.2s) for quick re-anchoring between questions.
 */
export async function playShortCadence(root: NoteName, octave = 3): Promise<void> {
	await ensureAudioReady();

	const chords: { notes: string[]; durationMs: number }[] = [
		{ notes: buildChordPitches(root, "Major", octave), durationMs: 400 },
		{
			notes: buildChordPitches(getConstructNotes(root, ["5"])[0], "Major", octave),
			durationMs: 400,
		},
		{ notes: buildChordPitches(root, "Major", octave), durationMs: 500 },
	];

	for (const chord of chords) {
		const durationSec = chord.durationMs / 1000;
		trackPlayback(String(durationSec));
		getSynth().triggerAttackRelease(chord.notes, durationSec);
		await new Promise((resolve) => setTimeout(resolve, chord.durationMs));
	}
}

export function subscribeToPlaybackState(listener: (isPlaying: boolean) => void) {
	playbackListeners.add(listener);
	listener(activePlaybackCount > 0);

	return () => {
		playbackListeners.delete(listener);
	};
}

export function getEqualizerLevels(barCount = 22) {
	if (!analyser || barCount <= 0) {
		return Array.from({ length: Math.max(1, barCount) }, () => 0);
	}

	const values = analyser.getValue();
	const spectrum = Array.isArray(values) ? values : Array.from(values);
	const bucketSize = Math.max(1, Math.floor(spectrum.length / barCount));

	return Array.from({ length: barCount }, (_, index) => {
		const start = index * bucketSize;
		const end = Math.min(spectrum.length, start + bucketSize);
		let total = 0;
		let count = 0;

		for (let i = start; i < end; i += 1) {
			const value = Number(spectrum[i]);
			if (!Number.isFinite(value)) {
				continue;
			}

			if (analyserMode === "waveform") {
				const normalized = Math.min(1, Math.abs(value));
				total += normalized;
			} else {
				const normalized = Math.min(1, Math.max(0, (value + 100) / 100));
				total += normalized * normalized;
			}
			count += 1;
		}

		return count > 0 ? total / count : 0;
	});
}

export function __resetAudioForTests() {
	synth = null;
	analyser = null;
	analyserMode = "waveform";
	activePlaybackCount = 0;
	for (const timeoutId of playbackTimeouts) {
		clearTimeout(timeoutId);
	}
	playbackTimeouts.clear();
	playbackListeners.clear();
}
