import type { NoteName } from "./music";

/** Scale degrees used in functional ear training */
export type ScaleDegree =
	| "1"
	| "b2"
	| "2"
	| "b3"
	| "3"
	| "4"
	| "b5"
	| "5"
	| "b6"
	| "6"
	| "b7"
	| "7";

/** Order in which scale degrees unlock (root -> anchors -> expanding) */
export const DEGREE_UNLOCK_ORDER: ScaleDegree[] = [
	"1",
	"5",
	"3",
	"4",
	"b7",
	"2",
	"6",
	"b3",
	"b2",
	"b5",
	"b6",
	"7",
];

/** Display labels for scale degrees */
export const DEGREE_LABELS: Record<ScaleDegree, string> = {
	"1": "Do",
	b2: "Ra",
	"2": "Re",
	b3: "Me",
	"3": "Mi",
	"4": "Fa",
	b5: "Se",
	"5": "Sol",
	b6: "Le",
	"6": "La",
	b7: "Te",
	"7": "Ti",
};

/** Solfege-style short labels */
export const DEGREE_SHORT_LABELS: Record<ScaleDegree, string> = {
	"1": "1",
	b2: "b2",
	"2": "2",
	b3: "b3",
	"3": "3",
	"4": "4",
	b5: "b5",
	"5": "5",
	b6: "b6",
	"6": "6",
	b7: "b7",
	"7": "7",
};

/** Stats tracked per scale degree */
export interface DegreeStats {
	attempts: number;
	correct: number;
	lastDate: string;
}

/** A pair of degrees the user frequently confuses */
export interface ConfusionPair {
	degreeA: ScaleDegree;
	degreeB: ScaleDegree;
	count: number;
	lastDrilled: string;
}

/** Phases of the ear training journey */
export type EarTrainingPhase = "easy-wins" | "anchor-building" | "expanding" | "mastery";

/** Streak tracking for ear training */
export interface EarStreak {
	current: number;
	best: number;
	/** ISO date of last ear training session */
	lastDate: string;
}

/** Mastery level for badge display */
export type MasteryLevel = "none" | "bronze" | "silver" | "gold";

/** Persisted ear training state */
export interface EarTrainingState {
	currentKey: NoteName;
	unlockedDegrees: ScaleDegree[];
	degreeStats: Partial<Record<ScaleDegree, DegreeStats>>;
	confusionPairs: ConfusionPair[];
	totalSessions: number;
	onboardingCompleted: boolean;
	currentPhase: EarTrainingPhase;
	streak?: EarStreak;
}

/** Default state for new users */
export function getInitialEarTrainingState(): EarTrainingState {
	return {
		currentKey: "C",
		unlockedDegrees: ["1"],
		degreeStats: {},
		confusionPairs: [],
		totalSessions: 0,
		onboardingCompleted: false,
		currentPhase: "anchor-building",
	};
}

/** Determine mastery level for a degree based on its stats */
export function getDegreeMastery(stats: DegreeStats | undefined): MasteryLevel {
	if (!stats || stats.attempts === 0) return "none";
	const accuracy = stats.correct / stats.attempts;
	if (accuracy >= 0.95 && stats.attempts >= 100) return "gold";
	if (accuracy >= 0.85 && stats.attempts >= 50) return "silver";
	if (accuracy >= 0.7 && stats.attempts >= 20) return "bronze";
	return "none";
}
