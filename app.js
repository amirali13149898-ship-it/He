// ==================== Telegram WebApp ====================
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f0e17');
  tg.setBackgroundColor('#0f0e17');
}

// ==================== داده‌های بازی ====================
const CLASSES = {
  warrior: {
    name: 'جنگجو',
    icon: '🛡️',
    maxHp: 150,
    maxMana: 40,
    attack: 25,
    defense: 20,
    skill1: { name: 'ضربه قدرتمند', dmg: 40, mana: 10 },
    skill2: { name: 'سپر دفاعی', dmg: 0, mana: 15, effect: 'defense' }
  },
  mage: {
    name: 'جادوگر',
    icon: '🔮',
    maxHp: 100,
    maxMana: 120,
    attack: 15,
    defense: 8,
    skill1: { name: 'گلوله آتشین', dmg: 45, mana: 20 },
    skill2: { name: 'یخ‌زدگی', dmg: 30, mana: 15, effect: 'slow' }
  },
  necromancer: {
    name: 'نکرومانسر',
    icon: '💀',
    maxHp: 110,
    maxMana: 90,
    attack: 18,
    defense: 12,
    skill1: { name: 'لمس مرگ', dmg: 38, mana: 18 },
    skill2: { name: 'احضار اسکلت', dmg: 25, mana: 25, effect: 'summon' }
  }
};

const ENEMIES = [
  { name: 'گابلین', icon: '👹', hp: 60, attack: 12, defense: 5, exp: 25, gold: 15 },
  { name: 'گرگ تاریک', icon: '🐺', hp: 80, attack: 18, defense: 8, exp: 40, gold: 25 },
  { name: 'اسکلت جنگجو', icon: '💀', hp: 100, attack: 22, defense: 12, exp: 55, gold: 35 },
  { name: 'اورک وحشی', icon: '👺', hp: 140, attack: 28, defense: 15, exp: 80, gold: 50 },
  { name: 'اژدهای کوچک', icon: '🐉', hp: 200, attack: 35, defense: 20, exp: 120, gold: 80 }
];

const ITEMS = {
  potion: { name: 'معجون درمان', icon: '🧪', type: 'consumable', effect: 'heal', value: 50 },
  mana_potion: { name: 'معجون مانا', icon: '💙', type: 'consumable', effect: 'mana', value: 40 },
  sword: { name: 'شمشیر آهنین', icon: '🗡️', type: 'weapon', attack: 10 },
  armor: { name: 'زره چرمی', icon: '🦺', type: 'armor', defense: 15 }
};

// ==================== وضعیت بازیکن ====================
let player = {
  name: 'ماجراجو',
  class: null,
  level: 1,
  exp: 0,
  expToLevel: 100,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  attack: 15,
  defense: 10,
  gold: 100,
  diamond: 5,
  inventory: {
    potion: 2,
    mana_potion: 1
  },
  weaponBonus: 0,
  armorBonus: 0
};

let selectedClass = null;
let currentEnemy = null;
let inBattle = false;
let battleLog = [];

// ==================== توابع کمکی ====================
function saveGame() {
  localStorage.setItem('eldoria_save', JSON.stringify(player));
}

function loadGame() {
  const saved = localStorage.getItem('eldoria_save');
  if (saved) {
    player = JSON.parse(saved);
    return true;
  }
  return false;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showModal(title, text) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  document.getElementById('modal').classList.add('active');
}

function hideModal() {
  document.getElementById('modal').classList.remove('active');
}

function updateUI() {
  // منابع
  document.getElementById('gold').textContent = player.gold;
  document.getElementById('diamond').textContent = player.diamond;
  document.getElementById('player-level').textContent = player.level;
  document.getElementById('player-name').textContent = player.name;

  // HP & Mana
  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  document.getElementById('hp-bar').style.width = hpPercent + '%';
  document.getElementById('hp-text').textContent = `${Math.floor(player.hp)}/${player.maxHp}`;

  const manaPercent = Math.max(0, (player.mana / player.maxMana) * 100);
  document.getElementById('mana-bar').style.width = manaPercent + '%';
  document.getElementById('mana-text').textContent = `${Math.floor(player.mana)}/${player.maxMana}`;

  // XP
  const xpPercent = (player.exp / player.expToLevel) * 100;
  document.getElementById('xp-fill').style.width = xpPercent + '%';
  document.getElementById('xp-text').textContent = `${player.exp} / ${player.expToLevel} XP`;

  // آواتار
  if (player.class) {
    const cls = CLASSES[player.class];
    document.getElementById('char-avatar').textContent = cls.icon;
    document.getElementById('char-class-name').textContent = cls.name;
  }

  // نام از تلگرام
  if (tg?.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    player.name = u.first_name || 'ماجراجو';
    document.getElementById('player-name').textContent = player.name;
  }
}

