import { type ReactNode, useState } from "react";

interface TooltipProps {
	content: ReactNode;
	children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className="relative inline-flex">
			<div
				onMouseEnter={() => setIsVisible(true)}
				onMouseLeave={() => setIsVisible(false)}
				className="cursor-help"
			>
				{children}
			</div>
			{isVisible && (
				<div
					className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-medium text-[var(--gb-bg-elev)] bg-[var(--gb-text)] rounded-lg shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
					role="tooltip"
					style={{ maxWidth: "250px", width: "max-content", whiteSpace: "normal" }}
				>
					{content}
					<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--gb-text)]" />
				</div>
			)}
		</div>
	);
}
