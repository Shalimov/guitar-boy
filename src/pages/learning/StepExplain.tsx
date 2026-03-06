import { Fretboard } from "@/components/fretboard/Fretboard";
import type { ExplainStep as ExplainStepType } from "@/types/lesson";

interface StepExplainProps {
	step: ExplainStepType;
}

export function StepExplain({ step }: StepExplainProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold" style={{ color: "var(--gb-text)" }}>
				{step.title}
			</h2>
			<div className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--gb-text-muted)" }}>
				{step.content.split("\n").map((paragraph) => (
					<p key={paragraph.slice(0, 20)}>{paragraph}</p>
				))}
			</div>
			{step.fretboardState && (
				<div
					className="mt-4 p-4 rounded-xl"
					style={{ background: "var(--gb-bg-panel)", border: "1px solid var(--gb-border)" }}
				>
					<Fretboard mode="view" state={step.fretboardState} fretRange={[0, 5]} showNoteNames />
				</div>
			)}
		</div>
	);
}
