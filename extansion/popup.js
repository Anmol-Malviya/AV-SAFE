import { analyzeURL } from './phishingEngine.js';
import { 
  getServerUrl, 
  setServerUrl, 
  testServerConnection, 
  logScanTelemetry, 
  performDeepScan, 
  submitIncidentComplaint, 
  fetchScanHistory, 
  getDashboardUrl, 
  DEFAULT_SERVER_URL 
} from './apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  // SVG circular progress ring settings
  const progressRing = document.getElementById('progress-ring-fill');
  const radius = 52;
  const circumference = 2 * Math.PI * radius; // ~326.726

  progressRing.style.strokeDasharray = `${circumference}`;
  progressRing.style.strokeDashoffset = `${circumference}`;

  // Current active URL & state
  let currentActiveUrl = '';
  let currentAnalysis = null;
  let serverIsOnline = false;

  // 1. Setup Tab Navigation
  setupNavigationTabs();

  // 2. Initialize Backend Connection Check
  await checkAndRenderServerStatus();

  // 3. Inspect the Current Browser Tab
  inspectCurrentTab(circumference);

  // 4. Load Stats and Protection Settings
  loadSettingsAndStats();

  // 5. Setup Action Buttons
  setupActionButtons();

  // 6. Setup Settings Listeners
  setupSettingsListeners();

  // 7. Setup Incident Report Modal
  setupReportModal();
});

// Segmented Navigation Tab Switcher
function setupNavigationTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panels = {
    shield: document.getElementById('view-shield'),
    activity: document.getElementById('view-activity'),
    settings: document.getElementById('view-settings')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      Object.keys(panels).forEach(key => {
        if (key === targetId) {
          panels[key].classList.add('active');
        } else {
          panels[key].classList.remove('active');
        }
      });

      if (targetId === 'activity') {
        loadActivityTab();
      } else if (targetId === 'settings') {
        loadSettingsTabDetails();
      }
    });
  });

  // Clicking server status pill jumps to Settings tab
  const serverPill = document.getElementById('server-status-pill');
  if (serverPill) {
    serverPill.addEventListener('click', () => {
      const settingsTabBtn = document.querySelector('.nav-tab[data-tab="settings"]');
      if (settingsTabBtn) settingsTabBtn.click();
    });
  }
}

// Server Health Verification
async function checkAndRenderServerStatus() {
  const pill = document.getElementById('server-status-pill');
  const label = document.getElementById('server-status-label');
  const endpointBadge = document.getElementById('endpoint-ping-badge');

  pill.className = 'server-status-pill checking';
  label.textContent = 'Checking...';

  const health = await testServerConnection();

  if (health.online) {
    pill.className = 'server-status-pill online';
    label.textContent = `Server Online (${health.latencyMs}ms)`;
    if (endpointBadge) {
      endpointBadge.textContent = `ONLINE (${health.latencyMs}ms)`;
      endpointBadge.className = 'badge-tag';
    }
  } else {
    pill.className = 'server-status-pill offline';
    label.textContent = 'Standalone Mode';
    if (endpointBadge) {
      endpointBadge.textContent = 'OFFLINE';
      endpointBadge.className = 'badge-tag text-danger';
    }
  }
}

// Active Tab Security Inspection
function inspectCurrentTab(circumference) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
      displayUnknownState();
      return;
    }

    const currentTab = tabs[0];
    const url = currentTab.url || '';
    window._currentActiveUrl = url;

    // Check for internal browser URLs
    if (!url || 
        url.startsWith('chrome://') || 
        url.startsWith('chrome-extension://') || 
        url.startsWith('about:') || 
        url.startsWith('edge://') ||
        url.startsWith('file://')) {
      displaySystemPageState(url);
      return;
    }

    // Parse URL components
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      parsedUrl = { hostname: url.split('/')[0], protocol: 'http:', pathname: '/' };
    }

    // Protocol badge
    const protocolBadge = document.getElementById('target-protocol-badge');
    const isHttps = parsedUrl.protocol === 'https:';
    protocolBadge.textContent = isHttps ? 'HTTPS' : 'HTTP';
    protocolBadge.className = `protocol-badge ${isHttps ? 'https' : 'http'}`;

    // Target domain & path
    document.getElementById('domain-text').textContent = parsedUrl.hostname;
    document.getElementById('url-subpath').textContent = (parsedUrl.pathname || '/') + (parsedUrl.search ? '?...' : '');

    // Execute local AI + Heuristic detection engine
    chrome.storage.local.get(['threatBlacklist'], (res) => {
      const blacklistSet = new Set(res.threatBlacklist || []);
      const analysis = analyzeURL(url, blacklistSet);
      window._currentAnalysis = analysis;
      renderAnalysis(analysis, circumference);

      // Auto-log scan to backend /api/history
      chrome.storage.local.get(['autoLogScans'], (settings) => {
        if (settings.autoLogScans !== false) {
          logScanTelemetry({
            url,
            rating: analysis.rating,
            score: analysis.score,
            warnings: analysis.warnings
          }).catch(() => {});
        }
      });
    });
  });
}

