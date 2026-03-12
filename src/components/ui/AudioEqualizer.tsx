import { useEffect, useRef, useState } from "react";
import { getEqualizerLevels, subscribeToPlaybackState } from "@/lib/audio";

const BAR_COUNT = 22;
const CANVAS_HEIGHT = 72;

export function AudioEqualizer() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const frameRef = useRef<number | null>(null);
	const levelsRef = useRef<number[]>(Array.from({ length: BAR_COUNT }, () => 0));
	const playingRef = useRef(false);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		return subscribeToPlaybackState((next) => {
			playingRef.current = next;
			setIsPlaying(next);
		});
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext("2d");
		if (!context) return;

		let previous = performance.now();

		const draw = (now: number) => {
			const dt = Math.max(0.5, now - previous);
			previous = now;

			const dpr = window.devicePixelRatio || 1;
			const width = Math.max(260, canvas.clientWidth || 320);
			const height = CANVAS_HEIGHT;

			canvas.width = Math.floor(width * dpr);
			canvas.height = Math.floor(height * dpr);
			canvas.style.height = `${height}px`;
			context.setTransform(dpr, 0, 0, dpr, 0, 0);

			context.clearRect(0, 0, width, height);
			context.fillStyle = "rgba(0,0,0,0.08)";
			context.fillRect(0, 0, width, height);

			const styles = getComputedStyle(document.documentElement);
			const accentColor = styles.getPropertyValue("--gb-accent").trim() || "#b35d2a";
			const idleColor = "rgba(255,255,255,0.26)";

			const gap = 4;
			const barWidth = (width - gap * (BAR_COUNT - 1)) / BAR_COUNT;
			const baseY = height - 10;
			const analyserLevels = getEqualizerLevels(BAR_COUNT);
			const isActivelyPlaying = playingRef.current;

			for (let index = 0; index < BAR_COUNT; index += 1) {
				const liveLevel = analyserLevels[index] ?? 0;
				const boosted = Math.min(1, liveLevel ** 0.62 * 1.85);
				const floor = isActivelyPlaying ? 0.1 : 0.015;
				const target = Math.max(floor, boosted);
				const smoothing = isActivelyPlaying ? 0.35 : 0.1;
				const next = levelsRef.current[index] + (target - levelsRef.current[index]) * smoothing;
				const decay = isActivelyPlaying ? 0.96 : 0.92;
				levelsRef.current[index] = next;
				levelsRef.current[index] *= decay ** (dt / 16);

				const barHeight = Math.max(2, levelsRef.current[index] * (height - 16));
				const x = index * (barWidth + gap);

				context.fillStyle = isActivelyPlaying ? accentColor : idleColor;
				context.fillRect(x, baseY - barHeight, barWidth, barHeight);
			}

			frameRef.current = window.requestAnimationFrame(draw);
		};

		frameRef.current = window.requestAnimationFrame(draw);

		return () => {
			if (frameRef.current) {
				window.cancelAnimationFrame(frameRef.current);
			}
		};
	}, []);

	return (
		<div className="space-y-2">
			<div className="text-xs font-semibold" style={{ color: "var(--gb-text-muted)" }}>
				{isPlaying ? "Playing..." : "Ready"}
			</div>
			<canvas
				ref={canvasRef}
				className="w-full rounded-lg border border-[var(--gb-border)] bg-black/20"
				height={CANVAS_HEIGHT}
			/>
		</div>
	);
}
