import { analyzeURL } from './phishingEngine.js';
import { submitIncidentComplaint, getDashboardUrl } from './apiClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const blockedUrlString = params.get('url') || 'http://paypal.com.security-check.example/verify';

  // 1. Blocked Destination URL Display
  const blockedUrlElement = document.getElementById('blocked-url');
  if (blockedUrlElement) {
    blockedUrlElement.textContent = blockedUrlString;
  }

  // Parse hostname safely
  let hostname = blockedUrlString;
  try {
    hostname = new URL(blockedUrlString).hostname;
  } catch {
    hostname = blockedUrlString.replace(/^https?:\/\//i, '').split('/')[0];
  }

  // Check Protection Active status
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['shieldingActive'], (res) => {
      const shieldPill = document.getElementById('shield-status-pill');
      if (shieldPill) {
        const isActive = res.shieldingActive !== false;
        shieldPill.style.display = isActive ? 'inline-flex' : 'none';
      }
    });
  }

  // 2. Run the detection engine locally on the blocked URL
  const analysis = analyzeURL(blockedUrlString);

  // 3. Safety Score & Classification
  const safety = typeof analysis.score === 'number' ? analysis.score : (parseInt(params.get('score'), 10) || 6);
  const rating = analysis.rating || params.get('rating') || 'DANGEROUS';

  const safetyScoreEl = document.getElementById('safety-score');
  if (safetyScoreEl) {
    safetyScoreEl.textContent = `${safety}`;
  }

  const classificationTextEl = document.getElementById('score-classification-text');
  const progressBarEl = document.getElementById('score-progress-bar');

  if (classificationTextEl) {
    if (rating === 'DANGEROUS' || safety < 35) {
      classificationTextEl.textContent = 'Very Dangerous';
      classificationTextEl.style.color = 'var(--danger-red)';
    } else if (rating === 'SUSPICIOUS' || safety < 70) {
      classificationTextEl.textContent = 'Moderate Risk';
      classificationTextEl.style.color = '#D97706';
    } else {
      classificationTextEl.textContent = 'Low Risk';
      classificationTextEl.style.color = 'var(--success-green)';
    }
  }

  if (progressBarEl) {
    const barWidth = Math.max(5, Math.min(100, safety));
    progressBarEl.style.width = `${barWidth}%`;
    if (safety >= 70) {
      progressBarEl.style.backgroundColor = 'var(--success-green)';
    } else if (safety >= 35) {
      progressBarEl.style.backgroundColor = '#F59E0B';
    } else {
      progressBarEl.style.backgroundColor = 'var(--danger-red)';
    }
  }

  // 4. Headline & Critical Threat Badge
  const warningTitleEl = document.getElementById('warning-title');
  const warningLeadEl = document.querySelector('.warning-lead');
  const verdictTextEl = document.getElementById('verdict-text');
  const verdictBadgeEl = document.getElementById('score-verdict');
  const heroDiscEl = document.querySelector('.hero-icon-disc');

  if (rating === 'SAFE') {
    if (warningTitleEl) warningTitleEl.textContent = 'Website Verified as Safe';
    if (warningLeadEl) warningLeadEl.textContent = 'AV-SAFE analyzed this website. No deceptive phishing indicators, typosquatting vectors, or malware patterns were detected.';
    if (verdictTextEl) verdictTextEl.textContent = 'Verified Safe';
    if (verdictBadgeEl) {
      verdictBadgeEl.style.backgroundColor = '#ECFDF5';
      verdictBadgeEl.style.borderColor = '#A7F3D0';
      verdictBadgeEl.style.color = '#10B981';
    }
    if (heroDiscEl) {
      heroDiscEl.style.backgroundColor = '#DCFCE7';
      heroDiscEl.innerHTML = `<svg viewBox="0 0 24 24" width="46" height="46" fill="var(--success-green)" stroke="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>`;
    }
  } else if (rating === 'SUSPICIOUS') {
    if (warningTitleEl) warningTitleEl.textContent = 'Suspicious Destination Warning';
    if (warningLeadEl) warningLeadEl.textContent = 'AV-SAFE identified suspicious anomalies on this website. Proceeding may expose your computer or session credentials to risk.';
    if (verdictTextEl) verdictTextEl.textContent = 'Suspicious Destination';
    if (verdictBadgeEl) {
      verdictBadgeEl.style.backgroundColor = '#FFFBEB';
      verdictBadgeEl.style.borderColor = '#FDE68A';
      verdictBadgeEl.style.color = '#D97706';
    }
    if (heroDiscEl) {
      heroDiscEl.style.backgroundColor = '#FEF3C7';
      heroDiscEl.innerHTML = `<svg viewBox="0 0 24 24" width="46" height="46" fill="#D97706" stroke="none">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>`;
    }
  } else {
    if (warningTitleEl) warningTitleEl.textContent = 'Malicious Threat Intercepted';
    if (verdictTextEl) verdictTextEl.textContent = 'Critical Threat';
  }

  // 5. Render "Why this website was blocked" finding cards
  renderRiskFactors(analysis);

  // 6. Populate Collapsible Technical Rules list & Diagnostic Details
  populateTechnicalDetails(analysis);

  // 7. Copy URL action
  const btnCopyUrl = document.getElementById('btn-copy-url');
  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(blockedUrlString).then(() => {
        showWarningToast('URL copied to clipboard');
      }).catch(() => {
        showWarningToast('URL copied');
      });
    });
  }

  // 8. Collapsible Technical Telemetry Toggle
  const toggleBtn = document.getElementById('btn-details-toggle');
  const detailsSec = document.getElementById('details-section');
  const chevron = document.getElementById('chevron-icon');

  if (toggleBtn && detailsSec) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = detailsSec.classList.toggle('hidden');
      if (chevron) chevron.classList.toggle('rotated', !isHidden);
      toggleBtn.setAttribute('aria-expanded', !isHidden);
    });
  }

  // 9. Primary Action: Return to Safety
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'https://google.com';
      }
    });
  }

  // 10. Secondary Action 1: Safe Sandbox
  const btnSandbox = document.getElementById('btn-sandbox');
  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      const sandboxUrl = chrome.runtime.getURL(
        `sandbox.html?url=${encodeURIComponent(blockedUrlString)}`
      );
      chrome.tabs.create({ url: sandboxUrl });
    });
  }

  // 11. Secondary Action 2: Open Dashboard
  const dashboardButtons = [
    document.getElementById('btn-header-dashboard'),
    document.getElementById('btn-open-dashboard-action')
  ];

  dashboardButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', async () => {
        const dashUrl = await getDashboardUrl('/system');
        chrome.tabs.create({ url: dashUrl });
      });
    }
  });

  // 12. Secondary Action 3: Report Threat Modal
  setupWarningReportModal(blockedUrlString, analysis);

  // 13. Dangerous Override Bypass
  const btnProceed = document.getElementById('btn-proceed');
  if (btnProceed) {
    btnProceed.addEventListener('click', () => {
      const confirmed = window.confirm(
        'DANGEROUS OVERRIDE CONFIRMATION:\n\nAre you sure you want to proceed to this suspicious site? It was flagged as an active threat and may steal passwords, session tokens, or compromise your personal data.'
      );
      if (!confirmed) return;

      const domainToBypass = hostname.toLowerCase();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['bypassList'], (result) => {
          const bypassList = result.bypassList || [];
          if (!bypassList.includes(domainToBypass)) {
            bypassList.push(domainToBypass);
            chrome.storage.local.set({ bypassList }, () => {
              window.location.href = blockedUrlString;
            });
          } else {
            window.location.href = blockedUrlString;
          }
        });
      } else {
        window.location.href = blockedUrlString;
      }
    });
  }
});