function displayUnknownState() {
  document.getElementById('domain-text').textContent = 'Tab inaccessible';
  document.getElementById('url-subpath').textContent = '';
  document.getElementById('score-text').textContent = '--';
  document.getElementById('quick-diagnosis').textContent = 'Unable to read active browser tab address.';
}

function displaySystemPageState(url) {
  document.getElementById('domain-text').textContent = 'System Resource';
  document.getElementById('url-subpath').textContent = url || 'chrome://';
  document.getElementById('score-text').textContent = '100';

  const progressRing = document.getElementById('progress-ring-fill');
  progressRing.style.strokeDashoffset = '0';
  progressRing.style.stroke = 'var(--color-safe)';

  const ratingBadge = document.getElementById('status-rating-badge');
  ratingBadge.className = 'rating-badge safe';
  ratingBadge.textContent = 'TRUSTED INTERNAL';

  document.getElementById('quick-diagnosis').textContent = 'This is an internal, protected browser environment.';
  document.getElementById('warnings-card').classList.add('hidden');
  document.getElementById('safe-summary-card').classList.remove('hidden');

  // Disable action buttons for system tabs
  const deepScanBtn = document.getElementById('btn-deep-scan');
  const sandboxBtn = document.getElementById('btn-open-sandbox');
  if (deepScanBtn) deepScanBtn.disabled = true;
  if (sandboxBtn) sandboxBtn.disabled = true;
}

function renderAnalysis(analysis, circumference) {
  const scoreText = document.getElementById('score-text');
  const ratingBadge = document.getElementById('status-rating-badge');
  const progressRing = document.getElementById('progress-ring-fill');
  const diagnosis = document.getElementById('quick-diagnosis');
  const safeCard = document.getElementById('safe-summary-card');
  const warningsCard = document.getElementById('warnings-card');

  const score = analysis.score; // 100 = safe, 0 = critical risk
  scoreText.textContent = score;

  // Set ring offset
  const offset = circumference * (1 - score / 100);
  progressRing.style.strokeDashoffset = offset;

  if (analysis.rating === 'SAFE') {
    progressRing.style.stroke = 'var(--color-safe)';
    progressRing.style.filter = 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))';
    ratingBadge.className = 'rating-badge safe';
    ratingBadge.textContent = 'SECURE SITE';
    diagnosis.textContent = 'Zero threat indicators detected. Domain structure and security heuristics verified.';
    safeCard.classList.remove('hidden');
    warningsCard.classList.add('hidden');
  } else if (analysis.rating === 'SUSPICIOUS') {
    progressRing.style.stroke = 'var(--color-suspicious)';
    progressRing.style.filter = 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))';
    ratingBadge.className = 'rating-badge suspicious';
    ratingBadge.textContent = 'SUSPICIOUS LINK';
    diagnosis.textContent = 'Caution: Potential typosquatting, suspicious TLD, or heuristic anomalies flagged.';
    safeCard.classList.add('hidden');
    renderThreatWarnings(analysis.warnings);
  } else {
    progressRing.style.stroke = 'var(--color-danger)';
    progressRing.style.filter = 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.45))';
    ratingBadge.className = 'rating-badge dangerous';
    ratingBadge.textContent = 'CRITICAL THREAT';
    diagnosis.textContent = 'High-Risk: Triggers active phishing blacklist or strong machine learning attack vectors.';
    safeCard.classList.add('hidden');
    renderThreatWarnings(analysis.warnings);
  }
}

