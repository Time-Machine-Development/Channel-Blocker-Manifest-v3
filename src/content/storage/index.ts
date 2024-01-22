async function isBlocked(content: { videoTitle?: string; userChannelName?: string; commentContent?: string }): Promise<boolean> {
    const message: IsBlockedMessage = {
        sender: CommunicationRole.CONTENT_SCRIPT,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.IS_BLOCKED,
        content,
    };
    const sending = await sendMessage(message);
    console.log(`sending ${sending}`);

    return sending === true;
}

async function blockUserChannel(userChannelName: string) {
    const message: AddBlockedUserMessage = {
        sender: CommunicationRole.CONTENT_SCRIPT,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.ADD_BLOCKED_USER,
        content: {
            userChannelName,
        },
    };
    const sending = await sendMessage(message);
}

async function sendMessage(message: Message) {
    console.log(`send ${MessageType[message.type]} message`);

    return chrome.runtime.sendMessage(message);
}
