const SAVE_KEY = "collectorSaveV1";
const OFFLINE_CAP_MS = 8 * 60 * 60 * 1000;
const ACTIVE_QUEST_COUNT = 3;
const PURCHASE_FLASH_MS = 520;

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

const achievements = [
  {
    id: "firstClick",
    name: "First Click",
    description: "Collect Energy for the first time.",
    isUnlocked: (state) => state.clicks > 0,
  },
  {
    id: "energy100",
    name: "100 Energy",
    description: "Earn 100 total Energy.",
    isUnlocked: (state) => state.totalEnergy >= 100,
  },
  {
    id: "energy1000",
    name: "1,000 Energy",
    description: "Earn 1,000 total Energy.",
    isUnlocked: (state) => state.totalEnergy >= 1000,
  },
  {
    id: "firstUpgrade",
    name: "First Upgrade",
    description: "Buy any upgrade.",
    isUnlocked: (state) => totalUpgradeLevels(state) >= 1,
  },
  {
    id: "tenUpgrades",
    name: "10 Upgrades",
    description: "Buy 10 upgrade levels in total.",
    isUnlocked: (state) => totalUpgradeLevels(state) >= 10,
  },
];

const milestoneDefinitions = [
  { id: "energy1k", amount: 1000, name: "Spark Keeper", bonus: 0.05 },
  { id: "energy10k", amount: 10000, name: "Glow Garden", bonus: 0.07 },
  { id: "energy100k", amount: 100000, name: "Orb Orchard", bonus: 0.1 },
  { id: "energy1m", amount: 1000000, name: "Starlight Engine", bonus: 0.15 },
];

const questTemplates = [
  {
    type: "clicks",
    label: "Click {target} times",
    size: () => 35 + Math.min(115, Math.floor(state.questsCompleted * 5)),
    current: () => state.clicks,
  },
  {
    type: "earn",
    label: "Earn {target} Energy",
    size: () => Math.max(250, Math.round(energyPerSecond() * 180 + energyPerClick() * 80 + state.totalEnergy * 0.02)),
    current: () => state.totalEnergy,
  },
  {
    type: "upgrades",
    label: "Buy {target} upgrades",
    size: () => 2 + Math.min(5, Math.floor(state.questsCompleted / 8)),
    current: () => totalUpgradeLevels(),
  },
  {
    type: "eps",
    label: "Reach {target} Energy per second",
    size: () => Math.max(3, Math.ceil(energyPerSecond() + 4 + state.questsCompleted * 0.8)),
    current: () => energyPerSecond(),
    absolute: true,
  },
  {
    type: "achievements",
    label: "Unlock {target} achievements",
    size: () => 1,
    current: () => unlockedAchievementCount(),
  },
  {
    type: "daily",
    label: "Claim a daily reward",
    size: () => 1,
    current: () => state.dailyClaims,
  },
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
  upgrades: {
    betterCollector: 0,
    autoCollector: 0,
    energyCore: 0,
    luckySpark: 0,
  },
  achievements: {},
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
  collectorButton: document.querySelector("#collectorButton"),
  floatLayer: document.querySelector("#floatLayer"),
  particleLayer: document.querySelector("#particleLayer"),
  upgradesList: document.querySelector("#upgradesList"),
  achievementsList: document.querySelector("#achievementsList"),
  questsList: document.querySelector("#questsList"),
  milestonesList: document.querySelector("#milestonesList"),
  toastLayer: document.querySelector("#toastLayer"),
  resetButton: document.querySelector("#resetButton"),
  muteButton: document.querySelector("#muteButton"),
  helpButton: document.querySelector("#helpButton"),
  dailyRewardButton: document.querySelector("#dailyRewardButton"),
  dailyStatus: document.querySelector("#dailyStatus"),
  dailyDescription: document.querySelector("#dailyDescription"),
  welcomeModal: document.querySelector("#welcomeModal"),
  welcomeMessage: document.querySelector("#welcomeMessage"),
  welcomeCloseButton: document.querySelector("#welcomeCloseButton"),
  helpModal: document.querySelector("#helpModal"),
  helpCloseButton: document.querySelector("#helpCloseButton"),
  statEnergy: document.querySelector("#statEnergy"),
  statTotalEnergy: document.querySelector("#statTotalEnergy"),
  statPerClick: document.querySelector("#statPerClick"),
  statPerSecond: document.querySelector("#statPerSecond"),
  statClicks: document.querySelector("#statClicks"),
  statUpgrades: document.querySelector("#statUpgrades"),
  statAchievements: document.querySelector("#statAchievements"),
  statQuests: document.querySelector("#statQuests"),
  statMultiplier: document.querySelector("#statMultiplier"),
  questsCompleted: document.querySelector("#questsCompleted"),
};

