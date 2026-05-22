chrome.runtime.onInstalled.addListener(() => {
  console.log("%cSparx Helper God Tier v13 Loaded Successfully", "color: #6366f1; font-weight: bold");
  chrome.storage.local.set({ memory: [], lastAnswer: "" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.captureVisibleTab(null, {format: "png"}, (dataUrl) => {
      sendResponse({screenshot: dataUrl});
    });
    return true;
  }
});