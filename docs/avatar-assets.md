# Avatar Asset Pipeline

The app now supports real avatar assets through the seeded `glbUrl` and `thumbnailUrl` fields.

## Directories

- thumbnails: `web/public/assets/avatars/thumbnails/`
- models: `web/public/assets/avatars/models/`

## Expected model filenames

- `atlas-01.glb`
- `juniper-02.glb`
- `sol-03.glb`
- `marin-04.glb`
- `kaia-05.glb`
- `rowan-06.glb`
- `indigo-07.glb`
- `sage-08.glb`

## Current behavior

- If a matching `.glb` exists, Babylon loads the real avatar model.
- If the model is missing or fails to load, the app logs a client warning and falls back to the procedural mesh.
- Avatar cards use the thumbnail images in `web/public/assets/avatars/thumbnails/`.

## Recommended export settings

- format: `glb`
- humanoid rig
- one idle animation if available
- consistent scale across the full set
- one cohesive art style

See the full acquisition spec in [avatar-asset-spec.md](/Users/priyanujbordoloi/Documents/student-world/docs/avatar-asset-spec.md).
