import type { ReactNode } from "react";

interface SectionCardProps {
	children: ReactNode;
	className?: string;
}

export function SectionCard({ children, className = "" }: SectionCardProps) {
	return <section className={`gb-panel p-7 ${className}`}>{children}</section>;
}
