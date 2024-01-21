console.log("START");

chrome.runtime.onMessage.addListener(async (message: Message, sender: chrome.runtime.MessageSender) => {
    if (message.receiver !== CommunicationRole.SERVICE_WORKER) return;

    console.log(`new ${MessageType[message.type]}`);

    switch (message.type) {
        case MessageType.ADD_BLOCKED_USER:
            handleAddBlockedUserMessage(message);
            break;

        default:
            break;
    }
    {
        chrome.storage.local.set({ name });
    }
});

function handleAddBlockedUserMessage(message: AddBlockedUserMessage) {}
