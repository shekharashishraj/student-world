// ─── Country Data (name → lat/lng) ───────────────────────────────────────────
const COUNTRIES = {
  "Afghanistan": { lat: 33.93, lng: 67.71 },
  "Argentina": { lat: -38.42, lng: -63.62 },
  "Australia": { lat: -25.27, lng: 133.78 },
  "Austria": { lat: 47.52, lng: 14.55 },
  "Bangladesh": { lat: 23.68, lng: 90.35 },
  "Belgium": { lat: 50.50, lng: 4.47 },
  "Brazil": { lat: -14.24, lng: -51.93 },
  "Canada": { lat: 56.13, lng: -106.35 },
  "Chile": { lat: -35.68, lng: -71.54 },
  "China": { lat: 35.86, lng: 104.20 },
  "Colombia": { lat: 4.57, lng: -74.30 },
  "Czech Republic": { lat: 49.82, lng: 15.47 },
  "Denmark": { lat: 56.26, lng: 9.50 },
  "Egypt": { lat: 26.82, lng: 30.80 },
  "Ethiopia": { lat: 9.15, lng: 40.49 },
  "Finland": { lat: 61.92, lng: 25.75 },
  "France": { lat: 46.23, lng: 2.21 },
  "Germany": { lat: 51.17, lng: 10.45 },
  "Ghana": { lat: 7.95, lng: -1.02 },
  "Greece": { lat: 39.07, lng: 21.82 },
  "Hungary": { lat: 47.16, lng: 19.50 },
  "India": { lat: 20.59, lng: 78.96 },
  "Indonesia": { lat: -0.79, lng: 113.92 },
  "Iran": { lat: 32.43, lng: 53.69 },
  "Iraq": { lat: 33.22, lng: 43.68 },
  "Ireland": { lat: 53.41, lng: -8.24 },
  "Israel": { lat: 31.05, lng: 34.85 },
  "Italy": { lat: 41.87, lng: 12.57 },
  "Japan": { lat: 36.20, lng: 138.25 },
  "Jordan": { lat: 30.59, lng: 36.24 },
  "Kenya": { lat: -0.02, lng: 37.91 },
  "Malaysia": { lat: 4.21, lng: 108.96 },
  "Mexico": { lat: 23.63, lng: -102.55 },
  "Morocco": { lat: 31.79, lng: -7.09 },
  "Netherlands": { lat: 52.13, lng: 5.29 },
  "New Zealand": { lat: -40.90, lng: 174.89 },
  "Nigeria": { lat: 9.08, lng: 8.68 },
  "Norway": { lat: 60.47, lng: 8.47 },
  "Pakistan": { lat: 30.38, lng: 69.35 },
  "Peru": { lat: -9.19, lng: -75.02 },
  "Philippines": { lat: 12.88, lng: 121.77 },
  "Poland": { lat: 51.92, lng: 19.15 },
  "Portugal": { lat: 39.40, lng: -8.22 },
  "Romania": { lat: 45.94, lng: 24.97 },
  "Russia": { lat: 61.52, lng: 105.32 },
  "Saudi Arabia": { lat: 23.89, lng: 45.08 },
  "South Africa": { lat: -30.56, lng: 22.94 },
  "South Korea": { lat: 35.91, lng: 127.77 },
  "Spain": { lat: 40.46, lng: -3.75 },
  "Sri Lanka": { lat: 7.87, lng: 80.77 },
  "Sweden": { lat: 60.13, lng: 18.64 },
  "Switzerland": { lat: 46.82, lng: 8.23 },
  "Taiwan": { lat: 23.70, lng: 121.00 },
  "Tanzania": { lat: -6.37, lng: 34.89 },
  "Thailand": { lat: 15.87, lng: 100.99 },
  "Turkey": { lat: 38.96, lng: 35.24 },
  "Uganda": { lat: 1.37, lng: 32.29 },
  "Ukraine": { lat: 48.38, lng: 31.17 },
  "United Arab Emirates": { lat: 23.42, lng: 53.85 },
  "United Kingdom": { lat: 55.38, lng: -3.44 },
  "USA": { lat: 37.09, lng: -95.71 },
  "Venezuela": { lat: 6.42, lng: -66.59 },
  "Vietnam": { lat: 14.06, lng: 108.28 },
  "Zimbabwe": { lat: -19.02, lng: 29.15 }
};

