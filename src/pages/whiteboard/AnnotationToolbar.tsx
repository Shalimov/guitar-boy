interface AnnotationToolbarProps {
	dotColor: string;
	dotShape: "circle" | "square" | "diamond";
	lineStyle: "solid" | "dashed";
	connectMode: boolean;
	onDotColorChange: (color: string) => void;
	onDotShapeChange: (shape: "circle" | "square" | "diamond") => void;
	onLineStyleChange: (style: "solid" | "dashed") => void;
	onConnectModeChange: (mode: boolean) => void;
}

export function AnnotationToolbar({
	dotColor,
	dotShape,
	lineStyle,
	connectMode,
	onDotColorChange,
	onDotShapeChange,
	onLineStyleChange,
	onConnectModeChange,
}: AnnotationToolbarProps) {
	return (
		<div className="flex items-center gap-4 p-4 bg-white border-b border-gray-200">
			<div className="flex items-center gap-2">
				<label htmlFor="dot-color" className="text-sm font-medium text-gray-700">
					Dot Color
				</label>
				<input
					id="dot-color"
					type="color"
					value={dotColor}
					onChange={(e) => onDotColorChange(e.target.value)}
					className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
					aria-label="Dot color"
				/>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="dot-shape" className="text-sm font-medium text-gray-700">
					Dot Shape
				</label>
				<select
					id="dot-shape"
					value={dotShape}
					onChange={(e) => onDotShapeChange(e.target.value as "circle" | "square" | "diamond")}
					className="px-2 py-1 border border-gray-300 rounded text-sm"
					aria-label="Dot shape"
				>
					<option value="circle">Circle</option>
					<option value="square">Square</option>
					<option value="diamond">Diamond</option>
				</select>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="line-style" className="text-sm font-medium text-gray-700">
					Line Style
				</label>
				<select
					id="line-style"
					value={lineStyle}
					onChange={(e) => onLineStyleChange(e.target.value as "solid" | "dashed")}
					className="px-2 py-1 border border-gray-300 rounded text-sm"
					aria-label="Line style"
				>
					<option value="solid">Solid</option>
					<option value="dashed">Dashed</option>
				</select>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={() => onConnectModeChange(!connectMode)}
					className={`px-4 py-2 rounded text-sm font-medium ${
						connectMode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
					}`}
					aria-label="Connect mode"
					aria-pressed={connectMode}
				>
					Connect
				</button>
			</div>
		</div>
	);
}
