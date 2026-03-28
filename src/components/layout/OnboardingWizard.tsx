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
			title: "Learn Guitar by Ear and Eye",
			content: (
				<div className="space-y-4">
					<p className="text-[var(--gb-text-muted)]">
						<strong>Guitar Boy</strong> teaches you to see the fretboard and hear what you play.
						It combines visual theory tools, interactive quizzes, and functional ear training
						into a daily practice loop designed for real progress.
					</p>
					<div className="rounded-xl bg-[var(--gb-bg-panel)] p-4 text-sm">
						<p className="font-semibold text-[var(--gb-text)]">5 minutes a day is all it takes.</p>
						<p className="mt-1 text-[var(--gb-text-muted)]">
							The app adapts to your level, tracks your weak spots, and uses spaced
							repetition so you focus on what needs work.
						</p>
					</div>
				</div>
			),
		},
		{
			kicker: "The Daily Loop",
			title: "How practice works",
			content: (
				<div className="space-y-3 text-sm">
					<p className="text-[var(--gb-text-muted)]">
						Each day, hit <strong>Daily Practice</strong> on the dashboard. The app builds a
						short session mixing these segments based on your progress:
					</p>
					<div className="grid gap-2">
						{[
							{
								icon: "🎸",
								label: "Warm-up",
								desc: "Quick review of yesterday's weak spots",
							},
							{
								icon: "🃏",
								label: "SRS Review",
								desc: "Spaced repetition cards that are due — notes, intervals, chords",
							},
							{
								icon: "🧩",
								label: "Quiz",
								desc: "Targeted quiz on your weakest area (notes, intervals, or chords)",
							},
							{
								icon: "👂",
								label: "Ear Training",
								desc: "Scale degree recognition — hear a note, identify its role in the key",
							},
						].map((item) => (
							<div
								key={item.label}
								className="flex items-start gap-3 p-2.5 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)]"
							>
								<span className="text-lg shrink-0">{item.icon}</span>
								<div>
									<p className="font-bold text-[var(--gb-text)]">{item.label}</p>
									<p className="text-[var(--gb-text-muted)]">{item.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			),
		},
		{
			kicker: "Your Toolkit",
			title: "Learn, Quiz, Listen, Create",
			content: (
				<div className="grid gap-2.5 text-sm">
					{[
						{
							icon: "📖",
							label: "Learn",
							desc: "7 guided lessons on notes, scales, chords, and intervals. Plus a Fretboard Explorer for free experimentation.",
						},
						{
							icon: "🧠",
							label: "Quiz Studio",
							desc: "Find notes, guess notes by sight or sound, identify intervals, build chords. Pick a preset or customize difficulty, timer, and question count.",
						},
						{
							icon: "👂",
							label: "Ear Training",
							desc: "Starts with easy wins (high/low, major/minor), then scale degree recognition with progressive unlock, hints, and confusion drills.",
						},
						{
							icon: "🎨",
							label: "Whiteboard",
							desc: "Create and save fretboard diagrams. Annotate scales, chord shapes, and patterns. Browse a built-in pattern library.",
						},
					].map((item) => (
						<div key={item.label} className="flex gap-3 items-start">
							<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--gb-bg-panel)] text-sm">
								{item.icon}
							</span>
							<div>
								<p className="font-bold text-[var(--gb-text)]">{item.label}</p>
								<p className="text-[var(--gb-text-muted)]">{item.desc}</p>
							</div>
						</div>
					))}
				</div>
			),
		},
		{
			kicker: "The Path",
			title: "Recommended progression",
			content: (
				<div className="space-y-3">
					<p className="text-sm text-[var(--gb-text-muted)]">
						Follow this sequence. Each phase builds on the last:
					</p>
					<nav className="space-y-2">
						{[
							{
								phase: "Phase 1",
								title: "Notes",
								desc: "Learn all natural notes on the fretboard. Use the Guided Lessons, then quiz yourself.",
								where: "Learn tab + Quiz: Find the Note",
							},
							{
								phase: "Phase 2",
								title: "Scales & Patterns",
								desc: "Major, minor, and pentatonic shapes. Visualize them on the Whiteboard, then drill patterns.",
								where: "Whiteboard + Quiz: Pattern Drill",
							},
							{
								phase: "Phase 3",
								title: "Intervals & Chords",
								desc: "Understand note relationships. Build chords from formulas. Quiz intervals and chord tones.",
								where: "Learn tab + Quiz: Intervals & Build Chord",
							},
							{
								phase: "Phase 4",
								title: "Ear Training",
								desc: "Train your ear to recognize scale degrees. Start with Easy Wins, progress through Anchor Note training.",
								where: "Quiz Studio: Ear Training modes",
							},
						].map((item) => (
							<div
								key={item.phase}
								className="p-2.5 rounded-lg border border-[var(--gb-border)] bg-[var(--gb-bg-elev)]"
							>
								<div className="flex items-baseline gap-2">
									<span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gb-accent)]">
										{item.phase}
									</span>
									<span className="text-sm font-bold text-[var(--gb-text)]">{item.title}</span>
								</div>
								<p className="mt-1 text-sm text-[var(--gb-text-muted)]">{item.desc}</p>
								<p className="mt-1 text-[11px] text-[var(--gb-accent)]">{item.where}</p>
							</div>
						))}
					</nav>
				</div>
			),
		},
		{
			kicker: "One More Thing",
			title: "Consistency beats intensity",
			content: (
				<div className="space-y-4">
					<div className="grid gap-3 text-sm">
						{[
							{
								icon: "🔥",
								tip: "Hit Daily Practice every day. 5 focused minutes beats 30 scattered ones.",
							},
							{
								icon: "💡",
								tip: "Using hints is learning, not cheating. The hint system helps you build connections, not just guess.",
							},
							{
								icon: "🎯",
								tip: "The app tracks what you get wrong. Weak spots get more practice automatically.",
							},
							{
								icon: "👂",
								tip: "Ear training teaches relative pitch — how notes feel in a key. This is the skill that transfers to real playing.",
							},
						].map((item) => (
							<div key={item.icon} className="flex gap-3 items-start">
								<span className="text-lg shrink-0">{item.icon}</span>
								<p className="text-[var(--gb-text-muted)]">{item.tip}</p>
							</div>
						))}
					</div>
					<div className="rounded-xl bg-[var(--gb-bg-panel)] p-4 text-center">
						<p className="text-sm font-semibold text-[var(--gb-text)]">
							Ready? Start with your first lesson or jump into Daily Practice.
						</p>
					</div>
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
