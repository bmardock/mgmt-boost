// content-bundled.js - Clean, organized Chrome extension
// Two main injection sites: Boost button and Mgmt Boost button

// ===== NOTIFICATION SYSTEM =====
class NotificationManager {
  constructor() {
    this.notificationTimeout = 5000; // 5 seconds default
    this.currentNotification = null;
  }

  // Display a notification in Slack's notification bar
  showNotification(message) {
    console.log('NotificationManager: Attempting to show notification:', message);
    
    // Clear any existing notification first
    this.clearNotification();

    // Find the notification bar - try multiple selectors
    let notificationBar = document.querySelector('.p-notification_bar__section.p-notification_bar__section--left');
    
    if (!notificationBar) {
      notificationBar = document.querySelector('.p-notification_bar__section');
    }
    
    if (!notificationBar) {
      notificationBar = document.querySelector('[data-qa="notification_bar"]');
    }
    
    if (!notificationBar) {
      // Try to find any notification area
      notificationBar = document.querySelector('.p-notification_bar');
    }
    
    if (!notificationBar) {
      console.warn('Slack notification bar not found');
      return;
    }

    console.log('Found notification bar:', notificationBar);

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'mb-notification';
    notification.innerHTML = `
      <span class="mb-notification-text">${message}</span>
      <button class="mb-notification-close">×</button>
    `;

    // Add event listener to close button
    const closeBtn = notification.querySelector('.mb-notification-close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked');
      window.notificationManager.clearNotification();
    });

    // Add minimal styles to match Slack's design
    notification.style.cssText = `
      color: inherit;
      font-size: inherit;
      font-weight: inherit;
    `;

    // Add minimal styles if not already present
    if (!document.getElementById('mb-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'mb-notification-styles';
      style.textContent = `
        .mb-notification-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 14px;
          cursor: pointer;
          margin-left: 8px;
          padding: 2px;
          opacity: 0.7;
        }
        .mb-notification-close:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    // Clear existing content and add our notification
    notificationBar.innerHTML = '';
    notificationBar.appendChild(notification);
    this.currentNotification = notification;

    return notification;
  }

  // Clear the current notification
  clearNotification() {
    if (this.currentNotification && this.currentNotification.parentElement) {
      this.currentNotification.remove();
      this.currentNotification = null;
    }
  }



  // Notification messages lookup
  notifications = {
    deEscalation: "Conversation seems tense — want to de-escalate by adding acknowledgment?",
    toneSuggestion: "Consider boosting your message for better tone and clarity",
    collaborative: "Try using more collaborative language like 'let's' instead of 'you must'",
    harsh: "This may come across sharp to a direct report — want to soften?",
    timeframe: "No timeframe detected — want to add one?",
    longReply: "Thread replies work best short and clear — want to shorten?",
    celebrate: "Want to celebrate the team's effort?",
    boostResult: (sentiment) => `Message boosted! Tone: ${sentiment}`,
    aiSuggestion: (message) => message || "AI suggestion available"
  };

  // Show a notification by key
  show(key, ...args) {
    const message = typeof this.notifications[key] === 'function' 
      ? this.notifications[key](...args)
      : this.notifications[key];
    
    if (message) {
      return this.showNotification(message);
    }
  }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();

// Add test functions to window for debugging
window.testNotifications = {
  showDeEscalation: () => window.notificationManager.show('deEscalation'),
  showToneSuggestion: () => window.notificationManager.show('toneSuggestion'),
  showCollaborative: () => window.notificationManager.show('collaborative'),
  showHarsh: () => window.notificationManager.show('harsh'),
  showTimeframe: () => window.notificationManager.show('timeframe'),
  showLongReply: () => window.notificationManager.show('longReply'),
  showCelebrate: () => window.notificationManager.show('celebrate'),
  showBoostResult: () => window.notificationManager.show('boostResult', 85),
  clear: () => window.notificationManager.clearNotification()
};

// Demo scenarios for showcasing Boost functionality
window.demoScenarios = {
  // Scenario 1: Harsh → Softened
  scenario1: () => {
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.textContent = '@sarah Fix this ASAP.';
      placeCaretAtEnd(textbox);
      
      // Simulate boost result
      setTimeout(() => {
        textbox.textContent = '@sarah Can you fix this by end of day? Thanks.';
        placeCaretAtEnd(textbox);
        window.notificationManager.showNotification('This may come across sharp to a direct report — want to soften?', 6000);
      }, 1000);
    }
  },

  // Scenario 2: Missing timeframe → Added
  scenario2: () => {
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.textContent = '@tom can you review the PR?';
      placeCaretAtEnd(textbox);
      
      setTimeout(() => {
        textbox.textContent = '@tom Can you review the PR by tomorrow morning?';
        placeCaretAtEnd(textbox);
        window.notificationManager.showNotification('No timeframe detected — want to add one?', 6000);
      }, 1000);
    }
  },

  // Scenario 3: Thread reply too long → Shortened
  scenario3: () => {
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.textContent = 'I think we should maybe try another approach. The current plan is risky and may cause scaling issues, so I\'d propose we...';
      placeCaretAtEnd(textbox);
      
      setTimeout(() => {
        textbox.textContent = 'We may hit scaling issues with this plan — let\'s consider another approach.';
        placeCaretAtEnd(textbox);
        window.notificationManager.showNotification('Thread replies work best short and clear — want to shorten?', 6000);
      }, 1000);
    }
  },

  // Scenario 4: Celebrate a win
  scenario4: () => {
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.textContent = 'Release shipped.';
      placeCaretAtEnd(textbox);
      
      setTimeout(() => {
        textbox.textContent = 'Release shipped 🎉 Great work everyone!';
        placeCaretAtEnd(textbox);
        window.notificationManager.showNotification('Want to celebrate the team\'s effort?', 6000);
      }, 1000);
    }
  },

  // Scenario 5: De-escalation in heated channel
  scenario5: () => {
    const textbox = document.querySelector('[role="textbox"]');
    if (textbox) {
      textbox.textContent = 'Stop spamming the channel, just file the ticket!!';
      placeCaretAtEnd(textbox);
      
      setTimeout(() => {
        textbox.textContent = 'Let\'s keep the channel focused — can you file a ticket so we can track this properly? Thanks.';
        placeCaretAtEnd(textbox);
        window.notificationManager.showNotification('Conversation seems tense — want to de-escalate by adding acknowledgment?', 6000);
      }, 1000);
    }
  },

  // Run all scenarios in sequence
  runAll: () => {
    let currentScenario = 1;
    const runNext = () => {
      if (currentScenario <= 5) {
        window.demoScenarios[`scenario${currentScenario}`]();
        currentScenario++;
        setTimeout(runNext, 8000); // Wait 8 seconds between scenarios
      }
    };
    runNext();
  }
};

// Test notification on load
console.log('Mgmt Boost: Content script loaded, testing notification system...');
setTimeout(() => {
  console.log('Mgmt Boost: Showing test notification...');
  window.notificationManager.showNotification('Mgmt Boost is working! 🚀', 3000);
}, 2000);

// ===== MESSAGE BOOSTER =====
// Initialize the AI agent service with error handling
let aiService = null;
let mockService = null;

async function initializeAIService() {
  try {
    console.log('Initializing AI service...');
    console.log('AIAgentService available:', typeof AIAgentService);
    console.log('MockMgmtBoostService available:', typeof MockMgmtBoostService);
    
    // Check if AIAgentService is available
    if (typeof AIAgentService === 'undefined') {
      console.error('AIAgentService not loaded. Falling back to mock service.');
      // Try to load the old mock service as fallback
      if (typeof MockMgmtBoostService !== 'undefined') {
        mockService = new MockMgmtBoostService();
        console.log('Using mock service as fallback');
      }
      return false;
    }
    
    console.log('AIAgentService found, creating instance...');
    aiService = new AIAgentService();
    
    // Load API key from settings
    const prefs = await new Promise((resolve) => {
      chrome.storage.sync.get("prefs", (res) => resolve(res.prefs || {}));
    });
    
    if (prefs.apiKey) {
      aiService.setApiKey(prefs.apiKey);
      console.log('AI service initialized with API key');
      return true;
    } else {
      console.warn('No API key found. AI features will be limited.');
      return false;
    }
  } catch (error) {
    console.error("Failed to initialize AI service:", error);
    return false;
  }
}

// Initialize AI service on startup
initializeAIService();

async function boostMessage(text) {
  try {
    // Show loading state
    const boostBtn = document.querySelector(".mb-boost-btn");
    if (boostBtn) {
      boostBtn.innerHTML = "Boosting...";
      boostBtn.disabled = true;
    }

    // Check if AI service is available
    if (!aiService) {
      console.warn('AI service not available, trying fallback');
      
      // Try to use mock service as fallback
      if (mockService) {
        try {
          const result = await mockService.boostMessageAsync(text);
          window.notificationManager.show('boostResult', result.analysis.score);
          return result.boosted;
        } catch (fallbackError) {
          console.error('Fallback service also failed:', fallbackError);
        }
      }
      
      window.notificationManager.show('toneSuggestion');
      return text;
    }

    // Quick response for very short messages - but still try to boost them
    if (text.length < 20) {
      console.log('Using quick response for short message');
      const quickAnalysis = await aiService.getToneScore(text);
      window.notificationManager.show('boostResult', quickAnalysis.description);
      
      // Try to boost short messages too
      try {
        const boostedResult = await aiService.boostMessage(text);
        if (boostedResult.boosted && boostedResult.boosted !== text) {
          return boostedResult.boosted;
        }
      } catch (boostError) {
        console.log('Could not boost short message:', boostError);
      }
      
      return text; // Return original if boost fails
    }

    // Get current channel info
    const channelInfo = getCurrentChannelInfo();

    // Add user message to conversation context
    aiService.addToContext(text, 'user', new Date().toISOString());

    // Analyze conversation and get AI suggestions
    const analysis = await aiService.analyzeConversation(text, channelInfo);
    
    console.log('AI analysis result:', analysis);

    // Show boost result if there's a boosted message
    if (analysis.boosted_message && analysis.boosted_message !== text) {
      console.log('Using boosted message:', analysis.boosted_message);
      window.notificationManager.show('boostResult', analysis.tone_analysis.overall_sentiment);
    } else {
      console.log('No boosted message available, using original');
    }

    // Show high-priority suggestions
    const highPrioritySuggestions = analysis.suggestions.filter(s => s.priority === 'high');
    if (highPrioritySuggestions.length > 0) {
      const suggestion = highPrioritySuggestions[0];
      window.notificationManager.show('aiSuggestion', suggestion.message);
    }

    // Add AI response to context
    if (analysis.immediate_action) {
      aiService.addToContext(analysis.immediate_action, 'assistant', new Date().toISOString());
    }

    return analysis.boosted_message || text;
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

// Get current channel information
function getCurrentChannelInfo() {
  try {
    // Try to extract channel info from Slack's DOM
    const channelName = document.querySelector('[data-qa="channel_name"]')?.textContent || 'Unknown';
    const channelType = document.querySelector('[data-qa="channel_type"]')?.textContent || 'Unknown';
    
    return {
      name: channelName,
      type: channelType
    };
  } catch (error) {
    return { name: 'Unknown', type: 'Unknown' };
  }
}

function showBoostResults(result) {
  // Show results in the notification bar instead of a popup
  const message = `Message boosted! Tone score: ${result.analysis.score}/100 - ${getToneDescription(result.analysis.score)}`;
  
  // Show the main notification
  window.notificationManager.showNotification(message, 6000);
  
  // If there are insights, show them after a short delay
  if (result.analysis.insights.length > 0) {
    setTimeout(() => {
      const insight = result.analysis.insights[0]; // Show the first insight
      const insightMessage = `${insight.message}: ${insight.suggestion}`;
      window.notificationManager.showNotification(insightMessage, 5000);
    }, 2000);
  }
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

  // Watch send button state to update boost button disabled state
  const observer = new MutationObserver(() => {
    const isDisabled = sendBtn.getAttribute("aria-disabled") === "true";
    boost.disabled = isDisabled;
  });
  observer.observe(sendBtn, {
    attributes: true,
    attributeFilter: ["aria-disabled"],
  });

  // Initial check
  const isDisabled = sendBtn.getAttribute("aria-disabled") === "true";
  boost.disabled = isDisabled;
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

// ===== CONVERSATION MONITORING =====
function monitorConversationTone() {
  // Monitor for tense language in recent messages
  const recentMessages = document.querySelectorAll('.c-message:not(.c-message--deleted)');
  let tenseMessageCount = 0;
  
  recentMessages.forEach(message => {
    const text = message.textContent.toLowerCase();
    const tenseWords = ['urgent', 'asap', 'immediately', 'must', 'should', 'need to', 'have to', 'required'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'worried'];
    
    const hasTenseWords = tenseWords.some(word => text.includes(word));
    const hasNegativeWords = negativeWords.some(word => text.includes(word));
    
    if (hasTenseWords || hasNegativeWords) {
      tenseMessageCount++;
    }
  });
  
  // Show de-escalation suggestion if multiple tense messages detected
  if (tenseMessageCount >= 2) {
    window.notificationManager.showDeEscalationSuggestion();
  }
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
  
  // Start conversation monitoring after a delay
  setTimeout(() => {
    monitorConversationTone();
  }, 3000);
});

window.addEventListener("load", () => {
  injectBoostButton();
  injectPanelButton();
  
  // Monitor conversation tone periodically
  setInterval(monitorConversationTone, 30000); // Check every 30 seconds
});
