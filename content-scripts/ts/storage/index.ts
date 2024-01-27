async function isBlocked(content: { videoTitle?: string; userChannelName?: string; commentContent?: string }): Promise<boolean> {
    const message: IsBlockedMessage = {
        sender: CommunicationRole.CONTENT_SCRIPT,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.IS_BLOCKED,
        content,
    };
    const sending = await sendMessage(message);
    return sending === true;
}

async function blockUserChannel(userChannelName: string) {
    const message: AddBlockingRuleMessage = {
        sender: CommunicationRole.CONTENT_SCRIPT,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.ADD_BLOCKING_RULE,
        content: {
            blockedChannel: userChannelName,
        },
    };
    const sending = await sendMessage(message);
}

async function sendMessage(message: Message) {
    return chrome.runtime.sendMessage(message);
}
