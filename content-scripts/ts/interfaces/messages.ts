interface Message {
    sender: CommunicationRole;
    receiver: CommunicationRole;
    type: MessageType;
    content: any;
}

interface AddBlockingRuleMessage extends Message {
    content: {
        blockedChannel?: string;
        excludedChannel?: string;
        blockingChannelRegExp?: string;
        blockingCommentRegExp?: string;
        blockingVideoTitleRegExp?: string;
        caseInsensitive?: boolean;
    };
}

interface RemoveBlockingRuleMessage extends Message {
    content: {
        blockedChannel?: string[];
        excludedChannel?: string[];
        blockingChannelRegExp?: string[];
        blockingCommentRegExp?: string[];
        blockingVideoTitleRegExp?: string[];
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
