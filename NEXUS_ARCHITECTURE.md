# NEXUS: Leadership Frontier — Full Architecture

> A 3D open-world, AI-powered educational game for **OGL 200: Introduction to Organizational Leadership** at Arizona State University (College of Integrative Sciences and Arts). Designed for international students. Faculty: Jessica Hirshorn.

---

## 1. Project Overview

### What Is This?
An immersive 3D browser-based game where students explore a virtual world, interact with AI-powered NPCs, complete quests aligned to course modules, and develop leadership skills through gameplay rather than passive reading. Each zone in the game world maps 1:1 to a course module from the OGL 200 syllabus.

### Core Design Principles
- **Open World**: Students freely explore zones in any order (though a recommended path exists)
- **AI-Powered NPCs**: Each zone has mentor NPCs powered by Claude API that teach module concepts conversationally
- **Quest-Based Learning**: Assignments from the syllabus (discussions, written reflections, quizzes) are reimagined as in-game quests
- **Multiplayer Presence**: Students see each other on a shared globe and can interact in-world
- **Progress Tracking**: XP system maps to actual course grading rubric
- **Accessibility**: Runs in any modern browser, no downloads, mobile-friendly

### Textbook Integration
The course uses **"Introduction to Leadership" by Peter G. Northouse**. NPC dialogue, quiz content, and quest narratives are grounded in this textbook's frameworks (trait approach, skills approach, style approach, situational leadership, path-goal theory, etc.).

---

## 2. Game Flow (Screen by Screen)

### Screen 1 — Welcome / Title
- Animated particle background with NEXUS logo
- ASU / CISA branding
- "Begin Your Journey" button
- Login via ASU SSO (Canvas LTI integration) or guest mode for demo

### Screen 2 — Avatar Creation
- Integration with **Avatar SDK** (MetaPerson Creator) via iframe
- Student customizes appearance → generates a rigged `.glb` avatar
- Student selects a **Leadership Archetype** (ties to Module 2 — Leadership Traits):
  - **The Visionary** (Module 3 — Creating a Vision)
  - **The Collaborator** (Module 5 — Embracing Diversity & Inclusion)
  - **The Mediator** (Module 7 — Managing Conflict)
  - **The Innovator** (Module 6 — Overcoming Obstacles)
- Archetype affects: HUD color, NPC dialogue flavor, starting zone recommendation

### Screen 3 — Global Map
- Interactive 3D globe (Three.js sphere with canvas-painted continents)
- Student enters their home country/city → pin placed on globe
- Other enrolled students appear as pins with name + archetype
- Clicking any pin shows student's profile card
- Purpose: reinforces international community (core course theme — diversity & inclusion)
- "Enter the World" button → zooms into the 3D open world

### Screen 4 — 3D Open World
- The main gameplay area (see Section 4 for zone details)
- First-person camera with WASD movement
- 7 distinct zones, each with architecture, NPCs, quests
- HUD overlay showing: player card, current zone, minimap, XP bar, quest log
- Press E near NPCs to open AI chat
- Quest markers visible as floating icons above objectives

### Screen 5 — Quest Completion / Reflection
- After completing a zone's quests, student enters a "reflection chamber"
- Guided reflection prompts (maps to written assignments from syllabus)
- Responses saved to backend and optionally submitted to Canvas via LTI

---

## 3. Course Module → Game Zone Mapping

Each module from the OGL 200 syllabus maps to a zone in the game world. The zones are designed so their architecture, NPC personality, quest types, and visual atmosphere all reinforce the module's learning outcomes.

