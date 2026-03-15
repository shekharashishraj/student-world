const PROFILE_OPTIONS = {
  topTraits: ['Drive', 'Motivation', 'Cognitive Ability', 'Confidence', 'Integrity', 'Knowledge'],
  preferredStyles: ['Authoritarian', 'Democratic', 'Laissez-faire'],
  strongestSkills: [
    'Communication',
    'Organizing',
    'Problem Solving',
    'Relationship Building',
    'Strategic Thinking',
    'Follow-through',
  ],
  conflictStyles: ['Collaborating', 'Competing', 'Avoiding', 'Accommodating', 'Compromising'],
  powerBases: ['Legitimate', 'Reward', 'Expert', 'Referent', 'Coercive'],
};

const ARCHETYPES = [
  {
    id: 'visionary',
    label: 'The Visionary',
    accent: '#5BD37B',
    summary: 'Sees the destination before the path is obvious to others.',
  },
  {
    id: 'collaborator',
    label: 'The Collaborator',
    accent: '#5CAAF2',
    summary: 'Builds trust, inclusion, and momentum through connection.',
  },
  {
    id: 'mediator',
    label: 'The Mediator',
    accent: '#F0A356',
    summary: 'Brings order and understanding to difficult moments.',
  },
  {
    id: 'innovator',
    label: 'The Innovator',
    accent: '#CC6BEB',
    summary: 'Finds unconventional paths through obstacles and ambiguity.',
  },
];

const MODULES = [
  {
    id: 'module-1',
    title: 'Understanding Leadership & Recognizing Your Traits',
    status: 'planned',
  },
  {
    id: 'module-2',
    title: 'Understanding Leadership Styles & Attending to Tasks and Relationships',
    status: 'active',
  },
  {
    id: 'module-3',
    title: 'Developing Leadership Skills & Engaging Strengths',
    status: 'planned',
  },
  {
    id: 'module-4',
    title: 'Creating a Vision & Working with Groups',
    status: 'planned',
  },
  {
    id: 'module-5',
    title: 'Embracing Diversity and Inclusion & Managing Conflict',
    status: 'planned',
  },
  {
    id: 'module-6',
    title: 'Addressing Ethics in Leadership & Exploring Destructive Leadership',
    status: 'planned',
  },
];

const MODULE_TWO_OBJECTIVE_TAGS = [
  'identify_styles_of_leadership',
  'compare_authoritarian_democratic_laissez_faire',
  'task_and_relationship_balance',
  'practice_decision_making_in_scenario',
  'collaborate_with_dissenting_opinions',
];

const AVATAR_SEEDS = [
  {
    slug: 'lara-prototype',
    displayName: 'Lara Prototype',
    sortOrder: 1,
    glbUrl: '/assets/demo/characters/prototype-rig/glb/lara-croft-prototype.glb',
    thumbnailUrl: null,
    status: 'active',
    usage: 'shared',
    clipNames: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    previewConfig: { skin: '#d5b08a', outfit: '#4d3a31', accent: '#d8b05f', hair: '#2b211e' },
  },
  {
    slug: 'selene-placeholder',
    displayName: 'Selene',
    sortOrder: 2,
    glbUrl: null,
    thumbnailUrl: null,
    status: 'placeholder',
    usage: 'shared',
    clipNames: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    previewConfig: { skin: '#f0c2b0', outfit: '#6f2941', accent: '#f2cc8f', hair: '#2f1b0c' },
  },
  {
    slug: 'orion-placeholder',
    displayName: 'Orion',
    sortOrder: 3,
    glbUrl: null,
    thumbnailUrl: null,
    status: 'placeholder',
    usage: 'shared',
    clipNames: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    previewConfig: { skin: '#a86f4b', outfit: '#264653', accent: '#e9c46a', hair: '#111827' },
  },
  {
    slug: 'lyra-placeholder',
    displayName: 'Lyra',
    sortOrder: 4,
    glbUrl: null,
    thumbnailUrl: null,
    status: 'placeholder',
    usage: 'shared',
    clipNames: { idle: 'idle', walk: 'walk', run: 'run', talk: 'talk' },
    previewConfig: { skin: '#d89b6b', outfit: '#51306f', accent: '#48cae4', hair: '#2d1f1a' },
  },
];

module.exports = {
  ARCHETYPES,
  AVATAR_SEEDS,
  MODULES,
  MODULE_TWO_OBJECTIVE_TAGS,
  PROFILE_OPTIONS,
};
