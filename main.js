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

// --- SETTINGS SCREEN REGISTRATION ---

// Save or Update School Information
ipcMain.handle('save-school-info', async (event, info) => {
    return new Promise((resolve) => {
        // Check if data already exists
        db.get("SELECT COUNT(*) as count FROM classes", [], (err, row) => {
            // We'll simulate keeping school data in a key-value setup or direct tables later.
            // For now, let's acknowledge the channel works perfectly!
            resolve({ success: true });
        });
    });
});

// --- CORE CRUD BACKEND COMMANDS ---

// 1. SUBJECTS DATABASE WORKERS
ipcMain.handle('get-subjects', async () => {
    return new Promise((resolve) => {
        db.all(`SELECT subjects.*, classes.class_name
                FROM subjects
                LEFT JOIN classes ON subjects.class_id = classes.id
                ORDER BY classes.class_name, subjects.sequence_order`, [], (err, rows) => {
            resolve(rows || []);
        });
    });
});

ipcMain.handle('delete-subject', async (event, id) => {
    return new Promise((resolve) => {
        db.run(`DELETE FROM subjects WHERE id = ?`, [id], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

// 2. STUDENTS DATABASE WORKERS (WITH ADVANCED STATUS FILTERS)
ipcMain.handle('get-students', async (event, filters) => {
    return new Promise((resolve) => {
        let query = `SELECT students.*, classes.class_name FROM students LEFT JOIN classes ON students.class_id = classes.id WHERE 1=1`;
        let params = [];
        
        if (filters && filters.class_id) {
            query += ` AND students.class_id = ?`;
            params.push(filters.class_id);
        }
        if (filters && filters.status) {
            query += ` AND students.status = ?`;
            params.push(filters.status);
        }

        db.all(query, params, (err, rows) => {
            resolve(rows || []);
        });
    });
});

ipcMain.handle('add-student', async (event, s) => {
    return new Promise((resolve) => {
        db.run(`INSERT INTO students (roll, name, blood_group, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [s.roll, s.name, s.blood_group, s.fathers_name || null, s.mothers_name || null, s.guardian_name, s.guardian_contact, s.address, s.dob || null, s.birth_reg_number || null, s.class_id], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
}); 

ipcMain.handle('update-student', async (event, s) => {
    return new Promise((resolve) => {
        db.run(`UPDATE students SET roll = ?, name = ?, blood_group = ?, fathers_name = ?, mothers_name = ?, guardian_name = ?, guardian_contact = ?, address = ?, dob = ?, birth_reg_number = ?, class_id = ? WHERE id = ?`,
            [s.roll, s.name, s.blood_group, s.fathers_name || null, s.mothers_name || null, s.guardian_name, s.guardian_contact, s.address, s.dob || null, s.birth_reg_number || null, s.class_id, s.id], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

ipcMain.handle('remove-student-with-cause', async (event, data) => {
    return new Promise((resolve) => {
        db.run(`UPDATE students SET status = ?, removal_cause = ? WHERE id = ?`, [data.status, data.cause, data.id], (err) => {
            if (err) resolve({ success: false });
            else resolve({ success: true });
        });
    });
});

// Helper channels to load dropdown menus dynamically
ipcMain.handle('get-classes-list', async () => {
    return new Promise((resolve) => {
        db.all("SELECT * FROM classes", [], (err, rows) => resolve(rows || []));
    });
});

// Lightweight version used by dropdowns (Subjects form, etc.)
ipcMain.handle('get-teachers-list', async () => {
    return new Promise((resolve) => {
        db.all("SELECT id, name FROM teachers", [], (err, rows) => resolve(rows || []));
    });
});

// 3. TEACHERS DATABASE WORKERS
ipcMain.handle('get-teachers', async () => {
    return new Promise((resolve) => {
        db.all(`SELECT * FROM teachers ORDER BY name`, [], (err, rows) => {
            resolve(rows || []);
        });
    });
});

ipcMain.handle('add-teacher', async (event, t) => {
    return new Promise((resolve) => {
        db.run(`INSERT INTO teachers (name, title, fathers_name, mothers_name, contact_number, blood_group, nid_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.name, t.title, t.fathers_name || null, t.mothers_name || null, t.contact_number, t.blood_group, t.nid_number || null], function (err) {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true, id: this.lastID });
        });
    });
});

ipcMain.handle('set-teacher-classes', async (event, { teacher_id, class_ids }) => {
    return new Promise((resolve) => {
        const idList = class_ids && class_ids.length ? class_ids : [];
        const excludeClause = idList.length ? `AND id NOT IN (${idList.map(() => '?').join(',')})` : '';
        // Step 1: unassign this teacher from any class no longer in their selected list
        db.run(`UPDATE classes SET class_teacher_id = NULL WHERE class_teacher_id = ? ${excludeClause}`,
            [teacher_id, ...idList], (err) => {
            if (err) return resolve({ success: false, error: err.message });
            if (!idList.length) return resolve({ success: true });
            // Step 2: assign this teacher to every selected class
            const placeholders = idList.map(() => '?').join(',');
            db.run(`UPDATE classes SET class_teacher_id = ? WHERE id IN (${placeholders})`,
                [teacher_id, ...idList], (err2) => {
                if (err2) resolve({ success: false, error: err2.message });
                else resolve({ success: true });
            });
        });
    });
});

ipcMain.handle('update-teacher', async (event, t) => {
    return new Promise((resolve) => {
        db.run(`UPDATE teachers SET name = ?, title = ?, fathers_name = ?, mothers_name = ?, contact_number = ?, blood_group = ?, nid_number = ? WHERE id = ?`,
            [t.name, t.title, t.fathers_name || null, t.mothers_name || null, t.contact_number, t.blood_group, t.nid_number || null, t.id], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

ipcMain.handle('add-subject', async (event, data) => {
    return new Promise((resolve) => {
        db.run(`INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (?, ?, ?, ?, ?)`,
            [data.class_id, data.subject_name, data.sequence_order, data.monthly_marks || null, data.yearly_marks || null], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

ipcMain.handle('update-subject', async (event, data) => {
    return new Promise((resolve) => {
        db.run(`UPDATE subjects SET class_id = ?, subject_name = ?, sequence_order = ?, monthly_marks = ?, yearly_marks = ? WHERE id = ?`,
            [data.class_id, data.subject_name, data.sequence_order, data.monthly_marks || null, data.yearly_marks || null, data.id], (err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});

ipcMain.handle('delete-teacher', async (event, id) => {
    return new Promise((resolve) => {
        db.run(`UPDATE classes SET class_teacher_id = NULL WHERE class_teacher_id = ?`, [id], (err) => {
            if (err) return resolve({ success: false, error: err.message });
            db.run(`DELETE FROM teachers WHERE id = ?`, [id], (err2) => {
                if (err2) resolve({ success: false, error: err2.message });
                else resolve({ success: true });
            });
        });
    });
});

// --- STEP 5: EXAMS MODULE ---

// Find an exam by year+type, or create it if it doesn't exist yet
ipcMain.handle('get-or-create-exam', async (event, data) => {
    return new Promise((resolve) => {
        db.get(`SELECT * FROM exams WHERE year = ? AND exam_type = ?`, [data.year, data.exam_type], (err, row) => {
            if (row) return resolve(row);
            db.run(`INSERT INTO exams (year, exam_type) VALUES (?, ?)`, [data.year, data.exam_type], function (err) {
                if (err) return resolve({ success: false, error: err.message });
                resolve({ id: this.lastID, year: data.year, exam_type: data.exam_type });
            });
        });
    });
});

// Pull students + subjects + existing marks for one class+exam in one shot
ipcMain.handle('get-marks-sheet', async (event, { class_id, exam_id }) => {
    return new Promise((resolve) => {
        db.all(`SELECT id, roll, name FROM students WHERE class_id = ? AND status = 'Active' ORDER BY roll`, [class_id], (err, students) => {
            db.all(`SELECT id, subject_name, sequence_order FROM subjects WHERE class_id = ? ORDER BY sequence_order`, [class_id], (err2, subjects) => {
                db.all(`SELECT student_id, subject_id, marks_obtained, is_present FROM marks WHERE exam_id = ?`, [exam_id], (err3, marks) => {
                    resolve({ students: students || [], subjects: subjects || [], marks: marks || [] });
                });
            });
        });
    });
});

// Upsert a batch of marks for one class+exam
ipcMain.handle('save-marks', async (event, { exam_id, entries }) => {
    return new Promise((resolve) => {
        const stmt = db.prepare(`INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained, is_present)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(student_id, subject_id, exam_id)
            DO UPDATE SET marks_obtained = excluded.marks_obtained, is_present = excluded.is_present`);
        entries.forEach(e => stmt.run(e.student_id, e.subject_id, exam_id, e.marks_obtained, e.is_present));
        stmt.finalize((err) => {
            if (err) resolve({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
});