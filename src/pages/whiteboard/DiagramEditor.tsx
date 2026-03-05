import { useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import type { Diagram, FretboardState } from "@/types";
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
	const [dotColor, setDotColor] = useState("#3B82F6");
	const [dotShape, setDotShape] = useState<"circle" | "square" | "diamond">("circle");
	const [lineStyle, setLineStyle] = useState<"solid" | "dashed">("solid");
	const [connectMode, setConnectMode] = useState(false);

	const handleFretClick = (pos: { string: number; fret: number }) => {
		const existingDotIndex = fretboardState.dots.findIndex(
			(d) => d.position.string === pos.string && d.position.fret === pos.fret,
		);

		if (existingDotIndex >= 0) {
			setFretboardState({
				...fretboardState,
				dots: fretboardState.dots.filter((_, i) => i !== existingDotIndex),
			});
		} else {
			setFretboardState({
				...fretboardState,
				dots: [
					...fretboardState.dots,
					{
						position: pos,
						color: dotColor,
						shape: dotShape,
					},
				],
			});
		}
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
				dotShape={dotShape}
				lineStyle={lineStyle}
				connectMode={connectMode}
				onDotColorChange={setDotColor}
				onDotShapeChange={setDotShape}
				onLineStyleChange={setLineStyle}
				onConnectModeChange={setConnectMode}
			/>

			<div className="border border-gray-300 rounded-lg p-4">
				<Fretboard
					mode="draw"
					state={fretboardState}
					onFretClick={handleFretClick}
					fretRange={[0, 12]}
				/>
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={!name.trim()}>
					Save
				</Button>
			</div>
		</div>
	);
}
