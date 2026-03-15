# NEXUS Demo Build Spec

> Implementation plan for the demo-first prototype. This document turns `NEXUS_DEMO_PROTOTYPE_PLAN.md` into an actual build sequence for the current repo.

---

## 1. Build Goal

Build a polished `single-player` browser prototype that proves the following demo loop:

1. Homepage
2. Avatar selection
3. Globe pinning with exact location placement
4. Spawn into an open world with 7 visible zones
5. Walk around as a visible character
6. Interact with NPCs

The output is a playable prototype and a strong demo video target.

This is not the production game.

---

## 2. Hard Decisions

### Keep The Existing Tech Stack

Use the existing repo stack instead of switching engines or frameworks.

#### Keep

- `React + TypeScript + Vite`
- `Babylon.js`
- `Express`

#### Defer

- multiplayer
- LTI / Canvas
- grading
- production persistence complexity

### Why

The repo already has:

- a working web app scaffold
- Babylon scene integration
- avatar loading support
- a current onboarding flow
- backend APIs already in place

Switching to a new engine right now would slow the prototype down.

---

## 3. Current Repo Reality

The current repo is already partway there:

- avatar selection exists
- globe onboarding exists
- Babylon scene mounting exists
- one real avatar `.glb` already exists
- backend session/profile infrastructure already exists

Relevant files:

- [package.json](/Users/priyanujbordoloi/Documents/student-world/package.json)
- [web/src/App.tsx](/Users/priyanujbordoloi/Documents/student-world/web/src/App.tsx)
- [web/src/scenes.ts](/Users/priyanujbordoloi/Documents/student-world/web/src/scenes.ts)
- [docs/avatar-asset-spec.md](/Users/priyanujbordoloi/Documents/student-world/docs/avatar-asset-spec.md)
- [NEXUS_DEMO_PROTOTYPE_PLAN.md](/Users/priyanujbordoloi/Documents/student-world/NEXUS_DEMO_PROTOTYPE_PLAN.md)

That means this implementation plan should be an `incremental rebuild`, not a restart from zero.

---

## 4. Prototype Architecture

### Product Flow

The prototype flow should be:

```text
Home -> Avatar -> Globe -> World -> NPC Interaction
```

### Technical Flow

```text
React screen shell
  -> Babylon scene per screen
  -> shared prototype state
  -> minimal backend only where necessary
```

### State Strategy

For the prototype:

- keep state simple
- avoid adding a heavy state library unless the current app becomes unmanageable
- use local React state plus typed config
- use backend persistence only for what materially helps the demo

Prototype state should track:

- selected avatar
- selected archetype
- selected location label
- selected latitude/longitude
- current world zone
- current NPC interaction

---

## 5. New Demo Pipeline

This is the pipeline we are actually implementing.

### Layer 1: Visual Shell

Build a cinematic frontend shell with:

- homepage
- transitions
- loading states
- typography
- HUD framing

### Layer 2: Character Pipeline

Build a reusable prototype character pipeline using one Mixamo-compatible rig and shared animations.

### Layer 3: World Pipeline

Build one open world scene with seven zone landmarks and one NPC in each zone.

### Layer 4: Interaction Pipeline

Build an NPC interaction layer with:

- proximity trigger
- interaction prompt
- dialogue panel
- NPC state changes

### Layer 5: Demo Backend

Keep backend support minimal:

- AI chat proxy
- optional geocoding proxy
- optional profile persistence

No production systems beyond that.

---

## 6. Character And Animation Pipeline

This section is critical because it is the new prototype pipeline.

### Source Assets

Current source files provided:

- [Fast Run.fbx](/Users/priyanujbordoloi/Downloads/Fast%20Run.fbx)
- [Idle.fbx](/Users/priyanujbordoloi/Downloads/Idle.fbx)
- [Talking.fbx](/Users/priyanujbordoloi/Downloads/Talking.fbx)
- [Walking.fbx](/Users/priyanujbordoloi/Downloads/Walking.fbx)

