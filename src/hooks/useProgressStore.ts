import { useCallback } from "react";
import type { ProgressStore, SessionRecord, SRSCard, UserSettings } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const INITIAL_STORE: ProgressStore = {
	version: 1,
	cards: {},
	sessionHistory: [],
	settings: {
		accidentalPreference: "sharp",
		fretRange: { min: 1, max: 15 },
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
			setStore((prev) => ({
				...prev,
				sessionHistory: [session, ...prev.sessionHistory].slice(0, 100),
			}));
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

	return {
		store,
		updateCard,
		addSession,
		updateSettings,
		getCard,
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
