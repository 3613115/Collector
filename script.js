const SAVE_KEY = "collectorSaveV4";
const LEGACY_SAVE_KEY = "collectorSaveV3";
const OLDEST_SAVE_KEY = "collectorSaveV1";
const LEADERBOARD_KEY = "collectorLeaderboardV4";
const LEGACY_LEADERBOARD_KEY = "collectorLeaderboardV3";
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
  { id: "starlightVoucher", name: "Starlight Voucher", rarity: "Legendary", icon: "🎟️", bonus: "+5% event rewards", trigger: "Buy it in the Event Shop." },
];


const skinDefinitions = [
  { id: "defaultCore", name: "Default Core", rarity: "Common", icon: "✦", condition: "Available from the start.", bonus: "Cozy classic glow", className: "skin-default-core", isUnlocked: () => true },
  { id: "neonOrb", name: "Neon Orb", rarity: "Rare", icon: "●", condition: "Reach 1,000 total Energy.", bonus: "+1% all production", className: "skin-neon-orb", multiplierBonus: 0.01, isUnlocked: () => state.totalEnergy >= 1000 },
  { id: "crystalStar", name: "Crystal Star", rarity: "Rare", icon: "✧", condition: "Unlock 4 collectibles.", bonus: "+1% Energy per click", className: "skin-crystal-star", clickBonus: 0.01, isUnlocked: () => unlockedCollectionCount() >= 4 },
  { id: "luckyCat", name: "Lucky Cat", rarity: "Epic", icon: "😺", condition: "Complete 10 quests.", bonus: "+2% lucky click chance", className: "skin-lucky-cat", luckyBonus: 0.02, isUnlocked: () => state.questsCompleted >= 10 },
  { id: "spaceGem", name: "Space Gem", rarity: "Epic", icon: "◆", condition: "Prestige once.", bonus: "+2% Energy per second", className: "skin-space-gem", autoBonus: 0.02, isUnlocked: () => state.prestige.count >= 1 },
  { id: "goldenCore", name: "Golden Core", rarity: "Legendary", icon: "✹", condition: "Buy it from the Event Shop.", bonus: "+3% all production", className: "skin-golden-core", multiplierBonus: 0.03, isUnlocked: () => Boolean(state.skins.unlocked.goldenCore) },
];

const collectionCompletionRewards = [
  { percent: 25, reward: () => ({ energy: 500 }), label: "+500 Energy" },
  { percent: 50, reward: () => ({ energy: 2500, tokens: 5 }), label: "+2.5K Energy and 5 Event Tokens" },
  { percent: 75, reward: () => ({ energy: 10000, prestige: 1 }), label: "+10K Energy and 1 Prestige Point" },
  { percent: 100, reward: () => ({ energy: 50000, tokens: 25, prestige: 3 }), label: "+50K Energy, 25 Tokens, and 3 Prestige Points" },
];

const dailyChallengeTemplates = [
  { type: "challengeEnergy", label: "Earn {target} Energy today", goal: () => Math.max(5000, Math.round(energyPerClick() * 300 + energyPerSecond() * 900)), current: () => state.totalEnergy },
  { type: "challengeUpgrades", label: "Buy {target} upgrades today", goal: () => 10, current: () => totalUpgradeLevels() },
  { type: "challengeClicks", label: "Click {target} times today", goal: () => 100, current: () => state.clicks },
  { type: "challengeQuests", label: "Complete {target} quests today", goal: () => 5, current: () => state.questsCompleted },
];

