import { SettingsDesign, SettingsState } from "./enums.js";
import { loadDataFromStorage, setSettingsState } from "./index.js";
import { CombinedStorageObject, OldStorageObject } from "./interfaces/storage.js";
import { loadSettingsDataFromStorage } from "./settings.js";

const STORAGE_VERSION = "1.0";

/**
 * Initialize the import and export settings section.
 */
export function initImportExport() {
    const importBtn = document.getElementById("import-btn") as HTMLButtonElement;
    const exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
    const fileLoaderInput = document.getElementById("file-loader-input") as HTMLInputElement;

    fileLoaderInput.addEventListener("change", (event) => {
        let file = fileLoaderInput?.files?.item(0);
        if (file) {
            const fileReader = new FileReader();
            fileReader.addEventListener(
                "load",
                () => {
                    try {
                        const fileContent = fileReader.result;
                        if (typeof fileContent === "string") {
                            const fileContentJson = JSON.parse(fileContent);
                            if (fileContentJson.version === undefined) {
                                loadOldFormat(fileContentJson);
                            } else {
                                loadNewFormat(fileContentJson);
                            }
                        } else {
                            throw new Error("Could not read file.");
                        }
                    } catch (error) {
                        console.error(`Error: ${error}`);

                        alert(`Error: ${error}`);
                    }
                },
                false
            );
            fileReader.readAsText(file, "UTF-8");
        }
    });

    importBtn.addEventListener(
        "click",
        () => {
            // Check if the file-APIs are supported.
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                // The file-APIs are not supported.
                alert("The file-APIs are not supported. You are not able to import.");
                return;
            }
            fileLoaderInput.click();
        },
        false
    );

    exportBtn.addEventListener("click", () => {
        const defaultCombinedStorageObject: CombinedStorageObject = {
            version: STORAGE_VERSION,
            settings: {
                design: SettingsDesign.DETECT,
                advancedView: false,
                openPopup: false,
                buttonVisible: true,
                buttonColor: "#717171",
                buttonSize: 142,
                animationSpeed: 200,
            },
            blockedChannels: [],
            excludedChannels: [],
            blockedVideoTitles: {},
            blockedChannelsRegExp: {},
            blockedComments: {},
        };

        chrome.storage.local.get(defaultCombinedStorageObject).then((result) => {
            const combinedStorageObject = result as CombinedStorageObject;
            const currentDate = new Date();
            download(
                JSON.stringify(combinedStorageObject),
                `ChannelBlocker ${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}.save`,
                ".save"
            );
        });
    });
}

/**
 * Load the date from the old format and add them to currently saved data.
 * @param oldStorageObject The loaded JSON data.
 */
