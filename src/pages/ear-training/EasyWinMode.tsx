import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEqualizer } from "@/components/ui/AudioEqualizer";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { KeyboardShortcutsBar } from "@/components/ui/KeyboardShortcutsBar";
import { TinyStat } from "@/components/ui/TinyStat";
import { playChord, playNote } from "@/lib/audio";
import { getDisplayNoteName, getScaleDegreeNote } from "@/lib/music";
import { buildSimpleShortcutItems } from "@/lib/shortcuts";
import type { NoteName } from "@/types";

type EasyWinStage = "high-or-low" | "same-or-different" | "major-or-minor";

const STAGES: { id: EasyWinStage; name: string; description: string }[] = [
	{
		id: "high-or-low",
		name: "High or Low?",
		description: "Two notes play — which one is higher?",
	},
	{
		id: "same-or-different",
		name: "Same or Different?",
		description: "Two notes play — are they the same note?",
	},
	{
		id: "major-or-minor",
		name: "Major or Minor?",
		description: "A chord plays — does it sound happy (major) or sad (minor)?",
	},
];

const CONSECUTIVE_TO_ADVANCE = 5;
const ROOT: NoteName = "C";

function randomOctave(): number {
	return 3 + Math.floor(Math.random() * 2); // 3 or 4
}

function randomNote(): NoteName {
	const notes: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];
	return notes[Math.floor(Math.random() * notes.length)];
}

