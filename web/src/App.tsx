import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ARCHETYPES, NPCS, ZONES } from './demoData';
import { apiRequest, syncSessionFromUrl, updateStoredSession } from './lib/api';
import { logClientEvent } from './lib/logger';
import {
  createAvatarPreviewScene,
  createGlobeScene,
  createHomeScene,
  createWorldScene,
  type WorldSceneController,
} from './scenes';
import type { Avatar, DialogueMessage, GeocodeResponse, ProfileResponse } from './types';
import './styles.css';

type Screen = 'home' | 'avatar' | 'globe' | 'world';

const HUB_AREA = {
  label: 'NEXUS Plaza',
  moduleTitle: 'Central Hub',
  intro: 'The central hub where the world opens in every direction.',
  interactionHook: 'Move toward the glowing radial paths to explore each leadership district.',
};

function SceneCanvas({
  sceneKey,
  loadScene,
}: {
  sceneKey: string;
  loadScene: (canvas: HTMLCanvasElement) => (() => void) | void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cleanup: (() => void) | void;

    try {
      cleanup = loadScene(canvas);
    } catch (error) {
      void logClientEvent('error', 'scene.init_failed', 'Failed to initialize Babylon scene.', {
        scene: sceneKey,
        error: error instanceof Error ? error.message : 'unknown',
      });
    }

    return () => {
      cleanup?.();
    };
  }, [loadScene, sceneKey]);

  return <canvas className="scene-canvas" data-scene={sceneKey} ref={canvasRef} />;
}

