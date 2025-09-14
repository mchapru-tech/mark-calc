// Calculate and update totals for each category and overall
function updateCalculations() {
	let overallA = 0;
	let overallB = 0;
	const catMap = {
		'Kids': ['kidsA', 'kidsB', 'kidsTableBody'],
		'Sub Junior': ['subjuniorA', 'subjuniorB', 'subjuniorTableBody'],
		'Junior': ['juniorA', 'juniorB', 'juniorTableBody'],
		'Senior': ['seniorA', 'seniorB', 'seniorTableBody']
	};
	Object.entries(catMap).forEach(([cat, [aId, bId, bodyId]]) => {
		let sumA = 0, sumB = 0;
		const rows = document.querySelectorAll(`#${bodyId} tr`);
		rows.forEach(row => {
			const a = parseInt(row.querySelector('input[name="teamA"]')?.value || 0, 10);
			const b = parseInt(row.querySelector('input[name="teamB"]')?.value || 0, 10);
			sumA += isNaN(a) ? 0 : a;
			sumB += isNaN(b) ? 0 : b;
		});
		document.getElementById(aId).textContent = sumA;
		document.getElementById(bId).textContent = sumB;
		overallA += sumA;
		overallB += sumB;
	});
	document.getElementById('overallA').textContent = overallA;
	document.getElementById('overallB').textContent = overallB;
}
document.addEventListener('DOMContentLoaded', function() {
	setupLogin();
	setupTableEvents();
	loadTablesFromStorage();
	console.log('All handlers attached, page ready');
});
// Main client-side logic for Game Mark Calculator
// This file contains all DOM and browser-related code

const categories = ['Kids', 'Sub Junior', 'Junior', 'Senior'];
let gameCount = 0;
let currentRole = null;
const ADMIN_PASSWORD = 'admin333'; // Change as needed
const tableIds = {
	'Kids': 'kidsTableBody',
	'Sub Junior': 'subjuniorTableBody',
	'Junior': 'juniorTableBody',
	'Senior': 'seniorTableBody'
};

function setupLogin() {
	document.getElementById('role').addEventListener('change', function() {
		document.getElementById('adminPass').style.display = this.value === 'admin' ? 'inline-block' : 'none';
	});
	document.getElementById('loginForm').addEventListener('submit', function(e) {
		e.preventDefault();
		const role = document.getElementById('role').value;
		if (role === 'admin') {
			const pass = document.getElementById('adminPass').value;
			if (pass !== ADMIN_PASSWORD) {
				alert('Incorrect admin password!');
				return;
			}
		}
		currentRole = role;
		document.getElementById('loginSection').style.display = 'none';
		document.getElementById('mainSection').style.display = 'block';
		setRoleUI();
		if (role === 'user') setupUserNav();
	});
}

function setupUserNav() {
	const nav = document.getElementById('userNav');
	const leaderboard = document.getElementById('leaderboard');
	const categoryTable = document.getElementById('categoryTable');
	const sectionIds = {
		'Kids': 'kidsSection',
		'Sub Junior': 'subjuniorSection',
		'Junior': 'juniorSection',
		'Senior': 'seniorSection'
	};
	if (!nav) return;
	nav.querySelectorAll('.nav-btn').forEach(btn => {
		btn.onclick = function() {
			const navTo = btn.getAttribute('data-nav');
			// Hide all category total banners first
			document.querySelectorAll('.category-total-banner').forEach(banner => banner.remove());
			if (navTo === 'overall') {
				if (leaderboard) leaderboard.style.display = '';
				if (categoryTable) categoryTable.style.display = '';
				Object.values(sectionIds).forEach(id => {
					const el = document.getElementById(id);
					if (el) el.style.display = 'none';
				});
			} else {
				if (leaderboard) leaderboard.style.display = 'none';
				if (categoryTable) categoryTable.style.display = 'none';
				Object.entries(sectionIds).forEach(([cat, id]) => {
					const el = document.getElementById(id);
					if (el) {
						el.style.display = (cat === navTo) ? '' : 'none';
						if (cat === navTo && el.style.display !== 'none') {
							// Show total banner for this category
							const aId = cat.toLowerCase().replace(/ /g, '') + 'A';
							const bId = cat.toLowerCase().replace(/ /g, '') + 'B';
							const aVal = document.getElementById(aId)?.textContent || '0';
							const bVal = document.getElementById(bId)?.textContent || '0';
							const banner = document.createElement('div');
							banner.className = 'category-total-banner';
							banner.style = 'margin-bottom:12px;padding:10px 0;font-size:1.13rem;font-weight:600;background:#232946;color:#ffe066;border-radius:10px;text-align:center;';
							banner.innerHTML = `${cat} Total — Team A: <span style="color:#6a82fb;">${aVal}</span> &nbsp; Team B: <span style="color:#fc5c7d;">${bVal}</span>`;
							el.insertAdjacentElement('afterbegin', banner);
						}
					}
				});
			}
		};
	});
	// Default to overall view
	if (leaderboard) leaderboard.style.display = '';
	if (categoryTable) categoryTable.style.display = '';
	Object.values(sectionIds).forEach(id => {
		const el = document.getElementById(id);
		if (el) {
			el.style.display = 'none';
			// Remove any old banners
			el.querySelectorAll('.category-total-banner').forEach(banner => banner.remove());
		}
	});
}

