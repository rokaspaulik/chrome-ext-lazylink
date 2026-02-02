const saveBtn = document.getElementById("saveBtn");
const linkList = document.getElementById("linkList");
const searchInput = document.getElementById("searchInput");

// Load links
chrome.storage.local.get(["links"], (result) => {
    renderLinks(result.links || []);
});

// Save current tab
saveBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const { title, url } = tabs[0];
        let tags = [];

        if (url.includes("youtube.com/watch") || url.includes("youtube.com/shorts/")) {
            tags.push("youtube");
        }

        chrome.storage.local.get(["links"], (result) => {
            const links = result.links || [];
            if (!links.some(l => l.url === url)) {
                links.unshift({ title, url, pinned: false, tags });
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
            link.url.toLowerCase().includes(query) ||
            (link.tags || []).some(tag => tag.toLowerCase().includes(query))
        );
        renderLinks(filtered);
    });
});

// Render links
function renderLinks(links) {
    linkList.innerHTML = "";
    links.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    links.forEach(link => {
        const li = document.createElement("li");

        const row = document.createElement("div");
        row.className = "link-row";

        const title = document.createElement("span");
        title.className = "title";
        title.textContent = link.title;
        title.title = "Double-click to edit";
        title.ondblclick = () => startEditingTitle(link.url, title);
        row.appendChild(title);

        const actions = document.createElement("div");
        actions.className = "link-actions";

        const pinBtn = document.createElement("button");
        pinBtn.className = "pin-btn";
        pinBtn.textContent = link.pinned ? "Unpin" : "Pin";
        pinBtn.onclick = () => togglePin(link.url);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "X";
        deleteBtn.onclick = () => deleteLink(link.url);

        actions.appendChild(pinBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(actions);

        li.appendChild(row);

        // URL
        const urlEl = document.createElement("a");
        urlEl.href = link.url;
        urlEl.textContent = link.url;
        urlEl.className = "url";
        urlEl.target = "_blank";
        li.appendChild(urlEl);

        // Tags
        const tagContainer = document.createElement("div");
        tagContainer.className = "tags";

        (link.tags || []).forEach(tag => {
            const tagEl = document.createElement("span");
            tagEl.className = "tag";
            tagEl.textContent = tag;
            tagEl.title = "Click to filter by this tag, double-click to remove";

            tagEl.onclick = (e) => {
                e.stopPropagation();
                filterByTag(tag);
            };

            tagEl.ondblclick = (e) => {
                e.stopPropagation();
                removeTagFromLink(link.url, tag);
            };

            tagContainer.appendChild(tagEl);
        });

        const addTagBtn = document.createElement("button");
        addTagBtn.className = "add-tag-btn";
        addTagBtn.textContent = "+";
        addTagBtn.onclick = () => addTagToLink(link.url);
        tagContainer.appendChild(addTagBtn);

        li.appendChild(tagContainer);
        linkList.appendChild(li);
    });
}

// Editable title
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
        if (e.key === "Escape") renderLinks();
    });
}

// Tags
function addTagToLink(url) {
    const tag = prompt("Enter a tag for this link:").trim();
    if (!tag) return;

    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.map(l => {
            if (l.url === url) {
                l.tags = l.tags || [];
                if (!l.tags.includes(tag)) l.tags.push(tag);
            }
            return l;
        });
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}

function removeTagFromLink(url, tagToRemove) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.map(l => {
            if (l.url === url && l.tags) {
                l.tags = l.tags.filter(t => t !== tagToRemove);
            }
            return l;
        });
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}

function filterByTag(tag) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const filtered = links.filter(l => (l.tags || []).includes(tag));
        renderLinks(filtered);
    });
}

// Pin / Delete
function togglePin(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.map(l => l.url === url ? { ...l, pinned: !l.pinned } : l);
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}

function deleteLink(url) {
    chrome.storage.local.get(["links"], (result) => {
        const links = result.links || [];
        const updated = links.filter(l => l.url !== url);
        chrome.storage.local.set({ links: updated }, () => renderLinks(updated));
    });
}
