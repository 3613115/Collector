# Collector

Collector is a polished, cozy browser idle clicker / collector game built with plain HTML, CSS, and JavaScript. The player clicks a glowing Collector core to gather **Energy**, spends Energy on upgrades, finishes quests and challenges, unlocks cosmetics and collectibles, shops during events, prestiges for permanent power, and earns passive Energy while away.

## Version 4 Highlights

Version 4 keeps the existing Collector loop intact while making the game feel more complete, sticky, and submission-ready for OEECO.COM:

- **Skin / cosmetic system**: six equippable Collector skins are available: Default Core, Neon Orb, Crystal Star, Lucky Cat, Space Gem, and Golden Core. Each skin includes rarity, unlock requirements, a unique visual style, and optional small equipped bonuses.
- **Skins panel**: players can view locked and unlocked skins, read unlock conditions, equip unlocked skins, and keep the equipped skin saved in `localStorage`.
- **Improved collection system**: collectibles now include Common, Rare, Epic, and Legendary rarity styling, permanent bonuses, collection completion percentage, and completion rewards at 25%, 50%, 75%, and 100%.
- **Local leaderboard records**: the leaderboard now tracks top local records such as highest total Energy, highest Prestige points, most quests completed, and fastest time to 10,000 Energy.
- **Share Progress**: generates a short progress summary and copies it to the clipboard when available, with a manual-copy fallback box when clipboard access is unavailable.
- **Daily challenge**: a larger once-per-calendar-day challenge is separate from normal quests and daily tasks, with clear progress, saved state, and larger Energy + Event Token rewards.
- **Event shop**: event tasks award Event Tokens that can be spent on an Energy Bundle, a temporary Starlight Boost, or the exclusive Golden Core skin and Legendary collectible.
- **Visual feedback polish**: enhanced particles, upgrade glow bursts, celebration sparkles, improved notifications, and special feedback for achievements, quests, daily challenges, prestige, event purchases, records, and skin unlocks.
- **Tabbed UI organization**: major systems are organized into Upgrades, Quests, Achievements, Collection, Skins, Prestige, Leaderboard, and Event tabs while important Energy stats stay visible.
- **Audio polish**: Web Audio API sounds cover clicks, upgrades, achievements, skin unlocks, daily challenge completion, leaderboard records, event purchases, and prestige, while mute/unmute remains supported.

## How to Play

1. Open the game in a browser.
2. Click or tap the large Collector core to gain Energy.
3. Spend Energy on upgrades that improve clicks, automatic income, multipliers, and lucky bonus clicks.
4. Claim the daily reward once per day for a scaling Energy boost.
5. Complete active quests, daily tasks, and the daily challenge for bonus rewards.
6. Reach total Energy milestones to unlock production bonuses and collectible items.
7. Complete limited-time event tasks to earn Event Tokens, then spend them in the Event Shop.
8. Open Collection to review rarity badges, permanent bonuses, completion progress, and completion rewards.
9. Open Skins to equip unlocked cosmetics and change the central Collector appearance.
10. Prestige when eligible to earn permanent points, then spend them in the Prestige shop.
11. Use Share Progress to copy a friendly progress summary.
12. Come back later to collect offline Energy, based on your current Energy per second.
13. Progress saves automatically in your browser with `localStorage`.

## Controls

- **Click / tap the Collector**: Gain Energy and trigger floating feedback with particle bursts.
- **Tabs**: Switch between Upgrades, Quests, Achievements, Collection, Skins, Prestige, Leaderboard, and Event sections.
- **Buy upgrade buttons**: Purchase upgrade levels when you have enough Energy.
- **Daily reward button**: Claim one reward per calendar day.
- **Daily challenge button**: Claim a larger reward after finishing the daily challenge.
- **Event Shop buttons**: Spend Event Tokens on event rewards.
- **Skin equip buttons**: Equip unlocked Collector skins.
- **Collection button**: Open the collection modal with unlocked items and locked silhouettes.
- **Share Progress button**: Copy or reveal a short progress summary.
- **Prestige button**: Open a confirmation modal when a rebirth is available.
- **How to play button**: Open a short in-game guide.
- **Sound button**: Mute or unmute generated Web Audio API sounds.
- **Reset progress**: Clear saved progress only after a confirmation prompt and typing `RESET`.

## Features

- Manual clicking with polished floating `+Energy` feedback, particles, and Collector animation.
- Main resource display for current Energy, total Energy earned, Energy per click, Energy per second, Prestige points, and current multiplier.
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
- One larger daily challenge that resets by calendar day.
- Multi-day Starlight Festival event tasks with start/end dates, Energy rewards, and Event Token rewards.
- Event Shop rewards: Energy Bundle, temporary Starlight Boost, and exclusive Golden Core skin / Starlight Voucher collectible.
- Permanent milestone bonuses at 1,000, 10,000, 100,000, and 1,000,000 total Energy.
- Collection items with Common, Rare, Epic, and Legendary rarities, locked silhouettes, and small bonuses.
- Automatic collection completion rewards at 25%, 50%, 75%, and 100%.
- Six Collector skins with saved unlocks and equipped state.
- Prestige / Rebirth threshold at 25,000 total Energy or 28 upgrade levels.
- Prestige points that can buy permanent production, a special collectible, and a cosmetic Prism Skin.
- Achievement milestones with toast notifications and a small global production bonus.
- Local leaderboard saved in `localStorage` for best local records.
- Share text generation with clipboard support and fallback.
- Expanded stats panel for current and lifetime progress.
- Automatic progress saving with `localStorage` for Energy, upgrades, achievements, daily rewards, offline earnings, collection unlocks/rewards, skins, Prestige, event tasks, event tokens/shop purchases, daily challenge, and rankings.
- Safer reset progress flow.
- Simple generated sounds using only the Web Audio API.
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

- Clicking the Collector increases Energy.
- Floating feedback and improved particles appear on click.
- Upgrade buttons become enabled when affordable and disabled when not affordable.
- Upgrades can be purchased, their costs increase, and purchase glow feedback appears.
- Better Collector increases Energy per click.
- Auto Collector generates Energy every second.
- Energy Core increases click and idle production.
- Lucky Spark can trigger bonus click Energy.
- Progress remains after refreshing the page.
- Offline earnings are awarded after returning, capped at 8 hours.
- Daily reward can be claimed once per calendar day only.
- Quests complete, grant rewards, increment the quest total, and refresh.
- Daily challenge resets by calendar day, saves progress, and pays a larger reward.
- Milestones unlock at 1,000, 10,000, 100,000, and 1,000,000 total Energy.
- Milestone bonuses increase the current multiplier.
- Achievements unlock, show notifications, and trigger celebration effects.
- Collection panel shows rarity colors, bonuses, completion percentage, and completion rewards.
- Skins unlock, equip correctly, change the central Collector, and persist after refresh.
- Prestige becomes available at 25,000 total Energy or 28 upgrade levels.
- Prestige resets Energy/upgrades/current run progress and grants Prestige points.
- Prestige shop purchases apply permanent bonuses, special collectibles, or cosmetics.
- Limited-time events display start/end indicators and claimable rewards.
- Event tasks award Event Tokens.
- Event Shop purchases work and persist.
- Local leaderboard records best local runs / records.
- Share Progress copies text or shows the fallback text box.
- Mute/unmute changes sound behavior.
- Reset progress requires stronger confirmation and clears saved data.
- Layout remains usable on desktop and mobile screen sizes.
