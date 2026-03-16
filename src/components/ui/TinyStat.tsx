interface TinyStatProps {
	label: string;
	value: string;
	statKey: string;
}

export function TinyStat({ label, value, statKey }: TinyStatProps) {
	return (
		<div
			className="flex items-center gap-1.5 rounded-full border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-2 py-0.5"
			data-testid={`trainer-stat-${statKey}`}
		>
			<span className="text-[9px] font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
				{label}
			</span>
			<span className="text-xs font-semibold text-[var(--gb-text)]">{value}</span>
		</div>
	);
}
