# Lesson Creation Guide

This guide explains how to create new lessons for the Fretboard Learning App.

## Lesson Structure

Each lesson is a TypeScript file in `src/data/lessons/` that exports a `Lesson` object.

### Basic Template

```typescript
import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
	id: "lesson-XX-short-title",
	title: "Lesson Title",
	description: "Brief description of what the learner will master",
	category: "notes", // or "intervals", "chords", "patterns"
	difficulty: "beginner", // or "intermediate", "advanced"
	steps: [
		// Steps go here
	],
};

export default lesson;
```

## Step Types

### Explain Step

Shows content with optional fretboard visualization.

```typescript
{
	type: "explain",
	title: "Step Title",
	content: "Text content with **markdown-like** formatting.\n\nNew paragraphs separated by newlines.",
	fretboardState?: {
		dots: [
			{
				position: { string: 0, fret: 5 },
				label: "A",
				color: "#3B82F6",
				shape: "circle"
			}
		],
		lines: []
	}
}
```

### Verify Step

Interactive quiz to check understanding.

```typescript
{
	type: "verify",
	instruction: "Click on the position of the note A",
	targetPositions: [
		{ string: 0, fret: 5 }
	],
	fretboardState?: {
		dots: [],
		lines: []
	}
}
```

## Creating a New Lesson

### 1. Create the File

```bash
# Create new lesson file
touch src/data/lessons/lesson-14-my-lesson.ts
```

### 2. Define the Lesson

```typescript
import type { Lesson } from "@/types/lesson";

const lesson: Lesson = {
	id: "lesson-14-pentatonic-scale",
	title: "Minor Pentatonic Scale",
	description: "Learn the A minor pentatonic scale pattern",
	category: "patterns",
	difficulty: "intermediate",
	steps: [
		{
			type: "explain",
			title: "Introduction to Pentatonic Scales",
			content: "The pentatonic scale is a five-note scale...",
			fretboardState: {
				dots: [
					{ position: { string: 0, fret: 5 }, label: "A", color: "#3B82F6" },
					{ position: { string: 0, fret: 8 }, label: "C", color: "#3B82F6" },
				],
				lines: [],
			},
		},
		{
			type: "verify",
			instruction: "Click on the root note (A)",
			targetPositions: [{ string: 0, fret: 5 }],
			fretboardState: { dots: [], lines: [] },
		},
	],
};

export default lesson;
```

### 3. Add to Curriculum

Update `src/data/lessons/index.ts`:

```typescript
import lesson01 from "./lesson-01";
// ... other imports
import lesson14 from "./lesson-14-pentatonic-scale";

export const lessons: Lesson[] = [
	lesson01,
	// ... other lessons
	lesson14,
];
```

## Best Practices

### Lesson Flow

1. **Start with explain**: Introduce the concept
2. **Add verify steps**: Check understanding progressively
3. **End with explain**: Summarize and provide next steps

### Fretboard Visualization

- Use colors consistently:
  - Blue (`#3B82F6`): New information
  - Green (`#10B981`): Correct/completed
  - Red (`#EF4444`): Incorrect/missed
  - Yellow (`#F59E0B`): Warning/attention

- Label important positions with note names
- Use shapes to distinguish different types:
  - Circle: Standard notes
  - Square: Root notes
  - Diamond: Special positions

### Content Guidelines

- Keep explanations concise (2-3 paragraphs max per step)
- Use bullet points for lists
- Include practical context (why this matters)
- Provide clear instructions for verify steps

### Difficulty Levels

- **Beginner**: Frets 0-5, basic concepts
- **Intermediate**: Frets 0-12, standard patterns
- **Advanced**: Frets 0-24, complex concepts

### Target Positions

For verify steps:
- Single position: One correct answer
- Multiple positions: All must be clicked
- Consider common mistakes (avoid ambiguous positions)

## Testing Your Lesson

1. Start the dev server: `yarn dev`
2. Navigate to Learning Mode
3. Find your lesson in the list
4. Complete all steps
5. Verify:
   - Instructions are clear
   - Fretboard renders correctly
   - Verify steps accept correct answers
   - Progress indicator updates

## Example: Complete Lesson

See `src/data/lessons/lesson-01.ts` for a complete example with:
- Multiple explain steps
- Multiple verify steps
- Fretboard visualizations
- Proper progression

## Common Patterns

### Pattern 1: Note Recognition

```typescript
{
	type: "verify",
	instruction: "Find all positions of E",
	targetPositions: [
		{ string: 0, fret: 0 },
		{ string: 0, fret: 12 },
		{ string: 1, fret: 7 },
		// ... more positions
	],
}
```

### Pattern 2: Interval Recognition

```typescript
{
	type: "explain",
	title: "Major Third",
	content: "A major third is 4 semitones...",
	fretboardState: {
		dots: [
			{ position: { string: 0, fret: 0 }, label: "R", color: "#3B82F6" },
			{ position: { string: 0, fret: 4 }, label: "3", color: "#10B981" },
		],
		lines: [
			{
				from: { string: 0, fret: 0 },
				to: { string: 0, fret: 4 },
				color: "#4A3A2C"
			}
		]
	}
}
```

### Pattern 3: Chord Building

```typescript
{
	type: "explain",
	title: "Major Triad",
	content: "Major triads consist of root, major third, and perfect fifth...",
	fretboardState: {
		dots: [
			{ position: { string: 0, fret: 0 }, label: "R", color: "#3B82F6" },
			{ position: { string: 1, fret: 2 }, label: "3", color: "#10B981" },
			{ position: { string: 2, fret: 2 }, label: "5", color: "#10B981" },
		],
		lines: []
	}
}
```

## Tips

1. **Test with fresh eyes**: Walk through as a new user would
2. **Get feedback**: Have others try your lesson
3. **Iterate**: Refine based on user experience
4. **Keep it focused**: One concept per lesson
5. **Build on previous lessons**: Reference earlier concepts

## Need Help?

- Review existing lessons in `src/data/lessons/`
- Check types in `src/types/lesson.ts`
- See component contracts in `specs/001-fretboard-learning-app/contracts/`