function totalUpgradeLevels(currentState = state) {
  return Object.values(currentState.upgrades).reduce((sum, level) => sum + level, 0);
}

function milestoneBonus() {
  return milestoneDefinitions.reduce((bonus, milestone) => {
    return state.milestones[milestone.id] ? bonus + milestone.bonus : bonus;
  }, 0);
}

function productionMultiplier() {
  return 1 + state.upgrades.energyCore * 0.1 + milestoneBonus();
}

function energyPerClick() {
  return (1 + state.upgrades.betterCollector) * productionMultiplier();
}

function energyPerSecond() {
  return state.upgrades.autoCollector * productionMultiplier();
}

function luckyChance() {
  return Math.min(0.75, state.upgrades.luckySpark * 0.05);
}

function upgradeCost(id) {
  const upgrade = upgradeDefinitions[id];
  return Math.floor(upgrade.baseCost * upgrade.costScale ** state.upgrades[id]);
}

function unlockedAchievementCount() {
  return Object.values(state.achievements).filter(Boolean).length;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dailyRewardAmount() {
  return Math.max(75, Math.round(state.totalEnergy * 0.04 + energyPerSecond() * 900 + energyPerClick() * 35));
}

function questRewardAmount(quest) {
  const scale = Math.max(40, energyPerClick() * 20 + energyPerSecond() * 120 + state.totalEnergy * 0.012);
  return Math.round(scale * (1 + state.questsCompleted * 0.03) + quest.goal * 2);
}

function addEnergy(amount, options = {}) {
  if (amount <= 0) {
    return;
  }

  state.energy += amount;
  state.totalEnergy += amount;
  checkMilestones();
  checkAchievements();
  if (!options.skipQuestCheck) {
    checkQuests();
  }
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
  if (state.energy < cost) {
    return;
  }

  state.energy -= cost;
  state.upgrades[id] += 1;
  lastPurchasedUpgrade = id;
  playSound("upgrade");
  checkAchievements();
  checkQuests();
  render();
  saveGame();
  setTimeout(() => {
    if (lastPurchasedUpgrade === id) {
      lastPurchasedUpgrade = null;
      renderUpgrades();
    }
  }, PURCHASE_FLASH_MS);
}

function claimDailyReward() {
  if (state.lastDailyClaimDate === todayKey()) {
    return;
  }

  const reward = dailyRewardAmount();
  state.lastDailyClaimDate = todayKey();
  state.dailyClaims += 1;
  addEnergy(reward);
  showToast("Daily reward claimed!", `You received ${formatNumber(reward)} Energy.`);
  playSound("achievement");
}

function render() {
  elements.energyAmount.textContent = formatNumber(state.energy);
  elements.perClickAmount.textContent = formatNumber(energyPerClick());
  elements.energyPerSecond.textContent = formatNumber(energyPerSecond());
  elements.currentMultiplier.textContent = `${formatNumber(productionMultiplier())}x`;
  elements.totalEnergy.textContent = formatNumber(state.totalEnergy);
  elements.upgradesBought.textContent = formatNumber(totalUpgradeLevels());
  elements.questsCompletedQuick.textContent = formatNumber(state.questsCompleted);
  elements.muteButton.textContent = state.muted ? "🔇 Muted" : "🔊 Sound";
  elements.muteButton.setAttribute("aria-pressed", String(state.muted));

  elements.statEnergy.textContent = formatNumber(state.energy);
  elements.statTotalEnergy.textContent = formatNumber(state.totalEnergy);
  elements.statPerClick.textContent = formatNumber(energyPerClick());
  elements.statPerSecond.textContent = formatNumber(energyPerSecond());
  elements.statClicks.textContent = formatNumber(state.clicks);
  elements.statUpgrades.textContent = formatNumber(totalUpgradeLevels());
  elements.statAchievements.textContent = `${unlockedAchievementCount()} / ${achievements.length}`;
  elements.statQuests.textContent = formatNumber(state.questsCompleted);
  elements.statMultiplier.textContent = `${formatNumber(productionMultiplier())}x`;
  elements.questsCompleted.textContent = formatNumber(state.questsCompleted);

  renderDailyReward();
  renderUpgrades();
  renderQuests();
  renderMilestones();
  renderAchievements();
}

function renderDailyReward() {
  const claimed = state.lastDailyClaimDate === todayKey();
  const reward = dailyRewardAmount();
  elements.dailyStatus.textContent = claimed ? "Claimed today" : "Ready";
  elements.dailyDescription.textContent = claimed
    ? `Today's gift is claimed. Come back tomorrow for another scaling reward.`
    : `Today's reward: ${formatNumber(reward)} Energy, based on your total earned and production.`;
  elements.dailyRewardButton.disabled = claimed;
  elements.dailyRewardButton.textContent = claimed ? "Already claimed" : `Claim ${formatNumber(reward)} Energy`;
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
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => buyUpgrade(id));
    elements.upgradesList.append(card);
  });
}

