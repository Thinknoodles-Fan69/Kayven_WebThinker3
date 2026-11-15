const GAME_CONFIG = {
  dawnTime: 8 * 60,
  playerSize: 34,
  startingHealth: 100,
  startingXp: 20,
  startingMoveSpeed: 220,
  startingPickupRadius: 38,
  maximumEnemies: 55
};

let gameState = "menu";
let playerSprite;
let playerSkinImage;
let zombieSkinImages = [];
let firePatchImage;
let lightningImage;
const weaponImageCache = new Map();
let enemySprites = [];
let projectileSprites = [];
let pickupSprites = [];
let elapsedSeconds = 0;
let spawnCountdown = 0;
let playerDamageCooldown = 0;
let playerHealth = GAME_CONFIG.startingHealth;
let playerMaximumHealth = GAME_CONFIG.startingHealth;
let playerMoveSpeed = GAME_CONFIG.startingMoveSpeed;
let pickupRadius = GAME_CONFIG.startingPickupRadius;
let playerWeapons = [];
let playerLevel = 1;
let playerXp = 0;
let xpForNextLevel = GAME_CONFIG.startingXp;
let playerCoins = 0;
let enemiesDefeated = 0;
let pendingUpgrades = 0;
let bonusEvolutionPending = false;
let lastHudUpdate = 0;
let nextEnemyId = 1;

const ui = {};