These are valid Mixamo FBX exports with skin and animation data.

### Prototype Decision

For the prototype:

- duplicated mesh data is acceptable
- same rig can be reused for player and NPCs
- same visual base character can be reused temporarily

That is a good tradeoff for speed.

### Important Technical Constraint

The web client is Babylon-based.

Babylon runtime integration should use `glb` assets, not raw FBX files in the browser.

So the actual asset path is:

```text
Mixamo FBX source -> offline conversion / cleanup -> runtime GLB assets
```

### Prototype Asset Folder Layout

Create this structure:

```text
web/public/assets/demo/
  characters/
    prototype-rig/
      source-fbx/
      glb/
      manifests/
  npcs/
    prototype-rig/
      glb/
  world/
    zones/
    props/
```

### Clip Naming Standard

Normalize clip names to:

- `idle`
- `walk`
- `run`
- `talk`
- `interact` later if added

Do not rely on raw Mixamo file names at runtime.

### Runtime Character Rule

All runtime characters should expose one common interface:

```text
CharacterAsset
  - baseModelUrl
  - clips.idle
  - clips.walk
  - clips.run
  - clips.talk
```

### Prototype Reuse Rule

For now:

- player can use the prototype rig
- all NPCs can use the same prototype rig
- visual variation can come from scale, tint, lighting, and name

This is acceptable for the first demo.

---

## 7. Scene And Screen Architecture

### Required Screens

Build these screens as separate presentation units:

1. `HomeScreen`
2. `AvatarScreen`
3. `GlobeScreen`
4. `WorldScreen`

### Scene Ownership

Each screen should own one Babylon scene setup:

- `createHomeScene`
- `createAvatarPreviewScene`
- `createGlobeScene`
- `createWorldScene`

### World Scene Responsibilities

`WorldScene` must handle:

- player spawn
- third-person camera
- world terrain / ground
- zone landmarks
- zone detection
- NPC placement
- interaction prompts
- player movement
- animation state changes

### UI Overlay Responsibilities

React overlay should handle:

- top-level HUD
- zone title reveal
- quest teaser labels
- NPC dialogue panel
- interaction prompt

Do not bury UI inside Babylon GUI unless necessary.

---

## 8. File Structure Plan

The current frontend is too concentrated in [web/src/App.tsx](/Users/priyanujbordoloi/Documents/student-world/web/src/App.tsx). For the demo build, split by concern.

### Target Structure

```text
web/src/
  App.tsx
  main.tsx
  styles.css

  demo/
    config/
      avatars.ts
      zones.ts
      npcs.ts
      prototypeFlow.ts

    screens/
      HomeScreen.tsx
      AvatarScreen.tsx
      GlobeScreen.tsx
      WorldScreen.tsx

    scenes/
      homeScene.ts
      avatarScene.ts
      globeScene.ts
      worldScene.ts

    systems/
      characterLoader.ts
      animationController.ts
      playerController.ts
      npcController.ts
      zoneSystem.ts

    components/
      SceneCanvas.tsx
      DialoguePanel.tsx
      ZoneBanner.tsx
      HUD.tsx
      InteractionPrompt.tsx

    types/
      demo.ts
      character.ts
      zone.ts
      npc.ts
```

### Refactor Rule

Do not try to rewrite everything at once.

Refactor in this order:

1. extract reusable `SceneCanvas`
2. extract `HomeScreen`
3. extract `AvatarScreen`
4. extract `GlobeScreen`
5. build `WorldScreen` separately
6. wire the flow together

---

## 9. World Layout Plan

### World Design Goal

The world must read clearly in a short demo session.

That means:

- central spawn hub
- seven visible landmarks around it
- strong silhouette difference between zones
- readable traversal paths

### Layout Rule

Do not build a giant map first.

Build a `compact showcase world`:

- one central plaza
- seven branches or radial paths
- one hero structure per zone

