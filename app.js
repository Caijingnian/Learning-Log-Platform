const STORAGE_KEY = "learning-log-platform:logs:v1";

const state = loadState();
const today = startOfDay(new Date());

let selectedDate = startOfDay(new Date());
let visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
let tasks = [""];

const elements = {
  todayChip: document.querySelector("#todayChip"),
  monthLabel: document.querySelector("#monthLabel"),
  calendarGrid: document.querySelector("#calendarGrid"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  taskList: document.querySelector("#taskList"),
  dailyForm: document.querySelector("#dailyForm"),
  addTask: document.querySelector("#addTask"),
  formMessage: document.querySelector("#formMessage"),
  dailyReport: document.querySelector("#dailyReport"),
  weekRangeLabel: document.querySelector("#weekRangeLabel"),
  generateWeekly: document.querySelector("#generateWeekly"),
  weeklyMessage: document.querySelector("#weeklyMessage"),
  weeklyReport: document.querySelector("#weeklyReport"),
  monthRangeLabel: document.querySelector("#monthRangeLabel"),
  generateMonthly: document.querySelector("#generateMonthly"),
  monthlyMessage: document.querySelector("#monthlyMessage"),
  monthlyReport: document.querySelector("#monthlyReport"),
};

elements.prevMonth.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

elements.nextMonth.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

elements.addTask.addEventListener("click", () => {
  tasks.push("");
  renderTasks();
  const inputs = elements.taskList.querySelectorAll("textarea");
  inputs[inputs.length - 1]?.focus();
});

elements.dailyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncTasksFromInputs();

  const cleanTasks = tasks.map((task) => task.trim()).filter(Boolean);
  if (!cleanTasks.length) {
    elements.formMessage.textContent = "Add at least one completed task before submitting.";
    elements.taskList.querySelector("textarea")?.focus();
    return;
  }

  const key = toDateKey(selectedDate);
  state.dailyReports[key] = {
    date: key,
    tasks: cleanTasks,
    createdAt: state.dailyReports[key]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveState();
  tasks = [...cleanTasks];
  elements.formMessage.textContent = "Daily report saved.";
  renderTasks();
  renderCalendar();
  renderDailyReport();
  renderWeeklyPanel();
  renderMonthlyPanel();
});

elements.generateWeekly.addEventListener("click", () => {
  const saturday = getSelectedWeekSaturday();
  const report = buildWeeklyReport(saturday);
  const weekKey = toDateKey(saturday);

  if (!report.days.length) {
    elements.weeklyMessage.textContent = "No daily reports are available for this week.";
    renderWeeklyReport(null);
    return;
  }

  state.weeklyReports[weekKey] = {
    ...report,
    generatedAt: new Date().toISOString(),
  };

  saveState();
  elements.weeklyMessage.textContent = "Weekly report generated.";
  renderWeeklyReport(state.weeklyReports[weekKey]);
});

elements.generateMonthly.addEventListener("click", () => {
  const period = getPreviousMonthPeriod(selectedDate);
  const report = buildMonthlyReport(period);

  if (!report.days.length) {
    elements.monthlyMessage.textContent = "No daily reports are available for this month.";
    renderMonthlyReport(null);
    return;
  }

  state.monthlyReports[period.monthKey] = {
    ...report,
    generatedAt: new Date().toISOString(),
  };

  saveState();
  elements.monthlyMessage.textContent = "Monthly report generated.";
  renderMonthlyReport(state.monthlyReports[period.monthKey]);
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      dailyReports: saved?.dailyReports || {},
      weeklyReports: saved?.weeklyReports || {},
      monthlyReports: saved?.monthlyReports || {},
    };
  } catch {
    return {
      dailyReports: {},
      weeklyReports: {},
      monthlyReports: {},
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  elements.todayChip.textContent = formatLongDate(today);
  loadSelectedDate();
  renderCalendar();
  renderTasks();
  renderDailyReport();
  renderWeeklyPanel();
  renderMonthlyPanel();
}

function renderCalendar() {
  elements.monthLabel.textContent = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  elements.calendarGrid.innerHTML = "";

  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const gridStart = addDays(firstDay, -getMondayIndex(firstDay));

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const key = toDateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.setAttribute("aria-label", formatLongDate(date));

    if (date.getMonth() !== visibleMonth.getMonth()) {
      button.classList.add("is-outside");
    }

    if (isSameDate(date, today)) {
      button.classList.add("is-today");
    }

    if (isSameDate(date, selectedDate)) {
      button.classList.add("is-selected");
      button.setAttribute("aria-current", "date");
    }

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = String(date.getDate());
    button.append(number);

    if (state.dailyReports[key]) {
      const check = document.createElement("span");
      check.className = "checkmark";
      check.setAttribute("aria-label", "Daily report submitted");
      check.textContent = "✓";
      button.append(check);
    }

    button.addEventListener("click", () => {
      selectedDate = startOfDay(date);
      visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      elements.formMessage.textContent = "";
      elements.weeklyMessage.textContent = "";
      elements.monthlyMessage.textContent = "";
      loadSelectedDate();
      renderCalendar();
      renderTasks();
      renderDailyReport();
      renderWeeklyPanel();
      renderMonthlyPanel();
    });

    elements.calendarGrid.append(button);
  }
}

