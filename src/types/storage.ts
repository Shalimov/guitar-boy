import type { MistakeLog } from "@/lib/mistakeAnalysis";
import type { AccidentalPreference } from "./music";
import type { SessionRecord, SRSCard } from "./srs";

export type { AccidentalPreference } from "./music";

export interface UserSettings {
	accidentalPreference: AccidentalPreference;
	fretRange: {
		min: number;
		max: number;
	};
	/** Practice reminder settings */
	reminder?: {
		enabled: boolean;
		/** HH:mm format, e.g. "09:00" */
		time: string;
	};
}

/** Root localStorage schema for all app state */
export interface ProgressStore {
	/** Schema version for migrations */
	version: number;
	/** SRS cards keyed by card.id */
	cards: Record<string, SRSCard>;
	/** Session history sorted by date descending */
	sessionHistory: SessionRecord[];
	/** User preferences */
	settings: UserSettings;
	/** Adaptive difficulty state per quiz category */
	adaptiveState?: {
		"quiz-note"?: { effectiveFretMax: number };
		"quiz-interval"?: { effectiveFretMax: number };
		"quiz-chord"?: { effectiveFretMax: number };
		"quiz-pattern"?: { effectiveFretMax: number };
	};
	/** Tracked errors by fretboard position */
	mistakeLog?: MistakeLog;
	/** IDs of tips the user has dismissed */
	dismissedTips?: string[];
	/** Personal bests in Speed Drill mode */
	personalBests?: {
		note: number | null;
		interval: number | null;
		chord: number | null;
		pattern: number | null;
	};
}

import type { Diagram } from "./diagram";

/** localStorage schema for saved diagrams */
export interface DiagramStore {
	version: number;
	diagrams: Diagram[];
}
