let activeObserver: Observer[] = [];
let curYTContext: YTContext = YTContext.OTHER;

/**
 * Handles changes in the YouTube context and updates the active observer accordingly.
 *
 * @param {YTContext} context - The new YouTube context to handle. This can be one of the following:
 *   - YTContext.HOME: The homepage (https://www.youtube.com/)
 *   - YTContext.VIDEO: A video page (https://www.youtube.com/watch?v=<ID>)
 *   - YTContext.SEARCH: A search results page (https://www.youtube.com/results?search_query=<INPUT>)
 *   - YTContext.TRENDING: The trending page (https://www.youtube.com/feed/trending)
 *
 * @returns {void}
 */
function handleContextChange(context: YTContext) {
    if (curYTContext === context) return;
    curYTContext = context;

    while (activeObserver.length > 0) {
        activeObserver.pop()?.disconnect();
    }

    switch (context) {
        case YTContext.HOME:
            //HomePage(https://www.youtube.com/)
            activeObserver = createHomeObserver();
            break;
        case YTContext.VIDEO:
            //VideoPage(https://www.youtube.com/watch?v=<ID>)
            activeObserver = createVideoObserver();
            break;
        case YTContext.SEARCH:
            //SearchPage(https://www.youtube.com/results?search_query=<INPUT>)
            activeObserver = createSearchObserver();
            break;
        case YTContext.TRENDING:
            //TrendingPage(https://www.youtube.com/feed/trending)
            activeObserver = createTrendingObserver();
            break;

        default:
            break;
    }
}

// The following functions create the observer for the YouTube pages
// If something is broken, because of an update changing the structure of a page,
// you most likely have to change the structure description here.

/**
 * Creates observer for the video page (i.e.: YTContext.VIDEO: https://www.youtube.com/watch?v=<ID>) and returns them.
 *
 * @returns an array of observer for the video page.
 */
function createVideoObserver() {
    return [
        new VideoCreatorObserver(),
        new Observer("div[class='ytp-endscreen-content']", [
            {
                anchorSelector: "a",
                userChannelName: ["span[class='ytp-videowall-still-info-author']"],
                videoTitle: ["span[class='ytp-videowall-still-info-title']"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        // No block button is inserted
                    },
                ],
                transformChannelName: [
                    (userChannelName) => {
                        return userChannelName.split(" • ")[0];
                    },
                ],
            },
        ]),
        new Observer("div#items[class='style-scope ytd-watch-next-secondary-results-renderer']", [
            {
                anchorSelector: "ytd-compact-video-renderer",
                userChannelName: ["yt-formatted-string#text[class='style-scope ytd-channel-name']"],
                videoTitle: ["span#video-title[class=' style-scope ytd-compact-video-renderer style-scope ytd-compact-video-renderer']"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("ytd-channel-name")?.insertAdjacentElement("beforebegin", button);
                    },
                ],
                embeddedObserver: "ytd-item-section-renderer",
            },
            {
                anchorSelector: "ytd-item-section-renderer",
                embeddedObserver: "div#contents",
            },
        ]),
        // New design (Video suggestions under main video)
        new Observer(
            "#bottom-grid #contents.ytd-rich-grid-renderer",
            [],
            [
                {
                    anchorSelector: "#contents",
                    targetSelector: "ytd-rich-grid-row",
                    observerOptions: [
                        {
                            userChannelName: ["#channel-name a"],
                            videoTitle: ["#video-title"],
                            insertBlockBtn: [
                                (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                                    element.querySelector("ytd-channel-name")?.insertAdjacentElement("beforebegin", button);
                                },
                            ],
                            anchorSelector: "ytd-rich-item-renderer",
                        },
                    ],
                },
            ]
        ),
        // Comments for the old and new design (Comments on the right of the main video)
        new Observer("#comments #contents.ytd-item-section-renderer", [
            {
                anchorSelector: "ytd-comment-thread-renderer",
                userChannelName: ["#author-text", "#text-container"],
                commentContent: ["#content-text"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("div#header-author")?.insertAdjacentElement("afterbegin", button);
                    },
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("span#author-comment-badge")?.insertAdjacentElement("beforebegin", button);
                    },
                ],
                transformChannelName: [
                    (userChannelName) => {
                        return userChannelName.trim().substring(1);
                    },
                    (userChannelName) => {
                        return userChannelName.trim().substring(1);
                    },
                ],
                embeddedObserver: "div#contents",
            },
            {
                anchorSelector: "ytd-comment-view-model",
                userChannelName: ["#author-text", "#text-container"],
                commentContent: ["#content-text"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("div#header-author")?.insertAdjacentElement("afterbegin", button);
                    },
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("span#author-comment-badge")?.insertAdjacentElement("beforebegin", button);
                    },
                ],
                transformChannelName: [
                    (userChannelName) => {
                        return userChannelName.trim().substring(1);
                    },
                    (userChannelName) => {
                        return userChannelName.trim().substring(1);
                    },
                ],
            },
            {
                anchorSelector: "ytd-comment-renderer",
                userChannelName: [
                    "yt-formatted-string[class=' style-scope ytd-comment-renderer style-scope ytd-comment-renderer']",
                    "yt-formatted-string#text[class='style-scope ytd-channel-name']",
                ],
                commentContent: ["yt-formatted-string#content-text"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("div#header-author")?.insertAdjacentElement("afterbegin", button);
                    },
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("span#author-comment-badge")?.insertAdjacentElement("beforebegin", button);
                    },
                ],
                transformChannelName: [
                    (userChannelName) => {
                        return userChannelName.substring(1);
                    },
                    (userChannelName) => {
                        return userChannelName.substring(1);
                    },
                ],
            },
        ]),
    ];
}

