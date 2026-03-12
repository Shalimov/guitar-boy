import { useCallback } from "react";
import { computeAdaptiveConfig } from "@/lib/adaptiveDifficulty";
import { EMPTY_MISTAKE_LOG, recordErrors } from "@/lib/mistakeAnalysis";
import { getDueCards as getDueCardsUtil } from "@/lib/srs";
import type { FretPosition, ProgressStore, SessionRecord, SRSCard, UserSettings } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const INITIAL_STORE: ProgressStore = {
	version: 1,
	cards: {},
	sessionHistory: [],
	settings: {
		accidentalPreference: "sharp",
		fretRange: { min: 1, max: 15 },
		reminder: { enabled: false, time: "09:00" },
	},
};

/**
 * Hook for managing progress store (SRS cards, sessions, settings)
 */
export function useProgressStore() {
	const [store, setStore] = useLocalStorage<ProgressStore>(
		"guitar-boy-progress",
		INITIAL_STORE,
		migrateProgressStore,
	);

	const updateCard = useCallback(
		(card: SRSCard) => {
			setStore((prev) => ({
				...prev,
				cards: { ...prev.cards, [card.id]: card },
			}));
		},
		[setStore],
	);

	const addSession = useCallback(
		(session: SessionRecord) => {
			setStore((prev) => {
				const newHistory = [session, ...prev.sessionHistory].slice(0, 100);

				// Recompute adaptive difficulty if it's a quiz mode
				const isQuizMode =
					session.mode === "quiz-note" ||
					session.mode === "quiz-interval" ||
					session.mode === "quiz-chord";

				if (!isQuizMode) {
					return { ...prev, sessionHistory: newHistory };
				}

				const modeKey = session.mode as "quiz-note" | "quiz-interval" | "quiz-chord";
				const currentFretMax = prev.adaptiveState?.[modeKey]?.effectiveFretMax ?? 5;
				const adaptive = computeAdaptiveConfig(newHistory, session.mode, currentFretMax);

				return {
					...prev,
					sessionHistory: newHistory,
					adaptiveState: {
						...(prev.adaptiveState || {}),
						[modeKey]: { effectiveFretMax: adaptive.effectiveFretMax },
					},
				};
			});
		},
		[setStore],
	);

	const updateAdaptiveState = useCallback(
		(mode: "quiz-note" | "quiz-interval" | "quiz-chord", effectiveFretMax: number) => {
			setStore((prev) => ({
				...prev,
				adaptiveState: {
					...(prev.adaptiveState || {}),
					[mode]: { effectiveFretMax },
				},
			}));
		},
		[setStore],
	);

	const recordMistakes = useCallback(
		(positions: FretPosition[]) => {
			setStore((prev) => ({
				...prev,
				mistakeLog: recordErrors(prev.mistakeLog ?? EMPTY_MISTAKE_LOG, positions),
			}));
		},
		[setStore],
	);

	const dismissTip = useCallback(
		(tipId: string) => {
			setStore((prev) => ({
				...prev,
				dismissedTips: [...(prev.dismissedTips || []), tipId],
			}));
		},
		[setStore],
	);

	const updatePersonalBest = useCallback(
		(category: "note" | "interval" | "chord" | "pattern", score: number) => {
			setStore((prev) => {
				const current = prev.personalBests?.[category] ?? 0;
				if (score <= current) return prev;
				return {
					...prev,
					personalBests: {
						...(prev.personalBests || { note: 0, interval: 0, chord: 0, pattern: 0 }),
						[category]: score,
					},
				};
			});
		},
		[setStore],
	);

	const updateSettings = useCallback(
		(settings: Partial<UserSettings>) => {
			setStore((prev) => ({
				...prev,
				settings: { ...prev.settings, ...settings },
			}));
		},
		[setStore],
	);

	const getCard = useCallback(
		(id: string): SRSCard | undefined => {
			return store.cards[id];
		},
		[store.cards],
	);

	const getDueCards = useCallback((): SRSCard[] => {
		return getDueCardsUtil(store.cards);
	}, [store.cards]);

	return {
		store,
		updateCard,
		addSession,
		updateSettings,
		getCard,
		getDueCards,
		updateAdaptiveState,
		recordMistakes,
		dismissTip,
		updatePersonalBest,
	};
}

function migrateProgressStore(data: unknown, fromVersion: number): ProgressStore {
	let store = data as ProgressStore;

	if (fromVersion < 1) {
		store = {
			version: 1,
			cards: {},
			sessionHistory: [],
			settings: {
				accidentalPreference: "sharp",
				fretRange: { min: 1, max: 15 },
			},
		};
	}

	return store;
}