function WorldCanvas({
  avatar,
  dialogueNpcId,
  onZoneChange,
  onInteractableChange,
}: {
  avatar: Avatar | null;
  dialogueNpcId: string | null;
  onZoneChange: (zoneId: string) => void;
  onInteractableChange: (npcId: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerRef = useRef<WorldSceneController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;
    createWorldScene(canvas, {
      avatar,
      zones: ZONES,
      npcs: NPCS,
      onZoneChange,
      onInteractableChange,
    }).then((controller) => {
      if (disposed) {
        controller.dispose();
      } else {
        controllerRef.current = controller;
      }
    });

    return () => {
      disposed = true;
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, [avatar, onInteractableChange, onZoneChange]);

  useEffect(() => {
    controllerRef.current?.setTalkingNpcId(dialogueNpcId);
  }, [dialogueNpcId]);

  return <canvas className="scene-canvas world-scene" ref={canvasRef} />;
}

export default function App() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [profileResponse, setProfileResponse] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasBegun, setHasBegun] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('visionary');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResponse | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string>('nexus-plaza');
  const [zoneBanner, setZoneBanner] = useState<string>('NEXUS Plaza');
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [dialogueNpcId, setDialogueNpcId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, DialogueMessage[]>>({});
  const [draftMessage, setDraftMessage] = useState('');

  const activeAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedAvatarId) || null,
    [avatars, selectedAvatarId],
  );
  const dialogueNpc = useMemo(
    () => NPCS.find((npc) => npc.id === dialogueNpcId) || null,
    [dialogueNpcId],
  );
  const activeZone = useMemo(
    () => ZONES.find((zone) => zone.id === activeZoneId) || null,
    [activeZoneId],
  );
  const recommendedZones = useMemo(() => [...ZONES].sort((a, b) => a.recommendedOrder - b.recommendedOrder), []);
  const currentArea = activeZone || HUB_AREA;
  const homeSceneFactory = useMemo(() => createHomeScene, []);
  const avatarSceneFactory = useMemo(
    () => (canvas: HTMLCanvasElement) => createAvatarPreviewScene(canvas, activeAvatar),
    [activeAvatar],
  );
  const globeSceneFactory = useMemo(
    () => (canvas: HTMLCanvasElement) =>
      createGlobeScene(canvas, selectedPin, (pin) => {
        setSelectedPin(pin);
        setGeocodeResult((current) => (current ? { ...current, lat: pin.lat, lng: pin.lng } : current));
      }),
    [selectedPin],
  );

  const currentScreen: Screen = useMemo(() => {
    if (!hasBegun) return 'home';
    if (!profileResponse?.onboarding.avatarSelected || !profileResponse.onboarding.archetypeSelected) return 'avatar';
    if (!profileResponse.onboarding.locationSaved) return 'globe';
    return 'world';
  }, [hasBegun, profileResponse]);

  useEffect(() => {
    const session = syncSessionFromUrl();
    updateStoredSession(session);
    void refreshAppState();
  }, []);

  useEffect(() => {
    if (!profileResponse) return;

    setSelectedAvatarId(profileResponse.profile.avatarId || avatars.find((avatar) => avatar.status === 'active')?.id || null);
    setSelectedArchetype(profileResponse.profile.archetype || 'visionary');
    if (profileResponse.profile.lat !== null && profileResponse.profile.lng !== null) {
      setSelectedPin({ lat: profileResponse.profile.lat, lng: profileResponse.profile.lng });
      setGeocodeResult({
        label: profileResponse.profile.locationLabel || profileResponse.profile.country,
        country: profileResponse.profile.country || '',
        lat: profileResponse.profile.lat,
        lng: profileResponse.profile.lng,
      });
      setSearchQuery(profileResponse.profile.locationLabel || profileResponse.profile.country || '');
    }
  }, [avatars, profileResponse]);

  useEffect(() => {
    setZoneBanner(currentArea.label);
    const timer = window.setTimeout(() => {
      setZoneBanner((current) => (current === currentArea.label ? '' : current));
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [currentArea]);

  useEffect(() => {
    if (currentScreen !== 'world') return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialogueNpcId) {
        setDialogueNpcId(null);
        return;
      }

      if ((event.key === 'e' || event.key === 'E') && activeNpcId && !dialogueNpcId) {
        openDialogue(activeNpcId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeNpcId, currentScreen, dialogueNpcId]);

  async function refreshAppState() {
    try {
      setLoading(true);
      setError('');
      const [avatarPayload, profilePayload] = await Promise.all([
        apiRequest<{ avatars: Avatar[] }>('/api/avatars'),
        apiRequest<ProfileResponse>('/api/profile/me'),
      ]);
      setAvatars(avatarPayload.avatars);
      setProfileResponse(profilePayload);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unknown error';
      await logClientEvent('error', 'app.bootstrap_failed', 'Failed to bootstrap the client.', { message });
      // Fallback to demo mode when backend is unavailable
      setProfileResponse({
        user: { id: 'demo', ltiUserId: 'demo', displayName: 'Explorer', locale: 'en', countryHint: 'US' },
        profile: {
          avatarId: 'default', avatar: null, archetype: 'explorer', country: 'US',
          locationLabel: 'Demo', lat: 33.4, lng: -111.9, topTraits: [], preferredStyle: '',
          taskRelationshipBalance: null, strongestSkill: '', conflictStyle: '', powerBase: '',
          leadershipGoal: '', onboardingCompleted: true,
        },
        onboarding: { complete: true, avatarSelected: true, archetypeSelected: true, locationSaved: true, leadershipCompleted: true },
      } as ProfileResponse);
      setAvatars([]);
      setError('');
    } finally {
      setLoading(false);
    }
  }

  async function saveAvatarSelection() {
    if (!selectedAvatarId || !selectedArchetype) return;
    setSubmitting(true);
    try {
      const nextProfile = await apiRequest<ProfileResponse>('/api/profile/avatar', {
        method: 'POST',
        bodyJson: { avatarId: selectedAvatarId, archetype: selectedArchetype },
      });
      setProfileResponse(nextProfile);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save avatar.');
    } finally {
      setSubmitting(false);
    }
  }

  async function searchLocation() {
    if (!searchQuery.trim()) return;
    setSubmitting(true);
    try {
      const result = await apiRequest<GeocodeResponse>('/api/geocode', {
        method: 'POST',
        bodyJson: { query: searchQuery.trim() },
      });
      setGeocodeResult(result);
      setSelectedPin({ lat: result.lat, lng: result.lng });
      setSearchQuery(result.label);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to find that location.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveLocation() {
    if (!geocodeResult || !selectedPin) return;
    setSubmitting(true);
    try {
      const nextProfile = await apiRequest<ProfileResponse>('/api/profile/location', {
        method: 'POST',
        bodyJson: {
          country: geocodeResult.country,
          locationLabel: geocodeResult.label,
          lat: selectedPin.lat,
          lng: selectedPin.lng,
        },
      });
      setProfileResponse(nextProfile);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save location.');
    } finally {
      setSubmitting(false);
    }
  }

  function openDialogue(npcId: string) {
    const npc = NPCS.find((entry) => entry.id === npcId);
    if (!npc) return;

    setDialogueNpcId(npcId);
    setDraftMessage('');
    setConversations((current) => {
      if (current[npcId]?.length) return current;
      return {
        ...current,
        [npcId]: [{ role: 'assistant', content: npc.introLine }],
      };
    });
  }

  async function sendDialogueMessage() {
    if (!dialogueNpcId || !draftMessage.trim() || submitting) return;

    const outgoing = draftMessage.trim();
    setDraftMessage('');
    const nextMessages = [...(conversations[dialogueNpcId] || []), { role: 'user' as const, content: outgoing }];
    setConversations((current) => ({
      ...current,
      [dialogueNpcId]: nextMessages,
    }));

    setSubmitting(true);
    try {
      const response = await apiRequest<{ reply: string }>('/api/npc-chat', {
        method: 'POST',
        bodyJson: {
          npcId: dialogueNpcId,
          messages: nextMessages,
        },
      });
      setConversations((current) => ({
        ...current,
        [dialogueNpcId]: [...(current[dialogueNpcId] || nextMessages), { role: 'assistant', content: response.reply }],
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to reach the NPC.');
      setConversations((current) => ({
        ...current,
        [dialogueNpcId]: [
          ...(current[dialogueNpcId] || nextMessages),
          { role: 'assistant', content: 'The link between worlds flickers. Ask again in a moment.' },
        ],
      }));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !profileResponse) {
    return (
      <main className="loading-shell">
        <div className="loading-card">
          <p className="eyebrow">NEXUS</p>
          <h1>Preparing the leadership frontier</h1>
          <p>Loading your profile, prototype avatar catalog, and the world shell.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="nexus-shell">
      {currentScreen === 'home' ? (
        <main className="home-screen">
          <section className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow">ASU CISA • OGL 200</p>
              <h1>NEXUS: Leadership Frontier</h1>
              <p className="hero-lead">
                A prototype open world where organizational leadership becomes a place to explore, question, and inhabit.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => setHasBegun(true)} type="button">
                  {profileResponse.onboarding.complete ? 'Resume World' : 'Begin Journey'}
                </button>
                <span className="hero-hint">Single-player prototype • Academic fantasy world • AI NPC mentors</span>
              </div>
            </div>
            <div className="hero-scene">
              <SceneCanvas sceneKey="home-scene" loadScene={homeSceneFactory} />
            </div>
          </section>
        </main>
      ) : null}

      {currentScreen === 'avatar' ? (
        <main className="screen-shell">
          <header className="screen-header">
            <div>
              <p className="eyebrow">Step 1</p>
              <h2>Choose your prototype avatar</h2>
            </div>
            <p className="screen-copy">
              For this vertical slice, one production-path character is active and the rest remain clearly marked placeholders.
            </p>
          </header>

          <section className="screen-grid avatar-layout">
            <div className="catalog-panel">
              <div className="avatar-grid">
                {avatars.map((avatar) => {
                  const selectable = avatar.status === 'active';
                  return (
                    <button
                      key={avatar.id}
                      className={`avatar-card ${selectedAvatarId === avatar.id ? 'is-selected' : ''} ${!selectable ? 'is-placeholder' : ''}`}
                      disabled={!selectable}
                      onClick={() => selectable && setSelectedAvatarId(avatar.id)}
                      type="button"
                    >
                      <span
                        className="avatar-swatches"
                        style={{ background: `linear-gradient(135deg, ${avatar.previewConfig.outfit}, ${avatar.previewConfig.accent})` }}
                      />
                      <span className="avatar-card-copy">
                        <strong>{avatar.displayName}</strong>
                        <small>{avatar.status === 'active' ? 'Runtime ready' : 'Coming next'}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="archetype-grid">
                {ARCHETYPES.map((archetype) => (
                  <button
                    key={archetype.id}
                    className={`archetype-card ${selectedArchetype === archetype.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedArchetype(archetype.id)}
                    style={{ '--card-accent': archetype.accent } as CSSProperties}
                    type="button"
                  >
                    <strong>{archetype.label}</strong>
                    <span>{archetype.summary}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="preview-panel">
              <SceneCanvas sceneKey="avatar-preview-scene" loadScene={avatarSceneFactory} />
              <div className="preview-copy">
                <span className="label">Selected</span>
                <strong>{activeAvatar?.displayName || 'Prototype character'}</strong>
                <p>{ARCHETYPES.find((item) => item.id === selectedArchetype)?.summary}</p>
              </div>
            </div>
          </section>

          <footer className="screen-footer">
            <button className="ghost-button" onClick={() => setHasBegun(false)} type="button">
              Back
            </button>
            <button
              className="primary-button"
              disabled={!activeAvatar || activeAvatar.status !== 'active' || submitting}
              onClick={() => void saveAvatarSelection()}
              type="button"
            >
              Continue to Globe
            </button>
          </footer>
        </main>
      ) : null}

      {currentScreen === 'globe' ? (
        <main className="screen-shell">
          <header className="screen-header">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Pin your location on the globe</h2>
            </div>
            <p className="screen-copy">
              Search for a city, country, or exact location. The demo uses the returned coordinates directly for your world origin.
            </p>
          </header>

          <section className="screen-grid globe-layout">
            <div className="globe-panel">
              <SceneCanvas sceneKey="globe-scene" loadScene={globeSceneFactory} />
            </div>

            <div className="search-panel">
              <label className="field-label" htmlFor="location-query">
                Location search
              </label>
              <div className="search-row">
                <input
                  id="location-query"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void searchLocation();
                  }}
                  placeholder="Phoenix, Arizona or India"
                  value={searchQuery}
                />
                <button className="primary-button" disabled={submitting || !searchQuery.trim()} onClick={() => void searchLocation()} type="button">
                  Search
                </button>
              </div>

              <div className="coordinate-card">
                <span className="label">Resolved location</span>
                <strong>{geocodeResult?.label || 'Search to place your exact pin'}</strong>
                <small>
                  {selectedPin
                    ? `Lat ${selectedPin.lat.toFixed(4)} • Lng ${selectedPin.lng.toFixed(4)}`
                    : 'No coordinates selected yet'}
                </small>
              </div>

              <div className="search-hint-card">
                <strong>Prototype rule</strong>
                <p>Search-driven geocoding is the preferred path. Direct globe clicking still works as a visual override once a result has been found.</p>
              </div>
            </div>
          </section>

          <footer className="screen-footer">
            <button className="ghost-button" onClick={() => setHasBegun(false)} type="button">
              Start Over
            </button>
            <button className="primary-button" disabled={!geocodeResult || !selectedPin || submitting} onClick={() => void saveLocation()} type="button">
              Enter World
            </button>
          </footer>
        </main>
      ) : null}

      {currentScreen === 'world' ? (
        <main className="world-shell">
          <aside className="world-sidebar">
            <p className="eyebrow">NEXUS Plaza</p>
            <h2>Leadership Frontier</h2>
            <p className="world-copy">
              A compact seven-zone prototype. Every district maps to a course concept, and the world gently points you first toward Leadership Hall and Vision Tower.
            </p>

            <div className="identity-card">
              <div>
                <span className="label">Player</span>
                <strong>{profileResponse.user.displayName}</strong>
              </div>
              <div>
                <span className="label">Archetype</span>
                <strong>{ARCHETYPES.find((item) => item.id === profileResponse.profile.archetype)?.label || 'Not selected'}</strong>
              </div>
              <div>
                <span className="label">Origin</span>
                <strong>{profileResponse.profile.locationLabel || profileResponse.profile.country || 'Unpinned'}</strong>
              </div>
            </div>

            <div className="zone-list">
              {recommendedZones.map((zone) => (
                <div key={zone.id} className={`zone-list-item ${activeZoneId === zone.id ? 'is-active' : ''}`}>
                  <strong>{zone.label}</strong>
                  <small>{zone.interactionHook}</small>
                </div>
              ))}
            </div>

            <div className="world-help">
              <strong>Controls</strong>
              <p>
                <code>WASD</code> to move, <code>Shift</code> to sprint, <code>E</code> near an NPC to speak, and <code>Esc</code> to
                close dialogue.
              </p>
            </div>
          </aside>

          <section className="world-stage">
            <WorldCanvas
              avatar={profileResponse.profile.avatar}
              dialogueNpcId={dialogueNpcId}
              onInteractableChange={setActiveNpcId}
              onZoneChange={setActiveZoneId}
            />

            {zoneBanner ? (
              <div className="zone-banner">
                <span className="label">{currentArea.moduleTitle}</span>
                <strong>{zoneBanner}</strong>
                <small>{currentArea.intro}</small>
              </div>
            ) : null}

            <div className="hud-card">
              <span className="label">Current zone</span>
              <strong>{currentArea.label}</strong>
              <small>{currentArea.interactionHook}</small>
            </div>

            {activeNpcId && !dialogueNpcId ? (
              <button className="interact-prompt" onClick={() => openDialogue(activeNpcId)} type="button">
                <span className="label">Nearby mentor</span>
                <strong>Press E to speak with {NPCS.find((npc) => npc.id === activeNpcId)?.name}</strong>
              </button>
            ) : null}

            {dialogueNpc ? (
              <div className="dialogue-panel">
                <div className="dialogue-header">
                  <div>
                    <span className="label">{ZONES.find((zone) => zone.id === dialogueNpc.zoneId)?.label}</span>
                    <strong>{dialogueNpc.name}</strong>
                  </div>
                  <button className="ghost-button" onClick={() => setDialogueNpcId(null)} type="button">
                    Close
                  </button>
                </div>

                <div className="dialogue-log">
                  {(conversations[dialogueNpc.id] || []).map((message, index) => (
                    <div key={`${dialogueNpc.id}-${index}`} className={`dialogue-bubble ${message.role === 'assistant' ? 'is-assistant' : 'is-user'}`}>
                      {message.content}
                    </div>
                  ))}
                </div>

                <div className="dialogue-compose">
                  <textarea
                    onChange={(event) => setDraftMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        event.preventDefault();
                        void sendDialogueMessage();
                      }
                    }}
                    placeholder="Ask about the zone, the concept, or how your own leadership instincts show up here."
                    value={draftMessage}
                  />
                  <button className="primary-button" disabled={submitting || !draftMessage.trim()} onClick={() => void sendDialogueMessage()} type="button">
                    Send
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </main>
      ) : null}

      {error ? <div className="error-toast">{error}</div> : null}
    </div>
  );
}
