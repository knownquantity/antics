// [ANTICS] Options page script - Where jesters fine-tune their chaos

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
  ],
  options: {
    autoActivate: true,
    respectReducedMotion: true,
    showUndoButton: false
  }
};

// DOM elements
const domainList = document.getElementById('domainList');
const newDomainInput = document.getElementById('newDomain');
const addDomainBtn = document.getElementById('addDomainBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const saveNotice = document.getElementById('saveNotice');
const settingToggles = document.querySelectorAll('.toggle[data-setting]');

// Show save notification
function showSaveNotice() {
  saveNotice.classList.add('show');
  setTimeout(() => saveNotice.classList.remove('show'), 2000);
}

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get('anticsSettings');
    return { ...DEFAULT_SETTINGS, ...result.anticsSettings };
  } catch (err) {
    console.log('[ANTICS] Could not load settings:', err);
    return DEFAULT_SETTINGS;
  }
}

// Save settings
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set({ anticsSettings: settings });
    showSaveNotice();
  } catch (err) {
    console.log('[ANTICS] Could not save settings:', err);
  }
}

// Render domain list
function renderDomains(domains) {
  domainList.innerHTML = domains.map(domain => `
    <div class="domain-item">
      <span class="domain-name">${domain}</span>
      <button class="remove-btn" data-domain="${domain}">REMOVE</button>
    </div>
  `).join('');

  // Add click handlers for remove buttons
  domainList.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const domain = btn.dataset.domain;
      const settings = await loadSettings();
      settings.excludedDomains = settings.excludedDomains.filter(d => d !== domain);
      await saveSettings(settings);
      renderDomains(settings.excludedDomains);
    });
  });
}

// Update UI
async function updateUI() {
  const settings = await loadSettings();

  // Update toggles
  settingToggles.forEach(toggle => {
    const setting = toggle.dataset.setting;
    const isActive = settings.options?.[setting] ?? DEFAULT_SETTINGS.options[setting];
    toggle.classList.toggle('active', isActive);
  });

  // Update domain list
  renderDomains(settings.excludedDomains || DEFAULT_SETTINGS.excludedDomains);
}

// Initialize
async function init() {
  await updateUI();

  // Toggle handlers
  settingToggles.forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const setting = toggle.dataset.setting;
      const settings = await loadSettings();

      if (!settings.options) settings.options = {};
      settings.options[setting] = !toggle.classList.contains('active');

      await saveSettings(settings);
      toggle.classList.toggle('active');
    });
  });

  // Add domain handler
  addDomainBtn.addEventListener('click', async () => {
    const domain = newDomainInput.value.trim().toLowerCase();
    if (!domain) return;

    const settings = await loadSettings();
    if (!settings.excludedDomains.includes(domain)) {
      settings.excludedDomains.push(domain);
      await saveSettings(settings);
      renderDomains(settings.excludedDomains);
    }
    newDomainInput.value = '';
  });

  // Enter key in domain input
  newDomainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addDomainBtn.click();
  });

  // Export handler
  exportBtn.addEventListener('click', async () => {
    const settings = await loadSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'antics-settings.json';
    a.click();

    URL.revokeObjectURL(url);
  });

  // Reset handler
  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      await saveSettings(DEFAULT_SETTINGS);
      await updateUI();
    }
  });
}

init();