// Leadership values from culture-map-v2 design
const LEADERSHIP_VALUES = [
  "Empathy","Courage","Integrity","Resilience","Service",
  "Harmony","Innovation","Justice","Transparency","Unity",
  "Balance","Curiosity","Wisdom","Compassion","Authenticity"
];

// ─── Continent Map ────────────────────────────────────────────────────────────
const CONTINENT_MAP = {
  'USA': 'North America', 'Canada': 'North America', 'Mexico': 'North America',
  'Brazil': 'South America', 'Argentina': 'South America', 'Colombia': 'South America',
  'Chile': 'South America', 'Peru': 'South America', 'Venezuela': 'South America',
  'France': 'Europe', 'Germany': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe',
  'United Kingdom': 'Europe', 'Netherlands': 'Europe', 'Sweden': 'Europe',
  'Norway': 'Europe', 'Finland': 'Europe', 'Denmark': 'Europe', 'Belgium': 'Europe',
  'Austria': 'Europe', 'Switzerland': 'Europe', 'Poland': 'Europe',
  'Czech Republic': 'Europe', 'Romania': 'Europe', 'Hungary': 'Europe',
  'Greece': 'Europe', 'Portugal': 'Europe', 'Ireland': 'Europe', 'Ukraine': 'Europe',
  'Russia': 'Europe',
  'Nigeria': 'Africa', 'South Africa': 'Africa', 'Kenya': 'Africa', 'Ghana': 'Africa',
  'Ethiopia': 'Africa', 'Tanzania': 'Africa', 'Uganda': 'Africa', 'Zimbabwe': 'Africa',
  'Morocco': 'Africa', 'Egypt': 'Africa',
  'India': 'Asia', 'Pakistan': 'Asia', 'Bangladesh': 'Asia', 'Sri Lanka': 'Asia',
  'China': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'Taiwan': 'Asia',
  'Vietnam': 'Asia', 'Thailand': 'Asia', 'Indonesia': 'Asia', 'Malaysia': 'Asia',
  'Philippines': 'Asia', 'Afghanistan': 'Asia',
  'Saudi Arabia': 'Middle East', 'United Arab Emirates': 'Middle East',
  'Iran': 'Middle East', 'Iraq': 'Middle East', 'Israel': 'Middle East',
  'Jordan': 'Middle East', 'Turkey': 'Middle East',
  'Australia': 'Oceania', 'New Zealand': 'Oceania',
};

function getContinent(country) {
  return CONTINENT_MAP[country] || 'Other';
}

// ─── Badge Definitions ────────────────────────────────────────────────────────
const BADGE_DEFS = {
  explorer:    { icon: '🌍', label: 'Explorer' },
  pioneer:     { icon: '🥇', label: 'Pioneer' },
  storyteller: { icon: '📖', label: 'Story Teller' },
  bridge:      { icon: '🌉', label: 'Bridge Builder' },
  traveler:    { icon: '🗺️', label: 'World Traveler' },
  ally:        { icon: '🤝', label: 'Value Ally' },
};

// ─── State ────────────────────────────────────────────────────────────────────
let students = [];
let myStudent = null;
let mySocketId = null;
let globe = null;
let selectedValue = '';
let leaderboardOpen = true;
let currentView = 'globe';
let arcs = [];

// Interaction tracking for badges + quests
const interactionTracker = {
  continents: new Set(),
  countries: new Set(),
  insightCount: 0,
  sameValueFound: false,
};
const myEarnedBadges = new Set();
const completedQuests = new Set();

// ─── Socket.io ────────────────────────────────────────────────────────────────
const socket = io();

socket.on('connect', () => {
  mySocketId = socket.id;
});

socket.on('students', (existingStudents) => {
  students = existingStudents.map(s => ({ ...s, isMe: s.id === mySocketId }));
  refreshGlobe();
  renderDashboard();
});

