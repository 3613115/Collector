const SAVE_KEY = "collectorSaveV3";
const LEGACY_SAVE_KEY = "collectorSaveV1";
const LEADERBOARD_KEY = "collectorLeaderboardV3";
const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
const ACTIVE_QUEST_COUNT = 3;
const PURCHASE_FLASH_MS = 520;
const PRESTIGE_ENERGY_THRESHOLD = 25000;
const PRESTIGE_UPGRADE_THRESHOLD = 28;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EVENT_LENGTH_DAYS = 5;
const EVENT_EPOCH = Date.UTC(2026, 0, 1);

const upgradeDefinitions = {
  betterCollector: {
    name: "Better Collector",
    description: "+1 base Energy per click per level.",
    baseCost: 15,
    costScale: 1.45,
  },
  autoCollector: {
    name: "Auto Collector",
    description: "+1 base Energy per second per level.",
    baseCost: 50,
    costScale: 1.5,
  },
  energyCore: {
    name: "Energy Core",
    description: "+10% to all click and automatic production per level.",
    baseCost: 120,
    costScale: 1.7,
  },
  luckySpark: {
    name: "Lucky Spark",
    description: "+5% chance per level for a 5x click bonus.",
    baseCost: 80,
    costScale: 1.62,
  },
};

const collectionItems = [
  { id: "tinySpark", name: "Tiny Spark", rarity: "Common", icon: "✨", bonus: "+1% all production", trigger: "Click 25 times." },
  { id: "gearCharm", name: "Gear Charm", rarity: "Common", icon: "⚙️", bonus: "+1% Energy per click", trigger: "Buy 5 upgrade levels." },
  { id: "dailyLantern", name: "Daily Lantern", rarity: "Common", icon: "🏮", bonus: "+1% daily rewards", trigger: "Claim 2 daily rewards." },
  { id: "questRibbon", name: "Quest Ribbon", rarity: "Rare", icon: "🎀", bonus: "+2% quest rewards", trigger: "Complete 5 quests." },
  { id: "autoSprite", name: "Auto Sprite", rarity: "Rare", icon: "🧚", bonus: "+2% Energy per second", trigger: "Reach 10 Energy per second." },
  { id: "milestoneBloom", name: "Milestone Bloom", rarity: "Rare", icon: "🌸", bonus: "+2% all production", trigger: "Reach the Spark Keeper milestone." },
  { id: "eventComet", name: "Event Comet", rarity: "Epic", icon: "☄️", bonus: "+3% event rewards", trigger: "Complete a limited-time event task." },
  { id: "prestigeCrown", name: "Prestige Crown", rarity: "Epic", icon: "👑", bonus: "+3% all production", trigger: "Prestige once." },
  { id: "ancientAlbum", name: "Ancient Album", rarity: "Epic", icon: "📖", bonus: "+4% collection bonus", trigger: "Buy it with Prestige points." },
];

const prestigeShopDefinitions = {
  starlitContract: {
    name: "Starlit Contract",
    description: "+5% permanent production per level.",
    baseCost: 1,
    costScale: 2,
    maxLevel: 10,
  },
  ancientAlbum: {
    name: "Ancient Album",
    description: "Unlock the Epic Ancient Album collectible.",
    baseCost: 2,
    costScale: 1,
    maxLevel: 1,
  },
  prismSkin: {
    name: "Prism Skin",
    description: "Give the collector a permanent rainbow cosmetic glow.",
    baseCost: 3,
    costScale: 1,
    maxLevel: 1,
  },
};

const achievements = [
  { id: "firstClick", name: "First Click", description: "Collect Energy for the first time.", isUnlocked: (state) => state.clicks > 0 },
  { id: "energy100", name: "100 Energy", description: "Earn 100 total Energy in a run.", isUnlocked: (state) => state.totalEnergy >= 100 },
  { id: "energy1000", name: "1,000 Energy", description: "Earn 1,000 total Energy in a run.", isUnlocked: (state) => state.totalEnergy >= 1000 },
  { id: "firstUpgrade", name: "First Upgrade", description: "Buy any upgrade.", isUnlocked: (state) => totalUpgradeLevels(state) >= 1 },
  { id: "tenUpgrades", name: "10 Upgrades", description: "Buy 10 upgrade levels in total.", isUnlocked: (state) => totalUpgradeLevels(state) >= 10 },
  { id: "collectorNovice", name: "Collector Novice", description: "Unlock 3 collection items.", isUnlocked: (state) => unlockedCollectionCount(state) >= 3 },
  { id: "reborn", name: "Reborn", description: "Prestige for the first time.", isUnlocked: (state) => state.prestige.count >= 1 },
  { id: "eventHelper", name: "Event Helper", description: "Complete 3 daily or limited-time event tasks.", isUnlocked: (state) => state.eventTasksCompleted >= 3 },
];

const milestoneDefinitions = [
  { id: "energy1k", amount: 1000, name: "Spark Keeper", bonus: 0.05 },
  { id: "energy10k", amount: 10000, name: "Glow Garden", bonus: 0.07 },
  { id: "energy100k", amount: 100000, name: "Orb Orchard", bonus: 0.1 },
  { id: "energy1m", amount: 1000000, name: "Starlight Engine", bonus: 0.15 },
];

const questTemplates = [
  { type: "clicks", label: "Click {target} times", size: () => 35 + Math.min(115, Math.floor(state.questsCompleted * 5)), current: () => state.clicks },
  { type: "earn", label: "Earn {target} Energy", size: () => Math.max(250, Math.round(energyPerSecond() * 180 + energyPerClick() * 80 + state.totalEnergy * 0.02)), current: () => state.totalEnergy },
  { type: "upgrades", label: "Buy {target} upgrades", size: () => 2 + Math.min(5, Math.floor(state.questsCompleted / 8)), current: () => totalUpgradeLevels() },
  { type: "eps", label: "Reach {target} Energy per second", size: () => Math.max(3, Math.ceil(energyPerSecond() + 4 + state.questsCompleted * 0.8)), current: () => energyPerSecond(), absolute: true },
  { type: "achievements", label: "Unlock {target} achievements", size: () => 1, current: () => unlockedAchievementCount() },
  { type: "daily", label: "Claim a daily reward", size: () => 1, current: () => state.dailyClaims },
];

