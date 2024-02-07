import { CommunicationRole, MessageType } from "./enums.js";
import { KeyValueMap, StorageObject, OldStorageObject } from "./interfaces/storage.js";
import {
    AddBlockingRuleMessage,
    IsBlockedMessage,
    Message,
    RemoveBlockingRuleMessage,
    RequestSettingsMessage,
    SettingsChangedMessage,
    StorageChangedMessage,
} from "./interfaces/interfaces.js";

console.log("START");

const STORAGE_VERSION = "1.0";
let storageObject: { [key: string]: number } = {};

let defaultStorage: StorageObject = {
    version: "0",
    blockedChannels: [],
    blockedChannelsRegExp: {},
    blockedComments: {},
    blockedVideoTitles: {},
    excludedChannels: [],
};

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

loadDataFromStorage();

function loadDataFromStorage() {
    chrome.storage.local.get(defaultStorage).then((result) => {
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
    });

    chrome.storage.local.get(settings).then((result) => {
        settings.buttonVisible = result.buttonVisible;
        settings.buttonColor = result.buttonColor;
        settings.buttonSize = result.buttonSize;
        settings.animationSpeed = result.animationSpeed;
    });
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.receiver !== CommunicationRole.SERVICE_WORKER) return;

    switch (message.type) {
        case MessageType.ADD_BLOCKING_RULE:
            handleAddBlockingRuleMessage(message);
            break;
        case MessageType.REMOVE_BLOCKING_RULE:
            handleRemoveBlockingRuleMessage(message);
            break;
        case MessageType.IS_BLOCKED:
            sendResponse(handleIsBlockedMessage(message));
            break;
        case MessageType.SETTINGS_CHANGED:
            sendSettingsChangedMessage(message);
            break;
        case MessageType.REQUEST_SETTINGS:
            sendResponse(handleRequestSettings(message));
            break;

        default:
            break;
    }
});

function handleRequestSettings(message: RequestSettingsMessage): {
    buttonVisible: boolean;
    buttonColor: string;
    buttonSize: number;
    animationSpeed: number;
} {
    return settings;
}

function handleAddBlockingRuleMessage(message: AddBlockingRuleMessage) {
    if (blockedChannelsSet.size === 0) {
        loadDataFromStorage();
    }

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

function handleRemoveBlockingRuleMessage(message: RemoveBlockingRuleMessage) {
    if (blockedChannelsSet.size === 0) {
        loadDataFromStorage();
    }

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

function handleIsBlockedMessage(message: IsBlockedMessage): boolean {
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
            console.log(`send storageChangedMessage to ${tab.id}`);
        }
    });

    if (configTabId !== undefined) {
        const storageChangedMessageForSettings = {
            sender: CommunicationRole.SERVICE_WORKER,
            receiver: CommunicationRole.SETTINGS,
            type: MessageType.STORAGE_CHANGED,
            content: undefined,
        };
        chrome.tabs.sendMessage(configTabId, storageChangedMessageForSettings);
    }
}

async function sendSettingsChangedMessage(message: SettingsChangedMessage) {
    message.receiver = CommunicationRole.CONTENT_SCRIPT;
    settings = message.content;

    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            if (tab.id !== undefined) chrome.tabs.sendMessage(tab.id, message);
        }
    });
}

let configTabId: number | undefined = undefined;

//open config page as default behavior of clicking the browserAction-button
chrome.action.onClicked.addListener(openConfig);

//if config tab was closed set configTabId to null
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === configTabId) configTabId = undefined;
});

//if an open config page exists makes config tab active, otherwise creates new config tab and make it active
async function openConfig() {
    if (configTabId === undefined) {
        let tab = await chrome.tabs.create({
            active: true,
            url: "./ui/settings/index.html",
        });

        configTabId = tab.id;
    } else {
        let tab = await chrome.tabs.update(configTabId, {
            active: true,
        });

        await chrome.windows.update(tab.windowId, {
            focused: true,
        });
    }
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
            0: 0,
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

        // Write data to storage
        chrome.storage.local
            .set({
                version: STORAGE_VERSION,
                blockedChannels: Array.from(blockedChannelsSet),
                blockedChannelsRegExp,
                blockedComments,
                blockedVideoTitles,
                excludedChannels: Array.from(excludedChannels),
            })
            .catch((error) => {
                console.error(error);
            })
            .then(() => {
                // remove old storage
                chrome.storage.local.remove(["0", "1", "2", "3", "4"]);
            });
    });
}

/**
 * Adds mock data to the storage.
 * Just used for testing.
 */
function mockOldStorageData() {
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