function renderThreatWarnings(warnings) {
  const warningsCard = document.getElementById('warnings-card');
  const countBadge = document.getElementById('warnings-count');
  const listElement = document.getElementById('popup-warnings-list');

  listElement.innerHTML = '';
  warningsCard.classList.remove('hidden');

  if (warnings && warnings.length > 0) {
    countBadge.textContent = `${warnings.length}`;

    warnings.forEach(w => {
      const li = document.createElement('li');
      li.className = 'threat-item';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'threat-item-content';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'threat-item-title';
      titleSpan.textContent = w.title || 'Security Indicator Flag';

      const descSpan = document.createElement('span');
      descSpan.className = 'threat-item-desc';
      descSpan.textContent = w.desc || 'Anomalous pattern detected.';

      contentDiv.appendChild(titleSpan);
      contentDiv.appendChild(descSpan);
      li.appendChild(contentDiv);
      listElement.appendChild(li);
    });
  } else {
    countBadge.textContent = '1';
    const li = document.createElement('li');
    li.className = 'threat-item';
    li.innerHTML = `
      <div class="threat-item-content">
        <span class="threat-item-title">AI Neural Pattern Trigger</span>
        <span class="threat-item-desc">High probability match with known deceptive lexical phishing structures.</span>
      </div>
    `;
    listElement.appendChild(li);
  }
}

// Action Buttons: Deep Scan, Sandbox, Report, Dashboard, Copy
function setupActionButtons() {
  // Copy URL
  const btnCopy = document.getElementById('btn-copy-url');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (window._currentActiveUrl) {
        navigator.clipboard.writeText(window._currentActiveUrl).then(() => {
          showToast('URL copied to clipboard');
        });
      }
    });
  }

  // Deep Scan Button
  const btnDeepScan = document.getElementById('btn-deep-scan');
  const labelDeepScan = document.getElementById('deep-scan-btn-label');
  if (btnDeepScan) {
    btnDeepScan.addEventListener('click', async () => {
      const url = window._currentActiveUrl;
      if (!url) return;

      btnDeepScan.disabled = true;
      labelDeepScan.textContent = 'Probing...';
      showToast('Initiating server network probe...');

      const result = await performDeepScan(url);
      btnDeepScan.disabled = false;
      labelDeepScan.textContent = 'Deep Scan';

      if (result.success && result.data) {
        renderDeepScanResults(result.data);
        showToast('Deep Cloud Inspection Complete');
      } else {
        showToast(`Deep scan error: ${result.error || 'Server offline'}`);
      }
    });
  }

  // Sandbox Button
  const btnSandbox = document.getElementById('btn-open-sandbox');
  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      const url = window._currentActiveUrl;
      if (!url) return;
      const sandboxUrl = chrome.runtime.getURL(`sandbox.html?url=${encodeURIComponent(url)}`);
      chrome.tabs.create({ url: sandboxUrl });
    });
  }

  // Report Button
  const btnOpenReport = document.getElementById('btn-open-report');
  if (btnOpenReport) {
    btnOpenReport.addEventListener('click', () => {
      openReportModal();
    });
  }

  // Web Dashboard Launcher Buttons
  const dashboardButtons = [
    document.getElementById('btn-header-dashboard'),
    document.getElementById('btn-view-dashboard'),
    document.getElementById('btn-footer-dashboard'),
    document.getElementById('btn-open-analytics-page')
  ];

  dashboardButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async () => {
        const url = await getDashboardUrl('/system');
        chrome.tabs.create({ url });
      });
    }
  });

  // Refresh Scan History
  const btnRefreshHistory = document.getElementById('btn-refresh-history');
  if (btnRefreshHistory) {
    btnRefreshHistory.addEventListener('click', () => {
      loadActivityTab();
      showToast('Scan history refreshed');
    });
  }
}

