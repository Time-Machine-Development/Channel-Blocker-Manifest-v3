console.log("Settings scripts");

{
    const blockedChannelsSelect: HTMLSelectElement = document.getElementById("blocked-channels") as HTMLSelectElement;
    const blockedChannelsInput: HTMLInputElement = document.getElementById("blocked-channels-input") as HTMLInputElement;
    const blockedChannelsAddBtn: HTMLButtonElement = document.getElementById("blocked-channels-add-btn") as HTMLButtonElement;
    const blockedChannelsRemoveBtn: HTMLButtonElement = document.getElementById("blocked-channels-remove-btn") as HTMLButtonElement;

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

            blockedChannelsSet = new Set<string>();
            excludedChannels = new Set<string>();

            blockedChannelsRegExp = {};
            blockedComments = {};
            blockedVideoTitles = {};

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

            populateUI();
        });
    }

    function populateUI() {
        console.log("populateUI");

        while (blockedChannelsSelect.firstChild !== null) {
            blockedChannelsSelect.removeChild(blockedChannelsSelect.firstChild);
        }

        blockedChannelsSet.forEach((blockedChannel: string) => {
            let option = document.createElement("option");
            option.value = blockedChannel;
            option.innerText = blockedChannel;
            blockedChannelsSelect.append(option);
        });
    }

    (function initUI() {
        blockedChannelsAddBtn.addEventListener("click", () => {
            const message: AddBlockingRuleMessage = {
                sender: CommunicationRole.SETTINGS,
                receiver: CommunicationRole.SERVICE_WORKER,
                type: MessageType.ADD_BLOCKING_RULE,
                content: {
                    blockedChannel: blockedChannelsInput.value,
                },
            };
            chrome.runtime.sendMessage(message);
            blockedChannelsInput.value = "";
        });
        blockedChannelsRemoveBtn.addEventListener("click", () => {
            const message: RemoveBlockingRuleMessage = {
                sender: CommunicationRole.SETTINGS,
                receiver: CommunicationRole.SERVICE_WORKER,
                type: MessageType.REMOVE_BLOCKING_RULE,
                content: {
                    blockedChannel: blockedChannelsSelect.value,
                },
            };
            chrome.runtime.sendMessage(message);
        });
    })();

    chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender) => {
        console.log(`new ${MessageType[message.type]} message`);

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
}