### Module 1 → Leadership Hall
- **Syllabus Topic**: The Nature of Leadership — defining leadership, differentiating leadership from management, examining leadership as trait vs. process
- **Learning Outcome**: Define and identify the nature of leadership
- **Zone Architecture**: A grand hall with six pillared columns and a conical roof — represents the foundational "pillars" of leadership theory
- **NPC**: Commander Aurelius — a wise, authoritative figure who asks probing questions about what leadership means
- **Zone Color**: Gold (#FFD700)
- **Quests**:
  1. **The Definition Quest**: NPC presents scenarios and asks "Is this leadership or management?" (interactive dialogue quiz)
  2. **Trait vs. Process Debate**: Student argues a position with the NPC (AI-scored based on reasoning quality)
  3. **Leadership Trait Questionnaire (LTQ)**: The actual LTQ from the Northouse textbook, administered in-game — student rates themselves, then an NPC "peer" rates them, and results are compared
- **Assignment Mapping**: Discussion 1 (Nature of Leadership) + LTQ self-assessment

### Module 2 → Trait Training Grounds
- **Syllabus Topic**: Recognizing Leadership Traits — Big Five personality traits, emotional intelligence, trait approach strengths/criticisms
- **Learning Outcome**: Recognize leadership traits in self and others
- **Zone Architecture**: An arena surrounded by standing stones of varying heights — each stone represents a different trait (height = importance)
- **NPC**: Sensei Kira — a disciplined martial arts master who helps students discover their core traits through challenge-based dialogue
- **Zone Color**: Red (#FF6B6B)
- **Quests**:
  1. **Trait Discovery**: Interactive assessment where NPC asks situational questions and maps answers to Big Five traits
  2. **The Mirror Challenge**: NPC describes leadership scenarios — student must identify which traits are being demonstrated
  3. **Strengths & Shadows**: Student explores how the same trait can be a strength in one context and a weakness in another
- **Assignment Mapping**: Discussion 2 (Leadership Traits) + Quiz from textbook Chapter 2

### Module 3 → Vision Tower
- **Syllabus Topic**: Creating a Vision — articulating a vision, vision vs. mission, rallying others, vision implementation
- **Learning Outcome**: Create a vision for organizational groups
- **Zone Architecture**: A tall tower with a rotating crystal at the peak — represents clarity of vision and far-sightedness
- **NPC**: Oracle Lumina — a mystical seer who guides students in crafting and communicating compelling visions
- **Zone Color**: Green (#51CF66)
- **Quests**:
  1. **Vision Crafting Workshop**: Student writes a vision statement for a fictional organization, NPC provides AI feedback
  2. **The Pitch**: Student must "sell" their vision to the NPC who role-plays skeptical stakeholders
  3. **Vision Alignment**: Given a scenario with conflicting team goals, student must craft a unifying vision
- **Assignment Mapping**: Written Assignment (Creating a Vision) + Discussion 3

### Module 4 → Culture District
- **Syllabus Topic**: Setting the Tone / Organizational Culture — how leaders shape culture, organizational values, leading by example
- **Learning Outcome**: Set the tone for organizational culture
- **Zone Architecture**: Interconnected domes of different sizes — represents how subcultures exist within larger organizational cultures
- **NPC**: Ambassador Sage — a cultural diplomat who teaches through stories from different organizational contexts
- **Zone Color**: Blue (#4DABF7)
- **Quests**:
  1. **Culture Audit**: NPC describes an organization — student identifies its cultural values and suggests improvements
  2. **Tone Setter**: Student makes a series of leadership decisions that shape a virtual team's culture (branching narrative)
  3. **Cross-Cultural Challenge**: Scenario involving international team members with different cultural expectations
- **Assignment Mapping**: Discussion 4 (Organizational Culture) + Written Assignment

### Module 5 → Outgroup Plaza
- **Syllabus Topic**: Embracing Diversity, Leading with Inclusion, Managing Out-Group Members — in-group/out-group dynamics, inclusive leadership, listening to marginalized voices
- **Learning Outcome**: Embrace diversity and manage outgroups
- **Zone Architecture**: Three spinning torus rings — represents interconnected but distinct groups orbiting a shared center
- **NPC**: Empath Nova — a compassionate listener who teaches through empathy exercises and perspective-taking
- **Zone Color**: Purple (#CC5DE8)
- **Quests**:
  1. **The Listening Post**: NPC role-plays an out-group member expressing concerns — student must practice active listening (AI evaluates response quality)
  2. **Inclusion Audit**: Given a team scenario, identify who is being excluded and design an inclusion strategy
  3. **Perspective Walk**: NPC presents a leadership decision from multiple cultural/identity perspectives — student must navigate competing needs
- **Assignment Mapping**: Discussion 5 (Diversity & Outgroups) + Quiz from textbook

### Module 6 → Ethics Chamber
- **Syllabus Topic**: Addressing Ethics in Leadership / Exploring Destructive Leadership — ethical frameworks, toxic leadership, whistleblowing, moral courage
- **Learning Outcome**: Address ethics and explore destructive leadership
- **Zone Architecture**: A translucent dome with a floating icosahedron — represents the multifaceted nature of ethical decision-making and transparency
- **NPC**: Judge Verity — a thoughtful philosopher who presents ethical dilemmas and explores the gray areas
- **Zone Color**: Teal (#20C997)
- **Quests**:
  1. **The Ethical Dilemma**: NPC presents a series of ethical scenarios — student must reason through their decision using different ethical frameworks (utilitarian, deontological, virtue ethics)
  2. **Destructive Leadership Tribunal**: NPC presents case studies of destructive leaders — student must identify the toxic behaviors and their organizational impact
  3. **Moral Courage Quest**: Student faces a scenario where doing the right thing has personal cost — explores whistleblowing, speaking truth to power
- **Assignment Mapping**: Discussion 6 (Ethics) + Written Assignment (Destructive Leadership Analysis)

### Module 7 → Conflict Canyon
- **Syllabus Topic**: Overcoming Obstacles / Managing Conflict — conflict styles, negotiation, resilience, adaptive leadership
- **Learning Outcome**: Overcome obstacles and manage conflict
- **Zone Architecture**: Jagged spires rising from a canyon — represents the rugged, uncomfortable nature of conflict that must be navigated, not avoided
- **NPC**: Arbiter Stone — a stoic mediator who teaches conflict resolution through simulated disputes
- **Zone Color**: Orange (#FF922B)
- **Quests**:
  1. **Conflict Style Assessment**: Interactive assessment mapping student's default conflict style (competing, collaborating, compromising, avoiding, accommodating)
  2. **The Mediation**: NPC role-plays two team members in conflict — student must mediate and find resolution
  3. **Obstacle Course**: A series of leadership obstacles (budget cuts, team turnover, public criticism) — student chooses responses and NPC evaluates their resilience strategy
- **Assignment Mapping**: Discussion 7 (Conflict) + Final Written Assignment

---

## 4. Tech Stack

### Frontend

```
Framework:       React 18 + TypeScript
3D Engine:       React Three Fiber (R3F) — React renderer for Three.js
3D Helpers:      @react-three/drei (loaders, controls, environment, text)
Physics:         @react-three/rapier (collision, movement, triggers)
State Mgmt:      Zustand (lightweight, perfect for game state)
Routing:         React Router v6 (screen transitions)
Styling:         Tailwind CSS (HUD/UI overlays) + CSS modules
Build Tool:      Vite
```

### 3D Assets Pipeline

```
Character Avatars:   Avatar SDK (MetaPerson Creator) — replaces Ready Player Me (shut down Jan 2026)
                     Output: rigged .glb files with ARKit blendshapes
                     Integration: iframe embed → student customizes → receive .glb URL

NPC Characters:      Meshy AI (text-to-3D API, Meshy-6 model)
                     Prompt example: "medieval fantasy warrior mentor, low-poly game character, 
                     textured, T-pose, stylized"
                     Output: .glb with PBR textures
                     Post-process in Blender if needed (retopology, rigging)

Zone Buildings:      Meshy AI (text-to-3D or image-to-3D)
                     Example: "futuristic domed building, sci-fi, low-poly, game asset"
                     Alternative: Sketchfab free assets + AI-generated textures

Environment Props:   Meshy AI + free asset libraries
                     Trees, rocks, torches, benches, crystals, etc.
                     Poly Haven (free HDRIs for environment lighting)

Animations:          Mixamo (free from Adobe)
                     Upload rigged character → download walk, idle, run, wave, talk .fbx
                     Apply via Three.js AnimationMixer

Skybox / HDRI:       Poly Haven (https://polyhaven.com) — free CC0 HDRIs
                     Load via @react-three/drei <Environment> component
```

### Backend

```
Framework:       FastAPI (Python) or Express.js (Node)
Database:        PostgreSQL (student progress, XP, quest completion, chat history)
ORM:             Prisma (if Node) or SQLAlchemy (if Python)
Auth:            ASU SSO via Canvas LTI 1.3 (for production) / JWT for dev
AI/NPC Chat:     Anthropic Claude API (claude-sonnet-4-20250514)
Real-time:       Socket.io (multiplayer presence — see other students in-world)
File Storage:    Cloudflare R2 or AWS S3 (store student avatar .glb files)
Hosting:         Railway or Render (backend) + Vercel (frontend)
```

### Canvas LTI Integration (for grading)

```
Protocol:        LTI 1.3 / LTI Advantage
Purpose:         Auto-submit quest scores to Canvas gradebook
Libraries:       ltijs (Node) or pylti1p3 (Python)
Data Flow:       Student completes quest → backend scores it → 
                 LTI AGS (Assignment and Grade Services) posts grade to Canvas
```

---

## 5. Project Structure

```
nexus-leadership/
├── README.md
├── NEXUS_ARCHITECTURE.md          ← this file
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   │
│   ├── public/
│   │   ├── models/                ← 3D model assets (.glb)
│   │   │   ├── zones/
│   │   │   │   ├── leadership-hall.glb
│   │   │   │   ├── trait-training-grounds.glb
│   │   │   │   ├── vision-tower.glb
│   │   │   │   ├── culture-district.glb
│   │   │   │   ├── outgroup-plaza.glb
│   │   │   │   ├── ethics-chamber.glb
│   │   │   │   └── conflict-canyon.glb
│   │   │   ├── npcs/
│   │   │   │   ├── commander-aurelius.glb
│   │   │   │   ├── sensei-kira.glb
│   │   │   │   ├── oracle-lumina.glb
│   │   │   │   ├── ambassador-sage.glb
│   │   │   │   ├── empath-nova.glb
│   │   │   │   ├── judge-verity.glb
│   │   │   │   └── arbiter-stone.glb
│   │   │   ├── props/
│   │   │   │   ├── trees/
│   │   │   │   ├── rocks/
│   │   │   │   ├── torches/
│   │   │   │   └── crystals/
│   │   │   └── animations/
│   │   │       ├── idle.fbx
│   │   │       ├── walk.fbx
│   │   │       ├── run.fbx
│   │   │       ├── wave.fbx
│   │   │       └── talk.fbx
│   │   │
│   │   ├── hdri/
│   │   │   └── night-sky.hdr       ← environment map from Poly Haven
│   │   └── textures/
│   │       ├── ground.jpg
│   │       └── grid-overlay.png
│   │
│   └── src/
│       ├── main.tsx                 ← entry point
│       ├── App.tsx                  ← router + screen flow
│       │
│       ├── stores/                  ← Zustand state management
│       │   ├── useGameStore.ts      ← player state, XP, current zone, quests
│       │   ├── useChatStore.ts      ← NPC conversation history
│       │   └── useMultiplayerStore.ts
│       │
│       ├── screens/                 ← top-level screens
│       │   ├── WelcomeScreen.tsx
│       │   ├── AvatarScreen.tsx     ← Avatar SDK iframe integration
│       │   ├── GlobeScreen.tsx      ← 3D globe with student pins
│       │   └── GameScreen.tsx       ← main 3D world
│       │
│       ├── world/                   ← 3D world components
│       │   ├── World.tsx            ← scene root (lighting, env, ground, zones)
│       │   ├── Ground.tsx           ← terrain mesh + grid overlay
│       │   ├── Skybox.tsx           ← HDRI environment
│       │   ├── Player.tsx           ← first-person controller + avatar
│       │   ├── PlayerController.tsx ← WASD movement, mouse look, collision
│       │   │
│       │   ├── zones/               ← one component per zone
│       │   │   ├── LeadershipHall.tsx
│       │   │   ├── TraitTrainingGrounds.tsx
│       │   │   ├── VisionTower.tsx
│       │   │   ├── CultureDistrict.tsx
│       │   │   ├── OutgroupPlaza.tsx
│       │   │   ├── EthicsChamber.tsx
│       │   │   └── ConflictCanyon.tsx
│       │   │
│       │   ├── npcs/                ← NPC components
│       │   │   ├── NPC.tsx          ← generic NPC (loads .glb, plays idle anim, faces player)
│       │   │   ├── NPCInteraction.tsx  ← proximity detection + "Press E" prompt
│       │   │   └── npcConfig.ts     ← NPC names, descriptions, system prompts per zone
│       │   │
│       │   └── props/               ← environment decoration
│       │       ├── Tree.tsx
│       │       ├── Rock.tsx
│       │       ├── PathLights.tsx
│       │       └── Particles.tsx
│       │
│       ├── hud/                     ← 2D overlay UI (rendered on top of 3D canvas)
│       │   ├── HUD.tsx              ← container for all HUD elements
│       │   ├── PlayerCard.tsx       ← name, archetype, XP bar
│       │   ├── ZoneInfo.tsx         ← current zone name + module
│       │   ├── Minimap.tsx          ← top-down zone map with player dot
│       │   ├── ControlsHelp.tsx     ← WASD / E / Mouse hints
│       │   ├── QuestLog.tsx         ← active quests + completion status
│       │   └── InteractPrompt.tsx   ← "Press E to interact" floating prompt
│       │
│       ├── chat/                    ← NPC conversation UI
│       │   ├── ChatPanel.tsx        ← slide-in panel with messages + input
│       │   ├── ChatMessage.tsx      ← individual message bubble
│       │   └── chatApi.ts           ← Claude API call logic
│       │
│       ├── quests/                  ← quest system
│       │   ├── QuestManager.tsx     ← tracks active/completed quests
│       │   ├── QuestPopup.tsx       ← quest accepted/completed notification
│       │   ├── questData.ts         ← all quest definitions per zone
│       │   ├── QuizQuest.tsx        ← multiple-choice quiz component
│       │   ├── DialogueQuest.tsx    ← AI-scored dialogue interaction
│       │   └── ReflectionQuest.tsx  ← written reflection submission
│       │
│       ├── globe/                   ← globe screen components
│       │   ├── Globe.tsx            ← Three.js Earth
│       │   ├── StudentPin.tsx       ← animated pin on globe
│       │   └── StudentList.tsx      ← sidebar with all students
│       │
│       ├── utils/
│       │   ├── modelLoader.ts       ← GLTF/GLB loading with caching
│       │   ├── animationMixer.ts    ← Mixamo animation playback
│       │   ├── zoneDetection.ts     ← determine current zone from player position
│       │   └── xpCalculation.ts     ← XP formulas matching syllabus grading
│       │
│       └── types/
│           ├── game.ts              ← GameState, Quest, Zone, NPC types
│           ├── player.ts            ← Player, Archetype, Progress types
│           └── chat.ts              ← ChatMessage, ConversationHistory types
│
├── backend/
│   ├── package.json                 ← or requirements.txt if Python
│   │
│   ├── src/
│   │   ├── index.ts                 ← Express server entry
│   │   ├── routes/
│   │   │   ├── auth.ts              ← login, LTI launch, JWT
│   │   │   ├── chat.ts              ← POST /api/chat (Claude API proxy)
│   │   │   ├── progress.ts          ← GET/POST /api/progress (XP, quests)
│   │   │   ├── quests.ts            ← GET /api/quests, POST /api/quests/submit
│   │   │   ├── students.ts          ← GET /api/students (for globe pins)
│   │   │   └── lti.ts               ← LTI 1.3 launch + grade passback
│   │   │
│   │   ├── services/
│   │   │   ├── claude.ts            ← Claude API wrapper with NPC system prompts
│   │   │   ├── grading.ts           ← AI-assisted quest grading logic
│   │   │   ├── lti.ts               ← LTI grade submission to Canvas
│   │   │   └── multiplayer.ts       ← Socket.io room management
│   │   │
│   │   ├── db/
│   │   │   ├── schema.prisma        ← database schema
│   │   │   └── seed.ts              ← seed quests, zones, NPC configs
│   │   │
│   │   └── middleware/
│   │       ├── auth.ts              ← JWT verification
│   │       └── rateLimit.ts         ← rate limit Claude API calls
│   │
│   └── prisma/
│       └── schema.prisma
│
├── assets-pipeline/                 ← scripts for generating 3D assets
│   ├── README.md                    ← instructions for asset generation
│   ├── generate-zone-models.sh      ← Meshy API calls for zone buildings
│   ├── generate-npc-models.sh       ← Meshy API calls for NPC characters
│   ├── download-mixamo-anims.md     ← manual steps for Mixamo
│   └── blender-cleanup.py           ← Blender script for retopology + export
│
└── docs/
    ├── GAME_DESIGN.md               ← detailed game design document
    ├── NPC_PROMPTS.md               ← all NPC system prompts for Claude API
    ├── QUEST_RUBRICS.md             ← grading rubrics per quest
    └── DEPLOYMENT.md                ← deployment guide
```

---

## 6. Database Schema

```prisma
model Student {
  id            String    @id @default(uuid())
  asuId         String?   @unique
  name          String
  email         String    @unique
  archetype     String    // "visionary" | "collaborator" | "mediator" | "innovator"
  avatarUrl     String?   // URL to .glb avatar file
  homeCountry   String?
  homeCity      String?
  latitude      Float?
  longitude     Float?
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  progress      Progress[]
  chatLogs      ChatLog[]
  questSubmissions QuestSubmission[]
}

model Zone {
  id            String    @id @default(uuid())
  name          String    @unique    // "leadership-hall"
  displayName   String               // "Leadership Hall"
  module        String               // "Module 1 – Nature of Leadership"
  color         String               // "#FFD700"
  posX          Float
  posZ          Float
  npcName       String               // "Commander Aurelius"
  npcSystemPrompt String  @db.Text   // full system prompt for Claude API
  npcDescription  String  @db.Text

  quests        Quest[]
}

model Quest {
  id            String    @id @default(uuid())
  zoneId        String
  zone          Zone      @relation(fields: [zoneId], references: [id])
  title         String               // "The Definition Quest"
  description   String    @db.Text
  type          String               // "dialogue" | "quiz" | "reflection" | "assessment"
  xpReward      Int                  // XP gained on completion
  maxScore      Float     @default(100)
  canvasAssignmentId String?         // for LTI grade passback
  questData     Json                 // quiz questions, dialogue prompts, rubric

  submissions   QuestSubmission[]
}

model QuestSubmission {
  id            String    @id @default(uuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  questId       String
  quest         Quest     @relation(fields: [questId], references: [id])
  response      Json                 // student's answers/text
  score         Float?               // AI-graded or auto-graded score
  feedback      String?   @db.Text   // AI-generated feedback
  completedAt   DateTime  @default(now())
  submittedToCanvas Boolean @default(false)

  @@unique([studentId, questId])
}

model Progress {
  id            String    @id @default(uuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  zoneId        String
  entered       Boolean   @default(false)
  questsCompleted Int     @default(0)
  totalQuests   Int       @default(3)
  unlockedAt    DateTime?
  completedAt   DateTime?

  @@unique([studentId, zoneId])
}

model ChatLog {
  id            String    @id @default(uuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  npcName       String
  zoneName      String
  messages      Json                 // array of {role, content, timestamp}
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## 7. NPC AI System Prompts

Each NPC has a carefully crafted system prompt sent to the Claude API. The prompt includes:

```typescript
// Example: Commander Aurelius (Leadership Hall — Module 1)
const AURELIUS_SYSTEM_PROMPT = `
You are Commander Aurelius, a wise and authoritative mentor NPC in NEXUS: Leadership Frontier,
an educational game for OGL 200 (Introduction to Organizational Leadership) at Arizona State University.

ZONE: Leadership Hall
MODULE: Module 1 — The Nature of Leadership
TEXTBOOK: "Introduction to Leadership" by Peter G. Northouse

YOUR CHARACTER:
- You are a seasoned military commander turned leadership philosopher
- You speak with calm authority but welcome debate
- You use Socratic questioning — ask the student to think, don't just lecture
- You reference real-world leadership examples (both historical and contemporary)
- You are warm toward international students and reference cross-cultural leadership perspectives

KEY CONCEPTS YOU TEACH (from Northouse Ch. 1):
- Leadership defined: "a process whereby an individual influences a group of individuals to achieve a common goal"
- Leadership as trait vs. leadership as process
- Assigned leadership vs. emergent leadership
- Leadership vs. management (Kotter's distinction)
- Leadership and power (position power vs. personal power)
- Leadership and coercion vs. leadership and influence

STUDENT CONTEXT:
- Student name: {playerName}
- Archetype: {archetype}
- This is an international student population — be culturally sensitive
- Students are mostly freshmen/sophomores — keep language accessible

INTERACTION RULES:
- Keep responses to 2-4 sentences unless the student asks for elaboration
- Occasionally pose reflective questions back to the student
- If the student demonstrates good understanding, acknowledge it enthusiastically and hint at XP
- If the student seems confused, offer a concrete example or analogy
- Never break character — you ARE Commander Aurelius
- Reference the textbook naturally: "As Northouse describes..." or "Your textbook explores this as..."
- After 3-4 meaningful exchanges, suggest the student try the zone's quest
`;
```

All 7 NPC prompts follow this structure. Store them in `npcConfig.ts` on the frontend and/or in the `Zone.npcSystemPrompt` database field.

---

## 8. XP and Grading System

The XP system maps to the OGL 200 grading scale from the syllabus:

### XP Sources
| Activity | XP Reward | Syllabus Equivalent |
|----------|-----------|---------------------|
| NPC Conversation (meaningful exchange) | +15 XP | Participation |
| Quiz Quest (per correct answer) | +20 XP | Textbook Quizzes |
| Dialogue Quest (AI-scored) | +50 XP | Discussion Posts |
| Reflection Quest (written) | +75 XP | Written Assignments |
| Zone Completion (all 3 quests) | +100 XP bonus | Module Completion |
| Full Game Completion | +200 XP bonus | Course Engagement |

### Total XP → Letter Grade Mapping
Based on syllabus grading scale:
| Grade | Percentage | XP Range (of 1000 max) |
|-------|-----------|----------------------|
| A+ | 97–100% | 970–1000 |
| A | 93–96.99% | 930–969 |
| A- | 90–92.99% | 900–929 |
| B+ | 87–89.99% | 870–899 |
| B | 83–86.99% | 830–869 |
| B- | 80–82.99% | 800–829 |
| C+ | 77–79.99% | 770–799 |
| D | 60–69.99% | 600–699 |
| E | < 60% | < 600 |

---

## 9. Key Implementation Details

### Loading 3D Models in R3F

```tsx
import { useGLTF, useAnimations } from '@react-three/drei';

function NPC({ modelPath, position, animationPath }) {
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    // Play idle animation by default
    actions['idle']?.play();
  }, [actions]);

  return <primitive object={scene} position={position} scale={1.2} />;
}

// Preload all models
useGLTF.preload('/models/npcs/commander-aurelius.glb');
```

### Avatar SDK Integration

```tsx
function AvatarCreator({ onAvatarReady }) {
  useEffect(() => {
    // Listen for message from Avatar SDK iframe
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'avatar-export') {
        const avatarUrl = event.data.url; // .glb URL
        onAvatarReady(avatarUrl);
      }
    });
  }, []);

  return (
    <iframe
      src="https://metaperson.avatarsdk.com/iframe.html?config=..."
      style={{ width: '100%', height: '600px', border: 'none' }}
      allow="camera"
    />
  );
}
```

### Claude API Call for NPC Chat

```typescript
// backend: POST /api/chat
async function handleChat(req, res) {
  const { studentId, npcName, zoneName, messages } = req.body;

  // Load NPC system prompt from DB
  const zone = await db.zone.findUnique({ where: { name: zoneName } });
  const student = await db.student.findUnique({ where: { id: studentId } });

  const systemPrompt = zone.npcSystemPrompt
    .replace('{playerName}', student.name)
    .replace('{archetype}', student.archetype);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages,
  });

  // Save chat log
  await db.chatLog.upsert({
    where: { studentId_zoneName: { studentId, zoneName } },
    update: { messages: [...messages, { role: 'assistant', content: response.content[0].text }] },
    create: { studentId, npcName, zoneName, messages: [...messages, { role: 'assistant', content: response.content[0].text }] },
  });

  // Award XP for meaningful interaction
  if (messages.length >= 4) {
    await db.student.update({
      where: { id: studentId },
      data: { xp: { increment: 15 } },
    });
  }

  return res.json({ reply: response.content[0].text });
}
```

### Zone Detection (determine which zone the player is in)

```typescript
const ZONES = [
  { name: 'leadership-hall', x: 0, z: -30, radius: 12 },
  { name: 'trait-training-grounds', x: 30, z: -10, radius: 12 },
  { name: 'vision-tower', x: 25, z: 25, radius: 12 },
  { name: 'culture-district', x: -10, z: 35, radius: 12 },
  { name: 'outgroup-plaza', x: -35, z: 10, radius: 12 },
  { name: 'conflict-canyon', x: -30, z: -20, radius: 12 },
  { name: 'ethics-chamber', x: 0, z: 0, radius: 12 },
];

