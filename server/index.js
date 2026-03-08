const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Serve the client folder as static files
app.use(express.static(path.join(__dirname, '../client')));

// In-memory store of connected students
let students = [];

io.on('connection', (socket) => {
  console.log(`Student connected: ${socket.id}`);

  // Send existing students to the newly connected client
  socket.emit('students', students);
  io.emit('count', students.length);

  // Student drops their pin
  socket.on('join', (student) => {
    student.id = socket.id;
    students.push(student);
    console.log(`${student.name} joined from ${student.country}`);
    io.emit('student-joined', student);
    io.emit('count', students.length);
  });

  // Student disconnects
  socket.on('disconnect', () => {
    const idx = students.findIndex(s => s.id === socket.id);
    if (idx !== -1) {
      console.log(`${students[idx].name} left`);
      students.splice(idx, 1);
      io.emit('student-left', socket.id);
      io.emit('count', students.length);
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🌍 Student World server running at http://localhost:${PORT}`);
});