const WEAPON_DEFINITIONS = [
  {
    id: "boomerang",
    name: "Boomerang",
    evolution: "Magnetic Rebounder",
    attack: "boomerang",
    color: "#59d5d1",
    levels: [
      "Throws one boomerang that returns after travelling.",
      "Throws two boomerangs.",
      "Doubles boomerang damage.",
      "Increases boomerang damage.",
      "Increases boomerang size and damage."
    ],
    evolvedDescription: "Throws electrically charged boomerangs that deal stronger damage."
  },
  {
    id: "brick",
    name: "Brick",
    evolution: "1-Ton Iron",
    attack: "brick",
    color: "#a9b5b7",
    levels: [
      "Drops one heavy brick onto an enemy.",
      "Increases damage and drops more bricks.",
      "Increases the number of bricks.",
      "Increases the number of bricks again.",
      "Drops five bricks."
    ],
    evolvedDescription: "Drops much larger, heavier iron weights onto enemies."
  },
  {
    id: "drill",
    name: "Drill Shot",
    evolution: "Whistling Arrow",
    attack: "drill",
    color: "#e7d17c",
    levels: [
      "Fires one spinning drill.",
      "Fires two drills.",
      "Increases drill speed and number.",
      "Increases damage and number of drills.",
      "Fires more drills with increased damage."
    ],
    evolvedDescription: "Fires a powerful arrow that travels rapidly through enemies."
  },
  {
    id: "durian",
    name: "Durian",
    evolution: "Caltrops",
    attack: "durian",
    color: "#a9d65d",
    levels: [
      "Throws a spiky durian that damages nearby enemies.",
      "Doubles durian damage.",
      "Increases its size.",
      "Increases damage.",
      "Further increases damage."
    ],
    evolvedDescription: "Creates a larger spiked weapon that damages enemies around it."
  },
  {
    id: "droneA",
    name: "Type-A Drone",
    evolution: "Destroyer",
    attack: "drone",
    color: "#72c5ed",
    levels: [
      "Fires missiles at enemies.",
      "Increases missile damage.",
      "Improves missile power.",
      "Further increases damage.",
      "Greatly increases missile damage."
    ],
    evolvedDescription: "Combines with Type-B Drone into one stronger missile-firing Destroyer."
  },
  {
    id: "droneB",
    name: "Type-B Drone",
    evolution: "Destroyer",
    attack: "drone",
    color: "#b28df0",
    levels: [
      "Fires missiles at enemies.",
      "Improves missile strength.",
      "Improves missile damage.",
      "Increases damage.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Combines with Type-A Drone into one stronger missile-firing Destroyer."
  },
  {
    id: "guardian",
    name: "Guardian",
    evolution: "Defender",
    attack: "guardian",
    color: "#e8d378",
    levels: [
      "Spins protective blades around the player.",
      "Increases blade damage.",
      "Improves knockback.",
      "Improves damage and attack coverage.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Spins stronger protective blades that knock enemies away."
  },
  {
    id: "forcefield",
    name: "Forcefield",
    evolution: "Force Barrier",
    attack: "forcefield",
    color: "#78d8ef",
    levels: [
      "Creates a damaging circular field around the player.",
      "Increases field damage.",
      "Improves the field's effectiveness.",
      "Increases damage and field size.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Creates a stronger protective energy field around the player."
  },
  {
    id: "lightning",
    name: "Lightning Emitter",
    evolution: "Supercell",
    attack: "lightning",
    color: "#e9e775",
    levels: [
      "Strikes enemies with lightning.",
      "Increases lightning damage.",
      "Adds more lightning strikes.",
      "Increases damage and attack frequency.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Strikes across a wider area with powerful electrical attacks."
  },
  {
    id: "soccer",
    name: "Soccer Ball",
    evolution: "Quantum Ball",
    attack: "soccer",
    color: "#eeeece",
    levels: [
      "Throws a bouncing soccer ball that damages enemies.",
      "Increases ball damage.",
      "Improves attack performance.",
      "Increases damage and effectiveness.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Throws a stronger bouncing ball with improved damage and duration."
  },
  {
    id: "molotov",
    name: "Molotov",
    evolution: "Fuel Barrel",
    attack: "molotov",
    color: "#ff914f",
    levels: [
      "Throws bottles that create fire on the ground.",
      "Increases fire damage.",
      "Allows fire to spread.",
      "Increases damage and fire coverage.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Creates a larger area of powerful, spreading fire."
  },
  {
    id: "laser",
    name: "Laser Launcher",
    evolution: "Death Ray",
    attack: "laser",
    color: "#f16ca9",
    levels: [
      "Fires laser beams that damage enemies.",
      "Increases laser damage.",
      "Improves laser performance.",
      "Increases damage and effectiveness.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Fires stronger laser attacks through enemies in its path."
  },
  {
    id: "rpg",
    name: "RPG",
    evolution: "Sharkmaw Gun",
    attack: "rpg",
    color: "#ff8566",
    levels: [
      "Fires explosive rockets.",
      "Increases rocket damage.",
      "Improves firing performance.",
      "Reduces firing cooldown.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Fires powerful rockets with stronger explosions."
  },
  {
    id: "mine",
    name: "Modular Mine",
    evolution: "Thunderbolt Bomb",
    attack: "mine",
    color: "#e99968",
    levels: [
      "Places a mine that explodes when enemies approach.",
      "Increases explosion damage.",
      "Improves mine effectiveness.",
      "Increases explosion damage.",
      "Reaches maximum normal upgrade."
    ],
    evolvedDescription: "Combines with lightning attacks to create an electrical explosive."
  }
];

const STAT_UPGRADES = [
  {
    id: "swift-feet",
    name: "Swift feet",
    description: "Move 12% faster through the forest.",
    apply() {
      playerMoveSpeed *= 1.12;
    }
  },
  {
    id: "forest-coat",
    name: "Forest-forged coat",
    description: "Gain 20 maximum health and restore it.",
    apply() {
      playerMaximumHealth += 20;
      playerHealth = playerMaximumHealth;
    }
  },
  {
    id: "wildwood-magnet",
    name: "Wildwood magnet",
    description: "Collect XP and coins from farther away.",
    apply() {
      pickupRadius += 18;
    }
  },
  {
    id: "second-wind",
    name: "Second wind",
    description: "Restore 35 health immediately.",
    apply() {
      playerHealth = Math.min(playerMaximumHealth, playerHealth + 35);
    }
  }
];

function setup() {
  cacheInterface();
  showStartScreen();
  new Canvas(windowWidth, windowHeight);
  frameRate(60);
  playerSkinImage = createPlayerSkin();
  firePatchImage = createFirePatchImage();
  lightningImage = createLightningImage();
  zombieSkinImages = [
    createZombieSkin("#8cae70", "#465b49", "#46543b"),
    createZombieSkin("#9bb477", "#594b45", "#52523c"),
    createZombieSkin("#799b72", "#544a59", "#3d4938")
  ];
}

function draw() {
  const deltaSeconds = Math.min(deltaTime / 1000, 0.05);
  drawForest();

  if (gameState === "playing") {
    updateGame(deltaSeconds);
  }

  if (millis() - lastHudUpdate > 100) {
    updateHud();
    lastHudUpdate = millis();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (playerSprite) {
    playerSprite.x = constrain(playerSprite.x, GAME_CONFIG.playerSize, width - GAME_CONFIG.playerSize);
    playerSprite.y = constrain(playerSprite.y, GAME_CONFIG.playerSize, height - GAME_CONFIG.playerSize);
  }
}

function cacheInterface() {
  ui.hud = document.getElementById("hud");
  ui.overlay = document.getElementById("overlay");
  ui.panel = document.getElementById("panel");
  ui.healthFill = document.getElementById("health-fill");
  ui.xpFill = document.getElementById("xp-fill");
  ui.xpValue = document.getElementById("xp-value");
  ui.level = document.getElementById("level");
  ui.coins = document.getElementById("coins");
  ui.kills = document.getElementById("kills");
  ui.timer = document.getElementById("timer");
  ui.wave = document.getElementById("wave-label");
  ui.loadout = document.getElementById("weapon-loadout");
}

function drawForest() {
  background("#172b23");
  noStroke();

  for (let x = 22; x < width; x += 74) {
    for (let y = 18; y < height; y += 68) {
      const patch = noise(x * 0.014, y * 0.014);
      if (patch > 0.52) {
        fill(patch > 0.7 ? "#1c3429" : "#1a3027");
        circle(x + Math.sin(y) * 8, y + Math.cos(x) * 7, 18 + patch * 16);
      }
    }
    updateZombieHealthBars();
  }

  noFill();
  stroke("#91a97a55");
  strokeWeight(3);
  rect(12, 12, Math.max(0, width - 24), Math.max(0, height - 24), 22);
}

function startRun() {
  removeSprite(playerSprite);
  removeEnemies(enemySprites);
  removeSprites(projectileSprites);
  removeSprites(pickupSprites);

  enemySprites = [];
  projectileSprites = [];
  pickupSprites = [];
  elapsedSeconds = 0;
  spawnCountdown = 0.8;
  playerDamageCooldown = 0;
  playerHealth = GAME_CONFIG.startingHealth;
  playerMaximumHealth = GAME_CONFIG.startingHealth;
  playerMoveSpeed = GAME_CONFIG.startingMoveSpeed;
  pickupRadius = GAME_CONFIG.startingPickupRadius;
  playerWeapons = [createWeapon("pistol")];
  playerLevel = 1;
  playerXp = 0;
  xpForNextLevel = GAME_CONFIG.startingXp;
  playerCoins = 0;
  enemiesDefeated = 0;
  pendingUpgrades = 0;
  bonusEvolutionPending = false;
  nextEnemyId = 1;

  playerSprite = new Sprite(width / 2, height / 2, 44, 50);
  playerSprite.collider = "none";
  playerSprite.img = playerSkinImage;
  playerSprite.gameRole = "player";

  gameState = "playing";
  ui.overlay.hidden = true;
  ui.hud.style.display = "flex";
  updateHud();
}

function updateGame(deltaSeconds) {
  elapsedSeconds += deltaSeconds;
  playerDamageCooldown = Math.max(0, playerDamageCooldown - deltaSeconds);

  movePlayer(deltaSeconds);
  updateEnemies(deltaSeconds);
  if (gameState !== "playing") return;

  updateWeapons(deltaSeconds);
  updateProjectiles(deltaSeconds);
  updatePickups();
  if (gameState !== "playing") return;

  spawnCountdown -= deltaSeconds;
  if (spawnCountdown <= 0 && enemySprites.length < GAME_CONFIG.maximumEnemies) {
    spawnEnemy();
    const difficulty = Math.min(elapsedSeconds / 360, 0.72);
    spawnCountdown = Math.max(0.35, 1.65 - difficulty);
  }

  enemySprites = enemySprites.filter((enemy) => enemy.gameIsAlive);
  projectileSprites = projectileSprites.filter((projectile) => projectile.gameIsActive);
  pickupSprites = pickupSprites.filter((pickup) => pickup.gameIsActive);

  if (elapsedSeconds >= GAME_CONFIG.dawnTime) {
    finishRun(true);
  }
}

function movePlayer(deltaSeconds) {
  let horizontal = Number(keyIsDown(68)) - Number(keyIsDown(65));
  let vertical = Number(keyIsDown(83)) - Number(keyIsDown(87));
  const magnitude = Math.hypot(horizontal, vertical);

  if (magnitude > 0) {
    horizontal /= magnitude;
    vertical /= magnitude;
    playerSprite.x += horizontal * playerMoveSpeed * deltaSeconds;
    playerSprite.y += vertical * playerMoveSpeed * deltaSeconds;
  }

  const margin = GAME_CONFIG.playerSize / 2;
  playerSprite.x = constrain(playerSprite.x, margin, width - margin);
  playerSprite.y = constrain(playerSprite.y, margin, height - margin);
}

function updateEnemies(deltaSeconds) {
  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive) continue;

    const dx = playerSprite.x - enemy.x;
    const dy = playerSprite.y - enemy.y;
    const distance = Math.max(1, Math.hypot(dx, dy));

    enemy.x += (dx / distance) * enemy.gameMoveSpeed * deltaSeconds;
    enemy.y += (dy / distance) * enemy.gameMoveSpeed * deltaSeconds;

    if (distance < GAME_CONFIG.playerSize / 2 + enemy.gameEnemyRadius + 3 && playerDamageCooldown <= 0) {
      playerHealth = Math.max(0, playerHealth - enemy.gameContactDamage);
      playerDamageCooldown = 0.72;
      if (playerHealth <= 0) {
        finishRun(false);
        return;
      }
    }
  }
}

function updateWeapons(deltaSeconds) {
  for (const weapon of playerWeapons) {
    weapon.gameCooldown = Math.max(0, weapon.gameCooldown - deltaSeconds);
    if (weapon.gameCooldown > 0) continue;

    if (weapon.id === "guardian") {
      attackWithGuardian(weapon);
    } else if (weapon.id === "forcefield") {
      attackWithForcefield(weapon);
    } else {
      const target = findNearestEnemy(weapon.id === "pistol" ? 520 : 680);
      if (!target) continue;
      playerSprite.rotation = Math.atan2(target.y - playerSprite.y, target.x - playerSprite.x) * 180 / Math.PI;
      fireWeapon(weapon, target);
    }

    weapon.gameCooldown = getWeaponCooldown(weapon);
  }
}

function updateProjectiles(deltaSeconds) {
  for (const projectile of projectileSprites) {
    if (!projectile.gameIsActive) continue;
    projectile.gameLifetime -= deltaSeconds;
    projectile.gameDamageClock = Math.max(0, projectile.gameDamageClock - deltaSeconds);

    if (projectile.gameType === "area" || projectile.gameType === "mine") {
      updateAreaWeapon(projectile, deltaSeconds);
      if (projectile.gameType === "mine" && projectile.gameTriggered) {
        explodeProjectile(projectile);
      } else if (projectile.gameLifetime <= 0) {
        removeProjectile(projectile);
      }
      continue;
    }

    if (projectile.gameType === "beam") {
      if (projectile.gameLifetime <= 0) removeProjectile(projectile);
      continue;
    }

    updateMovingWeapon(projectile, deltaSeconds);
  }
}

function createWeapon(id) {
  const definition = WEAPON_DEFINITIONS.find((weapon) => weapon.id === id);
  return {
    id,
    name: id === "pistol" ? "Survivor's Pistol" : definition.name,
    evolution: definition?.evolution ?? null,
    attack: id === "pistol" ? "pistol" : definition.attack,
    color: id === "pistol" ? "#f4d36d" : definition.color,
    level: 1,
    isEvolved: false,
    gameCooldown: 0.25,
    gameOrbitAngle: 0
  };
}

function getWeaponCooldown(weapon) {
  const base = {
    pistol: 0.72,
    boomerang: 1.25,
    brick: 1.5,
    drill: 1.2,
    durian: 1.65,
    drone: 1.15,
    guardian: 0.45,
    forcefield: 0.7,
    lightning: 1.45,
    soccer: 1.4,
    molotov: 1.7,
    laser: 1.5,
    rpg: 1.75,
    mine: 2.4
  }[weapon.attack];

  return Math.max(0.28, base * (1 - (weapon.level - 1) * 0.085) * (weapon.isEvolved ? 0.72 : 1));
}

function getWeaponDamage(weapon) {
  const base = weapon.id === "pistol" ? 14 : 16;
  const levelMultiplier = 1 + (weapon.level - 1) * 0.38;
  return base * levelMultiplier * (weapon.isEvolved ? 1.8 : 1);
}

function getAttackCount(weapon) {
  if (weapon.attack === "brick" || weapon.attack === "drill") return Math.min(5, weapon.level);
  if (weapon.attack === "boomerang") return weapon.level >= 2 ? 2 : 1;
  if (weapon.attack === "drone") return weapon.level >= 3 ? 2 : 1;
  if (weapon.attack === "lightning") return Math.min(4, 1 + Math.floor((weapon.level - 1) / 2));
  if (weapon.attack === "rpg") return weapon.level >= 5 ? 2 : 1;
  return 1;
}

function fireWeapon(weapon, target) {
  const count = getAttackCount(weapon);
  const damage = getWeaponDamage(weapon);

  if (weapon.attack === "lightning") {
    const targets = [...enemySprites]
      .filter((enemy) => enemy.gameIsAlive)
      .sort((a, b) => distanceToPlayer(a) - distanceToPlayer(b))
      .slice(0, count + (weapon.isEvolved ? 2 : 0));
    for (const enemy of targets) {
      damageEnemy(enemy, damage * (weapon.isEvolved ? 1.6 : 1));
      createLightningStrike(enemy.x, enemy.y, weapon.color);
    }
    return;
  }

  if (weapon.attack === "laser") {
    fireLaser(weapon, target, damage);
    return;
  }

  if (weapon.attack === "guardian" || weapon.attack === "forcefield") return;

  for (let index = 0; index < count; index += 1) {
    const spread = count > 1 ? (index - (count - 1) / 2) * 0.2 : 0;
    const targetAngle = Math.atan2(target.y - playerSprite.y, target.x - playerSprite.x) + spread;
    const aim = {
      x: playerSprite.x + Math.cos(targetAngle) * Math.max(200, Math.hypot(target.x - playerSprite.x, target.y - playerSprite.y)),
      y: playerSprite.y + Math.sin(targetAngle) * Math.max(200, Math.hypot(target.x - playerSprite.x, target.y - playerSprite.y))
    };

    if (weapon.attack === "durian" || weapon.attack === "molotov") {
      createAreaWeapon(weapon, target.x, target.y, damage);
    } else if (weapon.attack === "mine") {
      createMine(weapon, damage);
    } else {
      createMovingWeapon(weapon, target, aim, damage);
    }
  }
}

function createMovingWeapon(weapon, target, aim, damage) {
  const dimensions = getWeaponDimensions(weapon);
  const aimAngle = Math.atan2(aim.y - playerSprite.y, aim.x - playerSprite.x);
  const isBrick = weapon.attack === "brick";
  const originX = isBrick ? target.x : playerSprite.x + Math.cos(aimAngle) * 23;
  const originY = isBrick ? target.y - 110 : playerSprite.y + Math.sin(aimAngle) * 23;
  const projectile = new Sprite(originX, originY, dimensions.width, dimensions.height);
  projectile.collider = "none";
  projectile.img = getWeaponImage(weapon.attack, weapon.color);
  projectile.rotation = aimAngle * 180 / Math.PI;
  projectile.color = "#ffffff";
  projectile.stroke = "transparent";
  projectile.gameRole = "weaponProjectile";
  projectile.gameType = weapon.attack;
  projectile.gameWeaponId = weapon.id;
  projectile.gameWeaponLevel = weapon.level;
  projectile.gameTarget = target;
  projectile.gameDirectionX = aim.x - playerSprite.x;
  projectile.gameDirectionY = aim.y - playerSprite.y;
  projectile.gameDamage = damage * (weapon.attack === "boomerang" && weapon.level >= 3 ? 2 : 1);
  projectile.gameSpeed = getProjectileSpeed(weapon);
  projectile.gameDistance = 0;
  projectile.gameLifetime = weapon.attack === "boomerang" ? 3.2 : 3.5;
  projectile.gameIsReturning = false;
  projectile.gameHitIds = new Set();
  projectile.gameIsActive = true;
  projectileSprites.push(projectile);
}

function getProjectileSpeed(weapon) {
  if (weapon.attack === "brick") return 520;
  if (weapon.attack === "drill") return 560 + weapon.level * 35;
  if (weapon.attack === "soccer") return 380;
  if (weapon.attack === "boomerang") return 360;
  if (weapon.attack === "rpg") return 300;
  if (weapon.attack === "drone") return 330;
  return weapon.isEvolved ? 620 : 470;
}

function getWeaponDimensions(weapon) {
  const sizes = {
    pistol: [25, 12],
    boomerang: [weapon.level >= 5 || weapon.isEvolved ? 32 : 25, weapon.level >= 5 || weapon.isEvolved ? 32 : 25],
    brick: [25, 24],
    drill: [31, 17],
    drone: [25, 25],
    soccer: [25, 25],
    rpg: [33, 17]
  };
  const [width, height] = sizes[weapon.attack] ?? [18, 18];
  return { width, height };
}

function updateMovingWeapon(projectile, deltaSeconds) {
  let target = projectile.gameTarget;

  if (projectile.gameType === "boomerang" && projectile.gameLifetime < 2.35) {
    projectile.gameIsReturning = true;
  }

  if (projectile.gameIsReturning) {
    const dx = playerSprite.x - projectile.x;
    const dy = playerSprite.y - projectile.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    projectile.x += (dx / distance) * projectile.gameSpeed * deltaSeconds;
    projectile.y += (dy / distance) * projectile.gameSpeed * deltaSeconds;
    if (distance < 24) {
      removeProjectile(projectile);
      return;
    }
    checkProjectileHits(projectile);
    return;
  }

  if ((!target || !target.gameIsAlive || projectile.gameHitIds.has(target.gameId)) &&
      ["pistol", "drone", "rpg", "soccer"].includes(projectile.gameType)) {
    target = projectile.gameType === "soccer"
      ? findNearestUnhitEnemy(projectile, 600)
      : findNearestEnemy(600);
    projectile.gameTarget = target;
    if (!target) {
      removeProjectile(projectile);
      return;
    }
  }

  if ((projectile.gameType === "pistol" || projectile.gameType === "drone" ||
      projectile.gameType === "rpg" || projectile.gameType === "soccer") && target?.gameIsAlive) {
    projectile.gameDirectionX = target.x - projectile.x;
    projectile.gameDirectionY = target.y - projectile.y;
  }

  const directionLength = Math.max(1, Math.hypot(projectile.gameDirectionX, projectile.gameDirectionY));
  const step = projectile.gameSpeed * deltaSeconds;
  projectile.rotation = Math.atan2(projectile.gameDirectionY, projectile.gameDirectionX) * 180 / Math.PI;

  if (projectile.gameType === "brick" && projectile.gameLifetime <= 3.1) {
    projectile.y += step;
  } else if (projectile.gameType !== "brick") {
    projectile.x += (projectile.gameDirectionX / directionLength) * step;
    projectile.y += (projectile.gameDirectionY / directionLength) * step;
  }
  projectile.gameDistance += step;
  checkProjectileHits(projectile);

  if (!projectile.gameIsActive) return;
  if (projectile.gameType === "brick" && projectile.gameLifetime < 2.9) {
    explodeProjectile(projectile, 74);
    return;
  }

  if (projectile.gameType === "rpg" && target?.gameIsAlive &&
      Math.hypot(projectile.x - target.x, projectile.y - target.y) < target.gameEnemyRadius + 14) {
    explodeProjectile(projectile, projectile.gameWeaponId === "rpg" ? 86 : 60);
    return;
  }

  if (projectile.gameType === "boomerang" && projectile.gameDistance > 230) {
    projectile.gameIsReturning = true;
  } else if (projectile.gameType !== "boomerang" && projectile.gameDistance > 1050) {
    removeProjectile(projectile);
  } else if (projectile.gameLifetime <= 0) {
    removeProjectile(projectile);
  }
}

function checkProjectileHits(projectile) {
  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive || projectile.gameHitIds.has(enemy.gameId)) continue;
    const collisionDistance = enemy.gameEnemyRadius + (projectile.width / 2);
    if (Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) > collisionDistance) continue;

    projectile.gameHitIds.add(enemy.gameId);
    if (projectile.gameType === "rpg") {
      explodeProjectile(projectile, 86);
      return;
    }
    damageEnemy(enemy, projectile.gameDamage);
    if (projectile.gameType === "pistol" || projectile.gameType === "drone" ||
        projectile.gameType === "boomerang" || projectile.gameType === "rpg") {
      if (projectile.gameType === "rpg") explodeProjectile(projectile, 86);
      else if (projectile.gameType === "boomerang") projectile.gameIsReturning = true;
      else removeProjectile(projectile);
      return;
    }
    if (projectile.gameType === "soccer") {
      projectile.gameTarget = findNearestEnemy(600);
      if (!projectile.gameTarget) removeProjectile(projectile);
    }
    if (projectile.gameType === "drill" && projectile.gameHitIds.size >= 3 + projectile.gameWeaponLevel) {
      removeProjectile(projectile);
      return;
    }
  }
}

function createAreaWeapon(weapon, x, y, damage) {
  const baseSize = weapon.attack === "molotov" ? 86 : 58;
  const size = baseSize + (weapon.level - 1) * 8 + (weapon.isEvolved ? 24 : 0);
  const area = new Sprite(x, y, size, size);
  area.collider = "none";
  area.img = weapon.attack === "molotov"
    ? firePatchImage
    : getWeaponImage(weapon.attack, weapon.color);
  area.color = "#ffffff";
  area.stroke = "transparent";
  area.gameRole = "weaponArea";
  area.gameType = "area";
  area.gameWeaponId = weapon.id;
  area.gameWeaponLevel = weapon.level;
  area.gameIsEvolved = weapon.isEvolved;
  area.gameDamage = damage * (weapon.attack === "molotov" ? 0.2 : 1) * (weapon.isEvolved ? 1.6 : 1);
  area.gameRadius = size / 2;
  area.gameDamageClock = 0.2;
  area.gameSpreadClock = 1.4;
  area.gameCanSpread = weapon.attack === "molotov" && weapon.level >= 3;
  area.gameLifetime = weapon.attack === "molotov" ? 4.5 : 3.2;
  area.gameIsActive = true;
  projectileSprites.push(area);
}

function createMine(weapon, damage) {
  const angle = Math.random() * Math.PI * 2;
  const mine = new Sprite(
    playerSprite.x + Math.cos(angle) * 55,
    playerSprite.y + Math.sin(angle) * 55,
    weapon.isEvolved ? 28 : 20,
    weapon.isEvolved ? 28 : 20
  );
  mine.collider = "none";
  mine.img = getWeaponImage("mine", weapon.color);
  mine.color = "#ffffff";
  mine.stroke = "transparent";
  mine.gameRole = "weaponMine";
  mine.gameType = "mine";
  mine.gameDamage = damage * (weapon.isEvolved ? 2 : 1);
  mine.gameRadius = weapon.isEvolved ? 130 : 92;
  mine.gameDamageClock = 0;
  mine.gameLifetime = 10;
  mine.gameIsActive = true;
  mine.gameTriggered = false;
  projectileSprites.push(mine);
}

function updateAreaWeapon(area, deltaSeconds) {
  if (area.gameType === "mine") {
    area.gameTriggered = enemySprites.some((enemy) =>
      enemy.gameIsAlive && Math.hypot(enemy.x - area.x, enemy.y - area.y) <= area.gameRadius * 0.48
    );
    return;
  }

  if (area.gameCanSpread) {
    area.gameSpreadClock -= deltaSeconds;
    if (area.gameSpreadClock <= 0) {
      area.gameSpreadClock = 1.4;
      const activeFirePatches = projectileSprites.filter((item) =>
        item.gameIsActive && item.gameType === "area" && item.gameWeaponId === "molotov"
      ).length;
      if (activeFirePatches < 8) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 35 + Math.random() * 35;
        const spreadWeapon = {
          attack: "molotov",
          color: "#ff914f",
          level: area.gameWeaponLevel,
          isEvolved: area.gameIsEvolved
        };
        const child = createAreaWeapon(
          spreadWeapon,
          area.x + Math.cos(angle) * distance,
          area.y + Math.sin(angle) * distance,
          area.gameDamage / (0.2 * (area.gameIsEvolved ? 1.6 : 1))
        );
        child.gameCanSpread = false;
        child.gameLifetime = 2.8;
      }
    }
  }

  if (area.gameDamageClock > 0) return;
  area.gameDamageClock = area.gameWeaponId === "molotov" ? 0.55 : 0.7;
  const radius = area.gameRadius + (area.gameWeaponId === "durian" ? 0 : 14);
  for (const enemy of enemySprites) {
    if (enemy.gameIsAlive && Math.hypot(enemy.x - area.x, enemy.y - area.y) <= radius) {
      damageEnemy(enemy, area.gameDamage);
    }
  }
}

function explodeProjectile(projectile, radius = projectile.gameRadius || 90) {
  const damage = projectile.gameDamage;
  for (const enemy of enemySprites) {
    if (enemy.gameIsAlive && Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) <= radius) {
      damageEnemy(enemy, damage);
    }
  }
  removeProjectile(projectile);
}

function attackWithGuardian(weapon) {
  weapon.gameOrbitAngle += 0.9 + weapon.level * 0.12;
  const orbitRadius = 45 + weapon.level * 6;
  const bladeX = playerSprite.x + Math.cos(weapon.gameOrbitAngle) * orbitRadius;
  const bladeY = playerSprite.y + Math.sin(weapon.gameOrbitAngle) * orbitRadius;
  const target = enemySprites.find((enemy) =>
    enemy.gameIsAlive && Math.hypot(enemy.x - bladeX, enemy.y - bladeY) < enemy.gameEnemyRadius + 20
  );
  if (target) {
    damageEnemy(target, getWeaponDamage(weapon));
    const knockback = weapon.isEvolved ? 34 : 14 + weapon.level * 3;
    const angle = Math.atan2(target.y - playerSprite.y, target.x - playerSprite.x);
    target.x += Math.cos(angle) * knockback;
    target.y += Math.sin(angle) * knockback;
  }

  const blade = createEffectSprite(bladeX, bladeY, 20, weapon.color, "guardianBlade");
  blade.img = getWeaponImage("guardian", weapon.color);
  blade.color = "#ffffff";
  blade.stroke = "transparent";
  blade.gameLifetime = 0.12;
}

function attackWithForcefield(weapon) {
  const radius = 68 + weapon.level * 12 + (weapon.isEvolved ? 38 : 0);
  for (const enemy of enemySprites) {
    if (enemy.gameIsAlive && Math.hypot(enemy.x - playerSprite.x, enemy.y - playerSprite.y) <= radius) {
      damageEnemy(enemy, getWeaponDamage(weapon));
    }
  }
  const field = createEffectSprite(playerSprite.x, playerSprite.y, radius * 2, weapon.color, "forceField");
  field.img = getWeaponImage("forcefield", weapon.color);
  field.color = "#ffffff";
  field.stroke = "transparent";
  field.gameLifetime = 0.18;
}

function fireLaser(weapon, target, damage) {
  const startX = playerSprite.x;
  const startY = playerSprite.y;
  const dx = target.x - startX;
  const dy = target.y - startY;
  const distance = Math.hypot(dx, dy);
  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive) continue;
    const relativeX = enemy.x - startX;
    const relativeY = enemy.y - startY;
    const projection = constrain((relativeX * dx + relativeY * dy) / (distance * distance), 0, 1);
    const closestX = startX + projection * dx;
    const closestY = startY + projection * dy;
    if (Math.hypot(enemy.x - closestX, enemy.y - closestY) <= enemy.gameEnemyRadius + 13) {
      damageEnemy(enemy, damage * (weapon.isEvolved ? 1.7 : 1));
    }
  }
  createBeam(startX, startY, target.x, target.y, weapon.color, 0.22);
}

