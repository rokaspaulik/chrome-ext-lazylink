// Track last right-clicked element
let lastRightClickedElement = null;

document.addEventListener("contextmenu", (event) => {
    lastRightClickedElement = event.target;
}, true);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action !== "getLinkTitle") return;

    let element = lastRightClickedElement;
    let title = msg.url;

    if (element) {
        title =
            element.innerText?.trim() ||
            element.title?.trim() ||
            element.getAttribute("aria-label")?.trim() ||
            element.querySelector("img")?.alt?.trim() ||
            element.href ||
            msg.url;
    }

    // If the title is still just the URL, try page <title>
    if (title === msg.url && msg.tabId) {
        chrome.scripting.executeScript(
            {
                target: { tabId: msg.tabId },
                func: (url) => document.querySelector("title")?.innerText || url
            },
            (results) => {
                if (results?.[0]?.result) {
                    sendResponse({ title: results[0].result });
                } else {
                    sendResponse({ title });
                }
            }
        );
        return true; // async response
    }

    sendResponse({ title });
});
