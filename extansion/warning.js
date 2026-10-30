import { analyzeURL } from './phishingEngine.js';
import { submitIncidentComplaint, getDashboardUrl } from './apiClient.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const blockedUrlString = params.get('url') || 'https://practice.expandtesting.com/login#google_vignette';

  const blockedUrlElement = document.getElementById('blocked-url');
  if (blockedUrlElement) {
    blockedUrlElement.textContent = blockedUrlString;
  }

  // Parse hostname
  let hostname = blockedUrlString;
  try {
    hostname = new URL(blockedUrlString).hostname;
  } catch (e) {
    hostname = blockedUrlString.split('/')[0];
  }

  // Run the full AI + Heuristic detection engine locally
  const analysis = analyzeURL(blockedUrlString);

  // Safety Score & Rating
  const safety = typeof analysis.score === 'number' ? analysis.score : (parseInt(params.get('score'), 10) || 1);
  const rating = analysis.rating || params.get('rating') || 'DANGEROUS';

  const safetyScoreEl = document.getElementById('safety-score');
  if (safetyScoreEl) safetyScoreEl.textContent = `${safety}`;

  const scoreVerdictEl = document.getElementById('score-verdict');
  if (scoreVerdictEl) {
    scoreVerdictEl.textContent = rating === 'DANGEROUS' ? 'CRITICAL THREAT' : 'SUSPICIOUS LINK';
  }

  const warningTitleEl = document.getElementById('warning-title');
  if (warningTitleEl) {
    if (rating === 'DANGEROUS') {
      warningTitleEl.textContent = 'Malicious Threat Intercepted';
    } else if (rating === 'SUSPICIOUS') {
      warningTitleEl.textContent = 'Suspicious Destination Warning';
    } else {
      warningTitleEl.textContent = 'Security Policy Warning';
    }
  }

  // Threat Diagnosis summary
  const threatReasonBody = document.getElementById('threat-reason-body');
  if (threatReasonBody) {
    if (analysis.warnings && analysis.warnings.length > 0) {
      threatReasonBody.textContent = analysis.warnings.map(w => `${w.title}: ${w.desc}`).join(' ');
    } else {
      threatReasonBody.textContent = 'Deceptive heuristics triggered: Link exhibits patterns commonly associated with phishing traps, typosquatting, or credential harvesting.';
    }
  }

  // Populate Technical Rules list
  const reasonsList = document.getElementById('reasons-list');
  if (reasonsList) {
    reasonsList.innerHTML = '';
    if (analysis.warnings && analysis.warnings.length > 0) {
      analysis.warnings.forEach(warning => {
        const li = document.createElement('li');
        li.textContent = `${warning.title} — ${warning.desc}`;
        reasonsList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'Flagged by hybrid machine learning weights classifier and security heuristic rules.';
      reasonsList.appendChild(li);
    }
  }

  // ML Threat Probability bar
  const mlProb = analysis.mlProbability ?? 0.99;
  const mlPercent = (mlProb * 100).toFixed(1);
  const mlProbText = document.getElementById('ml-prob-text');
  if (mlProbText) mlProbText.textContent = `${mlPercent}%`;

  const fill = document.getElementById('ml-progress-fill');
  if (fill) {
    setTimeout(() => {
      fill.style.width = `${Math.min(100, Math.max(10, mlPercent))}%`;
    }, 150);
  }

  // Copy URL action
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

  // Advanced Options Accordion Toggle
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

  // Action: Return to Safety
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

  // Action: Open in Safe Sandbox
  const btnSandbox = document.getElementById('btn-sandbox');
  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      const sandboxUrl = chrome.runtime.getURL(
        `sandbox.html?url=${encodeURIComponent(blockedUrlString)}`
      );
      chrome.tabs.create({ url: sandboxUrl });
    });
  }

  // Action: Open AV-SAFE Web Dashboard
  const dashboardButtons = [
    document.getElementById('btn-header-dashboard'),
    document.getElementById('btn-open-dashboard-action')
  ];

  dashboardButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async () => {
        const dashUrl = await getDashboardUrl('/system');
        chrome.tabs.create({ url: dashUrl });
      });
    }
  });

  // Action: Report Threat Modal
  setupWarningReportModal(blockedUrlString, analysis);

  // Action: Dangerous Override
  const btnProceed = document.getElementById('btn-proceed');
  if (btnProceed) {
    btnProceed.addEventListener('click', () => {
      const confirmed = window.confirm(
        'DANGEROUS OVERRIDE CONFIRMATION:\n\nAre you sure you want to proceed to this suspicious site? It was flagged as an active threat and may steal passwords or compromise your computer.'
      );
      if (!confirmed) return;

      const domainToBypass = hostname.toLowerCase();
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
    });
  }
});

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

    const reasons = (analysis.warnings || []).map(w => `${w.title}: ${w.desc}`);

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
        <strong style="color:var(--color-safe); font-size:13px;">✓ Threat Incident Registered!</strong>
        <span>Tracking Reference: <strong>${result.complaintId}</strong></span>
        <span style="font-size:10.5px; color:var(--text-secondary); margin-top:3px;">
          This threat report has been recorded in the SecOps triage queue for automated domain blacklisting.
        </span>
        <button id="btn-view-ticket" class="btn-action-primary" style="margin-top:8px; font-size:12px; padding:7px;">
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
        <strong style="color:var(--color-danger);">Submission Failed</strong>
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
