# Plan C — Immersive Simulation Rooms
## *"Enter the World"* — 3D AI-Generated Leadership Environments

> **Concept**: The globe is the map. But from it, students can *enter* a country. When they do, they leave the orbit view and descend into an AI-generated 3D room — a culturally authentic leadership environment (a boardroom in Tokyo, a community circle in Lagos, a startup floor in São Paulo). Inside, they face AI characters, navigate real dilemmas, and emerge with XP, badges, and a richer understanding of that culture's leadership approach. The World Model generates, runs, and evaluates the entire room.

---

## Vision

A student clicks Nigeria. Instead of a card — the globe *zooms in*. The atmosphere shader ripples. The student is transported into an **AI-generated 3D scene**: an open-air community meeting in Lagos. Wooden chairs in a circle. A local leader, Emeka, stands at the center with a problem: *"The village council is split. Half want to build a school, half a hospital. You are the mediator. You have 5 minutes before both sides walk."*

The student talks to Emeka. They interrogate other AI characters (the school faction, the hospital faction). They use their leadership tools — propose a vision, invoke a value, call for a vote. The World Model tracks every decision. When they're done, the room *dissolves back to the globe*. Their pin glows with a new color. Their journal has a new entry.

No scripts. No branching trees. A living simulation.

---

## World Model Architecture

This is the most ambitious use of the World Model — a **full simulation runtime**:

```
┌────────────────────────────────────────────────────────────────┐
│                   SIMULATION WORLD MODEL                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ENVIRONMENT GENERATOR                                   │  │
│  │  Claude Vision + Stable Diffusion / DALL-E 3            │  │
│  │  Input: country, module, student profile                 │  │
│  │  Output: scene description + background image            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHARACTER SIMULATION ENGINE                             │  │
│  │  Claude API (multi-character orchestration)              │  │
│  │  - 2-4 AI characters per room, each with own agenda     │  │
│  │  - Characters react to each other, not just student      │  │
│  │  - Emotional state tracking (trust, frustration, hope)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↕                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  EVALUATION ENGINE                                        │  │
│  │  Claude with rubric: Northouse concepts                  │  │
│  │  Scores: trait expression, style effectiveness,          │  │
│  │  ethical reasoning, inclusion, vision quality            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↕                                      │
│  3D SCENE RENDERER: Three.js / Babylon.js                      │
│  - Procedural room layout (walls, furniture, characters)        │
│  - Character avatars (3D low-poly or 2D illustrated)           │
│  - Dynamic lighting (emotion → ambient color)                   │
└────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. World Entry — Globe → Room Transition
From the main globe, clicking a **country with an available Sim Room** shows a portal effect:
- Globe pin pulses with a door icon
- Student clicks "Enter [Country] Leadership Room"
- **Transition animation**: globe zooms into the pin → atmosphere parting → dissolve into the 3D room
- Room is generated *during* the transition (2-3 second generation time hidden by the animation)
- Implemented in Three.js as a camera fly-through animation

### 2. AI-Generated 3D Environments
Each room is procedurally configured from a template + AI description:

```js
// server/rooms/generator.js
async function generateRoom(country, module, studentProfile) {
  const brief = await claude.messages.create({
    model: 'claude-sonnet-4-5',
    system: `You are a world-building AI. Generate a brief
             for a culturally authentic leadership scenario.`,
    messages: [{
      role: 'user',
      content: `Country: ${country}, Module: ${module},
                Student traits: ${studentProfile.traits}
                Output JSON: { setting, problem, characters[],
                               backdrop_prompt, atmosphere,
                               success_criteria }`
    }]
  });

  // backdrop_prompt → DALL-E 3 or Stable Diffusion API
  // Generates 1 background image: the physical space
  const backdrop = await generateImage(brief.backdrop_prompt);

  return { brief, backdrop, characters: brief.characters };
}
```

**Room types** (by module):
| Module | Room Type | Example Setting |
|---|---|---|
| M1 Traits | Mentorship Interview | A tea house in Kyoto; a mentor tests your self-confidence |
| M2 Styles | The Crisis Meeting | A startup war room in Berlin; pick your leadership style under pressure |
| M3 Strengths | The Incomplete Team | A NGO office in Nairobi; build the team by identifying missing strengths |
| M4 Vision | The Founding Moment | A community hall in Brazil; write the vision that unites two factions |
| M5 D&I | The Excluded Voice | A corporate boardroom in Mumbai; find and amplify the silenced perspective |
| M6 Ethics | The Power Test | A government office in Seoul; resist or use coercive power to meet the deadline |

### 3. Multi-Character AI Simulation
Each room has **2-4 AI characters** simultaneously in play. They are NOT scripted. They are **prompted separately** and respond to each other:

```js
// Character orchestration loop
class SimRoom {
  characters: AICharacter[] // each has: name, role, agenda, emotionalState, memory

