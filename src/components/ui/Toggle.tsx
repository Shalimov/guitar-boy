import type { ReactNode, Ref } from "react";
import { forwardRef } from "react";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label?: ReactNode;
	disabled?: boolean;
	className?: string;
}

export const Toggle = forwardRef(function Toggle(
	{ checked, onChange, label, disabled = false, className = "" }: ToggleProps,
	ref: Ref<HTMLButtonElement>,
) {
	return (
		<label
			className={`inline-flex items-center gap-2 ${disabled ? "opacity-50" : "cursor-pointer"} ${className}`}
		>
			<button
				ref={ref}
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => !disabled && onChange(!checked)}
				className={`relative h-5 w-9 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gb-bg-elev)] ${
					checked ? "bg-[var(--gb-accent)]" : "bg-[var(--gb-border)]"
				} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
						checked ? "translate-x-4" : "translate-x-0"
					}`}
				/>
			</button>
			{label && <span className="text-sm text-[var(--gb-text)]">{label}</span>}
		</label>
	);
});
