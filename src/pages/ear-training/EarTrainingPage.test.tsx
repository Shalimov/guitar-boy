import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { EarTrainingPage } from "./EarTrainingPage";

jest.mock("@/lib/audio", () => ({
	playFretPosition: jest.fn(() => Promise.resolve()),
}));

function renderEarTrainingPage() {
	return render(
		<BrowserRouter>
			<EarTrainingPage />
		</BrowserRouter>,
	);
}

describe("EarTrainingPage", () => {
	it("renders mode selection screen", () => {
		renderEarTrainingPage();

		expect(screen.getByText("Ear Training")).toBeInTheDocument();
		expect(screen.getByText("Train your ears")).toBeInTheDocument();
		expect(screen.getByText("Hear & Identify")).toBeInTheDocument();
		expect(screen.getByText("Tone Meditation")).toBeInTheDocument();
		expect(screen.getByText("Anchor Note")).toBeInTheDocument();
	});

	it("navigates to hear-identify mode", async () => {
		const user = userEvent.setup();
		renderEarTrainingPage();

		const buttons = screen.getAllByRole("button", { name: "Start" });
		await user.click(buttons[0]);

		expect(screen.getByText("Back to modes")).toBeInTheDocument();
	});

	it("navigates to tone-meditation mode", async () => {
		const user = userEvent.setup();
		renderEarTrainingPage();

		const buttons = screen.getAllByRole("button", { name: "Start" });
		await user.click(buttons[1]);

		expect(screen.getByText("Back to modes")).toBeInTheDocument();
	});

	it("navigates to anchor-note mode", async () => {
		const user = userEvent.setup();
		renderEarTrainingPage();

		const buttons = screen.getAllByRole("button", { name: "Start" });
		await user.click(buttons[2]);

		expect(screen.getByText("Back to modes")).toBeInTheDocument();
		expect(screen.getByText("Anchor Note Training")).toBeInTheDocument();
	});

	it("can navigate back to mode selection", async () => {
		const user = userEvent.setup();
		renderEarTrainingPage();

		const buttons = screen.getAllByRole("button", { name: "Start" });
		await user.click(buttons[2]);

		expect(screen.getByText("Anchor Note Training")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Back to modes" }));

		expect(screen.getByText("Hear & Identify")).toBeInTheDocument();
		expect(screen.getByText("Tone Meditation")).toBeInTheDocument();
		expect(screen.getByText("Anchor Note")).toBeInTheDocument();
	});
});
