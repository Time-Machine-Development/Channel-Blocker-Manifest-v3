import { Tab } from "./interfaces/interfaces.js";

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
 * Finds all config tab (There should normally just be one) and return them in a list.
 * @returns A list of config tabs.
 */
export async function getConfigTabs(): Promise<Tab[]> {
    let configTabs: Tab[] = [];
    const configURL = chrome.runtime.getURL("/*");
    const tabs = await chrome.tabs.query({ url: configURL });
    for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index];
        if (tab.id !== undefined) configTabs.push(tab as Tab);
    }
    return configTabs;
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
