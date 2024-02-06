export enum MessageType {
    ADD_BLOCKING_RULE,
    REMOVE_BLOCKING_RULE,
    IS_BLOCKED,
    STORAGE_CHANGED,
    REQUEST_SETTINGS,
    SETTINGS_CHANGED,
}

export enum CommunicationRole {
    SERVICE_WORKER,
    CONTENT_SCRIPT,
    SETTINGS,
}

export enum SettingsDesign {
    DETECT,
    DARK,
    LICHT,
}
