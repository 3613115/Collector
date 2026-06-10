# Collector

Collector is a polished, cozy browser idle clicker / collector game built with plain HTML, CSS, and JavaScript. The player clicks a glowing collector orb to gather **Energy**, spends Energy on upgrades, finishes quests, claims daily rewards, unlocks milestones, and earns passive Energy while away.

## Version 3 Highlights

Version 3 keeps the original Collector loop intact and adds long-term engagement systems for collections, rebirth progression, rotating events, and local rankings:

- **Collection / 图鉴 system**: collectible items unlock from clicks, upgrades, daily rewards, quests, milestones, events, prestige, and the Prestige shop. Each item has a rarity, a cute icon, a trigger hint, and a small bonus.
- **Locked item silhouettes**: the Collection panel shows all items with placeholders until the player discovers them.
- **Prestige / Rebirth system**: reaching 25,000 total Energy or 28 upgrade levels unlocks a prominent Prestige flow that resets the current run and grants Prestige points.
- **Prestige shop**: spend Prestige points on permanent production bonuses, the Epic Ancient Album collectible, and a Prism Skin cosmetic for the collector orb.
- **Daily tasks**: rotating daily tasks are separate from normal quests and refresh each calendar day.
- **Limited-time event tasks**: the Starlight Festival rotates in multi-day windows with clear start/end dates, remaining-time labels, reward previews, and special rewards.
- **Achievement bonuses**: achievements now show total unlocked progress and add a small global production bonus.
- **Local leaderboard**: localStorage records top local rebirth runs by Energy and Prestige count.
- **Offline earnings**: returning players receive Energy based on their current Energy per second and permanent bonuses, capped at 8 hours away.
- **Welcome back message**: the game shows how much Energy was earned while away.
- **Daily reward**: a once-per-calendar-day claim button grants a scaling Energy reward based on total Energy earned and current production.
- **Quest system**: three active quests are always available, including goals for clicks, Energy earned, upgrades purchased, Energy per second, achievements, and daily rewards.
- **Progression milestones**: 1,000, 10,000, 100,000, and 1,000,000 total Energy milestones unlock run production bonuses and can reveal collectibles.
- **Expanded stats panel**: tracks Energy, total Energy earned, Energy per click, Energy per second, clicks, upgrades, achievements, collection progress, Prestige, quests completed, and current multiplier.
- **UX improvements**: Collection and Prestige panels, confirmation modal for rebirth, mobile layout refinements, a How to Play modal, sound mute, and safer reset confirmation that requires typing `RESET`.

## How to Play

1. Open the game in a browser.
2. Click or tap the large glowing collector orb to gain Energy.
3. Spend Energy on upgrades that improve clicks, automatic income, multipliers, and lucky bonus clicks.
4. Claim the daily reward once per day for a scaling Energy boost.
5. Complete the three active quests for bonus Energy and long-term progression.
6. Reach total Energy milestones to unlock production bonuses and collectible items.
7. Complete rotating daily tasks and limited-time event tasks for extra rewards.
8. Open the Collection panel to review unlocked items and locked silhouettes.
9. Prestige when eligible to earn permanent points, then spend them in the Prestige shop.
10. Come back later to collect offline Energy, based on your current Energy per second.
11. Progress saves automatically in your browser with `localStorage`.

## Controls

- **Click / tap the collector orb**: Gain Energy and trigger floating feedback with particle bursts.
- **Buy upgrade buttons**: Purchase upgrade levels when you have enough Energy.
- **Daily reward button**: Claim one reward per calendar day.
- **Collection button**: Open the 图鉴 panel with unlocked items and locked silhouettes.
- **Prestige button**: Open a confirmation modal when a rebirth is available.
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
- Rotating daily tasks separate from normal quests.
- Multi-day Starlight Festival event tasks with start/end dates and reward previews.
- Permanent milestone bonuses at 1,000, 10,000, 100,000, and 1,000,000 total Energy.
- Collection / 图鉴 items with Common, Rare, and Epic rarities, locked silhouettes, and small bonuses.
- Prestige / Rebirth threshold at 25,000 total Energy or 28 upgrade levels.
- Prestige points that can buy permanent production, a special collectible, and a cosmetic Prism Skin.
- Achievement milestones with toast notifications and a small global production bonus:
  - First Click
  - 100 Energy
  - 1,000 Energy
  - First Upgrade
  - 10 Upgrades
  - Collector Novice
  - Reborn
  - Event Helper
- Local leaderboard saved in `localStorage` for best rebirth runs.
- Expanded stats panel for current and lifetime progress.
- Automatic progress saving with `localStorage` for Energy, upgrades, achievements, daily rewards, offline earnings, collection unlocks, Prestige, event tasks, and rankings.
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
- Achievements unlock, show notifications, and increase the achievement bonus.
- Collection panel shows unlocked items and locked silhouettes correctly.
- Prestige becomes available at 25,000 total Energy or 28 upgrade levels.
- Prestige resets Energy/upgrades/current run progress and grants Prestige points.
- Prestige shop purchases apply permanent bonuses, special collectibles, or cosmetics.
- Daily tasks refresh and pay rewards separately from normal quests.
- Limited-time events display start/end indicators, reward previews, and claimable rewards.
- Local leaderboard records completed rebirth runs.
- Mute/unmute changes sound behavior.
- Reset progress requires stronger confirmation and clears saved data.
- Layout remains usable on desktop and mobile screen sizes.
