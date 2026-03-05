import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import type { Diagram, FretboardState, FretPosition } from "@/types";
import { AnnotationToolbar } from "./AnnotationToolbar";

interface DiagramEditorProps {
	diagram?: Diagram;
	onSave: (diagram: Diagram) => void;
	onCancel: () => void;
}

export function DiagramEditor({ diagram, onSave, onCancel }: DiagramEditorProps) {
	const [name, setName] = useState(diagram?.name || "");
	const [description, setDescription] = useState(diagram?.description || "");
	const [fretboardState, setFretboardState] = useState<FretboardState>(
		diagram?.fretboardState || { dots: [], lines: [] },
	);
	const [dotLabel, setDotLabel] = useState("");
	const [dotColor, setDotColor] = useState("#3B82F6");
	const [dotShape, setDotShape] = useState<"circle" | "square" | "diamond">("circle");
	const [lineColor, setLineColor] = useState("#4A3A2C");
	const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
	const [connectMode, setConnectMode] = useState(false);
	const [pendingLineStart, setPendingLineStart] = useState<FretPosition | null>(null);

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
				fretboardState,
			}),
		[name, description, fretboardState],
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
		return fretboardState.dots.some(
			(dot) => dot.position.string === position.string && dot.position.fret === position.fret,
		);
	};

	const isSamePosition = (a: FretPosition, b: FretPosition): boolean => {
		return a.string === b.string && a.fret === b.fret;
	};

	const hasLineBetween = (from: FretPosition, to: FretPosition): boolean => {
		return fretboardState.lines.some(
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

		setFretboardState((previousState) => ({
			...previousState,
			lines: [
				...previousState.lines,
				{
					from,
					to,
					style: lineStyle,
					color: lineColor,
				},
			],
		}));
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

		const existingDotIndex = fretboardState.dots.findIndex(
			(d) => d.position.string === pos.string && d.position.fret === pos.fret,
		);

		if (existingDotIndex >= 0) {
			setPendingLineStart(null);
			setFretboardState({
				...fretboardState,
				dots: fretboardState.dots.filter((_, i) => i !== existingDotIndex),
				lines: fretboardState.lines.filter(
					(line) =>
						!(line.from.string === pos.string && line.from.fret === pos.fret) &&
						!(line.to.string === pos.string && line.to.fret === pos.fret),
				),
			});
		} else {
			setFretboardState({
				...fretboardState,
				dots: [
					...fretboardState.dots,
					{
						position: pos,
						label: dotLabel.trim() || undefined,
						color: dotColor,
						shape: dotShape,
					},
				],
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
			fretboardState,
			isBuiltIn: false,
		};

		onSave(updatedDiagram);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<label htmlFor="diagram-name" className="block text-sm font-medium text-gray-700 mb-1">
						Name
					</label>
					<input
						id="diagram-name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Diagram name"
					/>
				</div>
				<div className="flex-1">
					<label
						htmlFor="diagram-description"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						Description (optional)
					</label>
					<input
						id="diagram-description"
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
				onDotColorChange={setDotColor}
				onDotLabelChange={setDotLabel}
				onDotShapeChange={setDotShape}
				onLineColorChange={setLineColor}
				onLineStyleChange={setLineStyle}
				onConnectModeChange={(enabled) => {
					setConnectMode(enabled);
					setPendingLineStart(null);
				}}
			/>

			<div className="rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg)] p-4">
				<Fretboard
					mode="draw"
					state={fretboardState}
					onFretClick={handleFretClick}
					onLineDrawn={connectMode ? handleLineDrawn : undefined}
					selectedPositions={pendingLineStart ? [pendingLineStart] : []}
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
