import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnchorNoteMode } from "./AnchorNoteMode";
import { HearIdentifyMode } from "./HearIdentifyMode";
import { ToneMeditationMode } from "./ToneMeditationMode";

type EarTrainingMode = "hear-identify" | "tone-meditation" | "anchor-note";

const MODES: {
	id: EarTrainingMode;
	title: string;
	description: string;
	icon: string;
	badge: string;
	time: string;
}[] = [
	{
		id: "hear-identify",
		title: "Hear & Identify",
		description: "Listen to a note and identify its name",
		icon: "👂",
		badge: "Ear-first",
		time: "2-4 min",
	},
	{
		id: "tone-meditation",
		title: "Tone Meditation",
		description: "Passive listening to build note familiarity",
		icon: "🎵",
		badge: "Passive focus",
		time: "3-6 min",
	},
	{
		id: "anchor-note",
		title: "Anchor Note",
		description: "Master one note at a time",
		icon: "⚓",
		badge: "Best for beginners",
		time: "4-7 min",
	},
];

export function EarTrainingPage() {
	const [selectedMode, setSelectedMode] = useState<EarTrainingMode | null>(null);

	if (!selectedMode) {
		return (
			<div className="space-y-6 p-6">
				<PageHeader
					kicker="Ear Training"
					title="Train your ears"
					description="Build note recognition with short drills that move from listening, to guessing, to confident recall."
				/>

				<section className="gb-panel p-5">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
								Choose a path
							</p>
							<h2 className="mt-2 text-xl font-semibold text-[var(--gb-text)]">
								Pick the kind of listening you want today
							</h2>
						</div>
						<p className="max-w-md text-sm text-[var(--gb-text-muted)]">
							Short, repeatable sessions work best here. Start with the mode that matches your
							energy.
						</p>
					</div>
				</section>

				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{MODES.map((mode) => (
						<button
							key={mode.id}
							type="button"
							onClick={() => setSelectedMode(mode.id)}
							className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] hover:border-[var(--gb-accent)] hover:shadow-md transition-all text-left"
						>
							<span className="text-2xl">{mode.icon}</span>
							<span className="text-sm font-medium text-[var(--gb-text)]">{mode.title}</span>
							<div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
								<span className="inline-flex items-center rounded-full bg-[var(--gb-bg-panel)] px-2 py-0.5 text-[10px] font-semibold text-[var(--gb-text-muted)] border border-[var(--gb-border)]">
									{mode.badge}
								</span>
							</div>
						</button>
					))}
				</div>
			</div>
		);
	}

	const currentMode = MODES.find((m) => m.id === selectedMode);

	return (
		<div className="p-6">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => setSelectedMode(null)}>
					← Back to modes
				</Button>
			</div>

			{currentMode && (
				<div className="mb-6">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						{currentMode.title}
					</p>
					<p className="mt-1 text-sm text-[var(--gb-text-muted)]">{currentMode.description}</p>
				</div>
			)}

			{selectedMode === "hear-identify" && <HearIdentifyMode />}
			{selectedMode === "tone-meditation" && <ToneMeditationMode />}
			{selectedMode === "anchor-note" && <AnchorNoteMode />}
		</div>
	);
}
