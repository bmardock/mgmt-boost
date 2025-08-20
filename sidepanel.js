// sidepanel.js - Side panel functionality for Chrome's native Side Panel API

// ===== STORAGE HELPERS =====
function saveSync(key, value) {
  return new Promise((resolve) =>
    chrome.storage.sync.set({ [key]: value }, resolve)
  );
}

function getSync(key, fallback) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (res) => resolve(res[key] ?? fallback));
  });
}

// ===== TEMPLATES =====
function createSettingsTemplate(prefs) {
  return `
    <div class="mb-field">
      <label>OpenAI API Key</label>
      <input id="mb-api-key" type="password" placeholder="sk-..." value="${escapeHtml(
        prefs.apiKey || ''
      )}" />
      <div class="mb-field-help">Required for AI-powered suggestions and message boosting</div>
    </div>
    <div class="mb-field">
      <label>Manager (@handle or name)</label>
      <input id="mb-manager" type="text" placeholder="@boss, John Smith" value="${escapeHtml(
        prefs.manager || ''
      )}" />
    </div>
    <div class="mb-field">
      <label>Team members (comma-separated @handles or names)</label>
      <input id="mb-team" type="text" placeholder="@sarah, @tom" value="${escapeHtml(
        prefs.team
      )}" />
    </div>
    <div class="mb-field">
      <label>Channels to monitor (comma-separated names)</label>
      <input id="mb-channels" type="text" placeholder="#eng, #frontend" value="${escapeHtml(
        prefs.channels
      )}" />
    </div>
    <button class="mb-save" id="mb-save-settings">Save</button>
    <div class="mb-muted">Private to your browser. Uses chrome.storage.sync.</div>
  `;
}

function createDiaryTemplate(todayEntry) {
  const today = new Date().toLocaleDateString();
  
  return `
    <div class="mb-daily-log">
      <div class="mb-log-header">
        <h3>Daily Log - ${today}</h3>
        <div class="mb-save-status" id="mb-save-status">Saved</div>
      </div>
      
      <div class="mb-log-editor">
        <textarea 
          id="mb-daily-log-text" 
          placeholder="Today's notes, thoughts, meetings, action items...&#10;&#10;This automatically saves as you type."
          rows="20"
        >${todayEntry || ''}</textarea>
      </div>
      
      <div class="mb-log-tips">
        <h4>Quick Tips:</h4>
        <ul>
          <li>• Use this as your daily notepad - it auto-saves</li>
          <li>• Jot down meeting notes, thoughts, and action items</li>
          <li>• Each day gets its own log entry</li>
          <li>• Perfect for 1:1 notes, project updates, and reflections</li>
        </ul>
      </div>
    </div>
  `;
}

function createFieldGuideTemplate() {
  return `
    <div class="mb-fieldguide-content">
      <div class="mb-search-section">
        <div class="mb-search-box">
          <input type="text" id="mb-search-input" placeholder="Search field guide..." />
          <button id="mb-search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="mb-guide-categories">
        <div class="mb-category-card" data-category="conflict">
          <div class="mb-category-icon">⚔️</div>
          <h4>Conflict Resolution</h4>
          <p>Handle team conflicts and difficult conversations</p>
        </div>
        <div class="mb-category-card" data-category="feedback">
          <div class="mb-category-icon">💬</div>
          <h4>Feedback & Reviews</h4>
          <p>Give effective feedback and conduct reviews</p>
        </div>
        <div class="mb-category-card" data-category="delegation">
          <div class="mb-category-icon">📋</div>
          <h4>Delegation</h4>
          <p>Delegate effectively and empower your team</p>
        </div>
        <div class="mb-category-card" data-category="motivation">
          <div class="mb-category-icon">🚀</div>
          <h4>Team Motivation</h4>
          <p>Keep your team engaged and motivated</p>
        </div>
      </div>

      <div class="mb-guide-content" id="mb-guide-content">
        <div class="mb-welcome-message">
          <h3>Manager Field Guide</h3>
          <p>Select a category above or search for specific topics to get started.</p>
        </div>
      </div>
    </div>
  `;
}

