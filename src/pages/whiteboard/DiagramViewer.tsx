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
	/** Navigate to the previous diagram in the list */
	onPrevious?: () => void;
	/** Navigate to the next diagram in the list */
	onNext?: () => void;
	/** Whether the previous button should be disabled */
	hasPrevious?: boolean;
	/** Whether the next button should be disabled */
	hasNext?: boolean;
}

export function DiagramViewer({
	diagram,
	onBack,
	onEdit,
	onEditCopy,
	onPrevious,
	onNext,
	hasPrevious,
	hasNext,
}: DiagramViewerProps) {
	const showNavigation = onPrevious || onNext;

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

				{/* Button toolbar */}
				<div
					className="inline-flex items-center gap-1 rounded-xl px-3 py-2"
					style={{
						background: "var(--gb-bg-panel)",
						border: "1px solid var(--gb-border)",
					}}
				>
					{showNavigation && (
						<button
							type="button"
							onClick={onPrevious}
							disabled={!hasPrevious}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all hover:opacity-70 focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
							style={{ color: "var(--gb-text-muted)" }}
							aria-label="Previous diagram"
						>
							←
						</button>
					)}

					<button
						type="button"
						onClick={onBack}
						className="flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all hover:opacity-70 focus-visible:outline-none"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Back
					</button>

					{onEdit && (
						<button
							type="button"
							onClick={onEdit}
							className="flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
							style={{
								background: "var(--gb-accent)",
								color: "#fff8ee",
							}}
						>
							Edit
						</button>
					)}

					{onEditCopy && (
						<button
							type="button"
							onClick={onEditCopy}
							className="flex h-8 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none"
							style={{
								background: "var(--gb-accent)",
								color: "#fff8ee",
							}}
						>
							Edit Copy
						</button>
					)}

					{showNavigation && (
						<button
							type="button"
							onClick={onNext}
							disabled={!hasNext}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all hover:opacity-70 focus-visible:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
							style={{ color: "var(--gb-text-muted)" }}
							aria-label="Next diagram"
						>
							→
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
