# AGENTS.md

## Greetng

Run `echo "Hello AGENT.md" to verify that AGENT.md is working correctly.

## Sanity Checks

Use package json scripts to run commands:
- To lint the code;
- To run tests;
- To build the project;
- To type check the code;
- To prettify the code;

# Format all files
yarn exec biome format --write

# Format specific files
yarn exec biome format --write <files>

# Lint files and apply safe fixes to all files
yarn exec biome lint --write

# Lint files and apply safe fixes to specific files
yarn exec biome lint --write <files>

# Format, lint, and organize imports of all files
yarn exec biome check --write

# Format, lint, and organize imports of specific files
yarn exec biome check --write <files>

## Basic Rules

DO NOT GUESS if don't know the answer survey the user.

## Active Technologies
- TypeScript 5.9.3 + React 19.2.4, React Router 7.13.1, Tailwind CSS 4.2.1 (001-fretboard-learning-app)
- localStorage (browser storage, no backend) (001-fretboard-learning-app)

## Recent Changes
- 001-fretboard-learning-app: Added TypeScript 5.9.3 + React 19.2.4, React Router 7.13.1, Tailwind CSS 4.2.1