function setRoleUI() {
	const isAdmin = currentRole === 'admin';
	document.querySelectorAll('.admin-only').forEach(el => {
		el.style.display = isAdmin ? '' : 'none';
	});
	const nav = document.getElementById('userNav');
	const leaderboard = document.getElementById('leaderboard');
	const categoryTable = document.getElementById('categoryTable');
	const sectionIds = {
		'Kids': 'kidsSection',
		'Sub Junior': 'subjuniorSection',
		'Junior': 'juniorSection',
		'Senior': 'seniorSection'
	};
	if (!isAdmin) {
		if (nav) nav.style.display = '';
		if (leaderboard) leaderboard.style.display = '';
		if (categoryTable) categoryTable.style.display = '';
		Object.values(sectionIds).forEach(id => {
			const el = document.getElementById(id);
			if (el) el.style.display = 'none';
		});
	} else {
		if (nav) nav.style.display = 'none';
		if (leaderboard) leaderboard.style.display = 'none';
		if (categoryTable) categoryTable.style.display = '';
		Object.values(sectionIds).forEach(id => {
			const el = document.getElementById(id);
			if (el) el.style.display = '';
		});
	}
}

function createGameRow(gameId = null, gameName = '', teamA = '', teamB = '', sn = 1) {
	const id = gameId !== null ? gameId : `game${gameCount++}`;
	return `<tr id="${id}">
		<td class="game-serial"></td>
		<td><input type="text" name="gameName" value="${gameName}" placeholder="Game name" required></td>
		<td><input type="number" name="teamA" min="0" value="${teamA}" required></td>
		<td><input type="number" name="teamB" min="0" value="${teamB}" required></td>
		<td class="admin-only"><button type="button" class="removeBtn">X</button></td>
	</tr>`;
}

function addGameRowToCategory(category) {
	const tbody = document.getElementById(tableIds[category]);
	tbody.insertAdjacentHTML('beforeend', createGameRow());
	updateSerialNumbers(category);
	updateCalculations();
	setRoleUI();
}

function updateSerialNumbers(category) {
	if (!category) {
		categories.forEach(cat => updateSerialNumbers(cat));
		return;
	}
	const rows = document.querySelectorAll(`#${tableIds[category]} tr`);
	rows.forEach((row, idx) => {
		const snCell = row.querySelector('.game-serial');
		if (snCell) snCell.textContent = idx + 1;
	});
}

function setupTableEvents() {
	document.getElementById('addKidsBtn').addEventListener('click', function() { addGameRowToCategory('Kids'); });
	document.getElementById('addSubJuniorBtn').addEventListener('click', function() { addGameRowToCategory('Sub Junior'); });
	document.getElementById('addJuniorBtn').addEventListener('click', function() { addGameRowToCategory('Junior'); });
	document.getElementById('addSeniorBtn').addEventListener('click', function() { addGameRowToCategory('Senior'); });
	categories.forEach(cat => {
		const tbody = document.getElementById(tableIds[cat]);
		tbody.addEventListener('input', function() { updateCalculations(); updateSerialNumbers(cat); });
		tbody.addEventListener('click', function(e) {
			if (e.target.classList.contains('removeBtn')) {
				e.target.closest('tr').remove();
				updateSerialNumbers(cat);
				updateCalculations();
			}
		});
	});
	// Upload button logic
	const uploadBtn = document.getElementById('uploadBtn');
	if (uploadBtn) {
		uploadBtn.addEventListener('click', saveAllTablesToStorage);
	}
}

function saveAllTablesToStorage() {
	const data = {};
	categories.forEach(cat => {
		const rows = document.querySelectorAll(`#${tableIds[cat]} tr`);
		data[cat] = [];
		rows.forEach(row => {
			const gameName = row.querySelector('input[name="gameName"]')?.value || '';
			const teamA = row.querySelector('input[name="teamA"]')?.value || '';
			const teamB = row.querySelector('input[name="teamB"]')?.value || '';
			if (gameName || teamA || teamB) {
				data[cat].push({ gameName, teamA, teamB });
			}
		});
	});
	localStorage.setItem('markCalcGames', JSON.stringify(data));
	alert('Games saved!');
	// Real-time update: If admin, emit update to users
	if (typeof socket !== 'undefined' && currentRole === 'admin') {
		socket.emit('admin-update', data);
	}
}

function loadTablesFromStorage() {
	const data = JSON.parse(localStorage.getItem('markCalcGames') || '{}');
	categories.forEach(cat => {
		const tbody = document.getElementById(tableIds[cat]);
		tbody.innerHTML = '';
		(data[cat] || []).forEach(game => {
			tbody.insertAdjacentHTML('beforeend', createGameRow(null, game.gameName, game.teamA, game.teamB));
		});
		updateSerialNumbers(cat);
	});
	updateCalculations();
	setRoleUI();
}

// Removed duplicate/incomplete function declaration
