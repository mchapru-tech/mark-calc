const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const path = require('path');
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public/


// Store the latest marks data in memory
let latestMarksData = null;

io.on('connection', (socket) => {
    console.log('A user connected');

    // When a new user connects, send them the latest data if available
    if (latestMarksData) {
        socket.emit('user-update', latestMarksData);
    }

    // Listen for admin updates
    socket.on('admin-update', (data) => {
        latestMarksData = data; // Save the latest data
        socket.broadcast.emit('user-update', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// All client/browser code removed. Only server code remains.
