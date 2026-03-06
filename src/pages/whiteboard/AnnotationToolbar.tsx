interface AnnotationToolbarProps {
	dotColor: string;
	dotLabel: string;
	dotShape: "circle" | "square" | "diamond";
	lineColor: string;
	lineStyle: "solid" | "dashed";
	connectMode: boolean;
	groupMode: boolean;
	groupColor: string;
	onDotColorChange: (color: string) => void;
	onDotLabelChange: (label: string) => void;
	onDotShapeChange: (shape: "circle" | "square" | "diamond") => void;
	onLineColorChange: (color: string) => void;
	onLineStyleChange: (style: "solid" | "dashed") => void;
	onConnectModeChange: (mode: boolean) => void;
	onGroupModeChange: (mode: boolean) => void;
	onGroupColorChange: (color: string) => void;
}

// Shared label style
const labelCls = "text-xs font-semibold tracking-wide uppercase whitespace-nowrap";
const labelStyle = { color: "var(--gb-text-muted)" };

// Small color picker swatch
function ColorSwatch({
	id,
	value,
	onChange,
	label,
}: {
	id: string;
	value: string;
	onChange: (v: string) => void;
	label: string;
}) {
	return (
		<div className="flex items-center gap-1.5">
			<label htmlFor={id} className={labelCls} style={labelStyle}>
				{label}
			</label>
			<input
				id={id}
				type="color"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-7 w-7 cursor-pointer rounded border"
				style={{ borderColor: "var(--gb-border)" }}
				aria-label={label}
			/>
		</div>
	);
}

export function AnnotationToolbar({
	dotColor,
	dotLabel,
	dotShape,
	lineColor,
	lineStyle,
	connectMode,
	groupMode,
	groupColor,
	onDotColorChange,
	onDotLabelChange,
	onDotShapeChange,
	onLineColorChange,
	onLineStyleChange,
	onConnectModeChange,
	onGroupModeChange,
	onGroupColorChange,
}: AnnotationToolbarProps) {
	const activeTool: "dot" | "line" | "group" = connectMode ? "line" : groupMode ? "group" : "dot";

	const setTool = (tool: "dot" | "line" | "group") => {
		onConnectModeChange(tool === "line");
		onGroupModeChange(tool === "group");
	};

	return (
		<div
			className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3"
			style={{
				background: "var(--gb-bg-panel)",
				border: "1px solid var(--gb-border)",
			}}
		>
			{/* ── Tool mode pill ── */}
			<div
				className="flex items-center rounded-lg p-0.5 flex-shrink-0"
				style={{ background: "var(--gb-bg-tab)" }}
			>
				{(["dot", "line", "group"] as const).map((tool) => (
					<button
						key={tool}
						type="button"
						onClick={() => setTool(tool)}
						aria-pressed={activeTool === tool}
						className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus-visible:outline-none"
						style={
							activeTool === tool
								? {
										background: "var(--gb-accent)",
										color: "#fff8ee",
										boxShadow: "0 1px 4px rgba(179,93,42,0.3)",
									}
								: {
										color: "var(--gb-text)",
									}
						}
					>
						{tool === "dot" ? "Dot" : tool === "line" ? "Line" : "Group"}
					</button>
				))}
			</div>

			{/* ── Divider ── */}
			<div className="h-6 w-px flex-shrink-0" style={{ background: "var(--gb-border)" }} />

			{/* ── Contextual settings ── */}
			{activeTool === "dot" && (
				<>
					<ColorSwatch id="dot-color" label="Color" value={dotColor} onChange={onDotColorChange} />

					<div className="flex items-center gap-1.5">
						<label htmlFor="dot-label" className={labelCls} style={labelStyle}>
							Label
						</label>
						<input
							id="dot-label"
							type="text"
							value={dotLabel}
							onChange={(e) => onDotLabelChange(e.target.value)}
							maxLength={8}
							placeholder="R, 1, …"
							className="w-16 rounded-lg px-2 py-1 text-xs focus:outline-none"
							style={{
								background: "var(--gb-bg-elev)",
								border: "1px solid var(--gb-border)",
								color: "var(--gb-text)",
							}}
							aria-label="Dot label"
						/>
					</div>

					<div className="flex items-center gap-1.5">
						<label htmlFor="dot-shape" className={labelCls} style={labelStyle}>
							Shape
						</label>
						<select
							id="dot-shape"
							value={dotShape}
							onChange={(e) => onDotShapeChange(e.target.value as "circle" | "square" | "diamond")}
							className="rounded-lg px-2 py-1 text-xs focus:outline-none"
							style={{
								background: "var(--gb-bg-elev)",
								border: "1px solid var(--gb-border)",
								color: "var(--gb-text)",
							}}
							aria-label="Dot shape"
						>
							<option value="circle">Circle</option>
							<option value="square">Square</option>
							<option value="diamond">Diamond</option>
						</select>
					</div>
				</>
			)}

			{activeTool === "line" && (
				<>
					<ColorSwatch
						id="line-color"
						label="Color"
						value={lineColor}
						onChange={onLineColorChange}
					/>

					<div className="flex items-center gap-1.5">
						<label htmlFor="line-style" className={labelCls} style={labelStyle}>
							Style
						</label>
						<select
							id="line-style"
							value={lineStyle}
							onChange={(e) => onLineStyleChange(e.target.value as "solid" | "dashed")}
							className="rounded-lg px-2 py-1 text-xs focus:outline-none"
							style={{
								background: "var(--gb-bg-elev)",
								border: "1px solid var(--gb-border)",
								color: "var(--gb-text)",
							}}
							aria-label="Line style"
						>
							<option value="solid">Solid</option>
							<option value="dashed">Dashed</option>
						</select>
					</div>
				</>
			)}

			{activeTool === "group" && (
				<ColorSwatch
					id="group-color"
					label="Color"
					value={groupColor}
					onChange={onGroupColorChange}
				/>
			)}
		</div>
	);
}
