import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CardCategory } from "@/types";

export type QuizType = CardCategory | "note-guess" | "note-guess-sound";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type EarTrainingMode = "hear-identify" | "tone-meditation" | "anchor-note";

export interface QuizSettings {
	type: QuizType;
	difficulty: Difficulty;
	questionCount: number;
	timerEnabled: boolean;
	timerSeconds: number;
	deepPractice: boolean;
	mode: "regular" | "speed";
}

interface QuizSelectorProps {
	onStartQuiz: (settings: QuizSettings) => void;
	onStartEarTraining?: (mode: EarTrainingMode) => void;
}

type QuizStep = "type" | "difficulty" | "pace";

interface QuickStartPreset {
	id: string;
	name: string;
	icon: string;
	settings: QuizSettings | null;
	earTrainingMode?: EarTrainingMode;
}

const QUICK_START_PRESETS: QuickStartPreset[] = [
	{
		id: "quick-notes",
		name: "Quick Notes",
		icon: "🎯",
		settings: {
			type: "note",
			difficulty: "beginner",
			questionCount: 10,
			timerEnabled: false,
			timerSeconds: 15,
			deepPractice: false,
			mode: "regular",
		},
	},
	{
		id: "speed-notes",
		name: "Speed Notes",
		icon: "⚡",
		settings: {
			type: "note",
			difficulty: "intermediate",
			questionCount: 20,
			timerEnabled: true,
			timerSeconds: 10,
			deepPractice: false,
			mode: "speed",
		},
	},
	{
		id: "intervals",
		name: "Intervals",
		icon: "🎵",
		settings: {
			type: "interval",
			difficulty: "beginner",
			questionCount: 10,
			timerEnabled: false,
			timerSeconds: 15,
			deepPractice: true,
			mode: "regular",
		},
	},
	{
		id: "chords",
		name: "Chords",
		icon: "🎸",
		settings: {
			type: "chord",
			difficulty: "beginner",
			questionCount: 10,
			timerEnabled: false,
			timerSeconds: 15,
			deepPractice: false,
			mode: "regular",
		},
	},
	{
		id: "hear-identify",
		name: "Hear & ID",
		icon: "👂",
		earTrainingMode: "hear-identify",
		settings: null,
	},
	{
		id: "tone-meditation",
		name: "Tone Med.",
		icon: "🎵",
		earTrainingMode: "tone-meditation",
		settings: null,
	},
	{
		id: "anchor-note",
		name: "Anchor",
		icon: "⚓",
		earTrainingMode: "anchor-note",
		settings: null,
	},
	{
		id: "custom",
		name: "Custom",
		icon: "⚙️",
		settings: null,
	},
];

const QUIZ_TYPES = [
	{
		value: "note",
		label: "Find the Note",
		desc: "Click all fretboard positions of a given note",
	},
	{
		value: "note-guess",
		label: "Guess the Note",
		desc: "Identify the note shown at a fretboard position",
	},
	{
		value: "note-guess-sound",
		label: "Guess by Sound",
		desc: "Hear a note, then identify it without a visual marker",
	},
	{
		value: "interval",
		label: "Identify Interval",
		desc: "Name the interval between two positions",
	},
	{
		value: "chord",
		label: "Build Chord",
		desc: "Place chord tones on the fretboard",
	},
] as const;