// Render Deep Scan Network Audit
function renderDeepScanResults(data) {
  const card = document.getElementById('deep-scan-card');
  card.classList.remove('hidden');

  // Resolved IP
  const ipVal = document.getElementById('deep-ip-val');
  if (data.dns && data.dns.active) {
    ipVal.textContent = data.dns.ip || 'Resolved';
    ipVal.className = 'audit-val safe';
  } else {
    ipVal.textContent = 'No DNS records';
    ipVal.className = 'audit-val danger';
  }

  // SSRF Guard
  const ssrfVal = document.getElementById('deep-ssrf-val');
  if (data.dns && data.dns.isPrivate) {
    ssrfVal.textContent = 'INTERNAL (SSRF BLOCK)';
    ssrfVal.className = 'audit-val danger';
  } else {
    ssrfVal.textContent = 'PUBLIC (VERIFIED)';
    ssrfVal.className = 'audit-val safe';
  }

  // SSL Certificate
  const sslIssuer = document.getElementById('deep-ssl-issuer');
  const sslExpiry = document.getElementById('deep-ssl-expiry');
  if (data.ssl && data.ssl.hasCert) {
    sslIssuer.textContent = data.ssl.issuer || 'Valid SSL';
    sslIssuer.className = 'audit-val safe';
    sslExpiry.textContent = data.ssl.isExpired ? 'EXPIRED' : (data.ssl.validTo ? new Date(data.ssl.validTo).toLocaleDateString() : 'Active');
    sslExpiry.className = `audit-val ${data.ssl.isExpired ? 'danger' : 'safe'}`;
  } else {
    sslIssuer.textContent = 'No Valid Certificate';
    sslIssuer.className = 'audit-val danger';
    sslExpiry.textContent = 'Insecure';
    sslExpiry.className = 'audit-val danger';
  }

  // DOM Page Analysis
  const pageLogin = document.getElementById('deep-page-login');
  const pageExt = document.getElementById('deep-page-ext');
  if (data.page && data.page.success) {
    pageLogin.textContent = data.page.hasPasswordInput ? 'Password Input Found' : 'None Detected';
    pageLogin.className = `audit-val ${data.page.hasPasswordInput ? 'danger' : 'safe'}`;

    pageExt.textContent = data.page.hasExternalForm ? 'External Target (Warning)' : 'Internal / Safe';
    pageExt.className = `audit-val ${data.page.hasExternalForm ? 'danger' : 'safe'}`;
  } else {
    pageLogin.textContent = 'Unreachable / Blocked';
    pageExt.textContent = '—';
  }
}

// Telemetry & Settings Setup
function loadSettingsAndStats() {
  chrome.storage.local.get([
    'serverUrl',
    'shieldingActive',
    'blockSuspicious',
    'autoLogScans',
    'statsScanned',
    'statsBlocked',
    'ruleCount',
    'lastSyncTime'
  ], (res) => {
    // Checkbox toggles
    const toggleShield = document.getElementById('toggle-shielding');
    const toggleSusp = document.getElementById('toggle-suspicious');
    const toggleAutoLog = document.getElementById('toggle-autolog');

    if (toggleShield) toggleShield.checked = res.shieldingActive !== false;
    if (toggleSusp) toggleSusp.checked = res.blockSuspicious === true;
    if (toggleAutoLog) toggleAutoLog.checked = res.autoLogScans !== false;

    // Stats
    const elScanned = document.getElementById('stat-scanned');
    const elBlocked = document.getElementById('stat-blocked');
    const elRules = document.getElementById('stat-rules');

    if (elScanned) elScanned.textContent = (res.statsScanned || 0).toLocaleString();
    if (elBlocked) elBlocked.textContent = (res.statsBlocked || 0).toLocaleString();
    if (elRules) elRules.textContent = (res.ruleCount || 0).toLocaleString();

    // Server input in settings
    const serverInput = document.getElementById('input-server-url');
    if (serverInput) serverInput.value = res.serverUrl || DEFAULT_SERVER_URL;

    // Rules count in settings
    const syncRules = document.getElementById('sync-rules-count');
    const syncTime = document.getElementById('sync-last-time');
    if (syncRules) syncRules.textContent = (res.ruleCount || 0).toLocaleString();
    if (syncTime) {
      syncTime.textContent = res.lastSyncTime ? new Date(res.lastSyncTime).toLocaleDateString() : 'Never';
    }
  });
}