function createBeam(startX, startY, endX, endY, color, lifetime) {
  const length = Math.hypot(endX - startX, endY - startY);
  const beam = new Sprite((startX + endX) / 2, (startY + endY) / 2, Math.max(8, length), 5);
  beam.collider = "none";
  beam.color = color;
  beam.stroke = color;
  beam.rotation = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
  beam.gameRole = "weaponBeam";
  beam.gameType = "beam";
  beam.gameLifetime = lifetime;
  beam.gameIsActive = true;
  projectileSprites.push(beam);
}

function createLightningStrike(x, targetY, color) {
  const height = Math.max(70, targetY + 10);
  const strike = new Sprite(x, height / 2, 54, height);
  strike.collider = "none";
  strike.img = lightningImage;
  strike.color = "#ffffff";
  strike.gameRole = "topDownLightning";
  strike.gameType = "beam";
  strike.gameLifetime = 0.24;
  strike.gameIsActive = true;
  projectileSprites.push(strike);
}

function createEffectSprite(x, y, size, color, role) {
  const effect = new Sprite(x, y, size, size);
  effect.collider = "none";
  effect.color = color;
  effect.stroke = color;
  effect.strokeWeight = 3;
  effect.gameRole = role;
  effect.gameType = "beam";
  effect.gameIsActive = true;
  projectileSprites.push(effect);
  return effect;
}

