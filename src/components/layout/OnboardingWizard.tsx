import { useState } from "react";
import { Button } from "../ui/Button";

interface Step {
	title: string;
	kicker: string;
	content: React.ReactNode;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: Props) {
	const [currentStep, setCurrentStep] = useState(0);

	const handleClose = () => {
		onClose();
		localStorage.setItem("gb_onboarding_shown", "true");
	};

	const steps: Step[] = [
		{
			kicker: "Welcome",
			title: "Master the Fretboard",
			content: (
				<div className="space-y-4">
					<p className="text-[var(--gb-text-muted)]">
						Welcome to <strong>Guitar Boy</strong>! This tool is designed to help you build a mental
						map of your instrument through visualization, theory, and spaced repetition.
					</p>
					<div className="rounded-xl bg-[var(--gb-bg-panel)] p-4 text-sm italic">
						"The fretboard is a grid of possibilities. Let's make it intuitive."
					</div>
				</div>
			),
		},
		{
			kicker: "Framework",
			title: "What you can do",
			content: (
				<div className="grid gap-3 text-sm">
					<div className="flex gap-3 items-start">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gb-accent)] text-white text-[10px] font-bold">
							1
						</span>
						<div>
							<p className="font-bold">Scale Explorer</p>
							<p className="text-[var(--gb-text-muted)]">
								Deep dive into any scale, chord, or interval with dynamic visualization.
							</p>
						</div>
					</div>
					<div className="flex gap-3 items-start">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gb-accent)] text-white text-[10px] font-bold">
							2
						</span>
						<div>
							<p className="font-bold">Pattern Library</p>
							<p className="text-[var(--gb-text-muted)]">
								Access essential major, minor, and pentatonic patterns specifically curated for
								growth.
							</p>
						</div>
					</div>
					<div className="flex gap-3 items-start">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gb-accent)] text-white text-[10px] font-bold">
							3
						</span>
						<div>
							<p className="font-bold">Memory Quizzes</p>
							<p className="text-[var(--gb-text-muted)]">
								Use Spaced Repetition (SRS) to lock notes and patterns into your long-term memory.
							</p>
						</div>
					</div>
				</div>
			),
		},
		{
			kicker: "The Program",
			title: "Learning Roadmap",
			content: (
				<div className="space-y-4">
					<p className="text-sm text-[var(--gb-text-muted)] mb-3">
						Follow this path for the most effective progress:
					</p>
					<nav className="space-y-2">
						{[
							{ phase: "Beginner", task: "Memorize Natural Notes (C-D-E-F-G-A-B)" },
							{ phase: "Intermediate", task: "Master Major & Minor Scale Patterns" },
							{ phase: "Advanced", task: "Internalize Intervals & Blues Scale" },
							{ phase: "Mastery", task: "Daily Ear Training & SRS Quizzes" },
						].map((item) => (
							<div
								key={item.phase}
								className="flex items-center justify-between p-2 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)]"
							>
								<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-accent)]">
									{item.phase}
								</span>
								<span className="text-sm font-medium">{item.task}</span>
							</div>
						))}
					</nav>
				</div>
			),
		},
	];

	if (!isOpen) return null;

	const percent = ((currentStep + 1) / steps.length) * 100;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-[var(--gb-bg)]/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" />

			<div className="relative w-full max-w-lg overflow-hidden rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] shadow-[var(--gb-shadow)] animate-in zoom-in-95 duration-300">
				<div
					className="absolute top-0 left-0 h-1 bg-[var(--gb-accent)] transition-all duration-300"
					style={{ width: `${percent}%` }}
				/>

				<div className="p-8 md:p-10">
					<div className="mb-6 space-y-1">
						<p className="gb-page-kicker !text-[var(--gb-accent)]">{steps[currentStep].kicker}</p>
						<h2 className="gb-page-title !text-2xl font-bold">{steps[currentStep].title}</h2>
					</div>

					<div className="min-h-[200px] animate-in slide-in-from-bottom-2 duration-500">
						{steps[currentStep].content}
					</div>

					<div className="mt-10 flex items-center justify-between">
						<div className="flex gap-1.5">
							{steps.map((step, i) => (
								<div
									key={step.title}
									className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "bg-[var(--gb-accent)] w-4" : "bg-[var(--gb-border)]"}`}
								/>
							))}
						</div>

						<div className="flex gap-3">
							{currentStep > 0 && (
								<Button variant="secondary" onClick={() => setCurrentStep((prev) => prev - 1)}>
									Back
								</Button>
							)}
							{currentStep < steps.length - 1 ? (
								<Button onClick={() => setCurrentStep((prev) => prev + 1)}>Continue</Button>
							) : (
								<Button onClick={handleClose}>Get Started</Button>
							)}
						</div>
					</div>
				</div>

				{/* Decorative element */}
				<div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,_var(--gb-accent-soft)_0%,_transparent_70%)] opacity-30 blur-2xl" />
			</div>
		</div>
	);
}
