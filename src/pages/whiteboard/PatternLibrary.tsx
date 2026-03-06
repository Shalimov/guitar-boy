import type { Diagram } from "@/types";

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
