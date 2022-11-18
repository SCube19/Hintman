'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.webRequest.onBeforeRequest.addListener((req) => {
    console.log(req.tabId);
    chrome.tabs.sendMessage(req.tabId, { data: req });
}, { urls: ["<all_urls>"] })