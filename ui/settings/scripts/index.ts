import { CommunicationRole, MessageType, SettingsState } from "./enums.js";
import { AddBlockingRuleMessage, Message, RemoveBlockingRuleMessage } from "./interfaces/interfaces.js";
import { KeyValueMap, StorageObject } from "./interfaces/storage.js";
import { initFaq } from "./faq.js";
import { initNavigation } from "./navigation.js";
import { initAppearanceUI } from "./settings.js";
import { initImportExport } from "./importExport.js";

console.log("Settings scripts");

const blockedChannelsSelect: HTMLSelectElement = document.getElementById("blocked-channels") as HTMLSelectElement;
const blockedChannelsInput: HTMLInputElement = document.getElementById("blocked-channels-input") as HTMLInputElement;
const blockedChannelsAddBtn: HTMLButtonElement = document.getElementById("blocked-channels-add-btn") as HTMLButtonElement;
const blockedChannelsRemoveBtn: HTMLButtonElement = document.getElementById("blocked-channels-remove-btn") as HTMLButtonElement;
const caseInsensitiveRow = document.getElementById("case-insensitive-row") as HTMLDivElement;
const caseInsensitiveCheckbox = document.getElementById("case-insensitive-checkbox") as HTMLInputElement;
const nav = document.getElementById("main-nav") as HTMLElement;

const headingElement: HTMLHeadingElement = document.getElementById("heading") as HTMLHeadingElement;
const rulesSection: HTMLDivElement = document.getElementById("rules-section") as HTMLDivElement;
const appearanceSection: HTMLDivElement = document.getElementById("appearance-section") as HTMLDivElement;
const importExportSection: HTMLDivElement = document.getElementById("import-export-section") as HTMLDivElement;
const aboutSection: HTMLDivElement = document.getElementById("about-section") as HTMLDivElement;
const faqSection: HTMLDivElement = document.getElementById("faq-section") as HTMLDivElement;

const blockedChannelsNav: HTMLLIElement = document.getElementById("blocked-channels-nav") as HTMLLIElement;
const blockedTitlesNav: HTMLLIElement = document.getElementById("blocked-titles-nav") as HTMLLIElement;
const blockedNamesNav: HTMLLIElement = document.getElementById("blocked-names-nav") as HTMLLIElement;
const blockedCommentsNav: HTMLLIElement = document.getElementById("blocked-comments-nav") as HTMLLIElement;
const excludedChannelsNav: HTMLLIElement = document.getElementById("excluded-channels-nav") as HTMLLIElement;
const appearanceNav: HTMLLIElement = document.getElementById("appearance-nav") as HTMLLIElement;
const importExportNav: HTMLLIElement = document.getElementById("import-export-nav") as HTMLLIElement;
const aboutNav: HTMLLIElement = document.getElementById("about-nav") as HTMLLIElement;
const faqNav: HTMLLIElement = document.getElementById("faq-nav") as HTMLLIElement;

const STORAGE_VERSION = "1.0";

let settingsState: SettingsState = SettingsState.BLOCKED_CHANNELS;

