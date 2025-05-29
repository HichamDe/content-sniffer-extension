// Function that randomly returns true or false based on external API
async function randomBool(text) {
  const encodedText = encodeURIComponent(text || '');
  const url = `https://hichamiamiri-content-sniffer.hf.space/predict?text=${encodedText}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not OK');
    }

    const data = await response.json();

    chrome.runtime.sendMessage({
      type: "console",
      content: data,
    });

    return data.result === "show";
  } catch (error) {
    chrome.runtime.sendMessage({
      type: "console",
      content: `Error: ${error}`,
    });
    return false; // default to false on error
  }
}

// Async function to get all text nodes with their container HTML
async function getAllTextNodesWithContainerHTML() {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeValue.trim().length > 0) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  const result = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const parent = node.parentElement;

    const shouldShow = await randomBool(parent?.textContent.trim() || null);

    chrome.runtime.sendMessage({
      type: "console",
      content: `shouldShow: ${shouldShow} for text: ${node.nodeValue.trim()}`,
    });

    if (!shouldShow && parent) {
      parent.style.display = "none";
    }

    result.push({
      text: node.nodeValue.trim(),
      tag: parent?.tagName?.toLowerCase() || null,
      classes: parent?.className || null,
      id: parent?.id || null,
      outerHTML: parent?.outerHTML || null
    });
  }

  return result;
}

// Execute logic in an async IIFE
(async () => {
  const htmlContent = document.documentElement.outerHTML;

  chrome.storage.local.get(['mainToggleEnabled'], async (result) => {
    const enabled = result.mainToggleEnabled;
    chrome.runtime.sendMessage({
      type: "console",
      content: enabled,
    });


    if (enabled) {
      const textNodes = await getAllTextNodesWithContainerHTML();

      chrome.runtime.sendMessage({
        type: "page_html",
        url: window.location.href,
        html: htmlContent,
        texts: textNodes
      });
    }
  });
})();
