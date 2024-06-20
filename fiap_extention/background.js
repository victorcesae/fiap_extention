chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      console.log("FIAP Extention click!");
    },
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateProgressCopy") {
    updateProgress(message.progress, true);
  } else {
    updateProgress(message.progress, false);
  }
});

// Example function to update progress in storage
function updateProgress(progress, isCopy) {
  chrome.storage.local.set(
    {
      progressCopy: isCopy ? progress : 0,
      progressVideos: isCopy ? 0 : progress,
    },
    () => {}
  );
}
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.set({ showIndicators: true }, () => {});
});