socket.on('student-joined', (student) => {
  student.isMe = (student.id === mySocketId);
  students.push(student);
  refreshGlobe();
  renderDashboard();

  // Ripple ring effect for new joins
  if (globe && !student.isMe) {
    globe
      .ringsData([student])
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringColor(() => '#7ec8e3')
      .ringMaxRadius(3)
      .ringPropagationSpeed(2)
      .ringRepeatPeriod(700);
    setTimeout(() => globe.ringsData([]), 2000);
  }

  if (student.isMe) {
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat: student.lat, lng: student.lng, altitude: 1.5 }, 1500);
    document.getElementById('join-form').style.display = 'none';
    document.getElementById('joined-msg').style.display = 'block';
    document.getElementById('joined-name').textContent = student.name;
    document.getElementById('joined-country').textContent = `📍 ${student.location || student.country}`;
    document.getElementById('joined-value').textContent = student.value ? `💎 ${student.value}` : '';
    document.getElementById('joined-xp').textContent = `⭐ ${student.xp} XP${student.firstFromCountry ? ' · 🥇 First from ' + student.country + '!' : ''}`;

    // Show join badges
    const badgeRow = document.getElementById('joined-badges');
    if (badgeRow && student.badges) {
      badgeRow.innerHTML = student.badges
        .map(b => BADGE_DEFS[b] ? `<span class="badge-chip">${BADGE_DEFS[b].icon} ${BADGE_DEFS[b].label}</span>` : '')
        .join('');
    }

    myStudent = student;
    // Pre-mark auto badges as earned
    (student.badges || []).forEach(b => myEarnedBadges.add(b));

    // Complete auto quests
    completeQuest('q-join');
    if (student.firstFromCountry) completeQuest('q-pioneer');
    showQuestPanel();
  }
});

socket.on('student-left', (id) => {
  students = students.filter(s => s.id !== id);
  refreshGlobe();
  renderDashboard();
});

socket.on('count', (count) => {
  document.getElementById('student-count').textContent =
    `${count} student${count !== 1 ? 's' : ''} on the map`;
});

socket.on('leaderboard', renderLeaderboard);

socket.on('badge-confirmed', ({ badgeId, xp }) => {
  // Update our student's local XP after server confirms badge
  if (myStudent) myStudent.xp = xp;
  const xpEl = document.getElementById('joined-xp');
  if (xpEl && myStudent) {
    xpEl.textContent = `⭐ ${xp} XP${myStudent.firstFromCountry ? ' · 🥇 First from ' + myStudent.country + '!' : ''}`;
  }
});

// ─── Populate country dropdown ────────────────────────────────────────────────
const countrySelect = document.getElementById('country-select');
Object.keys(COUNTRIES).sort().forEach(name => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  countrySelect.appendChild(opt);
});

// ─── Populate leadership value picker ─────────────────────────────────────────
const valuePicker = document.getElementById('value-picker');
LEADERSHIP_VALUES.forEach(v => {
  const btn = document.createElement('button');
  btn.className = 'value-btn';
  btn.textContent = v;
  btn.onclick = () => {
    selectedValue = v;
    document.querySelectorAll('.value-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };
  valuePicker.appendChild(btn);
});

// ─── Init Globe ───────────────────────────────────────────────────────────────
function initGlobe() {
  globe = Globe()
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .atmosphereColor('#3b82f6')
    .atmosphereAltitude(0.15)
    // HTML element markers (replaces pointsData)
    .htmlElementsData(students)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.className = 'globe-pin';
      el.style.cssText = [
        `background:${d.color || '#7ec8e3'}`,
        'border-radius:50%',
        'width:26px',
        'height:26px',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'font-size:11px',
        'font-weight:700',
        'color:#fff',
        `border:2px solid rgba(255,255,255,${d.isMe ? '0.9' : '0.5'})`,
        'cursor:pointer',
        `box-shadow:0 0 14px ${d.color || '#7ec8e3'}80`,
        d.isMe ? 'outline:2px solid #fbbf24;outline-offset:2px' : '',
      ].join(';');
      el.textContent = d.name[0].toUpperCase();
      el.title = `${d.name} · ${d.country}`;
      el.onclick = () => showStudentCard(d);
      return el;
    })
    // Arcs layer (connection lines)
    .arcsData([])
    .arcColor(d => [d.color, '#ffffff'])
    .arcAltitude(0.3)
    .arcStroke(0.5)
    .arcDashLength(0.5)
    .arcDashGap(0.5)
    .arcDashAnimateTime(1500)
    // Rings layer (ripple on join)
    .ringsData([])
    .ringLat(d => d.lat)
    .ringLng(d => d.lng)
    .ringColor(() => '#7ec8e3')
    .ringMaxRadius(3)
    .ringPropagationSpeed(2)
    .ringRepeatPeriod(700)
    (document.getElementById('globe-container'));

  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
}

