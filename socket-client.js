// Socket.IO client logic for real-time updates
const socket = io();

// Listen for real-time updates from admin
if (typeof window !== 'undefined') {
    socket.on('user-update', (data) => {
        // Overwrite tables with new data from admin
        localStorage.setItem('markCalcGames', JSON.stringify(data));
        if (typeof loadTablesFromStorage === 'function') {
            loadTablesFromStorage();
        }
        alert('Data updated by admin!');
    });
}

// Make socket available globally for app.js
window.socket = socket;
