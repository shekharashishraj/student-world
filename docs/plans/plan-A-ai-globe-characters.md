# Plan A — AI Characters on the Globe
## *"Meet the Leaders"* — Live AI Personas Embedded in the 3D World

> **Concept**: Every country pin on the globe has an AI-powered leadership mentor — a culturally-grounded persona who *lives* at that coordinate. Students click any pin, enter a voice + text conversation with that AI leader, and receive coaching, challenges, and stories rooted in that culture's leadership tradition. The globe is the world. The world has a mind.

---

## Vision

Imagine: a student in Phoenix clicks Brazil on the 3D globe. The pin pulses. A face appears in a floating card — **Camila, a Brazilian community leader**. Her voice greets the student in accented English. She asks: *"In my country, we lead through relationships — 'jeitinho brasileiro.' What does your culture say about leading through people, not rules?"*

The student responds. Camila listens, reflects, challenges. The conversation is **real-time AI** — aware of the student's profile, the class state, the course module — generating authentic leadership dialogue grounded in Brazilian culture.

This is not a scripted game. This is a living world.

---

## World Model Architecture

The **World Model** is the AI brain that understands the full state of the globe at all times:

```
┌─────────────────────────────────────────────────────────┐
│                    WORLD MODEL BRAIN                     │
│  Claude (claude-opus-4-5 / claude-sonnet-4-5)           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Global State Context (injected per request)     │   │
│  │  - Who is on the map right now (students)        │   │
│  │  - What module is active                         │   │
│  │  - What connections have been made               │   │
│  │  - Class XP + leaderboard                        │   │
│  │  - This student's profile + history              │   │
│  └──────────────────────────────────────────────────┘   │
│                          ↕                               │
│  Character Layer: 195 country personas (lazy-loaded)    │
│  Each knows: cultural leadership tradition, history,     │
│  local proverbs, challenge style, voice/tone             │
└─────────────────────────────────────────────────────────┘
```

The World Model is **stateful per session** — it remembers what the student said to the Nigerian leader before they visited the Japanese one, and can weave that into responses.

---

## Core Features

### 1. AI Country Personas (195 leaders)
Each country has a generated AI persona with:
- **Name + backstory** (procedurally generated, culturally authentic)
- **Leadership tradition** (Ubuntu in South Africa, Nemawashi in Japan, Mestizo leadership in Mexico)
- **Signature challenge** — a question they always ask students
- **Voice profile** — ElevenLabs or Web Speech API with regional accent
- **Emotional range** — can be proud, curious, challenging, warm

Personas are **not static prompts** — they are generated dynamically by Claude, given a cultural brief, the student's profile, and the current conversation.

### 2. Voice-First Interaction
```
Student speaks → Web Speech API (STT) → Claude API
Claude responds → Web Speech API (TTS) or ElevenLabs
                → Transcript displayed on screen
                → Sentiment analyzed → Emotion shown on pin
```

Students can also type. Voice is *default*. The globe goes quiet and the AI character "listens" — a live audio waveform pulses on their pin.

### 3. Multimodal Input Layer
- **Voice** (primary): Web Speech API, browser-native, no install
- **Photo prompt**: Student can take a photo of a physical object ("this is the leadership artifact from my culture") — Claude Vision analyzes it and the AI persona responds to it
- **Drawing canvas**: Student sketches a leadership diagram → AI responds to the sketch
- **Emoji reaction** on globe: Students can "react" to what a leader says — reactions aggregate across the class

### 4. The World Model State — Live Globe Intelligence
The globe itself becomes intelligent:
- As conversations happen, **connection arcs glow brighter** between students whose AI conversations revealed shared values
- **Cultural resonance rings** pulse outward from pins when a student says something that matches that country's leadership tradition
- **Insight fog**: countries not yet visited by any student appear dimmer — "unexplored leadership traditions"
- **Heatmap overlay**: professor can enable "Empathy Map" — globe colors by which leadership values are dominating class conversations

### 5. Leadership Challenge Mode
Any student can issue a **Leadership Challenge** to another student:
- Click their pin → "Challenge [Name]"
- AI generates a scenario relevant to BOTH students' countries
- Both students receive the same dilemma — must respond independently
- Their answers are anonymously surfaced to the class as "Two approaches from [Country A] and [Country B]"

