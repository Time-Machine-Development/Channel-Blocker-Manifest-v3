/**
 * Asynchronously retrieves an element matching the provided query selector.
 *
 * @param querySelector The selector used to query for the desired element.
 * @returns A Promise that resolves with the found element.
 */
function getElement(querySelector: string, rootElement?: Element | Document): Promise<Element> {
    const root = rootElement ?? document;

    return new Promise((resolve) => {
        let searchedElement: Element | null = root.querySelector(querySelector);
        if (searchedElement !== null) return resolve(searchedElement);

        const observerOptions = {
            childList: true,
            subtree: true,
        };

        const observer = new MutationObserver(() => {
            let searchedElement: Element | null = root.querySelector(querySelector);
            if (searchedElement !== null) {
                observer.disconnect();
                return resolve(searchedElement);
            }
        });
        observer.observe(document.body, observerOptions);
    });
}