// ─── Refresh globe pins ───────────────────────────────────────────────────────
function refreshGlobe() {
  if (globe) globe.htmlElementsData([...students]);
  document.getElementById('student-count').textContent =
    `${students.length} student${students.length !== 1 ? 's' : ''} on the map`;
}

// ─── Show student card ────────────────────────────────────────────────────────
function showStudentCard(student) {
  const card = document.getElementById('student-card');
  document.getElementById('card-name').textContent = student.name;
  document.getElementById('card-location').textContent = `📍 ${student.location || student.country}`;
  document.getElementById('card-interests').textContent = student.interests ? `✨ ${student.interests}` : '';
  document.getElementById('card-interests').style.display = student.interests ? 'block' : 'none';

  const valueBadge = document.getElementById('card-value');
  if (student.value) {
    valueBadge.textContent = `💎 ${student.value}`;
    valueBadge.style.background = `${student.color || '#7ec8e3'}20`;
    valueBadge.style.borderColor = `${student.color || '#7ec8e3'}50`;
    valueBadge.style.color = student.color || '#7ec8e3';
    valueBadge.style.display = 'inline-block';
  } else {
    valueBadge.style.display = 'none';
  }

  const culturalEl = document.getElementById('card-cultural');
  if (student.cultural) {
    culturalEl.textContent = `"${student.cultural}"`;
    culturalEl.style.display = 'block';
  } else {
    culturalEl.style.display = 'none';
  }

  document.getElementById('card-xp').textContent = `⭐ ${student.xp || 10} XP`;
  const firstBadge = document.getElementById('card-first');
  if (student.firstFromCountry) {
    firstBadge.textContent = `🥇 First from ${student.country}!`;
    firstBadge.style.display = 'block';
  } else {
    firstBadge.style.display = 'none';
  }
  document.getElementById('card-time').textContent = `Joined ${formatTime(student.joinedAt)}`;

  // Show student's badges in card
  const cardBadges = document.getElementById('card-badges');
  if (cardBadges && student.badges && student.badges.length) {
    cardBadges.innerHTML = student.badges
      .map(b => BADGE_DEFS[b] ? `<span class="badge-chip small">${BADGE_DEFS[b].icon} ${BADGE_DEFS[b].label}</span>` : '')
      .join('');
    cardBadges.style.display = 'flex';
  } else if (cardBadges) {
    cardBadges.style.display = 'none';
  }

  // Culture facts
  const factsSection = document.getElementById('card-facts-section');
  const facts = typeof CULTURE_FACTS !== 'undefined' && CULTURE_FACTS[student.country];
  if (facts) {
    document.getElementById('card-facts-tagline').textContent = `${facts.emoji} ${facts.tagline}`;
    document.getElementById('card-facts-list').innerHTML = facts.facts
      .map(f => `<p class="fact-item">• ${f}</p>`).join('');
    document.getElementById('card-facts-insight').textContent = facts.leadershipInsight;
    factsSection.style.display = 'block';
  } else {
    factsSection.style.display = 'none';
  }

  card.style.display = 'block';
  globe.pointOfView({ lat: student.lat, lng: student.lng, altitude: 1.8 }, 1000);

  // Arc from my pin to clicked pin
  if (myStudent && student.id !== mySocketId) {
    arcs = [{ startLat: myStudent.lat, startLng: myStudent.lng,
               endLat: student.lat, endLng: student.lng,
               color: student.color || '#7ec8e3' }];
    globe.arcsData(arcs);
  }

  // Track interaction for badges + quests (only for other students)
  if (student.id !== mySocketId) {
    trackInteraction(student);
  }
}

