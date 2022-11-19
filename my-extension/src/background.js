'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// let site_url = "";

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'generateQR') {
//     console.log("I AM BACKGROUND, I GOT MESSAGE FROM CONTENT SCRIPT");

//     const message = "MESSAGE FROM BACKGROUND TO CONTENT SCRIPT"
//     // Log message coming from the `request` parameter
//     console.log(request.url);
//     // Save the url in a variable
//     site_url = request.url;
//     // Send a response message
//     sendResponse({
//       message,
//     });
//   }
// });


chrome.webRequest.onBeforeRequest.addListener((request) => {
  console.log("I CAUGHT A REQUEST LOL ---> " + request.method);

  if (request.method == "POST") {
    chrome.tabs.sendMessage(request.tabId, {
      "type": "post",
    })
  }
}, { urls: ["<all_urls>"] })