const dailyTaskTemplates = [
  { type: "dailyClicks", label: "Tap {target} times today", goal: () => 40, current: () => state.clicks },
  { type: "dailyEnergy", label: "Earn {target} Energy today", goal: () => Math.max(300, Math.round(energyPerClick() * 120 + energyPerSecond() * 240)), current: () => state.totalEnergy },
  { type: "dailyUpgrade", label: "Buy {target} upgrades today", goal: () => 2, current: () => totalUpgradeLevels() },
];

const eventTaskTemplates = [
  { type: "eventEnergy", label: "Gather {target} Energy during the event", goal: () => Math.max(2500, Math.round(state.totalEnergy * 0.25 + energyPerSecond() * 900 + 2500)), current: () => state.totalEnergy, reward: "Energy + Event Comet chance" },
  { type: "eventQuests", label: "Complete {target} quests during the event", goal: () => 4, current: () => state.questsCompleted, reward: "Energy + collectible" },
  { type: "eventUpgrades", label: "Buy {target} upgrades during the event", goal: () => 8, current: () => totalUpgradeLevels(), reward: "Large Energy bundle" },
];

const defaultState = {
  energy: 0,
  totalEnergy: 0,
  clicks: 0,
  muted: false,
  lastPlayedAt: null,
  lastDailyClaimDate: "",
  dailyClaims: 0,
  quests: [],
  questsCompleted: 0,
  milestones: {},
  upgrades: { betterCollector: 0, autoCollector: 0, energyCore: 0, luckySpark: 0 },
  achievements: {},
  collection: {},
  prestige: { count: 0, points: 0, spent: {}, cosmetics: { prismSkin: false } },
  dailyTasks: { date: "", tasks: [] },
  event: { cycleKey: "", startAt: 0, endAt: 0, tasks: [] },
  eventTasksCompleted: 0,
  bestRunEnergy: 0,
};

let offlineWelcome = null;
let state = loadGame();
let audioContext;
let lastPurchasedUpgrade = null;
let checkingQuests = false;

const elements = {
  energyAmount: document.querySelector("#energyAmount"),
  perClickAmount: document.querySelector("#perClickAmount"),
  energyPerSecond: document.querySelector("#energyPerSecond"),
  currentMultiplier: document.querySelector("#currentMultiplier"),
  totalEnergy: document.querySelector("#totalEnergy"),
  upgradesBought: document.querySelector("#upgradesBought"),
  questsCompletedQuick: document.querySelector("#questsCompletedQuick"),
  prestigePointsQuick: document.querySelector("#prestigePointsQuick"),
  collectionCountQuick: document.querySelector("#collectionCountQuick"),
  achievementCountQuick: document.querySelector("#achievementCountQuick"),
  collectorButton: document.querySelector("#collectorButton"),
  floatLayer: document.querySelector("#floatLayer"),
  particleLayer: document.querySelector("#particleLayer"),
  upgradesList: document.querySelector("#upgradesList"),
  achievementsList: document.querySelector("#achievementsList"),
  achievementBonusLabel: document.querySelector("#achievementBonusLabel"),
  questsList: document.querySelector("#questsList"),
  milestonesList: document.querySelector("#milestonesList"),
  dailyTasksList: document.querySelector("#dailyTasksList"),
  eventTasksList: document.querySelector("#eventTasksList"),
  eventTimer: document.querySelector("#eventTimer"),
  eventName: document.querySelector("#eventName"),
  eventDates: document.querySelector("#eventDates"),
  prestigeButton: document.querySelector("#prestigeButton"),
  prestigeProgress: document.querySelector("#prestigeProgress"),
  prestigePointsLabel: document.querySelector("#prestigePointsLabel"),
  prestigeDescription: document.querySelector("#prestigeDescription"),
  prestigeCount: document.querySelector("#prestigeCount"),
  prestigeShop: document.querySelector("#prestigeShop"),
  leaderboardList: document.querySelector("#leaderboardList"),
  toastLayer: document.querySelector("#toastLayer"),
  resetButton: document.querySelector("#resetButton"),
  muteButton: document.querySelector("#muteButton"),
  helpButton: document.querySelector("#helpButton"),
  collectionButton: document.querySelector("#collectionButton"),
  dailyRewardButton: document.querySelector("#dailyRewardButton"),
  dailyStatus: document.querySelector("#dailyStatus"),
  dailyDescription: document.querySelector("#dailyDescription"),
  welcomeModal: document.querySelector("#welcomeModal"),
  welcomeMessage: document.querySelector("#welcomeMessage"),
  welcomeCloseButton: document.querySelector("#welcomeCloseButton"),
  helpModal: document.querySelector("#helpModal"),
  helpCloseButton: document.querySelector("#helpCloseButton"),
  collectionModal: document.querySelector("#collectionModal"),
  collectionCloseButton: document.querySelector("#collectionCloseButton"),
  collectionGrid: document.querySelector("#collectionGrid"),
  collectionModalCount: document.querySelector("#collectionModalCount"),
  prestigeModal: document.querySelector("#prestigeModal"),
  prestigeModalMessage: document.querySelector("#prestigeModalMessage"),
  confirmPrestigeButton: document.querySelector("#confirmPrestigeButton"),
  cancelPrestigeButton: document.querySelector("#cancelPrestigeButton"),
  statEnergy: document.querySelector("#statEnergy"),
  statTotalEnergy: document.querySelector("#statTotalEnergy"),
  statPerClick: document.querySelector("#statPerClick"),
  statPerSecond: document.querySelector("#statPerSecond"),
  statClicks: document.querySelector("#statClicks"),
  statUpgrades: document.querySelector("#statUpgrades"),
  statAchievements: document.querySelector("#statAchievements"),
  statCollection: document.querySelector("#statCollection"),
  statPrestige: document.querySelector("#statPrestige"),
  statPrestigePoints: document.querySelector("#statPrestigePoints"),
  statQuests: document.querySelector("#statQuests"),
  statMultiplier: document.querySelector("#statMultiplier"),
  questsCompleted: document.querySelector("#questsCompleted"),
};