document.getElementById('close-card').onclick = () => {
  document.getElementById('student-card').style.display = 'none';
  globe.arcsData([]);
  arcs = [];
};

function formatTime(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Interaction Tracking (Badges + Quests) ───────────────────────────────────
function trackInteraction(student) {
  interactionTracker.countries.add(student.country);
  interactionTracker.continents.add(getContinent(student.country));

  if (student.cultural) {
    interactionTracker.insightCount++;
  }

  if (myStudent && student.value && student.value === myStudent.value) {
    interactionTracker.sameValueFound = true;
  }

  // Badges
  if (interactionTracker.continents.size >= 3) tryEarnBadge('bridge', 30);
  if (interactionTracker.countries.size >= 5) tryEarnBadge('traveler', 40);
  if (interactionTracker.sameValueFound) tryEarnBadge('ally', 20);

  // Quests
  checkQuestProgress();
}

function tryEarnBadge(badgeId, xpReward) {
  if (myEarnedBadges.has(badgeId)) return;
  myEarnedBadges.add(badgeId);
  socket.emit('badge-earned', { badgeId, xpReward });
  showBadgeToast(badgeId);
  // Also update joined-msg badge row
  const badgeRow = document.getElementById('joined-badges');
  if (badgeRow && BADGE_DEFS[badgeId]) {
    const chip = document.createElement('span');
    chip.className = 'badge-chip';
    chip.textContent = `${BADGE_DEFS[badgeId].icon} ${BADGE_DEFS[badgeId].label}`;
    badgeRow.appendChild(chip);
  }
}

function showBadgeToast(badgeId) {
  const def = BADGE_DEFS[badgeId];
  if (!def) return;
  const toast = document.getElementById('badge-toast');
  toast.textContent = `${def.icon} ${def.label} unlocked!`;
  toast.style.display = 'block';
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => { toast.style.display = 'none'; }, 400);
  }, 3000);
}

// ─── Quest System ─────────────────────────────────────────────────────────────
function checkQuestProgress() {
  if (!myStudent) return;
  const myContinent = getContinent(myStudent.country);

  // q-bridge: clicked a student from a different continent
  const hasDiffContinent = [...interactionTracker.continents].some(c => c !== myContinent);
  if (hasDiffContinent) completeQuest('q-bridge');

  // q-explorer: 3+ different continents clicked
  if (interactionTracker.continents.size >= 3) completeQuest('q-explorer');

  // q-connector: 5+ countries
  if (interactionTracker.countries.size >= 5) completeQuest('q-connector');

  // q-seeker: 5 cultural insights read
  if (interactionTracker.insightCount >= 5) completeQuest('q-seeker');

  // q-ally: found same value
  if (interactionTracker.sameValueFound) completeQuest('q-ally');

  renderQuestPanel();
}

function completeQuest(questId) {
  if (completedQuests.has(questId)) return;
  const quest = typeof QUESTS !== 'undefined' && QUESTS.find(q => q.id === questId);
  if (!quest) return;
  completedQuests.add(questId);

  // Award XP for non-auto quests via same badge-earned channel
  if (quest.xp > 0) {
    socket.emit('badge-earned', { badgeId: questId, xpReward: quest.xp });
  }

  // Toast for XP-bearing quests
  if (quest.xp > 0) {
    showQuestToast(quest);
  }

  renderQuestPanel();
}

function showQuestToast(quest) {
  const toast = document.getElementById('badge-toast');
  toast.textContent = `${quest.icon} Quest done: ${quest.title}! +${quest.xp} XP`;
  toast.style.display = 'block';
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => { toast.style.display = 'none'; }, 400);
  }, 3500);
}

function showQuestPanel() {
  const panel = document.getElementById('quest-panel');
  if (panel) panel.style.display = 'block';
  renderQuestPanel();
}

