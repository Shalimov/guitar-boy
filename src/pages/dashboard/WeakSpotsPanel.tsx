import {
	generateHeatMap,
	getTopProblemAreas,
	heatColor,
	type MistakeLog,
} from "@/lib/mistakeAnalysis";
import { getNoteAtFret } from "@/lib/music";

interface WeakSpotsPanelProps {
	mistakeLog: MistakeLog;
}

export function WeakSpotsPanel({ mistakeLog }: WeakSpotsPanelProps) {
	const heatMap = generateHeatMap(mistakeLog, [0, 12]);
	const topProblems = getTopProblemAreas(mistakeLog, 5);

	if (mistakeLog.totalErrors === 0) {
		return (
			<div className="gb-panel p-6 text-center">
				<p className="text-sm text-[var(--gb-text-muted)]">
					No mistakes tracked yet. Start a quiz to see your weak spots!
				</p>
			</div>
		);
	}

	return (
		<section className="gb-panel p-6 space-y-5">
			<div>
				<p className="gb-page-kicker">Weak Spots</p>
				<h2 className="text-2xl font-semibold text-[var(--gb-text)]">Fretboard Heat Map</h2>
				<p className="mt-1 text-sm text-[var(--gb-text-muted)]">
					Red zones need more practice. Green zones are solid.
				</p>
			</div>

			{/* Grid-based heat map: 6 rows (strings) × 13 columns (frets 0-12) */}
			<div className="overflow-x-auto pb-2">
				<div
					className="grid gap-1 min-w-[600px]"
					style={{
						gridTemplateColumns: "repeat(13, minmax(2rem, 1fr))",
						gridTemplateRows: "repeat(6, 2rem)",
					}}
				>
					{heatMap.map((entry) => (
						<div
							key={`${entry.position.string}-${entry.position.fret}`}
							className="rounded-sm flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-help"
							style={{
								gridColumn: entry.position.fret + 1,
								gridRow: entry.position.string + 1,
								background: heatColor(entry.heatLevel),
								color: entry.heatLevel > 0.5 ? "#fff" : "var(--gb-text-muted)",
							}}
							title={`${getNoteAtFret(entry.position)} - ${entry.errorCount} mistakes`}
						>
							{entry.errorCount > 0 ? entry.errorCount : ""}
						</div>
					))}
				</div>
			</div>

			{/* Top problem areas list */}
			<div className="pt-4 border-t border-[var(--gb-border)]">
				<h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-text-muted)] mb-3">
					Top problem areas
				</h3>
				<div className="flex flex-wrap gap-2">
					{topProblems.map((entry) => (
						<div
							key={`${entry.position.string}-${entry.position.fret}`}
							className="inline-flex items-center gap-2 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-3 py-1.5 text-sm shadow-sm"
						>
							<span className="font-bold text-[var(--gb-accent-strong)]">
								{getNoteAtFret(entry.position).split("/")[0]}
							</span>
							<span className="text-xs text-[var(--gb-text-muted)]">
								Str {entry.position.string + 1} Fret {entry.position.fret}
							</span>
							<span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 dark:bg-red-900/30">
								{entry.errorCount}×
							</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