/**
 * Creates observer for the trending page (i.e.: YTContext.TRENDING: https://www.youtube.com/feed/trending) and returns them.
 *
 * @returns an array of observer for the trending page.
 */
function createTrendingObserver() {
    return [
        new Observer(
            "ytd-page-manager#page-manager",
            [],
            [
                {
                    targetSelector: "ytd-browse",
                    anchorSelector: "div#contents[class='style-scope ytd-section-list-renderer']",
                    subObserver: [
                        {
                            targetSelector: "ytd-item-section-renderer",
                            anchorSelector: "div#grid-container",
                            observerOptions: [
                                {
                                    anchorSelector: "ytd-video-renderer",
                                    userChannelName: ["a[class='yt-simple-endpoint style-scope yt-formatted-string']"],
                                    videoTitle: ["yt-formatted-string[class='style-scope ytd-video-renderer']"],
                                },
                            ],
                        },
                    ],
                },
            ]
        ),
    ];
}

/**
 * Creates observer for the home page (i.e.: YTContext.HOME: https://www.youtube.com/) and returns them.
 *
 * @returns an array of observer for the home page.
 */
function createHomeObserver(): Observer[] {
    return [
        new Observer(
            "ytd-browse #contents.ytd-rich-grid-renderer",
            [
                {
                    anchorSelector: "ytd-rich-item-renderer",
                    userChannelName: ["yt-formatted-string#text"],
                    videoTitle: ["yt-formatted-string#video-title"],
                },
            ],
            [
                {
                    targetSelector: "ytd-rich-grid-row[class='style-scope ytd-rich-grid-renderer']",
                    anchorSelector: "div#contents[class='style-scope ytd-rich-grid-row']",
                    observerOptions: [
                        {
                            anchorSelector: "ytd-rich-item-renderer[class='style-scope ytd-rich-grid-row']",
                            userChannelName: [
                                "a[class='yt-simple-endpoint style-scope yt-formatted-string']",
                                "yt-formatted-string#text[class='style-scope ytd-channel-name']",
                            ],
                            videoTitle: [
                                "yt-formatted-string#video-title[class='style-scope ytd-rich-grid-media']",
                                "yt-formatted-string#video-title[class='style-scope ytd-ad-inline-playback-meta-block']",
                            ],
                        },
                    ],
                },
                {
                    targetSelector: "ytd-rich-section-renderer",
                    anchorSelector: "div#contents",
                    observerOptions: [
                        {
                            anchorSelector: "ytd-rich-item-renderer",
                            userChannelName: ["a[class='yt-simple-endpoint style-scope yt-formatted-string']"],
                            videoTitle: ["yt-formatted-string#video-title[class='style-scope ytd-rich-grid-media']"],
                        },
                    ],
                },
            ]
        ),
    ];
}