function createDashboardTemplate() {
  return `
    <div class="mb-dashboard-content">
      <div class="mb-team-section">
        <h4>Team</h4>
        <div class="mb-team-members">
          <div class="mb-team-member">
            <div class="mb-member-header">
              <span class="mb-member-name">@sarah</span>
              <span class="mb-sentiment-badge positive">Positive</span>
            </div>
            <div class="mb-member-interactions">
              <div class="mb-interaction-item">
                <span class="mb-interaction-type">1:1</span>
                <span class="mb-interaction-desc">Discussed Q4 goals and career growth</span>
                <span class="mb-interaction-time">2h ago</span>
              </div>
              <div class="mb-interaction-item">
                <span class="mb-interaction-type">Feedback</span>
                <span class="mb-interaction-desc">Great work on the project launch</span>
                <span class="mb-interaction-time">1d ago</span>
              </div>
            </div>
          </div>

          <div class="mb-team-member">
            <div class="mb-member-header">
              <span class="mb-member-name">@tom</span>
              <span class="mb-sentiment-badge neutral">Neutral</span>
            </div>
            <div class="mb-member-interactions">
              <div class="mb-interaction-item">
                <span class="mb-interaction-type">1:1</span>
                <span class="mb-interaction-desc">Performance review discussion</span>
                <span class="mb-interaction-time">3d ago</span>
              </div>
            </div>
          </div>

          <div class="mb-team-member">
            <div class="mb-member-header">
              <span class="mb-member-name">@alex</span>
              <span class="mb-sentiment-badge negative">Concerned</span>
            </div>
            <div class="mb-member-interactions">
              <div class="mb-interaction-item">
                <span class="mb-interaction-type">Check-in</span>
                <span class="mb-interaction-desc">Workload seems overwhelming</span>
                <span class="mb-interaction-time">5h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-manager-section">
        <h4>Manager</h4>
        <div class="mb-manager-interactions">
          <div class="mb-interaction-item">
            <span class="mb-interaction-type">Update</span>
            <span class="mb-interaction-desc">Weekly team status report</span>
            <span class="mb-interaction-time">4h ago</span>
          </div>
          <div class="mb-interaction-item">
            <span class="mb-interaction-type">1:1</span>
            <span class="mb-interaction-desc">Budget planning for next quarter</span>
            <span class="mb-interaction-time">2d ago</span>
          </div>
        </div>
      </div>

      <div class="mb-channels-section">
        <h4>Channels</h4>
        <div class="mb-channel-list">
          <div class="mb-channel-item">
            <span class="mb-channel-name">#eng-team</span>
            <span class="mb-sentiment-badge positive">Positive</span>
            <span class="mb-channel-activity">High activity, good collaboration</span>
          </div>
          <div class="mb-channel-item">
            <span class="mb-channel-name">#project-alpha</span>
            <span class="mb-sentiment-badge neutral">Neutral</span>
            <span class="mb-channel-activity">Normal project updates</span>
          </div>
        </div>
      </div>

      <div class="mb-actions-section">
        <h4>Calls to Action</h4>
        <div class="mb-actions-list">
          <div class="mb-action">
            <span class="mb-action-priority high">High</span>
            <span class="mb-action-text">Follow up with Alex on workload concerns</span>
          </div>
          <div class="mb-action">
            <span class="mb-action-priority medium">Medium</span>
            <span class="mb-action-text">Schedule team retro for next week</span>
          </div>
          <div class="mb-action">
            <span class="mb-action-priority low">Low</span>
            <span class="mb-action-text">Update quarterly goals document</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-dashboard-actions">
      <button class="mb-action-btn" id="mb-add-interaction">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Add Interaction
      </button>
      <button class="mb-action-btn" id="mb-add-action">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Add Action
      </button>
    </div>
  `;
}