function damageEnemy(enemy, damage) {
  if (!enemy.gameIsAlive) return;
  enemy.gameHealth -= damage;
  if (enemy.gameHealth <= 0) defeatEnemy(enemy);
}

function findNearestUnhitEnemy(projectile, maximumDistance) {
  let nearest = null;
  let nearestDistance = maximumDistance;
  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive || projectile.gameHitIds.has(enemy.gameId)) continue;
    const distance = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function distanceToPlayer(enemy) {
  return Math.hypot(enemy.x - playerSprite.x, enemy.y - playerSprite.y);
}

function updatePickups() {
  for (const pickup of pickupSprites) {
    if (!pickup.gameIsActive) continue;

    if (Math.hypot(pickup.x - playerSprite.x, pickup.y - playerSprite.y) <= pickupRadius + pickup.diameter / 2) {
      pickup.gameIsActive = false;
      pickup.remove();

      if (pickup.gameDropKind === "xp") {
        gainExperience(pickup.gameDropAmount);
      } else {
        playerCoins += pickup.gameDropAmount;
      }

      if (gameState !== "playing") break;
    }
  }
}

function spawnEnemy() {
  const position = findSpawnPosition();
  const strength = Math.floor(elapsedSeconds / 45);
  const enemySize = 42 + Math.min(strength, 10);
  const enemy = new Sprite(position.x, position.y, enemySize, enemySize);
  enemy.collider = "none";
  enemy.img = zombieSkinImages[Math.floor(Math.random() * zombieSkinImages.length)];
  enemy.gameRole = "forestMonster";
  enemy.gameId = nextEnemyId++;
  enemy.gameEnemyRadius = enemySize / 2;
  enemy.gameHealthMax = 36 + Math.floor(elapsedSeconds * 0.62) + strength * 11 + playerLevel * 2;
  enemy.gameHealth = enemy.gameHealthMax;
  enemy.gameMoveSpeed = 48 + Math.min(elapsedSeconds * 0.13, 58) + strength * 1.5;
  enemy.gameContactDamage = 8 + Math.floor(strength / 2);
  enemy.gameIsAlive = true;
  createZombieHealthBars(enemy);
  enemySprites.push(enemy);
}

