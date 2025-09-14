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
                    if (el) el.style.display = (cat === navTo) ? '' : 'none';
                });
            }
        };
    });
    // Default to overall view
    if (leaderboard) leaderboard.style.display = '';
    if (categoryTable) categoryTable.style.display = '';
    Object.values(sectionIds).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
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

function updateCalculations() {
    let totals = {
        'Kids': {A:0, B:0},
        'Sub Junior': {A:0, B:0},
        'Junior': {A:0, B:0},
        'Senior': {A:0, B:0}
    };
    let totalA = 0, totalB = 0;
    categories.forEach(cat => {
        const rows = document.querySelectorAll(`#${tableIds[cat]} tr`);
        rows.forEach(row => {
            const a = parseInt(row.querySelector('input[name="teamA"]').value, 10) || 0;
            const b = parseInt(row.querySelector('input[name="teamB"]').value, 10) || 0;
            totals[cat].A += a;
            totals[cat].B += b;
            totalA += a;
            totalB += b;
        });
    });
    // Update per-category table
    document.getElementById('kidsA').textContent = totals['Kids'].A;
    document.getElementById('kidsB').textContent = totals['Kids'].B;
    document.getElementById('subjuniorA').textContent = totals['Sub Junior'].A;
    document.getElementById('subjuniorB').textContent = totals['Sub Junior'].B;
    document.getElementById('juniorA').textContent = totals['Junior'].A;
    document.getElementById('juniorB').textContent = totals['Junior'].B;
    document.getElementById('seniorA').textContent = totals['Senior'].A;
    document.getElementById('seniorB').textContent = totals['Senior'].B;
    // Update overall total and leader
    if (document.getElementById('overallA')) document.getElementById('overallA').textContent = totalA;
    if (document.getElementById('overallB')) document.getElementById('overallB').textContent = totalB;
    let leader = '';
    if (totalA > totalB) leader = 'Team A is leading!';
    else if (totalB > totalA) leader = 'Team B is leading!';
    else leader = "It's a tie!";
    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) leaderboard.textContent = leader;
}

document.addEventListener('DOMContentLoaded', function() {
    setupLogin();
    setupTableEvents();
    loadTablesFromStorage();
});
