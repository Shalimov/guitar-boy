import type { ReactNode } from "react";

interface ButtonProps {
	children: ReactNode;
	onClick?: () => void;
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	className?: string;
}

export function Button({
	children,
	onClick,
	variant = "primary",
	size = "md",
	disabled = false,
	type = "button",
	className = "",
}: ButtonProps) {
	const baseStyles =
		"font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variants = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
		ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};

	const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
		>
			{children}
		</button>
	);
}
