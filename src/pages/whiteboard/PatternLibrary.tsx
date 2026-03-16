import type { Diagram, FretboardState } from "@/types";

function PatternPreview({ state }: { state: FretboardState }) {
	const stringCount = 6;
	const fretCount = 12;
	const cellWidth = 24;
	const cellHeight = 18;

	const hasDot = (stringIndex: number, fretIndex: number): boolean => {
		return state.dots.some(
			(dot) => dot.position.string === stringIndex && dot.position.fret === fretIndex,
		);
	};

	const getDotColor = (stringIndex: number, fretIndex: number): string | undefined => {
		const dot = state.dots.find(
			(d) => d.position.string === stringIndex && d.position.fret === fretIndex,
		);
		return dot?.color;
	};

	const dotKey = (stringIndex: number, fretIndex: number, idx: number) =>
		`dot-${stringIndex}-${fretIndex}-${idx}`;

	return (
		<div className="relative rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg)] p-1 overflow-hidden">
			<svg
				width={fretCount * cellWidth + 30}
				height={stringCount * cellHeight + 10}
				className="block"
			>
				{Array.from({ length: fretCount + 1 }).map((_, fretIndex) => (
					<line
						key={`fret-${fretIndex}`}
						x1={30 + fretIndex * cellWidth}
						y1={5}
						x2={30 + fretIndex * cellWidth}
						y2={5 + stringCount * cellHeight}
						stroke="var(--gb-border)"
						strokeWidth={fretIndex === 0 ? 3 : 1}
					/>
				))}
				{Array.from({ length: stringCount - 1 }).map((_, stringIndex) => (
					<line
						key={`string-${stringIndex}`}
						x1={30}
						y1={5 + (stringIndex + 1) * cellHeight}
						x2={30 + fretCount * cellWidth}
						y2={5 + (stringIndex + 1) * cellHeight}
						stroke="var(--gb-border)"
						strokeWidth={1}
						strokeDasharray="2,2"
						opacity={0.5}
					/>
				))}
				{state.dots
					.filter((dot) => dot.position.fret <= fretCount)
					.map((dot, idx) => (
						<circle
							key={dotKey(dot.position.string, dot.position.fret, idx)}
							cx={30 + (dot.position.fret - 1) * cellWidth + cellWidth / 2}
							cy={5 + dot.position.string * cellHeight + cellHeight / 2}
							r={6}
							fill={dot.color || "var(--gb-accent)"}
						/>
					))}
			</svg>
		</div>
	);
}

// Group patterns by their id prefix (e.g. "caged", "pentatonic", "major-scale", etc.)
function getCategory(id: string): string {
	if (id.startsWith("caged")) return "CAGED Shapes";
	if (id.startsWith("pentatonic")) return "Minor Pentatonic";
	if (id.startsWith("major-scale")) return "Major Scale";
	if (id.startsWith("minor-scale")) return "Natural Minor Scale";
	if (id.startsWith("interval")) return "Intervals";
	return "Other";
}

interface PatternLibraryProps {
	patterns: Diagram[];
	onViewPattern: (diagram: Diagram) => void;
	onEditCopy: (diagram: Diagram) => void;
}

export function PatternLibrary({ patterns, onViewPattern, onEditCopy }: PatternLibraryProps) {
	// Group by category, preserving insertion order
	const groups = new Map<string, Diagram[]>();
	for (const pattern of patterns) {
		const cat = getCategory(pattern.id);
		if (!groups.has(cat)) groups.set(cat, []);
		groups.get(cat)?.push(pattern);
	}

	return (
		<div className="space-y-8">
			{Array.from(groups.entries()).map(([category, items]) => (
				<section key={category} className="space-y-3">
					<h2
						className="text-xs font-bold tracking-widest uppercase"
						style={{ color: "var(--gb-text-muted)" }}
					>
						{category}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{items.map((pattern) => (
							<div
								key={pattern.id}
								className="p-4 rounded-xl flex flex-col gap-3"
								style={{
									background: "var(--gb-bg-elev)",
									border: "1px solid var(--gb-border)",
									boxShadow: "var(--gb-shadow-soft)",
								}}
							>
								<PatternPreview key={pattern.id} state={pattern.fretboardState} />
								<div className="flex-1">
									<h3 className="font-semibold text-sm" style={{ color: "var(--gb-text)" }}>
										{pattern.name}
									</h3>
									{pattern.description && (
										<p
											className="text-xs mt-1 line-clamp-2"
											style={{ color: "var(--gb-text-muted)" }}
										>
											{pattern.description}
										</p>
									)}
								</div>

								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => onViewPattern(pattern)}
										className="flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
										style={{
											background: "var(--gb-accent)",
											color: "#fff8ee",
										}}
									>
										View
									</button>
									<button
										type="button"
										onClick={() => onEditCopy(pattern)}
										className="flex-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95 focus-visible:outline-none"
										style={{
											background: "var(--gb-bg-panel)",
											color: "var(--gb-text)",
											border: "1px solid var(--gb-border)",
										}}
									>
										Edit Copy
									</button>
								</div>
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
