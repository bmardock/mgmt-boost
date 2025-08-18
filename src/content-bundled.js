// content-bundled.js - Clean, organized Chrome extension
// Two main injection sites: Boost button and Mgmt Boost button

// ===== MESSAGE BOOSTER =====
// Initialize the mock service
const mockService = new MockMgmtBoostService();

async function boostMessage(text) {
  try {
    // Show loading state
    const boostBtn = document.querySelector(".mb-boost-btn");
    if (boostBtn) {
      boostBtn.innerHTML = "Boosting...";
      boostBtn.disabled = true;
    }

    // Call the mock service
    const result = await mockService.boostMessageAsync(text);

    // Show results in a toast
    showBoostResults(result);

    return result.boosted;
  } catch (error) {
    console.error("Boost error:", error);
    flashMessage("Boost failed. Please try again.");
    return text;
  } finally {
    // Reset button state
    const boostBtn = document.querySelector(".mb-boost-btn");
    if (boostBtn) {
      boostBtn.innerHTML = "Boost";
      boostBtn.disabled = false;
    }
  }
}

function showBoostResults(result) {
  const toast = document.createElement("div");
  toast.className = "mb-boost-results";
  toast.innerHTML = `
    <div class="mb-boost-header">
      <h4>Message Boosted! 🚀</h4>
      <button class="mb-close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="mb-tone-score">
      <div class="mb-score-circle" style="--score: ${result.analysis.score}">
        <span>${result.analysis.score}</span>
      </div>
      <div class="mb-score-label">
        <strong>Tone Score</strong>
        <span>${getToneDescription(result.analysis.score)}</span>
      </div>
    </div>
    <div class="mb-improvements">
      <h5>Improvements Made:</h5>
      <ul>
        ${result.improvements.map((imp) => `<li>${imp}</li>`).join("")}
      </ul>
    </div>
    ${
      result.analysis.insights.length > 0
        ? `
      <div class="mb-insights">
        <h5>Insights:</h5>
        ${result.analysis.insights
          .map(
            (insight) => `
          <div class="mb-insight mb-insight--${insight.type}">
            <strong>${insight.message}</strong>
            <span>${insight.suggestion}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }
  `;

  document.body.appendChild(toast);

  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 8000);
}

function getToneDescription(score) {
  if (score >= 80) return "Excellent tone";
  if (score >= 60) return "Good tone";
  if (score >= 40) return "Neutral tone";
  if (score >= 20) return "Needs improvement";
  return "Requires attention";
}

function injectBoostButton() {
  const textbox = document.querySelector('[role="textbox"]');
  if (!textbox) return;

  const sendBtn = findSendButton(textbox);
  if (!sendBtn || sendBtn.parentElement.querySelector(".mb-boost-btn")) return;

  const boost = document.createElement("button");
  boost.className = "mb-boost-btn";
  boost.type = "button";
  boost.title = "Boost message tone";
  boost.innerHTML = "Boost";

  sendBtn.parentElement.insertBefore(boost, sendBtn);

  boost.addEventListener("click", async () => {
    const draft = textbox.innerText || textbox.textContent || "";
    if (!draft) return flashMessage("No text detected.");

    const boosted = await boostMessage(draft);
    textbox.textContent = boosted;
    placeCaretAtEnd(textbox);
  });

  // Watch send button state to update boost button active state
  const observer = new MutationObserver(() => {
    const isDisabled = sendBtn.getAttribute("aria-disabled") === "true";
    boost.classList.toggle("mb-boost-btn--active", !isDisabled);
  });
  observer.observe(sendBtn, {
    attributes: true,
    attributeFilter: ["aria-disabled"],
  });

  // Initial check
  const isDisabled = sendBtn.getAttribute("aria-disabled") === "true";
  boost.classList.toggle("mb-boost-btn--active", !isDisabled);
}

function findSendButton(textbox) {
  // Look for the specific Slack send button
  return document.querySelector('button[aria-label="Send now"]');
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function flashMessage(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.className = "mb-flash-message";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 900);
}

// ===== MGMT BOOST BUTTON =====
function injectPanelButton() {
  const navRight =
    document.querySelector(".p-ia4_top_nav__right_container") ||
    document.querySelector('[data-qa="top_nav"]') ||
    document.querySelector("header");
  if (!navRight || navRight.querySelector(".mb-panel-btn")) return;

  const btn = document.createElement("button");
  btn.className = "mb-panel-btn";
  btn.type = "button";
  btn.title = "Open Mgmt Boost";
  btn.textContent = "Mgmt Boost";
  btn.addEventListener("click", () => {
    // Send message to background script to toggle side panel
    chrome.runtime.sendMessage({ action: "toggleSidePanel" });
  });
  navRight.appendChild(btn);
}

// ===== INITIALIZATION =====
const observer = new MutationObserver(() => {
  injectBoostButton();
  injectPanelButton();
});

observer.observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
  injectBoostButton();
  injectPanelButton();
});

window.addEventListener("load", () => {
  injectBoostButton();
  injectPanelButton();
});
