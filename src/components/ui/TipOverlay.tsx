import type { Tip } from "@/data/tips";
import { Button } from "./Button";

interface TipOverlayProps {
	tip: Tip;
	onDismiss: () => void;
}

export function TipOverlay({ tip, onDismiss }: TipOverlayProps) {
	return (
		<div className="rounded-2xl border border-[var(--gb-accent-soft)] p-5 space-y-4 bg-[color-mix(in_srgb,var(--gb-accent-soft)_5%,var(--gb-bg-panel))] animate-in fade-in zoom-in duration-300">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="text-xl">💡</span>
					<span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent-strong)]">
						Pro Tip
					</span>
				</div>
			</div>

			<div className="space-y-2">
				<h4 className="font-bold text-base text-[var(--gb-text)]">{tip.title}</h4>
				<p className="text-sm leading-relaxed text-[var(--gb-text-muted)]">{tip.body}</p>
			</div>

			{tip.mnemonic && (
				<div className="rounded-lg bg-[var(--gb-accent)]/10 px-3 py-2 border-l-4 border-[var(--gb-accent)]">
					<p className="text-xs font-medium italic text-[var(--gb-accent-strong)]">
						“{tip.mnemonic}”
					</p>
				</div>
			)}

			<div className="flex justify-end pt-1">
				<Button
					size="sm"
					variant="secondary"
					onClick={onDismiss}
					className="text-xs font-bold uppercase tracking-widest px-4 border-[var(--gb-accent-soft)] hover:bg-[var(--gb-accent)] hover:text-white hover:border-transparent transition-all"
				>
					Got it
				</Button>
			</div>
		</div>
	);
}
