// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "myContextMenu",
    title: "My Custom Menu",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("🚀 ~ chrome.contextMenus.onClicked.addListener ~ tab:", tab)
  console.log("🚀 ~ chrome.contextMenus.onClicked.addListener ~ info:", info )
  if (info.menuItemId === "myContextMenu") {
    chrome.tabs.sendMessage(tab.id, {
      command: "logSelection",
      selectionText: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "sendData") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { data: message.data });
    });
  }
});
