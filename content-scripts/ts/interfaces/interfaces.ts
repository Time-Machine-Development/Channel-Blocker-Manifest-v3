interface ObserverOptions {
    anchorSelector: string;
    videoTitle?: string[];
    userChannelName?: string[];
    commentContent?: string[];
    insertBlockBtn?: ((element: HTMLElement, userChannelNameElement: HTMLElement, button: HTMLButtonElement) => void)[];
}

interface SubObserverOptions {
    targetSelector: string;
    anchorSelector: string;
    observerOptions?: ObserverOptions[];
    subObserver?: SubObserverOptions[];
}

interface RegExpContextMap {
    [key: string]: YTContext;
}

interface KeyValueMap {
    [key: string]: string;
}
