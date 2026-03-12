# Plan B — Live Class AI Theater
## *"The Situation Room"* — Real-Time AI-Driven Leadership Narrative for the Whole Class

> **Concept**: The professor becomes a *Game Master*. They trigger a leadership crisis on the globe — a live, AI-generated scenario that every student sees simultaneously. The globe transforms into a *Situation Room*: regions light up, crisis arcs appear, every student's pin becomes an actor with a role. Students make choices; the AI World Model simulates consequences that ripple across the map in real time. The class *watches the world react to their leadership decisions*.

---

## Vision

The professor hits **"Launch Scenario"**. The globe goes dark. A red pulse radiates from Jakarta. Text appears on every student's screen: *"BREAKING: A multinational team in Jakarta has fractured. The project lead just quit. You are the regional director. You have 90 seconds."*

Every student sees their own **role card** — based on their profile. The student from Brazil gets: *"You're the relationship builder. The team trusts you but not each other."* The student from Germany gets: *"You're the efficiency expert. The deadline is tomorrow."*

Students type their decision. The **AI World Model** reads all responses simultaneously, synthesizes the class's collective leadership choices, and broadcasts the outcome: *"The Brazilian approach won trust but lost 2 hours. The German approach hit the deadline but two team members resigned. What does Tuckman tell us about what just happened?"*

The globe shows the ripple. The class *lived* the theory.

---

## World Model Architecture

The World Model here is a **scenario simulation engine** — it understands causality, leadership theory, and can model consequences of collective decisions:

```
┌──────────────────────────────────────────────────────────────┐
│                   SCENARIO WORLD MODEL                        │
│   Claude opus-4-5 with extended thinking                      │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐    │
│   │  Scenario State Machine                             │    │
│   │  - Current scenario + crisis parameters            │    │
│   │  - All student roles + decisions made              │    │
│   │  - Consequence simulation (causal reasoning)       │    │
│   │  - Leadership theory alignment checker             │    │
│   │  - Class consensus vs divergence tracker           │    │
│   └─────────────────────────────────────────────────────┘    │
│                          ↕                                    │
│   Globe Visualization Layer (Socket.io broadcast)            │
│   - Region lighting (crisis zones, safe zones)               │
│   - Decision arcs (who sided with whom)                      │
│   - Consequence ripples (outcomes spreading geographically)  │
│   - Real-time voting visualization                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Scenario Library + AI Generation
**Pre-built scenarios** aligned to each module, plus **AI-generated scenarios** tailored to the specific class:

```
Pre-built:
- "The Butter Battle" (M2): Two factions with opposing leadership styles
- "The Vision Crisis" (M4): Team lost its direction; rebuild consensus
- "The Ethics Breach" (M6): Team leader caught using coercive power
- "The Inclusion Fail" (M5): Key voices were systematically excluded
- "The Storming Team" (M4): Classic Tuckman storming stage in action

AI-generated (professor prompt):
Professor types: "Make a scenario about a nonprofit in Southeast Asia
struggling with hierarchical vs collaborative leadership"
→ Claude generates a full scenario in 10 seconds, complete with:
   - Crisis description
   - 3-5 roles (auto-assigned based on student profiles)
   - Decision points
   - 3 possible outcome branches
   - Post-debrief questions mapped to Northouse concepts