### 6. AI Coach Memory (Cross-Session)
The world model maintains a **Leadership Journal** per student:
- Every AI conversation → summarized and stored in SQLite
- Next session: AI characters *remember* the student ("You told me last week about your family's business — how did that leadership decision turn out?")
- Professor dashboard shows each student's leadership growth arc across sessions

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Globe | globe.gl (current) + custom HTML overlays | Base world |
| AI Brain | Claude Sonnet 4.5 (streaming) | Persona responses |
| Extended Thinking | Claude opus-4-5 with extended thinking | Deep scenario reasoning |
| Voice Input | Web Speech API (browser-native) | Student speech → text |
| Voice Output | Web Speech API `speechSynthesis` | AI text → speech |
| Premium Voice | ElevenLabs API (optional upgrade) | Accented character voices |
| Vision | Claude Vision API | Photo/drawing input |
| World State | Socket.io (current) + server-side World Model cache | Globe live state |
| Persona Storage | SQLite (current) + JSON persona library | 195 country personas |
| Memory | SQLite `conversations` table | Cross-session recall |

### Key API: Streaming Conversations
```js
// Server: /api/character-chat (POST)
// Body: { countryCode, studentProfile, message, conversationHistory, classState }
// Response: text/event-stream (SSE streaming)

const stream = await claude.messages.stream({
  model: 'claude-sonnet-4-5',
  system: buildCharacterPrompt(country, studentProfile, classState),
  messages: conversationHistory,
  max_tokens: 500
});
// Stream tokens → client in real-time
```

### World Model Context Injection
Every AI call receives:
```js
const classState = {
  studentsOnMap: students.map(s => ({ country: s.country, value: s.value, traits: s.traits })),
  activeModule: currentModule,
  totalConnections: connections.length,
  dominantValues: computeValueCounts(students),
  studentHistory: getStudentConversations(studentId)
};
```

---

## UX Flow

```
Student lands on globe
    ↓
Joins with their profile (name, country, traits, style)
    ↓
Globe populates with classmates' pins (live)
    ↓
Student clicks any country pin
    ↓
AI persona card expands (3D flip animation)
    ↓
Character greeting plays (voice + text)
    ↓
Student responds (voice or type)
    ↓
Conversation flows — 3-6 exchanges
    ↓
AI ends with a "Leadership Challenge" question
    ↓
Student answer is saved to their journal
    ↓
Arc drawn on globe (student ↔ country visited)
    ↓
Badge/XP awarded based on depth of conversation
```

---

## Module Integration

| Module | AI Character Behavior |
|---|---|
| M1 Traits | Character asks student about their leadership traits, shares a local example |
| M2 Styles | Character *demonstrates* their culture's leadership style; asks student to identify it |
| M3 Strengths | Character challenges student to name a complementary strength they're missing |
| M4 Vision | Character shares their country's vision story; asks student to co-create one sentence |
| M5 D&I | Character describes an inclusion barrier from their culture; asks student to propose a bridge |
| M6 Ethics | Character presents an ethical dilemma from their leadership tradition; no right answer |

---

## Professor Controls

- **🌍 Activate Country**: Spotlight one country's AI character for the whole class
- **🎭 Challenge Mode**: Push a cross-cultural dilemma to all students simultaneously
- **📊 Conversation Insights**: AI summary of themes from all conversations this session
- **🔇 Quiet Mode**: Disable character conversations for focused group discussion
- **📖 Journal Export**: Download all student leadership journals as PDF

---

## Wow Moments (Demo-Ready for March 18)

1. **Professor clicks Brazil pin → Camila speaks to the whole class** on the projector
2. **Student says "Integrity is my top trait" → Globe pulses with matching pins** across the world
3. **Two students from different continents both talked to the Japan character** → "Cultural Bridge" badge fires for both, arc lights up between their pins
4. **AI character references a classmate**: *"Your colleague from Nigeria mentioned Ubuntu leadership — what does your culture's equivalent look like?"*

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| API latency feels slow | Stream tokens live → feels like thinking, not waiting |
| Culturally inaccurate personas | Use Claude with careful prompting + student can correct the character |
| Voice recognition fails | Always show text fallback; mic permission handled gracefully |
| Students go off-topic | System prompt constrains to leadership topics; politely redirects |
| API cost at scale | Cache persona system prompts; limit conversation to 6 exchanges per session |

---

## Priority Build Order

1. ✅ **Phase 1**: Single country AI character (Brazil), text only, streaming → demo-ready
2. ✅ **Phase 2**: Voice input/output, 5 country personas
3. **Phase 3**: 50 country personas, photo input, emotion detection
4. **Phase 4**: Cross-session memory, full 195 countries, ElevenLabs voices
5. **Phase 5**: WebXR overlay — put on headset, characters appear in AR above globe pins
