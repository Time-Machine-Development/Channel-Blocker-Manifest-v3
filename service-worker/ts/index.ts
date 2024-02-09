import { CommunicationRole, MessageType } from "./enums.js";
import { Message } from "./interfaces/interfaces.js";
import {
    handleAddBlockingRuleMessage,
    handleIsBlockedMessage,
    handleRemoveBlockingRuleMessage,
    handleRequestSettings,
    handleStorageChangedMessage,
    loadDataFromStorage,
    sendSettingsChangedMessage,
} from "./storage.js";

console.log("START");

export let configTabId: number | undefined = undefined;

loadDataFromStorage();
initListeners();

/**
 * Add a message listener, a browser cation listener and on tab removed listener.
 */
function initListeners() {
    chrome.runtime.onMessage.addListener(
        (message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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
                case MessageType.STORAGE_CHANGED:
                    handleStorageChangedMessage(message);
                    break;

                default:
                    break;
            }
        }
    );

    //open config page as default behavior of clicking the browserAction-button
    chrome.action.onClicked.addListener(openConfig);

    //if config tab was closed set configTabId to null
    chrome.tabs.onRemoved.addListener((tabId) => {
        if (tabId === configTabId) configTabId = undefined;
    });
}

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
