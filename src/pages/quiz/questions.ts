import { getAllPositionsOfNote, getInterval, getNoteAtFret, NATURAL_NOTES } from "@/lib/music";
import { defaultRNG, shuffle } from "@/lib/rng";
import type { FretPosition, NoteName } from "@/types";
import type { Difficulty, QuizType } from "./QuizSelector";

export interface NoteQuestion {
	id: string;
	type: "note";
	targetPositions: FretPosition[];
	targetNote: string;
	targetString?: number; // For speed drills - specifies which string to find the note on
	targetStringLabel?: string; // String name (E, A, D, G, B, e)
}

export interface NoteGuessQuestion {
	id: string;
	type: "note-guess" | "note-guess-sound";
	shownPosition: FretPosition;
	targetNote: NoteName;
	noteOptions: string[];
}

export interface IntervalQuestion {
	id: string;
	type: "interval";
	targetPositions: FretPosition[];
	targetInterval: string;
	intervalOptions: string[];
}

export interface ChordQuestion {
	id: string;
	type: "chord";
	targetPositions: FretPosition[];
	targetChord: string;
	targetString?: number; // For speed drills - specifies which string to place the root on
	targetStringLabel?: string; // String name (E, A, D, G, B, e)
	chordTone?: string; // For speed drills - which tone to place (Root, 3rd, 5th)
}

export type Question = NoteQuestion | NoteGuessQuestion | IntervalQuestion | ChordQuestion;

export const INTERVAL_NAMES = [
	"Unison",
	"m2",
	"M2",
	"m3",
	"M3",
	"P4",
	"Tritone",
	"P5",
	"m6",
	"M6",
	"m7",
	"M7",
	"Octave",
];

export interface Feedback {
	correct: FretPosition[];
	incorrect: FretPosition[];
	missed: FretPosition[];
	message?: string;
	selectedOption?: string;
}

export function generateQuestions(
	type: QuizType,
	difficulty: Difficulty,
	questionCount: number,
	rng: { random: () => number } = defaultRNG(),
	fretRange?: { min: number; max: number },
): Question[] {
	const generated: Question[] = [];
	const maxFret =
		fretRange?.max ?? (difficulty === "beginner" ? 5 : difficulty === "intermediate" ? 12 : 24);
	const minFret = fretRange?.min ?? 1;

	for (let i = 0; i < questionCount; i++) {
		if (type === "note") {
			const targetNote = NATURAL_NOTES[Math.floor(rng.random() * NATURAL_NOTES.length)];
			const allPositions = getAllPositionsOfNote(targetNote, [minFret, maxFret]);
			// For speed drills, pick one specific string to make it clearer
			const targetString = Math.floor(rng.random() * 6);
			const targetPositions = allPositions.filter((p) => p.string === targetString);
			const stringLabels = ["E", "A", "D", "G", "B", "e"];
			generated.push({
				id: `note-${i}`,
				type: "note",
				targetPositions: targetPositions.length > 0 ? targetPositions : allPositions,
				targetNote,
				targetString,
				targetStringLabel: stringLabels[targetString],
			});
		} else if (type === "note-guess" || type === "note-guess-sound") {
			let shownPosition: FretPosition;
			let targetNote: NoteName;
			do {
				const string = Math.floor(rng.random() * 6);
				const fret = Math.floor(rng.random() * maxFret) + minFret;
				shownPosition = { string, fret };
				targetNote = getNoteAtFret(shownPosition);
			} while (!NATURAL_NOTES.includes(targetNote));
			generated.push({
				id: `${type}-${i}`,
				type,
				shownPosition,
				targetNote,
				noteOptions: shuffle([...NATURAL_NOTES], rng) as string[],
			});
		} else if (type === "interval") {
			const string1 = Math.floor(rng.random() * 6);
			const fret1 = Math.floor(rng.random() * maxFret) + minFret;
			const string2 = Math.floor(rng.random() * 6);
			const fret2 = Math.floor(rng.random() * maxFret) + minFret;
			const interval = getInterval(
				{ string: string1, fret: fret1 },
				{ string: string2, fret: fret2 },
			);
			const options = shuffle(
				[
					interval,
					...shuffle(
						INTERVAL_NAMES.filter((n) => n !== interval),
						rng,
					).slice(0, 3),
				],
				rng,
			);
			generated.push({
				id: `interval-${i}`,
				type: "interval",
				targetPositions: [
					{ string: string1, fret: fret1 },
					{ string: string2, fret: fret2 },
				],
				targetInterval: interval,
				intervalOptions: options,
			});
		} else if (type === "chord") {
			const rootString = Math.floor(rng.random() * 6);
			const rootFret = Math.floor(rng.random() * maxFret) + minFret;
			const rootNote = getNoteAtFret({ string: rootString, fret: rootFret });
			const stringLabels = ["E", "A", "D", "G", "B", "e"];
			generated.push({
				id: `chord-${i}`,
				type: "chord",
				targetPositions: [{ string: rootString, fret: rootFret }],
				targetChord: `${rootNote} major`,
				targetString: rootString,
				targetStringLabel: stringLabels[rootString],
				chordTone: "Root",
			});
		}
	}
	return generated;
}

export function checkAnswer(
	question: Question,
	selectedPositions: FretPosition[],
	selectedInterval: string | null,
	selectedNote: string | null,
): Feedback {
	const correct: FretPosition[] = [];
	const incorrect: FretPosition[] = [];
	const missed: FretPosition[] = [];
	let isCorrect = false;

	if (question.type === "note") {
		for (const target of question.targetPositions) {
			if (selectedPositions.some((p) => p.string === target.string && p.fret === target.fret)) {
				correct.push(target);
			} else {
				missed.push(target);
			}
		}
		for (const sel of selectedPositions) {
			if (!question.targetPositions.some((t) => t.string === sel.string && t.fret === sel.fret)) {
				incorrect.push(sel);
			}
		}
		isCorrect = incorrect.length === 0 && missed.length === 0;
	} else if (question.type === "note-guess" || question.type === "note-guess-sound") {
		isCorrect = selectedNote === question.targetNote;
		if (isCorrect) correct.push(question.shownPosition);
		else missed.push(question.shownPosition);
	} else if (question.type === "interval") {
		if (selectedInterval === question.targetInterval) {
			correct.push(...question.targetPositions);
		} else {
			missed.push(...question.targetPositions);
		}
		isCorrect = selectedInterval === question.targetInterval;
	} else if (question.type === "chord") {
		for (const target of question.targetPositions) {
			if (selectedPositions.some((p) => p.string === target.string && p.fret === target.fret)) {
				correct.push(target);
			} else {
				missed.push(target);
			}
		}
		isCorrect = incorrect.length === 0 && missed.length === 0;
	}

	let answerLabel: string;
	if (question.type === "note") {
		answerLabel = question.targetNote;
	} else if (question.type === "note-guess" || question.type === "note-guess-sound") {
		answerLabel = question.targetNote;
	} else if (question.type === "interval") {
		answerLabel = question.targetInterval;
	} else if (question.type === "chord") {
		answerLabel = question.targetChord;
	} else {
		answerLabel = question.targetNote;
	}

	return {
		correct,
		incorrect,
		missed,
		message: isCorrect ? "Correct!" : `Incorrect. The answer was: ${answerLabel}`,
		selectedOption: selectedNote ?? selectedInterval ?? undefined,
	};
}
