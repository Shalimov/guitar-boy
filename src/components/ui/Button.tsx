import type { ReactNode, Ref } from "react";
import { forwardRef } from "react";

interface ButtonProps {
	children: ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	className?: string;
}

export const Button = forwardRef(function Button(
	{
		children,
		onClick,
		variant = "primary",
		size = "md",
		disabled = false,
		type = "button",
		className = "",
	}: ButtonProps,
	ref: Ref<HTMLButtonElement>,
) {
	const baseStyles =
		"inline-flex items-center justify-center rounded-[var(--gb-radius-pill)] font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gb-bg-elev)]";

	const variants = {
		primary:
			"border border-transparent bg-[var(--gb-accent)] text-[#fff7ef] shadow-[0_12px_24px_rgba(179,93,42,0.32)] hover:bg-[var(--gb-accent-strong)] hover:shadow-[0_14px_26px_rgba(143,69,29,0.34)]",
		secondary:
			"border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] text-[var(--gb-text)] hover:bg-[var(--gb-bg-elev)]",
		ghost:
			"bg-transparent text-[var(--gb-text-muted)] hover:bg-[var(--gb-bg-panel)] hover:text-[var(--gb-text)]",
	};

	const sizes = {
		sm: "px-3.5 py-1.5 text-sm",
		md: "px-4.5 py-2 text-sm md:text-base",
		lg: "px-6 py-3 text-base md:text-lg",
	};

	const disabledStyles = disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer";

	return (
		<button
			ref={ref}
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
		>
			{children}
		</button>
	);
});
