import { act, render, screen } from "@testing-library/react";
import { AudioEqualizer } from "./AudioEqualizer";

const subscribeToPlaybackStateMock = jest.fn();

jest.mock("@/lib/audio", () => ({
	getEqualizerLevels: jest.fn(() => Array.from({ length: 22 }, () => 0.25)),
	subscribeToPlaybackState: (listener: (isPlaying: boolean) => void) =>
		subscribeToPlaybackStateMock(listener),
}));

describe("AudioEqualizer", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		subscribeToPlaybackStateMock.mockImplementation((listener: (isPlaying: boolean) => void) => {
			listener(false);
			return jest.fn();
		});
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
	});

	it("shows ready state by default", () => {
		render(<AudioEqualizer />);

		expect(screen.getByText(/ready/i)).toBeInTheDocument();
	});

	it("updates to playing state when audio subscription emits active playback", () => {
		render(<AudioEqualizer />);

		const listener = subscribeToPlaybackStateMock.mock.calls[0][0] as (isPlaying: boolean) => void;

		act(() => {
			listener(true);
			jest.advanceTimersByTime(20);
		});

		expect(screen.getByText(/playing/i)).toBeInTheDocument();
	});
});