```

### 2. Student Role Assignment (AI-Powered)
When a scenario launches, the AI World Model assigns each student a **role** based on their profile:

```js
// Role assignment logic
assignRoles(scenario, students) {
  // Claude reads scenario + all student profiles
  // Returns: { studentId: { role, specialAbility, constraint, prompt } }
  // Example:
  // { "student-23": {
  //     role: "The Bridge Builder",
  //     ability: "Can negotiate between factions",
  //     constraint: "Cannot issue direct orders",
  //     prompt: "Your Empathy trait is your superpower here..."
  //   }
  // }
}
```

Roles appear as **glowing badges** on each student's pin. The globe shows who has what role geographically.

### 3. Decision Engine (Multimodal Input)
Students respond to scenarios using any of:
- **Text** — type their decision freely
- **Voice** — speak their decision (STT → text)
- **Vote** — quick 4-option multiple choice (for time-sensitive moments)
- **Slider** — "How much authority would you use? 0–100"
- **Image** — upload/draw a diagram of their proposed org structure

All inputs are collected server-side. The AI World Model processes them **collectively** — it's aware of what *everyone* decided, not just one student.

### 4. Live Consequence Simulation
After decisions are collected (90-second timer), the World Model:

1. **Synthesizes the collective decision** — what did the class as a whole lean toward?
2. **Simulates the consequences** — using causal reasoning about leadership outcomes
3. **Generates a 3-act outcome**: immediate result → 1-week later → 1-month later
4. **Maps outcomes to theory**: "This mirrors what Northouse calls…"
5. **Broadcasts everything via Socket.io** to the globe in real time

The globe **visualizes the outcome**:
- Crisis zone either dims (resolved) or pulses harder (escalated)
- Arcs appear between students who chose similar approaches
- A "Leadership Decision Map" overlay shows geographic patterns

### 5. Branching Narrative (Choose Your Story)
For deeper sessions, professors can enable **branching mode**:
```
Act 1: Crisis introduced (all students see it)
    ↓ Students decide (60 seconds)
    ↓ AI World Model processes
Act 2: Outcome of Act 1 plays out (unique per class)
    ↓ New dilemma emerges BASED on their Act 1 decisions
    ↓ Students decide again
Act 3: Final consequence + debrief
    ↓ AI generates a personalized debrief for each student
    ↓ "Your decisions showed a Democratic leadership style. Here's what Northouse says..."
```

### 6. Globe Theater Mode
When a scenario is active, the globe transforms:
- **Background**: shifts from deep space to a dramatic color scheme (crisis = red/amber, resolution = blue/green)
- **Atmosphere effect**: shader layer that pulses with scenario intensity
- **Zoom behavior**: globe auto-rotates to the scenario's geographic center
- **Student pins**: animated — "thinking" pulse while decision timer is running, then lock in with decision color
- **Arc system**: decision arcs draw between students who chose the same approach
- **Text overlays**: scenario text + outcomes rendered as floating 3D text above the globe

### 7. AI Debrief (Post-Scenario)
After every scenario, the World Model generates a **personalized debrief**:
```
For the class:
"You collectively chose a Democratic approach.
 78% prioritized relationship over task.
 This mirrors Tuckman's Norming stage prescription.
 The 3 students who chose Authoritarian got better
 short-term results but created conflict in Act 3."

For each student:
"Your choice to collaborate despite time pressure reflects
 Integrity + Sociability — two of your stated top traits.
 This is consistent. Challenge yourself: when would you
 *not* use collaboration?"
```

### 8. Professor Game Master Console
The professor gets a **real-time command interface** (separate URL: `/gm`):
- **Launch Scenario** button + scenario picker or freeform prompt
- **Live student decision dashboard** — see every student's choice as they come in
- **Pause/Resume** timer
- **Reveal outcome** with one click
- **Inject twist** — mid-scenario: "The CEO just called. New constraint: budget is cut 50%"
- **Spotlight student** — show one student's decision anonymously to the class
- **Generate debrief questions** — AI creates 3 discussion questions based on what just happened

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 3D Globe | globe.gl + custom WebGL shaders | Theater mode visuals |
| AI World Model | Claude opus-4-5 + extended thinking | Scenario simulation + consequence modeling |
| Scenario Generation | Claude API (POST `/api/scenario/generate`) | Dynamic scenario creation from professor prompt |
| Role Assignment | Claude API (POST `/api/scenario/assign-roles`) | Profile-aware role generation |
| Consequence Engine | Claude API (POST `/api/scenario/resolve`) | Collective decision → outcome |
| Real-time Sync | Socket.io rooms: `scenario-[id]` | Live decision collection + broadcast |
| Voice Input | Web Speech API | Student decision by voice |
| Globe Shaders | Three.js atmosphere shader | Dramatic visual effects |
| GM Console | Separate `/gm` Express route + Socket.io | Professor control room |
| Timer | Server-side countdown via Socket.io | Synchronized across all students |

### Critical: Scenario State Machine
```js
// server/scenario.js
class ScenarioSession {
  state: 'idle' | 'launching' | 'collecting' | 'resolving' | 'debrief'
  scenario: { id, title, crisis, roles, timer }
  decisions: Map<studentId, { input, modality, timestamp }>
  outcome: { summary, theory, arcs, globe_state }