function upgradeImpactText(id, level) {
  if (id === "betterCollector") {
    return `${formatNumber((1 + level) * productionMultiplier())} / click`;
  }
  if (id === "autoCollector") {
    return `${formatNumber(level * productionMultiplier())} / sec`;
  }
  if (id === "energyCore") {
    return `${formatNumber(1 + level * 0.1 + milestoneBonus())}x all production`;
  }
  return `${Math.round(Math.min(0.75, level * 0.05) * 100)}% lucky chance`;
}

function renderQuests() {
  elements.questsList.innerHTML = "";

  state.quests.forEach((quest) => {
    const progress = questProgress(quest);
    const percent = Math.min(100, (progress / quest.goal) * 100);
    const card = document.createElement("article");
    card.className = "quest-card";
    card.innerHTML = `
      <div class="quest-top">
        <div>
          <div class="quest-name">${quest.title}</div>
          <p class="quest-description">${formatNumber(progress)} / ${formatNumber(quest.goal)}</p>
        </div>
        <span class="quest-reward">+${formatNumber(questRewardAmount(quest))}</span>
      </div>
      <div class="progress-track" aria-label="Quest progress">
        <span class="progress-fill" style="--progress: ${percent}%"></span>
      </div>
    `;
    elements.questsList.append(card);
  });
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
      <div class="progress-track" aria-label="Milestone progress">
        <span class="progress-fill" style="--progress: ${unlocked ? 100 : percent}%"></span>
      </div>
      <p class="small-note">${unlocked ? "Unlocked permanent production bonus." : `${formatNumber(Math.min(state.totalEnergy, milestone.amount))} / ${formatNumber(milestone.amount)}`}</p>
    `;
    elements.milestonesList.append(card);
  });
}

function renderAchievements() {
  elements.achievementsList.innerHTML = "";

  achievements.forEach((achievement) => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    const card = document.createElement("article");
    card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <div>
        <div class="achievement-name">${achievement.name}</div>
        <p class="achievement-description">${achievement.description}</p>
      </div>
      <span class="achievement-status" aria-label="${unlocked ? "Unlocked" : "Locked"}">${unlocked ? "✓" : "?"}</span>
    `;
    elements.achievementsList.append(card);
  });
}

function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.isUnlocked(state)) {
      state.achievements[achievement.id] = true;
      showToast("Achievement unlocked!", achievement.name);
      playSound("achievement");
    }
  });
}

function checkMilestones() {
  milestoneDefinitions.forEach((milestone) => {
    if (!state.milestones[milestone.id] && state.totalEnergy >= milestone.amount) {
      state.milestones[milestone.id] = true;
      showToast("Milestone reached!", `${milestone.name}: +${Math.round(milestone.bonus * 100)}% production forever.`);
      playSound("achievement");
    }
  });
}

