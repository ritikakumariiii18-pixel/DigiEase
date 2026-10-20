
const fontSize = document.getElementById("fontSize");
const fontValue = document.getElementById("fontValue");
const lineSpacing = document.getElementById("lineSpacing");
const lineValue = document.getElementById("lineValue");
const contrast = document.getElementById("contrast");
const ruler = document.getElementById("ruler");
const reset = document.getElementById("reset");
const status = document.getElementById("status");

const speechLanguage = document.getElementById("speechLanguage");
const readAloud = document.getElementById("readAloud");
const stopReading = document.getElementById("stopReading");

const defaults = {
  fontSize: 100,
  lineSpacing: 1.6,
  contrast: "normal",
  ruler: false
};

let currentTabId = null;

function showStatus(message) {
  status.textContent = message;
}

function updateLabels(settings) {
  fontValue.textContent = `${settings.fontSize}%`;
  lineValue.textContent = Number(settings.lineSpacing).toFixed(1);
}

function sendSettings(settings) {
  if (currentTabId == null) {
    showStatus("No webpage is selected.");
    return;
  }

  chrome.tabs.sendMessage(
    currentTabId,
    { type: "DIGIEASE_APPLY", settings },
    (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        showStatus("This page cannot be modified.");
        return;
      }

      showStatus("Accessibility settings applied ✓");
    }
  );
}

function saveAndApply() {
  const settings = {
    fontSize: Number(fontSize.value),
    lineSpacing: Number(lineSpacing.value),
    contrast: contrast.value,
    ruler: ruler.checked
  };

  updateLabels(settings);

  chrome.storage.local.set({ digieaseSettings: settings }, () => {
    sendSettings(settings);
  });
}

function displaySettings(settings) {
  fontSize.value = settings.fontSize;
  lineSpacing.value = settings.lineSpacing;
  contrast.value = settings.contrast;
  ruler.checked = settings.ruler;
  updateLabels(settings);
}

async function initialize() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  currentTabId = tab?.id ?? null;

  chrome.storage.local.get("digieaseSettings", (result) => {
    const settings = {
      ...defaults,
      ...(result.digieaseSettings || {})
    };

    displaySettings(settings);
    sendSettings(settings);
  });
}

function getPageText() {
  if (currentTabId == null) return;

  chrome.tabs.sendMessage(
    currentTabId,
    { type: "DIGIEASE_GET_TEXT" },
    (response) => {
      if (chrome.runtime.lastError || !response?.text?.trim()) {
        showStatus("Couldn't read text on this page.");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(response.text);
      utterance.lang = speechLanguage.value;

      utterance.onstart = () => showStatus("Reading webpage aloud…");
      utterance.onend = () => showStatus("Finished reading.");
      utterance.onerror = () => showStatus("Speech stopped or unavailable.");

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  );
}

fontSize.addEventListener("input", saveAndApply);
lineSpacing.addEventListener("input", saveAndApply);
contrast.addEventListener("change", saveAndApply);
ruler.addEventListener("change", saveAndApply);

reset.addEventListener("click", () => {
  displaySettings(defaults);

  chrome.storage.local.set({ digieaseSettings: defaults }, () => {
    sendSettings(defaults);
  });
});

readAloud.addEventListener("click", getPageText);

stopReading.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  showStatus("Reading stopped.");
});

initialize();
