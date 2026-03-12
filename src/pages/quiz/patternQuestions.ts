import { scalePatterns } from "@/data/patterns/scales";
import { shuffle } from "@/lib/rng";
import type { FretPosition } from "@/types";

export interface PatternCompleteQuestion {
	id: string;
	type: "pattern-complete";
	/** Name of the pattern (e.g., "C Major Pentatonic - Position 1") */
	patternName: string;
	/** Positions shown to the user (partial shape) */
	shownPositions: FretPosition[];
	/** Positions the user needs to find (hidden part) */
	targetPositions: FretPosition[];
	/** All positions in the complete pattern */
	allPositions: FretPosition[];
}

export interface PatternNameQuestion {
	id: string;
	type: "pattern-name";
	/** All positions shown on the fretboard */
	shownPositions: FretPosition[];
	/** The correct pattern name */
	correctName: string;
	/** Multiple choice options */
	nameOptions: string[];
}

export type PatternQuestion = PatternCompleteQuestion | PatternNameQuestion;

/**
 * Generate pattern recognition questions from the pattern library.
 */
export function generatePatternQuestions(
	questionCount: number,
	questionType: "complete" | "name" | "mixed",
): PatternQuestion[] {
	const questions: PatternQuestion[] = [];
	const patterns = [...scalePatterns];

	for (let i = 0; i < questionCount; i++) {
		const type = questionType === "mixed" ? (i % 2 === 0 ? "complete" : "name") : questionType;

		const pattern = patterns[Math.floor(Math.random() * patterns.length)];
		const allPositions = pattern.fretboardState.dots.map((d) => d.position);

		if (type === "complete") {
			// Remove 30-50% of positions randomly
			const shuffledPos = shuffle([...allPositions]);
			const removeCount = Math.max(
				1,
				Math.floor(allPositions.length * (0.3 + Math.random() * 0.2)),
			);

			const targetPositions = shuffledPos.slice(0, removeCount);
			const shownPositions = shuffledPos.slice(removeCount);

			questions.push({
				id: `pattern-comp-${i}-${Date.now()}`,
				type: "pattern-complete",
				patternName: pattern.name,
				shownPositions,
				targetPositions,
				allPositions,
			});
		} else {
			// Name question
			const correctName = pattern.name;
			const otherNames = patterns.filter((p) => p.name !== correctName).map((p) => p.name);

			const shuffledOthers = shuffle([...otherNames]);
			const options = shuffle([correctName, ...shuffledOthers.slice(0, 3)]);

			questions.push({
				id: `pattern-name-${i}-${Date.now()}`,
				type: "pattern-name",
				shownPositions: allPositions,
				correctName,
				nameOptions: options,
			});
		}
	}

	return questions;
}

/**
 * Check a pattern-complete answer.
 */
export function checkPatternCompleteAnswer(
	question: PatternCompleteQuestion,
	selectedPositions: FretPosition[],
): { correct: FretPosition[]; missed: FretPosition[]; incorrect: FretPosition[] } {
	const correct: FretPosition[] = [];
	const missed: FretPosition[] = [];
	const incorrect: FretPosition[] = [];

	const isTarget = (pos: FretPosition) =>
		question.targetPositions.some((p) => p.string === pos.string && p.fret === pos.fret);

	const isShown = (pos: FretPosition) =>
		question.shownPositions.some((p) => p.string === pos.string && p.fret === pos.fret);

	for (const sel of selectedPositions) {
		if (isTarget(sel)) {
			correct.push(sel);
		} else if (!isShown(sel)) {
			incorrect.push(sel);
		}
		// If they click a shown position, we ignore it as correct or incorrect for the user's score
	}

	for (const target of question.targetPositions) {
		const wasSelected = selectedPositions.some(
			(p) => p.string === target.string && p.fret === target.fret,
		);
		if (!wasSelected) {
			missed.push(target);
		}
	}

	return { correct, missed, incorrect };
}

/**
 * Check a pattern-name answer.
 */
export function checkPatternNameAnswer(
	question: PatternNameQuestion,
	selectedName: string,
): boolean {
	return selectedName === question.correctName;
}
