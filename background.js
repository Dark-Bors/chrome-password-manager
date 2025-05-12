// background.js

// Open the dashboard when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("dashboard.html")
  });
});

// Master key session (stored in chrome.storage.session)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "setMasterKey") {
    chrome.storage.session.set({ masterKey: message.key }).then(() => {
      console.log("[Background] Master key stored.");
      sendResponse({ success: true });
    });
    return true; // keep message channel open for async
  }

  if (message.type === "getMasterKey") {
    chrome.storage.session.get("masterKey").then((res) => {
      sendResponse({ key: res.masterKey || null });
    });
    return true;
  }

  if (message.type === "saveCredential") {
    chrome.storage.session.get("masterKey").then(async (res) => {
      const key = res.masterKey;
      if (!key) return sendResponse({ saved: false });

      const { site, user, pass } = message.payload;
      const encrypted = await encryptData({ user, pass }, key);
      await chrome.storage.local.set({ [site]: encrypted });
      sendResponse({ saved: true });
    });
    return true;
  }
});
