/**
 * MindShield AI — Ultra-Optimized Production Content Script (Manifest V3)
 * Optimizations: requestAnimationFrame Loop, DocumentFragment Lazy Mount, Passive Listeners, & Throttled Observers
 */

if (window.__mindshield_initialized) {
  console.warn("[MindShield SOC] Duplicate script injection detected. Aborting.");
} else {
  window.__mindshield_initialized = true;

  const HOST_ID = "mindshield-soc-boundary-host";
  const SVG_CIRCUMFERENCE = 471;

  const REFLECTION_QUOTES = [
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor E. Frankl" },
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Resting is not laziness, it is essential fuel for sustained focus and cognitive performance.", author: "MindShield Productivity Guide" }
  ];

  let shadowRoot = null;
  let timerDigitsEl = null;
  let progressBadgeEl = null;
  let progressRingEl = null;
  let isOverlayActive = false;
  let isLockedAttached = false;
  let rAfId = null;
  let heartbeatInterval = null;
  let domObserver = null;
  let attrObserver = null;
  let activeQuote = REFLECTION_QUOTES[0];

  let activeCooldownStartMs = null;
  let activeDurationSec = 30;

  // Cached DOM renders to prevent dirty layout thrashing
  let lastRenderedSec = -1;
  let lastRenderedOffset = -1;

  function blockInteractionHandler(e) {
    if (!isOverlayActive) return;
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (e.cancelable) e.preventDefault();
  }

  /**
   * Passive vs Non-Passive Capture Listeners
   */
  function setInteractionLock(locked) {
    if (locked === isLockedAttached) return;
    isLockedAttached = locked;

    const blockingEvents = ["click", "mousedown", "mouseup", "pointerdown", "dblclick", "contextmenu", "keydown", "keyup", "keypress", "selectstart"];
    const scrollEvents = ["wheel", "touchmove"];

    blockingEvents.forEach(evt => {
      if (locked) window.addEventListener(evt, blockInteractionHandler, { capture: true });
      else window.removeEventListener(evt, blockInteractionHandler, { capture: true });
    });

    scrollEvents.forEach(evt => {
      // Must use passive: false to allow e.preventDefault() for scroll blocking
      if (locked) window.addEventListener(evt, blockInteractionHandler, { capture: true, passive: false });
      else window.removeEventListener(evt, blockInteractionHandler, { capture: true, passive: false });
    });
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
      return location.hostname.replace(/^www\./, '').toLowerCase();
    }
  }

  async function fastEvaluateState() {
    try {
      const domain = getDomain(location.href);
      const { activeCooldowns = {} } = await chrome.storage.local.get("activeCooldowns");
      const now = Date.now();
      
      let lockedDomain = null;
      for (const d in activeCooldowns) {
        if (domain.includes(d)) { lockedDomain = d; break; }
      }

      if (lockedDomain && activeCooldowns[lockedDomain]) {
        const info = activeCooldowns[lockedDomain];
        if ((now - info.cooldownStartMs) / 1000 < info.durationSec) {
          activeCooldownStartMs = info.cooldownStartMs;
          activeDurationSec = info.durationSec;
          showAssistantOverlay();
          startAnimationLoop();
          return;
        }
      }
      hideAssistantOverlay();
      stopAnimationLoop();
    } catch (err) {
      chrome.runtime.sendMessage({ type: "GET_CURRENT_STATE", url: location.href }, (res) => {
        if (res && res.isLocked) handleStateUpdate(res);
      });
    }
  }

  function handleStateUpdate(payload) {
    if (payload.isLocked && payload.cooldownStartMs) {
      activeCooldownStartMs = payload.cooldownStartMs;
      activeDurationSec = payload.durationSec || 30;
      if (activeDurationSec - (Date.now() - activeCooldownStartMs) / 1000 > 0) {
        showAssistantOverlay();
        startAnimationLoop();
      } else {
        hideAssistantOverlay();
        stopAnimationLoop();
      }
    } else {
      hideAssistantOverlay();
      stopAnimationLoop();
    }
  }

  /**
   * 60fps requestAnimationFrame Loop (Eliminates setInterval jitter & pauses in background tabs)
   */
  function startAnimationLoop() {
    stopAnimationLoop();
    lastRenderedSec = -1;
    lastRenderedOffset = -1;

    function renderFrame() {
      if (!isOverlayActive || !activeCooldownStartMs) return;
      const now = Date.now();
      const elapsedSec = (now - activeCooldownStartMs) / 1000;
      const remainingSec = Math.max(0, Math.ceil(activeDurationSec - elapsedSec));

      if (remainingSec <= 0) {
        stopAnimationLoop();
        fastEvaluateState();
      } else {
        updateTimerUI(remainingSec, activeDurationSec, elapsedSec);
        rAfId = requestAnimationFrame(renderFrame);
      }
    }
    rAfId = requestAnimationFrame(renderFrame);

    if (!heartbeatInterval) {
      heartbeatInterval = setInterval(() => {
        if (isOverlayActive) {
          const host = document.getElementById(HOST_ID);
          if (!host || host.style.display === "none") {
            isOverlayActive = false;
            showAssistantOverlay();
          }
        }
      }, 500);
    }
  }

  function stopAnimationLoop() {
    if (rAfId) { cancelAnimationFrame(rAfId); rAfId = null; }
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
  }

  /**
   * Reflow-Free DOM Mutator (Updates only on delta changes)
   */
  function updateTimerUI(remainingSec, totalSec, exactElapsedSec) {
    if (remainingSec !== lastRenderedSec) {
      lastRenderedSec = remainingSec;
      if (timerDigitsEl) {
        const mins = Math.floor(remainingSec / 60).toString().padStart(2, '0');
        const secs = (remainingSec % 60).toString().padStart(2, '0');
        timerDigitsEl.textContent = `${mins}:${secs}`;
      }
      if (progressBadgeEl) {
        const percentage = Math.round(Math.min(1, exactElapsedSec / totalSec) * 100);
        progressBadgeEl.textContent = `${percentage}% Completed`;
      }
    }

    const progressRatio = Math.max(0, Math.min(1, exactElapsedSec / totalSec));
    const offset = Math.round(SVG_CIRCUMFERENCE * (1 - progressRatio));
    if (offset !== lastRenderedOffset && progressRingEl) {
      lastRenderedOffset = offset;
      progressRingEl.style.strokeDashoffset = offset.toString();
    }
  }

  function getSiteMetadata() {
    const hostname = location.hostname.replace(/^www\./, '');
    const siteName = hostname.charAt(0).toUpperCase() + hostname.slice(1);
    const faviconEl = document.querySelector('link[rel*="icon"]');
    const faviconUrl = faviconEl ? faviconEl.href : `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    return { siteName, faviconUrl };
  }

  /**
   * Lazy Initialization & DocumentFragment Assembly
   */
  function showAssistantOverlay() {
    if (!document.documentElement) return;
    if (!isOverlayActive) activeQuote = REFLECTION_QUOTES[Math.floor(Math.random() * REFLECTION_QUOTES.length)];
    
    isOverlayActive = true;
    setInteractionLock(true);
    
    let host = document.getElementById(HOST_ID);
    if (!host) {
      try {
        host = document.createElement("div");
        host.id = HOST_ID;
        
        shadowRoot = host.attachShadow({ mode: "closed" });
        
        // Assemble via DocumentFragment for a single atomic repaint
        const frag = document.createDocumentFragment();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("content.css");
        frag.appendChild(link);
        
        const { siteName, faviconUrl } = getSiteMetadata();
        const backdrop = document.createElement("div");
        backdrop.className = "mindshield-backdrop";
        backdrop.innerHTML = `
          <div class="assistant-card">
            <div class="companion-badge">
              <img src="${faviconUrl}" class="site-favicon" alt="icon" onerror="this.style.display='none'"/>
              <span>${siteName}</span>
              <span class="badge-divider"></span>
              <span class="companion-tag">Conscious Pause</span>
            </div>
            
            <h1>Mindful Reset in Progress</h1>
            <p class="subtitle">
              Your productivity engine requested a gentle 30-second pause to recalibrate cognitive focus and dopamine balance before continuing.
            </p>
            
            <div class="progress-container">
              <svg class="progress-svg" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle class="progress-track" cx="90" cy="90" r="75"></circle>
                <circle class="progress-ring" id="progress-ring" cx="90" cy="90" r="75"></circle>
              </svg>
              
              <div class="timer-content">
                <div class="timer-digits" id="timer-digits">00:30</div>
                <div class="progress-badge" id="progress-badge">0% Completed</div>
              </div>
            </div>
            
            <div class="quote-card">
              <div class="quote-icon">✨</div>
              <div class="quote-body">
                <div class="quote-text">“${activeQuote.text}”</div>
                <div class="quote-author">— ${activeQuote.author}</div>
              </div>
            </div>
          </div>
        `;
        frag.appendChild(backdrop);
        shadowRoot.appendChild(frag);
        document.documentElement.appendChild(host);
        
        timerDigitsEl = shadowRoot.getElementById("timer-digits");
        progressBadgeEl = shadowRoot.getElementById("progress-badge");
        progressRingEl = shadowRoot.getElementById("progress-ring");
        setupAttributeObserver(host);
      } catch (err) {
        console.error("[MindShield DOM Error]", err);
      }
    } else {
      host.style.setProperty("display", "block", "important");
      if (shadowRoot) {
        const backdrop = shadowRoot.querySelector(".mindshield-backdrop");
        if (backdrop) backdrop.classList.remove("fade-out");
      }
    }
    
    host.style.setProperty("display", "block", "important");
    document.documentElement.style.setProperty("overflow", "hidden", "important");
    document.body?.style.setProperty("overflow", "hidden", "important");
  }

  function hideAssistantOverlay() {
    if (!isOverlayActive) return;
    const host = document.getElementById(HOST_ID);
    if (host && shadowRoot) {
      const backdrop = shadowRoot.querySelector(".mindshield-backdrop");
      if (backdrop) {
        backdrop.classList.add("fade-out");
        setTimeout(() => {
          if (!isOverlayActive) {
            host.style.setProperty("display", "none", "important");
            finalizeRestore();
          }
        }, 500);
        return;
      }
    }
    finalizeRestore();
  }

  function finalizeRestore() {
    isOverlayActive = false;
    setInteractionLock(false);
    document.documentElement.style.removeProperty("overflow");
    document.body?.style.removeProperty("overflow");
  }

  /**
   * Throttled MutationObservers (Max 1 evaluation per 100ms)
   */
  let observerThrottle = false;
  function setupAntiTamperObserver() {
    if (domObserver) return;
    domObserver = new MutationObserver((mutations) => {
      if (!isOverlayActive || observerThrottle) return;
      for (const mutation of mutations) {
        for (const removed of mutation.removedNodes) {
          if (removed.id === HOST_ID) {
            observerThrottle = true;
            setTimeout(() => { observerThrottle = false; }, 100);
            isOverlayActive = false;
            showAssistantOverlay();
            return;
          }
        }
      }
    });
    if (document.documentElement) {
      domObserver.observe(document.documentElement, { childList: true, subtree: false });
    }
  }

  function setupAttributeObserver(hostEl) {
    if (attrObserver) attrObserver.disconnect();
    attrObserver = new MutationObserver((mutations) => {
      if (!isOverlayActive) return;
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          if (hostEl.style.display === "none" || hostEl.style.visibility === "hidden") {
            hostEl.style.setProperty("display", "block", "important");
            hostEl.style.setProperty("visibility", "visible", "important");
          }
        }
      }
    });
    attrObserver.observe(hostEl, { attributes: true });
  }

  function patchSPARouting() {
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    history.pushState = function(...args) { originalPush.apply(this, args); fastEvaluateState(); };
    history.replaceState = function(...args) { originalReplace.apply(this, args); fastEvaluateState(); };
    window.addEventListener("popstate", fastEvaluateState);
  }

  window.addEventListener("pagehide", stopAnimationLoop, { passive: true });
  window.addEventListener("beforeunload", stopAnimationLoop, { passive: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) fastEvaluateState(); }, { passive: true });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "MINDSHIELD_STATE_UPDATE") handleStateUpdate(message.payload);
  });

  fastEvaluateState();
  patchSPARouting();
  setupAntiTamperObserver();
}
