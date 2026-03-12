import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

interface SessionCompletionProps {
	correct: number;
	total: number;
	durationMs: number;
}

export function SessionCompletion({ correct, total, durationMs }: SessionCompletionProps) {
	const navigate = useNavigate();
	const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
	const durationMin = Math.round(durationMs / 60000);

	return (
		<div className="mx-auto max-w-md bg-[var(--gb-bg-panel)] rounded-2xl border border-[var(--gb-border)] p-8 text-center shadow-[var(--gb-shadow-soft)] animate-in fade-in zoom-in duration-300">
			<div className="mb-6 flex justify-center">
				<div className="rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30">
					<svg
						className="h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						role="img"
						aria-label="Success checkmark"
					>
						<title>Success</title>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>
			</div>

			<h2 className="text-3xl font-extrabold text-[var(--gb-text)]">Practice Done!</h2>
			<p className="mt-2 text-[var(--gb-text-muted)]">You're getting better every day.</p>

			<div className="mt-8 grid grid-cols-2 gap-4">
				<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4">
					<div className="text-2xl font-bold text-[var(--gb-accent)]">{accuracy}%</div>
					<div className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
						Accuracy
					</div>
				</div>
				<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4">
					<div className="text-2xl font-bold text-[var(--gb-accent)]">{durationMin}m</div>
					<div className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
						Time
					</div>
				</div>
			</div>

			<div className="mt-8 space-y-3">
				<Button onClick={() => navigate("/")} className="w-full" size="lg">
					Back to Dashboard
				</Button>
			</div>
		</div>
	);
}