function totalUpgradeLevels(currentState = state) {
  return Object.values(currentState.upgrades).reduce((sum, level) => sum + level, 0);
}

function unlockedCollectionCount(currentState = state) {
  return collectionItems.filter((item) => currentState.collection[item.id]).length;
}

function collectionBonus() {
  return collectionItems.reduce((bonus, item) => {
    if (!state.collection[item.id]) {
      return bonus;
    }
    if (item.rarity === "Common") return bonus + 0.01;
    if (item.rarity === "Rare") return bonus + 0.02;
    return bonus + 0.03;
  }, state.collection.ancientAlbum ? 0.01 : 0);
}

function achievementBonus() {
  return unlockedAchievementCount() * 0.005;
}

function milestoneBonus(currentState = state) {
  return milestoneDefinitions.reduce((bonus, milestone) => currentState.milestones[milestone.id] ? bonus + milestone.bonus : bonus, 0);
}

function prestigeBonus() {
  return (state.prestige.spent.starlitContract || 0) * 0.05;
}

function productionMultiplier() {
  return 1 + state.upgrades.energyCore * 0.1 + milestoneBonus() + collectionBonus() + achievementBonus() + prestigeBonus();
}

function clickBonus() {
  return state.collection.gearCharm ? 1.01 : 1;
}

function autoBonus() {
  return state.collection.autoSprite ? 1.02 : 1;
}

function energyPerClick() {
  return (1 + state.upgrades.betterCollector) * productionMultiplier() * clickBonus();
}

function energyPerSecond() {
  return state.upgrades.autoCollector * productionMultiplier() * autoBonus();
}

function luckyChance() {
  return Math.min(0.75, state.upgrades.luckySpark * 0.05);
}

function upgradeCost(id) {
  const upgrade = upgradeDefinitions[id];
  return Math.floor(upgrade.baseCost * upgrade.costScale ** state.upgrades[id]);
}

function prestigeShopCost(id) {
  const item = prestigeShopDefinitions[id];
  const level = state.prestige.spent[id] || 0;
  return Math.ceil(item.baseCost * item.costScale ** level);
}

