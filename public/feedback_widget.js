/**
 * Autonomous Feedback Collector Widget (Client-Side)
 * Auto-captures: Feedback text, user email, current route, browser specs, viewport, and client-side console errors.
 */

(function () {
  // 1. Silent Console & Exception Logger
  const capturedErrors = [];
  const MAX_ERRORS = 10;

  window.addEventListener('error', function (event) {
    capturedErrors.push({
      type: 'uncaught_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error ? event.error.stack : null,
      time: new Date().toISOString()
    });
    if (capturedErrors.length > MAX_ERRORS) capturedErrors.shift();
  });

  const originalConsoleError = console.error;
  console.error = function (...args) {
    capturedErrors.push({
      type: 'console_error',
      message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
      time: new Date().toISOString()
    });
    if (capturedErrors.length > MAX_ERRORS) capturedErrors.shift();
    originalConsoleError.apply(console, args);
  };

  // 2. Configuration (Replace with your Google Apps Script Web App URL)
  window.FEEDBACK_CONFIG = window.FEEDBACK_CONFIG || {
    webhookUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
  };

  // 3. Inject CSS Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .feedback-btn-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .feedback-btn-trigger:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
    }
    .feedback-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(3px);
      z-index: 1000000;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .feedback-modal-overlay.active {
      display: flex;
    }
    .feedback-card {
      background: #ffffff;
      border-radius: 14px;
      width: 90%;
      max-width: 460px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      animation: fbModalFadeIn 0.2s ease-out;
    }
    @keyframes fbModalFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .feedback-header h3 {
      margin: 0;
      font-size: 18px;
      color: #0f172a;
    }
    .feedback-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #64748b;
    }
    .feedback-type-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
    }
    .feedback-tab-btn {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      font-weight: 500;
      color: #334155;
      text-align: center;
      transition: all 0.15s;
    }
    .feedback-tab-btn.active {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1d4ed8;
      font-weight: 600;
    }
    .feedback-textarea {
      width: 100%;
      box-sizing: border-box;
      height: 100px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      margin-bottom: 12px;
      outline: none;
    }
    .feedback-textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .feedback-input-email {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 13px;
      margin-bottom: 12px;
      outline: none;
    }
    .feedback-metadata-badge {
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .feedback-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .feedback-submit-btn {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .feedback-submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .feedback-alert-success {
      display: none;
      padding: 12px;
      background: #dcfce7;
      color: #15803d;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);

  // 4. Render Widget DOM
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button class="feedback-btn-trigger" id="fbTriggerBtn">
      <span>💬</span> Feedback
    </button>

    <div class="feedback-modal-overlay" id="fbModalOverlay">
      <div class="feedback-card">
        <div class="feedback-header">
          <h3>Send Feedback to Dev Team</h3>
          <button class="feedback-close" id="fbCloseBtn">&times;</button>
        </div>

        <div id="fbFormContainer">
          <div class="feedback-type-tabs">
            <button class="feedback-tab-btn active" data-type="Bug">🐞 Bug</button>
            <button class="feedback-tab-btn" data-type="Feature">💡 Feature</button>
            <button class="feedback-tab-btn" data-type="General">💬 General</button>
          </div>

          <textarea class="feedback-textarea" id="fbMessage" placeholder="Describe the issue or feature request in detail..."></textarea>
          <input type="email" class="feedback-input-email" id="fbEmail" placeholder="Your email (optional, for update notifications)" />

          <div class="feedback-metadata-badge">
            <span id="fbMetaInfo">Auto-attaching: URL, Device</span>
            <span id="fbConsoleBadge" style="color: #ea580c; font-weight: 600;"></span>
          </div>

          <div class="feedback-actions">
            <button class="feedback-submit-btn" id="fbSubmitBtn">Send to Team</button>
          </div>
        </div>

        <div class="feedback-alert-success" id="fbSuccessMsg">
          🎉 Thank you! Our AI agents are reviewing your feedback right now.
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 5. DOM Elements & State
  let selectedType = "Bug";
  const triggerBtn = document.getElementById('fbTriggerBtn');
  const overlay = document.getElementById('fbModalOverlay');
  const closeBtn = document.getElementById('fbCloseBtn');
  const submitBtn = document.getElementById('fbSubmitBtn');
  const messageInput = document.getElementById('fbMessage');
  const emailInput = document.getElementById('fbEmail');
  const tabBtns = document.querySelectorAll('.feedback-tab-btn');
  const consoleBadge = document.getElementById('fbConsoleBadge');
  const formContainer = document.getElementById('fbFormContainer');
  const successMsg = document.getElementById('fbSuccessMsg');

  // Toggle Modal
  triggerBtn.addEventListener('click', () => {
    overlay.classList.add('active');
    if (capturedErrors.length > 0) {
      consoleBadge.textContent = `⚠️ ${capturedErrors.length} errors captured`;
    } else {
      consoleBadge.textContent = ``;
    }
  });

  const closeModal = () => {
    overlay.classList.remove('active');
    formContainer.style.display = 'block';
    successMsg.style.display = 'none';
    messageInput.value = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Tab Selection
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedType = btn.getAttribute('data-type');
    });
  });

  // Submit Feedback
  submitBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) {
      alert("Please write a short description.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    const payload = {
      projectName: (window.FEEDBACK_CONFIG && window.FEEDBACK_CONFIG.projectName) || document.title || "Web App",
      type: selectedType,
      message: text,
      email: emailInput.value.trim() || "Anonymous",
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent,
      consoleErrors: capturedErrors
    };

    try {
      // Use text/plain or no-cors for seamless Google Apps Script webhook calls
      await fetch(window.FEEDBACK_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Feedback network request sent (no-cors mode):", err);
    }

    formContainer.style.display = 'none';
    successMsg.style.display = 'block';

    setTimeout(() => {
      closeModal();
      submitBtn.disabled = false;
      submitBtn.textContent = "Send to Team";
    }, 2200);
  });
})();
