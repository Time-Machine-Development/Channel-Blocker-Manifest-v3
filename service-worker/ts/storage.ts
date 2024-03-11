import { CommunicationRole, MessageType } from "./enums.js";
import { KeyValueMap, StorageObject, OldStorageObject, SettingsStorageObject } from "./interfaces/storage.js";
import {
    AddBlockingRuleMessage,
    IsBlockedMessage,
    RemoveBlockingRuleMessage,
    RequestSettingsMessage,
    SettingsChangedMessage,
    StorageChangedMessage,
} from "./interfaces/interfaces.js";
import { clamp, getConfigTabs } from "./helper.js";

let defaultStorage: StorageObject = {
    version: "0",
    blockedChannels: [],
    blockedChannelsRegExp: {},
    blockedComments: {},
    blockedVideoTitles: {},
    excludedChannels: [],
};

const STORAGE_VERSION = "1.0";

let storageVersion: string | undefined = undefined;
let settings = {
    buttonVisible: true,
    buttonColor: "#717171",
    buttonSize: 142,
    animationSpeed: 200,
};

let blockedChannelsSet = new Set<string>();
let excludedChannels = new Set<string>();

let blockedChannelsRegExp: KeyValueMap = {};
let blockedComments: KeyValueMap = {};
let blockedVideoTitles: KeyValueMap = {};

export async function loadDataIfNecessary() {
    if (storageVersion != STORAGE_VERSION) {
        await loadDataFromStorage();

        console.log("Reload data");

        sendStorageChangedMessage();
        sendSettingsChangedMessage();
    }
}

/**
 * Load the blocking rules and settings.
 */
export async function loadDataFromStorage() {
    const result = await chrome.storage.local.get({ ...defaultStorage, settings });

    const storageObject = result as StorageObject;
    console.log("Loaded stored data", storageObject);

    if (storageObject.version === "0") {
        convertOldStorage();
    } else {
        for (let index = 0; index < storageObject.blockedChannels.length; index++) {
            blockedChannelsSet.add(storageObject.blockedChannels[index]);
        }
        for (let index = 0; index < storageObject.excludedChannels.length; index++) {
            excludedChannels.add(storageObject.excludedChannels[index]);
        }

        blockedChannelsRegExp = storageObject.blockedChannelsRegExp;
        blockedComments = storageObject.blockedComments;
        blockedVideoTitles = storageObject.blockedVideoTitles;
    }

    settings.buttonVisible = result.settings.buttonVisible;
    settings.buttonColor = result.settings.buttonColor;
    settings.buttonSize = result.settings.buttonSize;
    settings.animationSpeed = result.settings.animationSpeed;
    storageVersion = STORAGE_VERSION;
}

/**
 * Add a blocking rule to the storage and send a storage changed message to all tabs running YouTube.
 * @param message The message containing the blocking rule to add.
 */
export function handleAddBlockingRuleMessage(message: AddBlockingRuleMessage) {
    if (message.content.blockedChannel !== undefined) {
        blockedChannelsSet.add(message.content.blockedChannel);
        chrome.storage.local.set({ blockedChannels: Array.from(blockedChannelsSet) });
    }
    if (message.content.blockingChannelRegExp !== undefined) {
        blockedChannelsRegExp[message.content.blockingChannelRegExp] = message.content.caseInsensitive ? "i" : "";
        chrome.storage.local.set({ blockedChannelsRegExp });
    }
    if (message.content.blockingCommentRegExp !== undefined) {
        blockedComments[message.content.blockingCommentRegExp] = message.content.caseInsensitive ? "i" : "";
        chrome.storage.local.set({ blockedComments });
    }
    if (message.content.blockingVideoTitleRegExp !== undefined) {
        blockedVideoTitles[message.content.blockingVideoTitleRegExp] = message.content.caseInsensitive ? "i" : "";
        chrome.storage.local.set({ blockedVideoTitles });
    }
    if (message.content.excludedChannel !== undefined) {
        excludedChannels.add(message.content.excludedChannel);
        chrome.storage.local.set({ excludedChannels: Array.from(excludedChannels) });
    }

    sendStorageChangedMessage();
}

/**
 * Remove a blocking rule from the storage and send a storage changed message to all tabs running YouTube.
 * @param message The message containing the blocking rule to remove.
 */
