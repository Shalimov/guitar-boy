import { useCallback } from "react";
import type { Diagram, DiagramStore } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

const INITIAL_STORE: DiagramStore = {
	version: 1,
	diagrams: [],
};

/**
 * Hook for managing diagram store (saved fretboard diagrams)
 */
export function useDiagramStore() {
	const [store, setStore] = useLocalStorage<DiagramStore>(
		"guitar-boy-diagrams",
		INITIAL_STORE,
		migrateDiagramStore,
	);

	const addDiagram = useCallback(
		(diagram: Diagram) => {
			setStore((prev) => ({
				...prev,
				diagrams: [...prev.diagrams, diagram],
			}));
		},
		[setStore],
	);

	const updateDiagram = useCallback(
		(diagram: Diagram) => {
			setStore((prev) => ({
				...prev,
				diagrams: prev.diagrams.map((d) => (d.id === diagram.id ? diagram : d)),
			}));
		},
		[setStore],
	);

	const deleteDiagram = useCallback(
		(id: string) => {
			setStore((prev) => ({
				...prev,
				diagrams: prev.diagrams.filter((d) => d.id !== id || d.isBuiltIn),
			}));
		},
		[setStore],
	);

	const getDiagram = useCallback(
		(id: string): Diagram | undefined => {
			return store.diagrams.find((d) => d.id === id);
		},
		[store.diagrams],
	);

	const getUserDiagrams = useCallback((): Diagram[] => {
		return store.diagrams.filter((d) => !d.isBuiltIn);
	}, [store.diagrams]);

	const getBuiltInDiagrams = useCallback((): Diagram[] => {
		return store.diagrams.filter((d) => d.isBuiltIn);
	}, [store.diagrams]);

	return {
		store,
		addDiagram,
		updateDiagram,
		deleteDiagram,
		getDiagram,
		getUserDiagrams,
		getBuiltInDiagrams,
	};
}

function migrateDiagramStore(data: unknown, fromVersion: number): DiagramStore {
	let store = data as DiagramStore;

	if (fromVersion < 1) {
		store = {
			version: 1,
			diagrams: [],
		};
	}

	return store;
}