function addExp(amount) {
  player.exp += amount;
  while (player.exp >= player.expToLevel) {
    player.exp -= player.expToLevel;
    player.level++;
    player.expToLevel = Math.floor(player.expToLevel * 1.4);
    player.maxHp += 15;
    player.maxMana += 8;
    player.attack += 3;
    player.defense += 2;
    player.hp = player.maxHp;
    player.mana = player.maxMana;
    showModal('🎉 ارتقا سطح!', `به سطح ${player.level} رسیدی!\n❤️ HP و قدرت افزایش یافت.`);
  }
  saveGame();
  updateUI();
}

// ==================== انتخاب کلاس ====================
document.querySelectorAll('.class-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedClass = card.dataset.class;
    document.getElementById('confirm-class-btn').disabled = false;
  });
});

document.getElementById('confirm-class-btn').addEventListener('click', () => {
  if (!selectedClass) return;
  const cls = CLASSES[selectedClass];
  player.class = selectedClass;
  player.maxHp = cls.maxHp;
  player.hp = cls.maxHp;
  player.maxMana = cls.maxMana;
  player.mana = cls.maxMana;
  player.attack = cls.attack;
  player.defense = cls.defense;
  saveGame();
  updateUI();
  showScreen('main-screen');
  showModal('🎊 خوش آمدی!', `کلاس ${cls.name} انتخاب شد.\nماجراجویی‌ات در سرزمین اِلدوریا آغاز شد!`);
});

// ==================== اکشن‌های اصلی ====================
document.querySelectorAll('.btn.action').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'explore') explore();
    else if (action === 'battle') startBattle();
    else if (action === 'inventory') openInventory();
    else if (action === 'shop') showScreen('shop-screen');
  });
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showScreen('main-screen'));
});

function explore() {
  const events = [
    { text: 'در جنگل قدم زدی و ۱۵ سکه پیدا کردی!', gold: 15, exp: 5 },
    { text: 'یک چشمه جادویی دیدی و ۲۰ HP بازیابی کردی.', heal: 20, exp: 8 },
    { text: 'با یک تاجر برخورد کردی و ۱۰ الماس هدیه گرفتی!', diamond: 1, exp: 10 },
    { text: 'هیچ چیز خاصی پیدا نکردی... فقط هوای تازه!', exp: 3 },
    { text: 'یک صندوق گنج پیدا کردی! ۴۰ سکه و یک معجون.', gold: 40, item: 'potion', exp: 15 }
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  let msg = event.text;

  if (event.gold) { player.gold += event.gold; }
  if (event.diamond) { player.diamond += event.diamond; }
  if (event.heal) { player.hp = Math.min(player.maxHp, player.hp + event.heal); }
  if (event.item) {
    player.inventory[event.item] = (player.inventory[event.item] || 0) + 1;
  }
  if (event.exp) addExp(event.exp);

  saveGame();
  updateUI();
  showModal('🗺️ اکتشاف', msg);
}

// ==================== مبارزه ====================
function startBattle() {
  const levelIndex = Math.min(Math.floor((player.level - 1) / 2), ENEMIES.length - 1);
  const base = ENEMIES[levelIndex];
  // کمی تصادفی‌سازی
  const variance = 0.85 + Math.random() * 0.3;
  currentEnemy = {
    ...base,
    maxHp: Math.floor(base.hp * variance),
    hp: Math.floor(base.hp * variance),
    attack: Math.floor(base.attack * variance)
  };
  inBattle = true;
  battleLog = [];
  updateBattleUI();
  addBattleLog(`یک ${currentEnemy.name} ظاهر شد!`, 'system');
  showScreen('battle-screen');
}

function updateBattleUI() {
  document.getElementById('enemy-avatar').textContent = currentEnemy.icon;
  document.getElementById('enemy-name').textContent = currentEnemy.name;
  const eHpPercent = Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100);
  document.getElementById('enemy-hp-bar').style.width = eHpPercent + '%';
  document.getElementById('enemy-hp-text').textContent = `${Math.floor(currentEnemy.hp)}/${currentEnemy.maxHp}`;

  const cls = CLASSES[player.class];
  document.getElementById('battle-player-avatar').textContent = cls.icon;
  document.getElementById('battle-player-name').textContent = cls.name;
  const pHpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  document.getElementById('battle-hp-bar').style.width = pHpPercent + '%';
  document.getElementById('battle-hp-text').textContent = `${Math.floor(player.hp)}/${player.maxHp}`;

  // به‌روزرسانی نام مهارت‌ها
  const skillBtns = document.querySelectorAll('.battle-btn');
  skillBtns[1].textContent = `✨ ${cls.skill1.name}`;
  skillBtns[2].textContent = `🔥 ${cls.skill2.name}`;
}

