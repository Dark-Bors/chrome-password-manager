chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("dashboard.html")
  });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getMasterKey") {
    chrome.storage.local.get("masterKey", (data) => {
      sendResponse({ key: data.masterKey });
    });
    return true; // Keep the message channel open for sendResponse
  } else if (request.type === "setMasterKey") {
    chrome.storage.local.set({ masterKey: request.key }, () => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for sendResponse
  }
});