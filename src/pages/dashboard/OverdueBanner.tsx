import { Button } from "@/components/ui/Button";

interface OverdueBannerProps {
	dueCount: number;
	onStartReview: () => void;
	onDismiss: () => void;
}

export function OverdueBanner({ dueCount, onStartReview, onDismiss }: OverdueBannerProps) {
	return (
		<div className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
					⏳
				</div>
				<div className="text-center sm:text-left">
					<h4 className="font-bold text-yellow-900">Welcome back!</h4>
					<p className="text-sm text-yellow-800">
						You have <span className="font-bold">{dueCount} cards</span> waiting for review.
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 w-full sm:w-auto">
				<Button
					onClick={onStartReview}
					className="flex-1 sm:flex-none bg-yellow-600 hover:bg-yellow-700 text-white border-transparent"
				>
					Start Review
				</Button>
				<Button
					variant="secondary"
					onClick={onDismiss}
					className="flex-1 sm:flex-none border-yellow-200 text-yellow-700 hover:bg-yellow-100"
				>
					Dismiss
				</Button>
			</div>
		</div>
	);
}
