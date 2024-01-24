import { CommunicationRole, MessageType } from "./enums.js";
import {
    AddBlockingRuleMessage,
    IsBlockedMessage,
    KeyValueMap,
    Message,
    RemoveBlockingRuleMessage,
    StorageChangedMessage,
    StorageObject,
} from "./interfaces.js";

console.log("START");

let storageObject: { [key: string]: number } = {};

let defaultStorage: StorageObject = {
    version: 0,
    blockedChannels: [],
    blockedChannelsRegExp: {},
    blockedComments: {},
    blockedVideoTitles: {},
    excludedChannels: [],
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

        if (storageObject.version === 0) {
            // TODO handel old storage / first storage
            chrome.storage.local.set({ version: 1.0 });
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
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.receiver !== CommunicationRole.SERVICE_WORKER) return;

    console.log(`new ${MessageType[message.type]} message`);

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

        default:
            break;
    }
});

function handleAddBlockingRuleMessage(message: AddBlockingRuleMessage) {
    if (blockedChannelsSet.size === 0) {
        loadDataFromStorage();
    }

    if (message.content.blockedChannel !== undefined) {
        blockedChannelsSet.add(message.content.blockedChannel);
        chrome.storage.local.set({ blockedChannels: Array.from(blockedChannelsSet) });
    }
    if (message.content.blockingChannelRegExp !== undefined) {
        blockedChannelsRegExp[message.content.blockingChannelRegExp] = "";
        chrome.storage.local.set({ blockedChannelsRegExp });
    }
    if (message.content.blockingCommentRegExp !== undefined) {
        blockedComments[message.content.blockingCommentRegExp] = "";
        chrome.storage.local.set({ blockedComments });
    }
    if (message.content.blockingVideoTitleRegExp !== undefined) {
        blockedVideoTitles[message.content.blockingVideoTitleRegExp] = "";
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

function handleIsBlockedMessage(message: IsBlockedMessage) {
    if (message.content.userChannelName !== undefined) {
        if (excludedChannels.has(message.content.userChannelName)) return false;
        if (blockedChannelsSet.has(message.content.userChannelName)) return true;
        for (const regEgx in blockedChannelsRegExp) {
            if (Object.prototype.hasOwnProperty.call(blockedChannelsRegExp, regEgx)) {
                if (message.content.userChannelName.match(regEgx)) return true;
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