export function handleRemoveBlockingRuleMessage(message: RemoveBlockingRuleMessage) {
    if (message.content.blockedChannel !== undefined) {
        for (let index = 0; index < message.content.blockedChannel.length; index++) {
            blockedChannelsSet.delete(message.content.blockedChannel[index]);
        }
        chrome.storage.local.set({ blockedChannels: Array.from(blockedChannelsSet) });
    }
    if (message.content.blockingChannelRegExp !== undefined) {
        for (let index = 0; index < message.content.blockingChannelRegExp.length; index++) {
            delete blockedChannelsRegExp[message.content.blockingChannelRegExp[index]];
        }
        chrome.storage.local.set({ blockedChannelsRegExp });
    }
    if (message.content.blockingCommentRegExp !== undefined) {
        for (let index = 0; index < message.content.blockingCommentRegExp.length; index++) {
            delete blockedComments[message.content.blockingCommentRegExp[index]];
        }
        chrome.storage.local.set({ blockedComments });
    }
    if (message.content.blockingVideoTitleRegExp !== undefined) {
        for (let index = 0; index < message.content.blockingVideoTitleRegExp.length; index++) {
            delete blockedVideoTitles[message.content.blockingVideoTitleRegExp[index]];
        }
        chrome.storage.local.set({ blockedVideoTitles });
    }
    if (message.content.excludedChannel !== undefined) {
        for (let index = 0; index < message.content.excludedChannel.length; index++) {
            excludedChannels.delete(message.content.excludedChannel[index]);
        }
        chrome.storage.local.set({ excludedChannels: Array.from(excludedChannels) });
    }

    sendStorageChangedMessage();
}

/**
 * Checks if the given userChannelName, videoTitle or commentContent matches any of the blocking rules.
 * @param message The message containing userChannelName, videoTitle or commentContent.
 * @returns
 */
export function handleIsBlockedMessage(message: IsBlockedMessage): boolean {
    if (message.content.userChannelName !== undefined) {
        if (excludedChannels.has(message.content.userChannelName)) return false;
        if (blockedChannelsSet.has(message.content.userChannelName)) return true;
        for (const key in blockedChannelsRegExp) {
            if (Object.prototype.hasOwnProperty.call(blockedChannelsRegExp, key)) {
                const regEgx = new RegExp(key, blockedChannelsRegExp[key]);
                if (regEgx.test(message.content.userChannelName)) return true;
            }
        }
    }
    if (message.content.videoTitle !== undefined) {
        for (const key in blockedVideoTitles) {
            if (Object.prototype.hasOwnProperty.call(blockedVideoTitles, key)) {
                const regEgx = new RegExp(key, blockedVideoTitles[key]);
                if (regEgx.test(message.content.videoTitle)) return true;
            }
        }
    }
    if (message.content.commentContent !== undefined) {
        for (const key in blockedComments) {
            if (Object.prototype.hasOwnProperty.call(blockedComments, key)) {
                const regEgx = new RegExp(key, blockedComments[key]);
                if (regEgx.test(message.content.commentContent)) return true;
            }
        }
    }
    return false;
}

/**
 * Reloads the storage and settings and sends a storage changed message to all tabs running YouTube.
 * @param message The StorageChangedMessage.
 */
export async function handleStorageChangedMessage(message: StorageChangedMessage) {
    await loadDataFromStorage();
    sendStorageChangedMessage();
    sendSettingsChangedMessage();
}

/**
 * Returns the settings.
 * @param message The RequestSettingsMessage.
 * @returns The settings.
 */
export function handleRequestSettings(message: RequestSettingsMessage): {
    buttonVisible: boolean;
    buttonColor: string;
    buttonSize: number;
    animationSpeed: number;
} {
    return settings;
}

/**
 * Sends a storage changed message to all tabs that have YouTube open and the config tab if an tab id is available.
 */
async function sendStorageChangedMessage() {
    const storageChangedMessage: StorageChangedMessage = {
        sender: CommunicationRole.SERVICE_WORKER,
        receiver: CommunicationRole.CONTENT_SCRIPT,
        type: MessageType.STORAGE_CHANGED,
        content: undefined,
    };

    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            if (tab.id !== undefined) chrome.tabs.sendMessage(tab.id, storageChangedMessage);
        }
    });

    const configTabs = await getConfigTabs();
    for (let index = 0; index < configTabs.length; index++) {
        const tab = configTabs[index];
        const storageChangedMessageForSettings = {
            sender: CommunicationRole.SERVICE_WORKER,
            receiver: CommunicationRole.SETTINGS,
            type: MessageType.STORAGE_CHANGED,
            content: undefined,
        };
        chrome.tabs.sendMessage(tab.id, storageChangedMessageForSettings);
    }
}

