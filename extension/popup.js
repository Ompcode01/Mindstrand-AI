/**
 * MindShield AI — Ultra-Optimized Popup UI Script
 * Optimizations: Reflow avoidance, requestAnimationFrame polling
 */

let lastSec = -1;
let lastWidth = "";
let lastClass = "";

function refreshStatus() {
  chrome.runtime.sendMessage({ type: "GET_CURRENT_STATE" }, (response) => {
    if (chrome.runtime.lastError || !response) return;

    const statusLabel = document.getElementById("status-label");
    const statusValue = document.getElementById("status-value");
    const progressFill = document.getElementById("progress-fill");
    const statusBadge = document.getElementById("status-badge");

    if (response.isLocked && response.cooldownStartMs) {
      const elapsedSec = (Date.now() - response.cooldownStartMs) / 1000;
      const remainingSec = Math.max(0, Math.ceil(response.durationSec - elapsedSec));

      if (remainingSec !== lastSec) {
        lastSec = remainingSec;
        statusLabel.textContent = "Mandatory Cooldown Remaining";
        statusValue.textContent = `${remainingSec}s`;
        if (lastClass !== "value locked") {
          lastClass = "value locked";
          statusValue.className = "value locked";
        }
        if (lastWidth !== "100%") {
          lastWidth = "100%";
          progressFill.style.width = "100%";
          progressFill.style.background = "#ef4444";
        }
        statusBadge.textContent = "🛑 Conscious Pause Active";
        statusBadge.style.background = "rgba(239, 68, 68, 0.15)";
        statusBadge.style.color = "#f87171";
      }
    } else {
      const acc = response.accumulatedSec;
      if (acc !== lastSec) {
        lastSec = acc;
        statusLabel.textContent = "Accumulated Focus Time";
        statusValue.textContent = `${acc}s / ${response.blockThresholdSec}s`;
        if (lastClass !== "value") {
          lastClass = "value";
          statusValue.className = "value";
        }
        
        const pct = Math.min(100, Math.round((acc / response.blockThresholdSec) * 100));
        const widthStr = `${pct}%`;
        if (lastWidth !== widthStr) {
          lastWidth = widthStr;
          progressFill.style.width = widthStr;
          progressFill.style.background = pct > 75 ? "#f59e0b" : "#10b981";
        }
        statusBadge.textContent = "● Protecting Focus";
        statusBadge.style.background = "rgba(16, 185, 129, 0.15)";
        statusBadge.style.color = "#34d399";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  refreshStatus();
  setInterval(refreshStatus, 250);
});
