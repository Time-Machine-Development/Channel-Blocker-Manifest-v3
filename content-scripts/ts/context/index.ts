/**
 * Adds a MutationObserver to monitor changes in the <title> node of the current HTML document.
 * The provided callback function is called whenever there is a change in the <title> node.
 *
 * YouTube modifies this element when the context changes.
 */
async function addTitleChangeObserver(callback: () => void) {
    const observerOptions = {
        childList: true,
        subtree: true,
        characterData: true,
    };

    const observer = new MutationObserver(() => {
        callback();
    });

    const titleElement = await getElement("title");
    observer.observe(titleElement, observerOptions);
}

/**
 * Determines the current YouTube context based on the URL and returns it.
 *
 * @returns The current YouTube context.
 */
function getYTContext(): YTContext {
    const regExpContextMap: RegExpContextMap = {
        "^https://www\\.youtube\\.com/watch\\?.*$": YTContext.VIDEO,
        "^https://www\\.youtube\\.com/results\\?search_query=.*$": YTContext.SEARCH,
        "^https://www\\.youtube\\.com/(\\?(.)*|)$": YTContext.HOME,

        "^https://www\\.youtube\\.com/user/[^/]+/videos(\\?(.)*|)$": YTContext.CHANNEL_VIDEOS,
        "^https://www\\.youtube\\.com/channel/[^/]+/videos(\\?(.)*|)$": YTContext.CHANNEL_VIDEOS,
        "^https://www\\.youtube\\.com/@[^/]+/videos.*$": YTContext.CHANNEL_VIDEOS,

        "^https://www\\.youtube\\.com/user/[^/]*(\\?(.)*|)$": YTContext.CHANNEL_HOME,
        "^https://www\\.youtube\\.com/channel/[^/]*(\\?(.)*|)$": YTContext.CHANNEL_HOME,
        "^https://www\\.youtube\\.com/user/[^/]+/featured(\\?(.)*|)$": YTContext.CHANNEL_HOME,
        "^https://www\\.youtube\\.com/channel/[^/]+/featured(\\?(.)*|)$": YTContext.CHANNEL_HOME,
        "^https://www\\.youtube\\.com/@.*$": YTContext.CHANNEL_HOME,

        "^https://www\\.youtube\\.com/feed/trending(\\?(.)*|)$": YTContext.TRENDING,
        "^https://www\\.youtube\\.com/feed/explore(\\?(.)*|)$": YTContext.TRENDING,
    };

    for (const regExp in regExpContextMap) {
        if (Object.prototype.hasOwnProperty.call(regExpContextMap, regExp)) {
            if (new RegExp(regExp).test(window.location.href)) {
                return regExpContextMap[regExp];
            }
        }
    }

    return YTContext.OTHER;
}
