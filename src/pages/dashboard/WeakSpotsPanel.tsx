import { Tooltip } from "@/components/ui/Tooltip";
import {
	calculateHeatMapStats,
	generateHeatMap,
	getTopProblemAreas,
	heatColor,
	heatLevelLabel,
	type MistakeLog,
} from "@/lib/mistakeAnalysis";
import { getNoteAtFret } from "@/lib/music";

interface WeakSpotsPanelProps {
	mistakeLog: MistakeLog;
}

const STRING_NAMES = ["E (low)", "A", "D", "G", "B", "E (high)"];
const FRET_NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const STRING_INDICES = [0, 1, 2, 3, 4, 5];

export function WeakSpotsPanel({ mistakeLog }: WeakSpotsPanelProps) {
	const heatMap = generateHeatMap(mistakeLog, [0, 12]);
	const topProblems = getTopProblemAreas(mistakeLog, 5);
	const stats = calculateHeatMapStats(mistakeLog, [0, 12]);

	if (mistakeLog.totalErrors === 0) {
		return (
			<div className="gb-panel p-8 text-center">
				<div className="mx-auto w-16 h-16 mb-4 rounded-full bg-[var(--gb-bg-panel)] flex items-center justify-center">
					<svg
						className="w-8 h-8 text-[var(--gb-accent)]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-label="Checkmark icon"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-[var(--gb-text)] mb-2">
					No Mistakes Tracked Yet
				</h3>
				<p className="text-sm text-[var(--gb-text-muted)] max-w-md mx-auto">
					Complete quizzes to see where you need more practice. Your weak spots will appear here.
				</p>
			</div>
		);
	}

	return (
		<section className="gb-panel p-6 lg:p-8 space-y-6">
			{/* Header with context */}
			<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
				<div>
					<p className="gb-page-kicker">Practice Analytics</p>
					<h2 className="text-2xl font-semibold text-[var(--gb-text)]">Fretboard Heat Map</h2>
					<p className="mt-1.5 text-sm text-[var(--gb-text-muted)] max-w-lg">
						This heatmap visualizes your mistake patterns across the fretboard. Darker zones
						indicate positions where you make more errors.
					</p>
				</div>

				{/* Summary Stats */}
				<div className="flex flex-wrap gap-3">
					<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/50 px-4 py-3">
						<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							Total Errors
						</p>
						<p className="text-2xl font-extrabold text-[var(--gb-accent)]">
							{mistakeLog.totalErrors}
						</p>
					</div>
					<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/50 px-4 py-3">
						<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
							Problem Positions
						</p>
						<p className="text-2xl font-extrabold text-[var(--gb-accent)]">
							{stats.positionsWithErrors}
						</p>
						<p className="text-xs text-[var(--gb-text-muted)]">of {stats.totalCells} positions</p>
					</div>
					{stats.worstString && (
						<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)]/50 px-4 py-3">
							<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
								Challenging String
							</p>
							<p className="text-lg font-bold text-[var(--gb-accent-strong)]">
								{STRING_NAMES[stats.worstString.string]}
							</p>
							<p className="text-xs text-[var(--gb-text-muted)]">
								{stats.worstString.errorCount} errors
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Heat Map Legend */}
			<div className="flex flex-wrap items-center gap-4 pb-4 border-b border-[var(--gb-border)]">
				<span className="text-xs font-medium text-[var(--gb-text-muted)]">Heat Intensity:</span>
				<div className="flex items-center gap-2">
					{[0, 0.25, 0.5, 0.75, 1].map((level, index, array) => (
						<div key={`legend-${level}`} className="flex items-center gap-1.5">
							<div
								className="w-6 h-6 rounded-md border border-[var(--gb-border)]"
								style={{ background: heatColor(level) }}
								title={heatLevelLabel(level)}
							/>
							{index === 0 && <span className="text-xs text-[var(--gb-text-muted)]">None</span>}
							{index === array.length - 1 && (
								<span className="text-xs text-[var(--gb-text-muted)]">High</span>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Grid-based heat map with string labels */}
			<div className="overflow-x-auto pb-8">
				<div className="min-w-[700px] pt-10">
					{/* String labels row */}
					<div
						className="grid gap-2 mb-2"
						style={{ gridTemplateColumns: "100px repeat(13, 40px)" }}
					>
						<div aria-hidden="true" /> {/* Empty corner */}
						{FRET_NUMBERS.map((fretNum) => (
							<div
								key={`fret-header-${fretNum}`}
								className="text-center text-xs font-semibold text-[var(--gb-text-muted)]"
							>
								Fret {fretNum}
							</div>
						))}
					</div>

					{/* Heat map grid */}
					{STRING_INDICES.map((stringIndex) => (
						<div
							key={`string-row-${stringIndex}`}
							className="grid gap-2 mb-2"
							style={{ gridTemplateColumns: "100px repeat(13, 40px)" }}
						>
							<div className="flex items-center justify-end pr-3">
								<span className="text-xs font-semibold text-[var(--gb-text-muted)]">
									{STRING_NAMES[stringIndex]}
								</span>
							</div>
							{FRET_NUMBERS.map((fret) => {
								const entry = heatMap.find(
									(e) => e.position.string === stringIndex && e.position.fret === fret,
								);
								if (!entry) return null;

								const noteName = getNoteAtFret(entry.position).split("/")[0];
								const percentageOfTotal =
									mistakeLog.totalErrors > 0
										? Math.round((entry.errorCount / mistakeLog.totalErrors) * 100)
										: 0;
								const tooltipText = `${noteName} on ${STRING_NAMES[stringIndex]}, Fret ${fret}: ${entry.errorCount} mistake${entry.errorCount === 1 ? "" : "s"} (${percentageOfTotal}% of total)`;

								return (
									<Tooltip key={`cell-${stringIndex}-${fret}`} content={tooltipText}>
										<div
											className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all hover:scale-110 hover:shadow-md cursor-help border"
											style={{
												background: heatColor(entry.heatLevel),
												color: entry.heatLevel > 0.5 ? "var(--gb-bg-elev)" : "var(--gb-text-muted)",
												borderColor: entry.errorCount > 0 ? "var(--gb-accent)" : "var(--gb-border)",
												borderWidth: entry.errorCount > 0 ? "2px" : "1px",
											}}
										>
											{entry.errorCount > 0 && (
												<>
													<span>{entry.errorCount}</span>
													<span className="text-[8px] opacity-75 block">{noteName}</span>
												</>
											)}
										</div>
									</Tooltip>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{/* Top problem areas list */}
			<div className="pt-4 border-t border-[var(--gb-border)]">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-sm font-bold uppercase tracking-widest text-[var(--gb-text-muted)]">
						Priority Practice Areas
					</h3>
					<span className="text-xs text-[var(--gb-text-muted)]">
						Focus on these {topProblems.length} positions first
					</span>
				</div>
				<div className="flex flex-wrap gap-2">
					{topProblems.map((entry, problemIndex) => {
						const noteName = getNoteAtFret(entry.position).split("/")[0];
						const entryHeatLevel =
							heatMap.find(
								(h) =>
									h.position.string === entry.position.string &&
									h.position.fret === entry.position.fret,
							)?.heatLevel ?? 0;

						return (
							<div
								key={`problem-${entry.position.string}-${entry.position.fret}`}
								className="inline-flex items-center gap-2 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-4 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
							>
								<span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--gb-accent)] text-[var(--gb-bg-elev)] text-xs font-black">
									{problemIndex + 1}
								</span>
								<span className="font-bold text-[var(--gb-accent-strong)] text-base">
									{noteName}
								</span>
								<span className="text-xs text-[var(--gb-text-muted)]">
									{STRING_NAMES[entry.position.string]}
								</span>
								<span className="text-xs text-[var(--gb-text-muted)]">·</span>
								<span className="text-xs text-[var(--gb-text-muted)]">
									Fret {entry.position.fret}
								</span>
								<span
									className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
									style={{
										background: heatColor(entryHeatLevel),
										color: entryHeatLevel > 0.5 ? "var(--gb-bg-elev)" : "var(--gb-text-muted)",
									}}
								>
									{entry.errorCount}×
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Insight tip */}
			{stats.worstString && (
				<div className="pt-4 border-t border-[var(--gb-border)]">
					<div className="flex items-start gap-3 rounded-xl bg-[var(--gb-bg-panel)]/50 p-4">
						<div className="w-8 h-8 rounded-full bg-[var(--gb-accent)]/10 flex items-center justify-center shrink-0">
							<svg
								className="w-4 h-4 text-[var(--gb-accent)]"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Information icon"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-sm font-semibold text-[var(--gb-text)]">
								Focus on the {STRING_NAMES[stats.worstString.string]}
							</p>
							<p className="text-sm text-[var(--gb-text-muted)] mt-1">
								You have made {stats.worstString.errorCount} mistakes on this string. Try isolating
								practice to this string first, then integrate with others.
							</p>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
