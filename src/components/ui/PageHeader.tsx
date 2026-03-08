import type { ReactNode } from "react";

interface PageHeaderProps {
	kicker: string;
	title: string;
	description?: ReactNode;
	className?: string;
}

export function PageHeader({ kicker, title, description, className = "" }: PageHeaderProps) {
	return (
		<div className={className}>
			<p className="gb-page-kicker mb-1">{kicker}</p>
			<h1 className="gb-page-title">{title}</h1>
			{description && (
				<p className="text-sm mt-2" style={{ color: "var(--gb-text-muted)" }}>
					{description}
				</p>
			)}
		</div>
	);
}
