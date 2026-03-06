import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import type { Diagram, FretPosition } from "@/types";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { useDiagramHistory } from "./useDiagramHistory";

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
	const [lineColor, setLineColor] = useState("#4A3A2C");
	const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
	const [connectMode, setConnectMode] = useState(false);
	const [groupMode, setGroupMode] = useState(false);
	const [pendingLineStart, setPendingLineStart] = useState<FretPosition | null>(null);
	const [pendingGroupDots, setPendingGroupDots] = useState<FretPosition[]>([]);
	const [groupColor, setGroupColor] = useState("#8B5CF6"); // dark purple

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

	const hasLineBetween = (from: FretPosition, to: FretPosition): boolean => {
		return currentState.lines.some(
			(line) =>
				(isSamePosition(line.from, from) && isSamePosition(line.to, to)) ||
				(isSamePosition(line.from, to) && isSamePosition(line.to, from)),
		);
	};

	const addConnectionLine = (from: FretPosition, to: FretPosition) => {
		if (isSamePosition(from, to) || hasLineBetween(from, to)) {
			return;
		}

		if (!hasDotAt(from) || !hasDotAt(to)) {
			return;
		}

		updateState({
			...currentState,
			lines: [
				...currentState.lines,
				{
					from,
					to,
					style: lineStyle,
					color: lineColor,
				},
			],
			groups: currentState.groups || [],
		});
	};

	const handleFretClick = (pos: FretPosition) => {
		if (connectMode) {
			if (!hasDotAt(pos)) {
				setPendingLineStart(null);
				return;
			}

			if (!pendingLineStart) {
				setPendingLineStart(pos);
				return;
			}

			if (isSamePosition(pendingLineStart, pos)) {
				setPendingLineStart(null);
				return;
			}

			addConnectionLine(pendingLineStart, pos);
			setPendingLineStart(null);
			return;
		}

		if (groupMode) {
			if (!hasDotAt(pos)) {
				return;
			}

			setPendingGroupDots((prev) => {
				const isAlreadySelected = prev.some((p) => isSamePosition(p, pos));
				if (isAlreadySelected) {
					return prev.filter((p) => !isSamePosition(p, pos));
				}
				return [...prev, pos];
			});
			return;
		}

		const existingDotIndex = currentState.dots.findIndex(
			(d) => d.position.string === pos.string && d.position.fret === pos.fret,
		);

		if (existingDotIndex >= 0) {
			setPendingLineStart(null);
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

	const handleLineDrawn = (from: FretPosition, to: FretPosition) => {
		if (!connectMode) {
			return;
		}

		addConnectionLine(from, to);
		setPendingLineStart(null);
	};

	const handleClearDiagram = () => {
		if (!window.confirm("Clear all dots and lines from the diagram? This cannot be undone.")) {
			return;
		}

		updateState({ dots: [], lines: [], groups: [] });
		setPendingLineStart(null);
		setPendingGroupDots([]);
	};

	const handleCancelPendingLine = () => {
		setPendingLineStart(null);
	};

	const handleFinishGroup = () => {
		if (pendingGroupDots.length < 2) {
			setPendingGroupDots([]);
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
		setPendingGroupDots([]);
	};

	const handleCancel = () => {
		if (hasUnsavedChanges && !window.confirm("Discard unsaved changes?")) {
			return;
		}

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
				lineColor={lineColor}
				lineStyle={lineStyle}
				connectMode={connectMode}
				groupMode={groupMode}
				groupColor={groupColor}
				onDotColorChange={setDotColor}
				onDotLabelChange={setDotLabel}
				onDotShapeChange={setDotShape}
				onLineColorChange={setLineColor}
				onLineStyleChange={setLineStyle}
				onConnectModeChange={(enabled) => {
					setConnectMode(enabled);
					setPendingLineStart(null);
					if (enabled) setPendingGroupDots([]);
				}}
				onGroupModeChange={(enabled) => {
					setGroupMode(enabled);
					if (enabled) {
						setPendingGroupDots([]);
						setPendingLineStart(null);
					}
				}}
				onGroupColorChange={setGroupColor}
			/>

			<div className="flex gap-2">
				<Button variant="secondary" onClick={undo} disabled={!canUndo}>
					Undo
				</Button>
				<Button variant="secondary" onClick={redo} disabled={!canRedo}>
					Redo
				</Button>
				{connectMode && pendingLineStart && (
					<Button variant="secondary" onClick={handleCancelPendingLine}>
						Cancel Line
					</Button>
				)}
				{groupMode && pendingGroupDots.length > 0 && (
					<div className="flex gap-2">
						<Button variant="secondary" onClick={() => setPendingGroupDots([])}>
							Cancel Group
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
					onLineDrawn={connectMode ? handleLineDrawn : undefined}
					selectedPositions={
						pendingLineStart ? [pendingLineStart] : groupMode ? pendingGroupDots : []
					}
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
		</div>
	);
}
