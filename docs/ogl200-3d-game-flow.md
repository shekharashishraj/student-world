# OGL 200 3D Leadership Game Flow

This document shows the recommended game flow for an immersive 3D version of the OGL 200 experience.

Students begin by choosing an avatar from a small library of preset 3D characters.

## Core Idea

The globe is the geographic entry point.

The first onboarding step is avatar selection.

The actual game happens in a 3D leadership world where students enter module-based scenario rooms, make leadership decisions, and receive theory-based feedback.

## Full Game Flow

```mermaid
flowchart TD
    A[Student opens game from Canvas or direct link] --> B[Avatar Selection Screen]
    B --> B1[Choose from preset 3D avatar library]
    B1 --> B2[Save avatar ID and preview]
    B2 --> C[3D Globe loads]
    C --> D[Student drops location pin]
    D --> E[Create Leadership Profile]
    E --> E1[Pick traits]
    E --> E2[Pick leadership style]
    E --> E3[Pick top strength]
    E --> E4[Pick conflict style]
    E --> E5[Pick power tendency]

    E1 --> F[Passport saved]
    E2 --> F
    E3 --> F
    E4 --> F
    E5 --> F

    F --> G[Camera dives from globe into 3D hub world]
    G --> H[Enter Global Leadership Center]
    H --> I[Student sees chosen avatar, cohort, progress, leaderboard, journal]
    I --> J{Choose next action}

    J --> K[Start module mission]
    J --> L[Explore hub]
    J --> M[Review leadership journal]
    J --> N[Meet classmates or team]

    L --> J
    M --> J
    N --> J

    K --> O{Which module is active?}
    O --> O1[Module 1: Traits]
    O --> O2[Module 2: Styles]
    O --> O3[Module 3: Strengths]
    O --> O4[Module 4: Vision and Groups]
    O --> O5[Module 5: Inclusion and Conflict]
    O --> O6[Module 6: Ethics]

    O1 --> P[Enter 3D scenario room]
    O2 --> P
    O3 --> P
    O4 --> P
    O5 --> P
    O6 --> P

    P --> Q[Mission briefing]
    Q --> R[Talk to NPCs or teammates]
    R --> S[Collect viewpoints, facts, tensions, constraints]
    S --> T[Make leadership decision]
    T --> U[World reacts in real time]
    U --> V[Trust, Performance, Inclusion, Ethics meters update]
    V --> W{Need another decision?}
    W -->|Yes| R
    W -->|No| X[Scenario outcome]
    X --> Y[Theory debrief]
    Y --> Z[Reflection prompt]
    Z --> AA[XP, badges, journal entry, module progress]
    AA --> AB{More missions available?}
    AB -->|Yes| H
    AB -->|No| AC[End session summary]
```

## Single Mission Loop

```mermaid
flowchart LR
    A[Briefing] --> B[Observe room]
    B --> C[Listen to people]
    C --> D[Identify problem]
    D --> E[Choose leadership response]
    E --> F[Immediate consequences]
    F --> G[Second-order consequences]
    G --> H[Debrief with theory]
    H --> I[Reflection and score]
```

## 3D World Structure

```mermaid
flowchart TD
    A[3D Hub: Global Leadership Center] --> B[Portal 1: Hall of Traits]
    A --> C[Portal 2: Boardroom of Styles]
    A --> D[Portal 3: Team Operations Floor]
    A --> E[Portal 4: Vision Dome]
    A --> F[Portal 5: Inclusion Commons]
    A --> G[Portal 6: Ethics Tribunal]

    B --> B1[Recognize leadership vs management]
    B --> B2[Identify traits]
    B --> B3[Spot destructive leadership]

    C --> C1[Compare authoritarian, democratic, laissez-faire]
    C --> C2[Balance task vs relationship]

    D --> D1[Use strengths]
    D --> D2[Practice team leadership]

    E --> E1[Create vision]
    E --> E2[Lead groups]
    E --> E3[Handle Tuckman stages]
    E --> E4[Work with out-group members]

    F --> F1[Embrace diversity]
    F --> F2[Manage conflict]
    F --> F3[Collaborate through disagreement]

    G --> G1[Ethical leadership]
    G --> G2[5 bases of power]
    G --> G3[6 pillars of character]
    G --> G4[Toxic triangle]
```

## What Happens Right After Map Pinning

The student should not stay on the globe for long.

Before pinning their location:

1. The student chooses an avatar from a small preset 3D character library.
2. The system saves the selected avatar for all future scenes.

After pinning their location:

1. The system creates their identity in the cohort.
2. The student completes a Leadership Profile.
3. The globe becomes a transition animation.
4. The player enters the 3D hub world using the chosen avatar.
5. The first unlocked mission starts.

This means the map is the social and visual entry layer, while the 3D world is the real gameplay layer.

## Avatar Selection Flow

