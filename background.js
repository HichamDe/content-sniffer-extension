chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "page_html") {
    // console.log("The Operation is Run");
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "console") {
    console.log(message.content)
  }
});
