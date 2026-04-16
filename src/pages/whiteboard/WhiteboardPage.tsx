import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Fretboard } from "@/components/fretboard";
import { Button, TabBar } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { allPatterns } from "@/data/patterns";
import { useDiagramStore } from "@/hooks/useDiagramStore";
import { DiagramEditor, DiagramViewer, PatternLibrary } from "@/pages/whiteboard";
import type { Diagram } from "@/types";

type PageView = "list" | "patterns" | "view" | "edit";

const BUILT_IN_IDS = new Set(allPatterns.map((pattern) => pattern.id));

function DiagramPreview({ diagram }: { diagram: Diagram }) {
	return (
		<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg)] p-2">
			<div className="pointer-events-none origin-top scale-[0.8] overflow-hidden rounded-[var(--gb-radius-card)]">
				<Fretboard
					mode="view"
					state={diagram.fretboardState}
					fretRange={[1, 12]}
					showNoteNames={false}
					showFretNumbers={false}
					showStringLabels={false}
				/>
			</div>
		</div>
	);
}

export function WhiteboardPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const params = useParams<{ "*": string }>();
	const pathSegments = (params["*"] ?? "")
		.split("/")
		.map((segment) => segment.trim())
		.filter(Boolean);

	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const { store, addDiagram, updateDiagram, deleteDiagram, getUserDiagrams } = useDiagramStore();

	const userDiagrams = getUserDiagrams();
	const routeKind = pathSegments[0] ?? "list";
	const routeId = pathSegments[1] ?? null;

	const pageView: PageView =
		routeKind === "patterns"
			? "patterns"
			: routeKind === "view"
				? "view"
				: routeKind === "edit"
					? "edit"
					: "list";

	const stateDiagram = (location.state as { diagram?: Diagram } | null)?.diagram;
	const allViewableDiagrams = useMemo(() => [...userDiagrams, ...allPatterns], [userDiagrams]);
	const viewingDiagram =
		pageView === "view" && routeId
			? allViewableDiagrams.find((diagram) => diagram.id === routeId)
			: undefined;
	const editingDiagram =
		pageView === "edit" && routeId
			? userDiagrams.find((diagram) => diagram.id === routeId)
			: undefined;

	const handleNewDiagram = () => {
		navigate("/whiteboard/edit/new");
	};

	const handleViewDiagram = (diagram: Diagram) => {
		navigate(`/whiteboard/view/${diagram.id}`);
	};

	const handleEditDiagram = (diagram: Diagram) => {
		navigate(`/whiteboard/edit/${diagram.id}`);
	};

	const handleEditCopy = (pattern: Diagram) => {
		const cloned: Diagram = {
			...pattern,
			id: crypto.randomUUID(),
			name: `${pattern.name} (Copy)`,
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		navigate(`/whiteboard/edit/${cloned.id}`, { state: { diagram: cloned } });
	};

	const handleSaveDiagram = (diagram: Diagram) => {
		const existing = store.diagrams.find((current) => current.id === diagram.id);
		if (existing && !BUILT_IN_IDS.has(diagram.id)) {
			updateDiagram(diagram);
		} else {
			addDiagram(diagram);
		}
		navigate("/whiteboard");
	};

	const handleCancelEdit = () => {
		navigate("/whiteboard");
	};

	const handleDeleteDiagram = (id: string) => {
		setDeleteConfirmId(id);
	};

	const handleConfirmDelete = () => {
		if (deleteConfirmId) {
			deleteDiagram(deleteConfirmId);
			setDeleteConfirmId(null);
		}
	};

	const handleBackFromView = () => {
		navigate(viewingDiagram?.isBuiltIn ? "/whiteboard/patterns" : "/whiteboard");
	};

	const getCurrentDiagramList = (): Diagram[] => {
		return viewingDiagram?.isBuiltIn ? allPatterns : userDiagrams;
	};

	const currentDiagramIndex = viewingDiagram
		? getCurrentDiagramList().findIndex((diagram) => diagram.id === viewingDiagram.id)
		: -1;

	const hasPrevious = currentDiagramIndex > 0;
	const hasNext =
		currentDiagramIndex >= 0 && currentDiagramIndex < getCurrentDiagramList().length - 1;

	const handlePreviousDiagram = () => {
		if (!viewingDiagram || !hasPrevious) return;
		const list = getCurrentDiagramList();
		navigate(`/whiteboard/view/${list[currentDiagramIndex - 1].id}`);
	};

	const handleNextDiagram = () => {
		if (!viewingDiagram || !hasNext) return;
		const list = getCurrentDiagramList();
		navigate(`/whiteboard/view/${list[currentDiagramIndex + 1].id}`);
	};

	if (routeKind === "view" && !viewingDiagram) {
		return <Navigate to="/whiteboard" replace />;
	}

	if (routeKind === "edit" && routeId && routeId !== "new" && !editingDiagram) {
		if (!stateDiagram || stateDiagram.id !== routeId) {
			return <Navigate to="/whiteboard" replace />;
		}
	}

	if (pageView === "view" && viewingDiagram) {
		return (
			<div className="space-y-5">
				<DiagramViewer
					diagram={viewingDiagram}
					onBack={handleBackFromView}
					onEdit={!viewingDiagram.isBuiltIn ? () => handleEditDiagram(viewingDiagram) : undefined}
					onEditCopy={() => handleEditCopy(viewingDiagram)}
					onPrevious={handlePreviousDiagram}
					onNext={handleNextDiagram}
					hasPrevious={hasPrevious}
					hasNext={hasNext}
				/>
			</div>
		);
	}

	if (pageView === "edit") {
		const routedDiagram = routeId === "new" ? undefined : editingDiagram;
		const diagramToEdit = routedDiagram ?? stateDiagram;

		return (
			<div className="space-y-5">
				<header className="space-y-2">
					<p className="gb-page-kicker">Diagram Editor</p>
					<h1 className="gb-page-title">{routeId === "new" ? "New Diagram" : "Edit Diagram"}</h1>
				</header>

				<section className="gb-panel p-4 md:p-5">
					<DiagramEditor
						diagram={diagramToEdit}
						onSave={handleSaveDiagram}
						onCancel={handleCancelEdit}
					/>
				</section>
			</div>
		);
	}

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

			<section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
				<div className="gb-panel p-5">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						How to use it
					</p>
					<h2 className="mt-2 text-xl font-semibold text-[var(--gb-text)]">
						Sketch, save, and refine your own fretboard ideas
					</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						Use My Diagrams for your own shapes and the library when you want a starting template.
					</p>
				</div>

				<div className="gb-panel p-5">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
						Workspace snapshot
					</p>
					<div className="mt-3 grid grid-cols-2 gap-3">
						<div className="rounded-[var(--gb-radius-card)] bg-[var(--gb-bg-panel)] px-4 py-3">
							<div className="text-xs uppercase tracking-[0.16em] text-[var(--gb-text-muted)]">
								My diagrams
							</div>
							<div className="mt-1 text-2xl font-extrabold text-[var(--gb-text)]">
								{userDiagrams.length}
							</div>
						</div>
						<div className="rounded-[var(--gb-radius-card)] bg-[var(--gb-bg-panel)] px-4 py-3">
							<div className="text-xs uppercase tracking-[0.16em] text-[var(--gb-text-muted)]">
								Built-in ideas
							</div>
							<div className="mt-1 text-2xl font-extrabold text-[var(--gb-text)]">
								{allPatterns.length}
							</div>
						</div>
					</div>
				</div>
			</section>

			<TabBar
				tabs={[
					{
						label: `My Diagrams (${userDiagrams.length})`,
						active: pageView === "list",
						onClick: () => navigate("/whiteboard"),
					},
					{
						label: "Pattern Library",
						active: pageView === "patterns",
						onClick: () => navigate("/whiteboard/patterns"),
					},
				]}
			/>

			{pageView === "list" && (
				<div key="list" className="animate-gb-fade-in animate-gb-duration-200">
					{userDiagrams.length === 0 ? (
						<section className="gb-panel py-12 text-center">
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gb-text-muted)]">
								My diagrams
							</p>
							<h2 className="mt-2 text-2xl font-semibold text-[var(--gb-text)]">No diagrams yet</h2>
							<p className="mx-auto mb-4 mt-2 max-w-xl text-[var(--gb-text-muted)]">
								Create your first diagram to save fingerings, shape studies, and custom note maps.
							</p>
							<Button onClick={handleNewDiagram}>Create Diagram</Button>
						</section>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
							{userDiagrams.map((diagram) => (
								<div
									key={diagram.id}
									className="gb-panel flex flex-col gap-3 p-4 transition-shadow hover:shadow-[var(--gb-shadow)]"
								>
									<DiagramPreview diagram={diagram} />
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

			{pageView === "patterns" && (
				<div key="patterns" className="animate-gb-fade-in animate-gb-duration-200">
					<PatternLibrary
						patterns={allPatterns}
						onViewPattern={handleViewDiagram}
						onEditCopy={handleEditCopy}
					/>
				</div>
			)}

			<ConfirmDialog
				isOpen={deleteConfirmId !== null}
				onClose={() => setDeleteConfirmId(null)}
				onConfirm={handleConfirmDelete}
				title="Delete Diagram"
				message="Are you sure you want to delete this diagram?"
				confirmText="Delete"
				confirmVariant="secondary"
			/>
		</div>
	);
}
