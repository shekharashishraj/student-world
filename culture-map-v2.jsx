import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ───
const COLORS = ["#E8A87C","#85CDCA","#D4A574","#C9B1FF","#7EC8E3","#FFB6B9","#FFDAC1","#B5EAD7","#FF9AA2","#A0E7E5","#FFD6A5","#CAFFBF"];
const VALUES = ["Empathy","Courage","Integrity","Resilience","Service","Harmony","Innovation","Justice","Transparency","Unity","Balance","Curiosity","Wisdom","Compassion","Authenticity"];

const DEMO_PINS = [
  { id:1, name:"Maria Santos", lat:-23.55, lng:-46.63, location:"São Paulo, Brazil", interests:"Community organizing, Samba dancing", value:"Empathy", cultural:"Growing up in a favela taught me that leadership starts with listening to those who are often unheard.", color:"#E8A87C", submitted:"2025-02-03T14:22:00Z", interactions:12 },
  { id:2, name:"Yuki Tanaka", lat:34.69, lng:135.50, location:"Osaka, Japan", interests:"Calligraphy, Sustainable design", value:"Harmony", cultural:"In Japan, we say 'the nail that sticks out gets hammered down' — but I'm learning that sometimes standing out creates positive change.", color:"#85CDCA", submitted:"2025-02-03T09:15:00Z", interactions:8 },
  { id:3, name:"Amara Okafor", lat:6.52, lng:3.38, location:"Lagos, Nigeria", interests:"Tech startups, Afrobeat music", value:"Resilience", cultural:"Nigerian entrepreneurship taught me that resourcefulness is the mother of innovation.", color:"#D4A574", submitted:"2025-02-03T11:45:00Z", interactions:15 },
  { id:4, name:"Priya Sharma", lat:19.08, lng:72.88, location:"Mumbai, India", interests:"Classical dance, Social enterprise", value:"Service", cultural:"My grandmother ran a community kitchen — leadership through feeding others taught me more than any textbook.", color:"#C9B1FF", submitted:"2025-02-04T06:30:00Z", interactions:10 },
  { id:5, name:"Lars Eriksson", lat:59.33, lng:18.07, location:"Stockholm, Sweden", interests:"Cross-country skiing, UX research", value:"Transparency", cultural:"Swedish 'lagom' — not too much, not too little — shapes how I approach team dynamics.", color:"#7EC8E3", submitted:"2025-02-04T08:00:00Z", interactions:6 },
  { id:6, name:"Fatima Al-Hassan", lat:31.95, lng:35.93, location:"Amman, Jordan", interests:"Arabic poetry, Women's rights advocacy", value:"Courage", cultural:"Being a woman leader in my community means rewriting the rules while respecting the roots.", color:"#FFB6B9", submitted:"2025-02-04T13:10:00Z", interactions:11 },
  { id:7, name:"Chen Wei", lat:30.57, lng:104.07, location:"Chengdu, China", interests:"Tea ceremony, AI ethics", value:"Balance", cultural:"The Sichuan spirit is bold and spicy — we don't shy away from complex flavors or complex problems.", color:"#FFDAC1", submitted:"2025-02-05T03:20:00Z", interactions:9 },
  { id:8, name:"Diego Morales", lat:19.43, lng:-99.13, location:"Mexico City, Mexico", interests:"Mural art, Community health", value:"Unity", cultural:"Mexico's muralist tradition taught me that art can be protest, education, and healing all at once.", color:"#B5EAD7", submitted:"2025-02-05T16:45:00Z", interactions:7 },
  { id:9, name:"Aisha Mohamed", lat:-1.29, lng:36.82, location:"Nairobi, Kenya", interests:"Marathon running, EdTech", value:"Resilience", cultural:"Running taught me that the race is always against yourself — leadership is the same.", color:"#FF9AA2", submitted:"2025-02-05T10:00:00Z", interactions:14 },
  { id:10, name:"James Whitfield", lat:33.45, lng:-112.07, location:"Phoenix, AZ, USA", interests:"Basketball coaching, Nonprofit mgmt", value:"Service", cultural:"Coaching in underserved communities showed me that showing up consistently is the foundation of trust.", color:"#A0E7E5", submitted:"2025-02-03T18:00:00Z", interactions:5 },
  { id:11, name:"Sophie Laurent", lat:48.86, lng:2.35, location:"Paris, France", interests:"Pastry arts, Philosophy", value:"Authenticity", cultural:"The French 'art de vivre' taught me that how you do things matters as much as what you do.", color:"#FFD6A5", submitted:"2025-02-04T15:30:00Z", interactions:4 },
  { id:12, name:"Raj Patel", lat:23.02, lng:72.57, location:"Ahmedabad, India", interests:"Textile design, Social entrepreneurship", value:"Innovation", cultural:"Gujarat's trading heritage means we see opportunity where others see obstacles.", color:"#CAFFBF", submitted:"2025-02-06T07:00:00Z", interactions:3 },
];

