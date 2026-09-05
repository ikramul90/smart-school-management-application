const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database.js');


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load our visual interface file
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- SECURITY LOGIC WALKER-TALKIES (IPC) ---

// Check if an admin profile already exists
ipcMain.handle('check-admin-exists', async () => {
    return new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM admin_profile", [], (err, row) => {
            if (err || !row) resolve(false);
            else resolve(row.count > 0);
        });
    });
});

// Save a brand new admin profile (First-time setup)
ipcMain.handle('setup-admin', async (event, data) => {
    return new Promise((resolve) => {
        const query = `INSERT INTO admin_profile (username, password_hash, q1, a1, q2, a2, q3, a3, q4, a4, q5, a5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(query, [
            data.username, 
            data.password, // For production later, we will hash this. Keeping it simple for testing!
            data.q1, data.a1,
            data.q2, data.a2,
            data.q3, data.a3,
            data.q4, data.a4,
            data.q5, data.a5
        ], function(err) {
            if (err) resolve({ success: false, message: err.message });
            else resolve({ success: true });
        });
    });
});

// Verify login details
ipcMain.handle('attempt-login', async (event, data) => {
    return new Promise((resolve) => {
        db.get("SELECT * FROM admin_profile WHERE username = ? AND password_hash = ?", [data.username, data.password], (err, row) => {
            if (err || !row) resolve({ success: false, message: "Invalid username or password!" });
            else resolve({ success: true });
        });
    });
});