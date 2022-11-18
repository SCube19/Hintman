import test from "main.js";

chrome.webRequest.onBeforeRequest.addListener(
    test, filter, opt_extraInfoSpec);