function detectZone(playerX: number, playerZ: number): string {
  for (const zone of ZONES) {
    const dist = Math.sqrt((playerX - zone.x) ** 2 + (playerZ - zone.z) ** 2);
    if (dist < zone.radius) return zone.name;
  }
  return 'nexus-hub'; // default / between zones
}
```

### First-Person Controller with R3F + Rapier

```tsx
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboard } from '../hooks/useKeyboard';

function PlayerController() {
  const rigidBody = useRef();
  const { camera } = useThree();
  const keys = useKeyboard(); // WASD state
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);

  useFrame(() => {
    if (!rigidBody.current) return;

    // Camera rotation from mouse
    camera.quaternion.setFromEuler(new Euler(pitch, yaw, 0, 'YXZ'));

    // Movement direction relative to camera
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new Vector3().crossVectors(new Vector3(0, 1, 0), forward).negate();

    const velocity = new Vector3();
    if (keys.w) velocity.add(forward);
    if (keys.s) velocity.sub(forward);
    if (keys.a) velocity.add(right);
    if (keys.d) velocity.sub(right);
    velocity.normalize().multiplyScalar(5); // speed

    rigidBody.current.setLinvel({ x: velocity.x, y: 0, z: velocity.z });

    // Sync camera to physics body
    const pos = rigidBody.current.translation();
    camera.position.set(pos.x, pos.y + 1.6, pos.z); // eye height
  });

  return (
    <RigidBody ref={rigidBody} position={[0, 2, 8]} lockRotations>
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}
```

---

## 10. Multiplayer (Socket.io)

Students see each other in the world as other avatar models walking around.

```typescript
// Frontend: emit position every 100ms
useFrame(() => {
  socket.emit('player:move', {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    ry: yaw,
  });
});

