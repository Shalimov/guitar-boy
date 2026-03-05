import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
	const clickableStyles = onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : "";

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				className={`bg-white rounded-lg shadow-md p-6 text-left ${clickableStyles} ${className}`}
			>
				{children}
			</button>
		);
	}

	return <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>;
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
	return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
	return <div className={`mt-2 ${className}`}>{children}</div>;
}