function createQuest(excludedTypes = []) {
  const available = questTemplates.filter((template) => !excludedTypes.includes(template.type));
  const template = available[Math.floor(Math.random() * available.length)] || questTemplates[0];
  const goal = Math.max(1, Math.round(template.size()));
  const start = template.absolute ? 0 : template.current();
  const target = template.absolute ? goal : start + goal;
  return {
    id: `${template.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: template.type,
    title: template.label.replace("{target}", formatNumber(goal)),
    start,
    target,
    goal,
    createdAt: Date.now(),
  };
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
  if (checkingQuests) {
    return;
  }

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
    checkAchievements();
  }
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
  if (!offlineWelcome || offlineWelcome.amount <= 0) {
    return;
  }

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
  if (value < 1000) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  const tier = Math.min(Math.floor(Math.log10(value) / 3), units.length - 1);
  const scaled = value / 1000 ** tier;
  return `${scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)}${units[tier]}`;
}

function saveGame() {
  state.lastPlayedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function createDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) {
    const freshState = createDefaultState();
    freshState.lastPlayedAt = Date.now();
    return freshState;
  }

  try {
    const parsed = JSON.parse(saved);
    const loadedState = {
      ...createDefaultState(),
      ...parsed,
      upgrades: { ...defaultState.upgrades, ...parsed.upgrades },
      achievements: { ...defaultState.achievements, ...parsed.achievements },
      milestones: { ...defaultState.milestones, ...parsed.milestones },
      quests: Array.isArray(parsed.quests) ? parsed.quests : [],
    };

    const previousLastPlayed = Number(parsed.lastPlayedAt);
    applyOfflineEarnings(loadedState, previousLastPlayed);
    loadedState.lastPlayedAt = Date.now();
    return loadedState;
  } catch {
    return createDefaultState();
  }
}

function applyOfflineEarnings(loadedState, previousLastPlayed) {
  if (!previousLastPlayed) {
    return;
  }

  const elapsedMs = Math.max(0, Math.min(Date.now() - previousLastPlayed, OFFLINE_CAP_MS));
  const offlineSeconds = Math.floor(elapsedMs / 1000);
  const unlockedMilestoneBonus = milestoneDefinitions.reduce((bonus, milestone) => {
    return loadedState.milestones[milestone.id] ? bonus + milestone.bonus : bonus;
  }, 0);
  const multiplier = 1 + loadedState.upgrades.energyCore * 0.1 + unlockedMilestoneBonus;
  const amount = loadedState.upgrades.autoCollector * multiplier * offlineSeconds;

  if (amount <= 0) {
    return;
  }

  loadedState.energy += amount;
  loadedState.totalEnergy += amount;
  offlineWelcome = { amount, elapsedMs };
}

function resetProgress() {
  const firstConfirmed = confirm("Reset all Collector progress? This will erase Energy, upgrades, quests, milestones, and achievements.");
  if (!firstConfirmed) {
    return;
  }

  const phrase = prompt('Type "RESET" to permanently clear Collector progress.');
  if (phrase !== "RESET") {
    showToast("Reset canceled", "Progress was kept safe.");
    return;
  }

  state = createDefaultState();
  state.lastPlayedAt = Date.now();
  localStorage.removeItem(SAVE_KEY);
  ensureActiveQuests();
  showToast("Progress reset", "A fresh Collector run is ready.");
  render();
  saveGame();
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playSound(type) {
  if (state.muted) {
    return;
  }

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

elements.collectorButton.addEventListener("click", collectEnergy);
elements.resetButton.addEventListener("click", resetProgress);
elements.muteButton.addEventListener("click", toggleMute);
elements.dailyRewardButton.addEventListener("click", claimDailyReward);
elements.welcomeCloseButton.addEventListener("click", () => closeModal(elements.welcomeModal));
elements.helpButton.addEventListener("click", () => elements.helpModal.classList.remove("hidden"));
elements.helpCloseButton.addEventListener("click", () => closeModal(elements.helpModal));

elements.welcomeModal.addEventListener("click", (event) => {
  if (event.target === elements.welcomeModal) {
    closeModal(elements.welcomeModal);
  }
});

elements.helpModal.addEventListener("click", (event) => {
  if (event.target === elements.helpModal) {
    closeModal(elements.helpModal);
  }
});

setInterval(() => {
  const income = energyPerSecond();
  if (income > 0) {
    addEnergy(income);
  }
}, 1000);

setInterval(saveGame, 5000);

ensureActiveQuests();
checkMilestones();
checkAchievements();
checkQuests();
render();
saveGame();
showOfflineWelcome();
