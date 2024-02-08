import { SettingsDesign } from "../enums.js";

export interface OldStorageObject {
    "0"?: { [key: string]: number }; // blocked channels
    "1"?: { [key: string]: number }; // video title RegExp
    "2"?: { [key: string]: number }; // channel name RegExp
    "3"?: { [key: string]: number }; // comment RegExp
    "4"?: { [key: string]: number }; // excluded channels
    content_ui: {
        "0": boolean; // button_visible
        "1": string; // button_color
        "2": number; //	button_size
        "3": number; //	animation_speed
    };
    settings_ui: {
        "0": number; // design
        "1": boolean; // advanced_view
        "2": boolean; // open_popup
    };
}

export interface KeyValueMap {
    [key: string]: string;
}

export interface StorageObject {
    version: string;

    blockedChannels: string[];
    excludedChannels: string[];

    blockedVideoTitles: KeyValueMap;
    blockedChannelsRegExp: KeyValueMap;
    blockedComments: KeyValueMap;
}

export interface SettingsStorageObject {
    version: string;

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
