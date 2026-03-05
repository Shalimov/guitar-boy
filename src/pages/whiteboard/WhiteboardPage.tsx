import { useState } from "react";
import { Button } from "@/components/ui";
import { allPatterns } from "@/data/patterns";
import { useDiagramStore } from "@/hooks/useDiagramStore";
import { DiagramEditor, PatternLibrary } from "@/pages/whiteboard";
import type { Diagram } from "@/types";

export function WhiteboardPage() {
	const [view, setView] = useState<"list" | "patterns" | "edit">("list");
	const [editingDiagram, setEditingDiagram] = useState<Diagram | undefined>(undefined);
	const { store, addDiagram, updateDiagram, deleteDiagram, getUserDiagrams } = useDiagramStore();

	const userDiagrams = getUserDiagrams();

	const handleNewDiagram = () => {
		setEditingDiagram(undefined);
		setView("edit");
	};

	const handleEditDiagram = (diagram: Diagram) => {
		setEditingDiagram(diagram);
		setView("edit");
	};

	const handleSelectPattern = (pattern: Diagram) => {
		const clonedDiagram: Diagram = {
			...pattern,
			id: crypto.randomUUID(),
			name: `${pattern.name} (Copy)`,
			isBuiltIn: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};
		setEditingDiagram(clonedDiagram);
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

	if (view === "edit") {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">
						{editingDiagram?.id ? "Edit Diagram" : "New Diagram"}
					</h1>
				</div>
				<DiagramEditor
					diagram={editingDiagram}
					onSave={handleSaveDiagram}
					onCancel={handleCancelEdit}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Whiteboard</h1>
				<Button onClick={handleNewDiagram}>New Diagram</Button>
			</div>

			<div className="flex gap-4 border-b border-gray-200">
				<button
					type="button"
					onClick={() => setView("list")}
					className={`px-4 py-2 font-medium ${
						view === "list"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					My Diagrams ({userDiagrams.length})
				</button>
				<button
					type="button"
					onClick={() => setView("patterns")}
					className={`px-4 py-2 font-medium ${
						view === "patterns"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-600 hover:text-gray-900"
					}`}
				>
					Pattern Library
				</button>
			</div>

			{view === "list" && (
				<div>
					{userDiagrams.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-600 mb-4">No diagrams yet. Create your first diagram!</p>
							<Button onClick={handleNewDiagram}>Create Diagram</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{userDiagrams.map((diagram) => (
								<div
									key={diagram.id}
									className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<h3 className="font-medium text-gray-900 mb-1">{diagram.name}</h3>
									{diagram.description && (
										<p className="text-sm text-gray-600 mb-3">{diagram.description}</p>
									)}
									<div className="flex gap-2">
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

			{view === "patterns" && (
				<PatternLibrary patterns={allPatterns} onSelectPattern={handleSelectPattern} />
			)}
		</div>
	);
}
