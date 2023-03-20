// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {action: "getNewFields"});
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "Hello from content.js") {
        console.log(request.message);
        sendResponse({ message: "Hello from background.js" });
    }
});