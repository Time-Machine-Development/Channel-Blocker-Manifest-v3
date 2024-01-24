class Observer {
    private targetSelector: string;

    private anchorSelector: string;
    private videoTitle?: string;
    private userChannelName?: string;
    private commentContent?: string;

    private observedElements: Element[] = [];
    private activeMutationObserver: MutationObserver[] = [];
    private isBlockedValidators: Function[] = [];

    constructor(targetSelector: string, observerOptions: ObserverOptions) {
        this.targetSelector = targetSelector;
        this.anchorSelector = observerOptions.anchorSelector;
        this.videoTitle = observerOptions.videoTitle;
        this.userChannelName = observerOptions.userChannelName;
        this.commentContent = observerOptions.commentContent;

        this.addObserver();
    }

    public disconnect() {
        while (this.activeMutationObserver.length > 0) {
            this.activeMutationObserver.pop()?.disconnect();
        }
    }

    public update() {
        console.log(`update ${this.isBlockedValidators.length} isBlockedValidators`);

        for (let index = 0; index < this.isBlockedValidators.length; index++) {
            this.isBlockedValidators[index]();
        }
    }

    private async addObserver() {
        const contentsElement: Element = await getElement(this.targetSelector);

        this.observedElements = Array.from(contentsElement.querySelectorAll(this.anchorSelector));
        for (let index = 0; index < this.observedElements.length; index++) {
            this.addCharacterDataSelector(this.observedElements[index]);
        }
        console.log("videoNodes: ", this.observedElements.length);

        const mainMutationObserver = new MutationObserver(() => {
            let addedElements = contentsElement.querySelectorAll(this.anchorSelector);
            console.log("newVideoNodes: ", this.observedElements.length);
            let added = 0;
            for (let index = 0; index < addedElements.length; index++) {
                const addedElement = addedElements[index];
                if (!this.observedElements.includes(addedElement)) {
                    this.observedElements.push(addedElement);
                    this.addCharacterDataSelector(addedElement);
                    added++;
                }
            }
            if (added >= 0) console.log("videoNodes:", this.observedElements.length, "added:", added);
        });

        mainMutationObserver.observe(contentsElement, { childList: true });
        this.activeMutationObserver.push(mainMutationObserver);
        console.log("Observing", contentsElement);
    }

    private async addCharacterDataSelector(element: Element) {
        let userChannelName: string | undefined;
        let videoTitle: string | undefined;
        let commentContent: string | undefined;

        const checkIfElementIsBlocked = async () => {
            const blocked = await isBlocked({ userChannelName, videoTitle, commentContent });
            console.log(`blocked ${blocked}`);

            element.classList.toggle("blocked", blocked);
        };
        this.isBlockedValidators.push(checkIfElementIsBlocked);

        element.querySelectorAll("button[class='cb_block_button']").forEach((blockButton) => {
            blockButton.remove();
        });

        if (this.userChannelName !== undefined) {
            const userChannelNameElement = await getElement(this.userChannelName, element);

            let button = createBlockBtnElement("");
            button.addEventListener("click", () => {
                if (userChannelName !== undefined) {
                    blockUserChannel(userChannelName);
                }
            });
            userChannelNameElement.insertAdjacentElement("beforebegin", button);

            const handleUserChannelName = () => {
                userChannelName = userChannelNameElement.textContent ?? undefined;
                console.log("Changed Channel: " + userChannelName);
                button.setAttribute("title", "Block '" + userChannelName + "' (Channel Blocker)");
                checkIfElementIsBlocked();
            };
            const mutationObserver = new MutationObserver(handleUserChannelName);
            mutationObserver.observe(userChannelNameElement, { childList: true, subtree: true, characterData: true });
            this.activeMutationObserver.push(mutationObserver);
            handleUserChannelName();
        }

        if (this.videoTitle !== undefined) {
            const videoTitleElement = await getElement(this.videoTitle, element);

            const handleVideoTitle = () => {
                videoTitle = videoTitleElement.textContent ?? undefined;
                console.log("Changed Title: " + videoTitle);
                checkIfElementIsBlocked();
            };
            const mutationObserver = new MutationObserver(handleVideoTitle);
            mutationObserver.observe(videoTitleElement, { childList: true, subtree: true, characterData: true });
            this.activeMutationObserver.push(mutationObserver);
            handleVideoTitle();
        }
    }
}
