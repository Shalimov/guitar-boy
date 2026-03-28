import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FeedbackPanel } from "@/components/ui/FeedbackPanel";
import { playCadence, playNote } from "@/lib/audio";
import { getScaleDegreeNote } from "@/lib/music";
import type { NoteName } from "@/types";
import type { ScaleDegree } from "@/types/earTraining";
import { DEGREE_LABELS } from "@/types/earTraining";

type OnboardingStep = "experience" | "assessment" | "expectations" | "done";

interface EarOnboardingProps {
	onComplete: (unlockedDegrees: ScaleDegree[]) => void;
}

const ASSESSMENT_DEGREES: ScaleDegree[] = ["1", "3", "5", "4", "b7"];
const ROOT: NoteName = "C";

export function EarOnboarding({ onComplete }: EarOnboardingProps) {
	const [step, setStep] = useState<OnboardingStep>("experience");
	const [experience, setExperience] = useState<string | null>(null);

	// Assessment state
	const [assessmentIndex, setAssessmentIndex] = useState(0);
	const [assessmentCorrect, setAssessmentCorrect] = useState(0);
	const [assessmentFeedback, setAssessmentFeedback] = useState<{
		correct: boolean;
		actual: ScaleDegree;
	} | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	const startAssessment = useCallback(async () => {
		setStep("assessment");
		setIsPlaying(true);
		await playCadence(ROOT);
		await new Promise((r) => setTimeout(r, 400));
		const degree = ASSESSMENT_DEGREES[0];
		const note = getScaleDegreeNote(ROOT, degree);
		await playNote(note, "2n");
		setIsPlaying(false);
	}, []);

	const playAssessmentNote = useCallback(async (index: number) => {
		setIsPlaying(true);
		const degree = ASSESSMENT_DEGREES[index];
		const note = getScaleDegreeNote(ROOT, degree);
		await playNote(note, "2n");
		setIsPlaying(false);
	}, []);

	const handleAssessmentAnswer = useCallback(
		(guessed: ScaleDegree) => {
			if (assessmentFeedback || isPlaying) return;
			const actual = ASSESSMENT_DEGREES[assessmentIndex];
			const correct = guessed === actual;
			const newCorrect = assessmentCorrect + (correct ? 1 : 0);

			setAssessmentFeedback({ correct, actual });
			if (correct) setAssessmentCorrect(newCorrect);

			setTimeout(() => {
				setAssessmentFeedback(null);
				const nextIndex = assessmentIndex + 1;

				if (nextIndex >= ASSESSMENT_DEGREES.length) {
					// Assessment complete — determine unlock level
					setStep("expectations");
				} else {
					setAssessmentIndex(nextIndex);
					void playAssessmentNote(nextIndex);
				}
			}, 1200);
		},
		[assessmentFeedback, isPlaying, assessmentIndex, assessmentCorrect, playAssessmentNote],
	);

	const handleFinish = useCallback(() => {
		// Determine initial unlock based on assessment score
		let unlocked: ScaleDegree[];
		if (experience === "never") {
			unlocked = ["1"];
		} else if (assessmentCorrect <= 1) {
			unlocked = ["1"];
		} else if (assessmentCorrect <= 3) {
			unlocked = ["1", "5"];
		} else {
			unlocked = ["1", "5", "3", "4"];
		}
		onComplete(unlocked);
	}, [experience, assessmentCorrect, onComplete]);

	if (step === "experience") {
		return (
			<div className="mx-auto max-w-lg space-y-6">
				<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-6 text-center shadow-[var(--gb-shadow-soft)]">
					<p className="gb-page-kicker mb-2">Step 1 of 3</p>
					<h2 className="text-2xl font-bold text-[var(--gb-text)]">
						What's your ear training experience?
					</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						This helps us set the right starting point for you.
					</p>

					<div className="mt-6 space-y-3">
						{[
							{
								id: "never",
								label: "I'm brand new to music",
								desc: "Never trained my ear before",
							},
							{
								id: "some",
								label: "I play but never trained my ear",
								desc: "I know some theory but can't identify notes by sound",
							},
							{
								id: "experienced",
								label: "I have some ear training experience",
								desc: "I can recognize some intervals or notes",
							},
						].map((option) => (
							<button
								key={option.id}
								type="button"
								onClick={() => {
									setExperience(option.id);
									if (option.id === "never") {
										setStep("expectations");
									} else {
										void startAssessment();
									}
								}}
								className={`w-full rounded-xl border-2 p-4 text-left transition-all hover:border-[var(--gb-accent)] ${
									experience === option.id
										? "border-[var(--gb-accent)] bg-[var(--gb-accent)]/10"
										: "border-[var(--gb-border)] bg-[var(--gb-bg-elev)]"
								}`}
							>
								<p className="font-semibold text-[var(--gb-text)]">{option.label}</p>
								<p className="mt-0.5 text-xs text-[var(--gb-text-muted)]">{option.desc}</p>
							</button>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (step === "assessment") {
		const currentDegree = ASSESSMENT_DEGREES[assessmentIndex];
		const answerOptions: ScaleDegree[] = ["1", "3", "4", "5", "b7"];

		return (
			<div className="mx-auto max-w-lg space-y-6">
				<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-6 text-center shadow-[var(--gb-shadow-soft)]">
					<p className="gb-page-kicker mb-2">Step 2 of 3</p>
					<h2 className="text-2xl font-bold text-[var(--gb-text)]">Quick Ear Check</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						A cadence played to set the key. Now identify each note.
						Question {assessmentIndex + 1} of {ASSESSMENT_DEGREES.length}.
					</p>

					{isPlaying && (
						<p className="mt-4 text-sm text-[var(--gb-text-muted)] animate-pulse">
							Listen carefully...
						</p>
					)}

					{!isPlaying && !assessmentFeedback && (
						<div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5">
							{answerOptions.map((degree) => (
								<button
									key={degree}
									type="button"
									onClick={() => handleAssessmentAnswer(degree)}
									className="rounded-xl border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-3 py-3 text-white font-bold transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-2"
								>
									<span className="text-lg">{degree}</span>
									<br />
									<span className="text-[10px] opacity-80">
										{DEGREE_LABELS[degree]}
									</span>
								</button>
							))}
						</div>
					)}

					{assessmentFeedback && (
						<FeedbackPanel
							isCorrect={assessmentFeedback.correct}
							message={
								assessmentFeedback.correct
									? `Correct! That was ${assessmentFeedback.actual} (${DEGREE_LABELS[assessmentFeedback.actual]})`
									: `It was ${assessmentFeedback.actual} (${DEGREE_LABELS[assessmentFeedback.actual]})`
							}
							className="mt-4 opacity-100 translate-y-0"
						/>
					)}

					<div className="mt-4 flex justify-center gap-1">
						{ASSESSMENT_DEGREES.map((_, i) => (
							<div
								key={i}
								className={`h-2 w-8 rounded-full ${
									i < assessmentIndex
										? "bg-[var(--gb-accent)]"
										: i === assessmentIndex
											? "bg-[var(--gb-accent)]/50"
											: "bg-[var(--gb-bg-elev)]"
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (step === "expectations") {
		const resultText =
			experience === "never"
				? "We'll start from the very beginning — just the root note."
				: assessmentCorrect <= 1
					? "Looks like we should start with the basics. That's great — everyone starts here!"
					: assessmentCorrect <= 3
						? "Nice — you've got some sense of the scale. We'll start you with root and fifth unlocked."
						: "Impressive! You already have a good ear. We'll unlock several degrees for you.";

		return (
			<div className="mx-auto max-w-lg space-y-6">
				<div className="rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-6 text-center shadow-[var(--gb-shadow-soft)]">
					<p className="gb-page-kicker mb-2">Step 3 of 3</p>
					<h2 className="text-2xl font-bold text-[var(--gb-text)]">You're All Set</h2>

					{experience !== "never" && (
						<p className="mt-3 text-sm text-[var(--gb-text-muted)]">
							You got {assessmentCorrect}/{ASSESSMENT_DEGREES.length} correct.
						</p>
					)}

					<p className="mt-2 text-sm text-[var(--gb-text)]">{resultText}</p>

					<div className="mt-6 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 text-left">
						<p className="text-sm font-medium text-[var(--gb-text)]">
							Ear training is like learning a language:
						</p>
						<ul className="mt-2 space-y-1 text-sm text-[var(--gb-text-muted)]">
							<li>- 5 minutes a day builds real skills</li>
							<li>- Most people start recognizing notes within 2 weeks</li>
							<li>- Consistency matters more than session length</li>
							<li>- Using hints is learning, not cheating</li>
						</ul>
					</div>

					<Button
						onClick={handleFinish}
						variant="primary"
						className="mt-6 w-full border-b-4 border-b-[var(--gb-accent-strong)] bg-[var(--gb-accent)] px-6 py-3 text-lg font-bold text-white hover:brightness-110 active:translate-y-0.5 active:border-b-2"
					>
						Start Training
					</Button>
				</div>
			</div>
		);
	}

	return null;
}
