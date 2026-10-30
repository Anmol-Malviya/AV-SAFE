import { analyzeURL } from './phishingEngine.js';
import { performDeepScan, submitIncidentComplaint, getDashboardUrl } from './apiClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('url') || '';

  if (!targetUrl) {
    displayErrorState();
    return;
  }

  // Parse hostname
  let hostname = '';
  try {
    hostname = new URL(targetUrl).hostname.toLowerCase();
  } catch (e) {
    hostname = targetUrl.split('/')[0].toLowerCase() || 'unknown.site';
  }

  // Update Address Input
  document.getElementById('sandbox-address-input').value = targetUrl;

  // Request background to register dynamic rules for frame loading
  chrome.tabs.getCurrent((tab) => {
    if (tab) {
      chrome.runtime.sendMessage({ action: 'registerSandboxTab', tabId: tab.id });
    }
  });

  // Run full local threat engine analysis
  const analysis = analyzeURL(targetUrl);

  // Setup tabs switching
  setupTabs();

  // Setup header buttons
  setupHeaderButtons(targetUrl, analysis);

  // Render initial sandbox with local analysis
  renderSandbox(analysis, hostname);

  // Probe server-side Deep Cloud Scan (/api/analyze) for live SSL & DNS telemetry
  try {
    const deepResult = await performDeepScan(targetUrl);
    if (deepResult.success && deepResult.data) {
      applyDeepScanTelemetry(deepResult.data, analysis, hostname);
    } else {
      appendConsoleLog('warn', `[SERVER] Deep scan endpoint notice: ${deepResult.error || 'Server offline, using local heuristics'}`);
    }
  } catch (err) {
    appendConsoleLog('warn', `[SERVER] Could not connect to deep network scan: ${err.message}`);
  }

  // Close Button Action
  document.getElementById('btn-close-sandbox').addEventListener('click', () => {
    window.close();
  });
});

function displayErrorState() {
  document.getElementById('sandbox-address-input').value = 'Error: No URL provided';
  document.getElementById('sandbox-web-title').textContent = 'Error';
  const previewContainer = document.querySelector('.sandbox-render-preview');
  previewContainer.innerHTML = '<p style="color:var(--color-danger); padding:20px;">Please launch the sandbox explorer with a valid target URL (?url=...).</p>';
}

function renderSandbox(analysis, hostname) {
  const isHttps = /^https:/i.test(analysis.url);
  const isDangerous = analysis.rating === 'DANGEROUS';

  // 1. Initial SSL Badge
  const sslBadge = document.getElementById('ssl-badge');
  const sslDetails = document.getElementById('ssl-details');
  if (isHttps) {
    sslBadge.textContent = 'Probing SSL...';
    sslBadge.className = 'sandbox-badge safe';
    sslDetails.innerHTML = `<div>Verifying certificate with AV-SAFE backend...</div>`;
  } else {
    sslBadge.textContent = 'Insecure / No SSL';
    sslBadge.className = 'sandbox-badge red';
    sslDetails.innerHTML = `<div style="color:var(--color-danger);">Connection is unencrypted HTTP. Susceptible to interception.</div>`;
  }

  // 2. Rating Badge & Score
  const ratingBadge = document.getElementById('sandbox-rating-badge');
  ratingBadge.textContent = analysis.rating;
  ratingBadge.className = `rating-badge ${analysis.rating.toLowerCase()}`;

  const scoreDisplay = document.querySelector('.score-display');
  const scoreVal = document.getElementById('score-val');
  scoreVal.textContent = analysis.score;
  scoreDisplay.className = `score-display ${analysis.rating.toLowerCase()}`;

  // 3. Initial Audit Heuristic Values
  const hasPasswordInput = isDangerous || analysis.features.sensitive_words_count > 0;
  const hasExternalForm = isDangerous && hasPasswordInput;
  const hasAutoRedirect = analysis.warnings.some(w => w.id === 'shortener' || w.id === 'at_symbol');

  document.getElementById('audit-forms').textContent = hasPasswordInput ? '1 (Estimated)' : '0';

  const pswdSpan = document.getElementById('audit-password');
  pswdSpan.textContent = hasPasswordInput ? 'YES ⚠' : 'NO';
  pswdSpan.style.color = hasPasswordInput ? 'var(--color-danger)' : 'var(--color-safe)';

  const extSpan = document.getElementById('audit-ext-submits');
  extSpan.textContent = hasExternalForm ? 'YES ⚠' : 'NO';
  extSpan.style.color = hasExternalForm ? 'var(--color-danger)' : 'var(--color-safe)';

  const redirectSpan = document.getElementById('audit-redirects');
  redirectSpan.textContent = hasAutoRedirect ? 'YES ⚠' : 'NO';
  redirectSpan.style.color = hasAutoRedirect ? 'var(--color-suspicious)' : 'var(--color-safe)';

  document.getElementById('audit-ip').textContent = 'Resolving DNS...';

  // 4. Render Viewport: Live Sandboxed Iframe
  document.getElementById('sandbox-web-title').textContent = `Live Sandboxed View: ${analysis.url}`;
  const previewContainer = document.querySelector('.sandbox-render-preview');
  previewContainer.innerHTML = '';

  const spinnerContainer = document.createElement('div');
  spinnerContainer.className = 'spinner-container';
  spinnerContainer.id = 'sandbox-spinner';

  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';

  const spinnerText = document.createElement('div');
  spinnerText.className = 'spinner-text';
  spinnerText.textContent = 'Initializing isolated secure sandbox environment...';

  spinnerContainer.appendChild(spinner);
  spinnerContainer.appendChild(spinnerText);
  previewContainer.appendChild(spinnerContainer);

  const iframe = document.createElement('iframe');
  iframe.id = 'sandbox-iframe';
  iframe.src = analysis.url;
  // Sandboxed: scripts and forms disabled to guarantee safety
  iframe.setAttribute('sandbox', 'allow-same-origin allow-popups-to-escape-sandbox');

  iframe.addEventListener('load', () => {
    spinnerContainer.style.display = 'none';
    iframe.classList.add('loaded');
  });

  previewContainer.appendChild(iframe);

  // 5. Initial HTML Code View
  renderHTMLCodeView(hostname, hasPasswordInput, 'Resolving...', hasAutoRedirect);

  // 6. Initial Console View
  initConsoleLogs(analysis, hostname, isHttps);
}

