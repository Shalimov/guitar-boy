import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { TinyStat } from "@/components/ui/TinyStat";
import { playCadence, playNote, playRootReference } from "@/lib/audio";
import { getTopConfusions } from "@/lib/confusionMatrix";
import { getScaleDegreeNote } from "@/lib/music";
import { getDegreeColor } from "@/lib/scaleDegreeColors";
import { buildSimpleShortcutItems } from "@/lib/shortcuts";
import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS } from "@/types/earTraining";
import { useProgressStore } from "@/hooks/useProgressStore";

const DRILL_LENGTH = 10;
const CONSECUTIVE_TO_PASS = 5;

export function ConfusionDrillMode() {
	const { getEarTraining, updateEarDegreeResult } = useProgressStore();
	const earState = getEarTraining();
	const { currentKey, confusionPairs } = earState;

	const topPairs = getTopConfusions(confusionPairs, 3);
	const activePair = topPairs[0] ?? null;

	const [sessionActive, setSessionActive] = useState(false);
	const [currentDegree, setCurrentDegree] = useState<ScaleDegree | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showFeedback, setShowFeedback] = useState<{
		correct: boolean;
		actual: ScaleDegree;
		guessed?: ScaleDegree;
	} | null>(null);
	const [sessionCorrect, setSessionCorrect] = useState(0);
	const [sessionTotal, setSessionTotal] = useState(0);
	const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

	const cadencePlayed = useRef(false);

	const playDegree = useCallback(
		async (degree: ScaleDegree) => {
			setIsPlaying(true);
			setCurrentDegree(degree);

			if (!cadencePlayed.current) {
				await playCadence(currentKey);
				cadencePlayed.current = true;
				await new Promise((r) => setTimeout(r, 400));
			}

			const note = getScaleDegreeNote(currentKey, degree);
			await playNote(note, "2n");
			setIsPlaying(false);
		},
		[currentKey],
	);

	const playRandomFromPair = useCallback(async () => {
		if (!activePair) return;
		const degree =
			Math.random() > 0.5 ? activePair.degreeA : activePair.degreeB;
		await playDegree(degree);
	}, [activePair, playDegree]);

	const startSession = useCallback(async () => {
		setSessionCorrect(0);
		setSessionTotal(0);
		setConsecutiveCorrect(0);
		setShowFeedback(null);
		setSessionActive(true);
		cadencePlayed.current = false;
		await playRandomFromPair();
	}, [playRandomFromPair]);

	const handleAnswer = useCallback(
		(guessed: ScaleDegree) => {
			if (!currentDegree || showFeedback) return;

			const correct = guessed === currentDegree;

			setShowFeedback({
				correct,
				actual: currentDegree,
				guessed: correct ? undefined : guessed,
			});

			updateEarDegreeResult(currentDegree, correct, correct ? undefined : guessed);

			const afterTotal = sessionTotal + 1;
			const afterCorrect = sessionCorrect + (correct ? 1 : 0);
			const afterConsecutive = correct ? consecutiveCorrect + 1 : 0;

			setSessionTotal(afterTotal);
			if (correct) setSessionCorrect(afterCorrect);
			setConsecutiveCorrect(afterConsecutive);

			setTimeout(() => {
				setShowFeedback(null);

				if (afterTotal >= DRILL_LENGTH || afterConsecutive >= CONSECUTIVE_TO_PASS) {
					setSessionActive(false);
				} else {
					void playRandomFromPair();
				}
			}, 1200);
		},
		[
			currentDegree,
			showFeedback,
			sessionTotal,
			sessionCorrect,
			consecutiveCorrect,
			updateEarDegreeResult,
			playRandomFromPair,
		],
	);

	const handleReplayRoot = useCallback(async () => {
		await playRootReference(currentKey);
	}, [currentKey]);

	const handleReplayNote = useCallback(async () => {
		if (!currentDegree) return;
		const note = getScaleDegreeNote(currentKey, currentDegree);
		await playNote(note, "2n");
	}, [currentDegree, currentKey]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
				return;

			if (sessionActive && !isPlaying && !showFeedback && activePair) {
				if (event.key === "1") {
					event.preventDefault();
					handleAnswer(activePair.degreeA);
					return;
				}
				if (event.key === "2") {
					event.preventDefault();
					handleAnswer(activePair.degreeB);
					return;
				}
			}

			if (event.key === "r" || event.key === "R") {
				event.preventDefault();
				void handleReplayRoot();
				return;
			}

			if (event.key === " " && currentDegree) {
				event.preventDefault();
				void handleReplayNote();
				return;
			}

			if (event.key === "Enter" && !sessionActive) {
				event.preventDefault();
				void startSession();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		sessionActive,
		isPlaying,
		showFeedback,
		activePair,
		currentDegree,
		handleAnswer,
		handleReplayRoot,
		handleReplayNote,
		startSession,
	]);

	const accuracy =
		sessionTotal > 0 ? `${Math.round((sessionCorrect / sessionTotal) * 100)}%` : "--";

	const shortcutItems = buildSimpleShortcutItems([
		{ keyLabel: "1", action: activePair?.degreeA ?? "A", id: "1" },
		{ keyLabel: "2", action: activePair?.degreeB ?? "B", id: "2" },
		{ keyLabel: "R", action: "root", id: "r" },
		{ keyLabel: "Space", action: "replay", id: "space" },
	]);

	if (!activePair) {
		return (
			<div className="space-y-6">
				<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-6 text-center shadow-[var(--gb-shadow-soft)]">
					<h2 className="text-xl font-semibold text-[var(--gb-text)]">No Confusion Pairs</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						You haven't confused any scale degrees yet. Keep practicing in Anchor Note mode,
						and if you start mixing up any degrees, come back here for targeted drills.
					</p>
				</section>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Confusion Drill</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">
							{activePair.degreeA} vs {activePair.degreeB}
						</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							You've confused {DEGREE_LABELS[activePair.degreeA]} and{" "}
							{DEGREE_LABELS[activePair.degreeB]} {activePair.count} times.
							Let's fix that.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat label="Accuracy" value={accuracy} statKey="accuracy" />
						<TinyStat
							label="Streak"
							value={`${consecutiveCorrect}/${CONSECUTIVE_TO_PASS}`}
							statKey="streak"
						/>
					</div>
				</div>

				{/* All confusion pairs */}
				{topPairs.length > 1 && (
					<>
						<hr className="my-3 border-[var(--gb-border)]" />
						<div className="flex flex-wrap gap-2">
							<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
								Top confusions
							</span>
							{topPairs.map((pair, i) => (
								<span
									key={`${pair.degreeA}-${pair.degreeB}`}
									className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
										i === 0
											? "bg-red-600 text-white"
											: "bg-[var(--gb-bg-elev)] text-[var(--gb-text-muted)]"
									}`}
								>
									{pair.degreeA} / {pair.degreeB} ({pair.count}x)
								</span>
							))}
						</div>
					</>
				)}
			</section>

			{/* Drill area */}
			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
						{sessionActive
							? isPlaying
								? "Listen..."
								: "Which one?"
							: sessionTotal > 0
								? `Session done — ${accuracy}`
								: "Ready to drill"}
					</h2>
					{sessionActive && (
						<p className="text-sm text-[var(--gb-text-muted)]">
							{sessionTotal}/{DRILL_LENGTH} questions
							{consecutiveCorrect > 0 && ` (${consecutiveCorrect} in a row)`}
						</p>
					)}
				</div>

				<div className="flex items-center justify-center">
					<div className="w-48">
						<AudioEqualizer />
					</div>
				</div>

				{/* Answer buttons */}
				{sessionActive && !isPlaying && !showFeedback ? (
					<div className="flex justify-center gap-4">
						{[activePair.degreeA, activePair.degreeB].map((degree, idx) => (
							<button
								key={degree}
								type="button"
								onClick={() => handleAnswer(degree)}
								className="flex flex-col items-center gap-1 rounded-xl border-b-4 px-6 py-4 text-white font-bold transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2"
								style={{
									backgroundColor: getDegreeColor(degree),
									borderBottomColor: `color-mix(in srgb, ${getDegreeColor(degree)} 70%, black)`,
								}}
							>
								<span className="text-2xl">{degree}</span>
								<span className="text-xs opacity-80">{DEGREE_LABELS[degree]}</span>
								<kbd className="mt-1 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[9px]">
									{idx + 1}
								</kbd>
							</button>
						))}
					</div>
				) : !sessionActive ? (
					<Button
						onClick={() => void startSession()}
						variant="primary"
						className="relative mx-auto block w-full max-w-xs border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-6 py-3 text-lg font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2"
					>
						{sessionTotal > 0 ? "Drill Again" : "Start Drill"}
						<kbd className="absolute bottom-1 right-2 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-80">
							Enter
						</kbd>
					</Button>
				) : null}

				{/* Reference buttons */}
				{sessionActive && (
					<div className="flex justify-center gap-2">
						<Button
							onClick={() => void handleReplayRoot()}
							variant="secondary"
							className="border-b-2 border-b-blue-700 bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"
						>
							Root ({currentKey}) [R]
						</Button>
						{currentDegree && (
							<Button
								onClick={() => void handleReplayNote()}
								variant="secondary"
								className="border-b-2 border-b-gray-500 bg-gray-600 px-3 py-1.5 text-xs font-bold text-white"
							>
								Replay [Space]
							</Button>
						)}
					</div>
				)}

				{showFeedback && (
					<FeedbackPanel
						isCorrect={showFeedback.correct}
						message={
							showFeedback.correct
								? `Correct! That was ${showFeedback.actual} (${DEGREE_LABELS[showFeedback.actual]})`
								: `It was ${showFeedback.actual} (${DEGREE_LABELS[showFeedback.actual]})${showFeedback.guessed ? `, you picked ${showFeedback.guessed}` : ""}`
						}
						className="mx-auto max-w-md opacity-100 translate-y-0"
					/>
				)}

				<KeyboardShortcutsBar items={shortcutItems} />
			</section>
		</div>
	);
}