/**
 * Creates observer for the search page (i.e.: YTContext.SEARCH: https://www.youtube.com/results?search_query=<INPUT>) and returns them.
 *
 * @returns an array of observer for the search page.
 */
function createSearchObserver(): Observer[] {
    return [
        new Observer(
            "ytd-search div#contents[class='style-scope ytd-section-list-renderer']",
            [],
            [
                {
                    targetSelector: "ytd-item-section-renderer", //"ytd-shelf-renderer[class='style-scope ytd-item-section-renderer']",
                    anchorSelector: "div#contents[class=' style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer']",
                    observerOptions: [
                        {
                            anchorSelector: "ytd-video-renderer[class='style-scope ytd-item-section-renderer']",
                            userChannelName: ["yt-formatted-string#text[class='style-scope ytd-channel-name']"],
                            videoTitle: ["yt-formatted-string[class='style-scope ytd-video-renderer']"],
                        },
                        {
                            anchorSelector: "ytd-video-renderer[class='style-scope ytd-vertical-list-renderer']",
                            userChannelName: ["yt-formatted-string#text[class='style-scope ytd-channel-name']"],
                            videoTitle: ["yt-formatted-string[class='style-scope ytd-video-renderer']"],
                        },
                        {
                            anchorSelector: "ytd-search-pyv-renderer[class='style-scope ytd-item-section-renderer']",
                            userChannelName: ["a[class='yt-simple-endpoint style-scope yt-formatted-string']"],
                            videoTitle: ["h3#video-title[class='style-scope ytd-promoted-video-renderer']"],
                        },
                        {
                            anchorSelector: "ytd-ad-slot-renderer[class='style-scope ytd-item-section-renderer']",
                            userChannelName: [
                                "div#website-text[class='style-scope ytd-promoted-sparkles-web-renderer yt-simple-endpoint']",
                            ],
                            videoTitle: ["h3#title[class='style-scope ytd-promoted-sparkles-web-renderer yt-simple-endpoint']"],
                        },
                        {
                            anchorSelector: "ytd-playlist-renderer[class='style-scope ytd-item-section-renderer']",
                            userChannelName: ["a[class='yt-simple-endpoint style-scope yt-formatted-string']"],
                            videoTitle: ["span#video-title[class='style-scope ytd-playlist-renderer']"],
                        },
                        {
                            anchorSelector: "ytd-channel-renderer[class='style-scope ytd-item-section-renderer']",
                            userChannelName: ["yt-formatted-string#text[class='style-scope ytd-channel-name']"],
                        },
                        {
                            anchorSelector: "ytd-grid-video-renderer",
                            userChannelName: ["a[class='yt-simple-endpoint style-scope yt-formatted-string']"],
                            videoTitle: ["a#video-title"],
                        },
                    ],
                    subObserver: [
                        {
                            targetSelector: "ytd-shelf-renderer[class='style-scope ytd-item-section-renderer']",
                            anchorSelector: "div#items",
                        },
                        /*
                        {
                            targetSelector: "ytd-shelf-renderer[class='style-scope ytd-item-section-renderer']",
                            anchorSelector: "div#items[class='style-scope yt-horizontal-list-renderer']",
                        },
                        */
                    ],
                },
            ]
        ),
    ];
}

/**
 * Updates all active observers by calling their `update` method.
 */
function updateObserver() {
    for (let index = 0; index < activeObserver.length; index++) {
        activeObserver[index].update();
    }
}

let buttonVisible: boolean = true;
let buttonColor: string = "#717171";
let buttonSize: number = 142;
let animationSpeed: number = 200;

/**
 * Updates the settings for the button appearance and behavior based on the provided message.
 *
 * @param {SettingsChangedMessage} message - The message containing the new settings.
 */
function updateSettings(message: SettingsChangedMessage) {
    buttonVisible = message.content.buttonVisible;
    buttonColor = message.content.buttonColor;
    buttonSize = message.content.buttonSize;
    animationSpeed = message.content.animationSpeed;

    updateBlockBtnCSS();
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender) => {
    if (message.receiver !== CommunicationRole.CONTENT_SCRIPT) return;

    switch (message.type) {
        case MessageType.STORAGE_CHANGED:
            updateObserver();
            break;

        case MessageType.SETTINGS_CHANGED:
            updateSettings(message);
            break;

        default:
            break;
    }
});