function unlockedAchievementCount() {
  return Object.values(state.achievements).filter(Boolean).length;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dailyRewardAmount() {
  const lantern = state.collection.dailyLantern ? 1.01 : 1;
  return Math.max(75, Math.round((state.totalEnergy * 0.04 + energyPerSecond() * 900 + energyPerClick() * 35) * lantern));
}

function questRewardAmount(quest) {
  const ribbon = state.collection.questRibbon ? 1.02 : 1;
  const scale = Math.max(40, energyPerClick() * 20 + energyPerSecond() * 120 + state.totalEnergy * 0.012);
  return Math.round((scale * (1 + state.questsCompleted * 0.03) + quest.goal * 2) * ribbon);
}

function eventRewardAmount(task) {
  const comet = state.collection.eventComet ? 1.03 : 1;
  return Math.round(Math.max(250, energyPerClick() * 60 + energyPerSecond() * 360 + state.totalEnergy * 0.02 + task.goal * 12) * comet);
}

function addEnergy(amount, options = {}) {
  if (amount <= 0) return;
  state.energy += amount;
  state.totalEnergy += amount;
  state.bestRunEnergy = Math.max(state.bestRunEnergy || 0, state.totalEnergy);
  checkMilestones();
  checkCollections();
  checkAchievements();
  if (!options.skipQuestCheck) checkQuests();
  if (!options.skipEventCheck) checkTimedTasks();
  render();
  saveGame();
}

function collectEnergy(event) {
  state.clicks += 1;
  const baseAmount = energyPerClick();
  const luckyHit = Math.random() < luckyChance();
  const amount = luckyHit ? baseAmount * 5 : baseAmount;
  addEnergy(amount);
  showFloatingText(event, `+${formatNumber(amount)}${luckyHit ? " Lucky!" : ""}`);
  createClickParticles(event, luckyHit);
  playSound(luckyHit ? "achievement" : "click");
  elements.collectorButton.classList.remove("pop");
  void elements.collectorButton.offsetWidth;
  elements.collectorButton.classList.add("pop");
  setTimeout(() => elements.collectorButton.classList.remove("pop"), 180);
}

function buyUpgrade(id) {
  const cost = upgradeCost(id);
  if (state.energy < cost) return;
  state.energy -= cost;
  state.upgrades[id] += 1;
  lastPurchasedUpgrade = id;
  playSound("upgrade");
  checkCollections();
  checkAchievements();
  checkQuests();
  checkTimedTasks();
  render();
  saveGame();
  setTimeout(() => {
    if (lastPurchasedUpgrade === id) {
      lastPurchasedUpgrade = null;
      renderUpgrades();
    }
  }, PURCHASE_FLASH_MS);
}

function buyPrestigeShopItem(id) {
  const item = prestigeShopDefinitions[id];
  const level = state.prestige.spent[id] || 0;
  if (level >= item.maxLevel) return;
  const cost = prestigeShopCost(id);
  if (state.prestige.points < cost) return;
  state.prestige.points -= cost;
  state.prestige.spent[id] = level + 1;
  if (id === "ancientAlbum") unlockCollection("ancientAlbum");
  if (id === "prismSkin") state.prestige.cosmetics.prismSkin = true;
  showToast("Prestige shop", `${item.name} purchased.`);
  playSound("achievement");
  render();
  saveGame();
}

function claimDailyReward() {
  if (state.lastDailyClaimDate === todayKey()) return;
  const reward = dailyRewardAmount();
  state.lastDailyClaimDate = todayKey();
  state.dailyClaims += 1;
  addEnergy(reward);
  showToast("Daily reward claimed!", `You received ${formatNumber(reward)} Energy.`);
  playSound("achievement");
}

function prestigePointsAvailable() {
  if (state.totalEnergy < PRESTIGE_ENERGY_THRESHOLD && totalUpgradeLevels() < PRESTIGE_UPGRADE_THRESHOLD) {
    return 0;
  }
  return Math.max(1, Math.floor(Math.sqrt(state.totalEnergy / PRESTIGE_ENERGY_THRESHOLD)) + Math.floor(totalUpgradeLevels() / 20));
}

function openPrestigeModal() {
  const points = prestigePointsAvailable();
  if (points <= 0) return;
  elements.prestigeModalMessage.textContent = `Rebirth now for ${formatNumber(points)} Prestige point${points === 1 ? "" : "s"}. Energy, upgrades, active quests, and run milestones reset; achievements, collection, cosmetics, and prestige upgrades stay forever.`;
  elements.prestigeModal.classList.remove("hidden");
}

function confirmPrestige() {
  const points = prestigePointsAvailable();
  if (points <= 0) return;
  state.prestige.count += 1;
  state.prestige.points += points;
  recordLeaderboard(`Rebirth ${state.prestige.count}`, state.totalEnergy, state.prestige.count);
  state.energy = 0;
  state.totalEnergy = 0;
  state.clicks = 0;
  state.quests = [];
  state.milestones = {};
  state.upgrades = createDefaultState().upgrades;
  state.bestRunEnergy = 0;
  state.dailyTasks = createDefaultState().dailyTasks;
  state.event = createDefaultState().event;
  ensureActiveQuests();
  ensureTimedTasks();
  unlockCollection("prestigeCrown");
  checkAchievements();
  closeModal(elements.prestigeModal);
  showToast("Rebirth complete", `Gained ${formatNumber(points)} Prestige point${points === 1 ? "" : "s"}.`);
  playSound("achievement");
  render();
  saveGame();
}

function render() {
  elements.energyAmount.textContent = formatNumber(state.energy);
  elements.perClickAmount.textContent = formatNumber(energyPerClick());
  elements.energyPerSecond.textContent = formatNumber(energyPerSecond());
  elements.currentMultiplier.textContent = `${formatNumber(productionMultiplier())}x`;
  elements.totalEnergy.textContent = formatNumber(state.totalEnergy);
  elements.upgradesBought.textContent = formatNumber(totalUpgradeLevels());
  elements.questsCompletedQuick.textContent = formatNumber(state.questsCompleted);
  elements.prestigePointsQuick.textContent = formatNumber(state.prestige.points);
  elements.collectionCountQuick.textContent = `${unlockedCollectionCount()} / ${collectionItems.length}`;
  elements.achievementCountQuick.textContent = `${unlockedAchievementCount()} / ${achievements.length}`;
  elements.muteButton.textContent = state.muted ? "🔇 Muted" : "🔊 Sound";
  elements.muteButton.setAttribute("aria-pressed", String(state.muted));
  elements.collectorButton.classList.toggle("prism-skin", Boolean(state.prestige.cosmetics.prismSkin));

  elements.statEnergy.textContent = formatNumber(state.energy);
  elements.statTotalEnergy.textContent = formatNumber(state.totalEnergy);
  elements.statPerClick.textContent = formatNumber(energyPerClick());
  elements.statPerSecond.textContent = formatNumber(energyPerSecond());
  elements.statClicks.textContent = formatNumber(state.clicks);
  elements.statUpgrades.textContent = formatNumber(totalUpgradeLevels());
  elements.statAchievements.textContent = `${unlockedAchievementCount()} / ${achievements.length}`;
  elements.statCollection.textContent = `${unlockedCollectionCount()} / ${collectionItems.length}`;
  elements.statPrestige.textContent = formatNumber(state.prestige.count);
  elements.statPrestigePoints.textContent = formatNumber(state.prestige.points);
  elements.statQuests.textContent = formatNumber(state.questsCompleted);
  elements.statMultiplier.textContent = `${formatNumber(productionMultiplier())}x`;
  elements.questsCompleted.textContent = formatNumber(state.questsCompleted);
  elements.prestigeCount.textContent = formatNumber(state.prestige.count);

  renderDailyReward();
  renderTimedTasks();
  renderPrestige();
  renderPrestigeShop();
  renderUpgrades();
  renderQuests();
  renderMilestones();
  renderAchievements();
  renderCollection();
  renderLeaderboard();
}

function renderDailyReward() {
  const claimed = state.lastDailyClaimDate === todayKey();
  const reward = dailyRewardAmount();
  elements.dailyStatus.textContent = claimed ? "Claimed today" : "Ready";
  elements.dailyDescription.textContent = claimed
    ? "Today's gift is claimed. Come back tomorrow for another scaling reward."
    : `Today's reward: ${formatNumber(reward)} Energy, based on your total earned and production.`;
  elements.dailyRewardButton.disabled = claimed;
  elements.dailyRewardButton.textContent = claimed ? "Already claimed" : `Claim ${formatNumber(reward)} Energy`;
}

function renderPrestige() {
  const points = prestigePointsAvailable();
  const energyProgress = Math.min(100, (state.totalEnergy / PRESTIGE_ENERGY_THRESHOLD) * 100);
  const upgradeProgress = Math.min(100, (totalUpgradeLevels() / PRESTIGE_UPGRADE_THRESHOLD) * 100);
  elements.prestigeProgress.style.setProperty("--progress", `${Math.max(energyProgress, upgradeProgress)}%`);
  elements.prestigePointsLabel.textContent = `${formatNumber(points)} point${points === 1 ? "" : "s"} available now`;
  elements.prestigeDescription.textContent = `Rebirth unlocks at ${formatNumber(PRESTIGE_ENERGY_THRESHOLD)} total Energy or ${PRESTIGE_UPGRADE_THRESHOLD} upgrade levels. Permanent bonus: +${Math.round(prestigeBonus() * 100)}%.`;
  elements.prestigeButton.disabled = points <= 0;
  elements.prestigeButton.textContent = points > 0 ? `Prestige for ${formatNumber(points)} point${points === 1 ? "" : "s"}` : "Prestige unavailable";
}

function renderPrestigeShop() {
  elements.prestigeShop.innerHTML = "";
  Object.entries(prestigeShopDefinitions).forEach(([id, item]) => {
    const level = state.prestige.spent[id] || 0;
    const cost = prestigeShopCost(id);
    const maxed = level >= item.maxLevel;
    const affordable = state.prestige.points >= cost && !maxed;
    const card = document.createElement("article");
    card.className = "prestige-shop-card";
    card.innerHTML = `
      <div>
        <div class="upgrade-name">${item.name}</div>
        <p class="small-note">${item.description}</p>
      </div>
      <button class="buy-button" type="button" ${affordable ? "" : "disabled"}>${maxed ? "Owned" : `Spend ${cost} PP`}</button>
    `;
    card.querySelector("button").addEventListener("click", () => buyPrestigeShopItem(id));
    elements.prestigeShop.append(card);
  });
}

function renderUpgrades() {
  elements.upgradesList.innerHTML = "";
  Object.entries(upgradeDefinitions).forEach(([id, upgrade]) => {
    const level = state.upgrades[id];
    const cost = upgradeCost(id);
    const affordable = state.energy >= cost;
    const card = document.createElement("article");
    card.className = `upgrade-card ${affordable ? "affordable" : "expensive"} ${lastPurchasedUpgrade === id ? "purchased" : ""}`;
    card.innerHTML = `
      <div class="upgrade-top">
        <div>
          <div class="upgrade-name">${upgrade.name}</div>
          <p class="upgrade-description">${upgrade.description}</p>
          <p class="impact-line">Now: ${upgradeImpactText(id, level)} · Next: ${upgradeImpactText(id, level + 1)}</p>
        </div>
        <span class="level-pill">Level ${formatNumber(level)}</span>
      </div>
      <div class="buy-row">
        <span class="cost">Cost: ${formatNumber(cost)} Energy</span>
        <button class="buy-button" type="button" ${affordable ? "" : "disabled"}>${affordable ? "Buy upgrade" : "Need more Energy"}</button>
      </div>`;
    card.querySelector("button").addEventListener("click", () => buyUpgrade(id));
    elements.upgradesList.append(card);
  });
}

function upgradeImpactText(id, level) {
  if (id === "betterCollector") return `${formatNumber((1 + level) * productionMultiplier() * clickBonus())} / click`;
  if (id === "autoCollector") return `${formatNumber(level * productionMultiplier() * autoBonus())} / sec`;
  if (id === "energyCore") return `${formatNumber(1 + level * 0.1 + milestoneBonus() + collectionBonus() + achievementBonus() + prestigeBonus())}x all production`;
  return `${Math.round(Math.min(0.75, level * 0.05) * 100)}% lucky chance`;
}

function renderQuests() {
  elements.questsList.innerHTML = "";
  state.quests.forEach((quest) => elements.questsList.append(createTaskCard(quest, questProgress(quest), quest.goal, `+${formatNumber(questRewardAmount(quest))}`, "quest-card")));
}

function renderTimedTasks() {
  ensureTimedTasks();
  elements.dailyTasksList.innerHTML = "";
  elements.eventTasksList.innerHTML = "";
  state.dailyTasks.tasks.forEach((task) => elements.dailyTasksList.append(createTimedTaskCard(task, "Daily", dailyTaskReward(task))));
  state.event.tasks.forEach((task) => elements.eventTasksList.append(createTimedTaskCard(task, "Event", eventRewardAmount(task))));
  const end = new Date(state.event.endAt);
  const remainingDays = Math.max(0, Math.ceil((state.event.endAt - Date.now()) / MS_PER_DAY));
  elements.eventName.textContent = "Starlight Festival";
  elements.eventDates.textContent = `${formatDate(state.event.startAt)} → ${formatDate(state.event.endAt)} · rewards preview: Energy, Prestige flavor, Event Comet`;
  elements.eventTimer.textContent = `${remainingDays} day${remainingDays === 1 ? "" : "s"} left`;
}

function createTimedTaskCard(task, label, reward) {
  const progress = timedTaskProgress(task);
  const complete = progress >= task.goal;
  const card = createTaskCard(task, progress, task.goal, task.claimed ? "Claimed" : `+${formatNumber(reward)}`, `${label.toLowerCase()}-task-card`);
  const button = document.createElement("button");
  button.className = "buy-button task-claim-button";
  button.type = "button";
  button.disabled = task.claimed || !complete;
  button.textContent = task.claimed ? "Reward claimed" : complete ? `Claim ${label}` : "In progress";
  button.addEventListener("click", () => claimTimedTask(task.id));
  card.append(button);
  return card;
}

function createTaskCard(task, progress, goal, rewardText, className) {
  const percent = Math.min(100, (progress / goal) * 100);
  const card = document.createElement("article");
  card.className = className;
  card.innerHTML = `
    <div class="quest-top">
      <div>
        <div class="quest-name">${task.title}</div>
        <p class="quest-description">${formatNumber(progress)} / ${formatNumber(goal)}</p>
      </div>
      <span class="quest-reward">${rewardText}</span>
    </div>
    <div class="progress-track" aria-label="Task progress"><span class="progress-fill" style="--progress: ${percent}%"></span></div>`;
  return card;
}

function renderMilestones() {
  elements.milestonesList.innerHTML = "";
  milestoneDefinitions.forEach((milestone) => {
    const unlocked = Boolean(state.milestones[milestone.id]);
    const percent = Math.min(100, (state.totalEnergy / milestone.amount) * 100);
    const card = document.createElement("article");
    card.className = `milestone-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <div class="milestone-top">
        <div>
          <div class="milestone-name">${milestone.name}</div>
          <p class="milestone-description">Earn ${formatNumber(milestone.amount)} total Energy.</p>
        </div>
        <span class="milestone-bonus">+${Math.round(milestone.bonus * 100)}%</span>
      </div>
      <div class="progress-track" aria-label="Milestone progress"><span class="progress-fill" style="--progress: ${unlocked ? 100 : percent}%"></span></div>
      <p class="small-note">${unlocked ? "Unlocked permanent production bonus and collection progress." : `${formatNumber(Math.min(state.totalEnergy, milestone.amount))} / ${formatNumber(milestone.amount)}`}</p>`;
    elements.milestonesList.append(card);
  });
}

function renderAchievements() {
  elements.achievementsList.innerHTML = "";
  elements.achievementBonusLabel.textContent = `Bonus: +${(achievementBonus() * 100).toFixed(1)}% all production · ${unlockedAchievementCount()} / ${achievements.length} unlocked`;
  achievements.forEach((achievement) => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    const card = document.createElement("article");
    card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `<div><div class="achievement-name">${achievement.name}</div><p class="achievement-description">${achievement.description}</p></div><span class="achievement-status" aria-label="${unlocked ? "Unlocked" : "Locked"}">${unlocked ? "✓" : "?"}</span>`;
    elements.achievementsList.append(card);
  });
}

