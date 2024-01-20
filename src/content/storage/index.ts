let StorageObject: { [key: string]: number } = {};

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

// Load the stored data
chrome.storage.local.get(defaultStorage).then((result) => {
    const storageObject = result as StorageObject;

    if (storageObject.version === 0) {
        // TODO handel old storage / first storage
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

function isUserChannelBlocked(userChannelName: string): boolean {
    return blockedChannelsSet.has(userChannelName);
}

function isVideoTitleBlocked(title: string): boolean {
    return false;
}

function isCommentContentBlocked(title: string): boolean {
    return false;
}

function blockUserChannel(userChannelName: string) {
    blockedChannelsSet.add(userChannelName);
    updateObserver();
}
