import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Diagram, FretPosition } from "@/types";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { useDiagramHistory } from "./useDiagramHistory";

const GROUP_COLORS = [
	"#C46A2D",
	"#6B8E23",
	"#6A5ACD",
	"#CD5C5C",
	"#2E8B57",
	"#DAA520",
	"#9370DB",
	"#20B2AA",
	"#DB7093",
	"#4682B4",
];

interface DiagramEditorProps {
	diagram?: Diagram;
	onSave: (diagram: Diagram) => void;
	onCancel: () => void;
}

export function DiagramEditor({ diagram, onSave, onCancel }: DiagramEditorProps) {
	const [name, setName] = useState(diagram?.name || "");
	const [description, setDescription] = useState(diagram?.description || "");
	const { currentState, updateState, undo, redo, canUndo, canRedo } = useDiagramHistory(
		diagram?.fretboardState || { dots: [], lines: [] },
	);
	const [dotLabel, setDotLabel] = useState("");
	const [dotColor, setDotColor] = useState("#3B82F6");
	const [dotShape, setDotShape] = useState<"circle" | "square" | "diamond">("circle");
	const [pendingGroupDots, setPendingGroupDots] = useState<FretPosition[]>([]);
	const [groupColor, setGroupColor] = useState("#C46A2D");
	const [groupSelectionMode, setGroupSelectionMode] = useState(false);
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	const getNextGroupColor = (currentColor: string): string => {
		const currentIndex = GROUP_COLORS.indexOf(currentColor);
		const nextIndex = (currentIndex + 1) % GROUP_COLORS.length;
		return GROUP_COLORS[nextIndex];
	};

	const initialSnapshot = useMemo(
		() =>
			JSON.stringify({
				name: diagram?.name || "",
				description: diagram?.description || "",
				fretboardState: diagram?.fretboardState || { dots: [], lines: [] },
			}),
		[diagram],
	);
	const currentSnapshot = useMemo(
		() =>
			JSON.stringify({
				name,
				description,
				fretboardState: currentState,
			}),
		[name, description, currentState],
	);
	const hasUnsavedChanges = initialSnapshot !== currentSnapshot;

	useEffect(() => {
		if (!hasUnsavedChanges) {
			return;
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	const hasDotAt = (position: FretPosition): boolean => {
		return currentState.dots.some(
			(dot) => dot.position.string === position.string && dot.position.fret === position.fret,
		);
	};

	const isSamePosition = (a: FretPosition, b: FretPosition): boolean => {
		return a.string === b.string && a.fret === b.fret;
	};

	const clearGroupSelection = () => {
		setPendingGroupDots([]);
	};

	const toggleGroupSelection = (position: FretPosition) => {
		if (!hasDotAt(position)) {
			return;
		}

		setPendingGroupDots((prev) => {
			const isAlreadySelected = prev.some((candidate) => isSamePosition(candidate, position));
			if (isAlreadySelected) {
				return prev.filter((candidate) => !isSamePosition(candidate, position));
			}

			return [...prev, position];
		});
	};

	const handleFretClick = (pos: FretPosition) => {
		if (groupSelectionMode) {
			if (hasDotAt(pos)) {
				toggleGroupSelection(pos);
			}
			return;
		}

		const existingDotIndex = currentState.dots.findIndex(
			(d) => d.position.string === pos.string && d.position.fret === pos.fret,
		);

		if (existingDotIndex >= 0) {
			setPendingGroupDots((prev) => prev.filter((candidate) => !isSamePosition(candidate, pos)));
			updateState({
				...currentState,
				dots: currentState.dots.filter((_, i) => i !== existingDotIndex),
				lines: currentState.lines.filter(
					(line) =>
						!(line.from.string === pos.string && line.from.fret === pos.fret) &&
						!(line.to.string === pos.string && line.to.fret === pos.fret),
				),
				groups:
					currentState.groups
						?.map((g) => ({
							...g,
							positions: g.positions.filter(
								(p) => !(p.string === pos.string && p.fret === pos.fret),
							),
						}))
						.filter((g) => g.positions.length > 0) || [],
			});
		} else {
			updateState({
				...currentState,
				dots: [
					...currentState.dots,
					{
						position: pos,
						label: dotLabel.trim() || undefined,
						color: dotColor,
						shape: dotShape,
					},
				],
				groups: currentState.groups || [],
			});
		}
	};

	const handleClearDiagram = () => {
		setShowClearConfirm(true);
	};

	const handleConfirmClear = () => {
		updateState({ dots: [], lines: [], groups: [] });
		clearGroupSelection();
		setShowClearConfirm(false);
	};

	const handleFinishGroup = () => {
		if (pendingGroupDots.length < 2) {
			clearGroupSelection();
			return;
		}

		updateState({
			...currentState,
			groups: [
				...(currentState.groups || []),
				{
					id: crypto.randomUUID(),
					positions: pendingGroupDots,
					color: groupColor,
					strokeWidth: 2,
					fillOpacity: 0.2,
				},
			],
		});
		clearGroupSelection();
		setGroupColor(getNextGroupColor(groupColor));
	};

	const handleCancel = () => {
		if (hasUnsavedChanges) {
			setShowDiscardConfirm(true);
			return;
		}

		onCancel();
	};

	const handleConfirmDiscard = () => {
		setShowDiscardConfirm(false);
		onCancel();
	};

	const handleSave = () => {
		const now = new Date().toISOString();
		const updatedDiagram: Diagram = {
			id: diagram?.id || crypto.randomUUID(),
			name,
			description,
			createdAt: diagram?.createdAt || now,
			updatedAt: now,
			fretboardState: currentState,
			isBuiltIn: false,
		};

		onSave(updatedDiagram);
	};

	const toggleGroupSelectionMode = () => {
		setGroupSelectionMode((prev) => !prev);
		if (!groupSelectionMode) {
			clearGroupSelection();
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<label
						htmlFor="diagram-name"
						className="block text-xs font-bold tracking-widest uppercase mb-1"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Name
					</label>
					<input
						id="diagram-name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
						style={{
							background: "var(--gb-bg-elev)",
							border: "1px solid var(--gb-border)",
							color: "var(--gb-text)",
						}}
						placeholder="Diagram name"
					/>
				</div>
				<div className="flex-1">
					<label
						htmlFor="diagram-description"
						className="block text-xs font-bold tracking-widest uppercase mb-1"
						style={{ color: "var(--gb-text-muted)" }}
					>
						Description (optional)
					</label>
					<input
						id="diagram-description"
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors"
						style={{
							background: "var(--gb-bg-elev)",
							border: "1px solid var(--gb-border)",
							color: "var(--gb-text)",
						}}
						placeholder="Description"
					/>
				</div>
			</div>

			<AnnotationToolbar
				dotColor={dotColor}
				dotLabel={dotLabel}
				dotShape={dotShape}
				groupColor={groupColor}
				groupSelectionMode={groupSelectionMode}
				selectedGroupCount={pendingGroupDots.length}
				canCreateGroup={pendingGroupDots.length >= 2}
				onDotColorChange={setDotColor}
				onDotLabelChange={setDotLabel}
				onDotShapeChange={setDotShape}
				onGroupColorChange={setGroupColor}
				onGroupSelectionModeChange={toggleGroupSelectionMode}
				onCreateGroup={handleFinishGroup}
				onClearSelection={clearGroupSelection}
			/>

			<div className="flex gap-2">
				<Button variant="secondary" onClick={undo} disabled={!canUndo}>
					Undo
				</Button>
				<Button variant="secondary" onClick={redo} disabled={!canRedo}>
					Redo
				</Button>
				{pendingGroupDots.length > 0 && (
					<div className="flex gap-2">
						<Button variant="secondary" onClick={clearGroupSelection}>
							Clear Group Selection
						</Button>
						<Button onClick={handleFinishGroup}>Finish Group ({pendingGroupDots.length})</Button>
					</div>
				)}
				<Button variant="secondary" onClick={handleClearDiagram}>
					Clear Diagram
				</Button>
			</div>

			<div className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4">
				<Fretboard
					mode="draw"
					state={currentState}
					onFretClick={handleFretClick}
					selectedPositions={pendingGroupDots}
					fretRange={[1, 15]}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={handleCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={!name.trim()}>
					Save
				</Button>
			</div>

			<ConfirmDialog
				isOpen={showClearConfirm}
				onClose={() => setShowClearConfirm(false)}
				onConfirm={handleConfirmClear}
				title="Clear Diagram"
				message="Clear all markers, groups, and connections from the diagram? This cannot be undone."
				confirmText="Clear"
				confirmVariant="secondary"
			/>

			<ConfirmDialog
				isOpen={showDiscardConfirm}
				onClose={() => setShowDiscardConfirm(false)}
				onConfirm={handleConfirmDiscard}
				title="Discard Changes"
				message="You have unsaved changes. Are you sure you want to discard them?"
				confirmText="Discard"
				confirmVariant="secondary"
			/>
		</div>
	);
}
