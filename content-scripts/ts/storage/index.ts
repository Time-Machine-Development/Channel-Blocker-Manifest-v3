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

(async function getSettings() {
    const message: RequestSettingsMessage = {
        sender: CommunicationRole.CONTENT_SCRIPT,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.REQUEST_SETTINGS,
        content: undefined,
    };
    const sending = (await sendMessage(message)) as {
        buttonVisible: boolean;
        buttonColor: string;
        buttonSize: number;
        animationSpeed: number;
    };

    buttonVisible = sending.buttonVisible;
    buttonColor = sending.buttonColor;
    buttonSize = sending.buttonSize;
    animationSpeed = sending.animationSpeed;

    updateBlockBtnCSS();
})();

async function sendMessage(message: Message) {
    return chrome.runtime.sendMessage(message);
}
