/**
 * Add days to a date and return ISO date string
 */
export function addDays(date: Date | string, days: number): string {
	const d = typeof date === "string" ? new Date(date) : new Date(date);
	d.setDate(d.getDate() + days);
	return d.toISOString().split("T")[0];
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
	const d = typeof date === "string" ? new Date(date) : date;
	const today = new Date();
	return (
		d.getFullYear() === today.getFullYear() &&
		d.getMonth() === today.getMonth() &&
		d.getDate() === today.getDate()
	);
}

/**
 * Get today's date as ISO string
 */
export function getToday(): string {
	return new Date().toISOString().split("T")[0];
}
