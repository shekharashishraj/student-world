import {
  AnimationGroup,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  FreeCamera,
  HavokPlugin,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PhysicsAggregate,
  PhysicsShapeType,
  PointLight,
  PointerEventTypes,
  Ray,
  Scene,
  SceneLoader,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
  VertexBuffer,
  VertexData,
} from '@babylonjs/core';
import '@babylonjs/core/Physics/joinedPhysicsEngineComponent';
import HavokPhysics from '@babylonjs/havok';
import { GridMaterial } from '@babylonjs/materials/grid';
import { SkyMaterial } from '@babylonjs/materials/sky';
import { logClientEvent } from './lib/logger';
import type { Avatar, NpcConfig, ZoneConfig } from './types';

/** Detect Safari — its WebGL has limited support for blur shadows, glow post-processing, and some procedural shaders */
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

/** Add a physics aggregate only when the scene has a physics engine enabled */
function addPhysics(mesh: Mesh, shapeType: PhysicsShapeType, opts: { mass: number; restitution?: number; friction?: number }, scene: Scene) {
  if (!scene.getPhysicsEngine()) return;
  new PhysicsAggregate(mesh, shapeType, opts, scene);
}

type AnimState = 'idle' | 'walk' | 'run' | 'talk';

type AnimationController = {
  setState: (state: AnimState) => void;
  dispose: () => void;
};

const ANIM_BASE = '/assets/demo/characters/prototype-rig/animations';

/**
 * Loads a Mixamo-rigged character from idle.glb (mesh + skeleton + idle anim),
 * then imports walk/run/talk animations from their GLBs onto the same skeleton.
 * Returns the character root node and an animation controller.
 */
async function loadAnimatedCharacter(
  scene: Scene,
  parentRoot: TransformNode,
): Promise<AnimationController | null> {
  const clips: Partial<Record<AnimState, AnimationGroup>> = {};
  let activeState: AnimState = 'idle';
  let activeGroup: AnimationGroup | null = null;

  try {
    // 1. Load the character model (mesh + skeleton) from character.glb
    //    Exported from Mixamo with skin — includes geometry and bone hierarchy
    const container = await SceneLoader.LoadAssetContainerAsync(
      `${ANIM_BASE}/`,
      'character.glb',
      scene,
    );
    container.addAllToScene();

    // Parent all imported root nodes under the character root
    container.rootNodes.forEach((node) => {
      node.parent = parentRoot;
    });

    // Fit the imported character — use a smaller target because this Mixamo
    // model's bounding box Y extent includes hair/accessories that inflate the
    // measurement well beyond the actual standing height.
    const importedMeshRoot = container.rootNodes[0];
    if (importedMeshRoot) {
      fitImportedAvatar(importedMeshRoot as TransformNode, 3.0);
      (importedMeshRoot as TransformNode).rotation.y = Math.PI;
    }

    // Hide sub-meshes that drifted far from the body.
    // The aggressive mesh simplification (90% reduction) can corrupt bone
    // weights on small accessory parts (goggles, belt, staff), causing them
    // to float away from the skeleton. Detect and hide them.
    if (importedMeshRoot) {
      const allChildMeshes = (importedMeshRoot as TransformNode).getChildMeshes();
      // Compute the overall bounding center
      let totalCenterY = 0;
      let counted = 0;
      allChildMeshes.forEach((mesh) => {
        mesh.computeWorldMatrix(true);
        const bb = mesh.getBoundingInfo().boundingBox;
        if (bb.maximumWorld.y - bb.minimumWorld.y > 0.01) {
          totalCenterY += bb.centerWorld.y;
          counted++;
        }
      });
      const avgCenterY = counted > 0 ? totalCenterY / counted : 1.5;
      // Character should be roughly 0–3 units tall. Hide any sub-mesh whose
      // center is more than ~3 units above the average or below the ground.
      const upperThreshold = avgCenterY + 3.5;
      const lowerThreshold = -1.5;
      allChildMeshes.forEach((mesh) => {
        const bb = mesh.getBoundingInfo().boundingBox;
        const cy = bb.centerWorld.y;
        if (cy > upperThreshold || cy < lowerThreshold) {
          mesh.isVisible = false;
        }
      });
    }

    // Stop any embedded animation that came with character.glb
    container.animationGroups.forEach((group) => group.stop());

    // Build a map of bone name → node from the loaded character's skeleton.
    //
    // The new character (auto-rigged in Mixamo, exported "with skin") has bones
    // named like: "Hips", "Hips_$AssimpFbx$_Translation", "LeftArm", "Spine", etc.
    //
    // The animation GLBs (from a DIFFERENT Mixamo session) have bones named like:
    // "mixamorig:Hips", "mixamorig:LeftArm_$AssimpFbx$_Rotation", etc.
    //
    // To retarget, we store each character bone under its original name AND under
    // a canonical form (strip prefix + suffix) so we can match animation channels.
    const boneMap = new Map<string, TransformNode>();

    /** Strip "mixamorig:" prefix and "_$AssimpFbx$_*" suffix to get canonical name */
    function canonicalBoneName(name: string): string {
      return name.replace(/^mixamorig:/, '').replace(/_\$AssimpFbx\$_\w+$/, '');
    }

    function collectBones(node: TransformNode) {
      boneMap.set(node.name, node);
      for (const child of node.getChildren()) {
        if (child instanceof TransformNode) {
          collectBones(child);
        }
      }
    }
    container.rootNodes.forEach((node) => {
      if (node instanceof TransformNode) collectBones(node);
    });

    // 2. Import all animations from separate GLBs and retarget to character's skeleton
    //    Bone names match across Mixamo exports from the same auto-rig session
    const animFiles: { state: AnimState; file: string }[] = [
      { state: 'idle', file: 'idle.glb' },
      { state: 'walk', file: 'walk.glb' },
      { state: 'run', file: 'run.glb' },
      { state: 'talk', file: 'talk.glb' },
    ];

    await Promise.all(
      animFiles.map(async ({ state, file }) => {
        try {
          const animContainer = await SceneLoader.LoadAssetContainerAsync(
            `${ANIM_BASE}/`,
            file,
            scene,
          );
          if (animContainer.animationGroups.length > 0) {
            const sourceGroup = animContainer.animationGroups[0];
            // Clone the animation group, retargeting each channel to the
            // character's skeleton by matching bone names
            const clonedGroup = new AnimationGroup(`anim-${state}`, scene);
            for (const targetedAnim of sourceGroup.targetedAnimations) {
              const boneName = (targetedAnim.target as TransformNode)?.name;
              // Try exact match first, then canonical name (strips prefix + suffix)
              const sceneNode = boneName
                ? (boneMap.get(boneName) || boneMap.get(canonicalBoneName(boneName)))
                : null;
              if (sceneNode) {
                clonedGroup.addTargetedAnimation(targetedAnim.animation, sceneNode);
              }
            }
            clonedGroup.loopAnimation = state !== 'talk';
            clonedGroup.stop();
            clips[state] = clonedGroup;
          }
          // Don't add the container's meshes/skeletons to the scene
        } catch (error) {
          void logClientEvent('warn', 'animation.load_failed', `Failed to load ${file}`, {
            error: error instanceof Error ? error.message : 'unknown',
          });
        }
      }),
    );

    // Start with idle
    if (clips.idle) {
      clips.idle.start(true);
      activeGroup = clips.idle;
    }

    return {
      setState(state: AnimState) {
        if (state === activeState) return;
        const nextGroup = clips[state];
        if (!nextGroup) return;

        if (activeGroup) {
          activeGroup.stop();
        }
        nextGroup.start(state !== 'talk');
        activeGroup = nextGroup;
        activeState = state;
      },
      dispose() {
        Object.values(clips).forEach((group) => group?.dispose());
      },
    };
  } catch (error: unknown) {
    // Babylon errors are often plain objects with a message property, not Error instances
    const msg = error instanceof Error
      ? error.message
      : (typeof error === 'object' && error !== null && 'message' in error)
        ? String((error as { message: unknown }).message)
        : JSON.stringify(error);
    // eslint-disable-next-line no-console
    console.error('[CHARACTER_LOAD_ERROR]', msg);
    void logClientEvent('warn', 'animation.character_load_failed', 'Failed to load animated character. Using fallback.', {
      error: msg,
    });
    return null;
  }
}

type Cleanup = () => void;

type WorldSceneOptions = {
  avatar: Avatar | null;
  zones: ZoneConfig[];
  npcs: NpcConfig[];
  onZoneChange: (zoneId: string) => void;
  onInteractableChange: (npcId: string | null) => void;
};

export type WorldSceneController = {
  dispose: Cleanup;
  setTalkingNpcId: (npcId: string | null) => void;
  setAnimState: (state: AnimState) => void;
};