```mermaid
flowchart TD
    A[Student starts game] --> B[Open Avatar Library]
    B --> C[Browse 8 to 20 preset GLB avatars]
    C --> D[Preview selected avatar]
    D --> E{Confirm choice?}
    E -->|No| C
    E -->|Yes| F[Save avatar ID to profile]
    F --> G[Continue to globe onboarding]
```

The avatar library should be small, curated, and web-optimized.

The goal is not infinite customization. The goal is a stable, fast onboarding flow.

## Leadership Profile Flow

```mermaid
flowchart TD
    A[Choose avatar] --> B[Drop pin on globe]
    B --> C[Open Leadership Profile]
    C --> D[Who are you as a leader?]
    D --> E[Choose traits]
    D --> F[Choose preferred leadership style]
    D --> G[Choose top strength]
    D --> H[Choose conflict style]
    D --> I[Choose power tendency]
    E --> J[Generate player leadership profile]
    F --> J
    G --> J
    H --> J
    I --> J
    J --> K[Use avatar plus leadership profile to personalize missions, NPC reactions, and debriefs]
```

## Exact Leadership Profile Fields

Keep the first-run profile short.

Target completion time: `2 to 3 minutes`.

### Required Fields

| Field | Prompt shown to student | Type | Options |
|---|---|---|---|
| `top_traits` | Which 2 leadership traits do you most want to lead with? | Multi-select, choose 2 | Drive, Motivation, Cognitive Ability, Confidence, Integrity, Knowledge |
| `preferred_style` | When you are in charge, which leadership style do you naturally default to? | Single-select | Authoritarian, Democratic, Laissez-faire |
| `task_relationship_balance` | Under pressure, what do you prioritize first? | 5-point slider | 1 = Task First, 3 = Balanced, 5 = Relationship First |
| `strongest_skill` | Which skill currently feels strongest for you? | Single-select | Communication, Organizing, Problem Solving, Relationship Building, Strategic Thinking, Follow-through |
| `conflict_style` | When conflict appears, what is your usual first move? | Single-select | Collaborating, Competing, Avoiding, Accommodating, Compromising |
| `power_base` | Which source of influence are you most likely to use first? | Single-select | Legitimate, Reward, Expert, Referent, Coercive |

### Optional Field

| Field | Prompt shown to student | Type | Suggested limit |
|---|---|---|---|
| `leadership_goal` | What kind of leader do you want to become by the end of this course? | Short text | 120 characters |

## Why These Fields Matter

| Field | Why the game needs it |
|---|---|
| `top_traits` | Personalizes Module 1 feedback and helps compare self-image with actual choices |
| `preferred_style` | Drives Module 2 scenarios and lets the game challenge default habits |
| `task_relationship_balance` | Shapes how NPCs react when the player chooses speed versus trust |
| `strongest_skill` | Feeds Module 3 role assignments and team-based missions |
| `conflict_style` | Personalizes Module 5 conflict scenes and debriefs |
| `power_base` | Feeds Module 6 ethics, power, and destructive leadership scenarios |
| `leadership_goal` | Makes reflection and end-of-module debriefs feel personal |

## What Not To Ask In Onboarding

Do not overload the student on day one.

Avoid asking for:

- long essays
- full personality tests
- all six pillars of character
- detailed diversity or ethics questionnaires
- multiple text reflections before play begins

Those should appear later inside missions, not inside onboarding.

## Recommended UI Order

```mermaid
flowchart TD
    A[Avatar Selection] --> B[Map Pin]
    B --> C[Leadership Profile]
    C --> C1[Pick 2 traits]
    C1 --> C2[Pick leadership style]
    C2 --> C3[Set task vs relationship slider]
    C3 --> C4[Pick strongest skill]
    C4 --> C5[Pick conflict style]
    C5 --> C6[Pick power base]
    C6 --> C7[Optional leadership goal]
    C7 --> D[Enter 3D Hub]
```

## How The Profile Should Be Used In Gameplay

- show the selected traits and style on the player card in the hub
- use `preferred_style` and `conflict_style` to generate scenario tension
- use `strongest_skill` to assign special team roles
- compare player choices against their own stated profile during debrief
- surface growth over time by showing: `You said you value Integrity, but in this mission you chose speed over fairness`

## Scenario Logic

Every mission should use the same four visible meters:

- Trust
- Performance
- Inclusion
- Ethics

Each decision should shift one or more of these meters.

That gives students a visible way to understand leadership tradeoffs.

## Recommended First Playable Slice

Build one complete module before trying to build the whole world.

Recommended first slice:

```mermaid
flowchart TD
    A[Avatar selection] --> B[Globe onboarding]
    B --> C[Leadership Profile]
    C --> D[3D hub]
    D --> E[Module 2 portal]
    E --> F[Boardroom scenario]
    F --> G[Three NPCs disagree]
    G --> H[Student chooses leadership style]
    H --> I[Consequences update meters]
    I --> J[Theory debrief]
    J --> K[Journal and progress saved]
```

Module 2 is a strong first slice because leadership styles, decisions, and tradeoffs are easy to make visible in a 3D room.