const eventShopRewards = {
  energyBundle: { name: "Energy Bundle", description: "Instant Energy based on your current run.", cost: 8, repeatable: true },
  starlightBoost: { name: "Starlight Boost", description: "Temporary +25% production for 10 minutes.", cost: 14, repeatable: true },
  goldenCoreSkin: { name: "Golden Core", description: "Exclusive Legendary collector skin and Starlight Voucher collectible.", cost: 30, repeatable: false },
};

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
  skins: { equipped: "defaultCore", unlocked: { defaultCore: true } },
  collectionRewards: {},
  dailyChallenge: { date: "", type: "", title: "", start: 0, goal: 0, target: 0, claimed: false },
  eventTokens: 0,
  eventShop: { purchased: {}, boostUntil: 0 },
  runStartedAt: null,
  fastest10kMs: null,
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
  collectionCompletionLabel: document.querySelector("#collectionCompletionLabel"),
  collectionRewardLabel: document.querySelector("#collectionRewardLabel"),
  collectionPanelGrid: document.querySelector("#collectionPanelGrid"),
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
  skinsGrid: document.querySelector("#skinsGrid"),
  equippedSkinLabel: document.querySelector("#equippedSkinLabel"),
  dailyChallengeCard: document.querySelector("#dailyChallengeCard"),
  dailyChallengeStatus: document.querySelector("#dailyChallengeStatus"),
  eventTokenCount: document.querySelector("#eventTokenCount"),
  eventShopList: document.querySelector("#eventShopList"),
  shareButton: document.querySelector("#shareButton"),
  shareFallback: document.querySelector("#shareFallback"),
  shareText: document.querySelector("#shareText"),
  tabButtons: document.querySelectorAll(".tab-button"),
  tabPanels: document.querySelectorAll(".tab-panel"),
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
    if (!state.collection[item.id]) return bonus;
    if (item.rarity === "Common") return bonus + 0.01;
    if (item.rarity === "Rare") return bonus + 0.02;
    if (item.rarity === "Epic") return bonus + 0.03;
    return bonus + 0.05;
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

function equippedSkin() {
  return skinDefinitions.find((skin) => skin.id === state.skins.equipped) || skinDefinitions[0];
}

function skinMultiplierBonus() {
  return equippedSkin().multiplierBonus || 0;
}

function eventBoostBonus() {
  return state.eventShop.boostUntil > Date.now() ? 0.25 : 0;
}

function productionMultiplier() {
  return 1 + state.upgrades.energyCore * 0.1 + milestoneBonus() + collectionBonus() + achievementBonus() + prestigeBonus() + skinMultiplierBonus() + eventBoostBonus();
}

function clickBonus() {
  return (state.collection.gearCharm ? 1.01 : 1) + (equippedSkin().clickBonus || 0);
}

function autoBonus() {
  return (state.collection.autoSprite ? 1.02 : 1) + (equippedSkin().autoBonus || 0);
}

function energyPerClick() {
  return (1 + state.upgrades.betterCollector) * productionMultiplier() * clickBonus();
}

function energyPerSecond() {
  return state.upgrades.autoCollector * productionMultiplier() * autoBonus();
}

function luckyChance() {
  return Math.min(0.75, state.upgrades.luckySpark * 0.05 + (equippedSkin().luckyBonus || 0));
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
  const voucher = state.collection.starlightVoucher ? 1.05 : 1;
  return Math.round(Math.max(250, energyPerClick() * 60 + energyPerSecond() * 360 + state.totalEnergy * 0.02 + task.goal * 12) * comet * voucher);
}

function addEnergy(amount, options = {}) {
  if (amount <= 0) return;
  state.energy += amount;
  state.totalEnergy += amount;
  const crossedTenK = state.totalEnergy >= 10000 && !state.fastest10kMs;
  state.bestRunEnergy = Math.max(state.bestRunEnergy || 0, state.totalEnergy);
  if (crossedTenK && state.runStartedAt) {
    state.fastest10kMs = Date.now() - state.runStartedAt;
    recordLeaderboard("Fastest 10K Energy", state.fastest10kMs, `Reached in ${formatDuration(state.fastest10kMs)}`, "time");
    showToast("New speed record!", `10,000 Energy reached in ${formatDuration(state.fastest10kMs)}.`);
    playSound("record");
  }
  updateLeaderboardRecords(true);
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
  updateDailyChallenge();
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
  glowBurst();
  updateDailyChallenge();
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
  if (id === "prismSkin") unlockSkin("neonOrb");
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
  updateDailyChallenge();
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
  recordLeaderboard("Highest Prestige Points", state.prestige.points + points, `${state.prestige.count + 1} rebirths`, "prestige");
  updateLeaderboardRecords();
  state.energy = 0;
  state.totalEnergy = 0;
  state.clicks = 0;
  state.quests = [];
  state.milestones = {};
  state.upgrades = createDefaultState().upgrades;
  state.bestRunEnergy = 0;
  state.fastest10kMs = null;
  state.runStartedAt = Date.now();
  state.dailyTasks = createDefaultState().dailyTasks;
  state.event = createDefaultState().event;
  ensureActiveQuests();
  ensureTimedTasks();
  unlockCollection("prestigeCrown");
  checkAchievements();
  closeModal(elements.prestigeModal);
  showToast("Rebirth complete", `Gained ${formatNumber(points)} Prestige point${points === 1 ? "" : "s"}.`);
  celebrate("prestige");
  playSound("prestige");
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
  skinDefinitions.forEach((skin) => elements.collectorButton.classList.remove(skin.className));
  elements.collectorButton.classList.toggle("prism-skin", Boolean(state.prestige.cosmetics.prismSkin));
  elements.collectorButton.classList.add(equippedSkin().className);
  elements.collectorButton.querySelector(".collector-core").textContent = equippedSkin().icon;

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
  renderSkins();
  renderDailyChallenge();
  renderEventShop();
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
  elements.eventDates.textContent = `${formatDate(state.event.startAt)} → ${formatDate(state.event.endAt)} · event tasks award Energy and Tokens`;
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
  const completion = collectionCompletionPercent();
  elements.collectionModalCount.textContent = `${unlockedCollectionCount()} / ${collectionItems.length}`;
  elements.collectionCompletionLabel.textContent = `${completion}%`;
  const nextReward = collectionCompletionRewards.find((reward) => !state.collectionRewards[reward.percent]);
  elements.collectionRewardLabel.textContent = nextReward ? `Next completion reward: ${nextReward.percent}% for ${nextReward.label}.` : "Collection complete! All completion rewards claimed.";
  elements.collectionPanelGrid.innerHTML = "";
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
    elements.collectionPanelGrid.append(card.cloneNode(true));
  });
}


