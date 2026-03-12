import { getAllPositionsOfNote, NATURAL_NOTES } from "@/lib/music";
import { shuffle } from "@/lib/rng";
import type { FretPosition, NoteName } from "@/types";

export type FollowUpType = "ear-check" | "fretboard-locate";

export interface EarCheckFollowUp {
	type: "ear-check";
	/** The note that was just answered correctly */
	targetNote: NoteName;
	/** Position to play the audio from */
	playPosition: FretPosition;
	/** Multiple choice options */
	noteOptions: NoteName[];
}

export interface FretboardLocateFollowUp {
	type: "fretboard-locate";
	/** "Now find this note on the fretboard" */
	targetNote: NoteName;
	/** All valid positions for that note */
	validPositions: FretPosition[];
	/** Fret range to constrain the search */
	fretRange: [number, number];
}

export type FollowUp = EarCheckFollowUp | FretboardLocateFollowUp;

export type AnsweredQuestionType =
	| "note"
	| "note-guess"
	| "note-guess-sound"
	| "interval"
	| "chord";

/**
 * Generate a follow-up question for a correctly answered question.
 */
export function generateFollowUp(
	answeredQuestionType: AnsweredQuestionType,
	correctNote: NoteName,
	correctPosition: FretPosition,
	fretRange: [number, number],
): FollowUp | null {
	// For visual questions (note, note-guess):
	//   → return EarCheckFollowUp
	if (answeredQuestionType === "note" || answeredQuestionType === "note-guess") {
		const targetNote = correctNote;
		const noteOptions = shuffle([...NATURAL_NOTES]);

		return {
			type: "ear-check",
			targetNote,
			playPosition: correctPosition,
			noteOptions,
		};
	}

	// For sound questions (note-guess-sound):
	//   → return FretboardLocateFollowUp
	if (answeredQuestionType === "note-guess-sound") {
		const targetNote = correctNote;
		const validPositions = getAllPositionsOfNote(targetNote, fretRange);

		return {
			type: "fretboard-locate",
			targetNote,
			validPositions,
			fretRange,
		};
	}

	// For interval/chord: skip
	return null;
}