This is better for demo pacing than a large empty world.

### Zone Requirements

Each zone needs:

- one hero landmark
- one color identity
- one ambient effect
- one NPC
- one zone intro banner

### Deep Polish Rule

Only two zones need full interaction depth for the first demo:

- `Leadership Hall`
- `Vision Tower`

The other five zones can be lighter.

---

## 10. Homepage Plan

### Purpose

The homepage sells the game before the user touches any system.

### Requirements

- strong hero title
- ASU / course framing if needed
- animated background or teaser world scene
- premium CTA
- polished typography and color system

### Implementation Notes

- build this first because it establishes the visual direction
- use a lightweight looping 3D scene or animated gradient/particle layer
- avoid feature-heavy logic here

---

## 11. Avatar Screen Plan

### Purpose

The avatar screen must prove character quality.

### Requirements

- curated avatar grid
- large 3D preview panel
- idle animation loop
- optional archetype card selection

### Prototype Rule

Use curated assets first.

Do not block on:

- live avatar creation
- user-customized facial generation
- advanced personalization

### Implementation Notes

- reuse current avatar catalog logic where possible
- replace placeholder experience with stronger visual framing
- ensure selected avatar carries through into the world scene

---

## 12. Globe Screen Plan

### Purpose

The globe is a social identity moment, not the main gameplay layer.

### Requirements

- 3D globe
- exact pin placement
- search-driven geocoding
- nice camera motion
- clear transition into the world

### Technical Recommendation

Do not depend only on manual globe clicking for the prototype.

Preferred flow:

1. user searches a place
2. geocoder returns `lat/lng`
3. globe animates to result
4. pin drops there

### API Rule

If the current backend does not already support a geocoding proxy, add one small route and keep it isolated.

---

## 13. World Screen Plan

### Purpose

This is the core demo payoff.

### Requirements

- third-person player character
- third-person follow camera
- player animation state machine
- seven zones
- NPC placement
- interaction prompts
- ambient atmosphere

### Camera Decision

Use third-person by default.

The demo must show the player character on screen.

### Traversal Requirements

Player states:

- idle
- walk
- run

NPC states:

- idle
- talk

### Zone Detection

Use simple trigger volumes or distance-based zones first.

Do not over-engineer world streaming in v1.

---

## 14. NPC Interaction Plan

### Interaction Loop

The minimum interaction loop is:

```text
approach NPC -> prompt appears -> press interact -> dialogue panel opens -> NPC talks
```

### Requirements

- proximity detection
- target NPC selection
- facing behavior
- talk animation while dialogue is active
- clean close/open transitions

### AI Strategy

Keep prompts authored and constrained.

For the demo:

- all NPCs can have brief personality prompts
- 2 NPCs should have fully polished prompt design
- remaining NPCs can be lighter

### Backend Rule

Keep NPC prompt logic on the server.

Do not ship prompt templates to the client.

---

## 15. Implementation Milestones

### Milestone 0: Prototype Foundation

Objective:

- lock scope
- lock art direction
- lock engine choice

Tasks:

- approve this build spec
- freeze prototype feature list
- define visual references for world and characters
- choose whether current backend persistence is kept or temporarily minimized

Deliverable:

- no more architecture churn

### Milestone 1: Asset Pipeline Setup

Objective:

- establish the prototype character pipeline

Tasks:

- create the demo asset folder structure
- add current Mixamo FBX sources into a tracked staging area
- define conversion workflow from FBX to GLB
- create a character manifest format
- choose one runtime prototype rig

Deliverable:

- one known-good prototype character asset pipeline

### Milestone 2: Homepage

Objective:

- build the visual front door

Tasks:

- design the homepage
- implement hero layout
- implement animation/background treatment
- wire CTA into avatar flow

Deliverable:

- strong landing screen

### Milestone 3: Avatar Screen Upgrade

Objective:

- replace weak placeholder avatar experience with a polished preview

