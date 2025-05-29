document.addEventListener('DOMContentLoaded', function () {
  const mainToggle = document.getElementById('mainToggle');
  const toggleStatus = document.querySelector('.toggle-status');
  let isEnabled = true;

  // Function to update UI
  function updateToggleUI() {
    if (isEnabled) {
      mainToggle.classList.add('active');
      toggleStatus.textContent = 'ENABLED';
      toggleStatus.style.color = 'green';
    } else {
      mainToggle.classList.remove('active');
      toggleStatus.textContent = 'DISABLED';
      toggleStatus.style.color = 'red';
    }
  }

  // Load from chrome.storage
  chrome.storage.local.get(['mainToggleEnabled'], (result) => {
    if (result.mainToggleEnabled !== undefined) {
      isEnabled = result.mainToggleEnabled;
    }
    updateToggleUI();
  });

  // Click toggle
  mainToggle.addEventListener('click', function () {
    isEnabled = !isEnabled;
    updateToggleUI();

    // Save to storage
    chrome.storage.local.set({ mainToggleEnabled: isEnabled });

    // Notify background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'toggleProtection',
        enabled: isEnabled
      });
    }
  });
});