function collectionCompletionPercent() {
  return Math.floor((unlockedCollectionCount() / collectionItems.length) * 100);
}

function renderSkins() {
  elements.skinsGrid.innerHTML = "";
  elements.equippedSkinLabel.textContent = equippedSkin().name;
  skinDefinitions.forEach((skin) => {
    const unlocked = Boolean(state.skins.unlocked[skin.id]) || skin.isUnlocked();
    if (unlocked && !state.skins.unlocked[skin.id]) state.skins.unlocked[skin.id] = true;
    const equipped = state.skins.equipped === skin.id;
    const card = document.createElement("article");
    card.className = `skin-card ${unlocked ? "unlocked" : "locked"} rarity-${skin.rarity.toLowerCase()}`;
    card.innerHTML = `
      <div class="skin-preview ${skin.className}"><span>${unlocked ? skin.icon : "?"}</span></div>
      <div>
        <div class="collection-name">${skin.name}</div>
        <p class="small-note"><span class="rarity-badge rarity-${skin.rarity.toLowerCase()}">${skin.rarity}</span> ${unlocked ? skin.bonus : skin.condition}</p>
      </div>
      <button class="buy-button" type="button" ${unlocked && !equipped ? "" : "disabled"}>${equipped ? "Equipped" : unlocked ? "Equip" : "Locked"}</button>`;
    card.querySelector("button").addEventListener("click", () => equipSkin(skin.id));
    elements.skinsGrid.append(card);
  });
}

function renderDailyChallenge() {
  ensureDailyChallenge();
  const challenge = state.dailyChallenge;
  const progress = dailyChallengeProgress();
  const complete = progress >= challenge.goal;
  const reward = dailyChallengeReward();
  elements.dailyChallengeStatus.textContent = challenge.claimed ? "Claimed" : complete ? "Complete" : "Active";
  elements.dailyChallengeCard.innerHTML = "";
  const card = createTaskCard(challenge, progress, challenge.goal, challenge.claimed ? "Claimed" : `+${formatNumber(reward.energy)} + ${reward.tokens} Tokens`, "daily-task-card challenge-card");
  const button = document.createElement("button");
  button.className = "buy-button task-claim-button";
  button.type = "button";
  button.disabled = challenge.claimed || !complete;
  button.textContent = challenge.claimed ? "Challenge claimed" : complete ? "Claim big reward" : "In progress";
  button.addEventListener("click", claimDailyChallenge);
  card.append(button);
  elements.dailyChallengeCard.append(card);
}

