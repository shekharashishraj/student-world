# OGL 200 Avatar Asset Spec

This is the acquisition and export spec for the first real avatar set used by the browser-first Babylon.js client.

The goal is not photoreal film characters. The goal is high-quality, stylized, game-ready avatars that read clearly in a browser, look credible in close-up, and stay performant on student laptops.

## Visual Direction

- Style: stylized or semi-stylized game characters
- Target: polished hero-character quality, not photoreal MetaHuman quality
- Tone: academic, professional, contemporary
- Avoid: weapons, armor, sci-fi combat gear, fantasy costumes, exaggerated caricatures
- Preferred wardrobe: business casual, smart casual, campus-professional, light civic-future styling

## Roster Composition

Acquire `8` base avatars for MVP:

- `4` feminine-presenting
- `4` masculine-presenting

Optional later expansion:

- `2-4` additional neutral or androgynous silhouettes

Roster requirements:

- diverse skin tones
- diverse hair textures and lengths
- at least `2` avatars with glasses
- visible facial features: eyes, brows, nose, lips, jawline
- consistent style across the whole set

## Performance Budget

Per avatar, target these limits:

- triangles: `18k-30k` target
- triangles hard cap: `40k`
- materials: `1-3` total
- draw calls target: `<= 3`
- file size target per `.glb`: `4-8 MB`
- file size hard cap per `.glb`: `12 MB`
- max bone influences per vertex: `4`

Notes:

- For this project, one player avatar and a few NPCs will often be visible together.
- Keeping each avatar inside this budget is more important than chasing film-level realism.

## Texture Budget

Use PBR metallic-roughness materials.

Per avatar:

- face/head texture set: `1024` or `2048` max
- body/clothing texture set: `1024` max
- hair texture set: `1024` max
- power-of-two textures only
- preferred map packing:
  - `baseColor`
  - `normal`
  - combined `occlusion/roughness/metallic` when possible

Rules:

- do not ship `4k` textures
- prefer embedded textures inside the `.glb` for MVP
- avoid heavy transparent hair shaders
- prefer opaque or masked hair over translucent materials

## Rig Requirements

Each avatar must be:

- a humanoid biped
- in a neutral `A-pose` or `T-pose`
- exported with one deform skeleton only
- free of engine-specific control rigs
- Mixamo-compatible or close to Mixamo humanoid conventions

Required bones:

- root
- hips / pelvis
- spine chain
- neck
- head
- left/right clavicle
- left/right upper arm
- left/right lower arm
- left/right hand
- left/right upper leg
- left/right lower leg
- left/right foot
- left/right toe

Strong preference:

- all avatars share the same skeleton hierarchy and rest pose

That matters because:

- one animation set can be reused across the full roster
- scene integration is simpler
- runtime behavior is more predictable

## Face Requirements

These are required for the avatar set:

- modeled eyes or clearly rendered eye geometry
- brows
- lips / mouth shape
- readable nose bridge and jawline

Optional but recommended:

- separate eye meshes
- teeth mesh
- tongue mesh
- basic face blendshapes

If blendshapes are included, use this minimal future-safe set:

- `blink_left`
- `blink_right`
- `smile`
- `frown`
- `mouth_open`

Blendshapes are not required for MVP, but they are useful for future dialogue scenes.

## Animation Requirements

For MVP, each avatar must include exactly `1` embedded animation clip:

- clip name: `idle`
- type: seamless loop
- duration: `3-6` seconds
- root motion: in-place only

Do not embed multiple unrelated clips in the main avatar file for MVP.

Reason:

- the current client auto-plays available animation groups
- one clean idle clip keeps preview behavior predictable

Optional future clips, delivered separately later:

- `walk_forward`
- `gesture_explain`
- `gesture_point`
- `react_agree`
- `react_disagree`
- `sit_listen`

If future clips are purchased, they should be authored against the same skeleton.

## Mesh and Export Rules

Required export format:

- `.glb`

Scene rules:

- one character per file
- mesh centered near world origin
- feet at ground plane
- consistent scale across the whole set
- no hidden collision helpers
- no cameras
- no lights
- no engine-specific custom shader dependencies

Transform rules:

- frozen transforms before export
- no negative scaling
- no duplicated skeletons
- no non-deforming helper bones in final runtime export

## Naming Rules For This Repo

Use these exact filenames:

- `atlas-01.glb`
- `juniper-02.glb`
- `sol-03.glb`
- `marin-04.glb`
- `kaia-05.glb`
- `rowan-06.glb`
- `indigo-07.glb`
- `sage-08.glb`

Put them in:

- `web/public/assets/avatars/models/`

Thumbnail naming should mirror the same slug:

- `atlas-01.png`
- `juniper-02.png`
- `sol-03.png`
- `marin-04.png`
- `kaia-05.png`
- `rowan-06.png`
- `indigo-07.png`
- `sage-08.png`

Put them in:

- `web/public/assets/avatars/thumbnails/`

Thumbnail spec:

- aspect ratio: `16:10`
- target size: `800x500`
- background: simple studio gradient or transparent
- character framing: full body or upper-body portrait

Note:

- the repo currently ships SVG placeholders
- replace those with real thumbnail renders once the final avatars are chosen

## Art Direction Constraints

Choose one of these directions and keep it consistent:

- stylized campus-professional
- stylized civic-future
- stylized modern leadership workshop

Do not mix:

- realistic heads with cartoon bodies
- anime faces with western semi-real bodies
- military armor with academic settings
- hyper-detailed hero characters with low-detail NPCs

## Acceptance Checklist

An avatar is acceptable only if all of these are true:

- loads in Babylon as `.glb`
- stands upright without manual repair
- looks correct at close-up camera distance
- has visible eyes and readable facial features
- includes one clean looping idle clip
- stays inside file size budget
- shares style with the rest of the roster
- does not rely on Unity, Unreal, or proprietary runtime shaders

## Recommended Buying Strategy

Best first purchase path:

1. buy or acquire one cohesive stylized humanoid pack
2. verify all characters share the same skeleton
3. test one sample avatar in the repo
4. only then acquire or convert the full roster

Do not buy random individual characters from unrelated packs.

## Current Integration State

The client already supports:

- real avatar thumbnails
- real avatar `glbUrl` loading
- fallback to a placeholder mesh if an asset is missing

That means the next real quality jump comes from asset acquisition, not frontend architecture changes.
