// [ANTICS] Background service worker - The jester's watchful eye

const DEFAULT_SETTINGS = {
  enabled: true,
  intensity: 'medium',
  antics: {
    confettiHover: true,
    textWobble: true,
    buttonBounce: true,
    imageTilt: false,
    feedShuffle: false
  },
  excludedDomains: [
    'bank',
    'chase.com',
    'wellsfargo.com',
    'paypal.com',
    'venmo.com',
    'mail.google.com',
    'outlook.com',
    'healthcare.gov',
    'irs.gov'
  ]
};

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[ANTICS] Welcome, new jester! Setting up your chaos toolkit...');
    await chrome.storage.sync.set({ anticsSettings: DEFAULT_SETTINGS });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANTICS_GET_SETTINGS') {
    chrome.storage.sync.get('anticsSettings').then(result => {
      sendResponse(result.anticsSettings || DEFAULT_SETTINGS);
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'ANTICS_CHECK_DOMAIN') {
    chrome.storage.sync.get('anticsSettings').then(result => {
      const settings = result.anticsSettings || DEFAULT_SETTINGS;
      const domain = message.domain.toLowerCase();
      const isExcluded = settings.excludedDomains.some(excluded =>
        domain.includes(excluded.toLowerCase())
      );
      sendResponse({ allowed: !isExcluded });
    });
    return true;
  }

  if (message.type === 'ANTICS_LOG') {
    // Fun logging from content scripts
    console.log(`[ANTICS] ${message.message}`);
    sendResponse({ ok: true });
    return false;
  }
});

// Badge to show status
async function updateBadge(enabled) {
  const text = enabled ? '' : 'OFF';
  const color = enabled ? '#FFD700' : '#666';

  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.anticsSettings) {
    const enabled = changes.anticsSettings.newValue?.enabled ?? true;
    updateBadge(enabled);
  }
});

// Initialize badge on startup
chrome.storage.sync.get('anticsSettings').then(result => {
  const enabled = result.anticsSettings?.enabled ?? true;
  updateBadge(enabled);
});

console.log('[ANTICS] The jester awakens... ready to spread mischief!');