function renderQuestPanel() {
  const list = document.getElementById('quest-list');
  if (!list || typeof QUESTS === 'undefined') return;

  const visibleQuests = QUESTS.filter(q => {
    if (q.condition === 'firstFromCountry') return myStudent?.firstFromCountry;
    return true;
  });

  list.innerHTML = visibleQuests.map(q => {
    const done = completedQuests.has(q.id);
    return `
      <div class="quest-row ${done ? 'done' : ''}">
        <span class="quest-icon">${q.icon}</span>
        <div class="quest-info">
          <div class="quest-title">${q.title}${q.xp > 0 ? ` <span class="quest-xp">+${q.xp} XP</span>` : ''}</div>
          <div class="quest-desc">${q.desc}</div>
        </div>
        ${done ? '<span class="quest-check">✓</span>' : ''}
      </div>`;
  }).join('');
}

document.getElementById('quest-toggle-btn').onclick = () => {
  const body = document.getElementById('quest-body');
  const icon = document.getElementById('quest-toggle-icon');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  icon.textContent = isOpen ? '▶' : '▼';
};

// ─── Join handler ─────────────────────────────────────────────────────────────
document.getElementById('join-btn').onclick = () => {
  const name = document.getElementById('name-input').value.trim();
  const location = document.getElementById('location-input').value.trim();
  const country = document.getElementById('country-select').value;
  const interests = document.getElementById('interests-input').value.trim();
  const cultural = document.getElementById('cultural-input').value.trim();

  if (!name) { showFormError('Please enter your name!'); return; }
  if (!country) { showFormError('Please select your country!'); return; }
  if (!selectedValue) { showFormError('Please pick a leadership value!'); return; }

  const coords = COUNTRIES[country];
  const studentData = {
    name,
    location: location || country,
    country,
    lat: coords.lat + (Math.random() - 0.5) * 2,
    lng: coords.lng + (Math.random() - 0.5) * 2,
    interests: interests || '',
    value: selectedValue,
    cultural: cultural || '',
  };

  socket.emit('join', studentData);
};

