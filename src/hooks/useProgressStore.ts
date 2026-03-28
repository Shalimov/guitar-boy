import { useCallback } from "react";
import { computeAdaptiveConfig } from "@/lib/adaptiveDifficulty";
import { recordConfusion } from "@/lib/confusionMatrix";
import { EMPTY_MISTAKE_LOG, recordErrors } from "@/lib/mistakeAnalysis";
import { getDueCards as getDueCardsUtil } from "@/lib/srs";
import type { FretPosition, ProgressStore, SessionRecord, SRSCard, UserSettings } from "@/types";
import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_UNLOCK_ORDER, getInitialEarTrainingState } from "@/types/earTraining";
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

	const getEarTraining = useCallback(() => {
		return store.earTraining ?? getInitialEarTrainingState();
	}, [store.earTraining]);

	const updateEarDegreeResult = useCallback(
		(degree: ScaleDegree, correct: boolean, answeredAs?: ScaleDegree) => {
			setStore((prev) => {
				const ear = prev.earTraining ?? getInitialEarTrainingState();
				const today = new Date().toISOString().slice(0, 10);
				const existing = ear.degreeStats[degree] ?? { attempts: 0, correct: 0, lastDate: today };

				const updatedStats = {
					...ear.degreeStats,
					[degree]: {
						attempts: existing.attempts + 1,
						correct: existing.correct + (correct ? 1 : 0),
						lastDate: today,
					},
				};

				const updatedPairs =
					!correct && answeredAs && answeredAs !== degree
						? recordConfusion(ear.confusionPairs, degree, answeredAs)
						: ear.confusionPairs;

				return {
					...prev,
					earTraining: {
						...ear,
						degreeStats: updatedStats,
						confusionPairs: updatedPairs,
					},
				};
			});
		},
		[setStore],
	);

	const unlockNextDegree = useCallback(() => {
		setStore((prev) => {
			const ear = prev.earTraining ?? getInitialEarTrainingState();
			const currentCount = ear.unlockedDegrees.length;
			if (currentCount >= DEGREE_UNLOCK_ORDER.length) return prev;

			const nextDegree = DEGREE_UNLOCK_ORDER[currentCount];
			return {
				...prev,
				earTraining: {
					...ear,
					unlockedDegrees: [...ear.unlockedDegrees, nextDegree],
				},
			};
		});
	}, [setStore]);

	const incrementEarSessions = useCallback(() => {
		setStore((prev) => {
			const ear = prev.earTraining ?? getInitialEarTrainingState();
			const today = new Date().toISOString().slice(0, 10);
			const streak = ear.streak ?? { current: 0, best: 0, lastDate: "" };

			// Compute new streak
			let newCurrent = streak.current;
			if (streak.lastDate === today) {
				// Already practiced today, no change
			} else {
				const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
				newCurrent = streak.lastDate === yesterday ? streak.current + 1 : 1;
			}
			const newBest = Math.max(streak.best, newCurrent);

			return {
				...prev,
				earTraining: {
					...ear,
					totalSessions: ear.totalSessions + 1,
					streak: { current: newCurrent, best: newBest, lastDate: today },
				},
			};
		});
	}, [setStore]);

	const updateEarKey = useCallback(
		(key: import("@/types").NoteName) => {
			setStore((prev) => {
				const ear = prev.earTraining ?? getInitialEarTrainingState();
				return {
					...prev,
					earTraining: { ...ear, currentKey: key },
				};
			});
		},
		[setStore],
	);

	const completeEarOnboarding = useCallback(
		(unlockedDegrees: import("@/types/earTraining").ScaleDegree[]) => {
			setStore((prev) => {
				const ear = prev.earTraining ?? getInitialEarTrainingState();
				return {
					...prev,
					earTraining: {
						...ear,
						onboardingCompleted: true,
						unlockedDegrees,
					},
				};
			});
		},
		[setStore],
	);

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
		getEarTraining,
		updateEarDegreeResult,
		unlockNextDegree,
		incrementEarSessions,
		updateEarKey,
		completeEarOnboarding,
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

	if (fromVersion < 2) {
		store = {
			...store,
			version: 2,
			earTraining: store.earTraining ?? getInitialEarTrainingState(),
		};
	}

	return store;
}
