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
            break;
        case YTContext.SEARCH:
            //SearchPage(https://www.youtube.com/results?search_query=<INPUT>)
            break;
        case YTContext.TRENDING:
            //TrendingPage(https://www.youtube.com/feed/trending)
            break;

        default:
            break;
    }
}

function createHomeObserver(): Observer[] {
    return [
        new Observer("div#contents[class='style-scope ytd-rich-grid-renderer']", {
            anchorSelector: "ytd-rich-item-renderer[class='style-scope ytd-rich-grid-row']",
            userChannelName:
                "a[class='yt-simple-endpoint style-scope yt-formatted-string'], yt-formatted-string#text[class='style-scope ytd-channel-name']", // "yt-formatted-string#text[class='style-scope ytd-channel-name complex-string']"
            videoTitle:
                "yt-formatted-string#video-title[class='style-scope ytd-rich-grid-media'], yt-formatted-string#video-title[class='style-scope ytd-ad-inline-playback-meta-block']",
        }),
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
