import type { ReactNode } from "react";

interface NoteButtonGroupProps {
	label: string;
	children: ReactNode;
	className?: string;
}

export function NoteButtonGroup({ label, children, className = "" }: NoteButtonGroupProps) {
	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			<span className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
				{label}
			</span>
			<div className="flex flex-wrap gap-2">{children}</div>
		</div>
	);
}