function showFormError(msg) {
  const err = document.getElementById('form-error');
  err.textContent = msg;
  err.style.display = 'block';
  setTimeout(() => { err.style.display = 'none'; }, 3000);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function renderLeaderboard(board) {
  const list = document.getElementById('leaderboard-list');
  if (!list) return;
  list.innerHTML = '';
  if (!board || board.length === 0) {
    list.innerHTML = '<div style="color:rgba(255,255,255,0.3);font-size:12px;padding:8px;">Be the first to join!</div>';
    return;
  }
  board.forEach(entry => {
    const isMe = myStudent && entry.id === mySocketId;
    const row = document.createElement('div');
    row.className = 'leaderboard-row' + (isMe ? ' is-me' : '');
    row.innerHTML = `
      <span class="lb-rank ${entry.rank <= 3 ? 'top3' : ''}">${entry.rank}</span>
      <span class="lb-name">${entry.name}</span>
      ${entry.firstFromCountry ? '<span class="lb-badge">1st</span>' : ''}
      <span class="lb-xp">${entry.xp} XP</span>
    `;
    list.appendChild(row);
  });
}

document.getElementById('lb-toggle-btn').onclick = () => {
  leaderboardOpen = !leaderboardOpen;
  document.getElementById('leaderboard-body').style.display = leaderboardOpen ? 'block' : 'none';
  document.getElementById('lb-toggle-icon').textContent = leaderboardOpen ? '▼' : '▶';
};

// ─── View toggle (Globe ↔ Dashboard) ─────────────────────────────────────────
document.getElementById('view-globe-btn').onclick = () => switchView('globe');
document.getElementById('view-dash-btn').onclick = () => switchView('dashboard');

function switchView(view) {
  currentView = view;
  const isGlobe = view === 'globe';
  document.getElementById('globe-container').style.display = isGlobe ? 'block' : 'none';
  document.getElementById('dashboard-view').style.display = isGlobe ? 'none' : 'block';
  document.getElementById('join-panel').style.display = isGlobe ? 'block' : 'none';
  document.getElementById('leaderboard-panel').style.display = isGlobe ? 'block' : 'none';
  document.getElementById('student-card').style.display = 'none';
  const questPanel = document.getElementById('quest-panel');
  if (questPanel) questPanel.style.display = isGlobe && myStudent ? 'block' : 'none';
  document.getElementById('view-globe-btn').classList.toggle('active', isGlobe);
  document.getElementById('view-dash-btn').classList.toggle('active', !isGlobe);
  if (!isGlobe) renderDashboard();
}

// ─── Professor Dashboard ──────────────────────────────────────────────────────
function renderDashboard() {
  if (currentView !== 'dashboard') return;
  const container = document.getElementById('dashboard-view');

  if (students.length === 0) {
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-size:14px;">No students have joined yet.</div>`;
    return;
  }

  const valueCounts = {};
  students.forEach(s => { if (s.value) valueCounts[s.value] = (valueCounts[s.value] || 0) + 1; });
  const sortedValues = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);
  const maxV = Math.max(...sortedValues.map(v => v[1]), 1);

  const regions = {};
  students.forEach(s => {
    const c = s.country || '';
    let r = 'Other';
    if (['USA','Canada','Mexico'].includes(c)) r = 'North America';
    else if (['Brazil','Argentina','Colombia','Chile','Peru','Venezuela'].includes(c)) r = 'South America';
    else if (['France','Germany','Italy','Spain','United Kingdom','Netherlands','Sweden','Norway','Finland','Denmark','Belgium','Austria','Switzerland','Poland','Czech Republic','Romania','Hungary','Greece','Portugal','Ireland','Ukraine','Russia'].includes(c)) r = 'Europe';
    else if (['Nigeria','South Africa','Kenya','Ghana','Ethiopia','Tanzania','Uganda','Zimbabwe','Morocco','Egypt'].includes(c)) r = 'Africa';
    else if (['India','Pakistan','Bangladesh','Sri Lanka','Afghanistan'].includes(c)) r = 'South Asia';
    else if (['China','Japan','South Korea','Taiwan','Vietnam','Thailand','Indonesia','Malaysia','Philippines'].includes(c)) r = 'East/SE Asia';
    else if (['Saudi Arabia','United Arab Emirates','Iran','Iraq','Israel','Jordan','Turkey'].includes(c)) r = 'Middle East';
    else if (['Australia','New Zealand'].includes(c)) r = 'Oceania';
    regions[r] = (regions[r] || 0) + 1;
  });
  const sortedRegions = Object.entries(regions).sort((a, b) => b[1] - a[1]);
  const maxR = Math.max(...sortedRegions.map(r => r[1]), 1);

  const regionColors = {
    'North America':'#7EC8E3','South America':'#E8A87C','Europe':'#C9B1FF',
    'Africa':'#D4A574','South Asia':'#FFDAC1','East/SE Asia':'#85CDCA',
    'Middle East':'#FFB6B9','Oceania':'#B5EAD7','Other':'#94a3b8'
  };

  container.innerHTML = `
    <div class="dash-inner">
      <div class="dash-title">
        <h2>📊 Professor Dashboard</h2>
        <p>OGL 360 · Intercultural Leadership · Dr. Hirshorn · Live session</p>
      </div>

      <div class="dash-row3">
        <div class="dash-card">
          <div class="dash-label">Students on Map</div>
          <div class="dash-big" style="color:#7ec8e3">${students.length}</div>
          <div class="dash-sub">${Object.keys(regions).length} regions represented</div>
        </div>
        <div class="dash-card">
          <div class="dash-label">Leadership Values</div>
          <div class="dash-big" style="color:#C9B1FF">${sortedValues.length}</div>
          <div class="dash-sub">Top: ${sortedValues[0]?.[0] || '—'}</div>
        </div>
        <div class="dash-card">
          <div class="dash-label">Cultural Insights</div>
          <div class="dash-big" style="color:#85CDCA">${students.filter(s => s.cultural).length}</div>
          <div class="dash-sub">stories shared</div>
        </div>
      </div>

      <!-- AI Insights -->
      <div class="dash-card" id="ai-section">
        <div class="dash-label" style="display:flex;align-items:center;justify-content:space-between;">
          <span>🧠 AI Insights <span style="color:rgba(255,255,255,0.15);font-size:7px;margin-left:6px;">Powered by Claude</span></span>
          <button id="ai-refresh-btn" onclick="loadAIInsights()">✨ Generate</button>
        </div>
        <div id="ai-insights-list" style="color:rgba(255,255,255,0.3);font-size:12px;font-style:italic;">
          Click Generate to analyze the class data with Claude AI.
        </div>
      </div>

      <div class="dash-row2">
        <div class="dash-card">
          <div class="dash-label">Leadership Value Distribution</div>
          <div class="dash-bar-chart">
            ${sortedValues.map(([v, c]) => {
              const color = students.find(s => s.value === v)?.color || '#7ec8e3';
              return `
                <div class="dash-bar-row">
                  <span class="dash-bar-label">${v}</span>
                  <div class="dash-bar-bg">
                    <div class="dash-bar-fill" style="width:${(c/maxV)*100}%;background:${color}"></div>
                  </div>
                  <span class="dash-bar-num">${c}</span>
                </div>`;
            }).join('')}
          </div>
        </div>

        <div class="dash-card">
          <div class="dash-label">Geographic Diversity</div>
          <div class="dash-bar-chart">
            ${sortedRegions.map(([r, c]) => `
              <div class="dash-bar-row">
                <span class="dash-bar-label">${r}</span>
                <div class="dash-bar-bg">
                  <div class="dash-bar-fill" style="width:${(c/maxR)*100}%;background:${regionColors[r]||'#94a3b8'}"></div>
                </div>
                <span class="dash-bar-num">${c}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-label">Student Roster</div>
        <table class="dash-table">
          <thead>
            <tr>
              <th>Student</th><th>Location</th><th>Value</th><th>XP</th><th>Cultural Insight</th>
            </tr>
          </thead>
          <tbody>
            ${[...students].sort((a,b) => b.xp - a.xp).map(s => `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:7px;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${s.color||'#7ec8e3'};flex-shrink:0"></div>
                    <span>${s.name}${s.firstFromCountry ? ' 🥇' : ''}</span>
                  </div>
                </td>
                <td>${s.location || s.country}</td>
                <td>${s.value ? `<span class="dash-badge" style="background:${s.color||'#7ec8e3'}18;border-color:${s.color||'#7ec8e3'}35;color:${s.color||'#7ec8e3'}">${s.value}</span>` : '—'}</td>
                <td style="color:#fbbf24;font-weight:600">${s.xp || 10}</td>
                <td class="dash-cultural">${s.cultural ? `"${s.cultural.substring(0,80)}${s.cultural.length>80?'…':''}"` : '<span style="color:rgba(255,255,255,0.25)">Not shared</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ─── AI Insights Loader ───────────────────────────────────────────────────────
async function loadAIInsights() {
  const btn = document.getElementById('ai-refresh-btn');
  const list = document.getElementById('ai-insights-list');
  if (!btn || !list) return;
  btn.textContent = '⏳ Thinking…';
  btn.disabled = true;
  try {
    const res = await fetch('/api/ai-insights');
    const insights = await res.json();
    list.innerHTML = insights.map(i => `
      <div class="ai-insight-row">
        <span class="ai-insight-icon">${i.icon}</span>
        <span class="ai-insight-text">${i.text}</span>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<span style="color:#fca5a5;font-size:12px;">Failed to load insights — check your connection.</span>';
  } finally {
    btn.textContent = '✨ Refresh';
    btn.disabled = false;
  }
}

// ─── LTI Auto-fill ────────────────────────────────────────────────────────────
function applyLTIParams() {
  const p = new URLSearchParams(window.location.search);
  if (p.get('lti') !== '1') return;

  const name = p.get('name');
  const country = p.get('country');

  if (name) document.getElementById('name-input').value = name;
  if (country && COUNTRIES[country]) {
    document.getElementById('country-select').value = country;
    document.getElementById('location-input').value = country;
  }

  if (name && country && COUNTRIES[country]) {
    if (!selectedValue) {
      selectedValue = 'Resilience';
      document.querySelectorAll('.value-btn').forEach(b => {
        if (b.textContent === 'Resilience') b.classList.add('selected');
      });
    }
    setTimeout(() => document.getElementById('join-btn').click(), 1000);
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
initGlobe();
applyLTIParams();