function createCalendarTemplate(calendarEvents, today) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAfterTomorrowStart = new Date(tomorrowStart);
  dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 1);

  // Group events by day
  const yesterdayEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start);
    const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return eventDayStart.getTime() === yesterdayStart.getTime();
  });

  const todayEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start);
    const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return eventDayStart.getTime() === todayStart.getTime();
  });

  const tomorrowEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start);
    const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return eventDayStart.getTime() === tomorrowStart.getTime();
  });

  const createMeetingHtml = (event, isCompact = false) => {
    const eventId = event.id || `event-${Date.now()}-${Math.random()}`;
    const meetingData = getMeetingData(eventId);
    const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = new Date(event.start).toLocaleDateString();
    
    const compactClass = isCompact ? 'mb-meeting-compact' : '';

  return `
      <div class="mb-meeting ${compactClass}">
        <div class="mb-meeting-header">
          <div class="mb-meeting-time">${date} at ${startTime}</div>
          <div class="mb-meeting-type ${getMeetingType(event.title)}">${getMeetingType(event.title)}</div>
        </div>
        <div class="mb-meeting-title">${escapeHtml(event.title)}</div>
        ${meetingData.notes ? `<div class="mb-meeting-notes">${escapeHtml(meetingData.notes)}</div>` : ''}
        <div class="mb-meeting-actions">
          <button class="mb-meeting-btn" data-event-id="${eventId}">
            ${meetingData.notes ? 'Show Notes' : 'Add Notes'}
          </button>
    </div>
      </div>
    `;
  };

  return `
    <div class="mb-meetings-header">
      <h4>Meetings</h4>
      <div class="mb-meeting-stats">
        <span class="mb-stat">${todayEvents.length} today</span>
      </div>
    </div>

    <div class="mb-meetings-list">
      ${yesterdayEvents.length > 0 ? `
        <div class="mb-day-section">
          <div class="mb-day-header" data-section="yesterday">
            <h5>Yesterday (${yesterdayEvents.length})</h5>
            <span class="mb-expand-icon">▶</span>
          </div>
          <div class="mb-day-content" id="yesterday-content" style="display: none;">
            ${yesterdayEvents.map(event => createMeetingHtml(event, true)).join('')}
          </div>
        </div>
      ` : ''}

      <div class="mb-day-section">
        <div class="mb-day-header">
          <h5>Today (${todayEvents.length})</h5>
        </div>
        <div class="mb-day-content">
          ${todayEvents.map(event => createMeetingHtml(event, false)).join('')}
        </div>
      </div>

      ${tomorrowEvents.length > 0 ? `
        <div class="mb-day-section">
          <div class="mb-day-header">
            <h5>Tomorrow (${tomorrowEvents.length})</h5>
          </div>
          <div class="mb-day-content">
            ${tomorrowEvents.map(event => createMeetingHtml(event, true)).join('')}
          </div>
      </div>
      ` : ''}
    </div>
  `;
}

// Helper function to determine meeting type from title
function getMeetingType(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('1:1') || lowerTitle.includes('one on one') || lowerTitle.includes('1-1')) return 'one-on-one';
  if (lowerTitle.includes('team') || lowerTitle.includes('standup') || lowerTitle.includes('sync')) return 'team';
  if (lowerTitle.includes('review') || lowerTitle.includes('performance')) return 'review';
  if (lowerTitle.includes('planning') || lowerTitle.includes('roadmap')) return 'planning';
  if (lowerTitle.includes('retro') || lowerTitle.includes('retrospective')) return 'retro';
  return 'other';
}

// Helper function to get meeting data (prep flags, notes)
function getMeetingData(eventId) {
  // This would be stored separately from calendar events
  const meetingData = window.meetingDataCache || {};
  return meetingData[eventId] || { needsPrep: false, notes: '' };
}