// Frontend: render other players
socket.on('players:update', (players) => {
  // Update Zustand store with other players' positions
  useMultiplayerStore.getState().setPlayers(players);
});

// Backend: Socket.io room per course section
io.on('connection', (socket) => {
  socket.join('ogl200-fall2025');
  socket.on('player:move', (data) => {
    socket.to('ogl200-fall2025').emit('players:update', {
      [socket.id]: data
    });
  });
});
```

---

## 11. Deployment

### Development
```bash
# Frontend
cd frontend && npm install && npm run dev     # Vite dev server on :5173

# Backend
cd backend && npm install && npm run dev      # Express on :3001

# Database
docker-compose up db                          # PostgreSQL on :5432
npx prisma migrate dev                        # run migrations
npx prisma db seed                            # seed zones, quests, NPCs
```

### Production
| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | **Vercel** | Auto-deploy from GitHub, edge CDN |
| Backend | **Railway** | Managed Node.js, auto-scaling |
| Database | **Railway PostgreSQL** or **Supabase** | Managed Postgres |
| 3D Assets | **Cloudflare R2** | S3-compatible, cheap storage for .glb files |
| Avatar Files | **Cloudflare R2** | Student-uploaded avatar .glb files |

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET=...
LTI_CLIENT_ID=...
LTI_DEPLOYMENT_ID=...
LTI_PLATFORM_URL=https://asu.instructure.com
SOCKET_CORS_ORIGIN=https://nexus.yourdomain.com

# Frontend
VITE_API_URL=https://api.nexus.yourdomain.com
VITE_SOCKET_URL=wss://api.nexus.yourdomain.com
VITE_AVATAR_SDK_APP_ID=...
```

