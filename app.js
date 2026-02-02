const saveBtn = document.getElementById("saveBtn");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchInput");

// Load links on popup open
chrome.storage.local.get(["links"], (result) => {
    renderLinks(result.links || []);
});

// Save current tab (title + URL + pinned=false)
saveBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const { title, url } = tabs[0];

        chrome.storage.local.get(["links"], (result) => {
            const links = result.links || [];

            if (!links.some(l => l.url === url)) {
                links.unshift({ title, url, pinned: false });
                chrome.storage.local.set({ links }, () => {
                    renderLinks(links);
                });
            }
        });
    });
});

// Search functionality
searchInput.addEventListener("input", () => {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const query = searchInput.value.toLowerCase();

        const filtered = links.filter(link =>
            link.title.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query)
        );

        renderLinks(filtered);
    });
});

// Render list
function renderLinks(links) {
    linkList.innerHTML = "";

    // Pinned links first
    links.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    links.forEach((link) => {
        const li = document.createElement("li");

        const row = document.createElement("div");
        row.className = "link-row";

        const title = document.createElement("span");
        title.className = "title";
        title.textContent = link.title;

        // Actions: pin + delete
        const actions = document.createElement("div");
        actions.className = "link-actions";

        const pinBtn = document.createElement("button");
        pinBtn.className = "pin-btn";
        pinBtn.textContent = link.pinned ? "Unpin" : "Pin";
        pinBtn.title = link.pinned ? "Unpin link" : "Pin link";

        pinBtn.onclick = () => togglePin(link.url);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "X";

        deleteBtn.onclick = () => deleteLink(link.url);

        actions.appendChild(pinBtn);
        actions.appendChild(deleteBtn);

        row.appendChild(title);
        row.appendChild(actions);

        const url = document.createElement("a");
        url.href = link.url;
        url.textContent = link.url;
        url.className = "url";
        url.target = "_blank";

        li.appendChild(row);
        li.appendChild(url);
        linkList.appendChild(li);
    });
}

// Toggle pinned state
function togglePin(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.map(l =>
            l.url === url ? { ...l, pinned: !l.pinned } : l
        );
        chrome.storage.local.set({ links: updated }, () => {
            renderLinks(updated);
        });
    });
}

// Delete link
function deleteLink(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.filter(l => l.url !== url);
        chrome.storage.local.set({ links: updated }, () => {
            renderLinks(updated);
        });
    });
}