function findSpawnPosition() {
  const margin = 30;
  let position = { x: width / 2, y: margin };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) position = { x: Math.random() * width, y: margin };
    if (side === 1) position = { x: width - margin, y: Math.random() * height };
    if (side === 2) position = { x: Math.random() * width, y: height - margin };
    if (side === 3) position = { x: margin, y: Math.random() * height };

    if (Math.hypot(position.x - playerSprite.x, position.y - playerSprite.y) > 180) {
      return position;
    }
  }

  const angle = Math.atan2(playerSprite.y - height / 2, playerSprite.x - width / 2) + Math.PI;
  return {
    x: constrain(playerSprite.x + Math.cos(angle) * 220, margin, width - margin),
    y: constrain(playerSprite.y + Math.sin(angle) * 220, margin, height - margin)
  };
}

function findNearestEnemy(maximumDistance) {
  let nearest = null;
  let nearestDistance = maximumDistance;

  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive) continue;
    const distance = Math.hypot(enemy.x - playerSprite.x, enemy.y - playerSprite.y);
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function defeatEnemy(enemy) {
  if (!enemy.gameIsAlive) return;
  enemy.gameIsAlive = false;
  enemy.remove();
  removeSprite(enemy.gameHealthBackground);
  removeSprite(enemy.gameHealthFill);
  enemiesDefeated += 1;
  createPickup(enemy.x - 7, enemy.y, "xp", 8 + Math.floor(playerLevel / 2));
  createPickup(enemy.x + 7, enemy.y, "coin", 1 + Math.floor(Math.random() * 3));
}

function createPickup(x, y, kind, amount) {
  const isXp = kind === "xp";
  const pickup = new Sprite(x, y, isXp ? 12 : 13, isXp ? 12 : 13);
  pickup.collider = "none";
  pickup.diameter = isXp ? 12 : 13;
  pickup.color = isXp ? "#72e0a0" : "#f2cb61";
  pickup.stroke = isXp ? "#d0ffe1" : "#fff0a7";
  pickup.strokeWeight = 1;
  pickup.gameRole = "collectibleDrop";
  pickup.gameDropKind = kind;
  pickup.gameDropAmount = amount;
  pickup.gameIsActive = true;
  pickupSprites.push(pickup);
}

function createZombieHealthBars(enemy) {
  enemy.gameHealthBackground = new Sprite(enemy.x, enemy.y - enemy.gameEnemyRadius - 10, 40, 5);
  enemy.gameHealthBackground.collider = "none";
  enemy.gameHealthBackground.color = "#261c1c";
  enemy.gameHealthBackground.stroke = "#f3d9bd";
  enemy.gameHealthBackground.strokeWeight = 1;
  enemy.gameHealthBackground.gameRole = "zombieHealthBackground";

  enemy.gameHealthFill = new Sprite(enemy.x, enemy.y - enemy.gameEnemyRadius - 10, 38, 3);
  enemy.gameHealthFill.collider = "none";
  enemy.gameHealthFill.color = "#e36155";
  enemy.gameHealthFill.stroke = "#e36155";
  enemy.gameHealthFill.gameRole = "zombieHealthFill";
}

