import { useCallback, useEffect, useRef, useState } from "react";
import { DegreeProgressMap } from "@/components/ear-training/DegreeProgressMap";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { PitchLadder } from "@/components/ui/PitchLadder";
import { TinyStat } from "@/components/ui/TinyStat";
import { useProgressStore } from "@/hooks/useProgressStore";
import { playCadence, playNote, playRootReference } from "@/lib/audio";
import { getHint, MAX_HINT_LEVEL } from "@/lib/hintEngine";
import { getScaleDegreeNote } from "@/lib/music";
import { getDegreeColor } from "@/lib/scaleDegreeColors";
import { buildSimpleShortcutItems } from "@/lib/shortcuts";
import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS, DEGREE_UNLOCK_ORDER } from "@/types/earTraining";
import { EarOnboarding } from "./EarOnboarding";

const QUESTIONS_PER_SESSION = 10;
const ACCURACY_THRESHOLD = 0.9;
const MIN_ATTEMPTS_TO_UNLOCK = 10;
const CADENCE_COOLDOWN_MS = 30_000;

export function AnchorNoteMode() {
	const {
		getEarTraining,
		updateEarDegreeResult,
		unlockNextDegree,
		incrementEarSessions,
		completeEarOnboarding,
	} = useProgressStore();

	const earState = getEarTraining();
	const { currentKey, unlockedDegrees, degreeStats } = earState;

	const [sessionActive, setSessionActive] = useState(false);
	const [sessionCorrect, setSessionCorrect] = useState(0);
	const [sessionTotal, setSessionTotal] = useState(0);
	const [currentDegree, setCurrentDegree] = useState<ScaleDegree | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showFeedback, setShowFeedback] = useState<{
		correct: boolean;
		actual: ScaleDegree;
		guessed?: ScaleDegree;
	} | null>(null);
	const [hintLevel, setHintLevel] = useState(0);
	const [hintText, setHintText] = useState<string | null>(null);

	const lastCadenceTime = useRef(0);

	/** Play a random degree from the unlocked set */
	const playRandomDegree = useCallback(async () => {
		setIsPlaying(true);
		setHintLevel(0);
		setHintText(null);
		const degrees = unlockedDegrees;
		const randomDegree = degrees[Math.floor(Math.random() * degrees.length)];
		setCurrentDegree(randomDegree);

		// Play cadence if enough time has passed
		const now = Date.now();
		if (now - lastCadenceTime.current > CADENCE_COOLDOWN_MS) {
			await playCadence(currentKey);
			lastCadenceTime.current = Date.now();
			// Brief pause after cadence
			await new Promise((r) => setTimeout(r, 400));
		}

		const note = getScaleDegreeNote(currentKey, randomDegree);
		await playNote(note, "2n");
		setIsPlaying(false);
	}, [unlockedDegrees, currentKey]);

	const startSession = useCallback(async () => {
		setSessionCorrect(0);
		setSessionTotal(0);
		setShowFeedback(null);
		setSessionActive(true);

		// Always play cadence at session start
		lastCadenceTime.current = 0;
		await playRandomDegree();
	}, [playRandomDegree]);

	const handleAnswer = useCallback(
		(guessedDegree: ScaleDegree) => {
			if (!currentDegree || showFeedback) return;

			const isCorrect = guessedDegree === currentDegree;

			setShowFeedback({
				correct: isCorrect,
				actual: currentDegree,
				guessed: isCorrect ? undefined : guessedDegree,
			});

			updateEarDegreeResult(currentDegree, isCorrect, isCorrect ? undefined : guessedDegree);

			const afterTotal = sessionTotal + 1;
			const afterCorrect = sessionCorrect + (isCorrect ? 1 : 0);
			setSessionTotal(afterTotal);
			if (isCorrect) setSessionCorrect(afterCorrect);

			setTimeout(() => {
				setShowFeedback(null);

				if (afterTotal >= QUESTIONS_PER_SESSION) {
					incrementEarSessions();

					// Check if we should unlock the next degree
					const allAboveThreshold = unlockedDegrees.every((deg) => {
						const stats = degreeStats[deg];
						if (!stats || stats.attempts < MIN_ATTEMPTS_TO_UNLOCK) return false;
						return stats.correct / stats.attempts >= ACCURACY_THRESHOLD;
					});

					if (allAboveThreshold && unlockedDegrees.length < DEGREE_UNLOCK_ORDER.length) {
						unlockNextDegree();
					}

					setSessionActive(false);
				} else {
					void playRandomDegree();
				}
			}, 1200);
		},
		[
			currentDegree,
			showFeedback,
			sessionTotal,
			sessionCorrect,
			unlockedDegrees,
			degreeStats,
			updateEarDegreeResult,
			incrementEarSessions,
			unlockNextDegree,
			playRandomDegree,
		],
	);

	const handleReplayNote = useCallback(async () => {
		if (!currentDegree) return;
		const note = getScaleDegreeNote(currentKey, currentDegree);
		await playNote(note, "2n");
	}, [currentDegree, currentKey]);

	const handleReplayRoot = useCallback(async () => {
		await playRootReference(currentKey);
	}, [currentKey]);

	const handleRequestHint = useCallback(async () => {
		if (!currentDegree || showFeedback) return;
		const nextLevel = Math.min(hintLevel + 1, MAX_HINT_LEVEL);
		setHintLevel(nextLevel);
		const hint = getHint(currentDegree, nextLevel, unlockedDegrees);
		if (hint) {
			setHintText(hint.text);
			// For comparison hint (level 4), play the comparison degree then the mystery note
			if (hint.comparisonDegree) {
				const compNote = getScaleDegreeNote(currentKey, hint.comparisonDegree);
				await playNote(compNote, "2n");
				await new Promise((r) => setTimeout(r, 800));
				const targetNote = getScaleDegreeNote(currentKey, currentDegree);
				await playNote(targetNote, "2n");
			}
		}
	}, [currentDegree, showFeedback, hintLevel, unlockedDegrees, currentKey]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Number keys 1-7 for degree selection during active session
			if (sessionActive && !isPlaying && !showFeedback) {
				const degreeMap: Record<string, ScaleDegree> = {
					"1": "1",
					"2": "2",
					"3": "3",
					"4": "4",
					"5": "5",
					"6": "6",
					"7": "7",
				};
				const degree = degreeMap[event.key];
				if (degree && unlockedDegrees.includes(degree)) {
					event.preventDefault();
					handleAnswer(degree);
					return;
				}
			}

			// H = request hint
			if (
				(event.key === "h" || event.key === "H") &&
				sessionActive &&
				!isPlaying &&
				!showFeedback
			) {
				event.preventDefault();
				void handleRequestHint();
				return;
			}

			// R = replay root
			if (event.key === "r" || event.key === "R") {
				event.preventDefault();
				void handleReplayRoot();
				return;
			}

			// Space = replay current note
			if (event.key === " " && currentDegree) {
				event.preventDefault();
				void handleReplayNote();
				return;
			}

			// Enter = start session
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
		currentDegree,
		unlockedDegrees,
		handleAnswer,
		handleRequestHint,
		handleReplayRoot,
		handleReplayNote,
		startSession,
	]);

	// Gate: show onboarding if not completed
	if (!earState.onboardingCompleted) {
		return <EarOnboarding onComplete={completeEarOnboarding} />;
	}

	// Computed stats
	const totalAttempts = Object.values(degreeStats).reduce((sum, s) => sum + (s?.attempts ?? 0), 0);
	const totalCorrect = Object.values(degreeStats).reduce((sum, s) => sum + (s?.correct ?? 0), 0);
	const totalAccuracy =
		totalAttempts > 0 ? `${Math.round((totalCorrect / totalAttempts) * 100)}%` : "--";
	const sessionAccuracy =
		sessionTotal > 0 ? `${Math.round((sessionCorrect / sessionTotal) * 100)}%` : "--";

	const shortcutItems = buildSimpleShortcutItems([
		{ keyLabel: "1-7", action: "pick degree", id: "nums" },
		{ keyLabel: "H", action: "hint", id: "h" },
		{ keyLabel: "R", action: "replay root", id: "r" },
		{ keyLabel: "Space", action: "replay note", id: "space" },
		{ keyLabel: "Enter", action: "start", id: "enter" },
	]);

	return (
		<div className="space-y-6">
			{/* Header Panel */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Functional Ear Training</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">
							Scale Degree Recognition
						</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Listen to the cadence, then identify which scale degree is played. Key of {currentKey}{" "}
							major.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat label="Sessions" value={String(earState.totalSessions)} statKey="sessions" />
						<TinyStat label="Accuracy" value={totalAccuracy} statKey="accuracy" />
						<TinyStat
							label="Unlocked"
							value={`${unlockedDegrees.length}/${DEGREE_UNLOCK_ORDER.length}`}
							statKey="unlocked"
						/>
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				{/* Degree pills */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							Degrees
						</span>
						<div className="flex flex-wrap gap-1 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-1 shadow-inner">
							{DEGREE_UNLOCK_ORDER.map((degree) => {
								const isUnlocked = unlockedDegrees.includes(degree);
								const stats = degreeStats[degree];
								const accuracy =
									stats && stats.attempts > 0
										? Math.round((stats.correct / stats.attempts) * 100)
										: null;

								return (
									<div
										key={degree}
										className={`flex min-w-[36px] flex-col items-center rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${
											isUnlocked
												? "text-white shadow-sm"
												: "bg-transparent text-[var(--gb-text-muted)] opacity-40 cursor-not-allowed"
										}`}
										style={isUnlocked ? { backgroundColor: getDegreeColor(degree) } : undefined}
									>
										<span>{degree}</span>
										<span className="text-[8px] font-medium opacity-80">
											{isUnlocked ? DEGREE_LABELS[degree] : ""}
										</span>
										{accuracy !== null && (
											<span className="text-[7px] opacity-70">{accuracy}%</span>
										)}
									</div>
								);
							})}
						</div>
					</div>

					<details className="group rounded-[14px] bg-[var(--gb-bg-elev)] p-3 text-xs">
						<summary className="cursor-pointer list-none flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							<span className="text-[10px] transition-transform group-open:rotate-90">&#9654;</span>
							How it works
						</summary>
						<div className="mt-2 text-[var(--gb-text-muted)]">
							<p>
								A <strong>I-IV-V-I cadence</strong> plays to establish the key. Then you hear a note
								and identify which <strong>scale degree</strong> it is.
							</p>
							<p className="mt-1">
								Start with just the root (1). Achieve {Math.round(ACCURACY_THRESHOLD * 100)}%
								accuracy over {MIN_ATTEMPTS_TO_UNLOCK}+ attempts to unlock the next degree.
							</p>
							<p className="mt-1">
								Press <strong>R</strong> anytime to replay the root note for reference. This is not
								penalized — re-anchoring is learning.
							</p>
						</div>
					</details>
				</div>
			</section>

			{/* Drill Area */}
			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-1">
							{sessionActive ? "Listen & Identify" : "Ready to Train"}
						</p>
						<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
							{sessionActive
								? isPlaying
									? "Listening..."
									: "Which scale degree?"
								: `${unlockedDegrees.length} degree${unlockedDegrees.length > 1 ? "s" : ""} unlocked`}
						</h2>
						<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
							{isPlaying
								? "A cadence establishes the key, then a note plays. Identify the degree."
								: sessionActive
									? "Pick the scale degree you just heard. Press R to replay the root."
									: `Start a ${QUESTIONS_PER_SESSION}-question session in the key of ${currentKey}.`}
						</p>
					</div>
					{sessionActive && (
						<div className="flex items-center gap-2">
							<TinyStat
								label="Progress"
								value={`${sessionTotal}/${QUESTIONS_PER_SESSION}`}
								statKey="session-progress"
							/>
							<TinyStat label="Session" value={sessionAccuracy} statKey="session-accuracy" />
						</div>
					)}
				</div>

				<div className="grid gap-5 xl:grid-cols-[auto,1fr,1fr]">
					{/* PitchLadder */}
					<div className="hidden xl:block rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-3">
						<PitchLadder
							highlightDegree={showFeedback ? showFeedback.actual : currentDegree}
							unlockedDegrees={unlockedDegrees}
							showLabels={unlockedDegrees.length <= 7}
						/>
					</div>

					{/* Middle: Visualizer + controls */}
					<div className="space-y-4">
						{/* Audio visualizer */}
						<div className="flex items-center justify-center rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-6">
							<div className="w-64">
								<AudioEqualizer />
							</div>
						</div>

						{/* Hint display */}
						{hintText && sessionActive && !showFeedback && (
							<div className="rounded-xl border border-amber-500/30 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-300">
								<span className="mr-1.5 text-xs font-bold uppercase tracking-wider opacity-60">
									Hint {hintLevel}/{MAX_HINT_LEVEL}
								</span>
								{hintText}
							</div>
						)}

						{/* Reference buttons */}
						<div className="flex gap-2">
							<Button
								onClick={() => void handleReplayRoot()}
								variant="secondary"
								className="relative flex-1 border-b-4 border-b-blue-700 bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:translate-y-0.5 active:border-b-2"
							>
								Replay Root ({currentKey})
								<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
									R
								</kbd>
							</Button>
							{currentDegree && (
								<Button
									onClick={() => void handleReplayNote()}
									variant="secondary"
									className="relative flex-1 border-b-4 border-b-gray-500 bg-gray-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-700 active:translate-y-0.5 active:border-b-2"
								>
									Replay Note
									<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
										Space
									</kbd>
								</Button>
							)}
						</div>

						{/* Hint button */}
						{sessionActive && !isPlaying && !showFeedback && hintLevel < MAX_HINT_LEVEL && (
							<Button
								onClick={() => void handleRequestHint()}
								variant="secondary"
								className="relative w-full border-b-2 border-b-amber-600 bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 active:translate-y-0.5 active:border-b-0"
							>
								Get Hint ({hintLevel}/{MAX_HINT_LEVEL})
								<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
									H
								</kbd>
							</Button>
						)}
					</div>

					{/* Right: Answer grid */}
					<div className="space-y-4">
						{sessionActive && !isPlaying ? (
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
								{unlockedDegrees.map((degree) => (
									<button
										key={degree}
										type="button"
										onClick={() => handleAnswer(degree)}
										disabled={!!showFeedback}
										className="flex flex-col items-center gap-0.5 rounded-xl border-b-4 px-3 py-3 text-white font-bold transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
										style={{
											backgroundColor: getDegreeColor(degree),
											borderBottomColor: `color-mix(in srgb, ${getDegreeColor(degree)} 70%, black)`,
										}}
									>
										<span className="text-lg">{degree}</span>
										<span className="text-[10px] font-medium opacity-80">
											{DEGREE_LABELS[degree]}
										</span>
									</button>
								))}
							</div>
						) : !sessionActive ? (
							<Button
								onClick={() => void startSession()}
								variant="primary"
								className="relative w-full border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-6 py-4 text-lg font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2"
							>
								Start Session ({QUESTIONS_PER_SESSION})
								<kbd className="absolute bottom-1 right-2 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-80">
									Enter
								</kbd>
							</Button>
						) : (
							<div className="flex items-center justify-center rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-8">
								<p className="text-sm text-[var(--gb-text-muted)] animate-pulse">
									Listen to the cadence and note...
								</p>
							</div>
						)}

						{/* Feedback */}
						{showFeedback ? (
							<FeedbackPanel
								isCorrect={showFeedback.correct}
								message={
									showFeedback.correct
										? `Correct! That was ${showFeedback.actual} (${DEGREE_LABELS[showFeedback.actual]})`
										: `It was ${showFeedback.actual} (${DEGREE_LABELS[showFeedback.actual]})${showFeedback.guessed ? `, you picked ${showFeedback.guessed}` : ""}`
								}
								className="opacity-100 translate-y-0"
							/>
						) : sessionActive && !isPlaying ? (
							<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 py-2 text-xs text-[var(--gb-text-muted)]">
								Pick the scale degree you heard. Use number keys 1-7 for quick answers.
							</div>
						) : null}

						{/* Session complete */}
						{!sessionActive && earState.totalSessions > 0 && (
							<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 text-center">
								<p className="text-sm font-medium text-[var(--gb-text)]">
									Last session: {sessionAccuracy} accuracy
								</p>
								<p className="mt-1 text-xs text-[var(--gb-text-muted)]">
									{unlockedDegrees.length < DEGREE_UNLOCK_ORDER.length
										? `Next unlock: ${DEGREE_UNLOCK_ORDER[unlockedDegrees.length]} (${DEGREE_LABELS[DEGREE_UNLOCK_ORDER[unlockedDegrees.length]]})`
										: "All degrees unlocked!"}
								</p>
							</div>
						)}
					</div>
				</div>

				<KeyboardShortcutsBar items={shortcutItems} />
			</section>

			{/* Progress Map */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<p className="gb-page-kicker mb-3">Your Progress</p>
				<DegreeProgressMap
					unlockedDegrees={unlockedDegrees}
					degreeStats={degreeStats}
					streak={earState.streak}
					totalSessions={earState.totalSessions}
				/>
			</section>
		</div>
	);
}