  async playerSpeaks(playerInput) {
    // Determine which characters heard this
    const listeners = this.getListeners(playerInput);

    // Each character independently generates a response
    const responses = await Promise.all(
      listeners.map(char => char.respond(playerInput, this.roomState))
    );

    // World Model adjudicates: who speaks first, do characters disagree?
    const sequenced = await this.worldModel.sequence(responses);
    return sequenced; // characters may interrupt each other
  }
}
```

Characters have **emotional state** — they get more resistant if the student uses the wrong leadership approach, and more cooperative when the student demonstrates the right traits. The emotion is shown visually on their avatar (color aura, posture change).

### 4. Multimodal Interaction Inside the Room
Students can interact with the environment using:

- **🎤 Voice** (primary): Speak directly to characters; Web Speech API live transcription
- **📷 Camera** (optional): Web camera facial expression analysis → Claude Vision determines emotional tone → characters react to the *student's actual expression* ("You look uncertain — is that what you want to project as a leader?")
- **✏️ Whiteboard**: In-room digital whiteboard; student can draw a plan, org chart, or vision diagram; Claude Vision reads it; characters respond to it
- **🗺️ Globe Reference**: Student can "pull up" the main globe inside the room (picture-in-picture) and reference a classmate's pin: "What would my colleague from Germany do here?" → AI character responds in context
- **📱 Artifact Upload**: Student can photograph a real-world leadership artifact (a trophy, a book cover, a family photo) → Claude Vision analyzes it → characters respond to its symbolic meaning

### 5. The Evaluation Rubric (World Model as Assessor)
At the end of each room, the World Model evaluates the student's performance — not on right/wrong answers, but on **leadership quality**:

```
EVALUATION DIMENSIONS (all mapped to Northouse):
┌──────────────────┬─────────────────────────────────────────┐
│ Dimension        │ What the AI looks for                   │
├──────────────────┼─────────────────────────────────────────┤
│ Trait Expression │ Did the student demonstrate their        │
│                  │ stated top traits consistently?          │
├──────────────────┼─────────────────────────────────────────┤
│ Style Awareness  │ Did they choose appropriate style        │
│                  │ for the context (not just their habit)?  │
├──────────────────┼─────────────────────────────────────────┤
│ Inclusion        │ Did they seek out marginalized voices?   │
├──────────────────┼─────────────────────────────────────────┤
│ Vision Quality   │ Was their proposed direction compelling  │
│                  │ and specific?                            │
├──────────────────┼─────────────────────────────────────────┤
│ Ethical Judgment │ How did they navigate power use?         │
│                  │ Did they lean on Expert/Referent or      │
│                  │ fall back on Coercive?                   │
├──────────────────┼─────────────────────────────────────────┤
│ Cultural EQ      │ Did they adapt to cultural context or    │
│                  │ impose their home culture's norms?       │
└──────────────────┴─────────────────────────────────────────┘
```

Results are returned as a **Leadership Scorecard** — not a grade, but a radar chart showing their profile across dimensions. This is shown both to the student and optionally to the professor.

### 6. Room Replay & Sharing
After completing a room:
- The full transcript + decisions are saved as a **Leadership Story**
- Students can share their story (anonymized) as a pin overlay on the globe
- Other students can click and read the story: *"Here's how [Anonymous, Brazil] navigated the Lagos community dilemma"*
- These stories become **teaching artifacts** the professor can use in discussion

### 7. Collaborative Rooms (2-Player)
Advanced mode: two students enter the same room from their separate screens. They see each other's pins inside the environment. The World Model gives them **complementary but conflicting briefs** — they must negotiate to resolve the dilemma together.

- Implemented via Socket.io shared room session
- Both see the same AI characters, who respond to *both* students
- The World Model tracks who led, who followed, who bridged

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Globe → Room | Three.js (camera flythrough) + globe.gl | Transition animation |
| Room 3D Render | Three.js scene or Babylon.js | Furniture, characters, lighting |
| Character Avatars | Avaturn or custom GLB avatars / 3D illustrated assets | AI character bodies |
| Environment Image | DALL-E 3 or Stable Diffusion API | Background scene image |
| AI Brain | Claude Sonnet 4.5 (multi-character orchestration) | Character responses |
| World Evaluation | Claude opus-4-5 with extended thinking | Rubric-based assessment |
| Voice Input | Web Speech API | Student speech |
| Voice Output | Web Speech API + ElevenLabs per character | Each character has a unique voice |
| Camera Input | WebRTC getUserMedia + Claude Vision | Facial expression reading |
| Whiteboard | Fabric.js canvas → base64 → Claude Vision | Drawing analysis |
| Room State | Socket.io + Redis (or in-memory) | Multi-character sync |
| Scorecard | SVG radar chart (D3.js or Chart.js) | Leadership assessment visual |
| Storage | SQLite: rooms, stories, scorecards | Persistence |

### Key: Parallel AI Character Calls
```js
// All characters respond simultaneously, then sequence
const [emeka, faction_a, faction_b] = await Promise.all([
  characters.emeka.respond(input, roomState),
  characters.faction_a.respond(input, roomState),
  characters.faction_b.respond(input, roomState)
]);
// World model determines natural dialogue ordering
```

---

## UX Flow

```
Globe view
    ↓
