import type { ReactNode } from "react";

interface SectionCardProps {
	children: ReactNode;
	className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
	return (
		<section
			className={`rounded-[22px] border border-[var(--gb-border)] bg-white p-7 shadow-[var(--gb-shadow-soft)] ${className}`}
		>
			{children}
		</section>
	);
}
