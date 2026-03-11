import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnchorNoteMode } from "./AnchorNoteMode";
import { HearIdentifyMode } from "./HearIdentifyMode";
import { ToneMeditationMode } from "./ToneMeditationMode";

type EarTrainingMode = "hear-identify" | "tone-meditation" | "anchor-note";

const MODES: { id: EarTrainingMode; title: string; description: string }[] = [
	{
		id: "hear-identify",
		title: "Hear & Identify",
		description: "Listen to a note and identify its name",
	},
	{
		id: "tone-meditation",
		title: "Tone Meditation",
		description: "Passive listening to build note familiarity",
	},
	{
		id: "anchor-note",
		title: "Anchor Note",
		description: "Master one note at a time",
	},
];

const MODE_META: Record<EarTrainingMode, { badge: string; time: string }> = {
	"hear-identify": { badge: "Ear-first", time: "2-4 min" },
	"tone-meditation": { badge: "Passive focus", time: "3-6 min" },
	"anchor-note": { badge: "Best for beginners", time: "4-7 min" },
};

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
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
								Choose a path
							</p>
							<h2 className="mt-2 text-xl font-semibold text-[var(--gb-text)]">
								Pick the kind of listening you want today
							</h2>
						</div>
						<p className="max-w-lg text-sm text-[var(--gb-text-muted)]">
							Short, repeatable sessions work best here. Start with the mode that matches your
							energy.
						</p>
					</div>
				</section>

				<div className="grid max-w-3xl gap-4">
					{MODES.map((mode) => (
						<Card key={mode.id} className="p-5">
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="text-lg font-semibold">{mode.title}</h3>
										<span className="rounded-full bg-[var(--gb-bg-panel)] px-3 py-1 text-xs font-semibold text-[var(--gb-text-muted)]">
											{MODE_META[mode.id].badge}
										</span>
										<span className="rounded-full bg-[var(--gb-bg-panel)] px-3 py-1 text-xs font-semibold text-[var(--gb-text-muted)]">
											{MODE_META[mode.id].time}
										</span>
									</div>
									<p className="mt-2 text-sm text-[var(--gb-text-muted)]">{mode.description}</p>
								</div>
								<Button onClick={() => setSelectedMode(mode.id)} variant="secondary">
									Start
								</Button>
							</div>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<Button variant="ghost" onClick={() => setSelectedMode(null)}>
					Back to modes
				</Button>
			</div>

			{selectedMode === "hear-identify" && <HearIdentifyMode />}
			{selectedMode === "tone-meditation" && <ToneMeditationMode />}
			{selectedMode === "anchor-note" && <AnchorNoteMode />}
		</div>
	);
}
