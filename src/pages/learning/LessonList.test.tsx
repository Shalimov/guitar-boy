import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonList } from "./LessonList";

describe("LessonList", () => {
	it("shows the new note-learning lesson", () => {
		render(<LessonList onSelectLesson={jest.fn()} />);

		expect(screen.getByText(/first position note map/i)).toBeInTheDocument();
		expect(
			screen.getByText(/learn and hear the natural notes across the first five frets/i),
		).toBeInTheDocument();
	});

	it("starts the first-position lesson from the notes category", async () => {
		const onSelectLesson = jest.fn();

		render(<LessonList onSelectLesson={onSelectLesson} />);

		const startButtons = screen.getAllByRole("button", { name: /start lesson/i });
		await userEvent.click(startButtons[1]);

		expect(onSelectLesson).toHaveBeenCalled();
	});
});
