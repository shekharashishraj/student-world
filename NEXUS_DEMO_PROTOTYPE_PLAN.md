# NEXUS Demo-First Prototype Plan

> Companion to `NEXUS_ARCHITECTURE.md`. This document defines the prototype we should build first: a polished single-player vertical slice that proves NEXUS can become a strong open-world interactive educational game.

---

## 1. Prototype Goal

The prototype is not the full game.

The prototype must prove five things:

1. NEXUS can feel like a real game, not just an educational app with 3D scenes.
2. The visual direction is strong enough to get buy-in from faculty, stakeholders, and collaborators.
3. The flow from homepage -> avatar -> globe -> world feels coherent and premium.
4. Students can move through a world with seven distinct zones and interact with believable NPCs.
5. The team can execute the most difficult parts of the experience: character presentation, world traversal, animation, and AI conversation.

This prototype is a `single-player demo`, not a production LMS-integrated system.

---

## 2. What The Prototype Will Include

### Included

- A cinematic homepage / landing screen
- Avatar selection with polished character preview
- Globe screen with location search and exact geocoded pin placement
- A single-player open world with all 7 zones visible
- A controllable player character
- Proper character animations: idle, walk, run, turn, interact
- NPCs placed in each zone
- NPC interaction UI with AI-powered dialogue
- Strong lighting, atmosphere, particles, and environmental styling
- Smooth transitions between all screens

### Explicitly Excluded For The Prototype

- Multiplayer / other live players
- Canvas / LTI integration
- Grade passback
- Real XP-to-grade mapping
- Full quest system for every zone
- Full backend persistence
- Instructor dashboard
- Admin tools

If any feature does not directly improve the visual quality, interaction quality, or demo flow, it should be cut from the prototype.

---

## 3. Core Product Decision

### Build A Third-Person Demo, Not First-Person

For the prototype, the player should be shown in `third-person`.

Reason:

- First-person hides the avatar, which weakens the value of avatar selection.
- Third-person is better for showing character quality, animation quality, and spatial presence.
- Third-person gives the demo a more game-like presentation during walkthroughs and recordings.
- NPC interactions feel stronger when the player character is visible in the scene.

First-person can be explored later as an optional mode, but it should not be the prototype default.

---

## 4. Demo Success Criteria

The prototype is successful if a stakeholder can watch or play it and immediately understand:

- this is a real game concept
- the world has clear structure
- the characters feel intentional
- the globe/community concept is understandable
- NPC interaction is already believable

Minimum acceptance criteria:

- Homepage looks polished enough for a pitch/demo video
- User can select an avatar and see it previewed with idle animation
- User can search for a location and place a pin on the globe at geocoded coordinates
- User can enter the world and spawn as their selected avatar
- All 7 zones are present and visually distinct
- User can walk to any zone
- Every zone has at least one visible NPC
- At least 2 NPCs have strong AI dialogue interactions
- Frame rate is stable on a modern laptop browser

---

## 5. Prototype User Flow

### Screen 1: Home Page

Purpose: sell the fantasy immediately.

Requirements:

- Full-screen cinematic landing page
- Strong title treatment for `NEXUS: Leadership Frontier`
- Animated background or 3D teaser scene
- Clear CTA: `Begin Journey`
- Optional subtitle describing the leadership-world premise

### Screen 2: Avatar Selection

Purpose: establish identity and character quality.

Requirements:

- 4-8 curated avatars, not a weak generic generator output
- Rotatable 3D preview
- Idle animation always playing
- Archetype card selection tied to the avatar choice
- Clear confirmation CTA: `Enter Globe`

Recommendation:

- Do not block the prototype on live avatar generation.
- Use curated pre-rigged avatars first.
- Treat Avatar SDK integration as a stretch goal after the core demo is visually strong.

### Screen 3: Globe

Purpose: show the international student/community idea in a clean, memorable way.

Requirements:

- Interactive 3D globe
- Search box for country/city/location
- Exact geocoding to latitude/longitude
- Pin dropped on the returned coordinates
- Selected location shown back to the user
- CTA: `Enter World`

Recommendation:

- Use a search + geocode flow, not manual latitude/longitude entry.
- One player pin is enough for the prototype.
- Mock additional student pins only if they improve the presentation.

### Screen 4: Open World

Purpose: prove the world, traversal, and zone identity.

Requirements:

- Third-person player controller
- Central spawn hub
- Seven visible zone landmarks arranged around the world
- Distinct architecture, color, lighting, and ambiance per zone
- Zone name reveal on entry
- NPC present in each zone

### Screen 5: NPC Interaction

Purpose: prove the learning interaction can feel alive.

Requirements:

- Interaction prompt near NPC
- Dialogue panel with NPC portrait/name
- NPC turns toward player
- Talk animation or gesture animation while speaking
- AI response with a short, clean cadence

---

## 6. Scope Strategy For The 7 Zones

The prototype should include `all 7 zones visually`, but not all 7 zones need equal mechanical depth.

### Zone Content Rule

Each zone must have:

- one hero landmark/building
- one NPC
- one short zone intro
- one ambient visual identity

Only `2 zones` need full interaction depth in the first strong demo.

Suggested deep-demo zones:

1. `Leadership Hall`
2. `Vision Tower`

Reason:

- They are easy to understand quickly.
- They let the demo show both conceptual teaching and creative/reflective interaction.
- They are visually distinct and good for presentation.

The other 5 zones can have:

- NPC greeting interaction
- zone title reveal
- placeholder quest marker or `coming next` marker if needed

This keeps the world broad while concentrating polish where it matters.

---

## 7. Visual Direction Rules

The prototype must feel visually consistent. This is critical.

### Art Direction Rules

- Pick one clear style direction and keep it consistent across all zones.
- Avoid random-looking AI assets from multiple incompatible styles.
- Use the same material language, texture treatment, and silhouette logic across the world.
- Favor stylized-realistic or stylized-cinematic over ultra-real or toy-like.

### Demo Visual Priorities

- strong sky and atmospheric lighting
- readable landmark silhouettes
- intentional color language per zone
- particles, fog, glow, and emissive accents where appropriate
- clean HUD that does not cover the whole screen

### Asset Rule

If an AI-generated asset looks inconsistent or cheap, replace it.

For this prototype, `visual coherence matters more than asset-generation novelty`.

---

## 8. Character And Animation Requirements

The characters are the heart of the demo.

### Player Character

Required states:

- idle
- walk
- run
- turn / strafe blend
- interact

### NPC Characters

Required states:

- idle loop
- turn-to-face player
- talk / gesture loop

### Animation Quality Rule

Do not ship the prototype with static mannequin NPCs.

Even simple NPC gesture loops and head-tracking will dramatically improve perceived quality.

### Camera Rule

Use an over-the-shoulder third-person camera with:

- smooth follow
- slight lag for weight
- collision handling near walls
- clean framing during NPC interactions

---

## 9. Technical Architecture For The Prototype

### Frontend

```text
Framework:       React + TypeScript + Vite
3D Engine:       React Three Fiber
3D Helpers:      @react-three/drei
Physics:         @react-three/rapier
State:           Zustand
Routing:         React Router
Animation UI:    Framer Motion (for screen transitions / overlays)
```

### World/Scene Approach

- One `WorldScene` for the playable prototype
- Zone data stored in config
- NPC data stored in config
- No heavy content-management system for v1
- No database required for first playable demo

### Backend

Use a minimal backend only for what the prototype actually needs.

Recommended:

```text
Backend:         Express.js or Fastify
Use Cases:       AI chat proxy, optional geocode proxy, environment secrets
Database:        None required for first demo
Persistence:     localStorage for temporary prototype state
```

### Why No Database In V1

For the first strong demo, a database adds work but does not materially improve the visual walkthrough.

Use local or mocked state for:

- selected avatar
- selected archetype
- chosen location
- current zone

Add persistence only after the playable slice feels good.

---

## 10. Globe Implementation Plan

The globe needs to feel exact and clean, but not over-engineered.

### Recommended Flow

1. User searches for a city, country, or place.
2. Geocoding API returns exact latitude and longitude.
3. Globe animates camera to that region.
4. Pin drops onto the exact coordinates.
5. Selected place label is shown.

