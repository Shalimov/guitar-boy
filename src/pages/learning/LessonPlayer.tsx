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

	const handleStepComplete = () => {
		handleNext();
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
					<button type="button" onClick={onExit} className="text-gray-500 hover:text-gray-700">
						Exit Lesson
					</button>
				</div>
				<div className="flex items-center gap-4">
					<div className="flex-1 bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-500 h-2 rounded-full transition-all"
							style={{ width: `${((currentStepIndex + 1) / lesson.steps.length) * 100}%` }}
						/>
					</div>
					<span className="text-sm text-gray-600">
						{currentStepIndex + 1} / {lesson.steps.length}
					</span>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-md p-6">
				{currentStep.type === "explain" ? (
					<StepExplain step={currentStep} />
				) : (
					<StepVerify step={currentStep} onComplete={handleStepComplete} />
				)}
			</div>

			<div className="flex justify-between mt-6">
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