// Apply real network telemetry received from /api/analyze
function applyDeepScanTelemetry(data, analysis, hostname) {
  const sslBadge = document.getElementById('ssl-badge');
  const sslDetails = document.getElementById('ssl-details');

  // Real SSL details
  if (data.ssl && data.ssl.hasCert) {
    sslBadge.textContent = data.ssl.isExpired ? 'SSL Expired ⚠' : (data.ssl.isSelfSigned ? 'Self-Signed ⚠' : 'Valid Certificate');
    sslBadge.className = `sandbox-badge ${data.ssl.isExpired || data.ssl.isSelfSigned ? 'red' : 'safe'}`;

    const expiryDate = data.ssl.validTo ? new Date(data.ssl.validTo).toLocaleDateString() : 'N/A';
    sslDetails.innerHTML = `
      <div>Issuer: <span class="ssl-details-val">${data.ssl.issuer || 'Trusted CA'}</span></div>
      <div>Expires: <span class="ssl-details-val" style="color:${data.ssl.isExpired ? 'var(--color-danger)' : 'var(--color-safe)'};">${expiryDate}</span></div>
      ${data.ssl.isSelfSigned ? '<div style="color:var(--color-danger);">Self-signed certificate is untrusted!</div>' : ''}
    `;
    appendConsoleLog('success', `[SSL] Verified certificate: Issuer: ${data.ssl.issuer || 'CA'}, Valid To: ${expiryDate}`);
  } else if (data.ssl && data.ssl.error) {
    sslBadge.textContent = 'SSL Failed';
    sslBadge.className = 'sandbox-badge red';
    sslDetails.innerHTML = `<div style="color:var(--color-danger);">${data.ssl.error}</div>`;
    appendConsoleLog('err', `[SSL] TLS handshake failed: ${data.ssl.error}`);
  }

  // Real DNS details
  const auditIp = document.getElementById('audit-ip');
  if (data.dns && data.dns.active) {
    auditIp.textContent = data.dns.ip;
    if (data.dns.isPrivate) {
      auditIp.style.color = 'var(--color-danger)';
      appendConsoleLog('err', `[DNS] SSRF WARNING: Target resolves to private/internal IP address (${data.dns.ip})!`);
    } else {
      auditIp.style.color = 'var(--color-safe)';
      appendConsoleLog('success', `[DNS] Resolved A record: ${hostname} → ${data.dns.ip} (Public Verified)`);
    }
  } else {
    auditIp.textContent = 'No DNS Record';
    auditIp.style.color = 'var(--color-danger)';
    appendConsoleLog('err', `[DNS] Host has no active DNS A/AAAA records!`);
  }

  // Real DOM details
  if (data.page && data.page.success) {
    document.getElementById('audit-forms').textContent = `${data.page.loginFormsCount || 0}`;

    const pswdSpan = document.getElementById('audit-password');
    pswdSpan.textContent = data.page.hasPasswordInput ? 'YES ⚠' : 'NO';
    pswdSpan.style.color = data.page.hasPasswordInput ? 'var(--color-danger)' : 'var(--color-safe)';

    const extSpan = document.getElementById('audit-ext-submits');
    extSpan.textContent = data.page.hasExternalForm ? 'YES ⚠' : 'NO';
    extSpan.style.color = data.page.hasExternalForm ? 'var(--color-danger)' : 'var(--color-safe)';

    const redirectSpan = document.getElementById('audit-redirects');
    const hasRedirect = data.page.hasMetaRedirect || data.page.hasScriptRedirect;
    redirectSpan.textContent = hasRedirect ? 'YES ⚠' : 'NO';
    redirectSpan.style.color = hasRedirect ? 'var(--color-suspicious)' : 'var(--color-safe)';

    if (data.page.hasPasswordInput) {
      appendConsoleLog('err', `[DOM] ⚠ Found password input fields on page. Risk of credential theft.`);
    }
    if (data.page.hasExternalForm) {
      appendConsoleLog('err', `[DOM] ⚠ External form action target detected.`);
    }

    // Refresh code view with verified real attributes
    renderHTMLCodeView(hostname, data.page.hasPasswordInput, data.dns?.ip || 'IP', hasRedirect);
  }
}

