import { CommunicationRole, MessageType } from "../enums.js";

export interface Message {
    sender: CommunicationRole;
    receiver: CommunicationRole;
    type: MessageType;
    content: any;
}

export interface AddBlockingRuleMessage extends Message {
    content: {
        blockedChannel?: string;
        excludedChannel?: string;
        blockingChannelRegExp?: string;
        blockingCommentRegExp?: string;
        blockingVideoTitleRegExp?: string;
        caseInsensitive?: boolean;
    };
}

export interface RemoveBlockingRuleMessage extends Message {
    content: {
        blockedChannel?: string[];
        excludedChannel?: string[];
        blockingChannelRegExp?: string[];
        blockingCommentRegExp?: string[];
        blockingVideoTitleRegExp?: string[];
    };
}

export interface IsBlockedMessage extends Message {
    content: {
        videoTitle?: string;
        userChannelName?: string;
        commentContent?: string;
    };
}

export interface StorageChangedMessage extends Message {
    content: undefined;
}

export interface RequestSettingsMessage extends Message {
    content: undefined;
}

export interface SettingsChangedMessage extends Message {
    content: {
        buttonVisible: boolean;
        buttonColor: string;
        buttonSize: number;
        animationSpeed: number;
    };
}