Tasks:

- improve avatar grid styling
- improve preview scene lighting
- ensure idle animation playback
- carry selected avatar into demo state

Deliverable:

- convincing avatar selection screen

### Milestone 4: Globe Upgrade

Objective:

- make location pinning feel exact and premium

Tasks:

- implement search field
- implement geocoding
- animate globe focus
- place exact pin
- confirm location selection

Deliverable:

- globe screen that feels intentional instead of just functional

### Milestone 5: World Blockout

Objective:

- create the seven-zone showcase world

Tasks:

- build or place central spawn area
- place seven zone landmarks
- define paths and player travel distances
- add zone markers and ambient identities

Deliverable:

- walkable world with readable zone structure

### Milestone 6: Character Runtime

Objective:

- make player and NPCs feel alive

Tasks:

- load prototype rig in world scene
- implement player movement
- implement third-person camera
- implement idle/walk/run state switching
- place NPC characters in every zone
- implement idle/talk NPC state switching

Deliverable:

- functioning character presence in the world

### Milestone 7: NPC Interaction

Objective:

- prove believable NPC interaction

Tasks:

- implement proximity prompts
- implement dialogue panel
- connect to AI backend
- author 2 strong NPC prompt sets
- add turn-to-face and talk animation

Deliverable:

- two strong demo-ready NPC experiences

### Milestone 8: Demo Polish

Objective:

- make the prototype presentation-ready

Tasks:

- lighting pass
- fog / particles / VFX
- sound design pass
- transition polish
- performance cleanup
- bug fixing

Deliverable:

- demo-ready build

---

## 16. Acceptance Criteria Per Major Area

### Homepage

- looks like a real game landing page
- not a generic form screen

### Avatar

- avatar is visible in a large polished preview
- idle animation loops correctly

### Globe

- searched location resolves to exact coordinates
- placed pin matches returned location

### World

- user can spawn and move smoothly
- all 7 zones are visible and distinct

### Characters

- player transitions between idle, walk, and run
- NPCs do not stand lifelessly

### NPC Interaction

- prompt is obvious
- interaction opens cleanly
- at least 2 NPCs feel convincing

---

## 17. Performance Rules

Prototype quality matters, but browser stability still matters more.

### Rules

- keep world compact
- compress runtime assets
- avoid too many unique materials
- avoid overly dense AI-generated meshes
- test frequently on an average laptop

### Practical Rule

A smaller beautiful world is better than a larger broken one.

---

## 18. Risks

### Risk: Too much refactor before visible progress

Mitigation:

- keep the first milestones user-facing
- ship homepage and avatar upgrades early

### Risk: Asset conversion blocks engineering

Mitigation:

- accept prototype duplication
- standardize one prototype rig first

### Risk: World feels empty

Mitigation:

- build compactly
- prioritize landmark composition and atmosphere

### Risk: NPCs feel fake

Mitigation:

- polish 2 NPCs properly
- keep responses short
- animate during speech

---

## 19. Recommended Immediate Next Sprint

If implementation starts now, the first sprint should do only this:

1. Create the demo asset folder structure.
2. Define the Mixamo-to-GLB prototype animation pipeline.
3. Build the homepage.
4. Upgrade the avatar screen preview quality.
5. Start the world blockout with a third-person camera stub.

That gives the project visible momentum quickly.

---

## 20. What Not To Do Next

Do not do these before the prototype world is already compelling:

- multiplayer networking
- grade systems
- instructor tools
- analytics dashboards
- Canvas integration
- deep quest logic for all seven zones
- customization systems that delay the character pipeline

These are correct later, but wrong now.

---

## 21. Definition Of Done For The Demo

The demo is done when a user can:

1. launch into a polished homepage
2. choose an avatar
3. pin a real location on the globe
4. enter a seven-zone world
5. walk around in third-person
6. approach NPCs
7. talk to at least two believable NPCs

If those seven things work and look good, the prototype has done its job.

