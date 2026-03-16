import { useCallback, useEffect, useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { TinyStat } from "@/components/ui/TinyStat";
import { playFretPosition } from "@/lib/audio";
import { getAllPositionsOfNote } from "@/lib/music";
import { buildSimpleShortcutItems } from "@/lib/shortcuts";
import type { FretPosition, NoteName } from "@/types";

const ANCHOR_NOTE_SEQUENCE: NoteName[] = ["A", "E", "D", "G", "B", "C", "F"];
const ACCIDENTAL_NOTES: NoteName[] = ["C#/Db", "F#/Gb", "A#/Bb", "D#/Eb", "G#/Ab"];
const ALL_NOTES: readonly NoteName[] = [...ANCHOR_NOTE_SEQUENCE, ...ACCIDENTAL_NOTES];
const FRET_RANGE: [number, number] = [0, 12];
const QUESTIONS_PER_SESSION = 10;
const ACCURACY_THRESHOLD = 0.9;
const _SESSIONS_TO_UNLOCK = 3;

interface AnchorProgress {
	unlockedNotes: number;
	correctCount: number;
	totalCount: number;
	sessionsCompleted: number;
}

function getInitialProgress(): AnchorProgress {
	return {
		unlockedNotes: 1,
		correctCount: 0,
		totalCount: 0,
		sessionsCompleted: 0,
	};
}

export function AnchorNoteMode() {
	const [progress, setProgress] = useState<AnchorProgress>(getInitialProgress);
	const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentPosition, setCurrentPosition] = useState<FretPosition | null>(null);
	const [sessionCorrect, setSessionCorrect] = useState(0);
	const [sessionTotal, setSessionTotal] = useState(0);
	const [showFeedback, setShowFeedback] = useState<"yes" | "no" | null>(null);
	const [sessionActive, setSessionActive] = useState(false);

	const currentNote = ALL_NOTES[currentNoteIndex];
	const notePositions = getAllPositionsOfNote(currentNote, FRET_RANGE);
	const isUnlocked = currentNoteIndex < progress.unlockedNotes;

	const playRandomNote = useCallback(async () => {
		if (notePositions.length === 0) return;

		const randomIndex = Math.floor(Math.random() * notePositions.length);
		const position = notePositions[randomIndex];
		setCurrentPosition(position);
		await playFretPosition(position, "2n");
		setIsPlaying(false);
	}, [notePositions]);

	const startSession = useCallback(() => {
		setSessionCorrect(0);
		setSessionTotal(0);
		setShowFeedback(null);
		setSessionActive(true);
		setIsPlaying(true);
		void playRandomNote();
	}, [playRandomNote]);

	const handleAnswer = useCallback(
		(isYes: boolean) => {
			if (!currentPosition) return;

			const isPlayedNoteAnchor = notePositions.some(
				(pos) => pos.string === currentPosition.string && pos.fret === currentPosition.fret,
			);
			const isCorrect = isYes === isPlayedNoteAnchor;

			setShowFeedback(isCorrect ? "yes" : "no");

			const afterTotal = sessionTotal + 1;
			const afterCorrect = sessionCorrect + (isCorrect ? 1 : 0);

			setSessionTotal(afterTotal);
			if (isCorrect) {
				setSessionCorrect(afterCorrect);
			}

			setTimeout(() => {
				setShowFeedback(null);
				if (afterTotal >= QUESTIONS_PER_SESSION) {
					const accuracy = afterCorrect / afterTotal;

					setProgress((prev) => ({
						...prev,
						correctCount: prev.correctCount + afterCorrect,
						totalCount: prev.totalCount + afterTotal,
						sessionsCompleted: prev.sessionsCompleted + 1,
						unlockedNotes:
							accuracy >= ACCURACY_THRESHOLD
								? Math.min(prev.unlockedNotes + 1, ALL_NOTES.length)
								: prev.unlockedNotes,
					}));
					setSessionActive(false);
				} else {
					setIsPlaying(true);
					void playRandomNote();
				}
			}, 1000);
		},
		[currentPosition, notePositions, sessionTotal, sessionCorrect, playRandomNote],
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return;
			}

			if (sessionActive && !isPlaying && !showFeedback) {
				if (event.key === "y" || event.key === "Y" || event.key === "ArrowLeft") {
					event.preventDefault();
					handleAnswer(true);
					return;
				}
				if (event.key === "n" || event.key === "N" || event.key === "ArrowRight") {
					event.preventDefault();
					handleAnswer(false);
					return;
				}
			}

			if (event.key === " " && currentPosition) {
				event.preventDefault();
				void playFretPosition(currentPosition, "2n");
				return;
			}

			if (event.key === "Enter" && !sessionActive && isUnlocked) {
				event.preventDefault();
				startSession();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		sessionActive,
		isPlaying,
		showFeedback,
		currentPosition,
		isUnlocked,
		startSession,
		handleAnswer,
	]);

	const totalAccuracy =
		progress.totalCount > 0 ? Math.round((progress.correctCount / progress.totalCount) * 100) : 0;
	const totalAccuracyDisplay = progress.totalCount > 0 ? `${totalAccuracy}%` : "--";
	const sessionAccuracy =
		sessionTotal > 0 ? `${Math.round((sessionCorrect / sessionTotal) * 100)}%` : "--";
	const shortcutItems = buildSimpleShortcutItems([
		{ keyLabel: "Y", action: "yes", id: "y" },
		{ keyLabel: "N", action: "no", id: "n" },
		{ keyLabel: "Space", action: "replay", id: "space" },
		{ keyLabel: "Enter", action: "start", id: "enter" },
	]);

	return (
		<div className="space-y-6">
			{/* ── Section 1: Header Panel ── */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Anchor Note Training</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">
							Master One Note at a Time
						</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Learn to recognize a single note deeply before moving to the next.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat
							label="Sessions"
							value={String(progress.sessionsCompleted)}
							statKey="sessions"
						/>
						<TinyStat label="Accuracy" value={totalAccuracyDisplay} statKey="accuracy" />
						<TinyStat
							label="Unlocked"
							value={`${progress.unlockedNotes}/${ALL_NOTES.length}`}
							statKey="unlocked"
						/>
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							Anchor
						</span>
						<div className="flex flex-wrap gap-1 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-1 shadow-inner">
							{ALL_NOTES.map((note, index) => (
								<button
									key={note}
									type="button"
									onClick={() => {
										if (index < progress.unlockedNotes) {
											setCurrentNoteIndex(index);
											setSessionActive(false);
										}
									}}
									disabled={index >= progress.unlockedNotes}
									className={`min-w-[28px] rounded-md px-2 py-1.5 text-[11px] font-bold transition-all ${
										index === currentNoteIndex
											? "bg-[var(--gb-accent)] text-white shadow-sm ring-1 ring-[var(--gb-accent-strong)]"
											: index < progress.unlockedNotes
												? "bg-green-600/90 text-white shadow-sm hover:bg-green-600"
												: "bg-transparent text-[var(--gb-text-muted)] opacity-40 cursor-not-allowed"
									}`}
								>
									{note}
								</button>
							))}
						</div>
					</div>

					<details className="group rounded-[14px] bg-[var(--gb-bg-elev)] p-3 text-xs">
						<summary className="cursor-pointer list-none flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							<span className="text-[10px] transition-transform group-open:rotate-90">&#9654;</span>
							How it works
						</summary>
						<div className="mt-2 text-[var(--gb-text-muted)]">
							<p>
								Start with <strong>A</strong> as your anchor note. Listen to notes and identify if
								they match your anchor.
							</p>
							<p className="mt-1">
								Achieve 90% accuracy over {QUESTIONS_PER_SESSION} questions to unlock the next note
								in the sequence.
							</p>
						</div>
					</details>
				</div>
			</section>

			{/* ── Section 2: Drill Area ── */}
			{isUnlocked ? (
				<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
					<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="gb-page-kicker mb-1">Current Drill</p>
							<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
								{sessionActive ? `Is this ${currentNote}?` : `Ready to train ${currentNote}`}
							</h2>
							<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
								{isPlaying
									? "Listen carefully to the note being played..."
									: sessionActive
										? "Decide whether the note you just heard matches your anchor."
										: `Start a ${QUESTIONS_PER_SESSION}-question session to test your recognition of ${currentNote}.`}
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

					<div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
						{/* Left: Fretboard */}
						<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 md:p-5">
							<Fretboard
								fretRange={FRET_RANGE}
								mode="view"
								showNoteNames={true}
								targetPositions={currentPosition ? [currentPosition] : []}
							/>
							<div className="mt-3 flex items-center justify-center">
								<div className="w-48">
									<AudioEqualizer />
								</div>
							</div>
						</div>

						{/* Right: Answer controls */}
						<div className="space-y-4">
							{/* Status */}
							<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 text-center">
								<p className="text-2xl font-bold text-[var(--gb-text)]">{currentNote}</p>
								<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
									{isPlaying
										? "Listening..."
										: sessionActive
											? "Is this your anchor note?"
											: "Ready to begin"}
								</p>
							</div>

							{/* Yes/No buttons */}
							{sessionActive && !isPlaying && (
								<div className="flex justify-center gap-3">
									<Button
										onClick={() => handleAnswer(true)}
										variant="primary"
										className="relative min-w-[100px] border-b-4 border-b-green-800 bg-green-600 px-5 py-2.5 text-base font-bold hover:bg-green-700 active:translate-y-0.5 active:border-b-2"
										disabled={showFeedback !== null}
									>
										Yes
										<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
											Y
										</kbd>
									</Button>
									<Button
										onClick={() => handleAnswer(false)}
										variant="primary"
										className="relative min-w-[100px] border-b-4 border-b-red-800 bg-red-600 px-5 py-2.5 text-base font-bold hover:bg-red-700 active:translate-y-0.5 active:border-b-2"
										disabled={showFeedback !== null}
									>
										No
										<kbd className="absolute bottom-1 right-1.5 rounded bg-black/20 px-1 py-0.5 font-mono text-[9px] font-medium opacity-80">
											N
										</kbd>
									</Button>
								</div>
							)}

							{/* Start session button */}
							{!sessionActive && (
								<Button
									onClick={startSession}
									variant="primary"
									className="relative w-full border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-6 py-3 text-lg font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2"
								>
									Start Session ({QUESTIONS_PER_SESSION})
									<kbd className="absolute bottom-1 right-2 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-80">
										Enter
									</kbd>
								</Button>
							)}

							{/* Feedback */}
							{showFeedback ? (
								<FeedbackPanel
									isCorrect={showFeedback === "yes"}
									message={showFeedback === "yes" ? "Correct!" : "Wrong answer"}
									className="opacity-100 translate-y-0"
								/>
							) : sessionActive ? (
								<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 py-2 text-xs text-[var(--gb-text-muted)]">
									{isPlaying
										? "Listening to the note... wait for it to finish."
										: "Waiting for answer. Press Y for yes or N for no."}
								</div>
							) : null}
						</div>
					</div>

					<KeyboardShortcutsBar items={shortcutItems} />
				</section>
			) : (
				<section className="space-y-5 rounded-[24px] border border-dashed border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-5 text-center">
					<p className="text-sm text-[var(--gb-text-muted)]">
						Complete training on previous notes to unlock <strong>{currentNote}</strong>.
					</p>
				</section>
			)}
		</div>
	);
}
