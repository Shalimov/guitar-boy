interface AnnotationToolbarProps {
	dotColor: string;
	dotLabel: string;
	dotShape: "circle" | "square" | "diamond";
	lineColor: string;
	lineStyle: "solid" | "dashed";
	connectMode: boolean;
	onDotColorChange: (color: string) => void;
	onDotLabelChange: (label: string) => void;
	onDotShapeChange: (shape: "circle" | "square" | "diamond") => void;
	onLineColorChange: (color: string) => void;
	onLineStyleChange: (style: "solid" | "dashed") => void;
	onConnectModeChange: (mode: boolean) => void;
}

export function AnnotationToolbar({
	dotColor,
	dotLabel,
	dotShape,
	lineColor,
	lineStyle,
	connectMode,
	onDotColorChange,
	onDotLabelChange,
	onDotShapeChange,
	onLineColorChange,
	onLineStyleChange,
	onConnectModeChange,
}: AnnotationToolbarProps) {
	return (
		<div className="flex flex-wrap items-center gap-4 border-b border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4">
			<div className="flex items-center gap-2">
				<label htmlFor="dot-color" className="text-sm font-medium text-[var(--gb-text)]">
					Dot Color
				</label>
				<input
					id="dot-color"
					type="color"
					value={dotColor}
					onChange={(e) => onDotColorChange(e.target.value)}
					className="h-8 w-8 cursor-pointer rounded border border-[var(--gb-border)]"
					aria-label="Dot color"
				/>
			</div>

			<div className="flex min-w-40 items-center gap-2">
				<label htmlFor="dot-label" className="text-sm font-medium text-[var(--gb-text)]">
					Dot Label
				</label>
				<input
					id="dot-label"
					type="text"
					value={dotLabel}
					onChange={(e) => onDotLabelChange(e.target.value)}
					className="w-full rounded border border-[var(--gb-border)] bg-[var(--gb-bg)] px-2 py-1 text-sm"
					maxLength={8}
					placeholder="R"
					aria-label="Dot label"
				/>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="dot-shape" className="text-sm font-medium text-[var(--gb-text)]">
					Dot Shape
				</label>
				<select
					id="dot-shape"
					value={dotShape}
					onChange={(e) => onDotShapeChange(e.target.value as "circle" | "square" | "diamond")}
					className="rounded border border-[var(--gb-border)] bg-[var(--gb-bg)] px-2 py-1 text-sm"
					aria-label="Dot shape"
				>
					<option value="circle">Circle</option>
					<option value="square">Square</option>
					<option value="diamond">Diamond</option>
				</select>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="line-color" className="text-sm font-medium text-[var(--gb-text)]">
					Line Color
				</label>
				<input
					id="line-color"
					type="color"
					value={lineColor}
					onChange={(e) => onLineColorChange(e.target.value)}
					className="h-8 w-8 cursor-pointer rounded border border-[var(--gb-border)]"
					aria-label="Line color"
				/>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="line-style" className="text-sm font-medium text-[var(--gb-text)]">
					Line Style
				</label>
				<select
					id="line-style"
					value={lineStyle}
					onChange={(e) => onLineStyleChange(e.target.value as "solid" | "dashed")}
					className="rounded border border-[var(--gb-border)] bg-[var(--gb-bg)] px-2 py-1 text-sm"
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
						connectMode
							? "bg-[var(--gb-accent)] text-[#fff7ef]"
							: "bg-[var(--gb-bg-panel)] text-[var(--gb-text)] hover:bg-[var(--gb-bg-tab)]"
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
