export type ClipNames = {
  idle: string;
  walk: string;
  run: string;
  talk: string;
};

export type Avatar = {
  id: string;
  slug: string;
  displayName: string;
  glbUrl: string | null;
  runtimeGlbUrl?: string | null;
  thumbnailUrl: string | null;
  previewImageUrl?: string | null;
  status: 'active' | 'placeholder';
  usage: 'player' | 'npc' | 'shared';
  clipNames: ClipNames;
  sortOrder: number;
  isActive: boolean;
  previewConfig: {
    skin: string;
    outfit: string;
    accent: string;
    hair: string;
  };
};

export type OnboardingStatus = {
  avatarSelected: boolean;
  locationSaved: boolean;
  archetypeSelected: boolean;
  leadershipCompleted: boolean;
  complete: boolean;
};

export type Profile = {
  avatarId: string | null;
  avatar: Avatar | null;
  archetype: string;
  country: string;
  locationLabel: string;
  lat: number | null;
  lng: number | null;
  topTraits: string[];
  preferredStyle: string;
  taskRelationshipBalance: number | null;
  strongestSkill: string;
  conflictStyle: string;
  powerBase: string;
  leadershipGoal: string;
  onboardingCompleted: boolean;
};

export type ProfileResponse = {
  user: {
    id: string;
    ltiUserId: string;
    displayName: string;
    locale: string;
    countryHint: string;
  };
  profile: Profile;
  onboarding: OnboardingStatus;
};

export type ClientSession = {
  ltiUserId: string;
  displayName: string;
  countryHint: string;
  locale: string;
};

export type Archetype = {
  id: string;
  label: string;
  accent: string;
  summary: string;
};

export type ZoneConfig = {
  id: string;
  label: string;
  moduleTitle: string;
  worldPosition: [number, number, number];
  color: string;
  accent: string;
  ambientPreset: string;
  npcId: string;
  depth: 'deep' | 'light';
  recommendedOrder: number;
  intro: string;
  interactionHook: string;
};

export type NpcConfig = {
  id: string;
  name: string;
  zoneId: string;
  characterAssetId: string;
  promptKey: string;
  introLine: string;
  interactionMode: 'deep' | 'light';
  interactionRadius: number;
};

export type DialogueMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GeocodeResponse = {
  label: string;
  country: string;
  lat: number;
  lng: number;
};