function setupSettingsListeners() {
  // Shield Toggle
  document.getElementById('toggle-shielding')?.addEventListener('change', (e) => {
    chrome.storage.local.set({ shieldingActive: e.target.checked }, () => {
      chrome.runtime.sendMessage({ action: 'triggerBadgeUpdate' });
      showToast(`Real-Time Shield ${e.target.checked ? 'Enabled' : 'Disabled'}`);
    });
  });

  // Block Suspicious Toggle
  document.getElementById('toggle-suspicious')?.addEventListener('change', (e) => {
    chrome.storage.local.set({ blockSuspicious: e.target.checked }, () => {
      showToast(`Suspicious Blocking ${e.target.checked ? 'Enabled' : 'Disabled'}`);
    });
  });

  // Auto-Log Telemetry Toggle
  document.getElementById('toggle-autolog')?.addEventListener('change', (e) => {
    chrome.storage.local.set({ autoLogScans: e.target.checked }, () => {
      showToast(`Dashboard Telemetry ${e.target.checked ? 'Enabled' : 'Disabled'}`);
    });
  });

  // Server URL Test & Save
  const btnSaveServer = document.getElementById('btn-save-server-url');
  const inputServer = document.getElementById('input-server-url');
  const statusText = document.getElementById('endpoint-status-text');

  if (btnSaveServer && inputServer) {
    btnSaveServer.addEventListener('click', async () => {
      btnSaveServer.disabled = true;
      btnSaveServer.textContent = 'Testing...';
      const typedUrl = inputServer.value.trim();

      const savedUrl = await setServerUrl(typedUrl);
      const testResult = await testServerConnection(savedUrl);

      btnSaveServer.disabled = false;
      btnSaveServer.textContent = 'Test & Save';

      if (testResult.online) {
        statusText.textContent = `Connected! Latency: ${testResult.latencyMs}ms. Endpoints ready.`;
        statusText.style.color = 'var(--color-safe)';
        showToast('Connected to AV-SAFE Backend Server!');
      } else {
        statusText.textContent = `Warning: Server unreachable (${testResult.error}). Saved locally.`;
        statusText.style.color = 'var(--color-danger)';
        showToast('Server test failed - saved offline');
      }

      await checkAndRenderServerStatus();
    });
  }

  // Sync Threat Rules Button
  const btnSyncRules = document.getElementById('btn-sync-rules');
  const syncFeedback = document.getElementById('sync-feedback');
  if (btnSyncRules) {
    btnSyncRules.addEventListener('click', () => {
      btnSyncRules.disabled = true;
      btnSyncRules.textContent = 'Syncing...';
      if (syncFeedback) syncFeedback.textContent = 'Downloading active threat feeds...';

      chrome.runtime.sendMessage({ action: 'syncThreatIntel' }, (response) => {
        btnSyncRules.disabled = false;
        btnSyncRules.textContent = 'Sync Now';

        if (response && response.success) {
          showToast(`Synced ${response.count.toLocaleString()} threat domains!`);
          if (syncFeedback) syncFeedback.textContent = `Updated ${response.count.toLocaleString()} rules successfully.`;
          loadSettingsAndStats();
        } else {
          showToast('Rule synchronization failed');
          if (syncFeedback) syncFeedback.textContent = `Sync failed: ${response?.error || 'Network error'}`;
        }
      });
    });
  }

  // Clear Session Whitelist
  const btnClearWhitelist = document.getElementById('btn-clear-whitelist');
  if (btnClearWhitelist) {
    btnClearWhitelist.addEventListener('click', () => {
      chrome.storage.local.set({ bypassList: [] }, () => {
        loadSettingsTabDetails();
        showToast('Session whitelist cleared');
      });
    });
  }
}

// Activity Tab: Live Server Scan History
async function loadActivityTab() {
  const list = document.getElementById('activity-history-list');
  if (!list) return;

  list.innerHTML = '<li class="history-loading">Fetching scan history from AV-SAFE backend...</li>';

  const history = await fetchScanHistory();

  if (!history || history.length === 0) {
    list.innerHTML = '<li class="history-loading">No scan records found in server database.</li>';
    return;
  }

  list.innerHTML = '';
  history.slice(0, 15).forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';

    let displayHost = item.url;
    try {
      displayHost = new URL(item.url).hostname;
    } catch (e) {
      displayHost = item.url.replace(/^https?:\/\//i, '').split('/')[0];
    }

    const ratingClass = (item.rating || 'SAFE').toLowerCase();
    const sourceLabel = item.source === 'EXTENSION' ? 'EXT' : (item.source === 'WEB_SCANNER' ? 'WEB' : 'APP');

    li.innerHTML = `
      <div class="history-info">
        <span class="history-url" title="${item.url}">${displayHost}</span>
        <span class="history-meta">${item.date || 'Recent'} · ${sourceLabel}</span>
      </div>
      <span class="history-pill ${ratingClass}">${item.rating || 'SAFE'}</span>
    `;

    // Click item to preview in Sandbox
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      const sandboxUrl = chrome.runtime.getURL(`sandbox.html?url=${encodeURIComponent(item.url)}`);
      chrome.tabs.create({ url: sandboxUrl });
    });

    list.appendChild(li);
  });
}