let defaultStorage: StorageObject = {
    version: STORAGE_VERSION,
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

export function loadDataFromStorage() {
    chrome.storage.local.get(defaultStorage).then((result) => {
        const storageObject = result as StorageObject;
        console.log("Loaded stored data", storageObject);

        blockedChannelsSet = new Set<string>();
        excludedChannels = new Set<string>();

        blockedChannelsRegExp = {};
        blockedComments = {};
        blockedVideoTitles = {};

        if (storageObject.version === "0") {
            // This should not happen, because the service worker is converting the old storage / filling it with default values.
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

        updateUI();
    });
}

export function setSettingsState(pSettingsState: SettingsState) {
    settingsState = pSettingsState;
}

function updateUI() {
    nav.classList.remove("open");
    const showRulesSection =
        settingsState === SettingsState.BLOCKED_CHANNELS ||
        settingsState === SettingsState.BLOCKED_TITLES ||
        settingsState === SettingsState.BLOCKED_NAMES ||
        settingsState === SettingsState.BLOCKED_COMMENTS ||
        settingsState === SettingsState.EXCLUDED_CHANNELS;
    rulesSection.style.display = showRulesSection ? "" : "none";
    blockedChannelsNav.classList.remove("active");
    blockedTitlesNav.classList.remove("active");
    blockedNamesNav.classList.remove("active");
    blockedCommentsNav.classList.remove("active");
    excludedChannelsNav.classList.remove("active");
    if (showRulesSection) {
        updateRulesUI();
    }

    const showAppearanceSection = settingsState === SettingsState.APPEARANCE;
    appearanceSection.style.display = showAppearanceSection ? "" : "none";
    appearanceNav.classList.toggle("active", showAppearanceSection);

    const showImportExportSection = settingsState === SettingsState.IMPORT_EXPORT;
    importExportSection.style.display = showImportExportSection ? "" : "none";
    importExportNav.classList.toggle("active", showImportExportSection);

    const showAboutSection = settingsState === SettingsState.ABOUT;
    aboutSection.style.display = showAboutSection ? "" : "none";
    aboutNav.classList.toggle("active", showAboutSection);

    const showFaqSection = settingsState === SettingsState.FAQ;
    faqSection.style.display = showFaqSection ? "" : "none";
    faqNav.classList.toggle("active", showFaqSection);
}

function updateRulesUI() {
    while (blockedChannelsSelect.firstChild !== null) {
        blockedChannelsSelect.removeChild(blockedChannelsSelect.firstChild);
    }

    switch (settingsState) {
        case SettingsState.BLOCKED_CHANNELS:
            blockedChannelsNav.classList.add("active");
            caseInsensitiveRow.style.display = "none";
            headingElement.innerText = "Blocked Users/Channels";
            blockedChannelsInput.placeholder = "User/Channel Name";
            blockedChannelsSet.forEach((channelName) => {
                insertOption(channelName);
            });
            break;
        case SettingsState.BLOCKED_TITLES:
            blockedTitlesNav.classList.add("active");
            caseInsensitiveRow.style.display = "";
            headingElement.innerText = "Blocked Video Titles by Regular Expressions";
            blockedChannelsInput.placeholder = "Video Title Regular Expression";
            for (const key in blockedVideoTitles) {
                if (Object.prototype.hasOwnProperty.call(blockedVideoTitles, key)) {
                    insertOption(key, blockedVideoTitles[key] !== "");
                }
            }
            break;
        case SettingsState.BLOCKED_NAMES:
            blockedNamesNav.classList.add("active");
            caseInsensitiveRow.style.display = "";
            headingElement.innerText = "Blocked User/Channel Names by Regular Expressions";
            blockedChannelsInput.placeholder = "User/Channel Name Regular Expression";
            for (const key in blockedChannelsRegExp) {
                if (Object.prototype.hasOwnProperty.call(blockedChannelsRegExp, key)) {
                    insertOption(key, blockedChannelsRegExp[key] !== "");
                }
            }
            break;
        case SettingsState.BLOCKED_COMMENTS:
            blockedCommentsNav.classList.add("active");
            caseInsensitiveRow.style.display = "";
            headingElement.innerText = "Blocked Comments by Regular Expressions";
            blockedChannelsInput.placeholder = "Comment Regular Expression";
            for (const key in blockedComments) {
                if (Object.prototype.hasOwnProperty.call(blockedComments, key)) {
                    insertOption(key, blockedComments[key] !== "");
                }
            }
            break;
        case SettingsState.EXCLUDED_CHANNELS:
            excludedChannelsNav.classList.add("active");
            caseInsensitiveRow.style.display = "none";
            headingElement.innerText = "Excluded Users/Channels from Regular Expressions";
            blockedChannelsInput.placeholder = "User/Channel Name";
            excludedChannels.forEach((channelName) => {
                insertOption(channelName);
            });
            break;
    }

    blockedChannelsSelect.classList.toggle("larger", blockedChannelsSelect.childElementCount > 4);
    blockedChannelsSelect.classList.toggle("largest", blockedChannelsSelect.childElementCount > 8);
}

function insertOption(value: string, isCaseInsensitive: boolean = false) {
    let option = document.createElement("option");
    option.value = value;
    option.innerText = value;
    option.classList.toggle("case-insensitive", isCaseInsensitive);
    blockedChannelsSelect.insertAdjacentElement("afterbegin", option);
}

function addNewRule() {
    const rule = blockedChannelsInput.value;
    if (rule.trim().length === 0) return;

    const message: AddBlockingRuleMessage = {
        sender: CommunicationRole.SETTINGS,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.ADD_BLOCKING_RULE,
        content: {
            blockedChannel: settingsState === SettingsState.BLOCKED_CHANNELS ? rule : undefined,
            blockingVideoTitleRegExp: settingsState === SettingsState.BLOCKED_TITLES ? rule : undefined,
            blockingChannelRegExp: settingsState === SettingsState.BLOCKED_NAMES ? rule : undefined,
            blockingCommentRegExp: settingsState === SettingsState.BLOCKED_COMMENTS ? rule : undefined,
            excludedChannel: settingsState === SettingsState.EXCLUDED_CHANNELS ? rule : undefined,
            caseInsensitive: caseInsensitiveCheckbox.checked,
        },
    };
    chrome.runtime.sendMessage(message);
    blockedChannelsInput.value = "";
}
function removeRule() {
    let selectedOptions = [];
    for (let index = 0; index < blockedChannelsSelect.options.length; index++) {
        const option = blockedChannelsSelect.options[index];
        if (option.selected) selectedOptions.push(option.value);
    }
    const message: RemoveBlockingRuleMessage = {
        sender: CommunicationRole.SETTINGS,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.REMOVE_BLOCKING_RULE,
        content: {
            blockedChannel: settingsState === SettingsState.BLOCKED_CHANNELS ? selectedOptions : undefined,
            blockingVideoTitleRegExp: settingsState === SettingsState.BLOCKED_TITLES ? selectedOptions : undefined,
            blockingChannelRegExp: settingsState === SettingsState.BLOCKED_NAMES ? selectedOptions : undefined,
            blockingCommentRegExp: settingsState === SettingsState.BLOCKED_COMMENTS ? selectedOptions : undefined,
            excludedChannel: settingsState === SettingsState.EXCLUDED_CHANNELS ? selectedOptions : undefined,
        },
    };
    chrome.runtime.sendMessage(message);
}

(function initUI() {
    initFaq();
    initNavigation();
    initAppearanceUI();
    initImportExport();

    blockedChannelsAddBtn.addEventListener("click", addNewRule);
    blockedChannelsInput.addEventListener("keydown", (event) => {
        if (event.key == "Enter") addNewRule();
    });

    blockedChannelsRemoveBtn.addEventListener("click", removeRule);

    blockedChannelsNav.addEventListener("click", () => {
        settingsState = SettingsState.BLOCKED_CHANNELS;
        updateUI();
    });
    blockedTitlesNav.addEventListener("click", () => {
        settingsState = SettingsState.BLOCKED_TITLES;
        updateUI();
    });
    blockedNamesNav.addEventListener("click", () => {
        settingsState = SettingsState.BLOCKED_NAMES;
        updateUI();
    });
    blockedCommentsNav.addEventListener("click", () => {
        settingsState = SettingsState.BLOCKED_COMMENTS;
        updateUI();
    });
    excludedChannelsNav.addEventListener("click", () => {
        settingsState = SettingsState.EXCLUDED_CHANNELS;
        updateUI();
    });
    appearanceNav.addEventListener("click", () => {
        settingsState = SettingsState.APPEARANCE;
        updateUI();
    });
    importExportNav.addEventListener("click", () => {
        settingsState = SettingsState.IMPORT_EXPORT;
        updateUI();
    });
    aboutNav.addEventListener("click", () => {
        settingsState = SettingsState.ABOUT;
        updateUI();
    });
    faqNav.addEventListener("click", () => {
        settingsState = SettingsState.FAQ;
        updateUI();
    });
})();

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender) => {
    console.log(`new ${MessageType[message.type]} message for ${CommunicationRole[message.receiver]}`);

    if (message.receiver !== CommunicationRole.SETTINGS) return;

    console.log(`new ${MessageType[message.type]} message`);

    switch (message.type) {
        case MessageType.STORAGE_CHANGED:
            loadDataFromStorage();
            break;

        default:
            break;
    }
});
