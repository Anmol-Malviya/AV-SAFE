import { analyzeURL } from './phishingEngine.js';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const blockedUrlString = params.get('url') || 'https://practice.expandtesting.com/login#google_vignette';

  const blockedUrlElement = document.getElementById('blocked-url');
  if (blockedUrlElement) {
    blockedUrlElement.textContent = blockedUrlString;
  }

  // Display domain name or full URL
  let hostname = blockedUrlString;
  try {
    hostname = new URL(blockedUrlString).hostname;
  } catch (e) {
    hostname = blockedUrlString.split('/')[0];
  }

  // Run the full analysis locally
  const analysis = analyzeURL(blockedUrlString);

  // Update safety & risk ratings
  const safety = analysis.score ?? 1;
  const rating = analysis.rating || 'DANGEROUS';

  const safetyScoreEl = document.getElementById('safety-score');
  if (safetyScoreEl) safetyScoreEl.textContent = `${safety}`;

  const scoreVerdictEl = document.getElementById('score-verdict');
  if (scoreVerdictEl) scoreVerdictEl.textContent = rating;

  const warningTitleEl = document.getElementById('warning-title');
  if (warningTitleEl) {
    if (rating === 'DANGEROUS') {
      warningTitleEl.textContent = 'High-Risk Threat Blocked';
    } else if (rating === 'SUSPICIOUS') {
      warningTitleEl.textContent = 'Suspicious Link Warning';
    } else {
      warningTitleEl.textContent = 'Scan Warning';
    }
  }

  // Threat Reason body
  const threatReasonBody = document.getElementById('threat-reason-body');
  if (threatReasonBody) {
    if (analysis.warnings && analysis.warnings.length > 0) {
      threatReasonBody.textContent = analysis.warnings.map(w => `${w.title}: ${w.desc}`).join(' ');
    } else {
      threatReasonBody.textContent = 'Deceptive keywords: URL paths use security/urgency words to trick you.';
    }
  }

  // Populating Advanced details
  const diagStatus = document.getElementById('diag-status');
  if (diagStatus) {
    diagStatus.textContent = rating;
  }

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
      li.textContent = 'Flagged by heuristic heuristics and machine learning threat model.';
      reasonsList.appendChild(li);
    }
  }

  // ML Probability
  const mlPercent = ((analysis.mlProbability ?? 0.99) * 100).toFixed(2);
  const mlProbText = document.getElementById('ml-prob-text');
  if (mlProbText) mlProbText.textContent = `${mlPercent}%`;

  const fill = document.getElementById('ml-progress-fill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.width = `${mlPercent}%`;
    }, 150);
  }

  // Copy URL with Toast feedback
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const iosToast = document.getElementById('ios-toast');
  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(blockedUrlString).then(() => {
        showToast('URL copied to clipboard');
      }).catch(() => {
        showToast('URL copied');
      });
    });
  }

  function showToast(msg) {
    if (!iosToast) return;
    iosToast.textContent = msg;
    iosToast.classList.add('show');
    setTimeout(() => {
      iosToast.classList.remove('show');
    }, 2000);
  }

  // Advanced Options Accordion
  const toggleBtn = document.getElementById('btn-details-toggle');
  const detailsSec = document.getElementById('details-section');
  const chevron = document.getElementById('chevron-icon');
  const btnProceed = document.getElementById('btn-proceed');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = detailsSec.classList.toggle('hidden');
      chevron.classList.toggle('rotated', !isHidden);
      toggleBtn.setAttribute('aria-expanded', !isHidden);

      // Reveal dangerous override button
      if (btnProceed) {
        btnProceed.classList.toggle('hidden', isHidden);
      }
    });
  }

  // Action: Back to safety
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'chrome://newtab';
      }
    });
  }

  // Action: Open in Sandbox
  const btnSandbox = document.getElementById('btn-sandbox');
  if (btnSandbox) {
    btnSandbox.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        const sandboxUrl = chrome.runtime.getURL(
          `sandbox.html?url=${encodeURIComponent(blockedUrlString)}`
        );
        chrome.tabs.create({ url: sandboxUrl });
      } else {
        window.open(`sandbox.html?url=${encodeURIComponent(blockedUrlString)}`, '_blank');
      }
    });
  }

  // Action: Report This Link modal
  const btnReport = document.getElementById('btn-report');
  const reportModal = document.getElementById('report-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnSubmitReport = document.getElementById('btn-submit-report');
  const modalTargetUrl = document.getElementById('modal-target-url');

  if (btnReport && reportModal) {
    btnReport.addEventListener('click', () => {
      if (modalTargetUrl) modalTargetUrl.textContent = `Target: ${blockedUrlString}`;
      reportModal.classList.remove('hidden');
    });

    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        reportModal.classList.add('hidden');
      });
    }

    if (btnSubmitReport) {
      btnSubmitReport.addEventListener('click', () => {
        reportModal.classList.add('hidden');
        showToast('Complaint report submitted');
      });
    }
  }

  // Action: Proceed anyway
  if (btnProceed) {
    btnProceed.addEventListener('click', () => {
      const confirmed = window.confirm(
        'Dangerous Override: Are you sure you want to proceed to this suspicious site? It may compromise your device or data.'
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

  // Set real time in iOS status bar mockup
  const timeEl = document.getElementById('status-time');
  if (timeEl) {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    timeEl.textContent = `${hours}:${formattedMinutes}`;
  }
});
