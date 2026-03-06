import { useState } from "react";
import { Button } from "@/components/ui";
import type { Lesson } from "@/types/lesson";
import { StepExplain } from "./StepExplain";
import { StepVerify } from "./StepVerify";

interface LessonPlayerProps {
	lesson: Lesson;
	onComplete: () => void;
	onExit: () => void;
}

export function LessonPlayer({ lesson, onComplete, onExit }: LessonPlayerProps) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const currentStep = lesson.steps[currentStepIndex];
	const isLastStep = currentStepIndex === lesson.steps.length - 1;
	const isFirstStep = currentStepIndex === 0;
	const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

	const handleNext = () => {
		if (isLastStep) {
			onComplete();
		} else {
			setCurrentStepIndex(currentStepIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstStep) {
			setCurrentStepIndex(currentStepIndex - 1);
		}
	};

	return (
		<div className="space-y-5">
			{/* Header */}
			<div>
				<div className="flex justify-between items-center mb-3">
					<div>
						<p className="gb-page-kicker mb-0.5">Lesson</p>
						<h2 className="gb-page-title">{lesson.title}</h2>
					</div>
					<button
						type="button"
						onClick={onExit}
						className="text-sm font-medium transition-colors hover:opacity-70 focus-visible:outline-none"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Exit Lesson
					</button>
				</div>

				{/* Progress bar */}
				<div className="flex items-center gap-3">
					<div
						className="flex-1 h-2 rounded-full overflow-hidden"
						style={{ background: "var(--gb-bg-panel)" }}
					>
						<div
							className="h-full rounded-full transition-all duration-500"
							style={{ width: `${progress}%`, background: "var(--gb-accent)" }}
						/>
					</div>
					<span
						className="text-xs tabular-nums font-medium"
						style={{ color: "var(--gb-text-muted)" }}
					>
						{currentStepIndex + 1} / {lesson.steps.length}
					</span>
				</div>
			</div>

			{/* Step card */}
			<div
				className="rounded-2xl p-6"
				style={{
					background: "var(--gb-bg-elev)",
					border: "1px solid var(--gb-border)",
					boxShadow: "var(--gb-shadow-soft)",
				}}
			>
				{currentStep.type === "explain" ? (
					<StepExplain step={currentStep} />
				) : (
					<StepVerify key={currentStepIndex} step={currentStep} onComplete={handleNext} />
				)}
			</div>

			{/* Navigation */}
			<div className="flex justify-between">
				<Button variant="secondary" onClick={handlePrevious} disabled={isFirstStep}>
					Previous
				</Button>
				{currentStep.type === "explain" && (
					<Button onClick={handleNext}>{isLastStep ? "Complete Lesson" : "Next"}</Button>
				)}
			</div>
		</div>
	);
}