function renderCollection() {
  elements.collectionGrid.innerHTML = "";
  elements.collectionModalCount.textContent = `${unlockedCollectionCount()} / ${collectionItems.length}`;
  collectionItems.forEach((item) => {
    const unlocked = Boolean(state.collection[item.id]);
    const card = document.createElement("article");
    card.className = `collection-card ${unlocked ? "unlocked" : "locked"} rarity-${item.rarity.toLowerCase()}`;
    card.innerHTML = `
      <div class="collection-icon" aria-hidden="true">${unlocked ? item.icon : "◆"}</div>
      <div>
        <div class="collection-name">${unlocked ? item.name : "Locked item"}</div>
        <p class="small-note">${unlocked ? `${item.rarity} · ${item.bonus}` : `Silhouette · ${item.trigger}`}</p>
      </div>`;
    elements.collectionGrid.append(card);
  });
}

function renderLeaderboard() {
  const entries = getLeaderboard();
  elements.leaderboardList.innerHTML = "";
  if (entries.length === 0) {
    elements.leaderboardList.innerHTML = `<p class="small-note">Prestige to record your first local ranking.</p>`;
    return;
  }
  entries.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `<span>#${index + 1} ${entry.name}</span><strong>${formatNumber(entry.energy)} Energy · P${entry.prestige}</strong>`;
    elements.leaderboardList.append(row);
  });
}

