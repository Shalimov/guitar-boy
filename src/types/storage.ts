import type { SessionRecord, SRSCard } from "./srs";

/** User preferences for display and interaction */
export type AccidentalPreference = "sharp" | "flat";

export interface UserSettings {
	accidentalPreference: AccidentalPreference;
	fretRange: {
		min: number;
		max: number;
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
}

import type { Diagram } from "./diagram";

/** localStorage schema for saved diagrams */
export interface DiagramStore {
	version: number;
	diagrams: Diagram[];
}
