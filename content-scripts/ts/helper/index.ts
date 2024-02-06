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

function getElementFromList(querySelectors: string[], rootElement?: Element | Document): Promise<{ element: Element; index: number }> {
    const root = rootElement ?? document;

    return new Promise((resolve) => {
        for (let index = 0; index < querySelectors.length; index++) {
            let searchedElement: Element | null = root.querySelector(querySelectors[index]);
            if (searchedElement !== null) return resolve({ element: searchedElement, index });
        }

        const observerOptions = {
            childList: true,
            subtree: true,
        };

        const observer = new MutationObserver(() => {
            for (let index = 0; index < querySelectors.length; index++) {
                let searchedElement: Element | null = root.querySelector(querySelectors[index]);
                if (searchedElement !== null) {
                    observer.disconnect();
                    return resolve({ element: searchedElement, index });
                }
            }
        });
        observer.observe(document.body, observerOptions);
    });
}
