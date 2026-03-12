import { useState } from "react"

// ─── Color System ─────────────────────────────────────────────────────────────
const C = {
  bg: '#050d1f',
  surface: 'rgba(8, 18, 42, 0.97)',
  border: 'rgba(100, 180, 255, 0.12)',
  borderGlow: 'rgba(126, 200, 227, 0.45)',
  primary: '#7ec8e3',
  blue: '#4a9eff',
  gold: '#fbbf24',
  purple: '#c084fc',
  green: '#34d399',
  red: '#f87171',
  text: '#e8edf5',
  muted: 'rgba(232, 237, 245, 0.42)',
  dim: 'rgba(232, 237, 245, 0.18)',
}

const SCREENS = ['Welcome', 'Join Flow', 'Game HUD', 'Quests & Badges', 'Dashboard']

// ─── Mock Data ────────────────────────────────────────────────────────────────
const STUDENTS = [
  { name: 'Maria Santos',  country: 'Brazil',   xp: 210, style: 'Democratic',   strength: 'Empathy',        value: 'Integrity',     badges: ['explorer','pioneer','bridge'] },
  { name: 'Yuki Tanaka',   country: 'Japan',    xp: 185, style: 'Authoritarian', strength: 'Strategy',       value: 'Harmony',       badges: ['explorer','traveler','ally'] },
  { name: 'Amir Hassan',   country: 'Egypt',    xp: 165, style: 'Democratic',   strength: 'Communication',  value: 'Courage',       badges: ['explorer'] },
  { name: 'Sofia Chen',    country: 'China',    xp: 240, style: 'Laissez-faire', strength: 'Empathy',       value: 'Wisdom',        badges: ['explorer','pioneer','bridge','traveler'] },
  { name: 'Lucas Müller',  country: 'Germany',  xp: 135, style: 'Democratic',   strength: 'Execution',      value: 'Transparency',  badges: ['explorer'] },
]

const ME = { name: 'Ash', country: 'USA', value: 'Innovation', style: 'Democratic', strength: 'Strategy', xp: 145, level: 3, xpToNext: 200, badges: ['explorer','bridge'] }

const QUESTS = [
  { id: 'q-join',    icon: '📍', title: 'First Steps',     desc: 'Drop your pin on the map',                          xp: 0,  status: 'done',      progress: 1, total: 1, tag: 'Onboarding' },
  { id: 'q-pioneer', icon: '🥇', title: 'Pioneer',         desc: 'Be the first from your country',                    xp: 0,  status: 'done',      progress: 1, total: 1, tag: 'Onboarding' },
  { id: 'q-bridge',  icon: '🌉', title: 'Bridge Builder',  desc: 'Click a pin from a different continent',            xp: 25, status: 'done',      progress: 1, total: 1, tag: 'Exploration' },
  { id: 'q-seeker',  icon: '💬', title: 'Story Seeker',    desc: 'Read 5 different cultural insights',                xp: 40, status: 'active',    progress: 3, total: 5, tag: 'Exploration' },
  { id: 'q-ally',    icon: '🤝', title: 'Value Ally',      desc: 'Find someone who shares your leadership value',     xp: 30, status: 'active',    progress: 0, total: 1, tag: 'Connection' },
  { id: 'q-style',   icon: '🎭', title: 'Style Seeker',    desc: 'Connect with someone with a different style',       xp: 25, status: 'available', progress: 0, total: 1, tag: 'M2' },
  { id: 'q-network', icon: '🔗', title: 'Global Network',  desc: 'Connect with 3 students from different countries',  xp: 50, status: 'available', progress: 1, total: 3, tag: 'Connection' },
  { id: 'q-vision',  icon: '💡', title: 'Vision Builder',  desc: 'Contribute a word to the class vision wall',        xp: 20, status: 'locked',    progress: 0, total: 1, tag: 'M4' },
  { id: 'q-power',   icon: '⚡', title: 'Power Mapper',    desc: 'Connect with students across all 5 power bases',    xp: 75, status: 'locked',    progress: 0, total: 5, tag: 'M6' },
]

const BADGES = [
  { id: 'explorer',      icon: '🌍', label: 'Explorer',           desc: 'Joined the map',                    earned: true,  xp: 0  },
  { id: 'storyteller',   icon: '📖', label: 'Story Teller',       desc: 'Submitted a leadership insight',    earned: true,  xp: 15 },
  { id: 'bridge',        icon: '🌉', label: 'Bridge Builder',      desc: 'Clicked pins from 3+ continents',   earned: true,  xp: 30 },
  { id: 'pioneer',       icon: '🥇', label: 'Pioneer',             desc: 'First from your country',           earned: false, xp: 0  },
  { id: 'traveler',      icon: '🗺️', label: 'World Traveler',      desc: 'Clicked 5+ countries',             earned: false, xp: 40 },
  { id: 'ally',          icon: '🤝', label: 'Value Ally',          desc: 'Found same leadership value',       earned: false, xp: 20 },
  { id: 'style-bridge',  icon: '🎭', label: 'Style Bridger',       desc: 'Connected with different style',    earned: false, xp: 25 },
  { id: 'trait-twin',    icon: '💎', label: 'Trait Twin',          desc: 'Found student with same top trait', earned: false, xp: 25 },
  { id: 'strength-combo',icon: '⚡', label: 'Strength Combo',      desc: 'Connected complementary strengths', earned: false, xp: 35 },
  { id: 'connector',     icon: '🔗', label: 'Connector',           desc: 'Made first connection',             earned: false, xp: 20 },
  { id: 'global',        icon: '🌐', label: 'Global Network',      desc: 'Connected with 3 students',         earned: false, xp: 50 },
  { id: 'inclusion',     icon: '🏆', label: 'Inclusion Champion',  desc: 'Connections across 4+ regions',     earned: false, xp: 60 },
]

// Fixed star positions (avoid Math.random() in render)
const STARS = [
  {x:5,y:8,s:1},{x:12,y:22,s:2},{x:18,y:5,s:1},{x:25,y:35,s:1},{x:32,y:15,s:2},
  {x:40,y:72,s:1},{x:47,y:3,s:1},{x:53,y:55,s:2},{x:60,y:18,s:1},{x:67,y:88,s:1},
  {x:73,y:42,s:2},{x:80,y:12,s:1},{x:87,y:65,s:1},{x:92,y:30,s:2},{x:97,y:80,s:1},
  {x:8,y:50,s:1},{x:15,y:78,s:1},{x:22,y:62,s:2},{x:30,y:90,s:1},{x:38,y:28,s:1},
  {x:45,y:82,s:2},{x:52,y:40,s:1},{x:58,y:95,s:1},{x:65,y:10,s:2},{x:72,y:58,s:1},
  {x:79,y:22,s:1},{x:85,y:75,s:2},{x:90,y:48,s:1},{x:95,y:6,s:1},{x:3,y:37,s:2},
]