function loadSelectedDate() {
  const report = state.dailyReports[toDateKey(selectedDate)];
  tasks = report ? [...report.tasks] : [""];
  elements.selectedDateLabel.textContent = formatLongDate(selectedDate);
}

function renderTasks() {
  elements.taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "task-item";

    const input = document.createElement("textarea");
    input.className = "task-input";
    input.name = `task-${index + 1}`;
    input.placeholder = `Completed task ${index + 1}`;
    input.value = task;
    input.rows = 4;
    input.addEventListener("input", () => {
      tasks[index] = input.value;
    });

    const remove = document.createElement("button");
    remove.className = "icon-button remove-task";
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove task ${index + 1}`);
    remove.title = "Remove task";
    remove.disabled = tasks.length === 1;
    remove.innerHTML = '<span aria-hidden="true">×</span>';
    remove.addEventListener("click", () => {
      syncTasksFromInputs();
      tasks.splice(index, 1);
      if (!tasks.length) {
        tasks = [""];
      }
      renderTasks();
    });

    item.append(input, remove);
    elements.taskList.append(item);
  });
}

function renderDailyReport() {
  const report = state.dailyReports[toDateKey(selectedDate)];

  if (!report) {
    renderEmpty(elements.dailyReport, "No daily report for this date.");
    return;
  }

  elements.dailyReport.classList.remove("empty");
  elements.dailyReport.innerHTML = `
    <h3 class="report-title">Daily Report</h3>
    <p class="report-meta">${escapeHtml(formatLongDate(parseDateKey(report.date)))} · ${report.tasks.length} completed ${pluralize("task", report.tasks.length)}</p>
    <div class="report-section">
      <h3>Completed Work</h3>
      <ul>
        ${report.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}
      </ul>
    </div>
    <div class="report-section">
      <h3>Summary</h3>
      <p>${escapeHtml(buildDailySummary(report.tasks))}</p>
    </div>
  `;
}

function renderWeeklyPanel() {
  const saturday = getSelectedWeekSaturday();
  const weekStart = getWeekStart(saturday);
  const weekKey = toDateKey(saturday);
  const isSaturday = selectedDate.getDay() === 6;

  elements.weekRangeLabel.textContent = `${formatShortDate(weekStart)} - ${formatShortDate(saturday)}`;
  elements.generateWeekly.disabled = !isSaturday;
  elements.generateWeekly.textContent = isSaturday ? "Generate" : "Select Saturday";
  elements.weeklyMessage.textContent = isSaturday ? "" : "Weekly reports are generated from a selected Saturday.";

  renderWeeklyReport(state.weeklyReports[weekKey] || null);
}

function renderWeeklyReport(report) {
  if (!report) {
    renderEmpty(elements.weeklyReport, "No weekly report has been generated for this week.");
    return;
  }

  const totalTasks = report.days.reduce((sum, day) => sum + day.tasks.length, 0);

  elements.weeklyReport.classList.remove("empty");
  elements.weeklyReport.innerHTML = `
    <h3 class="report-title">Weekly Report</h3>
    <p class="report-meta">${escapeHtml(formatShortDate(parseDateKey(report.weekStart)))} - ${escapeHtml(formatShortDate(parseDateKey(report.weekEnd)))} · ${totalTasks} completed ${pluralize("task", totalTasks)}</p>
    <div class="report-section">
      <h3>Weekly Summary</h3>
      <p>${escapeHtml(report.summary)}</p>
    </div>
    <div class="report-section">
      <h3>Daily Breakdown</h3>
      <ul>
        ${report.days
          .map(
            (day) =>
              `<li><strong>${escapeHtml(formatWeekday(parseDateKey(day.date)))}:</strong> ${escapeHtml(day.tasks.join("; "))}</li>`,
          )
          .join("")}
      </ul>
    </div>
  `;
}

function renderMonthlyPanel() {
  const period = getPreviousMonthPeriod(selectedDate);
  const isFirstDay = selectedDate.getDate() === 1;

  elements.monthRangeLabel.textContent = formatMonthYear(period.monthStart);
  elements.generateMonthly.disabled = !isFirstDay;
  elements.generateMonthly.textContent = isFirstDay ? "Generate" : "Select 1st";
  elements.monthlyMessage.textContent = isFirstDay ? "" : "Monthly reports are generated from the first day of a month.";

  renderMonthlyReport(state.monthlyReports[period.monthKey] || null);
}

function renderMonthlyReport(report) {
  if (!report) {
    renderEmpty(elements.monthlyReport, "No monthly report has been generated for this month.");
    return;
  }

  const totalTasks = report.days.reduce((sum, day) => sum + day.tasks.length, 0);

  elements.monthlyReport.classList.remove("empty");
  elements.monthlyReport.innerHTML = `
    <h3 class="report-title">Monthly Report</h3>
    <p class="report-meta">${escapeHtml(formatMonthYear(parseDateKey(report.monthStart)))} · ${totalTasks} completed ${pluralize("task", totalTasks)}</p>
    <div class="report-section">
      <h3>Monthly Summary</h3>
      <p>${escapeHtml(report.summary)}</p>
    </div>
    <div class="report-section">
      <h3>Daily Highlights</h3>
      <ul>
        ${report.days
          .map(
            (day) =>
              `<li><strong>${escapeHtml(formatWeekday(parseDateKey(day.date)))}:</strong> ${escapeHtml(day.tasks.join("; "))}</li>`,
          )
          .join("")}
      </ul>
    </div>
  `;
}

function renderEmpty(target, message) {
  target.classList.add("empty");
  target.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

function buildDailySummary(reportTasks) {
  const summaryTasks = reportTasks.map(toSummaryFragment);

  if (reportTasks.length === 1) {
    return `Today focused on completing one clear task: ${summaryTasks[0]}.`;
  }

  return `Today included ${reportTasks.length} completed tasks: ${joinReadable(summaryTasks.slice(0, 3))}${
    reportTasks.length > 3 ? " and additional work" : ""
  }.`;
}

function buildWeeklyReport(saturday) {
  const weekStart = getWeekStart(saturday);
  const weekEnd = startOfDay(saturday);
  const days = [];

  for (let date = weekStart; date <= weekEnd; date = addDays(date, 1)) {
    const report = state.dailyReports[toDateKey(date)];
    if (report) {
      days.push({
        date: report.date,
        tasks: [...report.tasks],
      });
    }
  }

  const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
  const weeklyTasks = days.flatMap((day) => day.tasks).map(toSummaryFragment);
  const summary =
    days.length === 0
      ? "No daily reports were submitted for this week."
      : `This week collected ${totalTasks} completed ${pluralize("task", totalTasks)} across ${days.length} logged ${pluralize(
          "day",
          days.length,
        )}. Key outcomes included ${joinReadable(weeklyTasks.slice(0, 4))}${
          totalTasks > 4 ? ", with additional supporting progress across the remaining logs" : ""
        }.`;

  return {
    weekStart: toDateKey(weekStart),
    weekEnd: toDateKey(weekEnd),
    days,
    summary,
  };
}

function buildMonthlyReport(period) {
  const days = [];

  for (let date = period.monthStart; date <= period.monthEnd; date = addDays(date, 1)) {
    const report = state.dailyReports[toDateKey(date)];
    if (report) {
      days.push({
        date: report.date,
        tasks: [...report.tasks],
      });
    }
  }

  const totalTasks = days.reduce((sum, day) => sum + day.tasks.length, 0);
  const monthlyTasks = days.flatMap((day) => day.tasks).map(toSummaryFragment);
  const summary =
    days.length === 0
      ? "No daily reports were submitted for this month."
      : `${formatMonthYear(period.monthStart)} collected ${totalTasks} completed ${pluralize(
          "task",
          totalTasks,
        )} across ${days.length} logged ${pluralize("day", days.length)}. Key monthly outcomes included ${joinReadable(
          monthlyTasks.slice(0, 6),
        )}${totalTasks > 6 ? ", with more progress recorded across the remaining daily logs" : ""}.`;

  return {
    monthKey: period.monthKey,
    monthStart: toDateKey(period.monthStart),
    monthEnd: toDateKey(period.monthEnd),
    days,
    summary,
  };
}

function syncTasksFromInputs() {
  tasks = [...elements.taskList.querySelectorAll("textarea")].map((input) => input.value);
}

function getSelectedWeekSaturday() {
  const day = selectedDate.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7;
  return startOfDay(addDays(selectedDate, daysUntilSaturday));
}

function getWeekStart(date) {
  return addDays(startOfDay(date), -5);
}

function getPreviousMonthPeriod(date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth(), 0);

  return {
    monthKey: toMonthKey(monthStart),
    monthStart,
    monthEnd,
  };
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMondayIndex(date) {
  return (date.getDay() + 6) % 7;
}

function isSameDate(first, second) {
  return toDateKey(first) === toDateKey(second);
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatWeekday(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMonthYear(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function joinReadable(items) {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);

  if (cleanItems.length === 0) {
    return "the submitted learning work";
  }

  if (cleanItems.length === 1) {
    return cleanItems[0];
  }

  if (cleanItems.length === 2) {
    return `${cleanItems[0]} and ${cleanItems[1]}`;
  }

  return `${cleanItems.slice(0, -1).join(", ")}, and ${cleanItems[cleanItems.length - 1]}`;
}

function toSummaryFragment(value) {
  return value.trim().replace(/[.!?]+$/u, "");
}

function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
