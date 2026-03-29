// report-modal.js
// Include this script on any page to enable the report modal.
// Usage: window.openReportModal({ type, targetId, targetLabel })

(function () {
    const REASONS = [
        { value: 'spam',          label: 'Spam or self-promotion' },
        { value: 'harassment',    label: 'Harassment or bullying' },
        { value: 'inappropriate', label: 'Inappropriate content' },
        { value: 'scam',          label: 'Scam or fraud' },
        { value: 'hate_speech',   label: 'Hate speech' },
        { value: 'other',         label: 'Other' },
    ];

    function injectStyles() {
        if (document.getElementById('report-modal-styles')) return;
        const s = document.createElement('style');
        s.id = 'report-modal-styles';
        s.textContent = `
            #report-modal-overlay {
                position: fixed; inset: 0; z-index: 9999;
                background: rgba(0,0,0,0.72);
                display: flex; align-items: center; justify-content: center;
                animation: rmFadeIn 0.18s ease;
            }
            @keyframes rmFadeIn { from { opacity:0 } to { opacity:1 } }
            #report-modal-box {
                background: linear-gradient(145deg, #0f1e38, #091428);
                border: 1px solid rgba(126,184,212,0.25);
                border-radius: 16px;
                padding: 2rem;
                width: 100%;
                max-width: 420px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                animation: rmSlideUp 0.2s ease;
            }
            @keyframes rmSlideUp { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }
            #report-modal-box h2 {
                margin: 0 0 0.25rem;
                font-size: 1.15rem;
                color: #e0f0ff;
                display: flex; align-items: center; gap: 0.5rem;
            }
            #report-modal-box .rm-target {
                font-size: 0.82rem;
                color: #5a7a9a;
                margin-bottom: 1.25rem;
            }
            #report-modal-box label {
                display: block;
                font-size: 0.82rem;
                color: #7eb8d4;
                margin-bottom: 0.35rem;
                font-weight: 600;
            }
            #report-modal-box select,
            #report-modal-box textarea {
                width: 100%;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(126,184,212,0.22);
                border-radius: 10px;
                color: #c0d8ec;
                font-family: 'Exo 2', sans-serif;
                font-size: 0.88rem;
                padding: 0.6rem 0.75rem;
                margin-bottom: 1rem;
                box-sizing: border-box;
                outline: none;
                transition: border-color 0.2s;
            }
            #report-modal-box select:focus,
            #report-modal-box textarea:focus { border-color: rgba(126,184,212,0.55); }
            #report-modal-box textarea { resize: vertical; min-height: 80px; }
            #report-modal-box .rm-actions {
                display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;
            }
            #report-modal-box .rm-cancel {
                background: rgba(126,184,212,0.08);
                border: 1px solid rgba(126,184,212,0.2);
                color: #7eb8d4;
                border-radius: 10px;
                padding: 0.55rem 1.25rem;
                cursor: pointer;
                font-size: 0.88rem;
                font-weight: 600;
                transition: all 0.2s;
            }
            #report-modal-box .rm-cancel:hover { background: rgba(126,184,212,0.16); }
            #report-modal-box .rm-submit {
                background: rgba(180,50,50,0.35);
                border: 1px solid rgba(220,80,80,0.4);
                color: #ee9090;
                border-radius: 10px;
                padding: 0.55rem 1.25rem;
                cursor: pointer;
                font-size: 0.88rem;
                font-weight: 700;
                transition: all 0.2s;
            }
            #report-modal-box .rm-submit:hover { background: rgba(180,50,50,0.55); border-color: rgba(220,80,80,0.65); color: #ffbbbb; }
            #report-modal-box .rm-submit:disabled { opacity:0.45; cursor:not-allowed; }
            #report-modal-box .rm-msg {
                font-size: 0.83rem;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                margin-bottom: 0.75rem;
            }
            #report-modal-box .rm-msg.success { background: rgba(40,140,80,0.2); border: 1px solid rgba(80,200,120,0.3); color: #80e0a0; }
            #report-modal-box .rm-msg.error   { background: rgba(140,40,40,0.2); border: 1px solid rgba(200,80,80,0.3); color: #ee8080; }
        `;
        document.head.appendChild(s);
    }

    function removeModal() {
        const el = document.getElementById('report-modal-overlay');
        if (el) el.remove();
    }

    window.openReportModal = function ({ type, targetId, targetLabel }) {
        injectStyles();
        removeModal();

        const overlay = document.createElement('div');
        overlay.id = 'report-modal-overlay';
        overlay.innerHTML = `
            <div id="report-modal-box">
                <h2><i class="fas fa-flag" style="color:#ee6060;"></i> Report</h2>
                <div class="rm-target">Reporting: <strong style="color:#a0c8e0;">${targetLabel || targetId}</strong></div>
                <div id="rm-msg-area"></div>
                <label for="rm-reason">Reason</label>
                <select id="rm-reason">
                    ${REASONS.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
                </select>
                <label for="rm-details">Additional details <span style="color:#3a5070;font-weight:400;">(optional)</span></label>
                <textarea id="rm-details" placeholder="Describe the issue..." maxlength="500"></textarea>
                <div class="rm-actions">
                    <button class="rm-cancel" id="rm-cancel-btn">Cancel</button>
                    <button class="rm-submit" id="rm-submit-btn"><i class="fas fa-flag"></i> Submit Report</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) removeModal();
        });
        document.getElementById('rm-cancel-btn').addEventListener('click', removeModal);

        document.getElementById('rm-submit-btn').addEventListener('click', async function () {
            const btn = this;
            const reason = document.getElementById('rm-reason').value;
            const details = document.getElementById('rm-details').value.trim();
            const msgArea = document.getElementById('rm-msg-area');

            btn.disabled = true;
            btn.textContent = 'Submitting…';
            msgArea.innerHTML = '';

            try {
                const res = await fetch('/api/submit-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, targetId, reason, details }),
                    credentials: 'same-origin',
                });
                const data = await res.json();
                if (data.success) {
                    msgArea.innerHTML = `<div class="rm-msg success"><i class="fas fa-check-circle"></i> Report submitted. Thank you.</div>`;
                    setTimeout(removeModal, 1600);
                } else {
                    msgArea.innerHTML = `<div class="rm-msg error"><i class="fas fa-exclamation-circle"></i> ${data.error || 'Failed to submit report.'}</div>`;
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-flag"></i> Submit Report';
                }
            } catch {
                msgArea.innerHTML = `<div class="rm-msg error">Network error. Please try again.</div>`;
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-flag"></i> Submit Report';
            }
        });
    };
})();