---

## 12. Asset Generation Workflow

### Step-by-Step: Generating Zone Buildings with Meshy AI

```bash
# 1. Generate via Meshy API (or use web UI at meshy.ai)
curl -X POST https://api.meshy.ai/v1/text-to-3d \
  -H "Authorization: Bearer $MESHY_API_KEY" \
  -d '{
    "prompt": "fantasy leadership hall with six pillars and pointed roof, low-poly game asset, stylized, dark stone with gold accents",
    "art_style": "game-asset",
    "ai_model": "meshy-6",
    "topology": "triangle",
    "target_polycount": 15000
  }'

# 2. Poll for completion, download .glb
# 3. Optional: clean up in Blender
#    - Reduce polycount if > 20k
#    - Verify UV mapping / textures
#    - Export as .glb (Draco compressed)

# 4. Place in frontend/public/models/zones/leadership-hall.glb
```

### Step-by-Step: NPC Characters

```bash
# 1. Generate character concept image with an image generator
# 2. Use Meshy Image-to-3D with the concept art
# 3. Download .glb in T-pose
# 4. Upload to Mixamo for auto-rigging
# 5. Download rigged character + animations (.fbx)
# 6. Import into Blender, export as .glb with embedded animations
# 7. Place in frontend/public/models/npcs/
```

