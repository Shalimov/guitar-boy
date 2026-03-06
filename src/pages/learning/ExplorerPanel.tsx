import { useEffect, useMemo, useState } from "react";
import { Fretboard } from "@/components/fretboard";
import { Button } from "@/components/ui";
import {
	getConstructNotes,
	getDisplayNoteName,
	getFrequencyAtFret,
	getIntervalFormulaToken,
	getNoteAtFret,
} from "@/lib/music";
import type { AccidentalPreference, FretPosition, NoteName } from "@/types";
import {
	buildExplorerFretboardState,
	EXPLORER_CONSTRUCT_OPTIONS,
	type ExplorerCagedShape,
	type ExplorerConstructType,
	type ExplorerNoteFilter,
	type ExplorerState,
	getExplorerConstructFormula,
} from "./explorer";

const ROOT_OPTIONS: NoteName[] = [
	"C",
	"C#/Db",
	"D",
	"D#/Eb",
	"E",
	"F",
	"F#/Gb",
	"G",
	"G#/Ab",
	"A",
	"A#/Bb",
	"B",
];

const CONSTRUCT_TYPES: ExplorerConstructType[] = [
	"Scales",
	"Chords",
	"Arpeggios",
	"Single Intervals",
];
const CAGED_SHAPES: ExplorerCagedShape[] = ["C", "A", "G", "E", "D"];
const MAX_FRET = 15;

const INITIAL_STATE: ExplorerState = {
	root: "C",
	constructType: "Scales",
	constructName: "Major",
	labelType: "notes",
	noteFilter: "all",
	accidentalPreference: "sharp",
	fretRange: [1, 15],
	showCagedOverlay: false,
	activeCagedShapes: [...CAGED_SHAPES],
};

function toggleShape(shapes: ExplorerCagedShape[], shape: ExplorerCagedShape) {
	return shapes.includes(shape) ? shapes.filter((value) => value !== shape) : [...shapes, shape];
}

function TooltipCard({
	position,
	root,
	accidentalPreference,
}: {
	position: FretPosition | null;
	root: NoteName;
	accidentalPreference: AccidentalPreference;
}) {
	if (!position) {
		return (
			<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 text-sm text-[var(--gb-text-muted)]">
				Hover or focus a highlighted note to inspect its pitch, frequency, and interval role.
			</div>
		);
	}

	const note = getNoteAtFret(position);
	const noteLabel = getDisplayNoteName(note, accidentalPreference);
	const frequency = getFrequencyAtFret(position).toFixed(2);
	const rootLabel = getDisplayNoteName(root, accidentalPreference);
	const intervalFormula = getIntervalFormulaToken(root, note);

	return (
		<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-4 shadow-[var(--gb-shadow-soft)]">
			<p className="gb-page-kicker mb-2">Selected Tone</p>
			<div className="grid gap-3 text-sm sm:grid-cols-3">
				<div>
					<p className="text-[var(--gb-text-muted)]">Pitch</p>
					<p className="font-semibold text-[var(--gb-text)]">{noteLabel}</p>
				</div>
				<div>
					<p className="text-[var(--gb-text-muted)]">Frequency</p>
					<p className="font-semibold text-[var(--gb-text)]">{frequency} Hz</p>
				</div>
				<div>
					<p className="text-[var(--gb-text-muted)]">Against Root {rootLabel}</p>
					<p className="font-semibold text-[var(--gb-text)]">{intervalFormula}</p>
				</div>
			</div>
		</div>
	);
}

