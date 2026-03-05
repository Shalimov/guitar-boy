import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card, CardContent, CardHeader } from "./Card";

describe("Card", () => {
	it("renders children", () => {
		render(
			<Card>
				<div>Card content</div>
			</Card>,
		);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("calls onClick when clicked", async () => {
		const onClick = jest.fn();
		render(<Card onClick={onClick}>Clickable card</Card>);

		await userEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("calls onClick when Enter key pressed", async () => {
		const onClick = jest.fn();
		render(<Card onClick={onClick}>Clickable card</Card>);

		const card = screen.getByRole("button");
		card.focus();
		await userEvent.keyboard("{Enter}");

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("applies clickable styles when onClick provided", () => {
		render(<Card onClick={() => {}}>Clickable</Card>);
		expect(screen.getByRole("button")).toHaveClass("cursor-pointer", "hover:shadow-lg");
	});

	it("does not apply clickable styles without onClick", () => {
		render(<Card>Not clickable</Card>);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("supports custom className", () => {
		render(<Card className="custom-class">Custom</Card>);
		const card = screen.getByText("Custom").closest("div");
		expect(card).toHaveClass("custom-class");
	});
});

describe("CardHeader", () => {
	it("renders header text", () => {
		render(<CardHeader>Header</CardHeader>);
		expect(screen.getByRole("heading", { name: /header/i })).toBeInTheDocument();
	});

	it("supports custom className", () => {
		render(<CardHeader className="custom">Header</CardHeader>);
		expect(screen.getByRole("heading")).toHaveClass("custom");
	});
});

describe("CardContent", () => {
	it("renders content", () => {
		render(<CardContent>Content</CardContent>);
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("supports custom className", () => {
		render(<CardContent className="custom">Content</CardContent>);
		expect(screen.getByText("Content")).toHaveClass("custom");
	});
});
