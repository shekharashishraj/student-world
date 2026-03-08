// ─── Country Data (name → lat/lng) ───────────────────────────────────────────
const COUNTRIES = {
  "Afghanistan": { lat: 33.93, lng: 67.71 },
  "Argentina": { lat: -38.42, lng: -63.62 },
  "Australia": { lat: -25.27, lng: 133.78 },
  "Austria": { lat: 47.52, lng: 14.55 },
  "Bangladesh": { lat: 23.68, lng: 90.35 },
  "Belgium": { lat: 50.50, lng: 4.47 },
  "Brazil": { lat: -14.24, lng: -51.93 },
  "Canada": { lat: 56.13, lng: -106.35 },
  "Chile": { lat: -35.68, lng: -71.54 },
  "China": { lat: 35.86, lng: 104.20 },
  "Colombia": { lat: 4.57, lng: -74.30 },
  "Czech Republic": { lat: 49.82, lng: 15.47 },
  "Denmark": { lat: 56.26, lng: 9.50 },
  "Egypt": { lat: 26.82, lng: 30.80 },
  "Ethiopia": { lat: 9.15, lng: 40.49 },
  "Finland": { lat: 61.92, lng: 25.75 },
  "France": { lat: 46.23, lng: 2.21 },
  "Germany": { lat: 51.17, lng: 10.45 },
  "Ghana": { lat: 7.95, lng: -1.02 },
  "Greece": { lat: 39.07, lng: 21.82 },
  "Hungary": { lat: 47.16, lng: 19.50 },
  "India": { lat: 20.59, lng: 78.96 },
  "Indonesia": { lat: -0.79, lng: 113.92 },
  "Iran": { lat: 32.43, lng: 53.69 },
  "Iraq": { lat: 33.22, lng: 43.68 },
  "Ireland": { lat: 53.41, lng: -8.24 },
  "Israel": { lat: 31.05, lng: 34.85 },
  "Italy": { lat: 41.87, lng: 12.57 },
  "Japan": { lat: 36.20, lng: 138.25 },
  "Jordan": { lat: 30.59, lng: 36.24 },
  "Kenya": { lat: -0.02, lng: 37.91 },
  "Malaysia": { lat: 4.21, lng: 108.96 },
  "Mexico": { lat: 23.63, lng: -102.55 },
  "Morocco": { lat: 31.79, lng: -7.09 },
  "Netherlands": { lat: 52.13, lng: 5.29 },
  "New Zealand": { lat: -40.90, lng: 174.89 },
  "Nigeria": { lat: 9.08, lng: 8.68 },
  "Norway": { lat: 60.47, lng: 8.47 },
  "Pakistan": { lat: 30.38, lng: 69.35 },
  "Peru": { lat: -9.19, lng: -75.02 },
  "Philippines": { lat: 12.88, lng: 121.77 },
  "Poland": { lat: 51.92, lng: 19.15 },
  "Portugal": { lat: 39.40, lng: -8.22 },
  "Romania": { lat: 45.94, lng: 24.97 },
  "Russia": { lat: 61.52, lng: 105.32 },
  "Saudi Arabia": { lat: 23.89, lng: 45.08 },
  "South Africa": { lat: -30.56, lng: 22.94 },
  "South Korea": { lat: 35.91, lng: 127.77 },
  "Spain": { lat: 40.46, lng: -3.75 },
  "Sri Lanka": { lat: 7.87, lng: 80.77 },
  "Sweden": { lat: 60.13, lng: 18.64 },
  "Switzerland": { lat: 46.82, lng: 8.23 },
  "Taiwan": { lat: 23.70, lng: 121.00 },
  "Tanzania": { lat: -6.37, lng: 34.89 },
  "Thailand": { lat: 15.87, lng: 100.99 },
  "Turkey": { lat: 38.96, lng: 35.24 },
  "Uganda": { lat: 1.37, lng: 32.29 },
  "Ukraine": { lat: 48.38, lng: 31.17 },
  "United Arab Emirates": { lat: 23.42, lng: 53.85 },
  "United Kingdom": { lat: 55.38, lng: -3.44 },
  "USA": { lat: 37.09, lng: -95.71 },
  "Venezuela": { lat: 6.42, lng: -66.59 },
  "Vietnam": { lat: 14.06, lng: 108.28 },
  "Zimbabwe": { lat: -19.02, lng: 29.15 }
};

// ─── State ────────────────────────────────────────────────────────────────────
let students = [];
let myStudent = null;
let globe = null;

// ─── Populate country dropdown ────────────────────────────────────────────────
const countrySelect = document.getElementById('country-select');
Object.keys(COUNTRIES).sort().forEach(name => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  countrySelect.appendChild(opt);
});