function renderEventShop() {
  elements.eventTokenCount.textContent = `${formatNumber(state.eventTokens)} Token${state.eventTokens === 1 ? "" : "s"}`;
  elements.eventShopList.innerHTML = "";
  Object.entries(eventShopRewards).forEach(([id, reward]) => {
    const owned = state.eventShop.purchased[id] && !reward.repeatable;
    const affordable = state.eventTokens >= reward.cost && !owned;
    const card = document.createElement("article");
    card.className = "event-shop-card";
    card.innerHTML = `
      <div>
        <div class="upgrade-name">${reward.name}</div>
        <p class="small-note">${reward.description}</p>
      </div>
      <button class="buy-button" type="button" ${affordable ? "" : "disabled"}>${owned ? "Owned" : `Spend ${reward.cost}`}</button>`;
    card.querySelector("button").addEventListener("click", () => buyEventShopReward(id));
    elements.eventShopList.append(card);
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
    row.innerHTML = `<span>#${index + 1} ${entry.name}</span><strong>${entry.display || `${formatNumber(entry.energy || entry.value)} Energy · P${entry.prestige || 0}`}</strong>`;
    elements.leaderboardList.append(row);
  });
}

function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.isUnlocked(state)) {
      state.achievements[achievement.id] = true;
      showToast("Achievement unlocked!", `${achievement.name} · achievement bonus improved.`);
      celebrate("achievement");
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
  checkSkinUnlocks();
  checkCollectionCompletionRewards();
}

function unlockCollection(id) {
  if (state.collection[id]) return;
  const item = collectionItems.find((entry) => entry.id === id);
  state.collection[id] = true;
  if (item) {
    showToast("Collection unlocked!", `${item.icon} ${item.name} (${item.rarity}) · ${item.bonus}`);
    celebrate("collection");
    playSound("achievement");
  }
  checkCollectionCompletionRewards();
}


function checkSkinUnlocks() {
  skinDefinitions.forEach((skin) => {
    if (!state.skins.unlocked[skin.id] && skin.isUnlocked()) unlockSkin(skin.id);
  });
}

function unlockSkin(id) {
  if (state.skins.unlocked[id]) return;
  const skin = skinDefinitions.find((entry) => entry.id === id);
  state.skins.unlocked[id] = true;
  if (skin) {
    showToast("Skin unlocked!", `${skin.name} (${skin.rarity}) is ready to equip.`);
    celebrate("skin");
    playSound("skin");
  }
}

function equipSkin(id) {
  if (!state.skins.unlocked[id]) return;
  state.skins.equipped = id;
  const skin = equippedSkin();
  showToast("Skin equipped", `${skin.name} is now your Collector look.`);
  render();
  saveGame();
}

function checkCollectionCompletionRewards() {
  const completion = collectionCompletionPercent();
  collectionCompletionRewards.forEach((reward) => {
    if (completion < reward.percent || state.collectionRewards[reward.percent]) return;
    const payout = reward.reward();
    state.collectionRewards[reward.percent] = true;
    if (payout.energy) { state.energy += payout.energy; state.totalEnergy += payout.energy; }
    if (payout.tokens) state.eventTokens += payout.tokens;
    if (payout.prestige) state.prestige.points += payout.prestige;
    showToast("Collection reward!", `${reward.percent}% complete · ${reward.label}`);
    celebrate("collection");
    playSound("achievement");
  });
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
    celebrate("quest");
    playSound("achievement");
  });
  if (completed.length > 0) updateLeaderboardRecords();
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
  ensureDailyChallenge();
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

function ensureDailyChallenge() {
  const key = todayKey();
  if (state.dailyChallenge.date === key && state.dailyChallenge.type) return;
  const template = dailyChallengeTemplates[Math.floor(Math.random() * dailyChallengeTemplates.length)];
  const goal = Math.round(template.goal());
  const start = template.current();
  state.dailyChallenge = {
    date: key,
    type: template.type,
    title: template.label.replace("{target}", formatNumber(goal)),
    start,
    goal,
    target: start + goal,
    claimed: false,
  };
}

function dailyChallengeCurrentValue() {
  const template = dailyChallengeTemplates.find((entry) => entry.type === state.dailyChallenge.type);
  return template ? template.current() : 0;
}

function dailyChallengeProgress() {
  ensureDailyChallenge();
  return Math.max(0, Math.min(state.dailyChallenge.goal, dailyChallengeCurrentValue() - state.dailyChallenge.start));
}

function dailyChallengeReward() {
  return { energy: Math.round(Math.max(1500, energyPerClick() * 120 + energyPerSecond() * 600 + state.totalEnergy * 0.05)), tokens: 6 };
}

