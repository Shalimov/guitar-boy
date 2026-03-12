import type { FretboardState } from "./fretboard";
import type { FretPosition } from "./music";

export type LessonStepType = "explain" | "verify" | "teach-back";

export interface ExplainStep {
	type: "explain";
	title: string;
	content: string;
	fretboardState?: FretboardState;
}

export interface VerifyStep {
	type: "verify";
	instruction: string;
	targetPositions: FretPosition[];
	fretboardState?: FretboardState;
}

export interface TeachBackStep {
	type: "teach-back";
	/** Instruction for the user, e.g. "Label all open string notes from memory" */
	instruction: string;
	/** The correct labels the user should produce */
	expectedLabels: Array<{
		position: FretPosition;
		label: string;
	}>;
	/** Optional fretboard state for context (e.g., show string labels) */
	fretboardState?: FretboardState;
}

export type LessonStep = ExplainStep | VerifyStep | TeachBackStep;

export interface Lesson {
	id: string;
	title: string;
	description: string;
	category: "notes" | "intervals" | "chords" | "patterns";
	difficulty: "beginner" | "intermediate" | "advanced";
	steps: LessonStep[];
}

export interface LessonProgress {
	lessonId: string;
	completedSteps: number[];
	isCompleted: boolean;
}
