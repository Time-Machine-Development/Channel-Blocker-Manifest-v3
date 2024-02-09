/**
 * Limits a value to a range between a minimum and a maximum value.
 * @param min The minimum value.
 * @param max The maximum value.
 * @param value The value to be clamped.
 * @returns
 */
export function clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Adds mock data to the storage.
 * Just used for testing.
 */
export function mockOldStorageData() {
    console.log("Clear all data");
    chrome.storage.local.clear();

    console.log("Add mock data");
    chrome.storage.local.set({
        "0": {
            test: 53,
            test1: 53,
            "This is a test": 53,
            42: 53,
        },
        "1": {
            "[\\u03A0-\\u1CC0]": 1,
            is: 1,
            "case-insensitive": 0,
            "case-sensitive": 1,
        },
        "2": {
            test: 1,
            "case-insensitive": 0,
            "case-sensitive": 1,
        },
        "3": {
            test: 0,
            "case-insensitive": 0,
            "case-sensitive": 1,
        },
        "4": {
            test: 53,
        },
        content_ui: {
            "0": true,
            "1": "#717171",
            "2": 106,
            "3": 200,
        },
        settings_ui: {
            "0": 0,
            "1": true,
            "2": true,
        },
    });
}