const warnedAvatarAssets = new Set<string>();

function hex(value: string) {
  return Color3.FromHexString(value);
}

function splitAssetUrl(assetUrl: string) {
  const resolved = new URL(assetUrl, window.location.origin);
  const segments = resolved.pathname.split('/');
  const sceneFilename = segments.pop() || '';
  const rootPath = segments.join('/');
  return {
    rootUrl: `${resolved.origin}${rootPath}/`,
    sceneFilename,
  };
}

function fitImportedAvatar(root: TransformNode, targetHeight = 3.35) {
  const meshes = root.getChildMeshes();
  if (meshes.length === 0) return;

  // Temporarily zero the root's local position so world-space measurements
  // are not polluted by the parent's current position (which may have been
  // updated by the render loop before this async call resolves).
  const savedY = root.position.y;
  root.position.y = 0;

  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  meshes.forEach((mesh) => {
    mesh.computeWorldMatrix(true);
    const box = mesh.getBoundingInfo().boundingBox;
    minY = Math.min(minY, box.minimumWorld.y);
    maxY = Math.max(maxY, box.maximumWorld.y);
  });

  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
    root.position.y = savedY;
    return;
  }

  const height = maxY - minY;
  if (height <= 0) {
    root.position.y = savedY;
    return;
  }

  const scaleFactor = targetHeight / height;
  root.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

  // Recompute after scaling and plant feet at local y=0 (relative to parent)
  let scaledMinY = Number.POSITIVE_INFINITY;
  root.getChildMeshes().forEach((mesh) => {
    mesh.computeWorldMatrix(true);
    scaledMinY = Math.min(scaledMinY, mesh.getBoundingInfo().boundingBox.minimumWorld.y);
  });

  if (Number.isFinite(scaledMinY)) {
    // Offset the child so its feet sit at the parent's origin (y=0 local).
    // The parent (playerRoot) already gets its Y set to terrainHeight each
    // frame, so we only need to cancel the model's own local floor offset.
    // Measure with parent at y=0 (which we already set above), so
    // scaledMinY IS the local offset we need to cancel.
    root.position.y = -scaledMinY;
  } else {
    root.position.y = savedY;
  }
}

function mountBabylonScene(canvas: HTMLCanvasElement, builder: (scene: Scene, engine: Engine) => Cleanup | void): Cleanup {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.04, 0.07, 0.1, 1);

  const cleanup = builder(scene, engine) || (() => {});

  engine.runRenderLoop(() => {
    scene.render();
  });

  const handleResize = () => engine.resize();
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
    cleanup();
    scene.dispose();
    engine.dispose();
  };
}

function createCamera(scene: Scene, alpha = -Math.PI / 2, beta = Math.PI / 2.45, radius = 7, target = Vector3.Zero()) {
  const camera = new ArcRotateCamera('camera', alpha, beta, radius, target, scene);
  camera.lowerRadiusLimit = 3;
  camera.upperRadiusLimit = 22;
  camera.wheelDeltaPercentage = 0.02;
  camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
  return camera;
}

function createLighting(scene: Scene, keyColor = '#f5d49b', fillColor = '#5ba2f1') {
  const key = new HemisphericLight('light-key', new Vector3(0.2, 1, -0.2), scene);
  key.intensity = 1.05;
  key.diffuse = hex(keyColor);
  key.groundColor = new Color3(0.04, 0.06, 0.09);

  const fill = new HemisphericLight('light-fill', new Vector3(-0.85, 0.25, 0.8), scene);
  fill.intensity = 0.45;
  fill.diffuse = hex(fillColor);
  fill.groundColor = new Color3(0.01, 0.02, 0.04);
}

/** Enhanced lighting for the world scene — adds directional light + shadow generator */
function createWorldLighting(scene: Scene) {
  createLighting(scene, '#f3d9a3', '#8fcbff');

  // Directional "sun" light for shadows
  const sun = new DirectionalLight('sun-light', new Vector3(-0.5, -1, 0.3).normalize(), scene);
  sun.intensity = 0.7;
  sun.diffuse = new Color3(1.0, 0.94, 0.82);

  // Shadow generator — Safari can't handle blur exponential shadow maps reliably,
  // so fall back to basic PCF shadows on Safari.
  const shadowGen = new ShadowGenerator(1024, sun);
  if (isSafari) {
    shadowGen.usePercentageCloserFiltering = true;
  } else {
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 16;
  }
  shadowGen.darkness = 0.35;

  return { sun, shadowGen };
}

function createGround(scene: Scene, size = 12, accent = '#2a9d8f') {
  const ground = MeshBuilder.CreateGround('ground', { width: size, height: size }, scene);
  const groundMaterial = new GridMaterial('ground-grid', scene);
  groundMaterial.mainColor = new Color3(0.08, 0.11, 0.16);
  groundMaterial.lineColor = hex(accent);
  groundMaterial.gridRatio = 1;
  groundMaterial.opacity = 0.92;
  ground.material = groundMaterial;
  return ground;
}

function createFallbackAvatar(scene: Scene, avatar: Avatar | null): TransformNode {
  const config = avatar?.previewConfig || {
    skin: '#f3c7a7',
    outfit: '#194b7a',
    accent: '#f2b134',
    hair: '#2f1b0c',
  };

  const root = new TransformNode(`avatar-fallback-${avatar?.slug || 'default'}`, scene);

  const outfit = new StandardMaterial(`avatar-outfit-${avatar?.slug || 'default'}`, scene);
  outfit.diffuseColor = hex(config.outfit);
  outfit.emissiveColor = hex(config.outfit).scale(0.08);

  const skin = new StandardMaterial(`avatar-skin-${avatar?.slug || 'default'}`, scene);
  skin.diffuseColor = hex(config.skin);

  const accent = new StandardMaterial(`avatar-accent-${avatar?.slug || 'default'}`, scene);
  accent.diffuseColor = hex(config.accent);

  const hair = new StandardMaterial(`avatar-hair-${avatar?.slug || 'default'}`, scene);
  hair.diffuseColor = hex(config.hair);

  const hips = MeshBuilder.CreateCylinder(
    `avatar-hips-${avatar?.slug || 'default'}`,
    { diameterTop: 0.88, diameterBottom: 0.96, height: 0.48 },
    scene,
  );
  hips.parent = root;
  hips.position = new Vector3(0, 1.1, 0);
  hips.material = accent;

  const torso = MeshBuilder.CreateCylinder(
    `avatar-torso-${avatar?.slug || 'default'}`,
    { diameterTop: 0.78, diameterBottom: 0.98, height: 1.28 },
    scene,
  );
  torso.parent = root;
  torso.position = new Vector3(0, 1.84, 0);
  torso.material = outfit;

  const shoulders = MeshBuilder.CreateSphere(
    `avatar-shoulders-${avatar?.slug || 'default'}`,
    { diameterX: 1.48, diameterY: 0.42, diameterZ: 0.5 },
    scene,
  );
  shoulders.parent = root;
  shoulders.position = new Vector3(0, 2.38, 0);
  shoulders.material = outfit;

  const neck = MeshBuilder.CreateCylinder(`avatar-neck-${avatar?.slug || 'default'}`, { diameter: 0.24, height: 0.16 }, scene);
  neck.parent = root;
  neck.position = new Vector3(0, 2.58, 0);
  neck.material = skin;

  const head = MeshBuilder.CreateSphere(`avatar-head-${avatar?.slug || 'default'}`, { diameter: 0.88 }, scene);
  head.parent = root;
  head.position = new Vector3(0, 3.06, 0);
  head.material = skin;

  const hairCap = MeshBuilder.CreateSphere(`avatar-hair-${avatar?.slug || 'default'}`, { diameter: 0.92, slice: 0.62 }, scene);
  hairCap.parent = root;
  hairCap.position = new Vector3(0, 3.18, 0);
  hairCap.rotation.z = Math.PI;
  hairCap.material = hair;

  const leftArm = MeshBuilder.CreateCylinder(`avatar-left-arm-${avatar?.slug || 'default'}`, { diameter: 0.22, height: 1.32 }, scene);
  leftArm.parent = root;
  leftArm.position = new Vector3(-0.9, 1.88, 0);
  leftArm.rotation.z = 0.28;
  leftArm.material = outfit;

  const rightArm = leftArm.clone(`avatar-right-arm-${avatar?.slug || 'default'}`);
  rightArm.parent = root;
  rightArm.position = new Vector3(0.9, 1.88, 0);
  rightArm.rotation.z = -0.28;

  const leftHand = MeshBuilder.CreateSphere(`avatar-left-hand-${avatar?.slug || 'default'}`, { diameter: 0.2 }, scene);
  leftHand.parent = root;
  leftHand.position = new Vector3(-1.08, 1.25, 0);
  leftHand.material = skin;

  const rightHand = leftHand.clone(`avatar-right-hand-${avatar?.slug || 'default'}`);
  rightHand.parent = root;
  rightHand.position = new Vector3(1.08, 1.25, 0);

  const leftLeg = MeshBuilder.CreateCylinder(`avatar-left-leg-${avatar?.slug || 'default'}`, { diameterTop: 0.34, diameterBottom: 0.3, height: 1.34 }, scene);
  leftLeg.parent = root;
  leftLeg.position = new Vector3(-0.26, 0.42, 0);
  leftLeg.material = accent;

  const rightLeg = leftLeg.clone(`avatar-right-leg-${avatar?.slug || 'default'}`);
  rightLeg.parent = root;
  rightLeg.position = new Vector3(0.26, 0.42, 0);

  const leftShoe = MeshBuilder.CreateBox(`avatar-left-shoe-${avatar?.slug || 'default'}`, { width: 0.34, height: 0.16, depth: 0.56 }, scene);
  leftShoe.parent = root;
  leftShoe.position = new Vector3(-0.26, -0.26, 0.08);
  leftShoe.material = hair;

  const rightShoe = leftShoe.clone(`avatar-right-shoe-${avatar?.slug || 'default'}`);
  rightShoe.parent = root;
  rightShoe.position = new Vector3(0.26, -0.26, 0.08);

  return root;
}

