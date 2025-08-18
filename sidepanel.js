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
    <div class="mb-field">
      <label>Quiet hours (local)</label>
      <input id="mb-quiet" type="text" placeholder="18:00-09:00" value="${escapeHtml(
        prefs.quietHours
      )}" />
    </div>
    <div class="mb-field">
      <label>Nudges per day (0-2)</label>
      <input id="mb-nudges" type="number" min="0" max="2" value="${
        prefs.nudgesPerDay
      }" />
    </div>
    <button class="mb-save" id="mb-save-settings">Save</button>
    <div class="mb-muted">Private to your browser. Uses chrome.storage.sync.</div>
  `;
}

function createDiaryTemplate(entries) {
  const entriesHtml = entries
    .slice()
    .reverse()
    .map(
      (e) => `
      <div class="mb-entry">
        <div class="mb-muted">${new Date(e.ts).toLocaleString()}</div>
        <div>${escapeHtml(e.text)}</div>
      </div>
    `
    )
    .join("");

  return `
    <div class="mb-field">
      <label>New diary entry</label>
      <textarea id="mb-diary-text" rows="5" placeholder="Meeting notes, 1:1 with Sarah, retro takeaways..."></textarea>
    </div>
    <button class="mb-save" id="mb-save-diary">Save entry</button>
    <div class="mb-entries">
      ${entriesHtml}
    </div>
  `;
}

function createCalendarTemplate(events, today) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();

  let calendarDays = "";

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays += '<div class="mb-calendar-day empty"></div>';
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate();
    const dayEvents = events.filter((e) => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear()
      );
    });

    calendarDays += `
      <div class="mb-calendar-day ${isToday ? "today" : ""} ${
      dayEvents.length > 0 ? "has-events" : ""
    }">
        <span>${day}</span>
        ${dayEvents.length > 0 ? '<div class="mb-event-dot"></div>' : ""}
      </div>`;
  }

  const eventsHtml = events
    .map(
      (e) => `
    <div class="mb-event">
      <div class="mb-muted">${new Date(e.date).toLocaleDateString()}</div>
      <div>${escapeHtml(e.title)}</div>
    </div>
  `
    )
    .join("");

  return `
    <div class="mb-calendar-header">
      <h4>${monthNames[today.getMonth()]} ${today.getFullYear()}</h4>
    </div>
    <div class="mb-calendar-grid">
      <div class="mb-calendar-weekdays">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div class="mb-calendar-days">
        ${calendarDays}
      </div>
    </div>
    <div class="mb-calendar-events">
      <h5>Events</h5>
      <div class="mb-field">
        <label>Add new event</label>
        <input id="mb-event-title" type="text" placeholder="1:1 with Sarah" />
        <input id="mb-event-date" type="date" />
      </div>
      <button class="mb-save" id="mb-save-event">Add Event</button>
      <div class="mb-events-list">
        ${eventsHtml}
      </div>
    </div>
  `;
}

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
async function renderSettings(body) {
  const prefs = await getSync("prefs", {
    team: "",
    channels: "",
    quietHours: "18:00-09:00",
    nudgesPerDay: 2,
  });

  body.innerHTML = createSettingsTemplate(prefs);

  body
    .querySelector("#mb-save-settings")
    .addEventListener("click", async () => {
      const newPrefs = {
        team: body.querySelector("#mb-team").value.trim(),
        channels: body.querySelector("#mb-channels").value.trim(),
        quietHours: body.querySelector("#mb-quiet").value.trim(),
        nudgesPerDay: Math.min(
          2,
          Math.max(0, Number(body.querySelector("#mb-nudges").value || 0))
        ),
      };
      await saveSync("prefs", newPrefs);
      showToast("Saved.");
    });
}

async function renderDiary(body) {
  const entries = await getSync("diaryEntries", []);
  body.innerHTML = createDiaryTemplate(entries);

  body.querySelector("#mb-save-diary").addEventListener("click", async () => {
    const text = body.querySelector("#mb-diary-text").value.trim();
    if (!text) return;
    const updated = [...entries, { ts: Date.now(), text }];
    await saveSync("diaryEntries", updated);
    renderDiary(body);
  });
}

async function renderCalendar(body) {
  const events = await getSync("calendarEvents", []);
  const today = new Date();
  body.innerHTML = createCalendarTemplate(events, today);

  body.querySelector("#mb-save-event").addEventListener("click", async () => {
    const title = body.querySelector("#mb-event-title").value.trim();
    const date = body.querySelector("#mb-event-date").value;
    if (!title || !date) return;
    const updated = [...events, { title, date, ts: Date.now() }];
    await saveSync("calendarEvents", updated);
    renderCalendar(body);
  });
}

function renderTab(body, tabName) {
  switch (tabName) {
    case "settings":
      renderSettings(body);
      break;
    case "diary":
      renderDiary(body);
      break;
    case "calendar":
      renderCalendar(body);
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

  // Tab switching
  const tabs = document.querySelectorAll(".mb-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderTab(body, tab.dataset.tab);
    });
  });

  // Start with settings tab
  renderTab(body, "settings");
});
