# OGL 200 3D Game Architecture Diagram

This document turns the recommended OGL 200 game stack into a concrete implementation architecture.

## Recommended Stack

- 3D client: `Babylon.js + TypeScript`
- App/backend: `Node.js + Express or Fastify`
- Realtime sync: `Socket.IO`
- LMS integration: `LTI 1.3`
- Database: `Postgres`
- Object storage: `S3 / Cloudflare R2 / equivalent`
- Avatars: `Managed avatar provider or preset GLB avatars`
- Character animations: `Mixamo`
- AI: `Claude or OpenAI`
- Asset format: `.glb / glTF`
- Optional later: `Blender` for asset editing and custom world building

## Avatar Strategy

Use a small preset avatar library for the MVP.

- prepare `8 to 20` web-optimized humanoid `.glb` avatars
- let students choose one during first-run onboarding
- store `avatar_id` in the user profile
- load that avatar in the hub, classroom scenes, and scenario rooms

This is simpler and more stable than relying on a live avatar SaaS.

## High-Level System Architecture

```mermaid
flowchart TD
    A[Canvas / LMS] --> B[LTI Launch]
    B --> B1[Avatar Selection]
    B1 --> C[Web Game Client]

    subgraph Browser[Student Browser]
        C --> D[Babylon.js 3D Runtime]
        C --> E[HTML/CSS UI Layer]
        C --> F[Avatar Loader]
        C --> G[Dialogue and Mission UI]
        C --> H[Scenario Client State]
    end

    C --> I[REST API]
    C --> J[Socket.IO Realtime]

    subgraph Backend[Node.js Backend]
        I --> K[Auth and Session Layer]
        I --> L[Game API]
        J --> M[Realtime Scenario Service]
        L --> N[Mission Engine]
        L --> O[Progress and Journal Service]
        L --> P[Avatar/Profile Service]
        L --> Q[AI Orchestration Service]
    end

    subgraph Data[Persistence]
        N --> R[(Postgres)]
        O --> R
        P --> R
        Q --> R
        L --> S[(Object Storage)]
    end

    subgraph External[External Services]
        T[Avatar Provider or Preset Avatar Library]
        U[Mixamo Animations]
        V[LLM API]
        W[Asset Library GLB Packs]
    end

    F --> T
    S --> C
    Q --> V
    W --> S
    U --> S
```

## Runtime Game Flow Architecture

```mermaid
flowchart LR
    A[LTI Launch or direct entry] --> B[Avatar Selection]
    B --> C[Globe Onboarding]
    C --> D[Leadership Profile]
    D --> E[3D Hub World]
    E --> F[Module Portal]
    F --> G[Scenario Room]
    G --> H[Mission Decisions]
    H --> I[Consequence Engine]
    I --> J[Debrief and Reflection]
    J --> K[Journal and Progress Save]
    K --> E
```

## Detailed Client-Server Architecture

```mermaid
flowchart TD
    subgraph Client[Browser Client]
        A1[Globe Scene]
        A2[Hub Scene]
        A3[Scenario Scene]
        A4[Avatar Controller]
        A5[HUD / UI]
        A6[Mission State Store]
    end

    subgraph Server[Backend Services]
        B1[LTI/Auth]
        B2[Player Profile API]
        B3[Mission API]
        B4[Scenario Realtime Room]
        B5[Rule-Based Consequence Engine]
        B6[AI Debrief Generator]
        B7[Progress and Journal API]
    end

    subgraph DataLayer[Data and Storage]
        C1[(Postgres)]
        C2[(Object Storage for GLB, textures, audio)]
    end

    A1 --> B2
    A2 --> B2
    A3 --> B3
    A3 --> B4
    A4 --> C2
    A5 --> B3
    A6 --> B4

    B1 --> C1
    B2 --> C1
    B3 --> B5
    B5 --> C1
    B6 --> C1
    B7 --> C1
    B3 --> C2
```

## AI Integration Architecture

Use AI for dialogue, debriefs, and personalization.

Do not make AI the primary source of game truth in the MVP.

```mermaid
flowchart TD
    A[Student choice in scenario] --> B[Rule-Based Mission Engine]
    B --> C[Deterministic outcome]
    C --> D[Store structured result]
    D --> E[AI Debrief Service]
    E --> F[Generate feedback]
    F --> G[Return debrief to player]

    H[Student profile] --> E
    I[Module learning objectives] --> E
    J[Scenario transcript] --> E
```

