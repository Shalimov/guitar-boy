import { useCallback, useEffect, useRef, useState } from "react";

interface UseQuizTimerOptions {
	enabled: boolean;
	seconds: number;
	onTimeout: () => void;
	paused?: boolean;
}

export function useQuizTimer({ enabled, seconds, onTimeout, paused = false }: UseQuizTimerOptions) {
	const [timeLeft, setTimeLeft] = useState(seconds);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const onTimeoutRef = useRef(onTimeout);
	const secondsRef = useRef(seconds);

	useEffect(() => {
		onTimeoutRef.current = onTimeout;
	}, [onTimeout]);

	useEffect(() => {
		secondsRef.current = seconds;
	}, [seconds]);

	useEffect(() => {
		if (!enabled || paused) return;

		setTimeLeft(secondsRef.current);

		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					timerRef.current = null;
					onTimeoutRef.current();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [enabled, paused]);

	const resetTimer = useCallback(() => {
		setTimeLeft(seconds);
	}, [seconds]);

	return { timeLeft, resetTimer };
}