function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.isUnlocked(state)) {
      state.achievements[achievement.id] = true;
      showToast("Achievement unlocked!", `${achievement.name} · achievement bonus improved.`);
      playSound("achievement");
    }
  });
}

function checkMilestones() {
  milestoneDefinitions.forEach((milestone) => {
    if (!state.milestones[milestone.id] && state.totalEnergy >= milestone.amount) {
      state.milestones[milestone.id] = true;
      if (milestone.id === "energy1k") unlockCollection("milestoneBloom");
      showToast("Milestone reached!", `${milestone.name}: +${Math.round(milestone.bonus * 100)}% production forever this run.`);
      playSound("achievement");
    }
  });
}

function checkCollections() {
  if (state.clicks >= 25) unlockCollection("tinySpark");
  if (totalUpgradeLevels() >= 5) unlockCollection("gearCharm");
  if (state.dailyClaims >= 2) unlockCollection("dailyLantern");
  if (state.questsCompleted >= 5) unlockCollection("questRibbon");
  if (energyPerSecond() >= 10) unlockCollection("autoSprite");
  if (state.milestones.energy1k) unlockCollection("milestoneBloom");
  if (state.prestige.count >= 1) unlockCollection("prestigeCrown");
}

function unlockCollection(id) {
  if (state.collection[id]) return;
  const item = collectionItems.find((entry) => entry.id === id);
  state.collection[id] = true;
  if (item) {
    showToast("Collection unlocked!", `${item.icon} ${item.name} (${item.rarity}) · ${item.bonus}`);
    playSound("achievement");
  }
}

function createQuest(excludedTypes = []) {
  const available = questTemplates.filter((template) => !excludedTypes.includes(template.type));
  const template = available[Math.floor(Math.random() * available.length)] || questTemplates[0];
  const goal = Math.max(1, Math.round(template.size()));
  const start = template.absolute ? 0 : template.current();
  const target = template.absolute ? goal : start + goal;
  return { id: `${template.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`, type: template.type, title: template.label.replace("{target}", formatNumber(goal)), start, target, goal, createdAt: Date.now() };
}

function ensureActiveQuests() {
  const activeTypes = state.quests.map((quest) => quest.type);
  while (state.quests.length < ACTIVE_QUEST_COUNT) {
    const excluded = state.quests.length < questTemplates.length ? activeTypes : [];
    const quest = createQuest(excluded);
    state.quests.push(quest);
    activeTypes.push(quest.type);
  }
}

function questCurrentValue(quest) {
  const template = questTemplates.find((item) => item.type === quest.type);
  return template ? template.current() : 0;
}

function questProgress(quest) {
  return Math.max(0, Math.min(quest.goal, questCurrentValue(quest) - quest.start));
}

function isQuestComplete(quest) {
  return questCurrentValue(quest) >= quest.target;
}

function checkQuests() {
  if (checkingQuests) return;
  checkingQuests = true;
  ensureActiveQuests();
  const completed = state.quests.filter(isQuestComplete);
  completed.forEach((quest) => {
    const reward = questRewardAmount(quest);
    state.questsCompleted += 1;
    state.quests = state.quests.filter((activeQuest) => activeQuest.id !== quest.id);
    state.energy += reward;
    state.totalEnergy += reward;
    showToast("Quest complete!", `${quest.title} · +${formatNumber(reward)} Energy`);
    playSound("achievement");
  });
  ensureActiveQuests();
  checkingQuests = false;
  if (completed.length > 0) {
    checkMilestones();
    checkCollections();
    checkAchievements();
    checkTimedTasks();
  }
}

