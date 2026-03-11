import { useCallback, useEffect, useState } from "react";

/**
 * Generic hook for managing localStorage with schema migration
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	migrate?: (data: unknown, fromVersion: number) => T,
): [T, (value: T | ((prev: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			if (!item) return initialValue;

			const parsed = JSON.parse(item);

			if (migrate && typeof parsed === "object" && parsed !== null && "version" in parsed) {
				const data = parsed as { version: number };
				if (data.version !== (initialValue as { version?: number }).version) {
					const migrated = migrate(parsed, data.version);
					window.localStorage.setItem(key, JSON.stringify(migrated));
					return migrated;
				}
			}

			return parsed as T;
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setValue = useCallback(
		(value: T | ((prev: T) => T)) => {
			try {
				setStoredValue((prev) => {
					const valueToStore = value instanceof Function ? value(prev) : value;
					window.localStorage.setItem(key, JSON.stringify(valueToStore));
					return valueToStore;
				});
			} catch (error) {
				console.error(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key],
	);

	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue) {
				try {
					setStoredValue(JSON.parse(e.newValue));
				} catch (error) {
					console.error(`Error parsing storage event for key "${key}":`, error);
				}
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key]);

	return [storedValue, setValue];
}