// Field Guide Knowledge Base
const fieldGuideContent = {
  conflict: {
    title: "Conflict Resolution",
    content: `
      <div class="mb-guide-section">
        <h3>Conflict Resolution Checklist</h3>
        
        <div class="mb-checklist">
          <h4>Before the Conversation</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="prep-1" />
            <label for="prep-1">Gather facts and understand both perspectives</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="prep-2" />
            <label for="prep-2">Choose a neutral, private location</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="prep-3" />
            <label for="prep-3">Set aside adequate time (30-60 minutes)</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="prep-4" />
            <label for="prep-4">Prepare your opening statement</label>
          </div>
        </div>

        <div class="mb-checklist">
          <h4>During the Conversation</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-1" />
            <label for="during-1">Start with a neutral, factual opening</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-2" />
            <label for="during-2">Listen actively without interrupting</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-3" />
            <label for="during-3">Acknowledge emotions and validate feelings</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-4" />
            <label for="during-4">Focus on behaviors, not personalities</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-5" />
            <label for="during-5">Ask open-ended questions to understand</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="during-6" />
            <label for="during-6">Work together to find solutions</label>
          </div>
        </div>

        <div class="mb-checklist">
          <h4>After the Conversation</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="after-1" />
            <label for="after-1">Document the discussion and agreed actions</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="after-2" />
            <label for="after-2">Follow up on agreed actions within 1 week</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="after-3" />
            <label for="after-3">Monitor the situation and provide support</label>
          </div>
        </div>

        <div class="mb-tips">
          <h4>Key Phrases to Use</h4>
          <ul>
            <li>"I've noticed..." (start with observations)</li>
            <li>"Help me understand..." (ask for clarification)</li>
            <li>"What would be most helpful to you?" (focus on solutions)</li>
            <li>"Let's work together to find a way forward" (collaborative approach)</li>
          </ul>
        </div>
      </div>
    `
  },
  feedback: {
    title: "Feedback & Reviews",
    content: `
      <div class="mb-guide-section">
        <h3>Effective Feedback Framework</h3>
        
        <div class="mb-framework">
          <h4>The SBI Model</h4>
          <div class="mb-framework-step">
            <strong>Situation:</strong> Describe the specific situation
          </div>
          <div class="mb-framework-step">
            <strong>Behavior:</strong> Describe the observable behavior
          </div>
          <div class="mb-framework-step">
            <strong>Impact:</strong> Explain the impact on team/project
          </div>
        </div>

        <div class="mb-checklist">
          <h4>Feedback Best Practices</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="feedback-1" />
            <label for="feedback-1">Give feedback promptly (within 24-48 hours)</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="feedback-2" />
            <label for="feedback-2">Balance positive and constructive feedback</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="feedback-3" />
            <label for="feedback-3">Be specific and actionable</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="feedback-4" />
            <label for="feedback-4">Focus on growth and development</label>
          </div>
        </div>
      </div>
    `
  },
  delegation: {
    title: "Delegation",
    content: `
      <div class="mb-guide-section">
        <h3>Delegation Framework</h3>
        
        <div class="mb-checklist">
          <h4>Before Delegating</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-1" />
            <label for="delegate-1">Assess the person's capability and motivation</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-2" />
            <label for="delegate-2">Clearly define the desired outcome</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-3" />
            <label for="delegate-3">Set clear deadlines and milestones</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-4" />
            <label for="delegate-4">Provide necessary resources and context</label>
          </div>
        </div>

        <div class="mb-checklist">
          <h4>During Delegation</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-5" />
            <label for="delegate-5">Explain the "why" behind the task</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-6" />
            <label for="delegate-6">Agree on check-in frequency and format</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="delegate-7" />
            <label for="delegate-7">Empower them to make decisions</label>
          </div>
        </div>
      </div>
    `
  },
  motivation: {
    title: "Team Motivation",
    content: `
      <div class="mb-guide-section">
        <h3>Team Motivation Strategies</h3>
        
        <div class="mb-checklist">
          <h4>Recognition & Appreciation</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-1" />
            <label for="motivate-1">Recognize individual and team achievements</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-2" />
            <label for="motivate-2">Provide specific, meaningful praise</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-3" />
            <label for="motivate-3">Celebrate milestones and wins</label>
          </div>
        </div>

        <div class="mb-checklist">
          <h4>Growth & Development</h4>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-4" />
            <label for="motivate-4">Provide learning opportunities</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-5" />
            <label for="motivate-5">Support career development goals</label>
          </div>
          <div class="mb-checklist-item">
            <input type="checkbox" id="motivate-6" />
            <label for="motivate-6">Give stretch assignments</label>
          </div>
        </div>
      </div>
    `
  }
};

