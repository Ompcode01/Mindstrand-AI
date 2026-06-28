/**
 * MindShield AI — Ultra-Optimized Production Background Worker (Manifest V3)
 * Optimizations: In-Memory Storage Caching, Debounced Write Batching, & Atomic Mutex
 */

const DEFAULT_CONFIG = {
  blockedDomains: ["poki.com", "roblox.com"],
  blockThresholdSec: 60,
  cooldownDurationSec: 30
};

// In-Memory Storage Cache to eliminate disk I/O latency on rapid tab events
let memCache = {
  config: null,
  activeCooldowns: null,
  domainAccumulators: null
};

let cacheInitialized = false;
let mutexPromise = Promise.resolve();

function runAtomicTransaction(fn) {
  const result = mutexPromise.then(() => fn()).catch(e => console.error("[MindShield Mutex Error]", e));
  mutexPromise = result.then(() => {});
  return result;
}

/**
 * Lazy Initialization of In-Memory Storage Cache
 */
async function ensureCache() {
  if (cacheInitialized) return;
  const data = await chrome.storage.local.get(["config", "activeCooldowns", "domainAccumulators"]);
  memCache.config = data.config || DEFAULT_CONFIG;
  memCache.activeCooldowns = data.activeCooldowns || {};
  memCache.domainAccumulators = data.domainAccumulators || {};
  if (!data.config) await chrome.storage.local.set({ config: DEFAULT_CONFIG });
  cacheInitialized = true;
}

// Keep cache synchronized across external storage mutations
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if (changes.config) memCache.config = changes.config.newValue;
    if (changes.activeCooldowns) memCache.activeCooldowns = changes.activeCooldowns.newValue;
    if (changes.domainAccumulators) memCache.domainAccumulators = changes.domainAccumulators.newValue;
  }
});

// Debounced Storage Write Batcher (Combines rapid updates into a single I/O commit)
let writeTimeout = null;
function scheduleStorageCommit() {
  if (writeTimeout) return;
  writeTimeout = setTimeout(async () => {
    writeTimeout = null;
    await chrome.storage.local.set({
      activeCooldowns: memCache.activeCooldowns,
      domainAccumulators: memCache.domainAccumulators
    });
  }, 250); // 250ms debounce window
}

chrome.runtime.onInstalled.addListener(async () => {
  await runAtomicTransaction(async () => {
    await ensureCache();
    await chrome.storage.session.set({ activeTabId: null, activeDomain: null, currentSpanStartMs: null });
  });
});

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch (e) {
    return null;
  }
}

async function syncAndEvaluateState(newTabId = null, newUrl = null) {
  return runAtomicTransaction(async () => {
    await ensureCache();
    const session = await chrome.storage.session.get(["activeTabId", "activeDomain", "currentSpanStartMs"]);
    const now = Date.now();

    // 1. Clean up expired cooldowns in memory
    let dirty = false;
    for (const domain in memCache.activeCooldowns) {
      const { cooldownStartMs, durationSec } = memCache.activeCooldowns[domain];
      if ((now - cooldownStartMs) / 1000 >= durationSec) {
        delete memCache.activeCooldowns[domain];
        delete memCache.domainAccumulators[domain];
        dirty = true;
      }
    }

    // 2. Accumulate active time
    if (session.activeDomain && session.currentSpanStartMs) {
      const prevDomain = session.activeDomain;
      if (!memCache.activeCooldowns[prevDomain]) {
        const elapsedMs = now - session.currentSpanStartMs;
        const currentAcc = (memCache.domainAccumulators[prevDomain] || 0) + elapsedMs;
        memCache.domainAccumulators[prevDomain] = currentAcc;
        dirty = true;

        const thresholdMs = (memCache.config.blockThresholdSec || 60) * 1000;
        if (currentAcc >= thresholdMs) {
          const durationSec = memCache.config.cooldownDurationSec || 30;
          memCache.activeCooldowns[prevDomain] = { cooldownStartMs: now, durationSec };
          dirty = true;
          chrome.alarms.create(`cooldown_${prevDomain}`, { when: now + (durationSec * 1000) });
        }
      }
    }

    if (dirty) scheduleStorageCommit();

    // 3. Determine next active domain
    let nextDomain = null;
    if (newUrl) {
      const domain = getDomain(newUrl);
      if (domain && memCache.config.blockedDomains.some(d => domain.includes(d))) {
        nextDomain = domain;
      }
    }

    await chrome.storage.session.set({
      activeTabId: newTabId,
      activeDomain: nextDomain,
      currentSpanStartMs: nextDomain ? now : null
    });

    if (newTabId && nextDomain) {
      broadcastDomainState(newTabId, nextDomain);
    }
  });
}

function broadcastDomainState(tabId, domain) {
  const now = Date.now();
  const cooldownInfo = memCache.activeCooldowns[domain];
  let isLocked = false;
  let cooldownStartMs = null;
  let durationSec = memCache.config.cooldownDurationSec || 30;

  if (cooldownInfo && (now - cooldownInfo.cooldownStartMs) / 1000 < cooldownInfo.durationSec) {
    isLocked = true;
    cooldownStartMs = cooldownInfo.cooldownStartMs;
    durationSec = cooldownInfo.durationSec;
  }

  const payload = {
    isLocked,
    cooldownStartMs,
    durationSec,
    accumulatedSec: Math.round((memCache.domainAccumulators[domain] || 0) / 1000),
    blockThresholdSec: memCache.config.blockThresholdSec || 60,
    domain
  };

  chrome.tabs.sendMessage(tabId, { type: "MINDSHIELD_STATE_UPDATE", payload }).catch(() => {});
}

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId).catch(() => null);
  await syncAndEvaluateState(info.tabId, tab?.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id === tabId) await syncAndEvaluateState(tabId, tab.url);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) await syncAndEvaluateState(null, null);
  else {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) await syncAndEvaluateState(activeTab.id, activeTab.url);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("cooldown_")) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) await syncAndEvaluateState(activeTab.id, activeTab.url);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_CURRENT_STATE") {
    runAtomicTransaction(async () => {
      await ensureCache();
      const url = sender.tab ? sender.tab.url : (message.url || null);
      const domain = url ? getDomain(url) : null;
      const targetDomain = domain || memCache.config.blockedDomains[0] || "poki.com";
      const cooldownInfo = memCache.activeCooldowns[targetDomain];
      const now = Date.now();

      let isLocked = false;
      let cooldownStartMs = null;
      let durationSec = memCache.config.cooldownDurationSec || 30;

      if (cooldownInfo && (now - cooldownInfo.cooldownStartMs) / 1000 < cooldownInfo.durationSec) {
        isLocked = true;
        cooldownStartMs = cooldownInfo.cooldownStartMs;
        durationSec = cooldownInfo.durationSec;
      }

      sendResponse({
        isLocked,
        cooldownStartMs,
        durationSec,
        accumulatedSec: Math.round((memCache.domainAccumulators[targetDomain] || 0) / 1000),
        blockThresholdSec: memCache.config.blockThresholdSec || 60,
        domain: targetDomain
      });
    });
    return true;
  }
});
