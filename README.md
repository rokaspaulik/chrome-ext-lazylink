# 🔖 URL Saver Chrome Extension

A lightweight, UX-friendly Chrome extension to **save, pin, search, and manage your browser tabs**. Perfect for keeping track of links without cluttering your bookmarks.  

This extension was developed as a rapid prototyping experiment, vibecoded using ChatGPT in under 30 minutes to demonstrate the utility of agile, AI-assisted development. It serves as a focused study on delivering high-impact browser utility through minimalist design and efficient execution.  

![Screenshot](https://i.snipboard.io/VqhFve.jpg)

---

## Features

- 💾 **Save current tab** – Store URL + page title instantly  
- 🔍 **Search** – Find links by title or URL  
- 📌 **Pin links** – Keep important links at the top  
- ❌ **Delete links** – Remove any link you no longer need  
- 📜 **Scrollable UI** – Handles hundreds of links effortlessly  
- 🌟 **Keyboard-friendly** – Focus input immediately when opening popup  

---

## Installation

1. Clone this repository:

```bash
git clone https://github.com/rokaspaulik/chrome-ext-lazylink
```

2. Open Chrome → go to chrome://extensions/
3. Enable Developer mode (top-right toggle)
4. Click Load unpacked and select the extension folder

---

## Usage

1. Click the extension icon
2. The search input is focused automatically
3. Click Save Current URL to save the currently open browser URL
4. Use the search bar to filter links instantly
5. Use the pin button to pin important links at the top
6. Click X delete button to remove links

---

## Data Storage

* No external servers; all data is local to your browser.
* All links are saved in chrome.storage.local
* Each link stores:
```json
{
  "title": "Page Title",
  "url": "https://example.com",
  "pinned": false
}
```

---

## Contributing

Contributions are welcome!