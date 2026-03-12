require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { Provider, registerPlatform } = require('./lti');
const { getAIInsights } = require('./insights');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// ─── Color palette (matches culture-map-v2 design) ───────────────────────────
const COLORS = [
  '#E8A87C','#85CDCA','#D4A574','#C9B1FF','#7EC8E3',
  '#FFB6B9','#FFDAC1','#B5EAD7','#FF9AA2','#A0E7E5',
  '#FFD6A5','#CAFFBF'
];

// ─── Leaderboard computation ──────────────────────────────────────────────────
function computeLeaderboard(students) {
  return [...students]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((s, i) => ({
      rank: i + 1,
      name: s.name,
      country: s.country,
      xp: s.xp,
      firstFromCountry: s.firstFromCountry || false,
      id: s.id,
    }));
}

// ─── Main async start ─────────────────────────────────────────────────────────
async function start() {
  // Serve client folder as static files FIRST (before LTI middleware)
  app.use(express.static(path.join(__dirname, '../client')));

  // Deploy LTI provider (serverless = no own HTTP server; we use our httpServer)
  await Provider.deploy({ serverless: true });

  // In-memory store of connected students
  let students = [];

  // ─── AI Insights API (must be before Provider.app to avoid LTI interception)
  app.get('/api/ai-insights', async (req, res) => {
    try {
      const insights = await getAIInsights(students);
      res.json(insights);
    } catch (err) {
      console.error('AI insights error:', err.message);
      res.json([{ icon: '⚠️', text: 'AI insights unavailable — check ANTHROPIC_API_KEY' }]);
    }
  });

  // Mount LTI routes (/lti/login, /lti/launch, /lti/keys, etc.) AFTER static files
  app.use(Provider.app);

  // ─── Socket.io ─────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`Student connected: ${socket.id}`);

    // Send existing students and current leaderboard to the new client
    socket.emit('students', students);
    socket.emit('leaderboard', computeLeaderboard(students));
    io.emit('count', students.length);

    // Student drops their pin
    socket.on('join', (student) => {
      student.id = socket.id;
      student.color = COLORS[students.length % COLORS.length];
      student.joinedAt = Date.now();

      // XP: 10 base, +100 if first from their country
      student.xp = 10;
      const isFirst = !students.some(s => s.country === student.country);
      if (isFirst) {
        student.xp += 100;
        student.firstFromCountry = true;
      }

      // Assign join-time badges
      student.badges = ['explorer'];
      if (student.firstFromCountry) student.badges.push('pioneer');
      if (student.cultural && student.cultural.trim().length > 10) student.badges.push('storyteller');

      students.push(student);
      console.log(`${student.name} joined from ${student.country} — ${student.xp} XP`);

      io.emit('student-joined', student);
      io.emit('leaderboard', computeLeaderboard(students));
      io.emit('count', students.length);
    });

    // Interaction badge earned client-side, XP awarded server-side
    socket.on('badge-earned', ({ badgeId, xpReward }) => {
      const s = students.find(s => s.id === socket.id);
      if (!s || s.badges.includes(badgeId)) return;
      s.badges.push(badgeId);
      s.xp += xpReward;
      io.emit('leaderboard', computeLeaderboard(students));
      socket.emit('badge-confirmed', { badgeId, xp: s.xp });
    });

    // Student disconnects
    socket.on('disconnect', () => {
      const idx = students.findIndex(s => s.id === socket.id);
      if (idx !== -1) {
        console.log(`${students[idx].name} left`);
        students.splice(idx, 1);
        io.emit('student-left', socket.id);
        io.emit('leaderboard', computeLeaderboard(students));
        io.emit('count', students.length);
      }
    });
  });

  // ─── Register Canvas LTI platform ──────────────────────────────────────────
  await registerPlatform();

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`🌍 Student World running at http://localhost:${PORT}`);
    console.log(`\n📋 Canvas LTI 1.3 configuration:`);
    console.log(`   Launch URL (Redirect URI): http://localhost:${PORT}/`);
    console.log(`   Login initiation URL:      http://localhost:${PORT}/login`);
    console.log(`   JWK Set URL:               http://localhost:${PORT}/keys`);
  });
}

start().catch(console.error);
