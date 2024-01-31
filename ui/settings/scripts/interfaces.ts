import { CommunicationRole, MessageType, SettingsDesign } from "./enums.js";

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

export interface KeyValueMap {
    [key: string]: string;
}

export interface StorageObject {
    version: number;

    blockedChannels: string[];
    excludedChannels: string[];

    blockedVideoTitles: KeyValueMap;
    blockedChannelsRegExp: KeyValueMap;
    blockedComments: KeyValueMap;
}

export interface SettingsStorageObject {
    version: number;

    settings: {
        design: SettingsDesign;
        advancedView: boolean;
        openPopup: boolean;
        buttonVisible: boolean;
        buttonColor: string;
        buttonSize: number;
        animationSpeed: number;
    };
}

export interface CombinedStorageObject extends SettingsStorageObject, StorageObject {}
