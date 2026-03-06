import { useState } from "react";
import { Button } from "@/components/ui";
import { allPatterns } from "@/data/patterns";
import { useDiagramStore } from "@/hooks/useDiagramStore";
import { DiagramEditor, DiagramViewer, PatternLibrary } from "@/pages/whiteboard";
import type { Diagram } from "@/types";

type PageView = "list" | "patterns" | "view" | "edit";

export function WhiteboardPage() {
	const [view, setView] = useState<PageView>("list");
	const [viewingDiagram, setViewingDiagram] = useState<Diagram | undefined>(undefined);
	const [editingDiagram, setEditingDiagram] = useState<Diagram | undefined>(undefined);
	const { store, addDiagram, updateDiagram, deleteDiagram, getUserDiagrams } = useDiagramStore();

	const userDiagrams = getUserDiagrams();

	// ── Navigation helpers ───────────────────────────────────────────────────

	const handleNewDiagram = () => {
		setEditingDiagram(undefined);
		setView("edit");
	};

	const handleViewDiagram = (diagram: Diagram) => {
		setViewingDiagram(diagram);
		setView("view");
	};

	const handleEditDiagram = (diagram: Diagram) => {
		setEditingDiagram(diagram);
		setView("edit");
	};

	/** Clone a diagram (built-in or user) and open the editor */
	const handleEditCopy = (pattern: Diagram) => {
		const cloned: Diagram = {
			...pattern,
			id: crypto.randomUUID(),
			name: `${pattern.name} (Copy)`,
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setEditingDiagram(cloned);
		setView("edit");
	};

	const handleSaveDiagram = (diagram: Diagram) => {
		const existing = store.diagrams.find((d) => d.id === diagram.id);
		if (existing) {
			updateDiagram(diagram);
		} else {
			addDiagram(diagram);
		}
		setView("list");
		setEditingDiagram(undefined);
	};

	const handleCancelEdit = () => {
		setView("list");
		setEditingDiagram(undefined);
	};

	const handleDeleteDiagram = (id: string) => {
		if (window.confirm("Are you sure you want to delete this diagram?")) {
			deleteDiagram(id);
		}
	};

	const handleBackFromView = () => {
		setViewingDiagram(undefined);
		// Return to whichever tab was active (patterns if it was a built-in, list otherwise)
		setView(viewingDiagram?.isBuiltIn ? "patterns" : "list");
	};

	// ── Views ────────────────────────────────────────────────────────────────

	if (view === "view" && viewingDiagram) {
		return (
			<div className="space-y-5">
				<DiagramViewer
					diagram={viewingDiagram}
					onBack={handleBackFromView}
					onEdit={!viewingDiagram.isBuiltIn ? () => handleEditDiagram(viewingDiagram) : undefined}
					onEditCopy={() => handleEditCopy(viewingDiagram)}
				/>
			</div>
		);
	}

	if (view === "edit") {
		return (
			<div className="space-y-5">
				<header className="space-y-2">
					<p className="gb-page-kicker">Diagram Editor</p>
					<h1 className="gb-page-title">{editingDiagram?.id ? "Edit Diagram" : "New Diagram"}</h1>
				</header>

				<section className="gb-panel p-4 md:p-5">
					<DiagramEditor
						diagram={editingDiagram}
						onSave={handleSaveDiagram}
						onCancel={handleCancelEdit}
					/>
				</section>
			</div>
		);
	}

	// ── List / Patterns tabs ─────────────────────────────────────────────────

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<p className="gb-page-kicker">Creative Workspace</p>
					<h1 className="gb-page-title">Whiteboard</h1>
					<p className="max-w-2xl text-sm text-[var(--gb-text-muted)]">
						Build custom shapes, duplicate built-in patterns, and keep your own fretboard notes.
					</p>
				</div>
				<Button onClick={handleNewDiagram}>New Diagram</Button>
			</header>

			{/* Tab bar */}
			<div className="flex flex-wrap gap-2 border-b border-[var(--gb-border)] pb-1">
				{(["list", "patterns"] as const).map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setView(tab)}
						className={`rounded-t-[14px] border px-4 py-2 text-sm font-semibold transition ${
							view === tab
								? "border-[var(--gb-border)] border-b-[var(--gb-bg)] bg-[var(--gb-bg-elev)] text-[var(--gb-text)]"
								: "border-transparent text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-tab)] hover:text-[var(--gb-text)]"
						}`}
					>
						{tab === "list" ? `My Diagrams (${userDiagrams.length})` : "Pattern Library"}
					</button>
				))}
			</div>

			{/* My Diagrams tab */}
			{view === "list" && (
				<div>
					{userDiagrams.length === 0 ? (
						<section className="gb-panel py-12 text-center">
							<p className="mb-4 text-[var(--gb-text-muted)]">
								No diagrams yet. Create your first diagram!
							</p>
							<Button onClick={handleNewDiagram}>Create Diagram</Button>
						</section>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{userDiagrams.map((diagram) => (
								<div
									key={diagram.id}
									className="gb-panel p-4 flex flex-col gap-3 transition-shadow hover:shadow-[var(--gb-shadow)]"
								>
									<div className="flex-1">
										<h3 className="text-base font-semibold text-[var(--gb-text)]">
											{diagram.name}
										</h3>
										{diagram.description && (
											<p className="mt-0.5 text-sm text-[var(--gb-text-muted)]">
												{diagram.description}
											</p>
										)}
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="secondary"
											onClick={() => handleViewDiagram(diagram)}
										>
											View
										</Button>
										<Button size="sm" onClick={() => handleEditDiagram(diagram)}>
											Edit
										</Button>
										<Button
											size="sm"
											variant="secondary"
											onClick={() => handleDeleteDiagram(diagram.id)}
										>
											Delete
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Pattern Library tab */}
			{view === "patterns" && (
				<PatternLibrary
					patterns={allPatterns}
					onViewPattern={handleViewDiagram}
					onEditCopy={handleEditCopy}
				/>
			)}
		</div>
	);
}
