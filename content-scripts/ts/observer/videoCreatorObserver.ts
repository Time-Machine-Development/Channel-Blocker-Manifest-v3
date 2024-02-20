class VideoCreatorObserver extends Observer {
    constructor() {
        super("", []);
    }

    protected async addObserver() {
        const ownerElement = (await getElement("#owner")) as HTMLDivElement;

        ownerElement.querySelectorAll("button[class='cb_block_button cb_large']").forEach((blockButton) => {
            blockButton.remove();
        });

        const channelNameElement = (await getElement("ytd-channel-name a", ownerElement)) as HTMLAnchorElement;
        let userChannelName = channelNameElement.textContent;

        let button = createBlockBtnElement("");
        button.setAttribute("title", "Block '" + userChannelName + "' (Channel Blocker)");
        button.classList.add("cb_large");
        button.addEventListener("click", (mouseEvent) => {
            mouseEvent.preventDefault();
            mouseEvent.stopPropagation();

            if (userChannelName !== null) {
                blockUserChannel(userChannelName);
            }
        });
        ownerElement.insertAdjacentElement("beforeend", button);

        const mainMutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
            userChannelName = channelNameElement.textContent;
            button.setAttribute("title", "Block '" + userChannelName + "' (Channel Blocker)");
        });

        mainMutationObserver.observe(channelNameElement, { childList: true });
        this.activeMutationObserver.push(mainMutationObserver);
    }
}
