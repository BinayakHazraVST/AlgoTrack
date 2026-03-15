# AlgoTrack

## Problem Statement 
Software engineering interviews require tracking and memorizing complex algorithms. Students and professionals often struggle to remember the optimal time to revise previously solved problems, leading to "forgetting curves" where knowledge degrades over time. Existing platforms lack an automated, non-intrusive way to structure this revision.

## Reason for Building the Project
AlgoTrack was built to help software engineers strategically pace their algorithmic problem reviews (e.g., LeetCode/HackerRank, Codeforces) to ensure long-term retention seamlessly. It utilizes the scientifically proven spaced-repetition technique internally, removing the cognitive load of deciding *when* to study.

## Target Users
- Computer Science Students preparing for placements.
- Working Software Engineering Professionals studying for technical interviews.
- Coding bootcamp attendees tracking their progress.

## Key Features
- **Local Storage Authentication**: Secure login and signup mechanics stored entirely within the browser's local storage without needing external backend APIs. Accounts are fully segregated.
- **Full CRUD Functionality**: Create, Read, Update (Edit), and Delete your tracked algorithmic problems.
- **Automated Spaced Repetition**: Each successful review advances a step mathematically (+1 day, +3 days, +7 days, etc.), automatically calculating your next review date.
- **Dark Mode**: Persisted dark-mode aesthetic theme selection available natively without reloading.
- **Dynamic Search**: Instant filtering and searching via problem title and associated tags.
- **Graceful Fallbacks**: Incomplete buttons provide smooth UI alerts ("Feature coming soon") avoiding broken layouts.
- **Responsive Navigation**: A clean sidebar layout designed using pure CSS variables to work robustly on Mobile, Tablet, and Desktop forms.

## Tech Stack Used
- **Frontend**: Advanced Vanilla JavaScript (ES Modules), HTML5 semantics
- **Styling**: Native CSS3 with CSS Variables (No frameworks like Tailwind or Bootstrap) 
- **Storage**: Browser Native `localStorage` API

## Installation Steps
1. Clone or download this repository locally:
   ```bash
   git clone <repository-url>
   cd AlgoTrack
   ```
2. Boot the environment locally (Important due to ES Modules CORS restrictions):
   - You **cannot** simply double-click `index.html` on Finder/Explorer, as JavaScript ES modules will be blocked by CORS policy.
   - Using Python: `python3 -m http.server 8000`
   - Using Node.js/NPX: `npx serve .`
   - Using VS Code: Right-click `index.html` and launch utilizing the "Live Server" extension.
3. Open `http://localhost:8000` (or the respective port indicated) in a Modern Web Browser.

## Demo Credentials
To easily evaluate the Authentication flow and Dashboard features without signing up, use the following interactive demo account:

- **Email**: `demo@test.com`
- **Password**: `demo123`

*(Note: You can effortlessly click the "Login as Demo" button on the Authentication page to inject and execute this automatically).*


