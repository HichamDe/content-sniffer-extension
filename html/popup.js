document.addEventListener('DOMContentLoaded', function () {
  const mainToggle = document.getElementById('mainToggle');
  const toggleStatus = document.querySelector('.toggle-status');
  const miniToggles = document.querySelectorAll('.mini-toggle');
  const statNumbers = document.querySelectorAll('.stat-number');
  const statCards = document.querySelectorAll('.stat-card');

  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');

  let isEnabled = true;

  // Restore main toggle state from chrome.storage.local
  chrome.storage.local.get(['mainToggleEnabled'], (result) => {
    if (result.mainToggleEnabled !== undefined) {
      isEnabled = result.mainToggleEnabled;

      if (isEnabled) {
        mainToggle.classList.add('active');
        toggleStatus.textContent = 'ENABLED';
        toggleStatus.style.color = '#22c55e';
      } else {
        mainToggle.classList.remove('active');
        toggleStatus.textContent = 'DISABLED';
        toggleStatus.style.color = '#ef4444';
      }

      // Update status-indicator based on stored value
      if (statusText && statusDot) {
        if (isEnabled) {
          statusText.textContent = 'Protection Active';
          statusText.style.color = '#22c55e';
          statusDot.style.backgroundColor = '#22c55e';
        } else {
          statusText.textContent = 'Protection Inactive';
          statusText.style.color = '#ef4444';
          statusDot.style.backgroundColor = '#ef4444';
        }
      }
    }
  });

  // Restore mini toggles state from chrome.storage.local
  miniToggles.forEach(function (toggle) {
    const setting = toggle.getAttribute('data-setting');
    chrome.storage.local.get([`setting-${setting}`], (result) => {
      const storedValue = result[`setting-${setting}`];
      if (storedValue !== undefined) {
        if (storedValue === true) {
          toggle.classList.add('active');
        } else {
          toggle.classList.remove('active');
        }
      }
    });
  });

  // Main toggle functionality
  mainToggle.addEventListener('click', function () {
    isEnabled = !isEnabled;

    if (isEnabled) {
      mainToggle.classList.add('active');
      toggleStatus.textContent = 'ENABLED';
      toggleStatus.style.color = '#22c55e';
    } else {
      mainToggle.classList.remove('active');
      toggleStatus.textContent = 'DISABLED';
      toggleStatus.style.color = '#ef4444';
    }

    // Save to chrome.storage.local
    chrome.storage.local.set({ mainToggleEnabled: isEnabled });

    // Update status-indicator in real-time
    if (statusText && statusDot) {
      if (isEnabled) {
        statusText.textContent = 'Protection Active';
        statusText.style.color = '#22c55e';
        statusDot.style.backgroundColor = '#22c55e';
      } else {
        statusText.textContent = 'Protection Inactive';
        statusText.style.color = '#ef4444';
        statusDot.style.backgroundColor = '#ef4444';
      }
    }

    // Send message to background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: 'toggleProtection',
        enabled: isEnabled
      });
    }
  });

  // Mini toggles functionality
  miniToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      const setting = toggle.getAttribute('data-setting');
      const isActive = toggle.classList.contains('active');

      // Save to chrome.storage.local
      chrome.storage.local.set({ [`setting-${setting}`]: isActive });

      // Send message to background script
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'updateSetting',
          setting: setting,
          enabled: isActive
        });
      }
    });
  });

  // Animate stats on load (if elements exist)
  statNumbers.forEach(function (stat, index) {
    setTimeout(function () {
      stat.style.transform = 'scale(1.1)';
      stat.style.transition = 'transform 0.2s ease';
      setTimeout(function () {
        stat.style.transform = 'scale(1)';
      }, 200);
    }, index * 100);
  });

  statCards.forEach(function (card) {
    card.addEventListener('click', function () {
      card.style.transform = 'scale(0.95)';
      setTimeout(function () {
        card.style.transform = 'translateY(-2px)';
      }, 100);
    });
  });
});

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'updateStats') {
      const blockedTodayElement = document.querySelector('.stat-card:first-child .stat-number');
      const totalBlockedElement = document.querySelector('.stat-card:last-child .stat-number');

      if (request.blockedToday !== undefined) {
        blockedTodayElement.textContent = formatNumber(request.blockedToday);
      }

      if (request.totalBlocked !== undefined) {
        totalBlockedElement.textContent = formatNumber(request.totalBlocked);
      }
    }
  });
}
