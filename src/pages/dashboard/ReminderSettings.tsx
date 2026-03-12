import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/hooks/useProgressStore";
import { canSendNotifications, requestNotificationPermission } from "@/lib/reminders";

export function ReminderSettings() {
	const { store, updateSettings } = useProgressStore();
	const [hasPermission, setHasPermission] = useState(false);

	const reminder = store.settings.reminder || { enabled: false, time: "09:00" };

	useEffect(() => {
		setHasPermission(canSendNotifications());
	}, []);

	const handleToggleReminders = async () => {
		if (!reminder.enabled && !hasPermission) {
			const granted = await requestNotificationPermission();
			setHasPermission(granted);
			if (!granted) return;
		}

		updateSettings({
			reminder: {
				...reminder,
				enabled: !reminder.enabled,
			},
		});
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateSettings({
			reminder: {
				...reminder,
				time: e.target.value,
			},
		});
	};

	const handleTestNotification = () => {
		if (canSendNotifications()) {
			new Notification("Guitar Boy Test", {
				body: "Notifications are working! See you at practice.",
			});
		} else {
			alert("Notifications not permitted.");
		}
	};

	return (
		<div className="rounded-[var(--gb-radius-card)] border border-[var(--gb-border)] bg-[var(--gb-bg-elev)] p-5 space-y-4 shadow-[var(--gb-shadow-soft)]">
			<div className="flex justify-between items-start">
				<div>
					<p className="gb-page-kicker">Habit Builder</p>
					<h3 className="text-lg font-bold text-[var(--gb-text)]">Practice Reminders</h3>
				</div>
				<button
					type="button"
					role="switch"
					aria-checked={reminder.enabled}
					onClick={handleToggleReminders}
					style={{
						background: reminder.enabled ? "var(--gb-accent)" : "var(--gb-bg-tab)",
					}}
					className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none"
				>
					<span
						className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
							reminder.enabled ? "translate-x-6" : "translate-x-1"
						}`}
						style={{ background: "#fff8ee" }}
					/>
				</button>
			</div>

			<p className="text-sm text-[var(--gb-text-muted)]">
				Get a nudge on your device when you have cards due for review.
			</p>

			{reminder.enabled && (
				<div className="pt-4 border-t border-[var(--gb-border)]/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="flex items-center justify-between">
						<label htmlFor="reminder-time" className="text-sm font-semibold text-[var(--gb-text)]">
							Reminder Time
						</label>
						<input
							id="reminder-time"
							type="time"
							value={reminder.time}
							onChange={handleTimeChange}
							className="bg-[var(--gb-bg-panel)] border border-[var(--gb-border)] rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--gb-text)] focus:ring-2 focus:ring-[var(--gb-accent-soft)] outline-none"
						/>
					</div>

					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<div
								className={`w-2 h-2 rounded-full ${hasPermission ? "bg-green-500" : "bg-red-500"}`}
							/>
							<span className="text-xs font-medium text-[var(--gb-text-muted)]">
								{hasPermission ? "Notifications allowed" : "Permission needed"}
							</span>
						</div>
						<Button
							variant="secondary"
							size="sm"
							onClick={handleTestNotification}
							className="text-xs"
						>
							Test Ping
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
