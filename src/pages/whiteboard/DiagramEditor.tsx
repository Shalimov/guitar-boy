import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Diagram, FretPosition } from "@/types";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { useDiagramHistory } from "./useDiagramHistory";

interface GroupContextMenuState {
	position: FretPosition;
	x: number;
	y: number;
}

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
	const [groupContextMenu, setGroupContextMenu] = useState<GroupContextMenuState | null>(null);
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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

	const isPositionSelectedForGroup = (position: FretPosition): boolean => {
		return pendingGroupDots.some((candidate) => isSamePosition(candidate, position));
	};

	const clearGroupSelection = () => {
		setPendingGroupDots([]);
		setGroupContextMenu(null);
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
		setGroupContextMenu(null);

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

	const handleFretContextMenu = (position: FretPosition, location: { x: number; y: number }) => {
		if (!hasDotAt(position)) {
			setGroupContextMenu(null);
			return;
		}

		setGroupContextMenu({
			position,
			x: location.x,
			y: location.y,
		});
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
	};

	useEffect(() => {
		if (!groupContextMenu) {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (target instanceof HTMLElement && target.closest("[data-group-context-menu='true']")) {
				return;
			}

			setGroupContextMenu(null);
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setGroupContextMenu(null);
			}
		};

		window.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("keydown", handleEscape);
		return () => {
			window.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("keydown", handleEscape);
		};
	}, [groupContextMenu]);

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
				selectedGroupCount={pendingGroupDots.length}
				canCreateGroup={pendingGroupDots.length >= 2}
				onDotColorChange={setDotColor}
				onDotLabelChange={setDotLabel}
				onDotShapeChange={setDotShape}
				onGroupColorChange={setGroupColor}
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
					onFretContextMenu={handleFretContextMenu}
					selectedPositions={pendingGroupDots}
					fretRange={[1, 15]}
				/>
				{groupContextMenu && (
					<div
						role="menu"
						aria-label="Group actions"
						className="fixed z-50 min-w-52 rounded-xl border px-2 py-2 shadow-[0_18px_48px_rgba(28,20,12,0.24)]"
						style={{
							left: groupContextMenu.x,
							top: groupContextMenu.y,
							background: "var(--gb-bg-panel)",
							borderColor: "var(--gb-border)",
						}}
						data-group-context-menu="true"
						onPointerDown={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							role="menuitem"
							onClick={() => {
								toggleGroupSelection(groupContextMenu.position);
								setGroupContextMenu(null);
							}}
							className="flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gb-bg-elev)]"
							style={{ color: "var(--gb-text)" }}
						>
							{isPositionSelectedForGroup(groupContextMenu.position)
								? "Remove from group selection"
								: "Add to group selection"}
						</button>
						<button
							type="button"
							role="menuitem"
							onClick={handleFinishGroup}
							disabled={pendingGroupDots.length < 2}
							className="flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gb-bg-elev)] disabled:cursor-not-allowed disabled:opacity-50"
							style={{ color: "var(--gb-text)" }}
						>
							Create group from selection
						</button>
						<button
							type="button"
							role="menuitem"
							onClick={clearGroupSelection}
							disabled={pendingGroupDots.length === 0}
							className="flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gb-bg-elev)] disabled:cursor-not-allowed disabled:opacity-50"
							style={{ color: "var(--gb-text)" }}
						>
							Clear selection
						</button>
					</div>
				)}
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