function updateZombieHealthBars() {
  for (const enemy of enemySprites) {
    if (!enemy.gameIsAlive) continue;

    const barY = enemy.y - enemy.gameEnemyRadius - 10;
    enemy.gameHealthBackground.x = enemy.x;
    enemy.gameHealthBackground.y = barY;

    const ratio = Math.max(0, Math.min(1, enemy.gameHealth / enemy.gameHealthMax));
    enemy.gameHealthFill.w = Math.max(0.5, 38 * ratio);
    enemy.gameHealthFill.x = enemy.x - (38 - enemy.gameHealthFill.w) / 2;
    enemy.gameHealthFill.y = barY;
    enemy.gameHealthFill.color = ratio > 0.55 ? "#8fda73" : ratio > 0.25 ? "#e5bf57" : "#e36155";
  }
}

function removeEnemies(enemies) {
  for (const enemy of enemies) {
    enemy.remove();
    removeSprite(enemy.gameHealthBackground);
    removeSprite(enemy.gameHealthFill);
  }
}

function gainExperience(amount) {
  playerXp += amount;
  while (playerXp >= xpForNextLevel) {
    playerXp -= xpForNextLevel;
    playerLevel += 1;
    xpForNextLevel = Math.floor(xpForNextLevel * 1.35);
    pendingUpgrades += 1;
  }

  if (pendingUpgrades > 0 && gameState === "playing") {
    showUpgradeSelection();
  }
}

function showUpgradeSelection() {
  gameState = "upgrade";
  ui.overlay.hidden = false;
  ui.panel.replaceChildren();

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `LEVEL ${playerLevel}`;

  const heading = document.createElement("h2");
  heading.textContent = "Choose an upgrade";

  const description = document.createElement("p");
  description.className = "panel-copy";
  description.textContent = `Choose a new weapon, improve a weapon, or take an upgrade. Weapons: ${playerWeapons.length}/6.`;

  const list = document.createElement("div");
  list.className = "upgrade-list";
  const allChoices = getUpgradeChoices();
  const weaponChoices = allChoices.filter((choice) => choice.category === "weapon");
  const statChoices = allChoices.filter((choice) => choice.category !== "weapon");
  const choices = bonusEvolutionPending
    ? weaponChoices.filter((choice) => choice.id.startsWith("evolve-"))
    : weaponChoices.length
    ? [
        ...weaponChoices.sort(() => Math.random() - 0.5).slice(0, 2),
        ...statChoices.sort(() => Math.random() - 0.5).slice(0, 1)
      ]
    : statChoices.sort(() => Math.random() - 0.5).slice(0, 3);

  for (const choice of choices) {
    const button = document.createElement("button");
    button.className = "upgrade-button";
    button.type = "button";

    const name = document.createElement("strong");
    name.textContent = choice.name;
    const detail = document.createElement("span");
    detail.textContent = choice.description;
    button.append(name, detail);
    button.addEventListener("click", () => selectUpgrade(choice));
    list.append(button);
  }

  ui.panel.append(eyebrow, heading, description, list);
  updateHud();
}

function getUpgradeChoices() {
  const choices = STAT_UPGRADES.map((upgrade) => ({ ...upgrade }));

  for (const weapon of playerWeapons) {
    if (weapon.level < 5) {
      choices.push({
        id: `level-${weapon.id}`,
        category: "weapon",
        type: "weapon-level",
        weapon,
        name: weapon.id === "pistol" ? "Survivor's Pistol" : weapon.name,
        description: `${weapon.level + 1}★: ${getWeaponLevelDescription(weapon, weapon.level + 1)}`,
        apply() {
          weapon.level += 1;
        }
      });
    } else if (!weapon.isEvolved && weapon.id !== "droneB") {
      choices.push(...getEvolutionChoices(weapon));
    }
  }

  if (playerWeapons.length < 6) {
    for (const definition of WEAPON_DEFINITIONS) {
      if (playerWeapons.some((weapon) => weapon.id === definition.id)) continue;
      choices.push({
        id: `new-${definition.id}`,
        category: "weapon",
        name: definition.name,
        description: `New weapon · 1★: ${definition.levels[0]}`,
        apply() {
          playerWeapons.push(createWeapon(definition.id));
        }
      });
    }
  }

  return choices;
}

function getWeaponLevelDescription(weapon, level) {
  if (weapon.id === "pistol") {
    return [
      "",
      "Fires one aimed bullet at the nearest zombie.",
      "Reloads faster.",
      "Bullets deal more damage.",
      "Fires faster and hits harder.",
      "Reaches maximum pistol damage and firing speed."
    ][level];
  }
  return WEAPON_DEFINITIONS.find((definition) => definition.id === weapon.id)?.levels[level - 1] ??
    "Increases weapon power.";
}

function getEvolutionChoices(weapon) {
  if (weapon.id === "droneA" || weapon.id === "droneB") {
    const typeA = playerWeapons.find((item) => item.id === "droneA");
    const typeB = playerWeapons.find((item) => item.id === "droneB");
    if (!typeA || !typeB || typeA.level < 5 || typeB.level < 5) return [];
    return [{
      id: "evolve-destroyer",
      category: "weapon",
      name: "Evolution: Destroyer",
      description: "Combine both five-star drones into one powerful missile drone.",
      apply() {
        typeA.id = "destroyer";
        typeA.name = "Destroyer";
        typeA.evolution = null;
        typeA.attack = "drone";
        typeA.isEvolved = true;
        typeA.level = 5;
        playerWeapons = playerWeapons.filter((item) => item !== typeB);
      }
    }];
  }

  if (weapon.id === "mine") {
    const options = [];
    if (playerWeapons.some((item) => item.id === "lightning")) {
      options.push(makeEvolutionChoice(weapon, "Thunderbolt Bomb", "Combines mines with lightning for electrical explosions."));
    }
    if (playerWeapons.some((item) => item.id === "molotov")) {
      options.push(makeEvolutionChoice(weapon, "Inferno Bomb", "Combines mines with fire for fiery explosions."));
    }
    if (options.length) return options;
  }

  return weapon.evolution
    ? [makeEvolutionChoice(weapon, weapon.evolution, WEAPON_DEFINITIONS.find((item) => item.id === weapon.id)?.evolvedDescription ?? "A powerful evolved weapon.")]
    : [];
}

function makeEvolutionChoice(weapon, name, description) {
  return {
    id: `evolve-${weapon.id}-${name}`,
    category: "weapon",
    name: `Evolution: ${name}`,
    description: `Five-star evolution · ${description}`,
    apply() {
      weapon.isEvolved = true;
      weapon.name = name;
      if (weapon.id === "mine") {
        weapon.color = name === "Inferno Bomb" ? "#ff693c" : "#72e9fa";
      }
    }
  };
}

function selectUpgrade(choice) {
  const isBonusEvolution = bonusEvolutionPending && choice.id.startsWith("evolve-");
  choice.apply();
  if (isBonusEvolution) {
    bonusEvolutionPending = false;
  } else {
    pendingUpgrades -= 1;
    if (choice.type === "weapon-level" && choice.weapon.level === 5 &&
        getEvolutionChoices(choice.weapon).length > 0) {
      bonusEvolutionPending = true;
    }
  }

  if (pendingUpgrades > 0 || bonusEvolutionPending) {
    showUpgradeSelection();
  } else {
    gameState = "playing";
    ui.overlay.hidden = true;
    updateHud();
  }
}

function showStartScreen() {
  ui.hud.style.display = "none";
  ui.overlay.hidden = false;
  document.getElementById("start-button").addEventListener("click", startRun);
}