function escapeHtml(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

// ===== TAB RENDERERS =====
async function renderFieldGuide(body) {
  body.innerHTML = createFieldGuideTemplate();

  // Category click handlers
  const categoryCards = body.querySelectorAll('.mb-category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      showFieldGuideContent(category);
    });
  });

  // Search functionality
  const searchInput = body.querySelector('#mb-search-input');
  const searchBtn = body.querySelector('#mb-search-btn');

  searchBtn.addEventListener('click', () => {
    performSearch(searchInput.value);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });
  
  // Add event listeners for dynamic content
  body.addEventListener('click', (e) => {
    // Handle back button
    if (e.target.id === 'mb-back-btn') {
      showFieldGuideHome();
    }
    
    // Handle search results
    if (e.target.closest('.mb-search-result')) {
      const result = e.target.closest('.mb-search-result');
      const category = result.dataset.category;
      if (category) {
        showFieldGuideContent(category);
      }
    }
  });
}

function showFieldGuideContent(category) {
  const content = document.getElementById('mb-guide-content');
  const guideData = fieldGuideContent[category];
  
  if (guideData) {
    content.innerHTML = `
      <div class="mb-guide-header">
        <button class="mb-back-btn" id="mb-back-btn">← Back</button>
        <h3>${guideData.title}</h3>
      </div>
      ${guideData.content}
    `;
  }
}

function showFieldGuideHome() {
  const content = document.getElementById('mb-guide-content');
  content.innerHTML = `
    <div class="mb-welcome-message">
      <h3>Manager Field Guide</h3>
      <p>Select a category above or search for specific topics to get started.</p>
    </div>
  `;
}

