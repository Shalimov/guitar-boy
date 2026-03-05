import type { FretboardState } from "./fretboard";
import type { FretPosition } from "./music";

export type LessonStepType = "explain" | "verify";

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

export type LessonStep = ExplainStep | VerifyStep;

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
