interface Message {
    sender: CommunicationRole;
    receiver: CommunicationRole;
    type: MessageType;
    content: any;
}

interface AddBlockedUserMessage extends Message {
    content: {
        userChannelName: string;
    };
}

interface IsBlockedMessage extends Message {
    content: {
        videoTitle?: string;
        userChannelName?: string;
        commentContent?: string;
    };
}

interface StorageChangedMessage extends Message {
    content: undefined;
}