// Whitelist in Settings Tab
function loadSettingsTabDetails() {
  const whitelistCard = document.getElementById('whitelist-card');
  const whitelistList = document.getElementById('whitelist-list');

  chrome.storage.local.get(['bypassList'], (res) => {
    const list = res.bypassList || [];
    if (list.length === 0) {
      whitelistCard.classList.add('hidden');
      return;
    }

    whitelistCard.classList.remove('hidden');
    whitelistList.innerHTML = '';

    list.forEach(domain => {
      const li = document.createElement('li');
      li.className = 'whitelist-item';
      li.innerHTML = `
        <span>${domain}</span>
        <button class="btn-remove-whitelist" title="Remove bypass">✕</button>
      `;

      li.querySelector('.btn-remove-whitelist').addEventListener('click', () => {
        const updated = list.filter(d => d !== domain);
        chrome.storage.local.set({ bypassList: updated }, () => {
          loadSettingsTabDetails();
          showToast(`Removed ${domain} from whitelist`);
        });
      });

      whitelistList.appendChild(li);
    });
  });
}

// Incident Report Modal Setup
function setupReportModal() {
  const modal = document.getElementById('report-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const btnCancel = document.getElementById('btn-cancel-report');
  const btnSubmit = document.getElementById('btn-submit-report');
  const urlDisplay = document.getElementById('modal-url-display');
  const selectCat = document.getElementById('select-category');
  const commentsArea = document.getElementById('textarea-comments');
  const resultBox = document.getElementById('report-result-box');

  const closeModal = () => {
    modal.classList.add('hidden');
    resultBox.classList.add('hidden');
    resultBox.innerHTML = '';
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Submit Incident Report';
  };

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);

  btnSubmit?.addEventListener('click', async () => {
    const url = window._currentActiveUrl;
    if (!url) return;

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Submitting to SecOps...';

    const category = selectCat.value;
    const description = commentsArea.value.trim() || 'Reported via AV-SAFE browser extension';
    const analysis = window._currentAnalysis || {};

    const reportPayload = {
      url,
      category,
      description,
      rating: analysis.rating || 'DANGEROUS',
      score: analysis.score ?? 10,
      detectionReasons: (analysis.warnings || []).map(w => typeof w === 'string' ? w : `${w.title}: ${w.desc}`),
      source: 'EXTENSION'
    };

    const submission = await submitIncidentComplaint(reportPayload);

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Submit Incident Report';

    if (submission.success) {
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = `
        <strong style="color:var(--color-safe);">✓ Incident Registered!</strong>
        <span>Tracking ID: <strong>${submission.complaintId}</strong></span>
        <span style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Submitted to AV-SAFE SecOps review queue.</span>
        <button id="btn-view-reported-complaint" class="btn-primary-sm" style="margin-top:6px;">View on Dashboard ↗</button>
      `;

      document.getElementById('btn-view-reported-complaint')?.addEventListener('click', async () => {
        const dashUrl = await getDashboardUrl(`/system?tab=complaints&id=${submission.complaintId}`);
        chrome.tabs.create({ url: dashUrl });
      });

      showToast(`Incident filed: ${submission.complaintId}`);
    } else {
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = `
        <strong style="color:var(--color-danger);">Submission Failed</strong>
        <span>${submission.error || 'Check server connection in Settings'}</span>
      `;
    }
  });
}

function openReportModal() {
  const modal = document.getElementById('report-modal');
  const urlDisplay = document.getElementById('modal-url-display');
  const commentsArea = document.getElementById('textarea-comments');
  const selectCat = document.getElementById('select-category');

  if (urlDisplay) urlDisplay.textContent = window._currentActiveUrl || 'Unknown Target';
  if (commentsArea) commentsArea.value = '';

  const analysis = window._currentAnalysis;
  if (analysis && analysis.rating === 'DANGEROUS') {
    selectCat.value = 'PHISHING';
  }

  modal.classList.remove('hidden');
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-message');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2400);
}