export function ExplorerPanel() {
	const [state, setState] = useState<ExplorerState>(INITIAL_STATE);
	const [hoveredPosition, setHoveredPosition] = useState<FretPosition | null>(null);

	const constructOptions = EXPLORER_CONSTRUCT_OPTIONS[state.constructType];
	const activeFormula = useMemo(() => getExplorerConstructFormula(state), [state]);
	const constructNoteNames = useMemo(
		() => Array.from(new Set(getConstructNotes(state.root, activeFormula))),
		[state.root, activeFormula],
	);
	const fretboardState = useMemo(() => buildExplorerFretboardState(state), [state]);
	const constructNotes = useMemo(() => activeFormula, [activeFormula]);
	const noteFilterOptions = useMemo(
		() => ["all", ...constructNoteNames] as ExplorerNoteFilter[],
		[constructNoteNames],
	);

	const rootLabel = getDisplayNoteName(state.root, state.accidentalPreference);

	useEffect(() => {
		if (state.noteFilter === "all") {
			return;
		}

		if (!constructNoteNames.includes(state.noteFilter)) {
			setState((current) => ({ ...current, noteFilter: "all" }));
		}
	}, [state.noteFilter, constructNoteNames]);

	return (
		<div className="space-y-6">
			<section className="rounded-[22px] border border-[var(--gb-border)] bg-[linear-gradient(180deg,rgba(255,248,238,0.96),rgba(240,223,205,0.95))] p-5 shadow-[var(--gb-shadow-soft)]">
				<div className="mb-5">
					<p className="gb-page-kicker mb-1">Control Deck</p>
					<h2 className="text-2xl font-semibold text-[var(--gb-text)]">Build a neck map</h2>
					<p className="mt-2 text-sm text-[var(--gb-text-muted)]">
						Switch roots, formulas, labels, and fret windows to reveal theory anywhere on the neck.
					</p>
				</div>

				<div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
					<div className="2xl:col-span-1">
						<label
							htmlFor="explorer-root"
							className="mb-2 block text-sm font-semibold text-[var(--gb-text)]"
						>
							Root note
						</label>
						<select
							id="explorer-root"
							value={state.root}
							onChange={(event) =>
								setState((current) => ({ ...current, root: event.target.value as NoteName }))
							}
							className="w-full rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-2 text-sm text-[var(--gb-text)]"
						>
							{ROOT_OPTIONS.map((note) => (
								<option key={note} value={note}>
									{getDisplayNoteName(note, state.accidentalPreference)}
								</option>
							))}
						</select>
						<div className="mt-2 flex gap-2">
							{(
								[
									{ label: "Sharps", value: "sharp" },
									{ label: "Flats", value: "flat" },
								] as const
							).map((option) => (
								<Button
									key={option.value}
									variant={state.accidentalPreference === option.value ? "primary" : "secondary"}
									size="sm"
									onClick={() =>
										setState((current) => ({ ...current, accidentalPreference: option.value }))
									}
								>
									{option.label}
								</Button>
							))}
						</div>
					</div>

					<div>
						<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">Construct type</p>
						<div className="grid grid-cols-2 gap-2">
							{CONSTRUCT_TYPES.map((type) => (
								<Button
									key={type}
									variant={state.constructType === type ? "primary" : "secondary"}
									size="sm"
									onClick={() =>
										setState((current) => ({
											...current,
											constructType: type,
											constructName: EXPLORER_CONSTRUCT_OPTIONS[type][0],
										}))
									}
								>
									{type}
								</Button>
							))}
						</div>
					</div>

					<div>
						<label
							htmlFor="explorer-construct"
							className="mb-2 block text-sm font-semibold text-[var(--gb-text)]"
						>
							Specific construct
						</label>
						<select
							id="explorer-construct"
							value={state.constructName}
							onChange={(event) =>
								setState((current) => ({ ...current, constructName: event.target.value }))
							}
							className="w-full rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-2 text-sm text-[var(--gb-text)]"
						>
							{constructOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					<div>
						<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">Label type</p>
						<div className="flex gap-2">
							<Button
								variant={state.labelType === "notes" ? "primary" : "secondary"}
								size="sm"
								onClick={() => setState((current) => ({ ...current, labelType: "notes" }))}
							>
								Note Names
							</Button>
							<Button
								variant={state.labelType === "intervals" ? "primary" : "secondary"}
								size="sm"
								onClick={() => setState((current) => ({ ...current, labelType: "intervals" }))}
							>
								Interval Degrees
							</Button>
						</div>
					</div>

					<div>
						<label
							htmlFor="explorer-note-filter"
							className="mb-2 block text-sm font-semibold text-[var(--gb-text)]"
						>
							Filter by note
						</label>
						<select
							id="explorer-note-filter"
							value={state.noteFilter}
							onChange={(event) =>
								setState((current) => ({
									...current,
									noteFilter: event.target.value as ExplorerNoteFilter,
								}))
							}
							className="w-full rounded-[14px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] px-3 py-2 text-sm text-[var(--gb-text)]"
						>
							<option value="all">All construct tones</option>
							{noteFilterOptions
								.filter((option) => option !== "all")
								.map((option) => (
									<option key={option} value={option}>
										{getDisplayNoteName(option, state.accidentalPreference)}
									</option>
								))}
						</select>
					</div>

					<div>
						<p className="mb-2 text-sm font-semibold text-[var(--gb-text)]">Fret window</p>
						<div className="grid grid-cols-2 gap-3">
							<label className="text-sm text-[var(--gb-text-muted)]">
								Start fret
								<input
									type="range"
									min={1}
									max={MAX_FRET - 1}
									value={state.fretRange[0]}
									onChange={(event) => {
										const nextMin = Number(event.target.value);
										setState((current) => ({
											...current,
											fretRange: [
												Math.min(nextMin, current.fretRange[1] - 1),
												current.fretRange[1],
											],
										}));
									}}
									className="mt-2 w-full"
								/>
								<span className="mt-1 block font-semibold text-[var(--gb-text)]">
									{state.fretRange[0]}
								</span>
							</label>
							<label className="text-sm text-[var(--gb-text-muted)]">
								End fret
								<input
									type="range"
									min={2}
									max={MAX_FRET}
									value={state.fretRange[1]}
									onChange={(event) => {
										const nextMax = Number(event.target.value);
										setState((current) => ({
											...current,
											fretRange: [
												current.fretRange[0],
												Math.max(nextMax, current.fretRange[0] + 1),
											],
										}));
									}}
									className="mt-2 w-full"
								/>
								<span className="mt-1 block font-semibold text-[var(--gb-text)]">
									{state.fretRange[1]}
								</span>
							</label>
						</div>
					</div>

					<div className="rounded-[16px] border border-[var(--gb-border)] bg-[rgba(255,255,255,0.52)] p-4 lg:col-span-2 2xl:col-span-1">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-[var(--gb-text)]">CAGED overlays</p>
								<p className="text-xs text-[var(--gb-text-muted)]">
									Reveal overlapping shape windows.
								</p>
							</div>
							<input
								type="checkbox"
								checked={state.showCagedOverlay}
								onChange={(event) =>
									setState((current) => ({ ...current, showCagedOverlay: event.target.checked }))
								}
								aria-label="Toggle CAGED overlays"
							/>
						</div>
						{state.showCagedOverlay && (
							<div className="mt-3 flex flex-wrap gap-2">
								{CAGED_SHAPES.map((shape) => (
									<Button
										key={shape}
										variant={state.activeCagedShapes.includes(shape) ? "primary" : "secondary"}
										size="sm"
										onClick={() =>
											setState((current) => ({
												...current,
												activeCagedShapes: toggleShape(current.activeCagedShapes, shape),
											}))
										}
									>
										{shape}
									</Button>
								))}
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="space-y-5 rounded-[24px] border border-[var(--gb-border)] bg-[linear-gradient(180deg,rgba(255,249,239,0.92),rgba(255,248,238,0.98))] p-5 shadow-[var(--gb-shadow)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="gb-page-kicker mb-1">Live View</p>
						<h2 className="text-3xl font-semibold text-[var(--gb-text)]">
							{rootLabel} {state.constructName}
						</h2>
						<p className="mt-2 max-w-2xl text-sm text-[var(--gb-text-muted)]">
							Square notes anchor the root. Switch to interval labels to see how each tone
							functions.
						</p>
					</div>
					<div className="rounded-[18px] border border-[var(--gb-border)] bg-[var(--gb-bg-panel)] px-4 py-3 text-sm text-[var(--gb-text)]">
						<span className="font-semibold">Formula:</span> {constructNotes.join(" - ")}
					</div>
				</div>

				<div className="overflow-x-auto rounded-[22px] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-3 md:p-4">
					<Fretboard
						mode="view"
						state={fretboardState}
						fretRange={state.fretRange}
						showNoteNames={state.labelType === "notes"}
						showIntervalLabels={state.labelType === "intervals"}
						ariaLabel="Fretboard explorer"
						onFretHoverChange={setHoveredPosition}
					/>
				</div>

				<TooltipCard
					position={hoveredPosition}
					root={state.root}
					accidentalPreference={state.accidentalPreference}
				/>
			</section>
		</div>
	);
}
