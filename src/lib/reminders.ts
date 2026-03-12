/**
 * Request notification permission from the browser.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
	if (!("Notification" in window)) return false;
	if (Notification.permission === "granted") return true;
	const result = await Notification.requestPermission();
	return result === "granted";
}

/**
 * Check if notifications are supported and permitted.
 */
export function canSendNotifications(): boolean {
	return "Notification" in window && Notification.permission === "granted";
}

/**
 * Schedule a daily notification check.
 * Uses setInterval to check every minute if it's the reminder time.
 * Returns a cleanup function.
 */
export function scheduleReminder(time: string, dueCardCount: number): () => void {
	let lastNotifiedDate = "";

	const check = () => {
		if (!canSendNotifications()) return;
		if (dueCardCount <= 0) return;

		const now = new Date();
		const todayStr = now.toISOString().split("T")[0];
		if (lastNotifiedDate === todayStr) return;

		const [targetH, targetM] = time.split(":").map(Number);
		if (now.getHours() === targetH && now.getMinutes() === targetM) {
			new Notification("Guitar Boy — Time to practice!", {
				body: `You have ${dueCardCount} cards due. 5 minutes to stay sharp.`,
				icon: "/favicon.ico",
			});
			lastNotifiedDate = todayStr;
		}
	};

	// Initial check
	check();

	const intervalId = setInterval(check, 60000);
	return () => clearInterval(intervalId);
}
