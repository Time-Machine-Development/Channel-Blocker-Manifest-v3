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