function addBattleLog(text, type = 'system') {
  battleLog.push({ text, type });
  const logEl = document.getElementById('battle-log');
  logEl.innerHTML = battleLog.map(l => `<p class="${l.type}-msg">${l.text}</p>`).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

function playerAttack(skillType) {
  if (!inBattle || currentEnemy.hp <= 0) return;

  const cls = CLASSES[player.class];
  let damage = 0;
  let manaCost = 0;
  let msg = '';

  if (skillType === 'attack') {
    damage = Math.max(1, player.attack + player.weaponBonus - currentEnemy.defense + Math.floor(Math.random() * 8));
    msg = `⚔️ حمله کردی و ${damage} آسیب زدی!`;
  } else if (skillType === 'skill1') {
    manaCost = cls.skill1.mana;
    if (player.mana < manaCost) {
      showModal('مانا کافی نیست!', `برای این مهارت به ${manaCost} مانا نیاز داری.`);
      return;
    }
    player.mana -= manaCost;
    damage = Math.max(1, cls.skill1.dmg + Math.floor(Math.random() * 10) - Math.floor(currentEnemy.defense * 0.3));
    msg = `✨ ${cls.skill1.name} استفاده کردی و ${damage} آسیب زدی!`;
  } else if (skillType === 'skill2') {
    manaCost = cls.skill2.mana;
    if (player.mana < manaCost) {
      showModal('مانا کافی نیست!', `برای این مهارت به ${manaCost} مانا نیاز داری.`);
      return;
    }
    player.mana -= manaCost;
    if (cls.skill2.effect === 'defense') {
      player.defense += 8;
      msg = `🛡️ سپر دفاعی فعال شد! دفاع موقتاً افزایش یافت.`;
      setTimeout(() => { player.defense -= 8; }, 3000);
    } else {
      damage = Math.max(1, cls.skill2.dmg + Math.floor(Math.random() * 8));
      msg = `🔥 ${cls.skill2.name} استفاده کردی و ${damage} آسیب زدی!`;
    }
  } else if (skillType === 'heal') {
    if ((player.inventory.potion || 0) < 1) {
      showModal('معجون نداری!', 'از فروشگاه معجون بخر.');
      return;
    }
    player.inventory.potion--;
    const heal = 50;
    player.hp = Math.min(player.maxHp, player.hp + heal);
    msg = `💊 معجون نوشیدی و ${heal} HP بازیابی کردی.`;
    addBattleLog(msg, 'player');
    updateBattleUI();
    updateUI();
    // نوبت دشمن
    setTimeout(enemyTurn, 800);
    return;
  }

  currentEnemy.hp -= damage;
  addBattleLog(msg, 'player');
  updateBattleUI();
  updateUI();

  if (currentEnemy.hp <= 0) {
    endBattle(true);
    return;
  }

  setTimeout(enemyTurn, 900);
}

function enemyTurn() {
  if (!inBattle || player.hp <= 0) return;

  const damage = Math.max(1, currentEnemy.attack - player.defense - player.armorBonus + Math.floor(Math.random() * 6));
  player.hp -= damage;
  addBattleLog(`👹 ${currentEnemy.name} به تو ${damage} آسیب زد!`, 'enemy');
  updateBattleUI();
  updateUI();

  if (player.hp <= 0) {
    player.hp = 0;
    endBattle(false);
  }
}

function endBattle(won) {
  inBattle = false;
  if (won) {
    const expGain = currentEnemy.exp;
    const goldGain = currentEnemy.gold + Math.floor(Math.random() * 10);
    player.gold += goldGain;
    addBattleLog(`🎉 پیروز شدی! +${expGain} XP و +${goldGain} سکه`, 'system');
    addExp(expGain);
    // شانس دراپ
    if (Math.random() < 0.3) {
      player.inventory.potion = (player.inventory.potion || 0) + 1;
      addBattleLog('🧪 یک معجون پیدا کردی!', 'system');
    }
    saveGame();
    setTimeout(() => {
      showModal('🏆 پیروزی!', `دشمن شکست خورد.\n+${expGain} تجربه\n+${goldGain} سکه`);
      showScreen('main-screen');
      updateUI();
    }, 1200);
  } else {
    player.hp = Math.floor(player.maxHp * 0.3);
    player.gold = Math.max(0, player.gold - 20);
    saveGame();
    setTimeout(() => {
      showModal('💀 شکست!', 'شکست خوردی و کمی سکه از دست دادی.\nبه دهکده بازگشت داده شدی.');
      showScreen('main-screen');
      updateUI();
    }, 1000);
  }
}

document.querySelectorAll('.battle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    playerAttack(btn.dataset.skill);
  });
});

