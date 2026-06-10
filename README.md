# Collector

Collector is a polished, cozy browser idle clicker / collector game built with plain HTML, CSS, and JavaScript. The player clicks a glowing collector orb to gather **Energy**, spends Energy on upgrades, finishes quests, claims daily rewards, unlocks milestones, and earns passive Energy while away.

## Version 2 Highlights

Version 2 keeps the original Collector loop intact and adds more reasons to return:

- **Offline earnings**: returning players receive Energy based on their current Energy per second, capped at 8 hours away.
- **Welcome back message**: the game shows how much Energy was earned while away.
- **Daily reward**: a once-per-calendar-day claim button grants a scaling Energy reward based on total Energy earned and current production.
- **Quest system**: three active quests are always available, including goals for clicks, Energy earned, upgrades purchased, Energy per second, achievements, and daily rewards.
- **Quest rewards and refreshes**: completed quests show a notification, grant bonus Energy, increment total quests completed, and are replaced by new quests.
- **Progression milestones**: 1,000, 10,000, 100,000, and 1,000,000 total Energy milestones unlock permanent production bonuses.
- **Expanded stats panel**: tracks Energy, total Energy earned, Energy per click, Energy per second, clicks, upgrades, achievements, quests completed, and current multiplier.
- **Upgrade polish**: upgrade cards show levels, costs, current and next production impact, affordability, disabled states, and purchase feedback.
- **Visual polish**: improved collector animation, particle bursts, stronger floating number feedback, subtle background motion, and a cleaner modern layout.
- **UX improvements**: mobile layout refinements, a How to Play modal, and safer reset confirmation that requires typing `RESET`.

## How to Play

1. Open the game in a browser.
2. Click or tap the large glowing collector orb to gain Energy.
3. Spend Energy on upgrades that improve clicks, automatic income, multipliers, and lucky bonus clicks.
4. Claim the daily reward once per day for a scaling Energy boost.
5. Complete the three active quests for bonus Energy and long-term progression.
6. Reach total Energy milestones to unlock permanent production bonuses.
7. Come back later to collect offline Energy, based on your current Energy per second.
8. Progress saves automatically in your browser with `localStorage`.

## Controls

- **Click / tap the collector orb**: Gain Energy and trigger floating feedback with particle bursts.
- **Buy upgrade buttons**: Purchase upgrade levels when you have enough Energy.
- **Daily reward button**: Claim one reward per calendar day.
- **How to play button**: Open a short in-game guide.
- **Sound button**: Mute or unmute generated Web Audio API sounds.
- **Reset progress**: Clear saved progress only after a confirmation prompt and typing `RESET`.

## Features

- Manual clicking with improved floating `+Energy` feedback and collector animation.
- Main resource display for current Energy, total Energy earned, Energy per click, Energy per second, and multiplier.
- Friendly number formatting for larger values.
- Four scaling upgrades:
  - **Better Collector**: increases Energy per click.
  - **Auto Collector**: generates Energy every second.
  - **Energy Core**: multiplies all click and automatic production.
  - **Lucky Spark**: adds a chance for bonus Energy on click.
- Idle Energy-per-second income.
- Offline Energy earnings capped at 8 hours.
- Once-per-day scaling daily reward.
- Three active quests with automatic replacement and rewards.
- Permanent milestone bonuses at 1,000, 10,000, 100,000, and 1,000,000 total Energy.
- Achievement milestones with toast notifications:
  - First Click
  - 100 Energy
  - 1,000 Energy
  - First Upgrade
  - 10 Upgrades
- Expanded stats panel for current and lifetime progress.
- Automatic progress saving with `localStorage`.
- Safer reset progress flow.
- Simple generated sounds for clicks, upgrades, achievements, quests, and milestones using the Web Audio API.
- Responsive, cute, cozy, clean arcade visual design for desktop and mobile.
- No external libraries or external assets.

## Run Locally

Because Collector uses only static files, it can run directly from the filesystem:

1. Download or clone this repository.
2. Open `index.html` in your browser.

You can also serve it locally with any static server, for example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push the project to a GitHub repository.
2. In GitHub, open **Settings** → **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the repository root folder.
5. Save the settings.
6. GitHub Pages will publish the game and provide a public URL.

The game is fully static, so no build step is required.

## Testing Checklist

Before release, verify the following in a browser:

- Clicking the collector increases Energy.
- Floating feedback and particles appear on click.
- Upgrade buttons become enabled when affordable and disabled when not affordable.
- Upgrades can be purchased, their costs increase, and purchase feedback appears.
- Better Collector increases Energy per click.
- Auto Collector generates Energy every second.
- Energy Core increases click and idle production.
- Lucky Spark can trigger bonus click Energy.
- Progress remains after refreshing the page.
- Offline earnings are awarded after returning, capped at 8 hours.
- Daily reward can be claimed once per calendar day only.
- Quests complete, grant rewards, increment the quest total, and refresh.
- Milestones unlock at 1,000, 10,000, 100,000, and 1,000,000 total Energy.
- Milestone bonuses increase the current multiplier.
- Achievements unlock and show notifications.
- Mute/unmute changes sound behavior.
- Reset progress requires stronger confirmation and clears saved data.
- Layout remains usable on desktop and mobile screen sizes.
