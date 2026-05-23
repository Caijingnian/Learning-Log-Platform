# Learning Log Platform

Learning Log Platform is a clean, Apple-inspired web platform for recording daily learning progress and generating structured daily, weekly, and monthly reports.

It is designed for end-of-day reflection: write down what you completed, submit a daily report, track completed days on a calendar, and generate higher-level summaries from your learning history.

## Preview

Open the project locally and use it directly in your browser:

```text
http://127.0.0.1:8000/
```

## Core Features

- Daily learning task input with dynamic task cards
- Add or remove multiple completed tasks
- Submit a daily report for any selected calendar date
- Monthly calendar with red check marks for submitted daily reports
- Weekly report generation from a selected Saturday
- Monthly report generation from the first day of a month
- Fixed, aligned card layout for Daily Log, Daily Report, Weekly Report, and Monthly Report
- Scrollable Daily Log area when many tasks are added
- Scrollable report content when summaries become long
- Local browser storage with no backend required
- Minimal black-and-white interface inspired by Apple's clean product style
- Custom vector logo and favicon

## Tech Stack

This project is intentionally lightweight:

- HTML
- CSS
- Vanilla JavaScript
- Browser `localStorage`

There is no database, backend server, build step, or framework requirement.

## Project Structure

```text
Learning-Log-Platform/
├── assets/
│   └── logo.svg
├── app.js
├── index.html
├── package.json
├── styles.css
├── .gitignore
└── README.md
```

## Installation And Running On macOS

### Option 1: Run With Python

Most macOS systems already include Python or can install it easily.

1. Open Terminal.
2. Go to the project folder:

```bash
cd path/to/Learning-Log-Platform
```

3. Start a local static server:

```bash
python3 -m http.server 8000
```

4. Open this address in your browser:

```text
http://127.0.0.1:8000/
```

### Option 2: Run With npm

If you have Node.js installed:

```bash
npm run start
```

Then open:

```text
http://127.0.0.1:8000/
```

### Option 3: Open The HTML File Directly

You can also double-click `index.html`.

For the best browser behavior and future compatibility, using a local server is recommended.

## Installation And Running On Windows

### Option 1: Run With Python

1. Install Python from [python.org](https://www.python.org/downloads/) if it is not already installed.
2. Open Command Prompt or PowerShell.
3. Go to the project folder:

```powershell
cd path\to\Learning-Log-Platform
```

4. Start a local static server:

```powershell
py -m http.server 8000
```

5. Open this address in your browser:

```text
http://127.0.0.1:8000/
```

### Option 2: Run With npm

If Node.js is installed:

```powershell
npm run start:windows
```

Then open:

```text
http://127.0.0.1:8000/
```

### Option 3: Open The HTML File Directly

You can double-click `index.html` and use the app without installing anything else.

Running a local server is still recommended for a cleaner development workflow.

## How To Use

### 1. Select A Date

Use the calendar at the top of the page to select the date you want to write a learning log for.

### 2. Add Completed Tasks

In the `Daily Log` card, write the task you completed.

Click the `+` button to add another completed task. If many task cards are added, the Daily Log area becomes scrollable while the overall layout stays aligned.

### 3. Submit A Daily Report

Click `Submit Daily Report`.

After submission:

- A Daily Report is generated
- The selected calendar date receives a red check mark
- The data is saved in your browser

### 4. Generate A Weekly Report

Weekly reports can be generated only when a Saturday is selected.

The weekly report summarizes the daily reports from that week and appears in the `Weekly Report` card.

### 5. Generate A Monthly Report

Monthly reports can be generated only when the first day of a month is selected.

The monthly report summarizes the previous month.

Examples:

- Select `June 1, 2026` to generate the report for `May 2026`
- Select `July 1, 2026` to generate the report for `June 2026`

## Report Generation Rules

### Daily Report

A daily report is generated from the completed tasks submitted for the selected date.

### Weekly Report

A weekly report is generated from the daily reports in the selected week.

The generation button is available only on Saturdays.

### Monthly Report

A monthly report is generated from the daily reports in the previous month.

The generation button is available only on the first day of a month.

## Data Storage

The app stores data in browser `localStorage`.

This means:

- Your reports stay available in the same browser
- No account is required
- No server is required
- Clearing browser site data will remove saved reports
- Data is not automatically synced across devices

## Development Notes

Because this is a static project, development is simple:

1. Edit `index.html`, `styles.css`, or `app.js`
2. Refresh the browser
3. Test the interaction

Main files:

- `index.html`: Page structure and report card layout
- `styles.css`: Visual design, alignment, responsive behavior, and scroll areas
- `app.js`: Calendar logic, task management, local storage, and report generation
- `assets/logo.svg`: Vector logo used in the header and browser tab

## GitHub Pages Deployment

This project can be deployed with GitHub Pages because it is a static website.

Recommended settings:

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Open `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select the `main` branch and `/root`.
6. Save the settings.

GitHub will provide a public website URL after deployment.

## License

This project is released under the MIT License.
