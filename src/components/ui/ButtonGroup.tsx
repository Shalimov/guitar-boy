import type { ReactNode } from "react";

interface ButtonGroupOption<T extends string> {
	value: T;
	label: ReactNode;
}

interface ButtonGroupProps<T extends string> {
	options: ButtonGroupOption<T>[];
	value: T;
	onChange: (value: T) => void;
	label?: ReactNode;
	disabled?: boolean;
	className?: string;
}

export function ButtonGroup<T extends string>({
	options,
	value,
	onChange,
	label,
	disabled = false,
	className = "",
}: ButtonGroupProps<T>) {
	const isFirst = (index: number) => index === 0;
	const isLast = (index: number) => index === options.length - 1;

	return (
		<div className={`${className}`}>
			{label && (
				<span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
					{label}
				</span>
			)}
			<div className="flex flex-wrap">
				{options.map((option, index) => (
					<button
						key={option.value}
						type="button"
						disabled={disabled}
						onClick={() => !disabled && onChange(option.value)}
						className={`relative -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gb-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gb-bg-elev)] ${
							disabled
								? "cursor-not-allowed opacity-55"
								: "cursor-pointer hover:bg-[var(--gb-bg-elev)]"
						} ${
							value === option.value
								? "border border-[var(--gb-accent)] bg-[var(--gb-accent)] text-[#fff7ef]"
								: "border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] text-[var(--gb-text)]"
						} px-2.5 h-7 text-xs font-semibold tracking-[0.01em] transition-all duration-200`}
						style={{
							borderRadius:
								isFirst(index) && isLast(index)
									? "var(--gb-radius-card)"
									: isFirst(index)
										? "var(--gb-radius-card) 0 0 var(--gb-radius-card)"
										: isLast(index)
											? "0 var(--gb-radius-card) var(--gb-radius-card) 0"
											: "0",
						}}
					>
						{option.label}
					</button>
				))}
			</div>
		</div>
	);
}