function finishRun(won) {
  if (gameState === "won" || gameState === "lost") return;
  gameState = won ? "won" : "lost";
  ui.overlay.hidden = false;
  ui.hud.style.display = "flex";
  ui.panel.innerHTML = `
    <p class="eyebrow">${won ? "YOU MADE IT THROUGH THE NIGHT" : "THE FOREST CLAIMS ANOTHER"}</p>
    <h2>${won ? "Dawn has come." : "Last breath."}</h2>
    <div class="results">
      Survived: ${formatTime(elapsedSeconds)}<br />
      Monsters defeated: ${enemiesDefeated}<br />
      Reached level: ${playerLevel} · Coins: ${playerCoins}
    </div>
    <button id="restart-button" class="button" type="button">Try again</button>
  `;
  document.getElementById("restart-button").addEventListener("click", startRun);
  updateHud();
}

function updateHud() {
  if (!ui.healthFill) return;
  ui.healthFill.style.width = `${Math.max(0, (playerHealth / playerMaximumHealth) * 100)}%`;
  const xpProgress = Math.min(100, (playerXp / xpForNextLevel) * 100);
  ui.xpFill.style.width = `${xpProgress}%`;
  ui.xpValue.textContent = `${playerXp} / ${xpForNextLevel}`;
  ui.level.textContent = String(playerLevel);
  ui.coins.textContent = `Coins: ${playerCoins}`;
  ui.kills.textContent = `Kills: ${enemiesDefeated}`;
  ui.timer.textContent = formatTime(Math.max(0, GAME_CONFIG.dawnTime - elapsedSeconds));
  ui.wave.textContent = `Wave ${Math.floor(elapsedSeconds / 30) + 1}`;
  renderLoadout();
}

function renderLoadout() {
  if (!ui.loadout) return;
  ui.loadout.replaceChildren();

  for (let slot = 0; slot < 6; slot += 1) {
    const weapon = playerWeapons[slot];
    const card = document.createElement("div");
    card.className = weapon ? "weapon-slot" : "weapon-slot empty";

    const name = document.createElement("strong");
    name.textContent = weapon?.name ?? `Empty slot ${slot + 1}`;
    const level = document.createElement("span");
    level.textContent = weapon
      ? `${"★".repeat(weapon.level)}${weapon.isEvolved ? " · EVO" : ""}`
      : "Choose a weapon on level-up";
    card.append(name, level);
    ui.loadout.append(card);
  }
}

function createPlayerSkin() {
  const art = createGraphics(64, 64);
  art.pixelDensity(1);
  art.clear();
  art.noStroke();

  art.fill("#07110d55");
  art.ellipse(32, 52, 34, 10);

  art.fill("#26332b");
  art.rect(19, 38, 11, 13, 4);
  art.rect(34, 38, 11, 13, 4);
  art.fill("#654a35");
  art.rect(18, 46, 13, 7, 3);
  art.rect(33, 46, 13, 7, 3);

  art.fill("#76543a");
  art.rect(12, 27, 11, 17, 4);
  art.fill("#b78b55");
  art.rect(14, 30, 7, 10, 3);

  art.fill("#254b39");
  art.ellipse(32, 36, 34, 26);
  art.fill("#3e7250");
  art.ellipse(32, 34, 27, 23);
  art.fill("#d2b479");
  art.rect(24, 34, 16, 5, 2);

  art.fill("#b87b55");
  art.ellipse(19, 34, 10, 15);
  art.ellipse(45, 34, 10, 15);
  art.fill("#3c2b25");
  art.ellipse(32, 23, 24, 21);
  art.fill("#d9a77c");
  art.ellipse(32, 26, 17, 17);
  art.fill("#332820");
  art.ellipse(28, 25, 2, 2);
  art.ellipse(36, 25, 2, 2);
  art.stroke("#774832");
  art.strokeWeight(2);
  art.line(29, 32, 35, 32);
  art.noStroke();

  art.fill("#b87b55");
  art.ellipse(43, 34, 11, 9);
  art.fill("#343a38");
  art.rect(42, 27, 16, 7, 2);
  art.rect(54, 28, 8, 4, 1);
  art.fill("#1f2928");
  art.rect(45, 33, 6, 9, 2);
  art.fill("#c1a06d");
  art.rect(44, 28, 8, 2, 1);
  art.fill("#e3d38c");
  art.rect(59, 29, 3, 2, 1);

  const image = art.get();
  art.remove();
  return image;
}

function getWeaponImage(attack, color) {
  const key = `${attack}:${color}`;
  if (weaponImageCache.has(key)) return weaponImageCache.get(key);

  const art = createGraphics(64, 64);
  art.pixelDensity(1);
  art.clear();
  art.noStroke();

  switch (attack) {
    case "pistol":
      art.fill("#27302d");
      art.rect(10, 25, 30, 14, 4);
      art.fill("#6e5540");
      art.rect(12, 27, 21, 10, 4);
      art.fill("#d2b778");
      art.triangle(36, 25, 58, 32, 36, 39);
      art.fill("#f3dfa0");
      art.triangle(49, 29, 59, 32, 49, 35);
      art.fill("#8b9290");
      art.rect(14, 26, 22, 3, 1);
      break;
    case "boomerang":
      art.fill(color);
      art.beginShape();
      art.vertex(8, 12);
      art.vertex(17, 14);
      art.vertex(31, 25);
      art.vertex(51, 8);
      art.vertex(59, 10);
      art.vertex(39, 34);
      art.vertex(53, 51);
      art.vertex(48, 58);
      art.vertex(28, 41);
      art.vertex(6, 19);
      art.endShape(CLOSE);
      art.fill("#e1ffff");
      art.ellipse(17, 18, 5, 5);
      art.ellipse(49, 49, 5, 5);
      break;
    case "brick":
      art.fill("#343a3b");
      art.quad(10, 17, 45, 17, 55, 25, 20, 25);
      art.fill(color);
      art.quad(20, 25, 55, 25, 55, 48, 20, 48);
      art.fill("#747e7d");
      art.quad(10, 17, 20, 25, 20, 48, 10, 40);
      art.stroke("#d3d9d4");
      art.strokeWeight(2);
      art.line(28, 28, 28, 44);
      art.line(42, 28, 42, 44);
      break;
    case "drill":
      art.fill("#7d5f30");
      art.rect(8, 25, 21, 14, 4);
      art.fill(color);
      art.triangle(26, 23, 59, 32, 26, 41);
      art.fill("#ecf1dc");
      art.triangle(47, 29, 59, 32, 47, 35);
      art.fill("#d7ad50");
      art.rect(12, 21, 4, 22, 2);
      break;
    case "durian":
      art.fill("#638f38");
      for (let index = 0; index < 10; index += 1) {
        const angle = index * TWO_PI / 10;
        const x = 32 + Math.cos(angle) * 21;
        const y = 32 + Math.sin(angle) * 21;
        art.triangle(x, y, x + Math.cos(angle - 0.25) * 13, y + Math.sin(angle - 0.25) * 13,
          x + Math.cos(angle + 0.25) * 13, y + Math.sin(angle + 0.25) * 13);
      }
      art.fill("#a8cc49");
      art.ellipse(32, 32, 34, 34);
      art.fill("#d3e879");
      art.ellipse(26, 24, 8, 7);
      break;
    case "drone":
      art.fill("#303e48");
      art.ellipse(32, 32, 31, 23);
      art.fill(color);
      art.ellipse(32, 32, 18, 17);
      art.fill("#eff8f4");
      art.ellipse(32, 32, 7, 7);
      art.fill("#283139");
      art.rect(7, 13, 19, 5, 2);
      art.rect(38, 13, 19, 5, 2);
      art.rect(7, 46, 19, 5, 2);
      art.rect(38, 46, 19, 5, 2);
      break;
    case "guardian":
      art.fill(color);
      art.beginShape();
      art.vertex(18, 8);
      art.vertex(47, 17);
      art.vertex(56, 32);
      art.vertex(47, 47);
      art.vertex(18, 56);
      art.vertex(32, 38);
      art.vertex(37, 32);
      art.vertex(32, 26);
      art.endShape(CLOSE);
      art.fill("#fff3c4");
      art.ellipse(28, 32, 7, 7);
      break;
    case "forcefield":
      art.noFill();
      art.stroke(color);
      art.strokeWeight(7);
      art.ellipse(32, 32, 47, 47);
      art.stroke("#ffffffaa");
      art.strokeWeight(2);
      art.ellipse(32, 32, 34, 34);
      break;
    case "lightning":
      art.fill(color);
      art.beginShape();
      art.vertex(37, 5);
      art.vertex(17, 34);
      art.vertex(29, 34);
      art.vertex(22, 59);
      art.vertex(49, 25);
      art.vertex(36, 25);
      art.endShape(CLOSE);
      art.fill("#fff9bd");
      art.ellipse(32, 32, 5, 5);
      break;
    case "soccer":
      art.fill("#f4f3df");
      art.ellipse(32, 32, 51, 51);
      art.fill("#26302d");
      art.beginShape();
      art.vertex(32, 18);
      art.vertex(42, 25);
      art.vertex(38, 37);
      art.vertex(26, 37);
      art.vertex(22, 25);
      art.endShape(CLOSE);
      for (const [x, y] of [[15, 17], [47, 16], [13, 43], [50, 44], [32, 53]]) {
        art.ellipse(x, y, 7, 7);
      }
      break;
    case "molotov":
      art.fill(color);
      art.triangle(35, 5, 44, 20, 27, 20);
      art.fill("#ffdd6c");
      art.triangle(35, 12, 40, 20, 31, 20);
      art.fill("#5e4935");
      art.rect(23, 24, 25, 31, 7);
      art.rect(29, 16, 13, 12, 3);
      art.fill("#d6bd78");
      art.rect(31, 17, 9, 6, 2);
      art.fill("#96a354");
      art.rect(28, 31, 15, 17, 4);
      break;
    case "laser":
      art.fill(color);
      art.rect(7, 27, 37, 10, 4);
      art.triangle(42, 24, 59, 32, 42, 40);
      art.fill("#fff4fb");
      art.rect(13, 29, 31, 3, 1);
      break;
    case "rpg":
      art.fill("#515c52");
      art.rect(10, 24, 35, 16, 6);
      art.fill(color);
      art.triangle(42, 22, 60, 32, 42, 42);
      art.fill("#dce3d6");
      art.triangle(53, 29, 62, 32, 53, 35);
      art.fill("#9d4f42");
      art.triangle(17, 24, 8, 14, 24, 24);
      art.triangle(17, 40, 8, 50, 24, 40);
      break;
    case "mine":
      art.fill("#414746");
      art.ellipse(32, 33, 38, 31);
      art.fill(color);
      art.ellipse(32, 31, 28, 22);
      art.fill("#29302d");
      for (const [x, y] of [[18, 20], [32, 15], [46, 20], [15, 40], [49, 40]]) {
        art.triangle(x - 4, y, x + 4, y, x, y - 10);
      }
      art.fill("#f7d76b");
      art.ellipse(32, 31, 7, 7);
      break;
    default:
      art.fill(color);
      art.ellipse(32, 32, 36, 36);
  }

  const image = art.get();
  art.remove();
  weaponImageCache.set(key, image);
  return image;
}