/**
 * Sends a settings changed message to all tabs that have YouTube open.
 * If is gets a settings changed message it changes the receiver to CONTENT_SCRIPT.
 * @param message The settings changed message.
 */
export async function sendSettingsChangedMessage(
    message: SettingsChangedMessage = {
        sender: CommunicationRole.SETTINGS,
        receiver: CommunicationRole.CONTENT_SCRIPT,
        type: MessageType.SETTINGS_CHANGED,
        content: settings,
    }
) {
    message.receiver = CommunicationRole.CONTENT_SCRIPT;
    settings = message.content;

    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            if (tab.id !== undefined) chrome.tabs.sendMessage(tab.id, message);
        }
    });
}

/**
 * Loads the old storage data and converts it to the new format.
 * It stores the new data and removes the old.
 */
function convertOldStorage() {
    const defaultOldStorage: OldStorageObject = {
        "0": {},
        "1": {},
        "2": {},
        "3": {},
        "4": {},
        content_ui: {
            "0": true,
            "1": "#717171",
            "2": 106,
            "3": 200,
        },
        settings_ui: {
            0: -1,
            1: false,
            2: false,
        },
    };
    chrome.storage.local.get(defaultOldStorage).then((result) => {
        const storageObject = result as OldStorageObject;
        console.log("Loaded stored data", storageObject);

        if (
            storageObject[0] === undefined ||
            storageObject[1] === undefined ||
            storageObject[2] === undefined ||
            storageObject[3] === undefined ||
            storageObject[4] === undefined
        ) {
            return;
        }

        // Add blocked channels
        for (const key in storageObject[0]) {
            if (Object.prototype.hasOwnProperty.call(storageObject[0], key)) {
                blockedChannelsSet.add(key);
            }
        }

        // Add blocked blockedVideoTitles
        for (const key in storageObject[1]) {
            if (Object.prototype.hasOwnProperty.call(storageObject[1], key)) {
                blockedVideoTitles[key] = storageObject[1][key] === 0 ? "i" : "";
            }
        }

        // Add blocked blockedChannelsRegExp
        for (const key in storageObject[2]) {
            if (Object.prototype.hasOwnProperty.call(storageObject[2], key)) {
                blockedChannelsRegExp[key] = storageObject[2][key] === 0 ? "i" : "";
            }
        }

        // Add blocked blockedComments
        for (const key in storageObject[3]) {
            if (Object.prototype.hasOwnProperty.call(storageObject[3], key)) {
                blockedComments[key] = storageObject[3][key] === 0 ? "i" : "";
            }
        }

        // Add excluded channels
        for (const key in storageObject[4]) {
            if (Object.prototype.hasOwnProperty.call(storageObject[4], key)) {
                excludedChannels.add(key);
            }
        }

        // Add settings
        let settingsStorageObject: SettingsStorageObject = {
            version: STORAGE_VERSION,
            settings: {
                // The old format only had two designs. Dark: 0 and Light: 1.
                // Currently Device: 0 is the default, therefore adding 1 adjusts this.
                design: clamp(0, 2, storageObject.settings_ui[0] + 1),
                // No longer in use
                advancedView: storageObject.settings_ui[1],
                openPopup: storageObject.settings_ui[2],
                buttonVisible: storageObject.content_ui[0],
                buttonColor: storageObject.content_ui[1],
                // The old default was 106, but in the new implementation this is pretty small so add 36 to adjust.
                // Also clamp the value between 100 and 200.
                buttonSize: clamp(100, 200, storageObject.content_ui[2] + 36),
                animationSpeed: clamp(100, 200, storageObject.content_ui[3]),
            },
        };

        // Write data to storage
        chrome.storage.local
            .set({
                version: STORAGE_VERSION,
                blockedChannels: Array.from(blockedChannelsSet),
                blockedChannelsRegExp,
                blockedComments,
                blockedVideoTitles,
                excludedChannels: Array.from(excludedChannels),
                settings: settingsStorageObject.settings,
            })
            .catch((error) => {
                console.error(error);
            })
            .then(() => {
                // remove old storage
                chrome.storage.local.remove(["0", "1", "2", "3", "4", "content_ui", "settings_ui"]);
            });
    });
}
