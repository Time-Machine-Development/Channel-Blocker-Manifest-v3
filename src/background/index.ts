console.log("START");

let storageObject: { [key: string]: number } = {};

//chrome.storage.local.set({ version: 1.0 });
//chrome.storage.local.set({ settings: { open_popup: false } });

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

            console.log("Loaded stored data", blockedChannelsSet);
        }
    });
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.receiver !== CommunicationRole.SERVICE_WORKER) return;

    console.log(`new ${MessageType[message.type]} message`);

    switch (message.type) {
        case MessageType.ADD_BLOCKED_USER:
            handleAddBlockedUserMessage(message);
            break;
        case MessageType.IS_BLOCKED:
            sendResponse(handleIsBlockedMessage(message));
            break;

        default:
            break;
    }
});

function handleAddBlockedUserMessage(message: AddBlockedUserMessage) {
    if (blockedChannelsSet.size === 0) {
        loadDataFromStorage();
    }
    blockedChannelsSet.add(message.content.userChannelName);
    chrome.storage.local.set({ blockedChannels: Array.from(blockedChannelsSet) });
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
        }
    });
}