export function EasyWinMode() {
	const [stageIndex, setStageIndex] = useState(0);
	const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
	const [totalCorrect, setTotalCorrect] = useState(0);
	const [totalAttempts, setTotalAttempts] = useState(0);
	const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(
		null,
	);
	const [questionData, setQuestionData] = useState<{
		answer: string;
		prompt: string;
	} | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [allComplete, setAllComplete] = useState(false);
	const replayRef = useRef<(() => Promise<void>) | null>(null);

	const stage = STAGES[stageIndex];

	const playTwoNotes = useCallback(async (n1: NoteName, n2: NoteName, oct1 = 4, oct2 = 4) => {
		await playNote(n1, "2n");
		await new Promise((r) => setTimeout(r, 1200));
		await playNote(n2, "2n");
	}, []);

	const generateQuestion = useCallback(async () => {
		setShowFeedback(null);
		setIsPlaying(true);

		const stageId = STAGES[stageIndex].id;

		if (stageId === "high-or-low") {
			const oct1 = randomOctave();
			const note1 = randomNote();
			const note2 = randomNote();
			const oct2 = randomOctave();
			const pitch1 = `${getDisplayNoteName(note1, "sharp")}${oct1}`;
			const pitch2 = `${getDisplayNoteName(note2, "sharp")}${oct2}`;
			// Ensure they're actually different pitches
			const midi1 = oct1 * 12 + ["C", "D", "E", "F", "G", "A", "B"].indexOf(note1.split("/")[0]);
			const midi2 = oct2 * 12 + ["C", "D", "E", "F", "G", "A", "B"].indexOf(note2.split("/")[0]);
			const answer = midi2 > midi1 ? "second" : midi2 < midi1 ? "first" : "same";
			setQuestionData({ answer, prompt: `${pitch1} then ${pitch2}` });

			replayRef.current = () => playTwoNotes(note1, note2, oct1, oct2);
			await playTwoNotes(note1, note2, oct1, oct2);
		} else if (stageId === "same-or-different") {
			const note1 = randomNote();
			const isSame = Math.random() > 0.5;
			const note2 = isSame ? note1 : randomNote();
			// Ensure different if not same
			const finalNote2 =
				!isSame && note2 === note1
					? (["C", "D", "E", "F", "G", "A", "B"].find((n) => n !== note1) as NoteName)
					: note2;
			const answer = note1 === finalNote2 ? "same" : "different";
			setQuestionData({ answer, prompt: `Two notes played` });

			replayRef.current = () => playTwoNotes(note1, finalNote2);
			await playTwoNotes(note1, finalNote2);
		} else {
			// major-or-minor
			const isMajor = Math.random() > 0.5;
			const root = randomNote();
			const third = isMajor
				? getScaleDegreeNote(root, "3")
				: getScaleDegreeNote(root, "b3");
			const fifth = getScaleDegreeNote(root, "5");
			const oct = 3;
			const chordNotes = [
				`${getDisplayNoteName(root, "sharp")}${oct}`,
				`${getDisplayNoteName(third, "sharp")}${oct}`,
				`${getDisplayNoteName(fifth, "sharp")}${oct}`,
			];
			const answer = isMajor ? "major" : "minor";
			setQuestionData({ answer, prompt: `Chord played` });

			replayRef.current = () => playChord(chordNotes, "2n");
			await playChord(chordNotes, "2n");
		}

		setIsPlaying(false);
	}, [stageIndex, playTwoNotes]);

	useEffect(() => {
		void generateQuestion();
	}, [generateQuestion, stageIndex]);

	const handleReplay = useCallback(async () => {
		if (isPlaying || !replayRef.current) return;
		setIsPlaying(true);
		await replayRef.current();
		setIsPlaying(false);
	}, [isPlaying]);

	const handleAnswer = useCallback(
		(answer: string) => {
			if (!questionData || showFeedback) return;

			const correct = answer === questionData.answer;
			setTotalAttempts((p) => p + 1);

			if (correct) {
				setTotalCorrect((p) => p + 1);
				const nextConsecutive = consecutiveCorrect + 1;
				setConsecutiveCorrect(nextConsecutive);

				if (nextConsecutive >= CONSECUTIVE_TO_ADVANCE) {
					if (stageIndex < STAGES.length - 1) {
						setShowFeedback({
							correct: true,
							message: `Stage complete! Moving to "${STAGES[stageIndex + 1].name}"`,
						});
						setTimeout(() => {
							setStageIndex((p) => p + 1);
							setConsecutiveCorrect(0);
						}, 1500);
						return;
					} else {
						setAllComplete(true);
						setShowFeedback({
							correct: true,
							message: "All stages complete! You're ready for Scale Degree Training.",
						});
						return;
					}
				}

				setShowFeedback({ correct: true, message: "Correct!" });
			} else {
				setConsecutiveCorrect(0);
				const correctLabel =
					questionData.answer === "first"
						? "the first note"
						: questionData.answer === "second"
							? "the second note"
							: questionData.answer;
				setShowFeedback({ correct: false, message: `Not quite. The answer was: ${correctLabel}` });
			}

			setTimeout(() => {
				if (!allComplete) void generateQuestion();
			}, 1200);
		},
		[questionData, showFeedback, consecutiveCorrect, stageIndex, allComplete, generateQuestion],
	);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			)
				return;

			if (event.key === "r" || event.key === "R") {
				void handleReplay();
				return;
			}

			if (isPlaying || showFeedback) return;

			const stageId = STAGES[stageIndex].id;

			if (stageId === "high-or-low") {
				if (event.key === "1") handleAnswer("first");
				if (event.key === "2") handleAnswer("second");
			} else if (stageId === "same-or-different") {
				if (event.key === "1" || event.key === "s" || event.key === "S") handleAnswer("same");
				if (event.key === "2" || event.key === "d" || event.key === "D") handleAnswer("different");
			} else {
				if (event.key === "1" || event.key === "m" || event.key === "M") handleAnswer("major");
				if (event.key === "2" || event.key === "n" || event.key === "N") handleAnswer("minor");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [stageIndex, isPlaying, showFeedback, handleAnswer, handleReplay]);

	const accuracy =
		totalAttempts > 0 ? `${Math.round((totalCorrect / totalAttempts) * 100)}%` : "--";

	const shortcutItems = buildSimpleShortcutItems([
		...(stage.id === "high-or-low"
			? [
					{ keyLabel: "1", action: "first higher", id: "1" },
					{ keyLabel: "2", action: "second higher", id: "2" },
				]
			: stage.id === "same-or-different"
				? [
						{ keyLabel: "S", action: "same", id: "s" },
						{ keyLabel: "D", action: "different", id: "d" },
					]
				: [
						{ keyLabel: "M", action: "major", id: "m" },
						{ keyLabel: "N", action: "minor", id: "n" },
					]),
		{ keyLabel: "R", action: "replay", id: "r" },
	]);

	const renderButtons = () => {
		if (isPlaying || showFeedback || allComplete) return null;

		const buttons =
			stage.id === "high-or-low"
				? [
						{ label: "First Note", value: "first", color: "bg-blue-600 border-b-blue-800" },
						{ label: "Second Note", value: "second", color: "bg-purple-600 border-b-purple-800" },
					]
				: stage.id === "same-or-different"
					? [
							{ label: "Same", value: "same", color: "bg-green-600 border-b-green-800" },
							{ label: "Different", value: "different", color: "bg-red-600 border-b-red-800" },
						]
					: [
							{ label: "Major (Happy)", value: "major", color: "bg-yellow-500 border-b-yellow-700" },
							{ label: "Minor (Sad)", value: "minor", color: "bg-indigo-600 border-b-indigo-800" },
						];

		return (
			<div className="flex justify-center gap-3">
				{buttons.map((btn) => (
					<Button
						key={btn.value}
						onClick={() => handleAnswer(btn.value)}
						variant="primary"
						className={`relative min-w-[130px] border-b-4 px-5 py-3 text-base font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2 ${btn.color}`}
					>
						{btn.label}
					</Button>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 shadow-[var(--gb-shadow-soft)] lg:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-0.5">Easy Wins</p>
						<h2 className="text-xl font-semibold text-[var(--gb-text)]">
							Build Your Ear Confidence
						</h2>
						<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
							Simple listening exercises to warm up your ear before scale degree training.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<TinyStat label="Stage" value={`${stageIndex + 1}/${STAGES.length}`} statKey="stage" />
						<TinyStat label="Accuracy" value={accuracy} statKey="accuracy" />
						<TinyStat
							label="Streak"
							value={`${consecutiveCorrect}/${CONSECUTIVE_TO_ADVANCE}`}
							statKey="streak"
						/>
					</div>
				</div>

				<hr className="my-3 border-[var(--gb-border)]" />

				{/* Stage pills */}
				<div className="flex gap-2">
					{STAGES.map((s, i) => (
						<div
							key={s.id}
							className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
								i === stageIndex
									? "bg-[var(--gb-accent)] text-white"
									: i < stageIndex
										? "bg-green-600 text-white"
										: "bg-[var(--gb-bg-elev)] text-[var(--gb-text-muted)]"
							}`}
						>
							{i < stageIndex ? "done" : s.name}
						</div>
					))}
				</div>
			</section>

			{/* Drill Area */}
			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 shadow-[var(--gb-shadow)]">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-semibold text-[var(--gb-text)]">{stage.name}</h2>
					<p className="text-sm text-[var(--gb-text-muted)]">{stage.description}</p>
				</div>

				{/* Audio visualizer */}
				<div className="flex items-center justify-center">
					<div className="w-48">
						<AudioEqualizer />
					</div>
				</div>

				{isPlaying && (
					<p className="text-center text-sm text-[var(--gb-text-muted)] animate-pulse">
						Listen carefully...
					</p>
				)}

				{!isPlaying && questionData && !allComplete && (
					<div className="flex justify-center">
						<button
							type="button"
							onClick={handleReplay}
							style={{ background: "var(--gb-accent)", color: "#fff8ee" }}
							className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-90 focus-visible:outline-none"
						>
							Replay
						</button>
					</div>
				)}

				{renderButtons()}

				{showFeedback && (
					<FeedbackPanel
						isCorrect={showFeedback.correct}
						message={showFeedback.message}
						className="opacity-100 translate-y-0 max-w-md mx-auto"
					/>
				)}

				{allComplete && (
					<div className="rounded-[18px] border border-green-500/30 bg-green-50 p-6 text-center dark:bg-green-950/30">
						<p className="text-lg font-bold text-green-700 dark:text-green-300">
							Your ear is warmed up!
						</p>
						<p className="mt-1 text-sm text-green-600 dark:text-green-400">
							Try the Anchor Note training next to start recognizing scale degrees.
						</p>
					</div>
				)}

				<KeyboardShortcutsBar items={shortcutItems} />
			</section>
		</div>
	);
}
