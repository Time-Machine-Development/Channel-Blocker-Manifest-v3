let activeObserver: Observer[] = [];
let curYTContext: YTContext = YTContext.OTHER;

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

function createVideoObserver() {
    return [
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
            },
        ]),
        new Observer(
            "div#primary ytd-comments#comments div#contents[class=' style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer']",
            [
                {
                    anchorSelector: "ytd-comment-thread-renderer",
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
                    removeAtSign: [true, true],
                    embeddedObserver: "div#contents",
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
                    removeAtSign: [true, true],
                },
            ]
        ),
    ];
    return [
        new Observer("div#primary div#contents[class=' style-scope ytd-item-section-renderer style-scope ytd-item-section-renderer']", [
            {
                anchorSelector: "ytd-comment-thread-renderer",
                userChannelName: ["yt-formatted-string[class=' style-scope ytd-comment-renderer style-scope ytd-comment-renderer']"],
                commentContent: ["yt-formatted-string#content-text"],
                insertBlockBtn: [
                    (element: HTMLElement, userChannelName: HTMLElement, button: HTMLButtonElement) => {
                        element.querySelector("div#header-author")?.insertAdjacentElement("afterbegin", button);
                    },
                ],
                removeAtSign: [true],
                embeddedObserver: "div#contents",
            },
        ]),
    ];
}

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

function createHomeObserver(): Observer[] {
    return [
        new Observer(
            "div#contents[class='style-scope ytd-rich-grid-renderer']",
            [],
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
            ]
        ),
    ];
}

function createSearchObserver(): Observer[] {
    return [
        new Observer(
            "div#contents[class='style-scope ytd-section-list-renderer']",
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

function updateObserver() {
    console.log("updateObserver");

    for (let index = 0; index < activeObserver.length; index++) {
        activeObserver[index].update();
    }
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender) => {
    console.log(`new ${MessageType[message.type]} message for ${CommunicationRole[message.receiver]}`);

    if (message.receiver !== CommunicationRole.CONTENT_SCRIPT) return;

    console.log(`new ${MessageType[message.type]} message`);

    switch (message.type) {
        case MessageType.STORAGE_CHANGED:
            console.log(`updateObserver 1`);
            updateObserver();
            break;

        default:
            console.log("Häääää");

            break;
    }
});
