/** The 12 chromatic pitches — stored without enharmonic preference */
export type NoteName =
	| "C"
	| "C#/Db"
	| "D"
	| "D#/Eb"
	| "E"
	| "F"
	| "F#/Gb"
	| "G"
	| "G#/Ab"
	| "A"
	| "A#/Bb"
	| "B";

/** Display preference (per user setting) */
export type AccidentalPreference = "sharp" | "flat";

/** A single point on the neck */
export interface FretPosition {
	/** 0 = low E … 5 = high e */
	string: number;
	/** 0 (open) … 24 */
	fret: number;
}

export type IntervalName =
	| "Unison"
	| "m2"
	| "M2"
	| "m3"
	| "M3"
	| "P4"
	| "Tritone"
	| "P5"
	| "m6"
	| "M6"
	| "m7"
	| "M7"
	| "Octave";

export type TriadQuality = "major" | "minor" | "diminished" | "augmented";
