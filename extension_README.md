# Mgmt-Boost – Chrome Extension MVP (Slack Web POC)

This is a minimal Chrome MV3 extension that:
- Injects a "Boost" button near the Slack web composer "Send" button.
- Adds a top-right "Mgmt Boost" button that opens a side panel with Settings + Diary.
- Uses a dummy booster (no backend) and chrome.storage.sync for persistence.

## Install (Developer Mode)

1. Open Chrome → `chrome://extensions`
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked** → select the folder containing this extension (where `manifest.json` lives).
4. Navigate to `https://app.slack.com/`.
5. Compose a message; you should see **Boost** next to the **Send** button.
6. Top-right nav should include a **Mgmt Boost** button; click to open the side panel.

## Files
- `manifest.json` – MV3 manifest.
- `src/content.js` – Injects UI and wires behaviors.
- `src/panel.js` – Side panel with Settings + Diary (stored in chrome.storage.sync).
- `src/styles.css` – Minimal CSS for the injected UI.
- `src/utils.js` – Helpers + dummy `dummyBoost` function.

## Notes
- This POC does not call Slack or Google APIs.
- Slack DOM can change; selectors may need adjustment.
- If the Boost button does not appear, wait a moment or navigate between channels to trigger the MutationObserver.