  async resolve() {
    // Send all decisions to Claude
    // Get back: outcome, debrief, globe_state_changes
    // Broadcast via Socket.io
  }
}
```

---

## UX Flow

```
Professor at GM Console
    ↓
Selects or generates scenario
    ↓
Clicks "Launch" → socket.emit('scenario-start', scenario)
    ↓
All students: globe shifts to Theater Mode (visual transformation ~2s)
    ↓
Scenario text appears on every screen + voice narration
    ↓
Role cards deal to each student (3D card flip animation)
    ↓
90-second decision timer starts (visible countdown on globe)
    ↓
Students input decisions (text/voice/vote)
    ↓
Timer ends → "The world model is processing..." (dramatic 3-5s pause)
    ↓
Outcomes broadcast to globe (arcs, colors, text overlays)
    ↓
AI debrief narrated aloud + shown on screen
    ↓
Professor enables discussion mode
    ↓
Globe returns to normal — XP/badges awarded
```

---

## Module-Scenario Alignment

| Module | Scenario Type | World Model Focus |
|---|---|---|
| M1 Traits | "Which leader would you follow?" — 4 global leader profiles | Trait identification |
| M2 Styles | "The Butter Battle" — two factions, pick a style | Style effectiveness modeling |
| M3 Strengths | "The Incomplete Team" — 4 missing strengths, fill the gaps | Strength complementarity |
| M4 Vision | "The Vision Vacuum" — team lost its direction | Tuckman stage + vision principles |
| M5 D&I | "The Out-Group" — hidden exclusion pattern in a team | Inclusion component mapping |
| M6 Ethics | "The Power Play" — leader using coercive power disguised as reward | Power base detection + Pillars of Character |

---

## Wow Moments (Demo-Ready for March 18)

1. **Globe goes dark → crisis pulse from Southeast Asia** — immediate dramatic visual
2. **Student role cards deal like playing cards** — everyone gets their role simultaneously
3. **Professor injects mid-scenario twist** — class reacts in real time, globe shifts
4. **AI outcome reads: "The class chose empathy over efficiency — here's what happened"** — projected on screen
5. **Decision arc map** shows who sided with whom across the globe — visual revelation of class consensus

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Extended thinking takes 15-30s | Show "world model is simulating..." with globe animation — the delay *feels* dramatic |
| Students disengage during waiting | Broadcast partial outcomes as they're generated (streaming) |
| Scenarios feel repetitive | AI-generated scenarios unique to each class session using class data |
| Students game the system (find "right" answer) | No right answer — AI evaluates *reasoning quality*, not choice |
| Professor loses control of narrative | GM console "pause" button always available; scenario can be abandoned |

---

## Priority Build Order

1. ✅ **Phase 1**: Globe theater mode (visual transforms), 1 pre-built scenario, text decisions, simple outcome broadcast
2. **Phase 2**: Role assignment, 90-second timer, Arc decision map
3. **Phase 3**: AI scenario generation, branching narrative, voice input
4. **Phase 4**: GM console, extended thinking consequence simulation, personalized debrief
5. **Phase 5**: Full scenario library (20+ scenarios), custom scenario builder UI for professors