function loadOldFormat(oldStorageObject: OldStorageObject) {
    const defaultCombinedStorageObject: CombinedStorageObject = {
        version: STORAGE_VERSION,
        settings: {
            design: SettingsDesign.DETECT,
            advancedView: false,
            openPopup: false,
            buttonVisible: true,
            buttonColor: "#717171",
            buttonSize: 142,
            animationSpeed: 200,
        },
        blockedChannels: [],
        excludedChannels: [],
        blockedVideoTitles: {},
        blockedChannelsRegExp: {},
        blockedComments: {},
    };

    chrome.storage.local.get(defaultCombinedStorageObject).then((result) => {
        const combinedStorageObject = result as CombinedStorageObject;

        // Load blocking rules
        if (oldStorageObject[0] !== undefined) {
            combinedStorageObject.blockedChannels.push(...Object.keys(oldStorageObject[0]));
        }
        if (oldStorageObject[1] !== undefined) {
            for (const key in oldStorageObject[1]) {
                if (Object.prototype.hasOwnProperty.call(oldStorageObject[1], key)) {
                    combinedStorageObject.blockedVideoTitles[key] = oldStorageObject[1][key] === 0 ? "i" : "";
                }
            }
        }
        if (oldStorageObject[2] !== undefined) {
            for (const key in oldStorageObject[2]) {
                if (Object.prototype.hasOwnProperty.call(oldStorageObject[2], key)) {
                    combinedStorageObject.blockedChannelsRegExp[key] = oldStorageObject[2][key] === 0 ? "i" : "";
                }
            }
        }
        if (oldStorageObject[3] !== undefined) {
            for (const key in oldStorageObject[3]) {
                if (Object.prototype.hasOwnProperty.call(oldStorageObject[3], key)) {
                    combinedStorageObject.blockedComments[key] = oldStorageObject[3][key] === 0 ? "i" : "";
                }
            }
        }
        if (oldStorageObject[4] !== undefined) {
            combinedStorageObject.excludedChannels.push(...Object.keys(oldStorageObject[4]));
        }

        // Load settings
        if (oldStorageObject?.settings_ui?.[0] !== undefined) {
            combinedStorageObject.settings.design = oldStorageObject.settings_ui[0] + 1;
        }
        if (oldStorageObject?.settings_ui?.[1] !== undefined) {
            combinedStorageObject.settings.advancedView = oldStorageObject.settings_ui[1];
        }
        if (oldStorageObject?.settings_ui?.[2] !== undefined) {
            combinedStorageObject.settings.openPopup = oldStorageObject.settings_ui[2];
        }
        if (oldStorageObject?.content_ui?.[0] !== undefined) {
            combinedStorageObject.settings.buttonVisible = oldStorageObject.content_ui[0];
        }
        if (oldStorageObject?.content_ui?.[1] !== undefined) {
            combinedStorageObject.settings.buttonColor = oldStorageObject.content_ui[1];
        }
        if (oldStorageObject?.content_ui?.[2] !== undefined) {
            combinedStorageObject.settings.buttonSize = oldStorageObject.content_ui[2];
        }
        if (oldStorageObject?.content_ui?.[3] !== undefined) {
            combinedStorageObject.settings.animationSpeed = oldStorageObject.content_ui[3];
        }

        // Save data
        chrome.storage.local.set(combinedStorageObject);
        setSettingsState(SettingsState.BLOCKED_CHANNELS);
        loadDataFromStorage();
        loadSettingsDataFromStorage();
    });
}

/**
 * Load the date from the new format and add them to currently saved data.
 * @param oldStorageObject The loaded JSON data.
 */
function loadNewFormat(loadedStorageObject: CombinedStorageObject) {
    const defaultCombinedStorageObject: CombinedStorageObject = {
        version: STORAGE_VERSION,
        settings: {
            design: SettingsDesign.DETECT,
            advancedView: false,
            openPopup: false,
            buttonVisible: true,
            buttonColor: "#717171",
            buttonSize: 142,
            animationSpeed: 200,
        },
        blockedChannels: [],
        excludedChannels: [],
        blockedVideoTitles: {},
        blockedChannelsRegExp: {},
        blockedComments: {},
    };

    chrome.storage.local.get(defaultCombinedStorageObject).then((result) => {
        const storageObject = result as CombinedStorageObject;

        storageObject.blockedChannels.push(
            ...loadedStorageObject.blockedChannels.filter((channel) => {
                storageObject.blockedChannels.includes(channel);
            })
        );
        storageObject.blockedVideoTitles = { ...storageObject.blockedVideoTitles, ...loadedStorageObject.blockedVideoTitles };
        storageObject.blockedChannelsRegExp = { ...storageObject.blockedChannelsRegExp, ...loadedStorageObject.blockedChannelsRegExp };
        storageObject.blockedComments = { ...storageObject.blockedComments, ...loadedStorageObject.blockedComments };
        storageObject.excludedChannels.push(
            ...loadedStorageObject.excludedChannels.filter((channel) => {
                storageObject.excludedChannels.includes(channel);
            })
        );
        storageObject.settings = { ...storageObject.settings, ...loadedStorageObject.settings };

        // Save data
        chrome.storage.local.set(storageObject);
        setSettingsState(SettingsState.BLOCKED_CHANNELS);
        loadDataFromStorage();
        loadSettingsDataFromStorage();
    });
}

/**
 * Creates a file with the given data and downloads it.
 * @param data The content of the file.
 * @param filename The name of the file.
 * @param type The type of the file.
 */
function download(data: BlobPart, filename: string, type: string) {
    const file = new Blob([data], { type: type });
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
