interface OldStorageObject {
    "0"?: { [key: string]: number };
    "1"?: { [key: string]: number };
    "2"?: { [key: string]: number };
    "3"?: { [key: string]: number };
    "4"?: { [key: string]: number };
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

interface StorageObject {
    version: number;

    blockedChannels: string[];
    excludedChannels: string[];

    blockedVideoTitles: KeyValueMap;
    blockedChannelsRegExp: KeyValueMap;
    blockedComments: KeyValueMap;
}

interface SettingsStorageObject {
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