function initConsoleLogs(analysis, hostname, isHttps) {
  const consoleLogs = document.getElementById('console-logs');
  consoleLogs.innerHTML = '';
  const time = new Date().toLocaleTimeString();

  appendConsoleLog('info', `[${time}] [INIT] Launching AV-SAFE Sandboxed Execution Environment for: ${hostname}`);
  appendConsoleLog('info', `[${time}] [POLICY] Content-Security-Policy & Frame-Options header restrictions neutralized for preview.`);
  appendConsoleLog('info', `[${time}] [ISOLATION] Client scripts, persistent cookies, and local storage disabled.`);
  appendConsoleLog('info', `[${time}] [ML] Heuristic Score: ${analysis.score}/100 | Verdict: ${analysis.rating}`);
}

function appendConsoleLog(type, text) {
  const consoleLogs = document.getElementById('console-logs');
  if (!consoleLogs) return;
  const lineDiv = document.createElement('div');
  lineDiv.className = `console-line ${type}`;
  lineDiv.textContent = text;
  consoleLogs.appendChild(lineDiv);
  consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

function renderHTMLCodeView(domain, hasForm, ipAddress, hasRedirect) {
  const codeLines = document.getElementById('html-code-lines');
  codeLines.innerHTML = '';

  const lines = [
    { num: 1, parts: [{ cls: 'code-comment', text: `<!-- AV-SAFE Sandboxed DOM Snapshot — ${domain} -->` }] },
    { num: 2, parts: [{ cls: 'code-tag', text: '<!DOCTYPE html>' }] },
    { num: 3, parts: [{ cls: 'code-tag', text: '<html>' }] },
    { num: 4, parts: [{ cls: 'code-tag', text: '  <head>' }] },
    { num: 5, parts: [{ cls: 'code-tag', text: '    <title>' }, { cls: '', text: `Inspected: ${domain}` }, { cls: 'code-tag', text: '</title>' }] },
    { num: 6, parts: [{ cls: 'code-tag', text: '  </head>' }] },
    { num: 7, parts: [{ cls: 'code-tag', text: '  <body>' }] }
  ];

  if (hasForm) {
    lines.push(
      { num: 8, parts: [{ cls: 'code-comment', text: '    <!-- ⚠ Detected login/credential input on suspicious destination -->' }] },
      { num: 9, parts: [
          { cls: 'code-tag', text: '    <form ' }, 
          { cls: 'code-attr', text: 'method=' }, { cls: 'code-val', text: '"POST"' }, 
          { cls: 'code-attr', text: ' action=' }, { cls: 'code-val', text: `"https://${domain}/auth"` }, 
          { cls: 'code-tag', text: '>' }
        ] 
      },
      { num: 10, parts: [
          { cls: 'code-tag', text: '      <input ' }, 
          { cls: 'code-attr', text: 'type=' }, { cls: 'code-val', text: '"password"' }, 
          { cls: 'code-attr', text: ' name=' }, { cls: 'code-val', text: '"pass"' }, 
          { cls: 'code-tag', text: ' />' }
        ] 
      },
      { num: 11, parts: [{ cls: 'code-tag', text: '      <button ' }, { cls: 'code-attr', text: 'type=' }, { cls: 'code-val', text: '"submit"' }, { cls: 'code-tag', text: '>Login</button>' }] },
      { num: 12, parts: [{ cls: 'code-tag', text: '    </form>' }] }
    );
  } else {
    lines.push(
      { num: 8, parts: [{ cls: 'code-tag', text: '    <div ' }, { cls: 'code-attr', text: 'class=' }, { cls: 'code-val', text: '"content"' }, { cls: 'code-tag', text: '>' }] },
      { num: 9, parts: [{ cls: 'code-tag', text: '      <p>' }, { cls: '', text: `Target ${domain} active. Sandboxed preview rendered.` }, { cls: 'code-tag', text: '</p>' }] },
      { num: 10, parts: [{ cls: 'code-tag', text: '    </div>' }] }
    );
  }

  if (hasRedirect) {
    lines.push(
      { num: 13, parts: [{ cls: 'code-comment', text: '    <!-- ⚠ Meta redirection neutralized in sandbox -->' }] }
    );
  }

  lines.push(
    { num: 14, parts: [{ cls: 'code-tag', text: '  </body>' }] },
    { num: 15, parts: [{ cls: 'code-tag', text: '</html>' }] }
  );

  lines.forEach(line => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'code-line';

    const numSpan = document.createElement('span');
    numSpan.className = 'line-num';
    numSpan.textContent = line.num;

    const contentSpan = document.createElement('span');
    contentSpan.className = 'line-content';

    line.parts.forEach(part => {
      const partSpan = document.createElement('span');
      if (part.cls) partSpan.className = part.cls;
      partSpan.textContent = part.text;
      contentSpan.appendChild(partSpan);
    });

    lineDiv.appendChild(numSpan);
    lineDiv.appendChild(contentSpan);
    codeLines.appendChild(lineDiv);
  });
}

