import { CommunicationRole, MessageType, SettingsDesign } from "./enums.js";
import { SettingsStorageObject, SettingsChangedMessage } from "./interfaces.js";

const modeDropdown = document.getElementById("mode-dropdown") as HTMLSelectElement;
const btnColorInput = document.getElementById("block-btn-color-picker") as HTMLInputElement;
const btnSizeSlider = document.getElementById("btn-size-slider") as HTMLInputElement;
const popupCheckbox = document.getElementById("popup-checkbox") as HTMLInputElement;
const showBtnCheckbox = document.getElementById("show-btn-checkbox") as HTMLInputElement;
const animationSpeedSlider = document.getElementById("animation-speed-slider") as HTMLInputElement;
const resetBtn = document.getElementById("reset-appearance-btn") as HTMLButtonElement;

let defaultStorage: SettingsStorageObject = {
    version: 0,
    settings: {
        design: SettingsDesign.DETECT,
        advancedView: false,
        openPopup: false,
        buttonVisible: true,
        buttonColor: "#717171",
        buttonSize: 142,
        animationSpeed: 200,
    },
};
let settings = { ...defaultStorage.settings };

(function loadSettingsDataFromStorage() {
    chrome.storage.local.get(defaultStorage).then((result) => {
        const storageObject = result as SettingsStorageObject;
        console.log("Loaded stored data", storageObject);

        if (storageObject.version === 0) {
            // TODO handel old storage / first storage
        } else {
            settings = storageObject.settings;
        }
        updateUI();
    });
})();

function updateUI() {
    updateColorScheme();
    updateBtnColor();
    updateBtnSize();
    updatePopup();
    updateShowBtn();
    updateAnimationSpeed();
}

function updateColorScheme() {
    document.body.classList.toggle("detect-scheme", settings.design === SettingsDesign.DETECT);
    document.body.classList.toggle("dark-scheme", settings.design === SettingsDesign.DARK);
    modeDropdown.value = `${settings.design}`;
}

function updateBtnColor() {
    btnColorInput.value = settings.buttonColor;
}

function updateBtnSize() {
    btnSizeSlider.value = `${settings.buttonSize}`;
}

function updatePopup() {
    popupCheckbox.checked = settings.openPopup;
}

function updateShowBtn() {
    showBtnCheckbox.checked = settings.buttonVisible;
}

function updateAnimationSpeed() {
    animationSpeedSlider.value = `${settings.animationSpeed}`;
}

export function initAppearanceUI() {
    modeDropdown.addEventListener("change", () => {
        settings.design = Number(modeDropdown.value);
        chrome.storage.local.set({ settings });
        updateColorScheme();
    });

    btnColorInput.addEventListener("change", () => {
        settings.buttonColor = btnColorInput.value;
        chrome.storage.local.set({ settings });
        updateBtnColor();
        sendSettingChangedMessage();
    });

    btnSizeSlider.addEventListener("change", () => {
        settings.buttonSize = Number(btnSizeSlider.value);
        chrome.storage.local.set({ settings });
        updateBtnSize();
        sendSettingChangedMessage();
    });

    popupCheckbox.addEventListener("change", () => {
        settings.openPopup = popupCheckbox.checked;
        chrome.storage.local.set({ settings });
        updatePopup();
    });

    showBtnCheckbox.addEventListener("change", () => {
        settings.buttonVisible = showBtnCheckbox.checked;
        chrome.storage.local.set({ settings });
        updateShowBtn();
        sendSettingChangedMessage();
    });

    animationSpeedSlider.addEventListener("change", () => {
        settings.animationSpeed = Number(animationSpeedSlider.value);
        chrome.storage.local.set({ settings });
        updateAnimationSpeed();
        sendSettingChangedMessage();
    });

    resetBtn.addEventListener("click", () => {
        settings = { ...defaultStorage.settings };
        chrome.storage.local.set({ settings });
        updateUI();
        sendSettingChangedMessage();
    });
}

function sendSettingChangedMessage() {
    const message: SettingsChangedMessage = {
        sender: CommunicationRole.SETTINGS,
        receiver: CommunicationRole.SERVICE_WORKER,
        type: MessageType.SETTINGS_CHANGED,
        content: {
            buttonVisible: settings.buttonVisible,
            buttonColor: settings.buttonColor,
            buttonSize: settings.buttonSize,
            animationSpeed: settings.animationSpeed,
        },
    };
    chrome.runtime.sendMessage(message);
    console.log("send SettingsChangedMessage", message);
}
