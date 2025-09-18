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

    if (latestMarksData) {
        socket.emit('user-update', latestMarksData);
    }

    // Existing: Admin pushes updated scores
    socket.on('admin-update', (data) => {
        latestMarksData = data;
        socket.broadcast.emit('user-update', data);
    });

    // ✅ New: Admin announces winner
    socket.on('winner-announcement', (data) => {
        io.emit('winner-announcement', data); // broadcast to ALL users
    });

    // ✅ New: Admin undoes result
    socket.on('undo-announcement', () => {
        io.emit('undo-announcement'); // broadcast to ALL users
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