// ─── Shared Components ─────────────────────────────────────────────────────────
function Panel({ style, children, glow }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${glow ? C.borderGlow : C.border}`,
      borderRadius: 16,
      boxShadow: glow
        ? `0 0 0 1px rgba(126,200,227,0.06), 0 8px 40px rgba(0,0,0,0.55)`
        : `0 8px 40px rgba(0,0,0,0.45)`,
      position: 'relative',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Tag({ children, color = C.primary, bg }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      background: bg || `${color}18`,
      border: `1px solid ${color}30`,
      color: color,
      padding: '2px 9px', borderRadius: 99,
      display: 'inline-block', lineHeight: 1.7,
    }}>
      {children}
    </span>
  )
}

function XPBar({ current, max, level }) {
  const pct = Math.min(100, (current / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ fontSize: 9, color: C.gold, fontFamily: 'monospace', fontWeight: 700, minWidth: 20 }}>L{level}</span>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${C.gold}, #f59e0b)`,
          borderRadius: 99,
          boxShadow: `0 0 6px ${C.gold}80`,
        }} />
      </div>
      <span style={{ fontSize: 9, color: C.muted, fontFamily: 'monospace', minWidth: 52 }}>{current}/{max} XP</span>
    </div>
  )
}

function Avatar({ name, color, size = 36, glow }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
      boxShadow: glow ? `0 0 18px ${color}70` : 'none',
    }}>
      {name[0].toUpperCase()}
    </div>
  )
}

function BadgeChip({ badge, size = 64 }) {
  const inner = size * 0.38
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: badge.earned ? 1 : 0.3 }}>
      <div style={{
        width: size, height: size,
        background: badge.earned ? 'linear-gradient(135deg, rgba(126,200,227,0.14), rgba(74,158,255,0.08))' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${badge.earned ? 'rgba(126,200,227,0.38)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: inner,
        boxShadow: badge.earned ? `0 0 22px rgba(126,200,227,0.18)` : 'none',
        position: 'relative',
      }}>
        {badge.icon}
        {badge.earned && badge.xp > 0 && (
          <span style={{
            position: 'absolute', bottom: -7, right: -7,
            fontSize: 8, background: C.gold, color: '#000',
            padding: '1px 4px', borderRadius: 6, fontWeight: 700, fontFamily: 'monospace',
          }}>+{badge.xp}</span>
        )}
      </div>
      <span style={{ fontSize: 9, color: badge.earned ? C.primary : C.dim, textAlign: 'center', maxWidth: size, lineHeight: 1.2 }}>{badge.label}</span>
    </div>
  )
}

function QuestCard({ quest }) {
  const statusColor = { done: C.green, active: C.blue, available: C.purple, locked: C.muted }[quest.status]
  const statusLabel = { done: '✓ Done', active: 'In Progress', available: 'Available', locked: '🔒 Locked' }[quest.status]
  const pct = quest.total > 1 ? (quest.progress / quest.total) * 100 : 100

  return (
    <div style={{
      background: {done:'rgba(52,211,153,0.04)',active:'rgba(74,158,255,0.05)',available:'rgba(192,132,252,0.04)',locked:'rgba(255,255,255,0.01)'}[quest.status],
      border: `1px solid ${quest.status==='done'?'rgba(52,211,153,0.18)':quest.status==='active'?'rgba(74,158,255,0.18)':quest.status==='available'?'rgba(192,132,252,0.15)':'rgba(255,255,255,0.05)'}`,
      borderLeft: `3px solid ${statusColor}`,
      borderRadius: 12,
      padding: '11px 14px',
      display: 'flex', gap: 11, alignItems: 'flex-start',
      opacity: quest.status === 'locked' ? 0.5 : 1,
    }}>
      <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1 }}>{quest.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{quest.title}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
            {quest.xp > 0 && <Tag color={C.gold}>+{quest.xp} XP</Tag>}
            <span style={{ fontSize: 9, color: statusColor, fontWeight: 700 }}>{statusLabel}</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: quest.status==='active'&&quest.total>1 ? 7 : 0, lineHeight: 1.4 }}>{quest.desc}</p>
        {quest.status === 'active' && quest.total > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:C.blue, borderRadius:99, boxShadow:`0 0 6px ${C.blue}80` }} />
            </div>
            <span style={{ fontSize: 10, color: C.blue, fontFamily:'monospace', fontWeight:600 }}>{quest.progress}/{quest.total}</span>
          </div>
        )}
        <Tag color={C.primary} style={{ marginTop: 5 }}>{quest.tag}</Tag>
      </div>
    </div>
  )
}

