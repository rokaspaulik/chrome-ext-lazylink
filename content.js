// Track last right-clicked element
let lastRightClickedElement = null;

// Capture right-clicked element
document.addEventListener("contextmenu", (event) => {
    lastRightClickedElement = event.target;
}, true);

// Listen for background requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action !== "getLinkTitle") return;

    let element = lastRightClickedElement;

    // Walk up DOM to find <a> if user clicked nested element
    while (element && element.tagName !== "A") {
        element = element.parentElement;
    }

    let title = msg.url; // fallback

    if (element && element.tagName === "A") {
        // Try multiple ways to get something meaningful
        title =
            element.innerText?.trim() ||
            element.title?.trim() ||
            element.getAttribute("aria-label")?.trim() ||
            element.querySelector("img")?.alt?.trim() ||
            element.href ||
            msg.url;
    }

    sendResponse({ title });
});
