import { useCallback, useRef, useState } from "react";
import type { FretboardState } from "@/types";

interface HistoryEntry {
	fretboardState: FretboardState;
	timestamp: number;
}

export function useDiagramHistory(initialState: FretboardState) {
	const [currentState, setCurrentState] = useState<FretboardState>(initialState);
	const historyRef = useRef<HistoryEntry[]>([
		{ fretboardState: initialState, timestamp: Date.now() },
	]);
	const historyIndexRef = useRef(0);
	const maxHistoryLength = 50;

	const canUndo = historyIndexRef.current > 0;
	const canRedo = historyIndexRef.current < historyRef.current.length - 1;

	const updateState = useCallback((newState: FretboardState) => {
		const now = Date.now();
		const entry: HistoryEntry = { fretboardState: newState, timestamp: now };

		const currentHistory = historyRef.current;
		const currentIndex = historyIndexRef.current;

		const truncatedHistory = currentHistory.slice(0, currentIndex + 1);
		truncatedHistory.push(entry);

		if (truncatedHistory.length > maxHistoryLength) {
			truncatedHistory.shift();
		} else {
			historyIndexRef.current += 1;
		}

		historyRef.current = truncatedHistory;
		setCurrentState(newState);
	}, []);

	const undo = useCallback(() => {
		if (historyIndexRef.current <= 0) {
			return;
		}

		historyIndexRef.current -= 1;
		const entry = historyRef.current[historyIndexRef.current];
		setCurrentState(entry.fretboardState);
	}, []);

	const redo = useCallback(() => {
		if (historyIndexRef.current >= historyRef.current.length - 1) {
			return;
		}

		historyIndexRef.current += 1;
		const entry = historyRef.current[historyIndexRef.current];
		setCurrentState(entry.fretboardState);
	}, []);

	const reset = useCallback((newInitialState: FretboardState) => {
		historyRef.current = [{ fretboardState: newInitialState, timestamp: Date.now() }];
		historyIndexRef.current = 0;
		setCurrentState(newInitialState);
	}, []);

	return {
		currentState,
		updateState,
		undo,
		redo,
		reset,
		canUndo,
		canRedo,
	};
}