function ensureTimedTasks() {
  ensureDailyTasks();
  ensureEventTasks();
}

function ensureDailyTasks() {
  const key = todayKey();
  if (state.dailyTasks.date === key && state.dailyTasks.tasks.length > 0) return;
  const templates = [...dailyTaskTemplates].sort(() => Math.random() - 0.5).slice(0, 2);
  state.dailyTasks = {
    date: key,
    tasks: templates.map((template) => {
      const goal = Math.round(template.goal());
      const start = template.current();
      return { id: `${template.type}-${key}`, type: template.type, title: template.label.replace("{target}", formatNumber(goal)), start, goal, target: start + goal, claimed: false };
    }),
  };
}

function eventWindow() {
  const daysSinceEpoch = Math.floor((Date.now() - EVENT_EPOCH) / MS_PER_DAY);
  const cycle = Math.max(0, Math.floor(daysSinceEpoch / EVENT_LENGTH_DAYS));
  const startAt = EVENT_EPOCH + cycle * EVENT_LENGTH_DAYS * MS_PER_DAY;
  const endAt = startAt + EVENT_LENGTH_DAYS * MS_PER_DAY;
  return { cycleKey: `starlight-${cycle}`, startAt, endAt };
}

function ensureEventTasks() {
  const window = eventWindow();
  if (state.event.cycleKey === window.cycleKey && state.event.tasks.length > 0) return;
  state.event = {
    ...window,
    tasks: eventTaskTemplates.map((template) => {
      const goal = Math.round(template.goal());
      const start = template.current();
      return { id: `${template.type}-${window.cycleKey}`, type: template.type, title: template.label.replace("{target}", formatNumber(goal)), reward: template.reward, start, goal, target: start + goal, claimed: false };
    }),
  };
}

function timedTaskCurrentValue(task) {
  const template = [...dailyTaskTemplates, ...eventTaskTemplates].find((entry) => entry.type === task.type);
  return template ? template.current() : 0;
}

function timedTaskProgress(task) {
  return Math.max(0, Math.min(task.goal, timedTaskCurrentValue(task) - task.start));
}

function dailyTaskReward(task) {
  return Math.round(Math.max(100, energyPerClick() * 25 + energyPerSecond() * 120 + task.goal * 8));
}

function claimTimedTask(taskId) {
  const task = [...state.dailyTasks.tasks, ...state.event.tasks].find((entry) => entry.id === taskId);
  if (!task || task.claimed || timedTaskProgress(task) < task.goal) return;
  const isEvent = state.event.tasks.some((entry) => entry.id === taskId);
  const reward = isEvent ? eventRewardAmount(task) : dailyTaskReward(task);
  task.claimed = true;
  state.eventTasksCompleted += 1;
  addEnergy(reward, { skipEventCheck: true });
  if (isEvent) unlockCollection("eventComet");
  showToast(isEvent ? "Event task complete!" : "Daily task complete!", `${task.title} · +${formatNumber(reward)} Energy`);
  checkAchievements();
  render();
  saveGame();
}

function checkTimedTasks() {
  ensureTimedTasks();
  checkAchievements();
}

function showFloatingText(event, text) {
  const floatText = document.createElement("span");
  const bounds = elements.floatLayer.getBoundingClientRect();
  const x = event && event.clientX ? event.clientX - bounds.left : bounds.width / 2;
  const y = event && event.clientY ? event.clientY - bounds.top : bounds.height / 2;
  floatText.className = "float-text";
  floatText.textContent = text;
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  floatText.style.setProperty("--drift", `${Math.round(Math.random() * 92 - 46)}px`);
  elements.floatLayer.append(floatText);
  setTimeout(() => floatText.remove(), 1100);
}

function createClickParticles(event, luckyHit) {
  const bounds = elements.particleLayer.getBoundingClientRect();
  const centerX = event && event.clientX ? event.clientX - bounds.left : bounds.width / 2;
  const centerY = event && event.clientY ? event.clientY - bounds.top : bounds.height / 2;
  const count = luckyHit ? 18 : 10;
  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.35;
    const distance = 46 + Math.random() * (luckyHit ? 72 : 42);
    particle.className = "particle";
    particle.style.setProperty("--x", `${centerX}px`);
    particle.style.setProperty("--y", `${centerY}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${Math.round(5 + Math.random() * 7)}px`);
    particle.style.setProperty("--particle-color", luckyHit ? "#ffb86c" : "#22d3ee");
    elements.particleLayer.append(particle);
    setTimeout(() => particle.remove(), 650);
  }
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  elements.toastLayer.append(toast);
  setTimeout(() => toast.remove(), 3300);
}