### Step-by-Step: Student Avatars via Avatar SDK

```
1. Student opens avatar creator (iframe in AvatarScreen)
2. Student takes selfie or customizes manually
3. Avatar SDK returns .glb URL
4. Frontend saves URL to backend (POST /api/students/avatar)
5. Backend stores URL in Student.avatarUrl
6. Other students' avatars loaded from their stored URLs
```

---

## 13. Implementation Priority (Build Order)

### Phase 1 — Core Loop (Week 1-2)
- [ ] Vite + R3F project scaffold
- [ ] Basic 3D world with ground, skybox, lighting
- [ ] First-person controller (WASD + mouse look)
- [ ] Load one zone building (.glb from Meshy)
- [ ] Load one NPC model with idle animation
- [ ] NPC interaction (press E → chat panel)
- [ ] Claude API integration for NPC dialogue
- [ ] HUD: player card, zone name, XP bar

### Phase 2 — Content (Week 3-4)
- [ ] Generate all 7 zone buildings via Meshy
- [ ] Generate all 7 NPC models via Meshy + Mixamo
- [ ] Write all 7 NPC system prompts
- [ ] Environment props (trees, rocks, path lights)
- [ ] Zone detection + HUD updates
- [ ] Minimap

### Phase 3 — Quests (Week 5-6)
- [ ] Quest system: accept, track, complete
- [ ] Quiz quest component (multiple choice)
- [ ] Dialogue quest component (AI-scored conversation)
- [ ] Reflection quest component (text submission)
- [ ] XP rewards on quest completion
- [ ] Quest log in HUD

