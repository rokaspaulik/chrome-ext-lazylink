const saveBtn = document.getElementById("saveBtn");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchInput");

// Load links on popup open
chrome.storage.local.get(["links"], (result) => {
    renderLinks(result.links || []);
});

// Save current tab
saveBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const { title, url } = tabs[0];
        chrome.storage.local.get(["links"], (result) => {
            const links = result.links || [];
            if (!links.some(l => l.url === url)) {
                links.unshift({ title, url, pinned: false });
                chrome.storage.local.set({ links }, () => renderLinks(links));
            }
        });
    });
});

// Search
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

    links.forEach(link => {
        const li = document.createElement("li");

        const row = document.createElement("div");
        row.className = "link-row";

        // Title span (editable)
        const title = document.createElement("span");
        title.className = "title";
        title.textContent = link.title;
        title.title = "Double-click to edit";
        title.ondblclick = () => startEditingTitle(link.url, title);

        // Actions
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

        const urlEl = document.createElement("a");
        urlEl.href = link.url;
        urlEl.textContent = link.url;
        urlEl.className = "url";
        urlEl.target = "_blank";

        li.appendChild(row);
        li.appendChild(urlEl);
        linkList.appendChild(li);
    });
}

// ---------------------
// Editable title logic
// ---------------------
function startEditingTitle(url, titleSpan) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = titleSpan.textContent;
    input.className = "edit-title-input";

    titleSpan.replaceWith(input);
    input.focus();
    input.select();

    const save = () => {
        const newTitle = input.value.trim() || url;
        chrome.storage.local.get(["links"], (result) => {
            const links = result.links || [];
            const updated = links.map(l => l.url === url ? { ...l, title: newTitle } : l);
            chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
        });
    };

    input.addEventListener("blur", save);
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") renderLinks(); // cancel
    });
}

// Toggle pinned state
function togglePin(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.map(l => l.url === url ? { ...l, pinned: !l.pinned } : l);
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}

// Delete link
function deleteLink(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.filter(l => l.url !== url);
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}