document.getElementById('flee-btn').addEventListener('click', () => {
  if (Math.random() < 0.6) {
    inBattle = false;
    showModal('فرار موفق!', 'از نبرد فرار کردی.');
    showScreen('main-screen');
  } else {
    addBattleLog('فرار ناموفق بود! دشمن جلوی فرار را گرفت.', 'system');
    setTimeout(enemyTurn, 600);
  }
});

// ==================== اینونتوری ====================
function openInventory() {
  const list = document.getElementById('inventory-list');
  list.innerHTML = '';

  const entries = Object.entries(player.inventory).filter(([_, qty]) => qty > 0);
  if (entries.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#a0a0b0;padding:40px 0;">کوله‌پشتی خالی است...</p>';
  } else {
    entries.forEach(([key, qty]) => {
      const item = ITEMS[key];
      if (!item) return;
      const div = document.createElement('div');
      div.className = 'inventory-item';
      div.innerHTML = `
        <span class="item-icon">${item.icon}</span>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>${item.type === 'consumable' ? 'مصرفی' : 'تجهیزات'}</p>
        </div>
        <span class="qty">×${qty}</span>
        ${item.type === 'consumable' ? `<button class="btn small use-btn" data-item="${key}">استفاده</button>` : ''}
      `;
      list.appendChild(div);
    });

    list.querySelectorAll('.use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.item;
        useItem(key);
        openInventory();
      });
    });
  }
  showScreen('inventory-screen');
}

function useItem(key) {
  if ((player.inventory[key] || 0) < 1) return;
  const item = ITEMS[key];
  if (item.effect === 'heal') {
    player.hp = Math.min(player.maxHp, player.hp + item.value);
    showModal('درمان', `${item.value} HP بازیابی شد.`);
  } else if (item.effect === 'mana') {
    player.mana = Math.min(player.maxMana, player.mana + item.value);
    showModal('مانا', `${item.value} مانا بازیابی شد.`);
  }
  player.inventory[key]--;
  saveGame();
  updateUI();
}

// ==================== فروشگاه ====================
document.querySelectorAll('.buy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const itemEl = btn.closest('.shop-item');
    const itemKey = itemEl.dataset.item;
    const price = parseInt(btn.dataset.price);

    if (player.gold < price) {
      showModal('سکه کافی نیست!', `به ${price} سکه نیاز داری.`);
      return;
    }

    player.gold -= price;
    if (itemKey === 'sword') {
      player.weaponBonus = 10;
      showModal('خرید موفق!', 'شمشیر آهنین تجهیز شد. +۱۰ قدرت حمله');
    } else if (itemKey === 'armor') {
      player.armorBonus = 15;
      showModal('خرید موفق!', 'زره چرمی تجهیز شد. +۱۵ دفاع');
    } else {
      player.inventory[itemKey] = (player.inventory[itemKey] || 0) + 1;
      showModal('خرید موفق!', `${ITEMS[itemKey].name} به کوله‌پشتی اضافه شد.`);
    }
    saveGame();
    updateUI();
  });
});

// ==================== مودال و ناوبری ====================
document.getElementById('modal-ok').addEventListener('click', hideModal);

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    if (tab === 'home') showScreen('main-screen');
    else if (tab === 'profile') {
      showModal('👤 پروفایل', `نام: ${player.name}\nکلاس: ${CLASSES[player.class]?.name || '-'}\nسطح: ${player.level}\nقدرت: ${player.attack + player.weaponBonus}\nدفاع: ${player.defense + player.armorBonus}`);
    } else if (tab === 'quests') {
      showModal('📜 مأموریت‌ها', 'مأموریت روزانه:\n• ۳ دشمن را شکست بده\n• ۲ بار اکتشاف کن\n\n(نسخه کامل به‌زودی!)');
    } else if (tab === 'guild') {
      showModal('🏰 گیلد', 'سیستم گیلد در نسخه کامل اضافه خواهد شد.\nبا دوستانت متحد شو!');
    }
  });
});

// ==================== شروع بازی ====================
window.addEventListener('load', () => {
  // شبیه‌سازی لودینگ
  setTimeout(() => {
    if (loadGame() && player.class) {
      updateUI();
      showScreen('main-screen');
    } else {
      showScreen('class-select-screen');
    }
  }, 2100);
});