function updateDailyChallenge() {
  ensureDailyChallenge();
}

function claimDailyChallenge() {
  ensureDailyChallenge();
  if (state.dailyChallenge.claimed || dailyChallengeProgress() < state.dailyChallenge.goal) return;
  const reward = dailyChallengeReward();
  state.dailyChallenge.claimed = true;
  state.eventTokens += reward.tokens;
  addEnergy(reward.energy, { skipEventCheck: true });
  showToast("Daily challenge complete!", `${state.dailyChallenge.title} · +${formatNumber(reward.energy)} Energy and ${reward.tokens} Tokens.`);
  celebrate("daily");
  playSound("daily");
  render();
  saveGame();
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
  if (isEvent) state.eventTokens += 4;
  addEnergy(reward, { skipEventCheck: true });
  if (isEvent) unlockCollection("eventComet");
  showToast(isEvent ? "Event task complete!" : "Daily task complete!", `${task.title} · +${formatNumber(reward)} Energy${isEvent ? " and 4 Tokens" : ""}`);
  celebrate(isEvent ? "event" : "quest");
  checkAchievements();
  render();
  saveGame();
}

function checkTimedTasks() {
  ensureTimedTasks();
  updateDailyChallenge();
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


function glowBurst() {
  const burst = document.createElement("span");
  burst.className = "glow-burst";
  elements.particleLayer.append(burst);
  setTimeout(() => burst.remove(), 700);
}

function celebrate(type = "sparkle") {
  const count = type === "prestige" || type === "skin" ? 24 : 14;
  for (let index = 0; index < count; index += 1) {
    const sparkle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const distance = 70 + Math.random() * 90;
    sparkle.className = `celebration celebration-${type}`;
    sparkle.textContent = ["✦", "✧", "★", "♡"][index % 4];
    sparkle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    elements.particleLayer.append(sparkle);
    setTimeout(() => sparkle.remove(), 900);
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

function formatDuration(ms) {
  const seconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${seconds}s`;
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
    collectionRewards: { ...defaultState.collectionRewards, ...parsed.collectionRewards },
    skins: {
      ...defaultState.skins,
      ...parsed.skins,
      unlocked: { ...defaultState.skins.unlocked, ...(parsed.skins && parsed.skins.unlocked) },
    },
    eventShop: {
      ...defaultState.eventShop,
      ...parsed.eventShop,
      purchased: { ...defaultState.eventShop.purchased, ...(parsed.eventShop && parsed.eventShop.purchased) },
    },
    prestige: {
      ...defaultState.prestige,
      ...parsed.prestige,
      spent: { ...defaultState.prestige.spent, ...(parsed.prestige && parsed.prestige.spent) },
      cosmetics: { ...defaultState.prestige.cosmetics, ...(parsed.prestige && parsed.prestige.cosmetics) },
    },
    dailyTasks: { ...defaultState.dailyTasks, ...parsed.dailyTasks, tasks: parsed.dailyTasks && Array.isArray(parsed.dailyTasks.tasks) ? parsed.dailyTasks.tasks : [] },
    dailyChallenge: { ...defaultState.dailyChallenge, ...parsed.dailyChallenge },
    event: { ...defaultState.event, ...parsed.event, tasks: parsed.event && Array.isArray(parsed.event.tasks) ? parsed.event.tasks : [] },
    quests: Array.isArray(parsed.quests) ? parsed.quests : [],
  };
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY) || localStorage.getItem(LEGACY_SAVE_KEY) || localStorage.getItem(OLDEST_SAVE_KEY);
  if (!saved) {
    const freshState = createDefaultState();
    freshState.lastPlayedAt = Date.now();
    freshState.runStartedAt = Date.now();
    return freshState;
  }
  try {
    const parsed = JSON.parse(saved);
    const loadedState = normalizeState(parsed);
    if (!loadedState.runStartedAt) loadedState.runStartedAt = Date.now();
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
    const saved = localStorage.getItem(LEADERBOARD_KEY) || localStorage.getItem(LEGACY_LEADERBOARD_KEY);
    return JSON.parse(saved) || [];
  } catch {
    return [];
  }
}

function leaderboardSortValue(entry) {
  return entry.sortValue ?? entry.energy ?? entry.value ?? 0;
}

function recordLeaderboard(name, value, display, type = "energy", silent = false) {
  const entries = getLeaderboard();
  const sortValue = type === "time" ? -Math.round(value) : Math.round(value);
  const existingBest = entries.find((entry) => entry.type === type && entry.name === name);
  if (existingBest && leaderboardSortValue(existingBest) >= sortValue) return;
  const filtered = entries.filter((entry) => !(entry.type === type && entry.name === name));
  filtered.push({ name, value: Math.round(value), sortValue, display, type, date: todayKey() });
  filtered.sort((a, b) => leaderboardSortValue(b) - leaderboardSortValue(a));
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(filtered.slice(0, 5)));
  if (!silent) {
    showToast("Local record!", `${name}: ${display}`);
    playSound("record");
  }
}

function updateLeaderboardRecords(silent = false) {
  recordLeaderboard("Highest Total Energy", state.bestRunEnergy || state.totalEnergy, `${formatNumber(state.bestRunEnergy || state.totalEnergy)} Energy`, "energy", silent);
  recordLeaderboard("Highest Prestige Points", state.prestige.points, `${formatNumber(state.prestige.points)} Prestige Points`, "prestige", silent);
  recordLeaderboard("Most Quests Completed", state.questsCompleted, `${formatNumber(state.questsCompleted)} quests`, "quests", silent);
}


function buyEventShopReward(id) {
  const reward = eventShopRewards[id];
  if (!reward || state.eventTokens < reward.cost) return;
  if (!reward.repeatable && state.eventShop.purchased[id]) return;
  state.eventTokens -= reward.cost;
  state.eventShop.purchased[id] = true;
  if (id === "energyBundle") addEnergy(Math.max(2500, state.totalEnergy * 0.08 + energyPerClick() * 200), { skipEventCheck: true });
  if (id === "starlightBoost") state.eventShop.boostUntil = Date.now() + 10 * 60 * 1000;
  if (id === "goldenCoreSkin") {
    unlockSkin("goldenCore");
    unlockCollection("starlightVoucher");
  }
  showToast("Event reward purchased", `${reward.name} is yours!`);
  celebrate("event");
  playSound("eventPurchase");
  render();
  saveGame();
}

function shareProgress() {
  const summary = `I collected ${formatNumber(state.totalEnergy)} Energy and reached Prestige ${state.prestige.count} in Collector!`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(summary).then(() => {
      elements.shareFallback.classList.add("hidden");
      showToast("Progress copied!", summary);
    }).catch(() => showShareFallback(summary));
  } else {
    showShareFallback(summary);
  }
}

function showShareFallback(summary) {
  elements.shareText.value = summary;
  elements.shareFallback.classList.remove("hidden");
  elements.shareText.focus();
  elements.shareText.select();
  showToast("Share text ready", "Clipboard unavailable, so copy it from the box.");
}

function switchTab(tabName) {
  elements.tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  elements.tabPanels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tabName));
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
  localStorage.removeItem(OLDEST_SAVE_KEY);
  localStorage.removeItem(LEADERBOARD_KEY);
  localStorage.removeItem(LEGACY_LEADERBOARD_KEY);
  ensureActiveQuests();
  ensureTimedTasks();
  showToast("Progress reset", "A fresh Collector V4 run is ready.");
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
    skin: { start: 660, end: 1480, duration: 0.28, volume: 0.08, wave: "triangle" },
    daily: { start: 520, end: 1240, duration: 0.24, volume: 0.075, wave: "sine" },
    record: { start: 880, end: 1760, duration: 0.2, volume: 0.07, wave: "square" },
    eventPurchase: { start: 480, end: 1120, duration: 0.2, volume: 0.07, wave: "triangle" },
    prestige: { start: 360, end: 1440, duration: 0.34, volume: 0.08, wave: "sine" },
  }[type] || { start: 520, end: 760, duration: 0.08, volume: 0.045, wave: "sine" };
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
elements.shareButton.addEventListener("click", shareProgress);
elements.tabButtons.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
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

if (!state.runStartedAt) state.runStartedAt = Date.now();
ensureActiveQuests();
ensureTimedTasks();
checkMilestones();
checkCollections();
checkSkinUnlocks();
checkAchievements();
checkQuests();
checkTimedTasks();
render();
saveGame();
showOfflineWelcome();