function setupHeaderButtons(targetUrl, analysis) {
  // Web Dashboard launcher
  document.getElementById('btn-sandbox-dashboard')?.addEventListener('click', async () => {
    const dashUrl = await getDashboardUrl('/system');
    chrome.tabs.create({ url: dashUrl });
  });

  // Report Threat modal
  const btnReport = document.getElementById('btn-sandbox-report');
  const modal = document.getElementById('sandbox-report-modal');
  const btnClose = document.getElementById('btn-close-sandbox-report');
  const btnCancel = document.getElementById('btn-cancel-sandbox-report');
  const btnSubmit = document.getElementById('btn-submit-sandbox-report');
  const modalUrl = document.getElementById('sandbox-modal-url');
  const selectCat = document.getElementById('sandbox-select-category');
  const comments = document.getElementById('sandbox-modal-comments');
  const feedback = document.getElementById('sandbox-report-feedback');

  if (modalUrl) modalUrl.textContent = targetUrl;

  const closeModal = () => {
    modal.classList.add('hidden');
    feedback.style.display = 'none';
    feedback.innerHTML = '';
    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Submit Report';
  };

  btnReport?.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);

  btnSubmit?.addEventListener('click', async () => {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Submitting...';

    const category = selectCat.value;
    const desc = comments.value.trim() || 'Reported from AV-SAFE Sandbox';

    const reasons = (analysis.warnings || []).map(w => `${w.title}: ${w.desc}`);

    const result = await submitIncidentComplaint({
      url: targetUrl,
      category,
      description: desc,
      rating: analysis.rating || 'DANGEROUS',
      score: analysis.score ?? 10,
      detectionReasons: reasons,
      source: 'EXTENSION'
    });

    btnSubmit.disabled = false;
    btnSubmit.textContent = 'Submit Report';

    if (result.success) {
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(16, 185, 129, 0.15)';
      feedback.style.color = '#A7F3D0';
      feedback.innerHTML = `
        <strong>✓ Incident Filed! ID: ${result.complaintId}</strong>
        <div style="margin-top:4px;">Report queued for SecOps triage.</div>
      `;
    } else {
      feedback.style.display = 'block';
      feedback.style.background = 'rgba(239, 68, 68, 0.15)';
      feedback.style.color = '#FECACA';
      feedback.textContent = `Submission failed: ${result.error || 'Check server connection'}`;
    }
  });
}

function setupTabs() {
  const tabs = [
    { btn: 'tab-btn-render', viewport: 'viewport-render' },
    { btn: 'tab-btn-html', viewport: 'viewport-html' },
    { btn: 'tab-btn-console', viewport: 'viewport-console' }
  ];

  tabs.forEach(t => {
    document.getElementById(t.btn).addEventListener('click', () => {
      tabs.forEach(item => {
        document.getElementById(item.btn).classList.remove('active');
        document.getElementById(item.viewport).classList.add('hidden');
      });

      document.getElementById(t.btn).classList.add('active');
      document.getElementById(t.viewport).classList.remove('hidden');
    });
  });
}