## Asset Pipeline Without Blender First

This is the recommended MVP path.

```mermaid
flowchart TD
    A[Preset avatar pack] --> B[GLB avatar asset]
    C[Mixamo animation] --> D[FBX or compatible animation asset]
    E[Premade environment packs] --> F[GLB environment assets]
    G[UI art / concept art / textures] --> H[Optimized web assets]

    B --> I[Object Storage]
    D --> I
    F --> I
    H --> I

    I --> J[Babylon.js asset loader]
    J --> K[Hub world]
    J --> L[Scenario rooms]
    J --> M[NPCs and player avatars]
```

## Preset Avatar Selection Architecture

```mermaid
flowchart TD
    A[Preset avatar library in object storage] --> B[Avatar metadata JSON]
    A --> C[Avatar GLB files]
    B --> D[Avatar Selection UI]
    C --> D
    D --> E[Student previews avatar]
    E --> F[Selected avatar ID saved to profile]
    F --> G[(Postgres)]
    G --> H[Avatar loader requests chosen GLB]
    H --> I[Avatar appears in hub and scenario rooms]
```

## Asset Pipeline With Blender Later

Use this after gameplay is proven.

```mermaid
flowchart TD
    A[Premade assets] --> B[Blender cleanup]
    C[Generated concepts] --> B
    D[Custom scene ideas] --> B
    E[Animation retargeting needs] --> B

    B --> F[Optimized GLB export]
    F --> G[Object Storage]
    G --> H[Babylon.js runtime]
```

## Multiplayer and Classroom Session Architecture

```mermaid
flowchart TD
    A[Professor Console] --> B[Launch module scenario]
    B --> C[Socket.IO scenario room]

    D[Student 1 client] --> C
    E[Student 2 client] --> C
    F[Student N client] --> C

    C --> G[Mission timer]
    C --> H[Vote / decision collection]
    C --> I[Scenario state broadcast]
    C --> J[Outcome reveal]

    H --> K[Rule-Based Consequence Engine]
    K --> J
    J --> L[Journal + XP + progress save]
    L --> M[(Postgres)]
```

## Data Model Overview

```mermaid
flowchart TD
    A[users]
    B[player_profiles]
    C[avatars]
    D[module_progress]
    E[scenario_sessions]
    F[scenario_choices]
    G[journals]
    H[badges]
    I[leaderboards]

    A --> B
    A --> C
    A --> D
    A --> G
    A --> H
    D --> E
    E --> F
    H --> I
```

## Concrete Implementation Layers

### Layer 1: LMS Entry

- Canvas launches the game using `LTI 1.3`
- User identity is established before entering the 3D world

### Layer 2: Browser Game Client

- Avatar selection scene
- Globe onboarding scene
- Leadership Profile form
- 3D hub world
- Module scenario rooms
- HUD, dialogue, mission overlays

### Layer 3: Game Backend

- Player profile and module unlocks
- Scenario selection
- Real-time classroom sync
- Rule-based scoring and consequence logic
- Journal and reflection persistence

### Layer 4: AI Services

- NPC text generation
- Personalized debriefs
- Reflection summaries
- Instructor insight generation

### Layer 5: Asset Delivery

- Avatar GLBs
- Environment GLBs
- Animations
- Audio and textures

## Recommended MVP Architecture

Build this first:

```mermaid
flowchart TD
    A[Canvas LTI Launch] --> B[Current Node.js app]
    B --> C[Globe onboarding]
    C --> D[Leadership Profile]
    D --> E[Babylon.js 3D hub]
    E --> F[One module portal]
    F --> G[One boardroom scenario room]
    G --> H[Rule-based outcome engine]
    H --> I[AI debrief]
    I --> J[(Postgres progress save)]
```

This MVP does not require Blender.

## Practical Recommendation

Use two phases:

### Phase 1: No-Blender MVP

- Babylon.js
- preset GLB avatars
- Mixamo
- Premade GLB environment assets
- Node.js backend
- Postgres
- Socket.IO

### Phase 2: Custom World Pipeline

- Add Blender
- Clean and optimize assets
- Build a more distinctive hub and module rooms
- Create a stronger visual identity for the course

## Final Recommendation

For this project:

- Use a browser-first engine/runtime, not Unreal
- Use diffusion only for concept art and non-rigged visual assets
- Use Babylon.js for the 3D runtime
- Use preset GLB avatars for the MVP avatar picker
- Use Mixamo for animations
- Delay Blender until the gameplay loop is working
