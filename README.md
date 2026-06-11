# Collector

Collector is a cozy idle clicker browser game where players collect **Energy**, upgrade production, unlock skins, complete quests, build a collection, and grow a glowing energy core over time. Version 5 is the final polish pass for OEECO.COM submission and focuses on turning the central Collector orb into a premium **Neon Crystal Energy Core** while preserving the existing gameplay loop.

## Short Description

Collector is a cozy idle clicker game where players collect Energy, upgrade their production, unlock skins, complete quests, and grow a glowing energy core over time.

## Version 5 Final Polish Highlights

- **Premium Neon Crystal Energy Core**: the central clickable orb is now a layered CSS-built crystal core with an outer halo, glassy shell, inner glow, highlight reflection, energy rings, internal particles, breathing glow, and rotating swirl.
- **Improved click feedback**: every click triggers bounce feedback, glow pulses, ripple rings, particle bursts, and floating Energy numbers; Lucky Spark bonus clicks receive a warm special flash.
- **Visual core evolution**: the core now progresses from Stage 1 to Stage 5 based on total Energy, prestige count, multiplier, production, and upgrade progress. A small in-game label shows the current stage.
- **State expression through the orb**: prestige availability adds a subtle golden ring, active event boosts add a faster aura, and completed rewards or celebrations sparkle around the core.
- **Improved skin presentation**: existing skins visibly recolor and restyle the core through CSS variables, gradients, glow colors, polished preview cards, rarity labels, and unlock/equip celebrations.
- **Final UI polish**: the hero area, panels, buttons, cards, shadows, spacing, and responsive layout have been refined to feel like a complete submitted web game rather than a prototype.
- **Submission-ready help text**: the in-game guide explains what Collector is, how to play, and why to keep collecting.

## Main Features

- Central clickable Collector core that generates Energy.
- Energy per click and Energy per second production.
- Four scaling upgrades:
  - **Better Collector**: increases Energy per click.
  - **Auto Collector**: generates passive Energy every second.
  - **Energy Core**: increases the global production multiplier.
  - **Lucky Spark**: adds a chance for 5x bonus Energy clicks.
- Automatic idle income.
- Offline earnings capped at 8 hours.
- Automatic `localStorage` saving.
- Achievements with production bonuses and celebration effects.
- Quests with rewards and automatic replacement.
- Daily rewards and daily challenges.
- Rotating daily tasks and limited-time Starlight Festival event tasks.
- Event Tokens and Event Shop rewards.
- Collection system with rarities, bonuses, locked previews, and completion rewards.
- Prestige / Rebirth system with permanent points and shop upgrades.
- Equippable skins: Default Core, Neon Orb, Crystal Star, Lucky Cat, Space Gem, and Golden Core.
- Local leaderboard records saved in the browser.
- Share Progress button with clipboard support and fallback text box.
- Web Audio API sound effects and mute button.
- Safer reset progress flow.
- Responsive desktop and mobile layout.
- No external libraries and no image assets.

## How to Play

1. Open the game in a browser.
2. Click or tap the large Neon Crystal Energy Core to collect Energy.
3. Watch the core pulse, ripple, and burst with particles as Energy numbers float upward.
4. Spend Energy on upgrades to improve click power, idle production, multipliers, and Lucky Spark bonus clicks.
5. Claim the daily reward once per calendar day.
6. Complete quests, daily tasks, daily challenges, and event tasks for extra Energy and Event Tokens.
7. Unlock collection items and skins by reaching goals.
8. Equip skins to change the look and glow style of the central core.
9. Prestige when eligible to reset the current run for permanent points and long-term bonuses.
10. Return later to collect offline earnings.

## Controls

- **Click / tap the central core**: collect Energy.
- **Upgrades tab**: buy upgrades when you have enough Energy.
- **Quests tab**: view quests, daily reward, daily tasks, and daily challenge progress.
- **Achievements tab**: view achievements and milestones.
- **Collection tab / Collection button**: view unlocked collectibles and locked silhouettes.
- **Skins tab**: preview, unlock, and equip core skins.
- **Prestige tab**: view rebirth progress and spend Prestige points.
- **Leaderboard tab**: view local browser records.
- **Event tab**: complete event tasks and spend Event Tokens.
- **Share Progress**: copy or display a progress summary.
- **How to play**: open the in-game guide.
- **Sound / Muted**: toggle Web Audio API sounds.
- **Reset progress**: clear local saved progress after confirmation.

## Progress Saving

Collector saves progress automatically in the browser with `localStorage`.

Saved data includes:

- Current Energy and total Energy earned.
- Clicks, upgrades, and production state.
- Achievements and milestones.
- Active quests, completed quest count, daily tasks, and daily challenge state.
- Daily reward claim date and daily claim count.
- Collection unlocks and completion rewards.
- Prestige count, Prestige points, and Prestige shop purchases.
- Skin unlocks and equipped skin.
- Event task state, Event Tokens, Event Shop purchases, and temporary boost timers.
- Local leaderboard records.
- Mute setting.

Because saving is local to the browser, progress will not transfer automatically to another device or browser profile.

## Run Locally

Collector is fully static and can run by opening the HTML file directly:

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

You can also serve it with a simple local static server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

No build step, package install, external library, or server backend is required.

## Deploy on GitHub Pages

1. Push the project files to a GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings** → **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch.
6. Select the repository root folder.
7. Save the settings.
8. Wait for GitHub Pages to publish the site and provide a public URL.

Collector is a static HTML/CSS/JavaScript game, so GitHub Pages can host it without a build process.

## Suggested OEECO Description

Collector is a cozy idle clicker game where players collect Energy, upgrade their production, unlock skins, complete quests, and grow a glowing energy core over time. The central Neon Crystal Energy Core evolves visually as players progress, while achievements, daily rewards, quests, collections, events, prestige, and local leaderboard records provide long-term goals.

## Technical Notes

- Built with plain HTML, CSS, and JavaScript.
- Uses CSS gradients, pseudo-elements, shadows, and animations for the core visuals.
- Uses JavaScript-generated particles for click, reward, skin, prestige, and event feedback.
- Uses the Web Audio API for lightweight generated sound effects.
- Uses `localStorage` for all persistence.
- Uses no external libraries.
- Uses no image files for the orb.
- Designed to run directly from `index.html`.

## Testing Checklist

Before release, verify the following in a browser:

### Orb

- The orb looks layered and premium.
- The orb has glow, inner core, highlight, breathing animation, and subtle swirl.
- Click feedback works.
- Particle bursts appear on click.
- Floating Energy numbers appear on click.
- Lucky Spark clicks trigger a special flash.
- Core stages update as progress increases.
- Equipped skins visibly change the orb.
- Prestige availability adds a subtle golden ring.
- Active boost state adds a faster aura.
- Reward and celebration states sparkle without becoming too chaotic.

### Game Systems

- Energy increases correctly from clicking.
- Upgrades work and update costs.
- Auto income works.
- Progress saves and reloads from `localStorage`.
- Offline earnings work.
- Daily reward works once per calendar day.
- Quests work and refresh.
- Achievements unlock.
- Milestones unlock.
- Collection unlocks and completion rewards work.
- Prestige works and grants points.
- Skins unlock, equip, and save correctly.
- Leaderboard updates.
- Share Progress works or shows the fallback.
- Event Shop purchases work.
- Mute button works.
- Reset progress works after confirmation.

### Layout

- Desktop layout looks polished and readable.
- Mobile layout is usable.
- No important content is cut off.
- Panels remain organized.
- Important stats remain easy to read.
- UI feels submission-ready for OEECO.COM.