Student clicks Nigeria pin → sees "Enter Leadership Room: Lagos Community Crisis"
    ↓
Click "Enter" → Three.js camera zooms through atmosphere
    ↓
(2-3s: room generates in background)
    ↓
3D room fades in: community circle in Lagos (AI-generated backdrop)
    ↓
Characters introduced one by one (3D card entrance)
    ↓
Lead character explains the crisis (voice + text subtitles)
    ↓
Student interacts: voice, text, or whiteboard
    ↓
Characters respond, interact with each other, emotional states shift
    ↓
Timed challenge: 5-10 minute scenario
    ↓
Resolution moment: student proposes final decision
    ↓
World Model evaluates → "Here's what happened" (3-part outcome)
    ↓
Leadership Scorecard radar chart appears
    ↓
Student exits → camera flies back up through atmosphere → globe
    ↓
Pin glows differently; XP/badges awarded; story saved
```

---

## Globe Integration After Room Exit

When a student completes a Sim Room:
- Their **pin changes color** to indicate which room(s) they've completed
- A subtle **story fragment** floats above their pin (visible on hover)
- **"Experience arc"** draws from their home country to the visited country (different style from connection arcs)
- The visited country's pin shows a **"room active"** glow — other students can see someone is inside

---

## Professor Dashboard Additions

- **Room Activity Feed**: live list of "Who is in which room right now"
- **Scorecard Aggregator**: class average across all 6 evaluation dimensions — visualized as a class-wide radar chart
- **Story Library**: browse all student Leadership Stories, tag favorites for class discussion
- **Room Designer**: professor can create custom rooms with a simple form (country, challenge type, characters, success criteria) — AI fills in the rest

---

## Wow Moments (Demo-Ready for March 18)

1. **Live demo**: professor opens Nigeria room on projector, walks through the scenario in real time
2. **Camera mode**: student's expression (uncertainty) triggers character response: "You look hesitant — own your decision"
3. **Whiteboard**: student draws a 2×2 leadership matrix on the in-room whiteboard → Emeka responds to the drawing
4. **Collaborative room**: two students in the same room, negotiating live, class watching on projector
5. **Radar scorecard**: student exits room and their leadership profile updates in real time on the globe

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 3D room performance (mobile) | Progressive enhancement: 3D on desktop, 2D illustrated panels on mobile |
| Image generation cost ($0.04/image) | Cache rooms — same room config = same backdrop; generate once, reuse |
| Camera privacy concerns | Camera is always opt-in; default is voice+text only |
| Characters going off-curriculum | System prompt anchors all characters to Northouse framework; professor can flag issues |
| Students feel evaluated (anxiety) | Framing: "This is your leadership *journal entry*, not a grade" |
| Two students desync in collaborative room | Server is the source of truth; one stream, two views |

---

## Priority Build Order

1. ✅ **Phase 1**: Globe → room transition animation (Three.js); one static room (Nigeria, M5 D&I); one AI character; text only
2. **Phase 2**: AI room generation (DALL-E backdrop); voice input/output; 2 characters per room
3. **Phase 3**: Scorecard + radar chart; room exit → globe state update; story saving
4. **Phase 4**: Camera input (opt-in); whiteboard; collaborative 2-player rooms
5. **Phase 5**: Full room library (6 modules × 5 countries = 30 rooms); professor room designer; WebXR (VR headset support)

---

## Comparison to Planet Jockey

| Planet Jockey | Plan C Sim Rooms |
|---|---|
| Pre-scripted branching trees | AI generates conversations dynamically — infinite paths |
| 2D illustrated panels | 3D procedural environments + AI-generated backdrops |
| Click-through text bubbles | Voice-first, multimodal input |
| Fixed right/wrong answers | Evaluated on leadership *quality* dimensions |
| Solo play only | Solo + collaborative (2 students) |
| Generic CEO scenario | Culturally specific, module-aligned, class-aware |
| No memory between sessions | Cross-session memory; leadership growth arc |
| No connection to class data | Characters reference classmates, class decisions, real-time state |
