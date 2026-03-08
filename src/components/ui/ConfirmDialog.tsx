import { type ReactNode, useEffect, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm?: () => void;
	title: string;
	message: ReactNode;
	confirmText?: string;
	cancelText?: string;
	confirmVariant?: "primary" | "secondary" | "ghost";
	showCancel?: boolean;
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "OK",
	cancelText = "Cancel",
	confirmVariant = "primary",
	showCancel = true,
}: ConfirmDialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleConfirm = () => {
		onConfirm?.();
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50" />
			<div
				ref={dialogRef}
				className="relative z-10 bg-[var(--gb-bg-elev)] border border-[var(--gb-border)] rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4"
			>
				<h2 className="text-lg font-semibold text-[var(--gb-text)] mb-2">{title}</h2>
				<div className="text-sm text-[var(--gb-text-muted)] mb-6">{message}</div>
				<div className="flex gap-3 justify-end">
					{showCancel && (
						<Button variant="secondary" onClick={onClose}>
							{cancelText}
						</Button>
					)}
					<Button variant={confirmVariant} onClick={handleConfirm}>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
}