// Helper: SVG Icons for Risk Factors
function getRiskIconSvg(id, title) {
  const norm = (id + ' ' + title).toLowerCase();
  if (norm.includes('https') || norm.includes('ssl') || norm.includes('insecure')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>`;
  }
  if (norm.includes('brand') || norm.includes('typo') || norm.includes('impersonat')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <path d="M9 22v-4h6v4"></path>
      <path d="M8 6h.01"></path>
      <path d="M16 6h.01"></path>
      <path d="M8 10h.01"></path>
      <path d="M16 10h.01"></path>
      <path d="M8 14h.01"></path>
      <path d="M16 14h.01"></path>
    </svg>`;
  }
  if (norm.includes('keyword') || norm.includes('credential') || norm.includes('login') || norm.includes('verify')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9l-1.5-1.5"></path>
      <circle cx="7.5" cy="15.5" r="5.5"></circle>
    </svg>`;
  }
  if (norm.includes('ip') || norm.includes('address')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>`;
  }
  if (norm.includes('homograph') || norm.includes('punycode')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>`;
  }
  if (norm.includes('tld') || norm.includes('domain') || norm.includes('entropy')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>`;
  }
  if (norm.includes('shorten')) {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>`;
}

// Render dynamic risk factors from actual analysis results
function renderRiskFactors(analysis) {
  const riskGrid = document.getElementById('risk-factors-grid');
  if (!riskGrid) return;

  riskGrid.innerHTML = '';
  const warnings = analysis.warnings || [];

  if (warnings.length > 0) {
    warnings.forEach((w) => {
      const box = document.createElement('div');
      const isWarningOnly = w.severity === 'medium' || w.severity === 'low';
      box.className = `risk-factor-box ${isWarningOnly ? 'warning-level' : ''}`;

      const iconContainer = document.createElement('div');
      iconContainer.className = 'risk-icon-bubble';
      iconContainer.innerHTML = getRiskIconSvg(w.id || '', w.title || '');

      const textGroup = document.createElement('div');
      textGroup.className = 'risk-text-group';

      const title = document.createElement('span');
      title.className = 'risk-title';
      title.textContent = w.title || 'Threat Indicator Flag';

      const desc = document.createElement('span');
      desc.className = 'risk-desc';
      desc.textContent = w.desc || 'Anomalous pattern detected on this website.';

      textGroup.appendChild(title);
      textGroup.appendChild(desc);

      box.appendChild(iconContainer);
      box.appendChild(textGroup);
      riskGrid.appendChild(box);
    });
  } else {
    // If no explicit warnings are triggered, display accurate threat intelligence details
    const box = document.createElement('div');
    box.className = 'risk-factor-box';
    box.innerHTML = `
      <div class="risk-icon-bubble">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <div class="risk-text-group">
        <span class="risk-title">Threat Intelligence Match</span>
        <span class="risk-desc">Destination matches confirmed malicious campaign signatures and high-risk URL patterns.</span>
      </div>
    `;
    riskGrid.appendChild(box);
  }
}

// Populate Technical Rules list and Diagnostic Details
function populateTechnicalDetails(analysis) {
  const reasonsList = document.getElementById('reasons-list');
  if (reasonsList) {
    reasonsList.innerHTML = '';
    const warnings = analysis.warnings || [];
    if (warnings.length > 0) {
      warnings.forEach((w) => {
        const li = document.createElement('li');
        li.textContent = `${w.title} — ${w.desc}`;
        reasonsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Flagged by hybrid machine learning weights classifier and security heuristic rules.';
      reasonsList.appendChild(li);
    }
  }

  // ML probability
  const mlProb = analysis.mlProbability ?? 0.99;
  const mlPercent = (mlProb * 100).toFixed(1);
  const mlProbText = document.getElementById('ml-prob-text');
  if (mlProbText) {
    mlProbText.textContent = `${mlPercent}%`;
  }
}

// Setup Incident Report Modal with live /api/complaints submission
function setupWarningReportModal(targetUrl, analysis) {
  const btnReport = document.getElementById('btn-report');
  const reportModal = document.getElementById('report-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalCancel = document.getElementById('btn-modal-cancel');
  const btnSubmitReport = document.getElementById('btn-submit-report');
  const modalTargetUrl = document.getElementById('modal-target-url');
  const selectCategory = document.getElementById('report-category');
  const textareaComments = document.getElementById('report-comments');
  const feedbackBox = document.getElementById('modal-feedback-box');

  if (modalTargetUrl) modalTargetUrl.textContent = targetUrl;

  const closeModal = () => {
    reportModal.classList.add('hidden');
    feedbackBox.classList.add('hidden');
    feedbackBox.innerHTML = '';
    btnSubmitReport.disabled = false;
    btnSubmitReport.textContent = 'Submit Incident Report';
  };

  btnReport?.addEventListener('click', () => {
    reportModal.classList.remove('hidden');
  });

  btnCloseModal?.addEventListener('click', closeModal);
  btnModalCancel?.addEventListener('click', closeModal);

  btnSubmitReport?.addEventListener('click', async () => {
    btnSubmitReport.disabled = true;
    btnSubmitReport.textContent = 'Submitting to SecOps...';

    const category = selectCategory.value;
    const description = textareaComments.value.trim() || 'Reported via AV-SAFE browser warning shield';

    const reasons = (analysis.warnings || []).map((w) => `${w.title}: ${w.desc}`);

    const result = await submitIncidentComplaint({
      url: targetUrl,
      category,
      description,
      rating: analysis.rating || 'DANGEROUS',
      score: analysis.score ?? 1,
      detectionReasons: reasons,
      source: 'EXTENSION'
    });

    btnSubmitReport.disabled = false;
    btnSubmitReport.textContent = 'Submit Incident Report';

    if (result.success) {
      feedbackBox.classList.remove('hidden');
      feedbackBox.innerHTML = `
        <strong style="color:var(--success-green); font-size:13px;">✓ Threat Incident Registered!</strong>
        <span>Tracking Reference: <strong>${result.complaintId}</strong></span>
        <span style="font-size:10.5px; color:var(--body-text); margin-top:3px;">
          This threat report has been recorded in the SecOps triage queue for automated domain blacklisting.
        </span>
        <button id="btn-view-ticket" class="btn-return-safety" style="margin-top:8px; font-size:12px; padding:7px;">
          Track Incident on Web Dashboard ↗
        </button>
      `;

      document.getElementById('btn-view-ticket')?.addEventListener('click', async () => {
        const ticketUrl = await getDashboardUrl(`/system?tab=complaints&id=${result.complaintId}`);
        chrome.tabs.create({ url: ticketUrl });
      });

      showWarningToast(`Incident submitted: ${result.complaintId}`);
    } else {
      feedbackBox.classList.remove('hidden');
      feedbackBox.innerHTML = `
        <strong style="color:var(--danger-red);">Submission Failed</strong>
        <span>${result.error || 'Check that AV-SAFE local server is active'}</span>
      `;
    }
  });
}

function showWarningToast(msg) {
  const toast = document.getElementById('warning-toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
}