function performSearch(query) {
  if (!query.trim()) return;

  const results = [];
  const searchTerm = query.toLowerCase();

  // Search through all content
  Object.keys(fieldGuideContent).forEach(category => {
    const content = fieldGuideContent[category];
    const text = content.title + ' ' + content.content;
    
    if (text.toLowerCase().includes(searchTerm)) {
      results.push(category);
    }
  });

  const content = document.getElementById('mb-guide-content');
  
  if (results.length > 0) {
    content.innerHTML = `
      <div class="mb-search-results">
        <h3>Search Results for "${query}"</h3>
        ${results.map(category => `
          <div class="mb-search-result" data-category="${category}">
            <h4>${fieldGuideContent[category].title}</h4>
            <p>Click to view full content</p>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="mb-no-results">
        <h3>No results found for "${query}"</h3>
        <p>Try searching for different terms or browse the categories above.</p>
      </div>
    `;
  }
}

async function renderDashboard(body) {
  body.innerHTML = createDashboardTemplate();

  // Add interaction button handler
  body.querySelector("#mb-add-interaction").addEventListener("click", () => {
    // TODO: Implement add interaction modal/form
    showToast("Add interaction feature coming soon!");
  });

  // Add action button handler
  body.querySelector("#mb-add-action").addEventListener("click", () => {
    // TODO: Implement add action modal/form
    showToast("Add action feature coming soon!");
  });
}

async function renderSettings(body) {
  const prefs = await getSync("prefs", {
    apiKey: "",
    manager: "",
    team: "",
    channels: "",
  });

  body.innerHTML = createSettingsTemplate(prefs);

  body
    .querySelector("#mb-save-settings")
    .addEventListener("click", async () => {
      const newPrefs = {
        apiKey: body.querySelector("#mb-api-key").value.trim(),
        manager: body.querySelector("#mb-manager").value.trim(),
        team: body.querySelector("#mb-team").value.trim(),
        channels: body.querySelector("#mb-channels").value.trim(),
      };
      await saveSync("prefs", newPrefs);
      showToast("Saved.");
    });
}

async function renderDiary(body) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const dailyLogs = await getSync("dailyLogs", {});
  const todayEntry = dailyLogs[today] || '';
  
  body.innerHTML = createDiaryTemplate(todayEntry);

  const textarea = body.querySelector("#mb-daily-log-text");
  const saveStatus = body.querySelector("#mb-save-status");
  let saveTimeout;

  // Auto-save functionality
  textarea.addEventListener("input", () => {
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Update save status
    saveStatus.textContent = "Saving...";
    saveStatus.className = "mb-save-status saving";

    // Set new timeout for auto-save
    saveTimeout = setTimeout(async () => {
      const text = textarea.value;
      const updatedLogs = { ...dailyLogs, [today]: text };
      await saveSync("dailyLogs", updatedLogs);
      
      // Update save status
      saveStatus.textContent = "Saved";
      saveStatus.className = "mb-save-status saved";
      
      // Clear status after 2 seconds
      setTimeout(() => {
        saveStatus.textContent = "Saved";
        saveStatus.className = "mb-save-status";
      }, 2000);
    }, 1000); // Auto-save after 1 second of no typing
  });

  // Handle keyboard shortcuts
  textarea.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + S to save immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      saveTimeout = setTimeout(async () => {
        const text = textarea.value;
        const updatedLogs = { ...dailyLogs, [today]: text };
        await saveSync("dailyLogs", updatedLogs);
        
        saveStatus.textContent = "Saved!";
        saveStatus.className = "mb-save-status saved";
        
        setTimeout(() => {
          saveStatus.textContent = "Saved";
          saveStatus.className = "mb-save-status";
        }, 2000);
      }, 0);
    }
  });
}

async function renderCalendar(body) {
  // For now, we'll use mock calendar data
  // In a real implementation, this would fetch from Google Calendar API, Outlook, etc.
  const mockCalendarEvents = [
    // Yesterday's meetings (past tense)
    {
      id: 'event-yesterday-1',
      title: '1:1 with Alex',
      start: new Date(Date.now() - 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // yesterday 2pm
      end: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      description: 'Weekly 1:1 discussion'
    },
    {
      id: 'event-yesterday-2',
      title: 'Project Review',
      start: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // yesterday 4pm
      end: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      description: 'Q4 project status review'
    },
    {
      id: 'event-yesterday-3',
      title: 'Team Retrospective',
      start: new Date(Date.now() - 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // yesterday 6pm
      end: new Date(Date.now() - 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
      description: 'Sprint retrospective'
    },
    
    // Today's meetings (4 meetings)
    {
      id: 'event-today-1',
      title: '1:1 with Sarah',
      start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // today 2pm
      end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      description: 'Weekly 1:1 discussion'
    },
    {
      id: 'event-today-2',
      title: 'Client Meeting - Acme Corp',
      start: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // today 4pm
      end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      description: 'Project kickoff discussion'
    },
    {
      id: 'event-today-3',
      title: 'Engineering Sync',
      start: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // today 6pm
      end: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
      description: 'Technical architecture review'
    },
    {
      id: 'event-today-4',
      title: 'Manager Check-in',
      start: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // today 8pm
      end: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
      description: 'Weekly manager sync'
    },
    
    // Tomorrow's meetings (3 meetings)
    {
      id: 'event-tomorrow-1',
      title: 'Team Standup',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // tomorrow 2pm
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000).toISOString(),
      description: 'Daily team sync'
    },
    {
      id: 'event-tomorrow-2',
      title: 'Performance Review - Tom',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // tomorrow 4pm
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      description: 'Q4 performance review'
    },
    {
      id: 'event-tomorrow-3',
      title: 'Product Planning',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // tomorrow 6pm
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
      description: 'Next sprint planning'
    }
  ];

  const today = new Date();
  body.innerHTML = createCalendarTemplate(mockCalendarEvents, today);
  
  // Add event listeners for calendar interactions
  body.addEventListener('click', (e) => {
    // Handle meeting notes buttons
    if (e.target.classList.contains('mb-meeting-btn')) {
      const eventId = e.target.dataset.eventId;
      if (eventId) {
        addNotes(eventId);
      }
    }
    
    // Handle day section toggles
    if (e.target.closest('.mb-day-header')) {
      const header = e.target.closest('.mb-day-header');
      const section = header.dataset.section;
      if (section) {
        toggleDaySection(section);
      }
    }
  });
}

// Initialize meeting data cache
window.meetingDataCache = {};

// Load existing meeting data on startup
(async () => {
  const savedMeetingData = await getSync("meetingData", {});
  window.meetingDataCache = savedMeetingData;
})();

// Global functions for meeting actions
window.toggleDaySection = (section) => {
  const content = document.getElementById(`${section}-content`);
  const icon = content.previousElementSibling.querySelector('.mb-expand-icon');
  
  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼';
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
};

window.togglePrep = async (meetingId) => {
  // Store meeting data separately from calendar events
  if (!window.meetingDataCache[meetingId]) {
    window.meetingDataCache[meetingId] = { needsPrep: false, notes: '' };
  }
  
  window.meetingDataCache[meetingId].needsPrep = !window.meetingDataCache[meetingId].needsPrep;
  
  // Save to storage
  await saveSync("meetingData", window.meetingDataCache);
  
  // Re-render the calendar
  const body = document.querySelector(".mb-panel-body");
  renderCalendar(body);
};

window.addNotes = async (meetingId) => {
  // Get existing notes
  const currentNotes = window.meetingDataCache[meetingId]?.notes || "";
  
  const notes = prompt("Add notes for this meeting:", currentNotes);
  if (notes === null) return; // User cancelled
  
  // Store meeting data separately from calendar events
  if (!window.meetingDataCache[meetingId]) {
    window.meetingDataCache[meetingId] = { needsPrep: false, notes: '' };
  }
  
  window.meetingDataCache[meetingId].notes = notes;
  
  // Save to storage
  await saveSync("meetingData", window.meetingDataCache);
  
  // Re-render the calendar
  const body = document.querySelector(".mb-panel-body");
  renderCalendar(body);
};

function renderTab(body, tabName) {
  switch (tabName) {
    case "dashboard":
      renderDashboard(body);
      break;
    case "settings":
      renderSettings(body);
      break;
    case "diary":
      renderDiary(body);
      break;
    case "calendar":
      renderCalendar(body);
      break;
    case "fieldguide":
      renderFieldGuide(body);
      break;
  }
}

// ===== UTILITIES =====
function showToast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "mb-toast";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  const body = document.querySelector(".mb-panel-body");
  let currentTab = "diary";
  let settingsVisible = false;

  // Tab switching
  const tabs = document.querySelectorAll(".mb-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (settingsVisible) {
        // Hide settings and show current tab
        settingsVisible = false;
        renderTab(body, currentTab);
        document.querySelector("#mb-settings-toggle").classList.remove("active");
      } else {
        // Normal tab switching
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
        currentTab = tab.dataset.tab;
        renderTab(body, currentTab);
      }
    });
  });

  // Settings icon click
  document.querySelector("#mb-settings-toggle").addEventListener("click", () => {
    if (settingsVisible) {
      // Hide settings and return to current tab
      settingsVisible = false;
      renderTab(body, currentTab);
      document.querySelector("#mb-settings-toggle").classList.remove("active");
    } else {
      // Show settings
      settingsVisible = true;
      renderSettings(body);
      document.querySelector("#mb-settings-toggle").classList.add("active");
    }
  });

  // Start with dashboard tab
  renderTab(body, "dashboard");
});

