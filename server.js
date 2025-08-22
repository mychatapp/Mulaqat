const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { Low, JSONFile } = require('lowdb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Database file
const file = new JSONFile('db.json');
const db = new Low(file);

// Static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Server start hote hi data load karo
server.listen(process.env.PORT || 3000, async () => {
  await db.read();
  if (!db.data) db.data = { messages: [] };
  console.log('App chal rahi hai: http://localhost:3000');
});

// Jab koi user connect ho
io.on('connection', (socket) => {
  console.log('Naya user judega');

  // Pehle ke messages bhejo
  socket.emit('load messages', db.data.messages);

  // Jab koi message bheje
  socket.on('chat message', async (msg) => {
    const newMsg = { 
      text: msg, 
      time: new Date().toLocaleTimeString() 
    };
    db.data.messages.push(newMsg);
    await db.write(); // File mein save karo

    // Sabko dikha do
    io.emit('chat message', newMsg);
  });

  socket.on('disconnect', () => {
    console.log('User alag ho gaya');
  });
});