const Anthropic = require('@anthropic-ai/sdk');

let cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000; // 1 minute

async function getAIInsights(students) {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) return cache.data;
  if (!students.length) {
    return [{ icon: '👥', text: 'No students have joined yet. Share the link and wait for participants!' }];
  }

  const client = new Anthropic();

  const summary = students.map(s =>
    `- ${s.name} (${s.country}): Value="${s.value || 'not set'}", Insight="${s.cultural?.substring(0, 100) || 'none'}"`
  ).join('\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `You are analyzing real-time data from an Intercultural Leadership class (OGL 360, Dr. Jessica Hirshorn, ASU). Students have dropped pins on a world map and shared cultural insights about leadership.

Current participants:
${summary}

Generate exactly 3 short, actionable insights for the professor to use right now in class. Focus on:
- Surprising value or cultural patterns worth surfacing
- Potential discussion pairings (students with complementary backgrounds)
- A specific theme emerging from the cultural insights

Respond with JSON only: [{"icon":"emoji","text":"insight text under 25 words"}]`
    }]
  });

  const text = message.content[0].text.trim();
  const insights = JSON.parse(text.match(/\[[\s\S]*\]/)[0]);
  cache = { data: insights, ts: Date.now() };
  return insights;
}

module.exports = { getAIInsights };