function createAvatar(scene: Scene, avatar: Avatar | null, position: Vector3, scale = 1): TransformNode {
  const root = new TransformNode(`avatar-${avatar?.slug || 'default'}-${position.x}-${position.z}`, scene);
  root.position = position.clone();
  root.scaling = new Vector3(scale, scale, scale);

  let visual = createFallbackAvatar(scene, avatar);
  visual.parent = root;

  const runtimeGlb = avatar?.runtimeGlbUrl || avatar?.glbUrl;

  if (runtimeGlb) {
    const { rootUrl, sceneFilename } = splitAssetUrl(runtimeGlb);
    void SceneLoader.LoadAssetContainerAsync(rootUrl, sceneFilename, scene)
      .then((container) => {
        const importedRoot = new TransformNode(`avatar-imported-${avatar.slug}`, scene);
        container.addAllToScene();
        container.rootNodes.forEach((node) => {
          if (node !== importedRoot) node.parent = importedRoot;
        });
        fitImportedAvatar(importedRoot);
        importedRoot.rotation.y = Math.PI;
        visual.dispose();
        visual = importedRoot;
        visual.parent = root;
      })
      .catch((error) => {
        if (warnedAvatarAssets.has(runtimeGlb)) return;
        warnedAvatarAssets.add(runtimeGlb);
        void logClientEvent('warn', 'avatar.asset_load_failed', 'Failed to load avatar GLB. Using fallback avatar mesh.', {
          avatarId: avatar.id,
          slug: avatar.slug,
          glbUrl: runtimeGlb,
          error: error instanceof Error ? error.message : 'unknown',
        });
      });
  }

  return root;
}

function createSkyDome(scene: Scene, color = '#0b1624') {
  const sky = MeshBuilder.CreateSphere('sky-dome', { diameter: 150, sideOrientation: Mesh.BACKSIDE }, scene);
  const material = new StandardMaterial('sky-material', scene);
  material.disableLighting = true;
  material.emissiveColor = hex(color);
  sky.material = material;
  return sky;
}

/** Procedural Rayleigh-scattering sky for the open world — warm golden-hour look.
 *  Falls back to a simple emissive sky sphere on Safari where the SkyMaterial
 *  shader can fail to compile. */
function createWorldSky(scene: Scene) {
  // Fog — matches sky horizon for atmospheric depth (works on all browsers)
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.007;
  scene.fogColor = new Color3(0.68, 0.78, 0.62);

  if (isSafari) {
    // Safari fallback: simple gradient sky dome
    const sky = MeshBuilder.CreateSphere('world-sky-fallback', { diameter: 800, sideOrientation: Mesh.BACKSIDE, segments: 16 }, scene);
    const mat = new StandardMaterial('world-sky-fallback-mat', scene);
    mat.disableLighting = true;
    mat.emissiveColor = new Color3(0.55, 0.7, 0.55); // warm green-tinted horizon
    sky.material = mat;
    sky.infiniteDistance = true;
    return sky;
  }

  const skyMat = new SkyMaterial('world-sky-material', scene);
  skyMat.backFaceCulling = false;
  skyMat.luminance = 0.35;
  skyMat.turbidity = 8;
  skyMat.rayleigh = 1.5;
  skyMat.mieCoefficient = 0.005;
  skyMat.mieDirectionalG = 0.8;
  skyMat.inclination = 0.48;
  skyMat.azimuth = 0.25;

  const skybox = MeshBuilder.CreateBox('world-skybox', { size: 1000 }, scene);
  skybox.material = skyMat;
  skybox.infiniteDistance = true;

  return skybox;
}

/** Simple seeded pseudo-random for deterministic scatter */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Layered sine noise — raw terrain displacement before flattening */
function terrainNoiseRaw(x: number, z: number): number {
  return (
    Math.sin(x * 0.12) * Math.cos(z * 0.1) * 0.6 +
    Math.sin(x * 0.28 + 1.3) * Math.cos(z * 0.22 + 2.1) * 0.3 +
    Math.sin(x * 0.55 + 4.7) * Math.cos(z * 0.48 + 3.2) * 0.12
  );
}

/**
 * Actual ground height at (x, z) — matches the vertex-displaced mesh exactly.
 * Applies center flattening (hub area) and edge fade so characters walk on
 * the real surface instead of floating.
 */
function terrainHeight(x: number, z: number): number {
  const distFromCenter = Math.sqrt(x * x + z * z);
  const centerFlatten = Math.max(0, 1 - distFromCenter / 10);
  const edgeFade = Math.min(1, distFromCenter / 38);
  return terrainNoiseRaw(x, z) * (1 - centerFlatten) * edgeFade;
}

/** Green terrain ground with vertex displacement and vertex colors */
function createWorldGround(scene: Scene, size = 90) {
  const subdivisions = 64;
  const ground = MeshBuilder.CreateGround('world-ground', {
    width: size,
    height: size,
    subdivisions,
    updatable: true,
  }, scene);

  // Displace vertices for rolling hills
  const positions = ground.getVerticesData(VertexBuffer.PositionKind);
  const normals = ground.getVerticesData(VertexBuffer.NormalKind);
  if (!positions || !normals) return ground;

  const colors: number[] = [];
  const vertCount = positions.length / 3;

  for (let i = 0; i < vertCount; i++) {
    const x = positions[i * 3];
    const z = positions[i * 3 + 2];

    const h = terrainHeight(x, z);
    positions[i * 3 + 1] = h;
    const distFromCenter = Math.sqrt(x * x + z * z);
    const edgeFade = Math.min(1, distFromCenter / 38);

    // Vertex colors: green base, brownish on higher spots, darker at edges
    const greenBase = 0.28 + Math.random() * 0.08;
    const slope = Math.abs(h) / 0.8;
    const r = 0.18 + slope * 0.25 + edgeFade * 0.06;
    const g = greenBase + (1 - slope) * 0.15 - edgeFade * 0.05;
    const b = 0.08 + (1 - edgeFade) * 0.06;
    colors.push(r, g, b, 1);
  }

  ground.updateVerticesData(VertexBuffer.PositionKind, positions);
  ground.setVerticesData(VertexBuffer.ColorKind, colors);

  // Recompute normals for proper lighting on displaced terrain
  VertexData.ComputeNormals(positions, ground.getIndices(), normals);
  ground.updateVerticesData(VertexBuffer.NormalKind, normals);

  const mat = new StandardMaterial('world-ground-mat', scene);
  mat.diffuseColor = new Color3(0.22, 0.48, 0.26);
  mat.specularColor = new Color3(0.05, 0.05, 0.05);
  ground.material = mat;
  ground.receiveShadows = true;

  return ground;
}

/** Create procedural trees, grass tufts, and rocks */
const VEGETATION_BASE = '/assets/demo/vegetation';

