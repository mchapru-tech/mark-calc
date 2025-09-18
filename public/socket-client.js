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
		if (typeof updateCalculations === 'function') {
			updateCalculations();
		}
		alert('Data updated by admin!');
	});
}
// Winner announcement from admin
// Winner announcement from admin
socket.on('winner-announcement', (data) => {
    const banner = document.getElementById('winnerBanner');
    const generateBtn = document.getElementById('generateResultBtn');
    const undoBtn = document.getElementById('undoResultBtn');

    if (banner) {
        banner.innerHTML = data.message;
        banner.style.display = "block";
    }

    // 👇 Only toggle buttons if this is an admin
    if (window.currentRole === "admin" && generateBtn && undoBtn) {
        generateBtn.style.display = "none";
        undoBtn.style.display = "inline-block";
    }
});

// Undo announcement from admin
socket.on('undo-announcement', () => {
    const banner = document.getElementById('winnerBanner');
    const generateBtn = document.getElementById('generateResultBtn');
    const undoBtn = document.getElementById('undoResultBtn');

    if (banner) {
        banner.innerHTML = "";
        banner.style.display = "none";
    }

    // 👇 Only toggle buttons if this is an admin
    if (window.currentRole === "admin" && generateBtn && undoBtn) {
        generateBtn.style.display = "inline-block";
        undoBtn.style.display = "none";
    }
});



// Make socket available globally for app.js
window.socket = socket;
