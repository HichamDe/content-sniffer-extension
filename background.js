
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "console") {
    console.log(message.content)
  }
});