function createFirePatchImage() {
  const art = createGraphics(128, 128);
  art.pixelDensity(1);
  art.clear();

  const context = art.drawingContext;
  const glow = context.createRadialGradient(64, 70, 5, 64, 70, 60);
  glow.addColorStop(0, "rgba(255, 236, 123, 0.9)");
  glow.addColorStop(0.35, "rgba(255, 112, 42, 0.64)");
  glow.addColorStop(0.72, "rgba(239, 60, 27, 0.24)");
  glow.addColorStop(1, "rgba(239, 60, 27, 0)");
  context.fillStyle = glow;
  context.beginPath();
  context.ellipse(64, 72, 60, 45, 0, 0, TWO_PI);
  context.fill();

  art.noStroke();
  for (const flame of [
    [35, 76, 25, 53], [52, 65, 27, 71], [75, 74, 25, 58],
    [91, 79, 20, 42], [64, 85, 28, 44]
  ]) {
    const [x, y, flameWidth, flameHeight] = flame;
    art.fill("#f0522bbb");
    art.beginShape();
    art.vertex(x - flameWidth / 2, y + flameHeight / 2);
    art.vertex(x - flameWidth / 3, y);
    art.vertex(x - 2, y - flameHeight / 2);
    art.vertex(x + flameWidth / 4, y - 2);
    art.vertex(x + flameWidth / 2, y + flameHeight / 2);
    art.endShape(CLOSE);
    art.fill("#ffd55fbb");
    art.beginShape();
    art.vertex(x - flameWidth / 4, y + flameHeight / 3);
    art.vertex(x, y - flameHeight / 4);
    art.vertex(x + flameWidth / 4, y + flameHeight / 3);
    art.endShape(CLOSE);
  }

  const image = art.get();
  art.remove();
  return image;
}

function createLightningImage() {
  const art = createGraphics(80, 600);
  art.pixelDensity(1);
  art.clear();
  const points = [
    [42, 0], [32, 80], [50, 143], [29, 220],
    [44, 286], [25, 365], [43, 430], [32, 520], [39, 600]
  ];

  art.noFill();
  art.stroke("#48dcff88");
  art.strokeWeight(17);
  art.beginShape();
  for (const [x, y] of points) art.vertex(x, y);
  art.endShape();

  art.stroke("#b7f5ff");
  art.strokeWeight(7);
  art.beginShape();
  for (const [x, y] of points) art.vertex(x, y);
  art.endShape();

  art.stroke("#ffffff");
  art.strokeWeight(2);
  art.beginShape();
  for (const [x, y] of points) art.vertex(x, y);
  art.endShape();

  const image = art.get();
  art.remove();
  return image;
}

function createZombieSkin(skinColor, shirtColor, hairColor) {
  const art = createGraphics(64, 64);
  art.pixelDensity(1);
  art.clear();
  art.noStroke();

  art.fill("#07110d55");
  art.ellipse(32, 52, 36, 11);

  art.fill("#343d35");
  art.rect(20, 42, 10, 10, 3);
  art.rect(34, 42, 10, 10, 3);

  art.fill(skinColor);
  art.rect(9, 28, 13, 9, 5);
  art.rect(42, 30, 13, 9, 5);

  art.fill(shirtColor);
  art.ellipse(32, 36, 29, 25);
  art.fill("#303930");
  art.triangle(20, 42, 28, 45, 23, 50);
  art.triangle(39, 43, 46, 40, 43, 49);

  art.fill(skinColor);
  art.ellipse(32, 23, 26, 23);
  art.fill(hairColor);
  art.ellipse(32, 15, 23, 11);
  art.fill("#e6d9a5");
  art.ellipse(27, 24, 5, 5);
  art.ellipse(38, 24, 5, 5);
  art.fill("#b74335");
  art.ellipse(27, 24, 2, 2);
  art.ellipse(38, 24, 2, 2);
  art.fill("#34332b");
  art.rect(27, 32, 11, 3, 1);
  art.fill("#ead8a2");
  art.rect(29, 32, 2, 3);
  art.rect(34, 32, 2, 3);

  const image = art.get();
  art.remove();
  return image;
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutesText = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secondsText = String(seconds % 60).padStart(2, "0");
  return `${minutesText}:${secondsText}`;
}

function removeProjectile(projectile) {
  if (!projectile.gameIsActive) return;
  projectile.gameIsActive = false;
  projectile.remove();
}

function removeSprite(sprite) {
  if (sprite) sprite.remove();
}

function removeSprites(sprites) {
  for (const sprite of sprites) sprite.remove();
}
