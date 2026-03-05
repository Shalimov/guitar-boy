import { Fretboard } from "@/components/fretboard/Fretboard";
import type { ExplainStep as ExplainStepType } from "@/types/lesson";

interface StepExplainProps {
	step: ExplainStepType;
}

export function StepExplain({ step }: StepExplainProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold text-gray-900">{step.title}</h2>
			<div className="prose prose-sm max-w-none text-gray-700">
				{step.content.split("\n").map((paragraph) => (
					<p key={paragraph.slice(0, 20)}>{paragraph}</p>
				))}
			</div>
			{step.fretboardState && (
				<div className="mt-4 p-4 bg-gray-50 rounded-lg">
					<Fretboard mode="view" state={step.fretboardState} fretRange={[0, 5]} showNoteNames />
				</div>
			)}
		</div>
	);
}
