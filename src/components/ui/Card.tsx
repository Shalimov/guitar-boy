import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
	const baseStyles =
		"rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-6 shadow-[var(--gb-shadow-soft)]";
	const clickableStyles = onClick
		? "cursor-pointer text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--gb-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-accent)]"
		: "";

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`${baseStyles} ${clickableStyles} ${className}`}
			>
				{children}
			</button>
		);
	}

	return <div className={`${baseStyles} ${className}`}>{children}</div>;
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
	return <h3 className={`text-xl font-semibold text-[var(--gb-text)] ${className}`}>{children}</h3>;
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
	return <div className={`mt-2 text-[var(--gb-text-muted)] ${className}`}>{children}</div>;
}