export function QuizSelector({ onStartQuiz, onStartEarTraining }: QuizSelectorProps) {
	const [showWizard, setShowWizard] = useState(false);
	const [wizardStep, setWizardStep] = useState<QuizStep>("type");

	// Wizard state
	const [wizardType, setWizardType] = useState<QuizType>("note");
	const [wizardDifficulty, setWizardDifficulty] = useState<Difficulty>("beginner");
	const [wizardQuestionCount, setWizardQuestionCount] = useState(10);
	const [wizardTimerEnabled, setWizardTimerEnabled] = useState(false);
	const [wizardTimerSeconds, setWizardTimerSeconds] = useState(15);
	const [wizardDeepPractice, setWizardDeepPractice] = useState(false);
	const [wizardMode, setWizardMode] = useState<"regular" | "speed">("regular");

	const handleQuickStart = (preset: QuickStartPreset) => {
		if (preset.earTrainingMode) {
			onStartEarTraining?.(preset.earTrainingMode);
		} else if (preset.settings === null) {
			handleStartWizard();
		} else {
			onStartQuiz(preset.settings);
		}
	};

	const handleStartWizard = () => {
		setShowWizard(true);
		setWizardStep("type");
	};

	const handleBack = () => {
		if (wizardStep === "type") {
			setShowWizard(false);
		} else if (wizardStep === "difficulty") {
			setWizardStep("type");
		} else if (wizardStep === "pace") {
			setWizardStep("difficulty");
		}
	};

	const handleNext = () => {
		if (wizardStep === "type") {
			setWizardStep("difficulty");
		} else if (wizardStep === "difficulty") {
			setWizardStep("pace");
		}
	};

	const handleStartQuiz = () => {
		onStartQuiz({
			type: wizardType,
			difficulty: wizardDifficulty,
			questionCount: wizardQuestionCount,
			timerEnabled: wizardTimerEnabled,
			timerSeconds: wizardTimerSeconds,
			deepPractice: wizardDeepPractice,
			mode: wizardMode,
		});
	};

	const selectedQuizType = QUIZ_TYPES.find((q) => q.value === wizardType);

	const QUIZ_PRESETS = QUICK_START_PRESETS.filter((p) => p.id !== "custom" && !p.earTrainingMode);
	const EAR_TRAINING_PRESETS = QUICK_START_PRESETS.filter((p) => p.earTrainingMode);
	const CUSTOM_PRESET = QUICK_START_PRESETS.find((p) => p.id === "custom");

	// Quick Start View
	if (!showWizard) {
		return (
			<div className="space-y-6">
				{/* Quiz Presets */}
				<div>
					<h3 className="text-lg font-semibold text-[var(--gb-text)] mb-4">Quick Start</h3>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{QUIZ_PRESETS.map((preset) => (
							<button
								key={preset.id}
								type="button"
								onClick={() => handleQuickStart(preset)}
								className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] hover:border-[var(--gb-accent)] hover:shadow-md transition-all"
							>
								<span className="text-2xl">{preset.icon}</span>
								<span className="text-sm font-medium text-[var(--gb-text)]">{preset.name}</span>
							</button>
						))}
					</div>
				</div>

				{/* Ear Training Presets */}
				{EAR_TRAINING_PRESETS.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-[var(--gb-text)] mb-4">Train Your Ears</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{EAR_TRAINING_PRESETS.map((preset) => (
								<button
									key={preset.id}
									type="button"
									onClick={() => handleQuickStart(preset)}
									className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] hover:border-[var(--gb-accent)] hover:shadow-md transition-all"
								>
									<span className="text-2xl">{preset.icon}</span>
									<span className="text-sm font-medium text-[var(--gb-text)]">{preset.name}</span>
								</button>
							))}
						</div>
					</div>
				)}

				{/* Divider */}
				<div className="flex items-center gap-4">
					<div className="flex-1 h-px bg-[var(--gb-border)]" />
					<span className="text-xs font-medium text-[var(--gb-text-muted)] uppercase tracking-wider">
						or
					</span>
					<div className="flex-1 h-px bg-[var(--gb-border)]" />
				</div>

				{/* Custom Option */}
				{CUSTOM_PRESET && (
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<button
							key={CUSTOM_PRESET.id}
							type="button"
							onClick={() => handleQuickStart(CUSTOM_PRESET)}
							className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] hover:border-[var(--gb-accent)] hover:shadow-md transition-all"
						>
							<span className="text-2xl">{CUSTOM_PRESET.icon}</span>
							<span className="text-sm font-medium text-[var(--gb-text)]">
								{CUSTOM_PRESET.name}
							</span>
						</button>
					</div>
				)}
			</div>
		);
	}

	// Wizard View
	const isLastStep = wizardStep === "pace";

	return (
		<div className="space-y-6">
			{/* Wizard Header */}
			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={handleBack}
					className="text-sm font-medium text-[var(--gb-text-muted)] hover:text-[var(--gb-text)]"
				>
					← Back
				</button>
				<div className="flex items-center gap-2">
					{["type", "difficulty", "pace"].map((step, index) => (
						<div key={step} className="flex items-center gap-2">
							<div
								className={`w-2 h-2 rounded-full ${
									step === wizardStep
										? "bg-[var(--gb-accent)]"
										: ["type", "difficulty", "pace"].indexOf(wizardStep) > index
											? "bg-[var(--gb-accent)]/50"
											: "bg-[var(--gb-border)]"
								}`}
							/>
							{index < 2 && <div className="w-8 h-px bg-[var(--gb-border)]" />}
						</div>
					))}
				</div>
				<div className="w-16" /> {/* Spacer for alignment */}
			</div>

			{/* Step 1: Quiz Type */}
			{wizardStep === "type" && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-[var(--gb-text)]">
						What do you want to practice?
					</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{QUIZ_TYPES.map((option) => {
							const active = wizardType === option.value;
							return (
								<button
									key={option.value}
									type="button"
									onClick={() => setWizardType(option.value as QuizType)}
									style={{
										borderColor: active ? "var(--gb-accent)" : "var(--gb-border)",
										background: active
											? "color-mix(in srgb, var(--gb-accent-soft) 18%, var(--gb-bg-elev) 82%)"
											: "var(--gb-bg-elev)",
									}}
									className="rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm"
								>
									<div
										className="font-semibold text-sm"
										style={{
											color: active ? "var(--gb-accent-strong)" : "var(--gb-text)",
										}}
									>
										{option.label}
									</div>
									<div className="mt-1 text-xs text-[var(--gb-text-muted)]">{option.desc}</div>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Step 2: Difficulty */}
			{wizardStep === "difficulty" && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-[var(--gb-text)]">Choose difficulty level</h3>
					<p className="text-sm text-[var(--gb-text-muted)]">
						Beginner keeps the neck tighter, advanced opens the full range.
					</p>
					<div className="flex flex-wrap gap-3">
						{(
							[
								{ id: "beginner", label: "Beginner", desc: "Frets 1-5" },
								{ id: "intermediate", label: "Intermediate", desc: "Frets 1-12" },
								{ id: "advanced", label: "Advanced", desc: "Full neck" },
							] as const
						).map((level) => {
							const active = wizardDifficulty === level.id;
							return (
								<button
									key={level.id}
									type="button"
									onClick={() => setWizardDifficulty(level.id)}
									style={{
										background: active ? "var(--gb-accent)" : "var(--gb-bg-panel)",
										color: active ? "#fff8ee" : "var(--gb-text)",
										borderColor: active ? "var(--gb-accent)" : "var(--gb-border)",
									}}
									className="rounded-xl border px-6 py-4 text-center transition-all hover:opacity-90"
								>
									<div className="font-semibold">{level.label}</div>
									<div className="text-xs opacity-75">{level.desc}</div>
								</button>
							);
						})}
					</div>

					{/* Mode Toggle */}
					<div className="pt-4 border-t border-[var(--gb-border)]">
						<p className="text-sm font-medium text-[var(--gb-text)] mb-3">Quiz Mode</p>
						<div className="flex bg-[var(--gb-bg-tab)] p-1 rounded-xl w-fit">
							<button
								type="button"
								onClick={() => setWizardMode("regular")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									wizardMode === "regular"
										? "bg-[var(--gb-bg-panel)] text-[var(--gb-accent-strong)] shadow-sm"
										: "text-[var(--gb-text-muted)]"
								}`}
							>
								Regular
							</button>
							<button
								type="button"
								onClick={() => setWizardMode("speed")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									wizardMode === "speed"
										? "bg-[var(--gb-bg-panel)] text-[var(--gb-accent-strong)] shadow-sm"
										: "text-[var(--gb-text-muted)]"
								}`}
							>
								⚡ Speed
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Step 3: Pace */}
			{wizardStep === "pace" && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-[var(--gb-text)]">Set your pace</h3>

					{/* Question Count */}
					<div>
						<p className="text-sm font-medium text-[var(--gb-text)] mb-3">Number of Questions</p>
						<div className="flex flex-wrap gap-2">
							{[5, 10, 20, 50].map((count) => (
								<button
									key={count}
									type="button"
									onClick={() => setWizardQuestionCount(count)}
									style={{
										background:
											wizardQuestionCount === count ? "var(--gb-accent)" : "var(--gb-bg-panel)",
										color: wizardQuestionCount === count ? "#fff8ee" : "var(--gb-text)",
										borderColor:
											wizardQuestionCount === count ? "var(--gb-accent)" : "var(--gb-border)",
									}}
									className="w-14 rounded-full border py-2 text-sm font-medium transition-all"
								>
									{count}
								</button>
							))}
						</div>
					</div>

					{/* Timer */}
					<div>
						<div className="flex items-center gap-3 mb-3">
							<button
								type="button"
								role="switch"
								aria-checked={wizardTimerEnabled}
								onClick={() => setWizardTimerEnabled((v) => !v)}
								style={{
									background: wizardTimerEnabled ? "var(--gb-accent)" : "var(--gb-bg-tab)",
								}}
								className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
							>
								<span
									className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
										wizardTimerEnabled ? "translate-x-6" : "translate-x-1"
									}`}
									style={{ background: "#fff8ee" }}
								/>
							</button>
							<span className="text-sm font-medium text-[var(--gb-text)]">Timer</span>
						</div>
						{wizardTimerEnabled && (
							<div className="flex flex-wrap gap-2 ml-14">
								{[10, 15, 20, 30].map((secs) => (
									<button
										key={secs}
										type="button"
										onClick={() => setWizardTimerSeconds(secs)}
										style={{
											background:
												wizardTimerSeconds === secs ? "var(--gb-accent)" : "var(--gb-bg-panel)",
											color: wizardTimerSeconds === secs ? "#fff8ee" : "var(--gb-text)",
											borderColor:
												wizardTimerSeconds === secs ? "var(--gb-accent)" : "var(--gb-border)",
										}}
										className="rounded-full border px-4 py-1.5 text-sm font-medium"
									>
										{secs}s
									</button>
								))}
							</div>
						)}
					</div>

					{/* Deep Practice */}
					<div className="flex items-center gap-3 pt-2">
						<button
							type="button"
							role="switch"
							aria-checked={wizardDeepPractice}
							onClick={() => setWizardDeepPractice((v) => !v)}
							style={{
								background: wizardDeepPractice ? "var(--gb-accent)" : "var(--gb-bg-tab)",
							}}
							className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
						>
							<span
								className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
									wizardDeepPractice ? "translate-x-6" : "translate-x-1"
								}`}
								style={{ background: "#fff8ee" }}
							/>
						</button>
						<div>
							<span className="text-sm font-medium text-[var(--gb-text)]">Deep Practice</span>
							<p className="text-xs text-[var(--gb-text-muted)]">
								Chain follow-up questions to reinforce memory
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Summary & Start */}
			<div className="rounded-xl border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] p-4 space-y-3">
				<p className="text-xs font-bold uppercase tracking-wider text-[var(--gb-text-muted)]">
					Ready to start
				</p>
				<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
					<div>
						<span className="text-[var(--gb-text-muted)]">Type:</span>{" "}
						<span className="font-medium text-[var(--gb-text)]">{selectedQuizType?.label}</span>
					</div>
					<div>
						<span className="text-[var(--gb-text-muted)]">Level:</span>{" "}
						<span className="font-medium text-[var(--gb-text)]">
							{wizardDifficulty.charAt(0).toUpperCase() + wizardDifficulty.slice(1)}
						</span>
					</div>
					<div>
						<span className="text-[var(--gb-text-muted)]">Questions:</span>{" "}
						<span className="font-medium text-[var(--gb-text)]">{wizardQuestionCount}</span>
					</div>
					<div>
						<span className="text-[var(--gb-text-muted)]">Timer:</span>{" "}
						<span className="font-medium text-[var(--gb-text)]">
							{wizardTimerEnabled ? `${wizardTimerSeconds}s` : "Off"}
						</span>
					</div>
					<div>
						<span className="text-[var(--gb-text-muted)]">Mode:</span>{" "}
						<span className="font-medium text-[var(--gb-text)]">
							{wizardMode === "speed" ? "⚡ Speed" : "Regular"}
						</span>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-3">
				{!isLastStep ? (
					<Button onClick={handleNext} className="flex-1">
						Next →
					</Button>
				) : (
					<Button onClick={handleStartQuiz} className="flex-1">
						Start Quiz
					</Button>
				)}
			</div>
		</div>
	);
}