### Recommended Tech

- `react-globe.gl` or `three-globe` for speed and polish
- Mapbox Geocoding, OpenCage, or another reliable geocoder
- Convert returned lat/lng directly into pin placement

### Prototype Rule

The globe only needs one real player pin for the first demo.

Additional pins should only be added if they improve the story visually without creating complexity.

---

## 11. NPC Interaction Plan

### Prototype Goal

The NPC interaction should feel authored, not random.

### Recommended Strategy

- Give each NPC a strong name, tone, and short system prompt
- Keep replies short and readable
- Make NPCs teach through questions, examples, and reflection
- Keep the interaction UI premium and minimal

### Scope Rule

For the first strong demo:

- all 7 NPCs can exist
- 2 NPCs should be fully polished
- the remaining 5 can use lighter prompt coverage or scripted starter lines

### Important Rule

Do not expose prompt logic on the frontend.

NPC prompting should stay on the backend, even in the prototype.

---

## 12. Recommended Build Order

### Milestone 1: Visual Shell

Build:

- homepage
- route transitions
- art direction tokens
- typography
- color system
- loading states

Deliverable:

- a visually strong front door to the demo

### Milestone 2: Avatar Presentation

Build:

- curated avatar selection screen
- character preview lighting rig
- idle animation
- archetype selection

Deliverable:

- an avatar screen that already feels like a game

### Milestone 3: Globe Experience

Build:

- interactive globe
- search + geocode
- exact pin placement
- camera animation into selected location

Deliverable:

- a clean global identity moment before entering the world

### Milestone 4: Playable World

Build:

- third-person controller
- terrain / pathing
- central hub
- all 7 zone landmarks
- zone entry reveal

Deliverable:

- a walkable world that already reads as NEXUS

### Milestone 5: NPC Presence

Build:

- NPC placement
- idle animation
- interaction prompts
- dialogue UI
- turn-to-face behavior

Deliverable:

- characters that feel present and interactive

### Milestone 6: Deep Polish

Build:

- 2 fully strong NPC experiences
- lighting polish
- particles / VFX
- audio
- camera polish
- performance cleanup

Deliverable:

- the demo-ready vertical slice

---

## 13. What We Should Defer Until After The Demo

- multiplayer presence
- networking architecture
- quest scoring system
- XP economy
- grade mapping
- Canvas/LTI integration
- auth complexity
- database schema for production analytics
- instructor tooling
- full content parity across all 7 zones

If these enter the prototype too early, they will dilute the most important outcome: `a convincing playable demo`.

---

## 14. Key Risks And Mitigations

### Risk: Asset quality is inconsistent

Mitigation:

- use curated assets
- define an art bible before generating everything
- reject weak assets early

### Risk: Avatar pipeline slows the team down

Mitigation:

- start with curated avatars
- treat live avatar generation as optional

### Risk: World looks empty

Mitigation:

- focus on landmark silhouettes
- add ambient props, lighting, and VFX
- use spatial composition intentionally

### Risk: NPC interaction feels generic

Mitigation:

- polish 2 NPCs deeply first
- keep responses short
- design character voices clearly

### Risk: Performance drops

Mitigation:

- keep scene budgets disciplined
- compress models
- lazy load heavier zone assets
- test early on laptop hardware

---

## 15. Prototype Deliverable Definition

When the prototype is ready, the team should be able to:

1. Open a strong homepage.
2. Select a polished avatar.
3. Place a real location on the globe.
4. Enter a seven-zone world as that avatar.
5. Walk through the world smoothly in third-person.
6. Approach NPCs and interact with them.
7. Demonstrate at least two convincing NPC learning moments.

That is enough to prove the concept.

It is not enough to prove the final product architecture, but it is exactly enough to win confidence for the next phase.

---

## 16. Next Document After This

After agreeing on this prototype plan, the next doc should be:

`NEXUS_DEMO_BUILD_SPEC.md`

That document should convert this strategy into:

- exact screen requirements
- asset checklist
- scene/component breakdown
- route map
- milestone task list
- polish checklist