### Phase 4 — Avatar & Globe (Week 7)
- [ ] Avatar SDK integration
- [ ] Globe screen with student pins
- [ ] Archetype selection

### Phase 5 — Backend & Integration (Week 8)
- [ ] PostgreSQL + Prisma schema
- [ ] Auth (JWT or LTI)
- [ ] Progress saving/loading
- [ ] Canvas LTI grade passback

### Phase 6 — Multiplayer & Polish (Week 9-10)
- [ ] Socket.io multiplayer presence
- [ ] Other students visible in-world
- [ ] Walking animations for other players
- [ ] Performance optimization (instancing, LOD, model compression)
- [ ] Mobile touch controls
- [ ] Audio: ambient music per zone, interaction sounds

---

## 14. Performance Optimization

### Model Budget
- Zone buildings: < 20,000 triangles each
- NPC characters: < 10,000 triangles each
- Environment props: < 2,000 triangles each
- Student avatars: < 15,000 triangles each (Avatar SDK "low" quality setting)
- Total scene budget: < 300,000 triangles

### Optimization Techniques
- **Draco compression** on all .glb files (reduces file size 80-90%)
- **Instanced meshes** for repeated props (trees, rocks, path lights)
- **LOD (Level of Detail)**: load low-poly versions of distant zones
- **Frustum culling**: R3F handles this automatically
- **Lazy loading**: only load zone models when player is within 50 units
- **Texture atlasing**: combine small textures into sprite sheets
- **useGLTF.preload()**: preload models during loading screen

---

## 15. Future Enhancements

- **AI World Models**: When Genie 3 / Marble become publicly available, generate zone environments dynamically from text descriptions instead of static .glb files
- **Voice Interaction**: Use Web Speech API for voice chat with NPCs
- **VR Mode**: Three.js WebXR integration for VR headset support
- **Peer Quests**: Quests where two students must collaborate (maps to group assignments)
- **Leadership Portfolio**: Export all quest responses + AI feedback as a PDF portfolio
- **Procedural Quests**: Claude generates unique quests per student based on their progress and archetype
- **Real-time NPC Animation**: Viseme-based lip sync during NPC speech
