// [ANTICS] Popup script - The jester's control panel

const DEFAULT_SETTINGS = {
  enabled: true,
  intensity: 'medium',
  antics: {
    confettiHover: true,
    textWobble: true,
    buttonBounce: true,
    imageTilt: false,
    feedShuffle: false
  }
};

// DOM elements
const masterToggle = document.getElementById('masterToggle');
const statusEl = document.getElementById('status');
const intensityBtns = document.querySelectorAll('.intensity-btn');
const anticToggles = document.querySelectorAll('.antic-toggle');
const summonBtn = document.getElementById('summonBtn');

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('anticsSettings');
    return result.anticsSettings || DEFAULT_SETTINGS;
  } catch (err) {
    console.log('[ANTICS] Storage not available, using defaults');
    return DEFAULT_SETTINGS;
  }
}

// Save settings to storage
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({ anticsSettings: settings });
    // Notify content scripts of the change
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'ANTICS_SETTINGS_UPDATED',
        settings
      }).catch(() => {
        // Tab might not have content script loaded
      });
    }
  } catch (err) {
    console.log('[ANTICS] Could not save settings:', err);
  }
}

// Update UI based on settings
function updateUI(settings) {
  // Master toggle
  masterToggle.classList.toggle('active', settings.enabled);
  statusEl.classList.toggle('active', settings.enabled);
  statusEl.textContent = settings.enabled
    ? 'JESTER SPIRIT: UNLEASHED'
    : 'JESTER SPIRIT: DORMANT';

  // Intensity buttons
  intensityBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === settings.intensity);
  });

  // Antic toggles
  anticToggles.forEach(toggle => {
    const antic = toggle.dataset.antic;
    toggle.classList.toggle('active', settings.antics[antic]);
  });
}

// Initialize popup
async function init() {
  const settings = await loadSettings();
  updateUI(settings);

  // Master toggle handler
  masterToggle.addEventListener('click', async () => {
    const settings = await loadSettings();
    settings.enabled = !settings.enabled;
    await saveSettings(settings);
    updateUI(settings);
  });

  // Intensity button handlers
  intensityBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const settings = await loadSettings();
      settings.intensity = btn.dataset.level;
      await saveSettings(settings);
      updateUI(settings);
    });
  });

  // Antic toggle handlers
  anticToggles.forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const settings = await loadSettings();
      const antic = toggle.dataset.antic;
      settings.antics[antic] = !settings.antics[antic];
      await saveSettings(settings);
      updateUI(settings);
    });
  });

  // Summon random antic button
  summonBtn.addEventListener('click', async () => {
    const settings = await loadSettings();
    if (!settings.enabled) {
      // Enable if disabled
      settings.enabled = true;
    }

    // Pick a random antic and trigger it
    const anticNames = Object.keys(settings.antics);
    const randomAntic = anticNames[Math.floor(Math.random() * anticNames.length)];

    // Send message to content script to trigger the antic
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: 'ANTICS_SUMMON',
          antic: randomAntic
        });

        // Fun feedback
        summonBtn.textContent = 'CHAOS SUMMONED!';
        setTimeout(() => {
          summonBtn.textContent = 'SUMMON RANDOM ANTIC';
        }, 1500);
      }
    } catch (err) {
      console.log('[ANTICS] Could not summon antic:', err);
      summonBtn.textContent = 'RELOAD PAGE FIRST';
      setTimeout(() => {
        summonBtn.textContent = 'SUMMON RANDOM ANTIC';
      }, 2000);
    }
  });
}

init();
