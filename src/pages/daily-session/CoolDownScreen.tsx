import { Button } from "@/components/ui/Button";

interface CoolDownScreenProps {
	previewMessage: string;
	sessionScore: { correct: number; total: number };
	durationMs: number;
	onFinish: () => void;
}

export function CoolDownScreen({
	previewMessage,
	sessionScore,
	durationMs,
	onFinish,
}: CoolDownScreenProps) {
	const minutes = Math.floor(durationMs / 60000);
	const seconds = Math.floor((durationMs % 60000) / 1000);

	return (
		<div className="max-w-md mx-auto p-6 space-y-8 text-center animate-in fade-in zoom-in duration-700">
			<div className="space-y-2">
				<div className="text-5xl mb-4">✨</div>
				<h2 className="text-3xl font-black text-[var(--gb-text)]">Session Complete</h2>
				<p className="text-[var(--gb-text-muted)] font-medium">You're getting better every day.</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="bg-[var(--gb-bg-panel)] p-4 rounded-2xl border border-[var(--gb-border)]">
					<div className="text-3xl font-black text-[var(--gb-accent)]">
						{sessionScore.correct}/{sessionScore.total}
					</div>
					<div className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-text-muted)] mt-1">
						Accuracy
					</div>
				</div>
				<div className="bg-[var(--gb-bg-panel)] p-4 rounded-2xl border border-[var(--gb-border)]">
					<div className="text-3xl font-black text-[var(--gb-accent)]">
						{minutes}m {seconds}s
					</div>
					<div className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-text-muted)] mt-1">
						Duration
					</div>
				</div>
			</div>

			<div className="bg-[var(--gb-accent)]/5 border border-[var(--gb-accent-soft)] p-6 rounded-3xl space-y-3 relative overflow-hidden group">
				<div className="absolute -right-4 -top-4 text-4xl opacity-10 group-hover:rotate-12 transition-transform">
					📅
				</div>
				<p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gb-accent-strong)]">
					Coming up next...
				</p>
				<p className="text-sm font-medium text-[var(--gb-text)] leading-relaxed">
					{previewMessage}
				</p>
			</div>

			<div className="pt-4">
				<Button onClick={onFinish} className="w-full py-4 text-lg shadow-[var(--gb-shadow-soft)]">
					Back to Dashboard
				</Button>
			</div>
		</div>
	);
}
