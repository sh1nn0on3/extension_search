// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "contextMenuParent",
    title: "GHTK Extension",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "createOrder",
    parentId: "contextMenuParent",
    title: "Tạo đơn hàng",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "getOrder",
    parentId: "contextMenuParent",
    title: "Tìm kiếm đơn hàng",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getOrder") {
    chrome.tabs.sendMessage(tab.id, {
      command: "logSelection",
      selectionText: info.selectionText,
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "createOrder") {
    chrome.tabs.sendMessage(tab.id, {
      command: "createOrder",
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
