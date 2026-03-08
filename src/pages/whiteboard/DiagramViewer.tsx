import { Fretboard } from "@/components/fretboard";
import { PageHeader } from "@/components/ui";
import type { Diagram } from "@/types";

interface DiagramViewerProps {
	diagram: Diagram;
	/** Called when the user clicks "Back" */
	onBack: () => void;
	/** Called when the user wants to edit — only shown for user diagrams */
	onEdit?: () => void;
	/** Called when the user wants to create an editable copy — shown for built-in diagrams */
	onEditCopy?: () => void;
}

export function DiagramViewer({ diagram, onBack, onEdit, onEditCopy }: DiagramViewerProps) {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-3">
				<PageHeader
					kicker={diagram.isBuiltIn ? "Built-in Pattern" : "My Diagram"}
					title={diagram.name}
					description={diagram.description}
					className="flex-1"
				/>

				<div className="flex items-center gap-2 flex-shrink-0">
					<button
						type="button"
						onClick={onBack}
						className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-70 focus-visible:outline-none"
						style={{ color: "var(--gb-text-muted)" }}
					>
						← Back
					</button>

					{onEdit && (
						<button
							type="button"
							onClick={onEdit}
							className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
							style={{
								background: "var(--gb-accent)",
								color: "#fff8ee",
								boxShadow: "0 2px 8px rgba(179,93,42,0.28)",
							}}
						>
							Edit
						</button>
					)}

					{onEditCopy && (
						<button
							type="button"
							onClick={onEditCopy}
							className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
							style={{
								background: "var(--gb-accent)",
								color: "#fff8ee",
								boxShadow: "0 2px 8px rgba(179,93,42,0.28)",
							}}
						>
							Edit Copy
						</button>
					)}
				</div>
			</div>

			{/* Fretboard — view only */}
			<div
				className="rounded-2xl p-5"
				style={{
					background: "var(--gb-bg-elev)",
					border: "1px solid var(--gb-border)",
					boxShadow: "var(--gb-shadow-soft)",
				}}
			>
				<Fretboard
					mode="view"
					state={diagram.fretboardState}
					fretRange={[1, 15]}
					showNoteNames
					showStringLabels
				/>
			</div>

			{diagram.isBuiltIn && (
				<p className="text-xs text-center" style={{ color: "var(--gb-text-muted)" }}>
					This is a built-in pattern and cannot be edited. Use "Edit Copy" to create your own
					version.
				</p>
			)}
		</div>
	);
}
