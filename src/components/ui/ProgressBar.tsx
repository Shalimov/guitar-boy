interface ProgressBarProps {
	progress: number;
	current: number;
	total: number;
	className?: string;
}

export function ProgressBar({ progress, current, total, className = "" }: ProgressBarProps) {
	return (
		<div className={`flex items-center gap-3 ${className}`}>
			<div
				className="flex-1 h-2 rounded-full overflow-hidden"
				style={{ background: "var(--gb-bg-panel)" }}
			>
				<div
					className="h-full rounded-full transition-all duration-500"
					style={{ width: `${progress}%`, background: "var(--gb-accent)" }}
				/>
			</div>
			<span className="text-xs tabular-nums font-medium" style={{ color: "var(--gb-text-muted)" }}>
				{current} / {total}
			</span>
		</div>
	);
}
