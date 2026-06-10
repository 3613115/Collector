# Collector

Collector is a simple, polished browser idle clicker / collector game built with plain HTML, CSS, and JavaScript. The player clicks a glowing collector orb to gather **Energy**, then spends Energy on upgrades that make each click stronger, generate passive income, multiply production, and add lucky bonus clicks.

## How to Play

1. Open the game in a browser.
2. Click the large glowing collector in the center of the screen to gain Energy.
3. Spend Energy on upgrades in the Upgrades panel.
4. Keep collecting to unlock achievements and grow your Energy production.
5. Progress saves automatically in your browser with `localStorage`.

## Controls

- **Click / tap the collector orb**: Gain Energy.
- **Buy buttons**: Purchase upgrade levels when you have enough Energy.
- **Sound button**: Mute or unmute generated Web Audio API sounds.
- **Reset progress**: Clear saved progress after confirming.

## Features

- Manual clicking with floating `+Energy` feedback and a click animation.
- Main resource display for current Energy and total Energy earned.
- Friendly number formatting for larger values.
- Four scaling upgrades:
  - **Better Collector**: increases Energy per click.
  - **Auto Collector**: generates Energy every second.
  - **Energy Core**: multiplies all production.
  - **Lucky Spark**: adds a chance for bonus Energy on click.
- Idle Energy-per-second income.
- Automatic progress saving with `localStorage`.
- Reset progress button with confirmation.
- Achievement milestones with toast notifications:
  - First Click
  - 100 Energy
  - 1,000 Energy
  - First Upgrade
  - 10 Upgrades
- Simple generated sounds for clicks, upgrades, and achievements using the Web Audio API.
- Responsive, modern, cozy arcade visual design for desktop and mobile.
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
- Floating feedback appears on click.
- Upgrade buttons become enabled when affordable.
- Upgrades can be purchased and their costs increase.
- Better Collector increases Energy per click.
- Auto Collector generates Energy every second.
- Energy Core increases click and idle production.
- Lucky Spark can trigger bonus click Energy.
- Progress remains after refreshing the page.
- Reset progress clears saved data after confirmation.
- Achievements unlock and show notifications.
- Mute/unmute changes sound behavior.
- Layout remains usable on desktop and mobile screen sizes.
