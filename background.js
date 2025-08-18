// background.js - Service worker for Side Panel API management

const SLACK_ORIGIN = "https://app.slack.com";

// Function to update side panel state for a tab
async function updateSidePanelForTab(tabId, url) {
  if (!url) return;

  try {
    const urlObj = new URL(url);
    if (urlObj.origin === SLACK_ORIGIN) {
      console.log(`Enabling side panel for tab ${tabId} (Slack)`);
      await chrome.sidePanel.setOptions({
        tabId,
        path: "sidepanel.html",
        enabled: true,
      });
    } else {
      console.log(`Disabling side panel for tab ${tabId} (non-Slack)`);
      await chrome.sidePanel.setOptions({
        enabled: false,
      });
    }
  } catch (error) {
    console.error("Error updating side panel:", error);
  }
}

// Handle tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status === "complete" && tab.url) {
    await updateSidePanelForTab(tabId, tab.url);
  }
});

// Handle tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await updateSidePanelForTab(activeInfo.tabId, tab.url);
  } catch (error) {
    console.error("Error handling tab activation:", error);
  }
});

// Set up action button to open side panel
chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true,
});

// Listen for messages from content script to open side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleSidePanel") {
    // For now, just open the panel - Chrome's UI will handle closing
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});

// Initialize side panel for existing tabs on extension load
chrome.runtime.onStartup.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await updateSidePanelForTab(tab.id, tab.url);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await updateSidePanelForTab(tab.id, tab.url);
  }
});
