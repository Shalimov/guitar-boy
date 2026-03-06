interface AnnotationToolbarProps {
	dotColor: string;
	dotLabel: string;
	dotShape: "circle" | "square" | "diamond";
	groupColor: string;
	selectedGroupCount: number;
	canCreateGroup: boolean;
	onDotColorChange: (color: string) => void;
	onDotLabelChange: (label: string) => void;
	onDotShapeChange: (shape: "circle" | "square" | "diamond") => void;
	onGroupColorChange: (color: string) => void;
	onCreateGroup: () => void;
	onClearSelection: () => void;
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
	groupColor,
	selectedGroupCount,
	canCreateGroup,
	onDotColorChange,
	onDotLabelChange,
	onDotShapeChange,
	onGroupColorChange,
	onCreateGroup,
	onClearSelection,
}: AnnotationToolbarProps) {
	return (
		<div
			className="flex flex-wrap items-start gap-4 rounded-xl px-4 py-3"
			style={{
				background: "var(--gb-bg-panel)",
				border: "1px solid var(--gb-border)",
			}}
		>
			<div className="min-w-[17rem] flex-1 space-y-3">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] uppercase" style={labelStyle}>
						Markers
					</p>
					<p className="mt-1 text-sm" style={{ color: "var(--gb-text-muted)" }}>
						Click any fret to add or remove a marker.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
							placeholder="R, 1, ..."
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
				</div>
			</div>

			<div
				className="hidden self-stretch md:block w-px"
				style={{ background: "var(--gb-border)" }}
			/>

			<div className="min-w-[18rem] flex-1 space-y-3">
				<div>
					<p className="text-xs font-bold tracking-[0.18em] uppercase" style={labelStyle}>
						Groups
					</p>
					<p className="mt-1 text-sm" style={{ color: "var(--gb-text-muted)" }}>
						Right-click markers to build a selection, then create a group from the context menu or
						here.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
					<ColorSwatch
						id="group-color"
						label="Color"
						value={groupColor}
						onChange={onGroupColorChange}
					/>

					<div
						className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
						style={{
							background: "var(--gb-bg-tab)",
							color: "var(--gb-text)",
						}}
					>
						{selectedGroupCount} selected
					</div>

					<button
						type="button"
						onClick={onCreateGroup}
						disabled={!canCreateGroup}
						className="inline-flex items-center justify-center rounded-[var(--gb-radius-pill)] border border-transparent bg-[var(--gb-accent)] px-3.5 py-1.5 text-sm font-semibold text-[#fff7ef] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55"
					>
						Group Selected
					</button>

					<button
						type="button"
						onClick={onClearSelection}
						disabled={selectedGroupCount === 0}
						className="inline-flex items-center justify-center rounded-[var(--gb-radius-pill)] border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55"
						style={{
							borderColor: "var(--gb-border)",
							background: "var(--gb-bg-panel)",
							color: "var(--gb-text)",
						}}
					>
						Clear Selection
					</button>
				</div>
			</div>
		</div>
	);
}