// ─── Init Globe ───────────────────────────────────────────────────────────────
function initGlobe() {
  globe = Globe()
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .atmosphereColor('#3b82f6')
    .atmosphereAltitude(0.15)
    // Student pins
    .pointsData(students)
    .pointLat(d => d.lat)
    .pointLng(d => d.lng)
    .pointColor(d => d.isMe ? '#fbbf24' : '#38bdf8')
    .pointAltitude(0.02)
    .pointRadius(0.4)
    .pointLabel(d => `
      <div style="
        background: rgba(10,20,50,0.9);
        border: 1px solid rgba(125,211,252,0.4);
        border-radius: 10px;
        padding: 8px 14px;
        font-family: sans-serif;
        color: white;
        font-size: 13px;
        text-align: center;
      ">
        <b>${d.name}</b><br/>
        <span style="color:#7dd3fc;font-size:11px;">${d.country}</span>
      </div>
    `)
    .onPointClick(d => showStudentCard(d))
    (document.getElementById('globe-container'));

  // Auto rotate slowly
  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;

  // Initial camera position
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
}

// ─── Refresh globe pins ───────────────────────────────────────────────────────
function refreshGlobe() {
  if (globe) {
    globe.pointsData([...students]);
  }
  document.getElementById('student-count').textContent =
    `${students.length} student${students.length !== 1 ? 's' : ''} on the map`;
}

// ─── Show student card ────────────────────────────────────────────────────────
function showStudentCard(student) {
  document.getElementById('card-name').textContent = student.name;
  document.getElementById('card-country').textContent = `📍 ${student.country}`;
  document.getElementById('card-time').textContent =
    `Joined ${formatTime(student.joinedAt)}`;
  document.getElementById('student-card').style.display = 'block';

  // Fly globe camera to that pin
  globe.pointOfView({ lat: student.lat, lng: student.lng, altitude: 1.8 }, 1000);
}

document.getElementById('close-card').onclick = () => {
  document.getElementById('student-card').style.display = 'none';
};

function formatTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Join handler ─────────────────────────────────────────────────────────────
document.getElementById('join-btn').onclick = () => {
  const name = document.getElementById('name-input').value.trim();
  const country = document.getElementById('country-select').value;

  if (!name) { alert('Please enter your name!'); return; }
  if (!country) { alert('Please select your country!'); return; }

  const coords = COUNTRIES[country];
  myStudent = {
    id: Date.now().toString(),
    name,
    country,
    lat: coords.lat + (Math.random() - 0.5) * 2, // slight random offset so pins don't stack
    lng: coords.lng + (Math.random() - 0.5) * 2,
    joinedAt: Date.now(),
    isMe: true
  };

  // Add to local list
  addStudent(myStudent);

  // Stop auto rotation when student joins
  globe.controls().autoRotate = false;

  // Fly to their country
  globe.pointOfView({ lat: myStudent.lat, lng: myStudent.lng, altitude: 1.5 }, 1500);

  // Show joined state
  document.getElementById('join-form').style.display = 'none';
  document.getElementById('joined-msg').style.display = 'block';
  document.getElementById('joined-name').textContent = name;
  document.getElementById('joined-country').textContent = `📍 ${country}`;

  // --- Socket.io: emit to server (Phase 2) ---
  // socket.emit('join', myStudent);
};

// ─── Add student to state + globe ────────────────────────────────────────────
function addStudent(student) {
  students.push(student);
  refreshGlobe();
}

// ─── Socket.io (Phase 2 - uncomment when server is ready) ────────────────────
/*
const socket = io('http://localhost:3000');

socket.on('students', (existingStudents) => {
  students = existingStudents;
  refreshGlobe();
});

socket.on('student-joined', (student) => {
  addStudent(student);
});

socket.on('student-left', (id) => {
  students = students.filter(s => s.id !== id);
  refreshGlobe();
});

socket.on('count', (count) => {
  document.getElementById('student-count').textContent =
    `${count} student${count !== 1 ? 's' : ''} on the map`;
});
*/

// ─── Demo: Add some sample students so the globe isn't empty ─────────────────
const demoStudents = [
  { id: 'demo1', name: 'Priya', country: 'India', lat: 19.1, lng: 72.9, joinedAt: Date.now() - 300000, isMe: false },
  { id: 'demo2', name: 'Carlos', country: 'Brazil', lat: -23.5, lng: -46.6, joinedAt: Date.now() - 600000, isMe: false },
  { id: 'demo3', name: 'Emma', country: 'United Kingdom', lat: 51.5, lng: -0.1, joinedAt: Date.now() - 120000, isMe: false },
  { id: 'demo4', name: 'Yuki', country: 'Japan', lat: 35.7, lng: 139.7, joinedAt: Date.now() - 900000, isMe: false },
  { id: 'demo5', name: 'Amara', country: 'Nigeria', lat: 6.5, lng: 3.4, joinedAt: Date.now() - 180000, isMe: false },
];

// ─── Boot ─────────────────────────────────────────────────────────────────────
initGlobe();
demoStudents.forEach(s => addStudent(s));
