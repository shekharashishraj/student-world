Drop the final rigged avatar files in this directory using these names:

- `atlas-01.glb`
- `juniper-02.glb`
- `sol-03.glb`
- `marin-04.glb`
- `kaia-05.glb`
- `rowan-06.glb`
- `indigo-07.glb`
- `sage-08.glb`

The frontend now loads these files automatically when present.
If a file is missing or fails to load, the app falls back to the procedural placeholder avatar.

Recommended export target:

- format: `glb`
- humanoid rig
- one idle animation if available
- consistent scale across all avatars