const ROSTER_ONLY = [
  { id:101, name:"Taylor Kim", status:"pending" },
  { id:102, name:"Mohammed Al-Farsi", status:"missing" },
  { id:103, name:"Emily Chen", status:"pending" },
  { id:104, name:"Carlos Ruiz", status:"missing" },
  { id:105, name:"Nadia Volkov", status:"missing" },
];

// ─── Custom SVG Map Component (no external dependency) ───
function WorldMap({ pins, onMapClick, selectedPinId, onPinClick }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 450 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // Convert lat/lng to x/y (Mercator-ish projection)
  const project = useCallback((lat, lng) => {
    const x = ((lng + 180) / 360) * 800;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = 225 - (mercN / Math.PI) * 225;
    return { x, y };
  }, []);

  const handleSvgClick = (e) => {
    if (dragging) return;
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const svgX = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const svgY = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    // Reverse project to get lat/lng
    const lng = (svgX / 800) * 360 - 180;
    const mercN = ((225 - svgY) / 225) * Math.PI;
    const lat = (2 * Math.atan(Math.exp(mercN)) - Math.PI / 2) * (180 / Math.PI);
    onMapClick(lat, lng);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const mouseX = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const mouseY = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const newW = Math.max(200, Math.min(800, viewBox.w * factor));
    const newH = Math.max(112.5, Math.min(450, viewBox.h * factor));
    const newX = mouseX - ((mouseX - viewBox.x) / viewBox.w) * newW;
    const newY = mouseY - ((mouseY - viewBox.y) / viewBox.h) * newH;
    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(false);
    setDragStart({ clientX: e.clientX, clientY: e.clientY, vx: viewBox.x, vy: viewBox.y });
  };

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setDragging(true);
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    setViewBox(v => ({
      ...v,
      x: dragStart.vx - (dx / rect.width) * v.w,
      y: dragStart.vy - (dy / rect.height) * v.h,
    }));
  };

  const handleMouseUp = () => {
    setTimeout(() => setDragging(false), 50);
    setDragStart(null);
  };

  // Simplified continent paths (manually traced for Mercator)
  const continents = [
    // North America
    "M 30 80 Q 50 70 80 72 L 110 78 L 128 88 L 140 100 L 148 115 L 145 135 L 135 148 L 125 158 L 115 165 L 105 170 L 95 168 L 88 155 L 85 142 L 80 130 L 70 118 Q 55 105 45 95 L 38 87 Z",
    // Central America
    "M 95 170 L 105 178 L 112 186 L 108 195 L 100 198 L 92 195 L 88 187 L 90 178 Z",
    // South America
    "M 120 200 L 145 195 L 168 205 L 180 228 L 185 255 L 180 282 L 170 305 L 155 322 L 142 330 L 132 322 L 128 305 L 124 282 L 120 255 L 116 228 Z",
    // Europe
    "M 370 62 L 385 57 L 400 59 L 412 55 L 425 59 L 430 67 L 434 77 L 430 87 L 420 96 L 410 103 L 400 107 L 386 103 L 376 96 L 368 87 L 365 77 Z",
    // Africa
    "M 385 140 L 408 132 L 432 138 L 450 152 L 458 172 L 462 198 L 458 228 L 448 255 L 435 278 L 420 292 L 405 297 L 392 288 L 382 268 L 378 242 L 374 218 L 372 192 L 374 168 Z",
    // Asia
    "M 435 52 L 462 47 L 498 45 L 535 49 L 570 52 L 608 57 L 645 62 L 672 67 L 690 77 L 698 92 L 690 107 L 680 120 L 668 130 L 652 138 L 635 142 L 615 145 L 595 142 L 575 138 L 558 142 L 538 148 L 518 145 L 498 138 L 478 132 L 458 125 L 445 113 L 438 100 L 432 87 L 430 72 Z",
    // India subcontinent
    "M 555 148 L 575 155 L 585 170 L 580 190 L 570 205 L 555 210 L 545 200 L 540 185 L 543 170 Z",
    // Southeast Asia / Indonesia
    "M 615 148 L 642 155 L 660 165 L 675 180 L 670 195 L 655 200 L 638 195 L 625 185 L 615 170 Z",
    // Australia
    "M 635 275 L 662 268 L 690 272 L 712 282 L 722 296 L 718 315 L 705 328 L 685 335 L 662 330 L 645 320 L 635 305 L 630 290 Z",
    // Japan
    "M 680 78 L 688 72 L 695 75 L 692 85 L 685 90 L 680 85 Z",
    // UK
    "M 378 62 L 384 58 L 388 62 L 385 68 L 380 67 Z",
  ];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#0a1225" }}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        style={{ width: "100%", height: "100%", cursor: dragStart ? "grabbing" : "crosshair", display: "block" }}
        onClick={handleSvgClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <radialGradient id="ocean" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0f1d35" />
            <stop offset="100%" stopColor="#080f1e" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <rect x={viewBox.x - 100} y={viewBox.y - 100} width={viewBox.w + 200} height={viewBox.h + 200} fill="url(#ocean)" />

        {/* Grid */}
        {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map(x => (
          <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={450} stroke="rgba(80,140,220,0.04)" strokeWidth="0.5" />
        ))}
        {[0, 56, 112, 168, 225, 282, 338, 394, 450].map(y => (
          <line key={`gy${y}`} x1={0} y1={y} x2={800} y2={y} stroke="rgba(80,140,220,0.04)" strokeWidth="0.5" />
        ))}
        {/* Equator */}
        <line x1={0} y1={225} x2={800} y2={225} stroke="rgba(80,140,220,0.07)" strokeWidth="0.6" strokeDasharray="4,8" />

        {/* Continents */}
        {continents.map((d, i) => (
          <path key={i} d={d} fill="#152040" stroke="rgba(80,150,230,0.12)" strokeWidth="0.7" />
        ))}

        {/* Connection lines */}
        {pins.map((p, i) => {
          const pos = project(p.lat, p.lng);
          return pins.slice(i + 1).map((q, j) => {
            const pos2 = project(q.lat, q.lng);
            return <line key={`c${i}-${j}`} x1={pos.x} y1={pos.y} x2={pos2.x} y2={pos2.y} stroke="rgba(80,150,230,0.025)" strokeWidth="0.4" />;
          });
        })}

        {/* Pins */}
        {pins.map(pin => {
          const pos = project(pin.lat, pin.lng);
          const isSelected = selectedPinId === pin.id;
          return (
            <g key={pin.id}
              onMouseEnter={() => setTooltip(pin)}
              onMouseLeave={() => setTooltip(null)}
              onClick={(e) => { e.stopPropagation(); onPinClick(pin.id); }}
              style={{ cursor: "pointer" }}
            >
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 14 : 10} fill="none" stroke={pin.color} strokeWidth="0.4" opacity="0.3">
                <animate attributeName="r" values={isSelected ? "10;18;10" : "8;14;8"} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.05;0.35" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 8 : 5} fill={pin.color} opacity="0.15" filter="url(#glow)" />
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 5.5 : 3.5} fill={pin.color} stroke="rgba(255,255,255,0.5)" strokeWidth="0.7" />
              <circle cx={pos.x} cy={pos.y} r={isSelected ? 2.5 : 1.5} fill="#fff" opacity="0.65" />
              {(tooltip?.id === pin.id || isSelected) && (
                <g>
                  <rect x={pos.x - 50} y={pos.y - 24} width="100" height="16" rx="8" fill="rgba(0,0,0,0.8)" stroke={pin.color} strokeWidth="0.4" />
                  <text x={pos.x} y={pos.y - 13.5} textAnchor="middle" fill="#fff" fontSize="7" fontFamily="'DM Sans',sans-serif" fontWeight="500">{pin.name}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Bottom instruction */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        background: "rgba(12,22,42,0.92)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(80,150,230,0.12)", borderRadius: 10,
        padding: "8px 18px", display: "flex", alignItems: "center", gap: 8, zIndex: 10,
      }}>
        <span style={{ fontSize: 16 }}>📍</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Click the map to drop your pin · Scroll to zoom · Drag to pan</span>
      </div>
    </div>
  );
}

// ─── Pin Detail Card ───
function PinCard({ pin, onClose }) {
  return (
    <div style={{
      background: "rgba(14,24,48,0.95)", backdropFilter: "blur(20px)",
      border: `1px solid ${pin.color}30`, borderRadius: 16, padding: 22,
      boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 30px ${pin.color}10`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: pin.color, boxShadow: `0 0 10px ${pin.color}` }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>{pin.name}</span>
          </div>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5 }}>{pin.location}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      {[
        { label: "Leadership Value", content: <span style={{ display: "inline-block", background: `${pin.color}15`, border: `1px solid ${pin.color}35`, borderRadius: 20, padding: "4px 13px", color: pin.color, fontSize: 12, fontWeight: 500 }}>{pin.value}</span> },
        { label: "Interests", content: <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 1.5 }}>{pin.interests}</span> },
        { label: "Cultural Insight", content: <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.6, fontStyle: "italic", borderLeft: `2px solid ${pin.color}35`, paddingLeft: 11 }}>"{pin.cultural}"</div> },
      ].map(s => (
        <div key={s.label} style={{ marginBottom: 13 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 5 }}>{s.label}</div>
          {s.content}
        </div>
      ))}
    </div>
  );
}

// ─── Add Form ───
function AddForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState("");
  const [value, setValue] = useState("");
  const [cultural, setCultural] = useState("");
  const valid = name.trim() && location.trim() && value;

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: "9px 11px", color: "#e8edf5", fontFamily: "'DM Sans',sans-serif",
    fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { display: "block", fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 5 };

  return (
    <div style={{ background: "rgba(14,24,48,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(80,150,230,0.12)", borderRadius: 16, padding: 22 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>📍 Drop Your Pin</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 18 }}>Share your story with the class</div>

      {[
        { label: "Your Name *", val: name, set: setName, ph: "e.g. Maria Santos" },
        { label: "Where are you from? *", val: location, set: setLocation, ph: "e.g. São Paulo, Brazil" },
        { label: "Your Interests", val: interests, set: setInterests, ph: "e.g. Photography, Hiking" },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 13 }}>
          <label style={labelStyle}>{f.label}</label>
          <input style={inputStyle} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
        </div>
      ))}

      <div style={{ marginBottom: 13 }}>
        <label style={labelStyle}>Leadership Value *</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {VALUES.slice(0, 10).map(v => (
            <button key={v} onClick={() => setValue(v)} style={{
              background: value === v ? "rgba(74,158,255,0.15)" : "rgba(255,255,255,0.03)",
              border: value === v ? "1px solid rgba(74,158,255,0.4)" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, padding: "4px 11px", color: value === v ? "#7ec8e3" : "rgba(255,255,255,0.45)",
              fontFamily: "'DM Sans',sans-serif", fontSize: 11, cursor: "pointer",
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Cultural Insight</label>
        <textarea style={{ ...inputStyle, minHeight: 55, resize: "vertical" }} placeholder="What did your background teach you about leadership?" value={cultural} onChange={e => setCultural(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: 10, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: "pointer",
        }}>Cancel</button>
        <button onClick={() => valid && onSubmit({ name: name.trim(), location: location.trim(), interests: interests.trim() || "Not shared yet", value, cultural: cultural.trim() || "Story coming soon…" })} disabled={!valid} style={{
          flex: 2, background: valid ? "linear-gradient(135deg,#2563eb,#7c3aed)" : "rgba(255,255,255,0.05)",
          border: "none", borderRadius: 10, padding: 10, color: valid ? "#fff" : "rgba(255,255,255,0.2)",
          fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: valid ? "pointer" : "not-allowed",
        }}>Place My Pin 🌍</button>
      </div>
    </div>
  );
}

// ─── Dashboard ───
function Dashboard({ pins }) {
  const totalRoster = pins.length + ROSTER_ONLY.length;
  const completionRate = Math.round((pins.length / totalRoster) * 100);
  const avgInteractions = Math.round(pins.reduce((s, p) => s + (p.interactions || 0), 0) / pins.length);
  const valueCounts = {};
  pins.forEach(p => { valueCounts[p.value] = (valueCounts[p.value] || 0) + 1; });
  const sortedValues = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);
  const maxV = Math.max(...sortedValues.map(v => v[1]));

  const regions = {};
  pins.forEach(p => {
    const loc = p.location.toLowerCase();
    let r = "Other";
    if (loc.includes("usa") || loc.includes("arizona") || loc.includes("mexico")) r = "North America";
    else if (loc.includes("brazil")) r = "South America";
    else if (loc.includes("france") || loc.includes("sweden")) r = "Europe";
    else if (loc.includes("nigeria") || loc.includes("kenya")) r = "Africa";
    else if (loc.includes("india") || loc.includes("ahmedabad") || loc.includes("mumbai")) r = "South Asia";
    else if (loc.includes("japan") || loc.includes("china") || loc.includes("osaka") || loc.includes("chengdu")) r = "East Asia";
    else if (loc.includes("jordan") || loc.includes("amman")) r = "Middle East";
    regions[r] = (regions[r] || 0) + 1;
  });
  const sortedRegions = Object.entries(regions).sort((a, b) => b[1] - a[1]);
  const maxR = Math.max(...sortedRegions.map(r => r[1]));
  const regionColors = { "North America":"#7EC8E3","South America":"#E8A87C","Europe":"#C9B1FF","Africa":"#D4A574","South Asia":"#FFDAC1","East Asia":"#85CDCA","Middle East":"#FFB6B9","Other":"#B5EAD7" };

  const heatmap = [[0,0,0,0,0,0,0],[0,0,2,1,0,0,0],[3,1,2,3,1,0,1],[1,2,0,1,2,0,0]];

  const cardStyle = { background: "#0e1a30", border: "1px solid rgba(80,150,230,0.07)", borderRadius: 14, padding: "18px 22px" };
  const sectionLabel = { fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.28)", marginBottom: 5 };
  const bigNum = (v, c) => <div style={{ fontSize: 38, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>;

  const allStudents = [
    ...pins.map(p => ({ ...p, status: "completed" })),
    ...ROSTER_ONLY,
  ];

  const insights = [
    { icon: "🔄", text: <><b style={{ color: "#4a9eff" }}>Resilience</b> is the most popular value — consider opening class with a discussion on how different cultures define resilience.</> },
    { icon: "🌍", text: <><b style={{ color: "#4a9eff" }}>{ROSTER_ONLY.filter(s => s.status === "missing").length} students</b> haven't submitted yet. Consider a gentle reminder.</> },
    { icon: "🤝", text: <>Students from <b style={{ color: "#4a9eff" }}>South Asia and East Asia</b> share overlapping values — great pairing for the group project.</> },
    { icon: "📊", text: <><b style={{ color: "#4a9eff" }}>{pins.filter(p => (p.interactions||0) < 5).length} students</b> viewed fewer than 5 peers. Consider a "3 connections" task.</> },
  ];

  return (
    <div style={{ padding: "24px 32px", overflowY: "auto", height: "100%", background: "#080f1e" }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, marginBottom: 3 }}>Professor Dashboard</h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>OGL 360 — Section A — Spring 2025 — Cultural Map Icebreaker</p>
      </div>

      {/* Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 18 }}>
        <div style={cardStyle}>
          <div style={sectionLabel}>Completion Rate</div>
          {bigNum(`${completionRate}%`, completionRate >= 70 ? "#2ecc71" : completionRate >= 50 ? "#f1c40f" : "#e74c3c")}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{pins.length} of {totalRoster} students</div>
          <div style={{ marginTop: 10, height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${completionRate}%`, height: "100%", background: completionRate >= 70 ? "#2ecc71" : "#f1c40f", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionLabel}>Avg Peer Interactions</div>
          {bigNum(avgInteractions, "#4a9eff")}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>profiles viewed per student</div>
          <div style={{ marginTop: 10 }}>
            {[
              { label: "High (10+)", count: pins.filter(p => (p.interactions||0) >= 10).length, color: "#4a9eff" },
              { label: "Low (<5)", count: pins.filter(p => (p.interactions||0) < 5).length, color: "#e74c3c" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", width: 60 }}>{r.label}</span>
                <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${(r.count / pins.length) * 100}%`, height: "100%", background: r.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", width: 16, textAlign: "right" }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionLabel}>Geographic Diversity</div>
          {bigNum(sortedRegions.length, "#C9B1FF")}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>regions represented</div>
          <div style={{ marginTop: 10 }}>
            {sortedRegions.map(([region, count]) => (
              <div key={region} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", width: 80, flexShrink: 0 }}>{region}</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(count/maxR)*100}%`, height: "100%", background: regionColors[region] || "#666", borderRadius: 3 }} />
                </div>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", width: 14, textAlign: "right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Values + Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        <div style={cardStyle}>
          <div style={sectionLabel}>Leadership Value Distribution</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 130, paddingTop: 8 }}>
            {sortedValues.map(([v, c]) => {
              const color = pins.find(p => p.value === v)?.color || "#666";
              return (
                <div key={v} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>{c}</div>
                  <div style={{ width: "100%", height: `${(c/maxV)*85}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: 4, transition: "height 0.4s" }} />
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.2, maxWidth: 50, wordBreak: "break-word" }}>{v}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={sectionLabel}>🧠 AI Insights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: "rgba(74,158,255,0.03)", border: "1px solid rgba(74,158,255,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  <span style={{ marginRight: 6 }}>{ins.icon}</span>{ins.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={sectionLabel}>Submission Activity Heatmap</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Feb 3–9 assignment period</div>
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>LESS</span>
            {[0.04, 0.12, 0.25, 0.45, 0.7].map((o, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: `rgba(74,158,255,${o})` }} />
            ))}
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>MORE</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 4, paddingLeft: 50 }}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
            <div key={d} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>{d}</div>
          ))}
        </div>
        {heatmap.map((week, wi) => (
          <div key={wi} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}>
            <div style={{ width: 46, fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace", textAlign: "right" }}>Wk {wi+1}</div>
            {week.map((val, di) => (
              <div key={di} style={{ flex: 1, height: 18, borderRadius: 3, background: `rgba(74,158,255,${val === 0 ? 0.03 : 0.08 + (val/3)*0.6})`, transition: "background 0.3s" }} title={`${val} submissions`} />
            ))}
          </div>
        ))}
      </div>

      {/* Row 4: Integrity signals */}
      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={sectionLabel}>🔒 Integrity Signals</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 10 }}>
          {[
            { num: pins.length, label: "Unique Pin Placements", sub: "Each at unique coordinates", color: "#2ecc71" },
            { num: pins.length, label: "Unique Cultural Stories", sub: "No duplicates detected", color: "#4a9eff" },
            { num: "2m 34s", label: "Avg Time on Task", sub: "Above engagement threshold", color: "#C9B1FF" },
            { num: "0", label: "Flagged Submissions", sub: "No suspicious patterns", color: "#E8A87C" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 13, background: `${s.color}08`, border: `1px solid ${s.color}18`, borderRadius: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.num}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5: Roster table */}
      <div style={cardStyle}>
        <div style={{ ...sectionLabel, marginBottom: 4 }}>Student Roster</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
          {totalRoster} enrolled · {pins.length} completed · {ROSTER_ONLY.filter(s=>s.status==="pending").length} in progress · {ROSTER_ONLY.filter(s=>s.status==="missing").length} not started
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Student","Location","Value","Interactions","Submitted","Status"].map(h => (
                  <th key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.25)", textAlign: "left", padding: "7px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allStudents.map((s, i) => {
                const isComplete = s.status === "completed";
                const dateStr = isComplete && s.submitted ? new Date(s.submitted).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
                const statusClass = isComplete ? { bg: "rgba(46,204,113,0.1)", color: "#2ecc71", text: "✓ Completed" }
                  : s.status === "pending" ? { bg: "rgba(241,196,15,0.1)", color: "#f1c40f", text: "⏳ In Progress" }
                  : { bg: "rgba(231,76,60,0.1)", color: "#e74c3c", text: "⚠ Not Started" };
                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "9px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: isComplete ? s.color : "rgba(255,255,255,0.12)", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: isComplete ? 500 : 400, color: isComplete ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "9px 10px", fontSize: 12, color: isComplete ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>{isComplete ? s.location : "—"}</td>
                    <td style={{ padding: "9px 10px" }}>
                      {isComplete ? <span style={{ display: "inline-block", background: `${s.color}12`, border: `1px solid ${s.color}28`, borderRadius: 12, padding: "2px 9px", fontSize: 10, color: s.color }}>{s.value}</span> : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "9px 10px", fontFamily: "'DM Mono',monospace", fontSize: 11, color: isComplete ? ((s.interactions||0) < 5 ? "#e74c3c" : "rgba(255,255,255,0.5)") : "rgba(255,255,255,0.2)" }}>
                      {isComplete ? s.interactions : "—"}
                    </td>
                    <td style={{ padding: "9px 10px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{dateStr}</td>
                    <td style={{ padding: "9px 10px" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 500, background: statusClass.bg, color: statusClass.color, border: `1px solid ${statusClass.color}30` }}>{statusClass.text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [pins, setPins] = useState(DEMO_PINS);
  const [view, setView] = useState("student"); // student | dashboard
  const [selectedPinId, setSelectedPinId] = useState(null);
  const [addingAt, setAddingAt] = useState(null); // { lat, lng }

  const handleMapClick = (lat, lng) => {
    setSelectedPinId(null);
    setAddingAt({ lat, lng });
  };

  const handlePinClick = (id) => {
    setAddingAt(null);
    setSelectedPinId(id === selectedPinId ? null : id);
  };

  const handleAddPin = (data) => {
    const newPin = {
      id: Date.now(),
      ...data,
      lat: addingAt.lat,
      lng: addingAt.lng,
      color: COLORS[pins.length % COLORS.length],
      submitted: new Date().toISOString(),
      interactions: 0,
    };
    setPins(prev => [...prev, newPin]);
    setAddingAt(null);
    setSelectedPinId(newPin.id);
  };

  const uniqueLocations = new Set(pins.map(p => p.location)).size;
  const uniqueValues = new Set(pins.map(p => p.value)).size;
  const selectedPin = pins.find(p => p.id === selectedPinId);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#080f1e", color: "#e8edf5", fontFamily: "'DM Sans',-apple-system,sans-serif", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Instrument+Serif&display=swap" rel="stylesheet" />

      {/* Top Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 26px", borderBottom: "1px solid rgba(80,150,230,0.07)", background: "rgba(8,15,30,0.95)", flexShrink: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: 2.5, color: "rgba(255,255,255,0.25)" }}>OGL 360 · Intercultural Leadership · Dr. Hirshorn</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 23, fontWeight: 400, background: "linear-gradient(135deg,#e0e8ff,#7ec8e3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Where We Come From</div>
          </div>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(80,150,230,0.07)", borderRadius: 10, overflow: "hidden" }}>
            {[{ key: "student", label: "🌍 Student Map" }, { key: "dashboard", label: "📊 Dashboard" }].map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{
                background: view === v.key ? "rgba(74,158,255,0.1)" : "none",
                border: "none", color: view === v.key ? "#4a9eff" : "rgba(255,255,255,0.4)",
                padding: "8px 17px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500,
                cursor: "pointer", letterSpacing: 0.3,
              }}>{v.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {[
            { icon: "👥", num: pins.length, label: "Voices" },
            { icon: "🌍", num: uniqueLocations, label: "Locations" },
            { icon: "💎", num: uniqueValues, label: "Values" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "student" ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <WorldMap pins={pins} onMapClick={handleMapClick} selectedPinId={selectedPinId} onPinClick={handlePinClick} />
          </div>
          <div style={{ width: 330, flexShrink: 0, borderLeft: "1px solid rgba(80,150,230,0.06)", background: "#0c1629", overflowY: "auto", padding: 18 }}>
            {addingAt ? (
              <AddForm onSubmit={handleAddPin} onCancel={() => setAddingAt(null)} />
            ) : selectedPin ? (
              <PinCard pin={selectedPin} onClose={() => setSelectedPinId(null)} />
            ) : (
              <>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Value Cloud</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 22 }}>
                  {Object.entries(pins.reduce((acc, p) => { acc[p.value] = (acc[p.value]||0)+1; return acc; }, {})).sort((a,b)=>b[1]-a[1]).map(([v,c]) => (
                    <span key={v} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "3px 11px", color: "rgba(255,255,255,0.45)", fontSize: 10 + c * 1.5 }}>{v}{c > 1 ? ` ×${c}` : ""}</span>
                  ))}
                </div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Recent Voices</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[...pins].reverse().map(pin => (
                    <div key={pin.id} onClick={() => setSelectedPinId(pin.id)} style={{
                      display: "flex", alignItems: "center", gap: 9, padding: "9px 11px",
                      background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)",
                      borderRadius: 9, cursor: "pointer", transition: "background 0.15s",
                    }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                       onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.015)"}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: pin.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{pin.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{pin.location}</div>
                      </div>
                      <span style={{ background: `${pin.color}10`, border: `1px solid ${pin.color}25`, borderRadius: 10, padding: "2px 7px", fontSize: 9, color: pin.color, flexShrink: 0 }}>{pin.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Dashboard pins={pins} />
        </div>
      )}
    </div>
  );
}