function showOfflineWelcome() {
  if (!offlineWelcome || offlineWelcome.amount <= 0) return;
  const hours = Math.floor(offlineWelcome.elapsedMs / 3600000);
  const minutes = Math.max(1, Math.round((offlineWelcome.elapsedMs % 3600000) / 60000));
  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  elements.welcomeMessage.textContent = `You earned ${formatNumber(offlineWelcome.amount)} Energy while away for ${timeText}.`;
  elements.welcomeModal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function formatNumber(value) {
  if (value < 1000) return Number.isInteger(value) ? String(value) : value.toFixed(1);
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  const tier = Math.min(Math.floor(Math.log10(value) / 3), units.length - 1);
  const scaled = value / 1000 ** tier;
  return `${scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)}${units[tier]}`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function saveGame() {
  state.lastPlayedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function createDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function normalizeState(parsed) {
  return {
    ...createDefaultState(),
    ...parsed,
    upgrades: { ...defaultState.upgrades, ...parsed.upgrades },
    achievements: { ...defaultState.achievements, ...parsed.achievements },
    milestones: { ...defaultState.milestones, ...parsed.milestones },
    collection: { ...defaultState.collection, ...parsed.collection },
    prestige: {
      ...defaultState.prestige,
      ...parsed.prestige,
      spent: { ...defaultState.prestige.spent, ...(parsed.prestige && parsed.prestige.spent) },
      cosmetics: { ...defaultState.prestige.cosmetics, ...(parsed.prestige && parsed.prestige.cosmetics) },
    },
    dailyTasks: { ...defaultState.dailyTasks, ...parsed.dailyTasks, tasks: parsed.dailyTasks && Array.isArray(parsed.dailyTasks.tasks) ? parsed.dailyTasks.tasks : [] },
    event: { ...defaultState.event, ...parsed.event, tasks: parsed.event && Array.isArray(parsed.event.tasks) ? parsed.event.tasks : [] },
    quests: Array.isArray(parsed.quests) ? parsed.quests : [],
  };
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY);
  if (!saved) {
    const freshState = createDefaultState();
    freshState.lastPlayedAt = Date.now();
    return freshState;
  }
  try {
    const parsed = JSON.parse(saved);
    const loadedState = normalizeState(parsed);
    const previousLastPlayed = Number(parsed.lastPlayedAt);
    applyOfflineEarnings(loadedState, previousLastPlayed);
    loadedState.lastPlayedAt = Date.now();
    return loadedState;
  } catch {
    return createDefaultState();
  }
}

function offlineMultiplierFor(loadedState) {
  const collectionCount = unlockedCollectionCount(loadedState);
  const collectionBoost = collectionCount * 0.01;
  const achievementBoost = Object.values(loadedState.achievements).filter(Boolean).length * 0.005;
  const prestigeBoost = ((loadedState.prestige && loadedState.prestige.spent && loadedState.prestige.spent.starlitContract) || 0) * 0.05;
  return 1 + loadedState.upgrades.energyCore * 0.1 + milestoneBonus(loadedState) + collectionBoost + achievementBoost + prestigeBoost;
}

function applyOfflineEarnings(loadedState, previousLastPlayed) {
  if (!previousLastPlayed) return;
  const elapsedMs = Math.max(0, Math.min(Date.now() - previousLastPlayed, OFFLINE_CAP_MS));
  const offlineSeconds = Math.floor(elapsedMs / 1000);
  const amount = loadedState.upgrades.autoCollector * offlineMultiplierFor(loadedState) * offlineSeconds;
  if (amount <= 0) return;
  loadedState.energy += amount;
  loadedState.totalEnergy += amount;
  loadedState.bestRunEnergy = Math.max(loadedState.bestRunEnergy || 0, loadedState.totalEnergy);
  offlineWelcome = { amount, elapsedMs };
}

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];
  } catch {
    return [];
  }
}

function recordLeaderboard(name, energy, prestige) {
  const entries = getLeaderboard();
  entries.push({ name, energy: Math.round(energy), prestige, date: todayKey() });
  entries.sort((a, b) => b.energy - a.energy || b.prestige - a.prestige);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 5)));
}

function resetProgress() {
  const firstConfirmed = confirm("Reset all Collector progress? This erases Energy, upgrades, quests, milestones, achievements, collection, prestige points, event tasks, and daily rewards.");
  if (!firstConfirmed) return;
  const phrase = prompt('Type "RESET" to permanently clear Collector progress.');
  if (phrase !== "RESET") {
    showToast("Reset canceled", "Progress was kept safe.");
    return;
  }
  state = createDefaultState();
  state.lastPlayedAt = Date.now();
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_SAVE_KEY);
  localStorage.removeItem(LEADERBOARD_KEY);
  ensureActiveQuests();
  ensureTimedTasks();
  showToast("Progress reset", "A fresh Collector V3 run is ready.");
  render();
  saveGame();
}

function getAudioContext() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playSound(type) {
  if (state.muted) return;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const settings = {
    click: { start: 520, end: 760, duration: 0.08, volume: 0.045, wave: "sine" },
    upgrade: { start: 420, end: 980, duration: 0.16, volume: 0.065, wave: "triangle" },
    achievement: { start: 740, end: 1320, duration: 0.22, volume: 0.075, wave: "sine" },
  }[type];
  oscillator.type = settings.wave;
  oscillator.frequency.setValueAtTime(settings.start, now);
  oscillator.frequency.exponentialRampToValueAtTime(settings.end, now + settings.duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(settings.volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + settings.duration + 0.02);
}

function toggleMute() {
  state.muted = !state.muted;
  render();
  saveGame();
}

function bindModalBackdrop(modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
}

elements.collectorButton.addEventListener("click", collectEnergy);
elements.resetButton.addEventListener("click", resetProgress);
elements.muteButton.addEventListener("click", toggleMute);
elements.dailyRewardButton.addEventListener("click", claimDailyReward);
elements.prestigeButton.addEventListener("click", openPrestigeModal);
elements.confirmPrestigeButton.addEventListener("click", confirmPrestige);
elements.cancelPrestigeButton.addEventListener("click", () => closeModal(elements.prestigeModal));
elements.welcomeCloseButton.addEventListener("click", () => closeModal(elements.welcomeModal));
elements.helpButton.addEventListener("click", () => elements.helpModal.classList.remove("hidden"));
elements.helpCloseButton.addEventListener("click", () => closeModal(elements.helpModal));
elements.collectionButton.addEventListener("click", () => elements.collectionModal.classList.remove("hidden"));
elements.collectionCloseButton.addEventListener("click", () => closeModal(elements.collectionModal));
[elements.welcomeModal, elements.helpModal, elements.collectionModal, elements.prestigeModal].forEach(bindModalBackdrop);

setInterval(() => {
  const income = energyPerSecond();
  if (income > 0) addEnergy(income);
}, 1000);

setInterval(() => {
  ensureTimedTasks();
  renderTimedTasks();
  saveGame();
}, 5000);

ensureActiveQuests();
ensureTimedTasks();
checkMilestones();
checkCollections();
checkAchievements();
checkQuests();
checkTimedTasks();
render();
saveGame();
showOfflineWelcome();