// ─── Globe Visual ─────────────────────────────────────────────────────────────
function GlobeVisual({ pins = [], size = 400, onPinClick }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 35% 32%, #1d3e74 0%, #0c1e46 45%, #060f25 100%)',
      boxShadow: '0 0 80px rgba(59,130,246,0.12), 0 0 200px rgba(30,60,120,0.08)',
      border: '1px solid rgba(100,160,255,0.12)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Land masses */}
      <div style={{ position:'absolute', top:'26%', left:'10%', width:'23%', height:'30%', background:'rgba(34,197,94,0.11)', borderRadius:'42% 58% 52% 38%', border:'1px solid rgba(34,197,94,0.14)' }} />
      <div style={{ position:'absolute', top:'22%', left:'40%', width:'33%', height:'23%', background:'rgba(34,197,94,0.09)', borderRadius:'50% 42% 62% 48%', border:'1px solid rgba(34,197,94,0.12)' }} />
      <div style={{ position:'absolute', top:'53%', left:'46%', width:'27%', height:'19%', background:'rgba(34,197,94,0.07)', borderRadius:'32% 52% 42% 62%', border:'1px solid rgba(34,197,94,0.10)' }} />
      <div style={{ position:'absolute', top:'22%', left:'66%', width:'25%', height:'34%', background:'rgba(34,197,94,0.09)', borderRadius:'52% 32% 52% 42%', border:'1px solid rgba(34,197,94,0.11)' }} />
      <div style={{ position:'absolute', top:'60%', left:'15%', width:'18%', height:'22%', background:'rgba(34,197,94,0.07)', borderRadius:'45% 55% 48% 52%', border:'1px solid rgba(34,197,94,0.09)' }} />
      {/* Atmosphere */}
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'radial-gradient(circle at 35% 32%, transparent 55%, rgba(59,130,246,0.07) 78%, rgba(59,130,246,0.18) 96%)' }} />
      {/* Grid lines */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }}>
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="0.5"/>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="0.5"/>
        <ellipse cx="50%" cy="50%" rx="25%" ry="50%" stroke="white" strokeWidth="0.5" fill="none"/>
        <ellipse cx="50%" cy="50%" rx="50%" ry="50%" stroke="white" strokeWidth="0.5" fill="none"/>
      </svg>
      {/* Connection arcs */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
        <path d={`M ${size*0.22} ${size*0.46} Q ${size*0.46} ${size*0.28} ${size*0.72} ${size*0.38}`} stroke="rgba(126,200,227,0.35)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <path d={`M ${size*0.72} ${size*0.38} Q ${size*0.80} ${size*0.22} ${size*0.55} ${size*0.32}`} stroke="rgba(192,132,252,0.3)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
        <path d={`M ${size*0.22} ${size*0.46} Q ${size*0.18} ${size*0.60} ${size*0.43} ${size*0.60}`} stroke="rgba(52,211,153,0.28)" strokeWidth="1" fill="none" strokeDasharray="4 4"/>
      </svg>
      {/* Student pins */}
      {pins.map((pin, i) => (
        <div key={i} onClick={() => onPinClick && onPinClick(pin)}
          style={{ position:'absolute', left:`${pin.x}%`, top:`${pin.y}%`, transform:'translate(-50%, -50%)', zIndex:5, cursor:'pointer' }}>
          <div style={{
            width: pin.isMe ? 28 : 24, height: pin.isMe ? 28 : 24, borderRadius:'50%',
            background: pin.color,
            border: pin.isMe ? '2px solid rgba(251,191,36,0.85)' : '2px solid rgba(255,255,255,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize: pin.isMe ? 11 : 9, fontWeight:700, color:'#fff',
            boxShadow: `0 0 14px ${pin.color}90, 0 2px 4px rgba(0,0,0,0.4)`,
            outline: pin.isMe ? `2px solid rgba(251,191,36,0.4)` : 'none',
            outlineOffset: 2,
            transition: 'transform 0.2s',
          }}>
            {pin.name[0]}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SCREEN 1: Welcome ────────────────────────────────────────────────────────
function WelcomeScreen() {
  const pins = [
    { x:22, y:46, color:'#7ec8e3', name:'Maria Santos',  country:'Brazil'  },
    { x:72, y:37, color:'#c084fc', name:'Yuki Tanaka',   country:'Japan'   },
    { x:43, y:60, color:'#34d399', name:'Amir Hassan',   country:'Egypt'   },
    { x:14, y:35, color:'#fbbf24', name:'Sofia Chen',    country:'China'   },
    { x:55, y:30, color:'#f87171', name:'Lucas Müller',  country:'Germany' },
    { x:70, y:60, color:'#a78bfa', name:'Kenji Park',    country:'India'   },
  ]
  return (
    <div style={{ height:'100%', background:C.bg, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      {/* Stars */}
      {STARS.map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s.s, height:s.s, background:`rgba(255,255,255,${s.s===2?0.35:0.18})`, left:`${s.x}%`, top:`${s.y}%`, borderRadius:'50%' }} />
      ))}
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 24px', borderBottom:`1px solid ${C.border}`, zIndex:10, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:9, color:C.muted, fontFamily:'monospace', letterSpacing:2, textTransform:'uppercase', marginBottom:2 }}>OGL 360 · Intercultural Leadership · Dr. Hirshorn</div>
          <div style={{ fontSize:20, fontWeight:700, background:'linear-gradient(135deg, #e0e8ff, #7ec8e3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Where We Come From</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Tag color={C.primary}>🌍 24 students on the map</Tag>
          <Tag color={C.gold}>🏆 Leaderboard Live</Tag>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', gap:40 }}>
        {/* Leaderboard */}
        <Panel style={{ width:210, padding:'14px 16px', zIndex:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:11 }}>🏆 Top Explorers</div>
          {STUDENTS.map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 7px', borderRadius:8, marginBottom:2,
              background: i===0?'rgba(251,191,36,0.06)':'transparent',
              border: i===0?`1px solid rgba(251,191,36,0.18)`:'1px solid transparent' }}>
              <span style={{ fontSize:11, color:i<3?C.gold:C.muted, fontFamily:'monospace', fontWeight:700, width:14, textAlign:'center' }}>{i+1}</span>
              <Avatar name={s.name} color={['#7ec8e3','#c084fc','#34d399','#fbbf24','#f87171'][i]} size={22} />
              <span style={{ flex:1, fontSize:11, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name.split(' ')[0]}</span>
              <span style={{ fontSize:10, color:C.primary, fontFamily:'monospace' }}>{s.xp}</span>
            </div>
          ))}
        </Panel>

        {/* Globe + CTA */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:24 }}>
          <GlobeVisual pins={pins} size={380} />
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:13, color:C.muted, marginBottom:12 }}>Join 24 classmates from 18 countries</p>
            <button style={{
              background:'linear-gradient(135deg, #4a9eff, #7ec8e3)',
              border:'none', borderRadius:14, padding:'13px 32px',
              fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer',
              boxShadow:'0 4px 28px rgba(74,158,255,0.45)',
              letterSpacing:0.3,
            }}>
              📍 Drop Your Pin
            </button>
          </div>
        </div>

        {/* Live Activity */}
        <Panel style={{ width:195, padding:'12px 14px', zIndex:10 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.primary, marginBottom:10 }}>⚡ Live Activity</div>
          {[
            { text:'Sofia joined from China',          color:C.green,  time:'2m' },
            { text:'Yuki earned Bridge Builder 🌉',    color:C.gold,   time:'5m' },
            { text:'Maria completed Story Seeker',     color:C.purple, time:'8m' },
            { text:'New student from Nigeria',          color:C.primary,time:'15m' },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', gap:7, padding:'5px 0', borderBottom: i<3?`1px solid ${C.border}`:'none', alignItems:'flex-start' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:item.color, marginTop:5, flexShrink:0 }} />
              <span style={{ flex:1, fontSize:10, color:C.muted, lineHeight:1.4 }}>{item.text}</span>
              <span style={{ fontSize:9, color:C.dim, flexShrink:0 }}>{item.time}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}

// ─── SCREEN 2: Join Flow ──────────────────────────────────────────────────────
function JoinFlowScreen() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [style, setStyle] = useState('')
  const [strength, setStrength] = useState('')
  const [value, setValue] = useState('')
  const [insight, setInsight] = useState('')

  const STEPS = [
    { label:'Your Identity',    icon:'👤' },
    { label:'Leadership DNA',   icon:'💡' },
    { label:'Cultural Insight', icon:'🌏' },
  ]

  const styleOpts = [
    { id:'Authoritarian', icon:'⚡', desc:'Direct & decisive' },
    { id:'Democratic',    icon:'🤝', desc:'Collaborative' },
    { id:'Laissez-faire', icon:'🕊️', desc:'Empowering' },
  ]

  const inp = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`,
    borderRadius:10, padding:'10px 14px', color:C.text, fontSize:13,
    outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  }
  const lbl = {
    display:'block', fontSize:10, color:C.muted, fontWeight:700,
    letterSpacing:1.2, textTransform:'uppercase', marginBottom:7,
  }

  return (
    <div style={{ height:'100%', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
      {STARS.slice(0,20).map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s.s, height:s.s, background:`rgba(255,255,255,${s.s===2?0.25:0.12})`, left:`${s.x}%`, top:`${s.y}%`, borderRadius:'50%' }} />
      ))}
      {/* dim globe bg */}
      <div style={{ position:'absolute', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle at 40% 40%, #1a3a6e22, #050d1f)', boxShadow:'0 0 120px rgba(59,130,246,0.08)', pointerEvents:'none', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }} />

      <Panel style={{ width:440, padding:'28px 32px', zIndex:10 }}>
        {/* Step indicator */}
        {step !== 'done' && (
          <div style={{ display:'flex', alignItems:'center', marginBottom:26 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', flex: i<2?1:'initial' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background: i+1 < step ? C.green : i+1===step ? C.blue : 'rgba(255,255,255,0.06)',
                    border:`1px solid ${i+1<=step?'transparent':C.border}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize: i+1<step?14:13,
                    boxShadow: i+1===step?`0 0 18px ${C.blue}60`:'none',
                    transition:'all 0.3s',
                  }}>
                    {i+1 < step ? '✓' : s.icon}
                  </div>
                  <span style={{ fontSize:9, color:i+1===step?C.text:C.muted, textAlign:'center', lineHeight:1.2, width:72 }}>{s.label}</span>
                </div>
                {i<2 && <div style={{ flex:1, height:1, background:i+1<step?C.green:C.border, margin:'0 6px', marginBottom:18, transition:'all 0.3s' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:4 }}>📍 Drop Your Pin</h2>
            <p style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Share your story with the class</p>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Your Name *</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Maria Santos" maxLength={40} style={inp} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Where Are You From? *</label>
              <input value={country} onChange={e=>setCountry(e.target.value)} placeholder="e.g. São Paulo, Brazil" style={{ ...inp, marginBottom:8 }} />
              <select style={{ ...inp, color:country?C.text:C.muted }}>
                <option value="">Select country for map pin...</option>
                <option>Brazil</option><option>USA</option><option>India</option><option>Japan</option><option>Germany</option>
              </select>
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={lbl}>Interests</label>
              <input placeholder="e.g. Classical dance, Social enterprise" style={inp} />
            </div>
            <button onClick={()=>setStep(2)} style={{ width:'100%', background:'linear-gradient(135deg, #4a9eff, #7ec8e3)', border:'none', borderRadius:12, padding:'13px', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 20px rgba(74,158,255,0.35)' }}>
              Next: Leadership DNA →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:4 }}>💡 Leadership DNA</h2>
            <p style={{ fontSize:12, color:C.muted, marginBottom:20 }}>How do you show up as a leader?</p>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Leadership Style *</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {styleOpts.map(s => (
                  <button key={s.id} onClick={()=>setStyle(s.id)} style={{
                    background: style===s.id?'rgba(74,158,255,0.14)':'rgba(255,255,255,0.03)',
                    border:`1px solid ${style===s.id?C.blue:C.border}`,
                    borderRadius:11, padding:'11px 6px', cursor:'pointer',
                    color: style===s.id?C.blue:C.muted, fontSize:11, fontWeight:600,
                    textAlign:'center', lineHeight:1.4, transition:'all 0.2s',
                    boxShadow: style===s.id?`0 0 14px ${C.blue}30`:'none',
                  }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{s.icon}</div>
                    {s.id}<br/>
                    <span style={{ fontSize:9, fontWeight:400 }}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={lbl}>Top Strength *</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {['Communication','Empathy','Strategy','Execution','Relationship','Learning'].map(s => (
                  <button key={s} onClick={()=>setStrength(s)} style={{
                    background: strength===s?'rgba(192,132,252,0.14)':'rgba(255,255,255,0.03)',
                    border:`1px solid ${strength===s?C.purple:C.border}`,
                    borderRadius:99, padding:'5px 13px', cursor:'pointer',
                    color:strength===s?C.purple:C.muted, fontSize:11, fontWeight:600, transition:'all 0.2s',
                    boxShadow: strength===s?`0 0 10px ${C.purple}25`:'none',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={lbl}>Core Leadership Value *</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Empathy','Courage','Integrity','Innovation','Justice','Wisdom','Harmony','Service'].map(v => (
                  <button key={v} onClick={()=>setValue(v)} style={{
                    background: value===v?'rgba(251,191,36,0.14)':'rgba(255,255,255,0.03)',
                    border:`1px solid ${value===v?C.gold:C.border}`,
                    borderRadius:99, padding:'5px 13px', cursor:'pointer',
                    color:value===v?C.gold:C.muted, fontSize:11, fontWeight:600, transition:'all 0.2s',
                  }}>{v}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setStep(1)} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px', fontSize:12, color:C.muted, cursor:'pointer' }}>← Back</button>
              <button onClick={()=>setStep(3)} style={{ flex:2, background:'linear-gradient(135deg, #c084fc, #7ec8e3)', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 20px rgba(192,132,252,0.3)' }}>
                Next: Cultural Insight →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:4 }}>🌏 Your Cultural Insight</h2>
            <p style={{ fontSize:12, color:C.muted, marginBottom:18 }}>What did your background teach you about leadership?</p>

            <textarea value={insight} onChange={e=>setInsight(e.target.value)}
              placeholder="Share a lesson from your culture, community, or personal experience..."
              rows={4} style={{ ...inp, resize:'none', lineHeight:1.55, marginBottom:4 }} />
            <div style={{ textAlign:'right', fontSize:10, color:C.muted, marginBottom:16 }}>{insight.length}/280</div>

            {/* Card preview */}
            <div style={{ background:'rgba(74,158,255,0.05)', border:`1px solid rgba(74,158,255,0.15)`, borderRadius:12, padding:'12px 14px', marginBottom:20 }}>
              <div style={{ fontSize:9, color:C.blue, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:9 }}>✦ Card Preview</div>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
                <Avatar name={name||'?'} color={C.blue} size={38} glow />
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{name||'Your Name'}</div>
                  <div style={{ fontSize:11, color:C.muted }}>{country||'Your Location'}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {style    && <Tag color={C.blue}>{style}</Tag>}
                {strength && <Tag color={C.purple}>{strength}</Tag>}
                {value    && <Tag color={C.gold}>{value}</Tag>}
              </div>
              {insight && <div style={{ fontSize:11, color:C.muted, marginTop:8, fontStyle:'italic', lineHeight:1.5 }}>"{insight.slice(0,80)}{insight.length>80?'…':''}"</div>}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setStep(2)} style={{ flex:1, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:12, padding:'12px', fontSize:12, color:C.muted, cursor:'pointer' }}>← Back</button>
              <button onClick={()=>setStep('done')} style={{ flex:2, background:'linear-gradient(135deg, #34d399, #7ec8e3)', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 20px rgba(52,211,153,0.35)' }}>
                🌍 Place My Pin!
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🌍</div>
            <h2 style={{ fontSize:22, fontWeight:700, color:C.text, marginBottom:6 }}>You're on the map!</h2>
            <p style={{ fontSize:13, color:C.muted, marginBottom:18 }}>Welcome, {name||'Explorer'}! Your pin is live.</p>
            <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', marginBottom:18 }}>
              <Tag color={C.primary}>🌍 Explorer (+0 XP)</Tag>
              <Tag color={C.gold}>📖 Story Teller (+15 XP)</Tag>
            </div>
            <XPBar current={15} max={200} level={1} />
            <p style={{ fontSize:12, color:C.muted, marginTop:14 }}>Click any pin on the globe to explore!</p>
            <button onClick={()=>{setStep(1);setName('');setCountry('');setStyle('');setStrength('');setValue('');setInsight('')}} style={{ marginTop:14, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:10, padding:'7px 16px', fontSize:11, color:C.muted, cursor:'pointer' }}>↩ Reset Demo</button>
          </div>
        )}
      </Panel>
    </div>
  )
}

// ─── SCREEN 3: Game HUD ───────────────────────────────────────────────────────
function GameHUDScreen() {
  const [selectedPin, setSelectedPin] = useState(null)
  const [connected, setConnected] = useState(false)

  const pins = [
    { x:22, y:46, color:'#7ec8e3', ...STUDENTS[0] },
    { x:72, y:37, color:'#c084fc', ...STUDENTS[1] },
    { x:43, y:59, color:'#34d399', ...STUDENTS[2] },
    { x:14, y:35, color:'#fbbf24', ...STUDENTS[3] },
    { x:55, y:31, color:'#f87171', ...STUDENTS[4] },
    { x:70, y:61, color:'#a78bfa', ...STUDENTS[0] },
    { x:38, y:22, color:C.blue,   ...ME, isMe:true },
  ]

  return (
    <div style={{ position:'relative', height:'100%', background:C.bg, overflow:'hidden' }}>
      {STARS.slice(0,18).map((s,i) => (
        <div key={i} style={{ position:'absolute', width:s.s, height:s.s, background:`rgba(255,255,255,${s.s===2?0.2:0.1})`, left:`${s.x}%`, top:`${s.y}%`, borderRadius:'50%', pointerEvents:'none' }} />
      ))}

      {/* ── TOP HEADER ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px', background:'rgba(5,13,31,0.96)', borderBottom:`1px solid ${C.border}`, backdropFilter:'blur(12px)', gap:16 }}>
        <div>
          <div style={{ fontSize:8, color:C.muted, fontFamily:'monospace', letterSpacing:2, textTransform:'uppercase', marginBottom:1 }}>OGL 360 · Dr. Hirshorn</div>
          <div style={{ fontSize:17, fontWeight:700, background:'linear-gradient(135deg, #e0e8ff, #7ec8e3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Where We Come From</div>
        </div>

        {/* Module progress */}
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {['M1','M2','M3','M4','M5','M6'].map((m,i) => (
            <div key={m} style={{
              width:28, height:28, borderRadius:7,
              background: i<2?'rgba(52,211,153,0.2)':i===2?'rgba(74,158,255,0.2)':'rgba(255,255,255,0.04)',
              border:`1px solid ${i<2?'rgba(52,211,153,0.45)':i===2?'rgba(74,158,255,0.55)':C.border}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:9, fontWeight:700, color: i<3?'#fff':C.dim,
              boxShadow: i===2?`0 0 14px ${C.blue}55`:'none',
            }}>
              {i<2?'✓':m}
            </div>
          ))}
          <span style={{ fontSize:9, color:C.muted, marginLeft:5 }}>Module 3 Active</span>
        </div>

        {/* Player chip */}
        <div style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:11, padding:'7px 14px' }}>
          <Avatar name="Ash" color={C.blue} size={28} glow />
          <div style={{ minWidth:120 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text }}>Ash · USA</div>
            <XPBar current={ME.xp} max={ME.xpToNext} level={ME.level} />
          </div>
        </div>
        <Tag color={C.primary}>🌍 24 students</Tag>
      </div>

      {/* Globe */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', paddingTop:56 }}>
        <GlobeVisual pins={pins} size={370} onPinClick={p => { if(!p.isMe){ setSelectedPin(p); setConnected(false) } }} />
      </div>

      {/* ── LEADERBOARD ── */}
      <Panel style={{ position:'absolute', top:70, left:14, width:208, padding:'12px 14px', zIndex:15 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.gold, marginBottom:10 }}>🏆 Top Explorers</div>
        {STUDENTS.map((s,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 7px', borderRadius:8, marginBottom:2,
            background: i===0?'rgba(251,191,36,0.07)':'transparent',
            border: i===0?`1px solid rgba(251,191,36,0.2)`:'1px solid transparent' }}>
            <span style={{ fontSize:10, color:i<3?C.gold:C.muted, fontFamily:'monospace', fontWeight:700, width:14, textAlign:'center' }}>{i+1}</span>
            <Avatar name={s.name} color={['#7ec8e3','#c084fc','#34d399','#fbbf24','#f87171'][i]} size={20} />
            <span style={{ flex:1, fontSize:11, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name.split(' ')[0]}</span>
            <span style={{ fontSize:10, color:C.primary, fontFamily:'monospace' }}>{s.xp}</span>
          </div>
        ))}
      </Panel>

      {/* ── ACTIVE QUESTS (bottom-left) ── */}
      <Panel style={{ position:'absolute', bottom:14, left:14, width:225, padding:'12px 14px', zIndex:15 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.purple, marginBottom:10 }}>🎯 Active Quests</div>
        {QUESTS.filter(q=>q.status==='active').map(q => (
          <div key={q.id} style={{ display:'flex', gap:8, alignItems:'flex-start', padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:18 }}>{q.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{q.title}</div>
              {q.total>1 && (
                <div style={{ marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${(q.progress/q.total)*100}%`, height:'100%', background:C.blue, borderRadius:99 }} />
                  </div>
                  <span style={{ fontSize:9, color:C.blue, fontFamily:'monospace' }}>{q.progress}/{q.total}</span>
                </div>
              )}
            </div>
            <Tag color={C.gold}>+{q.xp}</Tag>
          </div>
        ))}
        <div style={{ marginTop:8, fontSize:10, color:C.blue, textAlign:'center', cursor:'pointer' }}>2 more quests available →</div>
      </Panel>

      {/* ── PLAYER CARD (bottom-right) ── */}
      <Panel style={{ position:'absolute', bottom:14, right:14, width:248, padding:'14px 16px', zIndex:15 }}>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:11 }}>
          <Avatar name="Ash" color={C.blue} size={42} glow />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Ash</div>
            <div style={{ fontSize:11, color:C.muted }}>📍 USA</div>
            <XPBar current={ME.xp} max={ME.xpToNext} level={ME.level} />
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          <Tag color={C.blue}>🤝 Democratic</Tag>
          <Tag color={C.purple}>💡 Strategy</Tag>
          <Tag color={C.gold}>✨ Innovation</Tag>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {['🌍','🌉'].map((b,i) => (
            <span key={i} style={{ fontSize:16, background:'rgba(126,200,227,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'4px 8px' }}>{b}</span>
          ))}
          <span style={{ fontSize:10, color:C.muted, marginLeft:'auto' }}>2 / 12 badges</span>
        </div>
      </Panel>

      {/* ── LIVE FEED (top-right) ── */}
      <Panel style={{ position:'absolute', top:70, right:14, width:192, padding:'11px 13px', zIndex:15 }}>
        <div style={{ fontSize:11, fontWeight:700, color:C.primary, marginBottom:9 }}>⚡ Live Activity</div>
        {[
          { text:'Sofia joined from China',       color:C.green,  time:'2m' },
          { text:'Yuki earned Bridge Builder 🌉', color:C.gold,   time:'5m' },
          { text:'Maria completed Story Seeker',  color:C.purple, time:'8m' },
        ].map((item,i) => (
          <div key={i} style={{ display:'flex', gap:7, padding:'4px 0', borderBottom:i<2?`1px solid ${C.border}`:'none', alignItems:'flex-start' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:item.color, marginTop:5, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:10, color:C.muted, lineHeight:1.4 }}>{item.text}</span>
            <span style={{ fontSize:9, color:C.dim }}>{item.time}</span>
          </div>
        ))}
      </Panel>

      {/* ── STUDENT CARD POPUP ── */}
      {selectedPin && (
        <div style={{ position:'absolute', inset:0, zIndex:25, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)' }}
          onClick={()=>{ setSelectedPin(null); setConnected(false) }}>
          <Panel glow style={{ width:310, padding:'22px 24px' }} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{ setSelectedPin(null); setConnected(false) }} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', color:C.muted, cursor:'pointer', fontSize:14 }}>✕</button>

            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
              <Avatar name={selectedPin.name} color={selectedPin.color} size={50} glow />
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{selectedPin.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>📍 {selectedPin.country}</div>
                <div style={{ fontSize:11, color:C.gold, fontFamily:'monospace', marginTop:2 }}>⭐ {selectedPin.xp} XP</div>
              </div>
            </div>

            <div style={{ fontSize:10, color:C.muted, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:7 }}>Leadership DNA</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              <Tag color={C.blue}>{selectedPin.style}</Tag>
              <Tag color={C.purple}>{selectedPin.strength}</Tag>
              <Tag color={C.gold}>{selectedPin.value}</Tag>
            </div>

            <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 13px', fontSize:12, color:C.muted, lineHeight:1.55, marginBottom:14, fontStyle:'italic' }}>
              "In my culture, leadership means lifting others first — a lesson I learned from my grandmother's community work."
            </div>

            {selectedPin.badges?.length > 0 && (
              <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
                {selectedPin.badges.map(b => {
                  const bd = BADGES.find(x=>x.id===b)
                  return bd ? <span key={b} style={{ fontSize:14, background:'rgba(126,200,227,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'3px 7px', title:bd.label }}>{bd.icon}</span> : null
                })}
              </div>
            )}

            {!connected ? (
              <div style={{ display:'flex', gap:8 }}>
                <button style={{ flex:1, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}`, borderRadius:10, padding:'10px', fontSize:12, color:C.muted, cursor:'pointer' }}>👀 Explore</button>
                <button onClick={()=>setConnected(true)} style={{ flex:1.4, background:'linear-gradient(135deg, #4a9eff, #7ec8e3)', border:'none', borderRadius:10, padding:'10px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:`0 4px 18px rgba(74,158,255,0.35)` }}>
                  🔗 Connect
                </button>
              </div>
            ) : (
              <div style={{ background:'rgba(52,211,153,0.08)', border:`1px solid rgba(52,211,153,0.25)`, borderRadius:10, padding:'12px', textAlign:'center' }}>
                <div style={{ fontSize:18, marginBottom:4 }}>✅</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.green }}>Connected!</div>
                <div style={{ fontSize:11, color:C.muted }}>+20 XP · Quest progress updated</div>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

// ─── SCREEN 4: Quests & Badges ────────────────────────────────────────────────
function QuestBoardScreen() {
  const [tab, setTab] = useState('quests')
  const grouped = { done:[], active:[], available:[], locked:[] }
  QUESTS.forEach(q => grouped[q.status].push(q))

  return (
    <div style={{ height:'100%', background:C.bg, overflowY:'auto', padding:'20px 24px 32px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text }}>Quest Board</h2>
          <p style={{ fontSize:12, color:C.muted }}>Complete quests to earn XP and unlock badge achievements</p>
        </div>
        <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', border:`1px solid ${C.border}`, borderRadius:11, overflow:'hidden' }}>
          {['quests','badges'].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              background: t===tab?'rgba(74,158,255,0.12)':'none',
              border:'none', color:t===tab?C.primary:C.muted,
              padding:'9px 18px', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
              borderBottom: t===tab?`2px solid ${C.blue}`:'2px solid transparent',
            }}>
              {t==='quests'?'🎯 Quests':'🏅 Badges'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'quests' && (
        <div>
          {/* XP summary */}
          <Panel style={{ padding:'16px 20px', marginBottom:22, display:'flex', alignItems:'center', gap:22 }}>
            {[
              { val:`${ME.xp}`, label:'Total XP',   color:C.gold },
              { val:'3',        label:'Completed',   color:C.green },
              { val:'2',        label:'In Progress', color:C.blue },
              { val:'2',        label:'Available',   color:C.purple },
            ].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:i===0?0:20 }}>
                {i>0&&<div style={{ width:1, height:38, background:C.border }} />}
                <div style={{ textAlign:'center', minWidth:50 }}>
                  <div style={{ fontSize:24, fontWeight:700, color:s.color, fontFamily:'monospace' }}>{s.val}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{s.label}</div>
                </div>
              </div>
            ))}
            <div style={{ flex:1, borderLeft:`1px solid ${C.border}`, paddingLeft:22 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>Level {ME.level} Progress</div>
              <XPBar current={ME.xp} max={ME.xpToNext} level={ME.level} />
              <div style={{ fontSize:10, color:C.muted, marginTop:5 }}>{ME.xpToNext - ME.xp} XP to Level {ME.level+1}</div>
            </div>
          </Panel>

          {['done','active','available','locked'].map(status => {
            const qs = grouped[status]
            if (!qs.length) return null
            const label = { done:'✓ Completed', active:'⚡ In Progress', available:'🔓 Available', locked:'🔒 Locked' }[status]
            const color = { done:C.green, active:C.blue, available:C.purple, locked:C.dim }[status]
            return (
              <div key={status} style={{ marginBottom:22 }}>
                <div style={{ fontSize:10, fontWeight:700, color:color, letterSpacing:1.3, textTransform:'uppercase', marginBottom:10 }}>{label} ({qs.length})</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {qs.map(q => <QuestCard key={q.id} quest={q} />)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'badges' && (
        <div>
          <Panel style={{ padding:'14px 20px', marginBottom:22, display:'flex', alignItems:'center', gap:20 }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:C.primary, fontFamily:'monospace' }}>3 / {BADGES.length}</div>
              <div style={{ fontSize:10, color:C.muted }}>Badges Earned</div>
            </div>
            <div style={{ flex:1, height:7, background:'rgba(255,255,255,0.07)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${(3/BADGES.length)*100}%`, height:'100%', background:`linear-gradient(90deg, ${C.primary}, ${C.blue})`, borderRadius:99 }} />
            </div>
            <div style={{ fontSize:11, color:C.muted }}>Earn more by exploring the globe!</div>
          </Panel>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:18, justifyItems:'center' }}>
            {BADGES.map(b => <BadgeChip key={b.id} badge={b} size={72} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SCREEN 5: Dashboard ──────────────────────────────────────────────────────
function DashboardScreen() {
  const styleData = [
    { label:'Democratic',    count:12, color:C.blue   },
    { label:'Authoritarian', count:7,  color:C.red    },
    { label:'Laissez-faire', count:5,  color:C.purple },
  ]
  return (
    <div style={{ height:'100%', background:C.bg, overflowY:'auto', padding:'20px 24px 32px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text }}>📊 Professor Dashboard</h2>
          <p style={{ fontSize:12, color:C.muted }}>OGL 360 · Live Session · Module 3 Active</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={{ background:'rgba(74,158,255,0.1)', border:`1px solid rgba(74,158,255,0.28)`, borderRadius:10, padding:'8px 14px', fontSize:11, color:C.blue, cursor:'pointer', fontWeight:600 }}>🗳️ Launch Poll</button>
          <button style={{ background:'rgba(192,132,252,0.1)', border:`1px solid rgba(192,132,252,0.28)`, borderRadius:10, padding:'8px 14px', fontSize:11, color:C.purple, cursor:'pointer', fontWeight:600 }}>🎯 Activate Quest</button>
          <button style={{ background:'rgba(52,211,153,0.1)', border:`1px solid rgba(52,211,153,0.28)`, borderRadius:10, padding:'8px 14px', fontSize:11, color:C.green, cursor:'pointer', fontWeight:600 }}>💡 Vision Wall</button>
          <button style={{ background:'rgba(251,191,36,0.1)', border:`1px solid rgba(251,191,36,0.28)`, borderRadius:10, padding:'8px 14px', fontSize:11, color:C.gold, cursor:'pointer', fontWeight:600 }}>⭐ Spotlight</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        {[
          { label:'Students on Map', val:'24', icon:'🌍', color:C.primary },
          { label:'Countries',       val:'18', icon:'🗺️', color:C.blue   },
          { label:'Connections',     val:'47', icon:'🔗', color:C.purple },
          { label:'Inclusion Score', val:'73%',icon:'🏆', color:C.gold   },
        ].map(s => (
          <Panel key={s.label} style={{ padding:'16px 18px', textAlign:'center' }}>
            <div style={{ fontSize:22 }}>{s.icon}</div>
            <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:'monospace', marginTop:4 }}>{s.val}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{s.label}</div>
          </Panel>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        {/* Style distribution */}
        <Panel style={{ padding:'16px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Leadership Style Mix</div>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {styleData.map(d => (
              <div key={d.label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.text }}>{d.label}</span>
                  <span style={{ fontSize:11, color:d.color, fontFamily:'monospace' }}>{d.count} ({Math.round(d.count/24*100)}%)</span>
                </div>
                <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${(d.count/12)*100}%`, height:'100%', background:d.color, borderRadius:99, boxShadow:`0 0 8px ${d.color}60` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'9px 12px', background:'rgba(74,158,255,0.06)', border:'1px solid rgba(74,158,255,0.14)', borderRadius:9 }}>
            <span style={{ fontSize:10, color:C.blue, lineHeight:1.5 }}>💡 AI Insight: Democratic majority suggests students respond well to collaborative facilitation. 3 students chose Coercive power — a good catalyst for Module 6 discussion.</span>
          </div>
        </Panel>

        {/* Strength bubbles */}
        <Panel style={{ padding:'16px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Strength Diversity</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, alignItems:'flex-end', minHeight:80 }}>
            {[
              { label:'Empathy',        n:8,  color:C.green  },
              { label:'Strategy',       n:6,  color:C.blue   },
              { label:'Communication',  n:5,  color:C.primary},
              { label:'Relationship',   n:3,  color:C.purple },
              { label:'Execution',      n:2,  color:C.gold   },
              { label:'Learning',       n:1,  color:C.red    },
            ].map(s => {
              const sz = 22 + (s.n/8)*36
              return (
                <div key={s.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:sz, height:sz, borderRadius:'50%', background:`${s.color}25`, border:`1px solid ${s.color}40`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:sz*0.55, height:sz*0.55, borderRadius:'50%', background:s.color, opacity:0.85 }} />
                  </div>
                  <span style={{ fontSize:8, color:C.muted, textAlign:'center', maxWidth:52, lineHeight:1.2 }}>{s.label}</span>
                  <span style={{ fontSize:9, color:s.color, fontFamily:'monospace', fontWeight:700 }}>{s.n}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop:12, fontSize:10, color:C.muted }}>6 unique strengths · Diversity Index: 0.82 ✦</div>
        </Panel>
      </div>

      {/* Roster + Activity */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <Panel style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
            <span style={{ fontSize:13, fontWeight:600, color:C.text }}>Student Roster</span>
            <span style={{ fontSize:10, color:C.blue, cursor:'pointer' }}>Export CSV →</span>
          </div>
          {STUDENTS.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 9px', borderRadius:9, marginBottom:5, background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}` }}>
              <Avatar name={s.name} color={['#7ec8e3','#c084fc','#34d399','#fbbf24','#f87171'][i]} size={30} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{s.name}</div>
                <div style={{ display:'flex', gap:6, marginTop:2 }}>
                  <span style={{ fontSize:9, color:C.muted }}>{s.country}</span>
                  <Tag color={C.blue}>{s.style}</Tag>
                  <Tag color={C.purple}>{s.strength}</Tag>
                </div>
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {s.badges.slice(0,3).map(b => {
                  const bd = BADGES.find(x=>x.id===b); return bd ? <span key={b}>{bd.icon}</span> : null
                })}
              </div>
              <span style={{ fontSize:11, color:C.gold, fontFamily:'monospace', fontWeight:700 }}>{s.xp} XP</span>
            </div>
          ))}
        </Panel>

        <Panel style={{ padding:'16px 18px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:13 }}>⚡ Live Activity</div>
          {[
            { text:'Sofia Chen joined from China',         icon:'🌍', color:C.green,  time:'2m'  },
            { text:'Yuki earned Bridge Builder 🌉',        icon:'🏅', color:C.gold,   time:'5m'  },
            { text:'Maria completed Story Seeker',         icon:'✓',  color:C.purple, time:'8m'  },
            { text:'Lucas connected with Amir (🔗 +20XP)',icon:'🔗', color:C.blue,   time:'12m' },
            { text:'New student from Nigeria joined',      icon:'🌍', color:C.primary,time:'15m' },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', gap:8, padding:'8px 0', borderBottom: i<4?`1px solid ${C.border}`:'none', alignItems:'flex-start' }}>
              <span style={{ fontSize:13, color:item.color, marginTop:1 }}>{item.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:C.text, lineHeight:1.4 }}>{item.text}</div>
                <div style={{ fontSize:9, color:C.dim, marginTop:2 }}>{item.time} ago</div>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function StudentWorldMockup() {
  const [active, setActive] = useState('Welcome')

  return (
    <div style={{ width:'100%', height:'100vh', background:C.bg, display:'flex', flexDirection:'column', fontFamily:"'DM Sans', -apple-system, sans-serif", color:C.text, overflow:'hidden' }}>
      {/* Screen nav */}
      <div style={{ display:'flex', alignItems:'center', gap:0, padding:'6px 16px', background:'rgba(5,13,31,0.99)', borderBottom:`1px solid rgba(74,158,255,0.18)`, flexShrink:0, zIndex:100, overflowX:'auto' }}>
        <span style={{ fontSize:9, color:C.dim, fontFamily:'monospace', letterSpacing:1.2, textTransform:'uppercase', marginRight:14, whiteSpace:'nowrap' }}>UX Mockup ·</span>
        {SCREENS.map(s => (
          <button key={s} onClick={()=>setActive(s)} style={{
            background: s===active?'rgba(74,158,255,0.1)':'none',
            border:'none',
            borderBottom: s===active?`2px solid ${C.blue}`:'2px solid transparent',
            color: s===active?C.primary:C.muted,
            padding:'7px 15px', fontSize:11, fontWeight:600, cursor:'pointer',
            whiteSpace:'nowrap', transition:'all 0.15s', letterSpacing:0.2,
          }}>
            {s}
          </button>
        ))}
        <span style={{ fontSize:9, color:C.dim, fontFamily:'monospace', marginLeft:'auto', whiteSpace:'nowrap' }}>Click pins in "Game HUD" to open student cards</span>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {active==='Welcome'          && <WelcomeScreen />}
        {active==='Join Flow'        && <JoinFlowScreen />}
        {active==='Game HUD'         && <GameHUDScreen />}
        {active==='Quests & Badges'  && <QuestBoardScreen />}
        {active==='Dashboard'        && <DashboardScreen />}
      </div>
    </div>
  )
}
