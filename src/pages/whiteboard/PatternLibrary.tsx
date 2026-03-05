import type { Diagram } from "@/types";

interface PatternLibraryProps {
	patterns: Diagram[];
	onSelectPattern: (diagram: Diagram) => void;
}

export function PatternLibrary({ patterns, onSelectPattern }: PatternLibraryProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold text-gray-900">Built-in Patterns</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{patterns.map((pattern) => (
					<button
						key={pattern.id}
						type="button"
						onClick={() => onSelectPattern(pattern)}
						className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
					>
						<h3 className="font-medium text-gray-900">{pattern.name}</h3>
						{pattern.description && (
							<p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
						)}
					</button>
				))}
			</div>
		</div>
	);
}
