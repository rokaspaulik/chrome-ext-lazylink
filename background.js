// ------------------------
// Helper: fetch YouTube video title using oEmbed
// ------------------------
async function getYouTubeTitle(url) {
    try {
        const apiUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch oEmbed");
        const data = await response.json();
        return data.title;
    } catch (err) {
        console.warn("Failed to fetch YouTube title:", err);
        return url; // fallback
    }
}

// ------------------------
// Create context menu
// ------------------------
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "saveLink",
        title: "Save this link",
        contexts: ["link"]
    });
});

// ------------------------
// Handle context menu clicks
// ------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "saveLink") return;

    const url = info.linkUrl;
    let title = url; // fallback

    if (url.includes("youtube.com/watch")) {
        // Use YouTube oEmbed API
        title = await getYouTubeTitle(url);
    } else if (tab?.id) {
        // Ask content script for link text/title/alt/etc
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: "getLinkTitle",
                url
            });
            if (response?.title) title = response.title;
        } catch (err) {
            console.warn("Failed to get link title from page:", err);
        }
    }

    // Save link in storage
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];

        if (!links.some(l => l.url === url)) {
            links.unshift({ title, url, pinned: false });
            chrome.storage.local.set({ links }, () => {
                console.log("Link saved:", { title, url });

                // Optional notification
                chrome.notifications.create({
                    type: "basic",
                    iconUrl: "saved_notification.png",
                    title: "Link Saved",
                    message: title
                });
            });
        }
    });
});
