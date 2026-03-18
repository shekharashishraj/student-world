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
type WorldOverlayPanel = 'guide' | 'controls';

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

function GuideIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M6 5.75A2.75 2.75 0 0 1 8.75 3h9.5A1.75 1.75 0 0 1 20 4.75v13.5A1.75 1.75 0 0 1 18.25 20h-9.5A2.75 2.75 0 0 0 6 22.75V5.75Zm0 0A2.75 2.75 0 0 0 3.25 3H5.5A.5.5 0 0 1 6 3.5v2.25Zm4.25 1.5h5.5m-5.5 4h5.5m-5.5 4h3.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ControlsIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <rect height="13" rx="3" stroke="currentColor" strokeWidth="1.7" width="18" x="3" y="5.5" />
      <path d="M8 10v4m-2-2h4m5-1.5h.01m2.49 3h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
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
  const [enteringWorld, setEnteringWorld] = useState<string | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [dialogueNpcId, setDialogueNpcId] = useState<string | null>(null);
  const [activeWorldPanel, setActiveWorldPanel] = useState<WorldOverlayPanel | null>(null);
  const [showHomeControls, setShowHomeControls] = useState(false);
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

  const enterWorld = (zoneId: string) => {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (!zone) return;
    setEnteringWorld(zoneId);
    // Placeholder — will load the inner world scene when built
    console.log(`Entering world: ${zone.label}`);
    setTimeout(() => setEnteringWorld(null), 2400);
  };

  // Close home controls panel on ESC
  useEffect(() => {
    if (currentScreen !== 'home' || !showHomeControls) return undefined;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowHomeControls(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [currentScreen, showHomeControls]);

  useEffect(() => {
    if (currentScreen !== 'world') return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialogueNpcId) {
        setDialogueNpcId(null);
        return;
      }

      if (event.key === 'Escape' && activeWorldPanel) {
        setActiveWorldPanel(null);
        return;
      }

      if ((event.key === 'e' || event.key === 'E') && activeNpcId && !dialogueNpcId && !activeWorldPanel) {
        openDialogue(activeNpcId);
      }

      if ((event.key === 'f' || event.key === 'F') && !event.repeat && activeZoneId !== 'nexus-plaza' && !dialogueNpcId && !activeWorldPanel && !enteringWorld) {
        enterWorld(activeZoneId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeNpcId, activeWorldPanel, activeZoneId, currentScreen, dialogueNpcId, enteringWorld]);

  useEffect(() => {
    if (currentScreen === 'world') return;
    setActiveWorldPanel(null);
  }, [currentScreen]);

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

    setActiveWorldPanel(null);
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
    <div className={`nexus-shell ${currentScreen === 'world' ? 'is-world' : ''}`}>
      {currentScreen === 'home' ? (
        <main className="home-screen cinematic">
          {/* Full-bleed 3D scene background */}
          <div className="hero-scene-bg">
            <SceneCanvas sceneKey="home-scene" loadScene={homeSceneFactory} />
          </div>

          {/* Dark vignette + gradient overlays */}
          <div className="hero-vignette" />
          <div className="hero-letterbox hero-letterbox--top" />
          <div className="hero-letterbox hero-letterbox--bottom" />

          {/* Floating dust particles */}
          <div className="hero-particles">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="hero-particle" style={{
                left: `${6 + (i * 37 + 13) % 88}%`,
                top: `${10 + (i * 53 + 7) % 75}%`,
                animationDelay: `${(i * 1.3) % 8}s`,
                animationDuration: `${6 + (i % 5) * 2}s`,
                opacity: 0.15 + (i % 4) * 0.1,
                width: `${2 + (i % 3)}px`,
                height: `${2 + (i % 3)}px`,
              } as React.CSSProperties} />
            ))}
          </div>

          {/* Title + menu — centered overlay */}
          <div className="hero-overlay">
            <p className="hero-eyebrow anim-fade-in">ASU CISA &bull; OGL 200</p>
            <h1 className="hero-title">
              <span className="hero-title-main anim-slide-left">NEXUS</span>
              <span className="hero-title-sub anim-slide-right">Leadership Frontier</span>
            </h1>
            <nav className="hero-menu anim-menu-in">
              <button className="hero-menu-item" onClick={() => setHasBegun(true)} type="button">
                {profileResponse.onboarding.complete ? 'Resume World' : 'Start Game'}
              </button>
              <button className="hero-menu-item" onClick={() => setShowHomeControls(true)} type="button">
                Controls
              </button>
            </nav>
            <p className="hero-tagline anim-fade-in-late">
              Single-player prototype &bull; Academic fantasy world &bull; AI NPC mentors
            </p>
          </div>

          {/* Controls overlay panel */}
          {showHomeControls && (
            <>
              <div className="home-controls-backdrop" onClick={() => setShowHomeControls(false)} />
              <div className="home-controls-panel">
                <div className="home-controls-header">
                  <h2>Controls</h2>
                  <button className="home-controls-close" onClick={() => setShowHomeControls(false)} type="button">
                    &times;
                  </button>
                </div>
                <table className="home-controls-table">
                  <tbody>
                    <tr><td><kbd>W</kbd></td><td>Move Forward</td></tr>
                    <tr><td><kbd>A</kbd></td><td>Move Left</td></tr>
                    <tr><td><kbd>S</kbd></td><td>Move Backward</td></tr>
                    <tr><td><kbd>D</kbd></td><td>Move Right</td></tr>
                    <tr><td><kbd>WASD</kbd> + <kbd>Shift</kbd></td><td>Sprint</td></tr>
                    <tr><td><kbd>E</kbd></td><td>Talk to NPC</td></tr>
                    <tr><td><kbd>F</kbd></td><td>Enter Zone World</td></tr>
                    <tr><td><kbd>Mouse</kbd></td><td>Look Around / Rotate Camera</td></tr>
                    <tr><td><kbd>Scroll</kbd></td><td>Zoom In / Out</td></tr>
                    <tr><td><kbd>Esc</kbd></td><td>Close Dialogue / Panels</td></tr>
                  </tbody>
                </table>
                <p className="home-controls-hint">Press <kbd>Esc</kbd> to close</p>
              </div>
            </>
          )}
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
          <section className="world-stage">
            <WorldCanvas
              avatar={profileResponse.profile.avatar}
              dialogueNpcId={dialogueNpcId}
              onInteractableChange={setActiveNpcId}
              onZoneChange={setActiveZoneId}
            />

            <div className="world-utility-rail">
              <button
                aria-controls="world-guide-panel"
                aria-expanded={activeWorldPanel === 'guide'}
                aria-label="Open world guide"
                className={`world-utility-button ${activeWorldPanel === 'guide' ? 'is-active' : ''}`}
                onClick={() => setActiveWorldPanel((current) => (current === 'guide' ? null : 'guide'))}
                title="Guide"
                type="button"
              >
                <GuideIcon />
              </button>
              <button
                aria-controls="world-controls-panel"
                aria-expanded={activeWorldPanel === 'controls'}
                aria-label="Open controls"
                className={`world-utility-button ${activeWorldPanel === 'controls' ? 'is-active' : ''}`}
                onClick={() => setActiveWorldPanel((current) => (current === 'controls' ? null : 'controls'))}
                title="Controls"
                type="button"
              >
                <ControlsIcon />
              </button>
            </div>

            {activeWorldPanel ? (
              <aside
                className={`world-overlay-panel ${activeWorldPanel === 'guide' ? 'is-guide' : 'is-controls'}`}
                id={activeWorldPanel === 'guide' ? 'world-guide-panel' : 'world-controls-panel'}
              >
                <div className="world-overlay-header">
                  <div>
                    <span className="label">{activeWorldPanel === 'guide' ? 'World Guide' : 'Controls'}</span>
                    <strong>{activeWorldPanel === 'guide' ? 'Leadership Frontier' : 'How to Move Through NEXUS'}</strong>
                  </div>
                  <button className="ghost-button" onClick={() => setActiveWorldPanel(null)} type="button">
                    Close
                  </button>
                </div>

                <div className="world-overlay-body">
                  {activeWorldPanel === 'guide' ? (
                    <>
                      <p className="world-copy">
                        A compact seven-zone prototype. Every district maps to a course concept, and the world gently points you first toward
                        Leadership Hall and Vision Tower.
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

                      <div className="world-overlay-section world-help">
                        <span className="label">What you can do here</span>
                        <strong>Explore, approach, and ask questions.</strong>
                        <p className="world-copy">
                          Walk the hub, follow the radiant paths into each district, and speak with mentor NPCs to learn how leadership ideas
                          show up in the world.
                        </p>
                      </div>

                      <div className="zone-list world-panel-zone-list">
                        {recommendedZones.map((zone) => (
                          <div key={zone.id} className={`zone-list-item ${activeZoneId === zone.id ? 'is-active' : ''}`}>
                            <strong>{zone.label}</strong>
                            <small>{zone.interactionHook}</small>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="world-help world-controls-card">
                      <span className="label">Controls</span>
                      <strong>Stay focused on the world.</strong>
                      <p className="world-copy">
                        <code>WASD</code> moves, <code>Shift</code> sprints, <code>E</code> speaks with nearby mentors, <code>F</code> enters a world zone, and <code>Esc</code>{' '}
                        closes dialogue or HUD panels.
                      </p>
                      <p className="world-copy">
                        Follow the glowing paths to reach each zone, then stop near an NPC when you want to ask questions about that district.
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            ) : null}

            <div className="hud-card">
              <span className="label">{currentArea.moduleTitle}</span>
              <strong>{currentArea.label}</strong>
              <small>{currentArea.intro}</small>
              {activeZoneId !== 'nexus-plaza' && !dialogueNpcId && !enteringWorld && (
                <div className="enter-prompt">
                  <kbd>F</kbd> Enter this world
                </div>
              )}
            </div>

            {enteringWorld ? (
              <div className="world-transition-overlay">
                <div className="world-transition-card">
                  <span className="label">Entering</span>
                  <strong>{ZONES.find((z) => z.id === enteringWorld)?.label}</strong>
                  <div className="world-transition-bar" />
                  <small>Preparing world — coming soon</small>
                </div>
              </div>
            ) : null}

            {activeNpcId && !dialogueNpcId && !activeWorldPanel ? (
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