async function createVegetation(scene: Scene, zones: Array<{ worldPosition: [number, number, number] }>) {
  const rand = seededRandom(42);
  const zonePositions = zones.map(z => ({ x: z.worldPosition[0], z: z.worldPosition[2] }));

  function isClearOfZones(x: number, z: number): boolean {
    if (Math.sqrt(x * x + z * z) < 16) return false;
    for (const zp of zonePositions) {
      const dx = x - zp.x;
      const dz = z - zp.z;
      if (Math.sqrt(dx * dx + dz * dz) < 9) return false;
    }
    return true;
  }

  // Load both GLB models in parallel (~1MB total after optimization)
  const [treeContainer, bushContainer] = await Promise.all([
    SceneLoader.LoadAssetContainerAsync(`${VEGETATION_BASE}/`, 'maple_tree.glb', scene),
    SceneLoader.LoadAssetContainerAsync(`${VEGETATION_BASE}/`, '3_pine_bushes.glb', scene),
  ]);

  // Measure the original height of each model for correct scaling
  function measureHeight(container: typeof treeContainer): number {
    container.addAllToScene();
    let minY = Infinity;
    let maxY = -Infinity;
    container.meshes.forEach((m) => {
      m.computeWorldMatrix(true);
      const bb = m.getBoundingInfo().boundingBox;
      if (bb.minimumWorld.y < minY) minY = bb.minimumWorld.y;
      if (bb.maximumWorld.y > maxY) maxY = bb.maximumWorld.y;
    });
    container.removeAllFromScene();
    return maxY - minY;
  }

  const treeNativeH = measureHeight(treeContainer);
  const bushNativeH = measureHeight(bushContainer);

  // Helper: instantiate a container at a given position and scale.
  // Vegetation is NOT added to shadowGen (major perf win — each GLB tree has
  // many child meshes and re-rendering them all into the shadow map every frame
  // was the main cause of lag). We also freeze the world matrix since trees
  // never move.
  function placeModel(
    container: typeof treeContainer,
    name: string,
    pos: Vector3,
    scaleFactor: number,
    rotY: number,
  ): TransformNode {
    const instance = container.instantiateModelsToScene(
      (n) => `${name}-${n}`,
      false,
    );
    const root = instance.rootNodes[0] as TransformNode;
    root.position = pos;
    root.scaling.setAll(scaleFactor);
    root.rotation.y = rotY;
    // Freeze world matrix for static vegetation — avoids recomputation each frame
    root.getChildMeshes().forEach((mesh) => {
      mesh.freezeWorldMatrix();
      mesh.doNotSyncBoundingInfo = true;
      // Zero-out any emissive on vegetation materials so they don't bloom
      const mat = mesh.material as StandardMaterial | null;
      if (mat && 'emissiveColor' in mat) {
        mat.emissiveColor = Color3.Black();
      }
    });
    return root;
  }

  // Trees (~12 — enough for visual variety, big perf win over 20+)
  for (let i = 0; i < 12; i++) {
    const x = (rand() - 0.5) * 70;
    const z = (rand() - 0.5) * 70;
    if (!isClearOfZones(x, z)) continue;
    const y = terrainHeight(x, z);
    const targetH = 8.0 + rand() * 4.0;
    placeModel(treeContainer, `tree-${i}`, new Vector3(x, y, z), targetH / (treeNativeH || 1), rand() * Math.PI * 2);
    // Invisible trunk collider
    const trunkCollider = MeshBuilder.CreateCylinder(`tree-collider-${i}`, { diameter: 1.2, height: targetH * 0.5 }, scene);
    trunkCollider.position = new Vector3(x, y + targetH * 0.25, z);
    trunkCollider.isVisible = false;
    addPhysics(trunkCollider, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
  }

  // Bushes (~20 — halved for performance)
  for (let i = 0; i < 20; i++) {
    const x = (rand() - 0.5) * 75;
    const z = (rand() - 0.5) * 75;
    const y = terrainHeight(x, z);
    const targetH = 1.0 + rand() * 1.0;
    placeModel(bushContainer, `bush-${i}`, new Vector3(x, y, z), targetH / (bushNativeH || 1), rand() * Math.PI * 2);
  }

  // Rocks (~18, procedural — negligible cost)
  const rockMat = new StandardMaterial('rock-mat', scene);
  rockMat.diffuseColor = new Color3(0.45, 0.42, 0.38);
  rockMat.specularColor = new Color3(0.02, 0.02, 0.02);

  for (let i = 0; i < 18; i++) {
    const x = (rand() - 0.5) * 68;
    const z = (rand() - 0.5) * 68;
    const y = terrainHeight(x, z);
    const rockSize = 0.25 + rand() * 0.4;
    const rock = MeshBuilder.CreatePolyhedron(`rock-${i}`, {
      type: Math.floor(rand() * 3),
      size: rockSize,
    }, scene);
    rock.position = new Vector3(x, y + rockSize * 0.3, z);
    rock.rotation = new Vector3(rand() * 0.4, rand() * Math.PI, rand() * 0.3);
    rock.material = rockMat;
    addPhysics(rock, PhysicsShapeType.SPHERE, { mass: 0 }, scene);
  }
}

function createPath(scene: Scene, target: Vector3, color: string) {
  // Flat stone walkway along the ground toward the target zone
  const dx = target.x;
  const dz = target.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dx, dz);

  const walkway = MeshBuilder.CreateGround(
    `path-${target.x}-${target.z}`,
    { width: 1.6, height: dist, subdivisions: 1 },
    scene,
  );
  // Position at midpoint, raised slightly above ground
  walkway.position = new Vector3(dx / 2, 0.06, dz / 2);
  walkway.rotation.y = -angle;

  const material = new StandardMaterial(`path-material-${target.x}-${target.z}`, scene);
  material.diffuseColor = new Color3(0.76, 0.65, 0.5); // warm stone
  material.emissiveColor = hex(color).scale(0.1);
  material.specularColor = new Color3(0.05, 0.05, 0.05);
  walkway.material = material;
  return walkway;
}

function createCrystal(scene: Scene, name: string, position: Vector3, color: string, scale = 1) {
  const crystal = MeshBuilder.CreatePolyhedron(name, { type: 2, size: 1.4 * scale }, scene);
  crystal.position = position.clone();
  const material = new StandardMaterial(`${name}-material`, scene);
  material.diffuseColor = hex(color);
  material.emissiveColor = hex(color).scale(0.35);
  crystal.material = material;
  return crystal;
}

function buildZoneLandmark(scene: Scene, zone: ZoneConfig) {
  const [x, y, z] = zone.worldPosition;
  const zoneRoot = new TransformNode(`zone-${zone.id}`, scene);
  zoneRoot.position = new Vector3(x, y, z);

  const baseMaterial = new StandardMaterial(`zone-material-${zone.id}`, scene);
  baseMaterial.diffuseColor = hex(zone.color).scale(0.6);
  baseMaterial.emissiveColor = hex(zone.accent).scale(0.16);

  if (zone.id === 'leadership-hall') {
    const base = MeshBuilder.CreateCylinder(`${zone.id}-base`, { diameter: 8.5, height: 1.2 }, scene);
    base.position = new Vector3(0, 0.6, 0);
    base.parent = zoneRoot;
    base.material = baseMaterial;
    addPhysics(base, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2;
      const column = MeshBuilder.CreateCylinder(`${zone.id}-column-${index}`, { diameter: 0.8, height: 4.8 }, scene);
      column.parent = zoneRoot;
      column.position = new Vector3(Math.cos(angle) * 2.8, 3.1, Math.sin(angle) * 2.8);
      column.material = baseMaterial;
      addPhysics(column, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    }
    const roof = MeshBuilder.CreateCylinder(`${zone.id}-roof`, { diameterTop: 0.5, diameterBottom: 7.2, height: 2.6, tessellation: 6 }, scene);
    roof.parent = zoneRoot;
    roof.position = new Vector3(0, 6.3, 0);
    roof.material = baseMaterial;
    addPhysics(roof, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
  } else if (zone.id === 'trait-training-grounds') {
    const arena = MeshBuilder.CreateTorus(`${zone.id}-ring`, { diameter: 8.4, thickness: 0.55 }, scene);
    arena.parent = zoneRoot;
    arena.position = new Vector3(0, 1, 0);
    arena.rotation.x = Math.PI / 2;
    arena.material = baseMaterial;
    addPhysics(arena, PhysicsShapeType.MESH, { mass: 0 }, scene);
    for (let index = 0; index < 7; index += 1) {
      const angle = (index / 7) * Math.PI * 2;
      const stone = MeshBuilder.CreateBox(`${zone.id}-stone-${index}`, { width: 1.1, depth: 1.1, height: 2.5 + (index % 3) }, scene);
      stone.parent = zoneRoot;
      stone.position = new Vector3(Math.cos(angle) * 3.6, stone.scaling.y + 0.5, Math.sin(angle) * 3.6);
      stone.material = baseMaterial;
      addPhysics(stone, PhysicsShapeType.BOX, { mass: 0 }, scene);
    }
  } else if (zone.id === 'vision-tower') {
    // Load the Kickelhahn Tower GLB model asynchronously
    void SceneLoader.LoadAssetContainerAsync(
      '/assets/demo/landmarks/',
      'kickelhahn_tower.glb',
      scene,
    ).then((container) => {
      container.addAllToScene();
      // Measure native height for correct scaling
      let minY = Infinity;
      let maxY = -Infinity;
      container.meshes.forEach((m) => {
        m.computeWorldMatrix(true);
        const bb = m.getBoundingInfo().boundingBox;
        if (bb.minimumWorld.y < minY) minY = bb.minimumWorld.y;
        if (bb.maximumWorld.y > maxY) maxY = bb.maximumWorld.y;
      });
      const nativeH = maxY - minY || 1;
      const targetH = 16; // slightly taller than the old 13.8-unit procedural tower
      const scale = targetH / nativeH;

      // Parent all meshes under zoneRoot so they inherit zone position
      const towerRoot = new TransformNode('vision-tower-model', scene);
      towerRoot.parent = zoneRoot;
      towerRoot.scaling.setAll(scale);
      towerRoot.position.y = -minY * scale; // plant base on ground

      container.meshes.forEach((m) => {
        if (m.name === '__root__') {
          m.parent = towerRoot;
        }
      });
      // Freeze since the tower never moves
      towerRoot.getChildMeshes().forEach((m) => {
        m.freezeWorldMatrix();
        m.doNotSyncBoundingInfo = true;
      });
      // Invisible physics proxy cylinder for the tower
      const towerCollider = MeshBuilder.CreateCylinder('vision-tower-collider', { diameter: 3, height: targetH }, scene);
      towerCollider.parent = zoneRoot;
      towerCollider.position.y = targetH / 2;
      towerCollider.isVisible = false;
      addPhysics(towerCollider, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    });
  } else if (zone.id === 'culture-district') {
    for (let index = 0; index < 3; index += 1) {
      const dome = MeshBuilder.CreateSphere(`${zone.id}-dome-${index}`, { diameter: 4 + index * 1.2, slice: 0.58 }, scene);
      dome.parent = zoneRoot;
      dome.position = new Vector3(-3 + index * 3, 1.2 + index * 0.35, (index % 2) * 2 - 1);
      dome.material = baseMaterial;
      addPhysics(dome, PhysicsShapeType.SPHERE, { mass: 0 }, scene);
    }
  } else if (zone.id === 'outgroup-plaza') {
    for (let index = 0; index < 3; index += 1) {
      const ring = MeshBuilder.CreateTorus(`${zone.id}-ring-${index}`, { diameter: 4.8 + index * 1.7, thickness: 0.35 }, scene);
      ring.parent = zoneRoot;
      ring.position = new Vector3(0, 2.3 + index * 1.1, 0);
      ring.rotation.x = Math.PI / 2.1 + index * 0.12;
      ring.material = baseMaterial;
    }
  } else if (zone.id === 'ethics-chamber') {
    const dome = MeshBuilder.CreateSphere(`${zone.id}-dome`, { diameter: 8, slice: 0.56 }, scene);
    dome.parent = zoneRoot;
    dome.position = new Vector3(0, 2.2, 0);
    dome.material = baseMaterial;
    dome.visibility = 0.55;
    addPhysics(dome, PhysicsShapeType.SPHERE, { mass: 0 }, scene);
    createCrystal(scene, `${zone.id}-poly`, zoneRoot.position.add(new Vector3(0, 4.8, 0)), zone.accent, 1.2).parent = zoneRoot;
  } else if (zone.id === 'conflict-canyon') {
    for (let index = 0; index < 7; index += 1) {
      const spike = MeshBuilder.CreateCylinder(`${zone.id}-spike-${index}`, { diameterTop: 0.2, diameterBottom: 1.8, height: 3.5 + (index % 3) }, scene);
      spike.parent = zoneRoot;
      spike.position = new Vector3(-3 + index * 1.1, 1.8 + (index % 2), (index % 2) * 2 - 1.5);
      spike.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.18;
      spike.material = baseMaterial;
      addPhysics(spike, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
    }
  }

  // Stepped base platform for every zone
  const stepMat = new StandardMaterial(`zone-step-${zone.id}`, scene);
  stepMat.diffuseColor = hex(zone.color).scale(0.35);
  const step1 = MeshBuilder.CreateCylinder(`${zone.id}-step1`, { diameter: 10, height: 0.2 }, scene);
  step1.parent = zoneRoot;
  step1.position = new Vector3(0, 0.1, 0);
  step1.material = stepMat;
  addPhysics(step1, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);
  const step2 = MeshBuilder.CreateCylinder(`${zone.id}-step2`, { diameter: 9, height: 0.15 }, scene);
  step2.parent = zoneRoot;
  step2.position = new Vector3(0, 0.28, 0);
  step2.material = stepMat;
  addPhysics(step2, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

  // Beacon orb
  const beacon = MeshBuilder.CreateSphere(`${zone.id}-beacon`, { diameter: 0.65 }, scene);
  beacon.parent = zoneRoot;
  beacon.position = new Vector3(0, 8, 0);
  const beaconMaterial = new StandardMaterial(`${zone.id}-beacon-material`, scene);
  beaconMaterial.emissiveColor = hex(zone.accent);
  beacon.material = beaconMaterial;

  // Zone point light — colored ambient glow
  const zoneLight = new PointLight(`${zone.id}-light`, new Vector3(x, 4, z), scene);
  zoneLight.diffuse = hex(zone.accent);
  zoneLight.intensity = 0.4;
  zoneLight.range = 14;
}

function createNexusHub(scene: Scene) {
  // Stepped base — 3 tiers
  const baseMaterial = new StandardMaterial('nexus-hub-material', scene);
  baseMaterial.diffuseColor = new Color3(0.2, 0.22, 0.28);
  baseMaterial.emissiveColor = new Color3(0.06, 0.07, 0.09);

  const base3 = MeshBuilder.CreateCylinder('nexus-hub-base-3', { diameter: 16, height: 0.3 }, scene);
  base3.position = new Vector3(0, 0.15, 0);
  base3.material = baseMaterial;
  addPhysics(base3, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

  const base2 = MeshBuilder.CreateCylinder('nexus-hub-base-2', { diameter: 14.5, height: 0.4 }, scene);
  base2.position = new Vector3(0, 0.5, 0);
  base2.material = baseMaterial;
  addPhysics(base2, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

  const base = MeshBuilder.CreateCylinder('nexus-hub-base', { diameter: 13, height: 0.6 }, scene);
  base.position = new Vector3(0, 0.9, 0);
  base.material = baseMaterial;
  addPhysics(base, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

  // Pillars around the edge
  const pillarMat = new StandardMaterial('nexus-pillar-mat', scene);
  pillarMat.diffuseColor = new Color3(0.28, 0.3, 0.36);
  pillarMat.emissiveColor = new Color3(0.04, 0.04, 0.06);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const pillar = MeshBuilder.CreateCylinder(`nexus-pillar-${i}`, { diameter: 0.45, height: 2.8 }, scene);
    pillar.position = new Vector3(Math.cos(angle) * 6.2, 2.0, Math.sin(angle) * 6.2);
    pillar.material = pillarMat;
    addPhysics(pillar, PhysicsShapeType.CYLINDER, { mass: 0 }, scene);

    // Small orb on top of each pillar
    const orb = MeshBuilder.CreateSphere(`nexus-pillar-orb-${i}`, { diameter: 0.35 }, scene);
    orb.position = new Vector3(Math.cos(angle) * 6.2, 3.55, Math.sin(angle) * 6.2);
    const orbMat = new StandardMaterial(`nexus-pillar-orb-mat-${i}`, scene);
    orbMat.emissiveColor = new Color3(0.85, 0.68, 0.32);
    orb.material = orbMat;
  }

  // Rings at different heights
  const ringMaterial = new StandardMaterial('nexus-hub-ring-material', scene);
  ringMaterial.emissiveColor = new Color3(0.85, 0.68, 0.32);

  const ring1 = MeshBuilder.CreateTorus('nexus-hub-ring-1', { diameter: 11, thickness: 0.28 }, scene);
  ring1.position = new Vector3(0, 1.28, 0);
  ring1.rotation.x = Math.PI / 2;
  ring1.material = ringMaterial;

  const ring2Mat = new StandardMaterial('nexus-hub-ring-2-material', scene);
  ring2Mat.emissiveColor = new Color3(0.5, 0.75, 1.0);
  const ring2 = MeshBuilder.CreateTorus('nexus-hub-ring-2', { diameter: 8, thickness: 0.18 }, scene);
  ring2.position = new Vector3(0, 2.5, 0);
  ring2.rotation.x = Math.PI / 2.1;
  ring2.material = ring2Mat;

  const ring3Mat = new StandardMaterial('nexus-hub-ring-3-material', scene);
  ring3Mat.emissiveColor = new Color3(0.7, 0.5, 0.9);
  const ring3 = MeshBuilder.CreateTorus('nexus-hub-ring-3', { diameter: 5, thickness: 0.14 }, scene);
  ring3.position = new Vector3(0, 3.4, 0);
  ring3.rotation.x = Math.PI / 1.95;
  ring3.material = ring3Mat;

  // Central crystal + point light
  const crystal = createCrystal(scene, 'nexus-hub-crystal', new Vector3(0, 5.0, 0), '#7BC9FF', 1.35);

  const glow = new PointLight('nexus-glow', new Vector3(0, 5.0, 0), scene);
  glow.diffuse = new Color3(0.48, 0.72, 1.0);
  glow.intensity = 0.5;
  glow.range = 15;

  return { base, ring: ring1, ring2, ring3, crystal };
}

function makeNpcPosition(zone: ZoneConfig) {
  const [x, _y, z] = zone.worldPosition;
  if (zone.id === 'leadership-hall') return new Vector3(x + 0.5, 0, z + 6.5);
  if (zone.id === 'vision-tower') return new Vector3(x - 3.4, 0, z + 4.6);
  if (zone.id === 'conflict-canyon') return new Vector3(x + 4.2, 0, z + 2.6);
  return new Vector3(x + 2.8, 0, z + 2.2);
}

function lerpAngle(current: number, target: number, amount: number) {
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return current + diff * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

function horizontalDistance(a: Vector3, b: Vector3) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function createHomeScene(canvas: HTMLCanvasElement) {
  return mountBabylonScene(canvas, (scene) => {
    createLighting(scene, '#F6D7A8', '#78C8FF');
    createSkyDome(scene, '#0b1829');
    const camera = createCamera(scene, -Math.PI / 2.35, Math.PI / 2.55, 11.5, new Vector3(0, 2.8, 0));
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 14;
    createGround(scene, 26, '#4fbec6');
    createNexusHub(scene);
    const ringA = MeshBuilder.CreateTorus('home-ring-a', { diameter: 9.5, thickness: 0.14 }, scene);
    ringA.position = new Vector3(0, 5, 0);
    ringA.rotation.x = Math.PI / 2.15;
    const ringAMaterial = new StandardMaterial('home-ring-a-material', scene);
    ringAMaterial.emissiveColor = new Color3(0.5, 0.79, 1);
    ringA.material = ringAMaterial;

    const ringB = MeshBuilder.CreateTorus('home-ring-b', { diameter: 6.8, thickness: 0.12 }, scene);
    ringB.position = new Vector3(0, 3.2, 0);
    ringB.rotation.x = Math.PI / 2;
    const ringBMaterial = new StandardMaterial('home-ring-b-material', scene);
    ringBMaterial.emissiveColor = new Color3(0.93, 0.71, 0.34);
    ringB.material = ringBMaterial;

    scene.onBeforeRenderObservable.add(() => {
      const time = performance.now() * 0.001;
      ringA.rotation.y = time * 0.18;
      ringB.rotation.y = -time * 0.25;
    });
  });
}

export function createAvatarPreviewScene(canvas: HTMLCanvasElement, avatar: Avatar | null) {
  return mountBabylonScene(canvas, (scene) => {
    createLighting(scene, avatar?.previewConfig.accent || '#f5d49b', '#5CAAF2');
    createSkyDome(scene, '#10253a');
    createCamera(scene, -Math.PI / 2.4, Math.PI / 2.45, 5.4, new Vector3(0, 1.75, 0));
    createGround(scene, 8, avatar?.previewConfig.accent || '#2a9d8f');
    const pedestal = MeshBuilder.CreateCylinder('avatar-pedestal', { diameter: 2.5, height: 0.22 }, scene);
    pedestal.position = new Vector3(0, -0.12, 0);
    const pedestalMaterial = new StandardMaterial('avatar-pedestal-material', scene);
    pedestalMaterial.diffuseColor = new Color3(0.12, 0.19, 0.27);
    pedestal.material = pedestalMaterial;

    const avatarRoot = createAvatar(scene, avatar, new Vector3(0, 0, 0), 1.05);
    scene.onBeforeRenderObservable.add(() => {
      avatarRoot.rotation.y += 0.0038;
      avatarRoot.position.y = Math.sin(performance.now() * 0.0014) * 0.04;
    });
  });
}

export function createGlobeScene(
  canvas: HTMLCanvasElement,
  currentPin: { lat: number; lng: number } | null,
  onPin: (pin: { lat: number; lng: number }) => void,
) {
  return mountBabylonScene(canvas, (scene) => {
    createLighting(scene, '#f0d4a1', '#63b3ff');
    createSkyDome(scene, '#08121d');
    const camera = createCamera(scene, -Math.PI / 2, Math.PI / 2.5, 7.5);
    createGround(scene, 16, '#3fb4c6');

    const globe = MeshBuilder.CreateSphere('globe', { diameter: 4.2, segments: 40 }, scene);
    globe.position.y = 2.2;
    const globeMaterial = new StandardMaterial('globe-material', scene);
    globeMaterial.diffuseColor = new Color3(0.11, 0.27, 0.44);
    globeMaterial.emissiveColor = new Color3(0.02, 0.1, 0.2);
    globe.material = globeMaterial;

    const ring = MeshBuilder.CreateTorus('ring', { diameter: 5.8, thickness: 0.06 }, scene);
    ring.rotation.x = Math.PI / 2.2;
    ring.position.y = 2.2;
    const ringMaterial = new StandardMaterial('ring-material', scene);
    ringMaterial.emissiveColor = new Color3(0.86, 0.76, 0.33);
    ring.material = ringMaterial;

    let marker: Mesh | null = null;
    const syncMarker = (lat: number, lng: number) => {
      const latRad = (lat * Math.PI) / 180;
      const lngRad = (lng * Math.PI) / 180;
      const radius = 2.18;
      const position = new Vector3(
        Math.cos(latRad) * Math.cos(lngRad) * radius,
        Math.sin(latRad) * radius + 2.2,
        Math.cos(latRad) * Math.sin(lngRad) * radius,
      );

      if (!marker) {
        marker = MeshBuilder.CreateSphere('marker', { diameter: 0.18 }, scene);
        const markerMaterial = new StandardMaterial('marker-material', scene);
        markerMaterial.emissiveColor = new Color3(0.98, 0.54, 0.27);
        marker.material = markerMaterial;
      }

      marker.position = position;
      camera.alpha = (-lngRad) + Math.PI / 2;
      camera.beta = Math.PI / 2.4 - latRad * 0.35;
    };

    if (currentPin) syncMarker(currentPin.lat, currentPin.lng);

    scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;
      const pickedMesh = pointerInfo.pickInfo?.pickedMesh;
      const pickedPoint = pointerInfo.pickInfo?.pickedPoint;
      if (!pickedMesh || pickedMesh.id !== 'globe' || !pickedPoint) return;

      const normalized = pickedPoint.subtract(globe.position).normalize();
      const lat = Number(((Math.asin(normalized.y) * 180) / Math.PI).toFixed(4));
      const lng = Number(((Math.atan2(normalized.z, normalized.x) * 180) / Math.PI).toFixed(4));
      syncMarker(lat, lng);
      onPin({ lat, lng });
    });

    scene.onBeforeRenderObservable.add(() => {
      ring.rotation.y += 0.0018;
      globe.rotation.y += 0.0008;
    });
  });
}

export async function createWorldScene(canvas: HTMLCanvasElement, options: WorldSceneOptions): Promise<WorldSceneController> {
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.42, 0.58, 0.45, 1);

  // Initialize Havok physics engine
  const havokInterface = await HavokPhysics({
    locateFile: () => '/HavokPhysics.wasm',
  });
  const havokPlugin = new HavokPlugin(true, havokInterface);
  scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

  // Immersive world setup
  const { shadowGen } = createWorldLighting(scene);
  createWorldSky(scene);
  const worldGround = createWorldGround(scene, 90);
  // Use a flat invisible box as the physics floor — the MESH shape on the
  // vertex-displaced terrain can fail with Havok capsule collision.
  const physicsFloor = MeshBuilder.CreateBox('physics-floor', { width: 90, height: 0.2, depth: 90 }, scene);
  physicsFloor.position.y = -0.1; // top surface at y=0
  physicsFloor.isVisible = false;
  new PhysicsAggregate(physicsFloor, PhysicsShapeType.BOX, { mass: 0, restitution: 0.1 }, scene);

  // GlowLayer removed — the full-screen post-process was expensive and caused
  // unintended bloom on GLB vegetation. Emissive materials still look fine without it.

  const hub = createNexusHub(scene);
  const playerRoot = new TransformNode('player-root', scene);
  playerRoot.position = new Vector3(0, 2, 7);

  const playerVisual = new TransformNode('player-visual', scene);
  playerVisual.parent = playerRoot;

  const capsuleRadius = 0.35;
  const capsuleHeight = 1.4;
  const playerCapsule = MeshBuilder.CreateCapsule('player-capsule', {
    radius: capsuleRadius,
    height: capsuleHeight + 2 * capsuleRadius,
  }, scene);
  playerCapsule.position = new Vector3(0, 2 + (capsuleHeight + 2 * capsuleRadius) / 2, 7);
  playerCapsule.isVisible = false;
  playerCapsule.isPickable = false;
  const playerAggregate = new PhysicsAggregate(
    playerCapsule,
    PhysicsShapeType.CAPSULE,
    { mass: 70, restitution: 0, friction: 0.5 },
    scene,
  );
  playerAggregate.body.setMassProperties({ inertia: Vector3.ZeroReadOnly });
  playerAggregate.body.disablePreStep = false;
  const playerFocusOffset = new Vector3(0, 1.75, 0);
  const camera = new FreeCamera('world-camera', new Vector3(0, 4.2, -8.2), scene);
  camera.fov = 0.95;
  camera.minZ = 0.05;
  scene.activeCamera = camera;
  let cameraYaw = Math.PI;
  let desiredCameraPitch = 0.42;
  let renderedCameraPitch = desiredCameraPitch;
  let desiredCameraDistance = 8.2;
  let currentCameraDistance = desiredCameraDistance;
  let currentCameraTarget = playerRoot.position.add(playerFocusOffset);
  let isOrbiting = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  options.zones.forEach((zone) => {
    buildZoneLandmark(scene, zone);
    createPath(scene, new Vector3(zone.worldPosition[0], 0, zone.worldPosition[2]), zone.color);
  });

  // GLB-based vegetation (trees, bushes, rocks)
  void createVegetation(scene, options.zones);

  // NPC avatar: use the prototype Lara Croft GLB regardless of profile state
  const npcAvatar: Avatar | null = options.avatar ?? {
    id: 'npc-fallback', slug: 'lara-croft-prototype', displayName: 'Prototype',
    glbUrl: '/assets/demo/characters/prototype-rig/glb/lara-croft-prototype.glb',
    runtimeGlbUrl: '/assets/demo/characters/prototype-rig/glb/lara-croft-prototype.glb',
    thumbnailUrl: null, previewImageUrl: null, status: 'active', usage: 'npc',
    clipNames: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    sortOrder: 0, isActive: true,
    previewConfig: { skin: '#c4956a', outfit: '#3a5a7c', accent: '#e0c97f', hair: '#2c1810' },
  };
  const npcState = options.npcs.map((npc) => {
    const zone = options.zones.find((item) => item.id === npc.zoneId);
    if (!zone) return null;
    const basePosition = makeNpcPosition(zone);
    basePosition.y = terrainHeight(basePosition.x, basePosition.z);
    const root = createAvatar(scene, npcAvatar, basePosition.clone(), 0.96);
    const halo = MeshBuilder.CreateTorus(`npc-halo-${npc.id}`, { diameter: 1.55, thickness: 0.06 }, scene);
    halo.position = basePosition.add(new Vector3(0, 0.12, 0));
    halo.rotation.x = Math.PI / 2;
    halo.isPickable = false;
    const haloMaterial = new StandardMaterial(`npc-halo-material-${npc.id}`, scene);
    haloMaterial.emissiveColor = hex(zone.accent).scale(0.55);
    halo.material = haloMaterial;
    return { npc, zone, root, halo, basePosition };
  }).filter(Boolean) as Array<{ npc: NpcConfig; zone: ZoneConfig; root: TransformNode; halo: Mesh; basePosition: Vector3 }>;

  const addShadowCasters = (root: TransformNode) => {
    root.getChildMeshes().forEach((mesh) => {
      shadowGen.addShadowCaster(mesh);
    });
  };

  const keys = { w: false, a: false, s: false, d: false, shift: false };
  let currentZoneId = 'nexus-plaza';
  let currentInteractable: string | null = null;
  let talkingNpcId: string | null = null;
  let playerAnimCtrl: AnimationController | null = null;

  void loadAnimatedCharacter(scene, playerVisual).then((ctrl) => {
    if (ctrl) {
      playerAnimCtrl = ctrl;
      addShadowCasters(playerVisual);
    }
  });

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'w' || event.key === 'W') keys.w = true;
    if (event.key === 'a' || event.key === 'A') keys.a = true;
    if (event.key === 's' || event.key === 'S') keys.s = true;
    if (event.key === 'd' || event.key === 'D') keys.d = true;
    if (event.key === 'Shift') keys.shift = true;
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'w' || event.key === 'W') keys.w = false;
    if (event.key === 'a' || event.key === 'A') keys.a = false;
    if (event.key === 's' || event.key === 'S') keys.s = false;
    if (event.key === 'd' || event.key === 'D') keys.d = false;
    if (event.key === 'Shift') keys.shift = false;
  };
  const onResize = () => engine.resize();
  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || talkingNpcId) return;
    isOrbiting = true;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent) => {
    if (!isOrbiting || talkingNpcId) return;
    const dx = event.clientX - lastPointerX;
    const dy = event.clientY - lastPointerY;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    cameraYaw -= dx * 0.005;
    desiredCameraPitch = clamp(desiredCameraPitch - dy * 0.0038, 0.18, 1.02);
  };
  const onPointerEnd = (event: PointerEvent) => {
    if (event.type === 'pointerup' && event.button !== 0) return;
    isOrbiting = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (talkingNpcId) return;
    desiredCameraDistance = clamp(desiredCameraDistance + event.deltaY * 0.01, 4.5, 12);
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onResize);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerEnd);
  canvas.addEventListener('pointercancel', onPointerEnd);
  canvas.addEventListener('pointerleave', onPointerEnd);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.style.touchAction = 'none';

  scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(engine.getDeltaTime() / 1000, 0.033);
    const inputForward = talkingNpcId ? 0 : (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
    const inputRight = talkingNpcId ? 0 : (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    const hasInput = inputForward !== 0 || inputRight !== 0;
    const speed = keys.shift ? 8.4 : 5;
    const currentVel = playerAggregate.body.getLinearVelocity();
    let desiredMoveDirection: Vector3 | null = null;

    if (hasInput) {
      const cameraForward = new Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
      const cameraRight = new Vector3(cameraForward.z, 0, -cameraForward.x);
      const desired = cameraForward.scale(inputForward).add(cameraRight.scale(inputRight));
      if (desired.lengthSquared() > 0.0001) {
        desired.normalize();
        desiredMoveDirection = desired;
      }
    }

    const desiredVelX = desiredMoveDirection ? desiredMoveDirection.x * speed : 0;
    const desiredVelZ = desiredMoveDirection ? desiredMoveDirection.z * speed : 0;
    const velocitySharpness = desiredMoveDirection ? 11 : 15;
    const nextVelX = damp(currentVel.x, desiredVelX, velocitySharpness, delta);
    const nextVelZ = damp(currentVel.z, desiredVelZ, velocitySharpness, delta);
    playerAggregate.body.setLinearVelocity(new Vector3(nextVelX, currentVel.y, nextVelZ));

    const physPos = playerCapsule.getAbsolutePosition();
    playerRoot.position.x = physPos.x;
    playerRoot.position.y = physPos.y - (capsuleHeight + 2 * capsuleRadius) / 2;
    playerRoot.position.z = physPos.z;

    if (physPos.y < -10) {
      playerAggregate.body.setLinearVelocity(Vector3.Zero());
      playerAggregate.body.setAngularVelocity(Vector3.Zero());
      playerCapsule.position.set(0, 3, 7);
      playerAggregate.body.disablePreStep = false;
    }

    let clamped = false;
    if (playerRoot.position.x < -32) { playerRoot.position.x = -32; clamped = true; }
    if (playerRoot.position.x > 32) { playerRoot.position.x = 32; clamped = true; }
    if (playerRoot.position.z < -32) { playerRoot.position.z = -32; clamped = true; }
    if (playerRoot.position.z > 32) { playerRoot.position.z = 32; clamped = true; }
    if (clamped) {
      playerCapsule.position.set(playerRoot.position.x, physPos.y, playerRoot.position.z);
      playerAggregate.body.disablePreStep = false;
    }

    const time = performance.now() * 0.001;
    const actualHorizontalSpeed = Math.sqrt(nextVelX * nextVelX + nextVelZ * nextVelZ);
    const moving = actualHorizontalSpeed > 0.24;
    const activeDialogueNpc = talkingNpcId
      ? npcState.find(({ npc }) => npc.id === talkingNpcId) || null
      : null;

    if (desiredMoveDirection) {
      const moveYaw = Math.atan2(desiredMoveDirection.x, desiredMoveDirection.z);
      playerRoot.rotation.y = lerpAngle(playerRoot.rotation.y, moveYaw + Math.PI, 1 - Math.exp(-10 * delta));
      const desiredFollowYaw = Math.atan2(-desiredMoveDirection.x, -desiredMoveDirection.z);
      cameraYaw = lerpAngle(cameraYaw, desiredFollowYaw, 1 - Math.exp(-4.5 * delta));
    } else if (activeDialogueNpc) {
      const toNpc = activeDialogueNpc.basePosition.subtract(playerRoot.position);
      toNpc.y = 0;
      if (toNpc.lengthSquared() > 0.0001) {
        toNpc.normalize();
        playerRoot.rotation.y = lerpAngle(
          playerRoot.rotation.y,
          Math.atan2(toNpc.x, toNpc.z) + Math.PI,
          1 - Math.exp(-8 * delta),
        );
        cameraYaw = lerpAngle(
          cameraYaw,
          Math.atan2(-toNpc.x, -toNpc.z) + 0.28,
          1 - Math.exp(-5.5 * delta),
        );
      }
    }

    if (playerAnimCtrl) {
      if (activeDialogueNpc) {
        playerAnimCtrl.setState('talk');
      } else if (actualHorizontalSpeed > 6.2) {
        playerAnimCtrl.setState('run');
      } else if (actualHorizontalSpeed > 0.35) {
        playerAnimCtrl.setState('walk');
      } else {
        playerAnimCtrl.setState('idle');
      }
    }

    const bob = moving
      ? Math.sin(time * (actualHorizontalSpeed > 6.2 ? 10 : 7)) * (actualHorizontalSpeed > 6.2 ? 0.12 : 0.06)
      : Math.sin(time * 1.8) * 0.02;
    playerVisual.position.y = bob;

    hub.crystal.rotation.y += 0.008;
    hub.ring.rotation.y += 0.003;
    hub.ring2.rotation.y -= 0.004;
    hub.ring3.rotation.y += 0.006;

    let nextZoneId = 'nexus-plaza';
    let nearestZoneDistance = Number.POSITIVE_INFINITY;
    options.zones.forEach((zone) => {
      const dx = playerRoot.position.x - zone.worldPosition[0];
      const dz = playerRoot.position.z - zone.worldPosition[2];
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < nearestZoneDistance && distance < 10.5) {
        nearestZoneDistance = distance;
        nextZoneId = zone.id;
      }
    });
    if (nextZoneId !== currentZoneId) {
      currentZoneId = nextZoneId;
      options.onZoneChange(currentZoneId);
    }

    let nextInteractable = currentInteractable;
    if (!activeDialogueNpc) {
      const currentNpc = currentInteractable
        ? npcState.find(({ npc }) => npc.id === currentInteractable) || null
        : null;
      let nearestNpcDistance = currentNpc
        ? horizontalDistance(playerRoot.position, currentNpc.basePosition)
        : Number.POSITIVE_INFINITY;
      if (currentNpc) {
        const leaveDistance = currentNpc.npc.interactionRadius + 0.8;
        if (horizontalDistance(playerRoot.position, currentNpc.basePosition) > leaveDistance) {
          nextInteractable = null;
          nearestNpcDistance = Number.POSITIVE_INFINITY;
        }
      }
      npcState.forEach(({ npc, basePosition }) => {
        const distance = horizontalDistance(playerRoot.position, basePosition);
        if (distance <= npc.interactionRadius && distance < nearestNpcDistance) {
          nearestNpcDistance = distance;
          nextInteractable = npc.id;
        }
      });
    }

    npcState.forEach(({ npc, root, halo, basePosition }) => {
      const talking = talkingNpcId === npc.id;
      const highlighted = !talking && nextInteractable === npc.id;
      halo.scaling = talking ? new Vector3(1.18, 1.18, 1.18) : highlighted ? new Vector3(1.08, 1.08, 1.08) : new Vector3(1, 1, 1);
      halo.visibility = talking || highlighted ? 1 : 0.42;
      root.position.x = basePosition.x;
      root.position.z = basePosition.z;
      root.position.y = basePosition.y + (talking ? Math.sin(time * 5 + basePosition.x) * 0.14 : Math.sin(time * 1.6 + basePosition.x) * 0.04);
      halo.position.x = basePosition.x;
      halo.position.z = basePosition.z;
      halo.position.y = root.position.y + 0.12;
      if (talking) {
        const targetYaw = Math.atan2(playerRoot.position.x - basePosition.x, playerRoot.position.z - basePosition.z);
        root.rotation.y = lerpAngle(root.rotation.y, targetYaw, 0.1);
      } else if (highlighted) {
        const targetYaw = Math.atan2(playerRoot.position.x - basePosition.x, playerRoot.position.z - basePosition.z);
        root.rotation.y = lerpAngle(root.rotation.y, targetYaw, 0.05);
      } else {
        root.rotation.y = Math.sin(time * 0.65 + basePosition.x) * 0.1;
      }
    });

    if (nextInteractable !== currentInteractable) {
      currentInteractable = nextInteractable;
      options.onInteractableChange(currentInteractable);
    }

    const desiredCameraTarget = activeDialogueNpc
      ? Vector3.Lerp(
          playerRoot.position.add(playerFocusOffset),
          activeDialogueNpc.basePosition.add(new Vector3(0, 1.55, 0)),
          0.32,
        )
      : playerRoot.position.add(playerFocusOffset);
    currentCameraTarget = Vector3.Lerp(currentCameraTarget, desiredCameraTarget, 1 - Math.exp(-8 * delta));
    renderedCameraPitch = damp(
      renderedCameraPitch,
      activeDialogueNpc ? Math.max(desiredCameraPitch, 0.5) : desiredCameraPitch,
      10,
      delta,
    );

    const modeDistance = activeDialogueNpc ? Math.min(desiredCameraDistance, 5.6) : desiredCameraDistance;
    let blockedDistance = modeDistance;
    const cameraDir = new Vector3(
      Math.sin(cameraYaw) * Math.cos(renderedCameraPitch),
      Math.sin(renderedCameraPitch),
      Math.cos(cameraYaw) * Math.cos(renderedCameraPitch),
    );
    const desiredCameraPos = currentCameraTarget.add(cameraDir.scale(modeDistance));
    const rayVector = desiredCameraPos.subtract(currentCameraTarget);
    const rayLength = rayVector.length();
    if (rayLength > 0.001) {
      const rayDirection = rayVector.scale(1 / rayLength);
      const hit = scene.pickWithRay(
        new Ray(currentCameraTarget, rayDirection, rayLength),
        (mesh) => {
          if (!mesh.isEnabled() || !mesh.isPickable) return false;
          if (mesh === playerCapsule || mesh === worldGround || mesh === physicsFloor) return false;
          if (mesh.name.startsWith('npc-halo-')) return false;
          if (mesh.isDescendantOf(playerVisual)) return false;
          return true;
        },
        false,
      );
      if (hit?.hit && typeof hit.distance === 'number') {
        blockedDistance = Math.max(2.35, hit.distance - 0.35);
      }
    }
    currentCameraDistance = damp(
      currentCameraDistance,
      Math.min(modeDistance, blockedDistance),
      blockedDistance < modeDistance ? 18 : 7,
      delta,
    );

    const cameraOffset = new Vector3(
      Math.sin(cameraYaw) * Math.cos(renderedCameraPitch) * currentCameraDistance,
      Math.sin(renderedCameraPitch) * currentCameraDistance,
      Math.cos(cameraYaw) * Math.cos(renderedCameraPitch) * currentCameraDistance,
    );
    camera.position = Vector3.Lerp(camera.position, currentCameraTarget.add(cameraOffset), 1 - Math.exp(-14 * delta));
    camera.setTarget(currentCameraTarget);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  return {
    setTalkingNpcId(npcId: string | null) {
      talkingNpcId = npcId;
      if (npcId) {
        isOrbiting = false;
      }
    },
    setAnimState(state: AnimState) {
      playerAnimCtrl?.setState(state);
    },
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerEnd);
      canvas.removeEventListener('pointercancel', onPointerEnd);
      canvas.removeEventListener('pointerleave', onPointerEnd);
      canvas.removeEventListener('wheel', onWheel);
      playerAnimCtrl?.dispose();
      havokPlugin.dispose();
      scene.dispose();
      engine.dispose();
    },
  };
}
