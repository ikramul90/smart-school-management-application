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
                ORDER BY classes.id, subjects.sequence_order`, [], (err, rows) => {
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

ipcMain.handle('get-students', async (event, filters) => {
    return new Promise((resolve) => {
        // status_date = when the student was last graduated / dropped out (from the history log)
        let query = `SELECT students.*, classes.class_name,
                (SELECT h.action_date FROM student_history h
                 WHERE h.student_id = students.id AND h.action IN ('Graduated', 'Dropped Out')
                 ORDER BY h.id DESC LIMIT 1) AS status_date
            FROM students LEFT JOIN classes ON students.class_id = classes.id WHERE 1=1`;
        let params = [];
        
        if (filters && filters.class_id) {
            query += ` AND students.class_id = ?`;
            params.push(filters.class_id);
        }
        if (filters && filters.status) {
            query += ` AND students.status = ?`;
            params.push(filters.status);
        }
        query += ` ORDER BY students.class_id, students.roll`;

        db.all(query, params, (err, rows) => {
            resolve(rows || []);
        });
    });
});

// --- SMALL DATABASE HELPERS (promise versions) ---
const dbGet = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (e, r) => e ? rej(e) : res(r)));
const dbAll = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (e, r) => e ? rej(e) : res(r)));
const dbRun = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res(this); }));
const pad2 = (n) => String(n).padStart(2, '0');


// --- NOTIFICATIONS (the bell button) ---
// Two kinds of message:
//   event      (key = NULL)  "something happened". Stays until the admin clears it.
//   condition  (key = text)  "something is wrong". Created once, updated if the problem
//                            changes, and removed automatically when the problem is fixed.
//                            "Clear all" only hides it, so it does not keep coming back.

// Tells the open window to refresh the bell and slide in pop-ups for newOnes.
function broadcastNotifications(newOnes) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('notifications-changed', { newOnes: newOnes || [] });
    }
}

// Makes the stored "condition" messages that start with `prefix` match `wanted` exactly:
// adds missing ones, updates changed ones, deletes ones whose problem is gone.
async function syncConditionNotifications(prefix, wanted) {
    const existing = await dbAll(`SELECT * FROM notifications WHERE key LIKE ?`, [prefix + '%']);
    const wantedKeys = wanted.map(w => w.key);
    let changed = false;

    for (const e of existing) {
        if (!wantedKeys.includes(e.key)) {
            await dbRun(`DELETE FROM notifications WHERE id = ?`, [e.id]);
            changed = true;
        }
    }

    const toPopUp = [];
    for (const w of wanted) {
        const found = existing.find(e => e.key === w.key);
        if (!found) {
            const r = await dbRun(`INSERT INTO notifications (key, severity, title, message, target) VALUES (?, ?, ?, ?, ?)`,
                [w.key, w.severity, w.title, w.message, w.target || null]);
            toPopUp.push(await dbGet(`SELECT * FROM notifications WHERE id = ?`, [r.lastID]));
        } else if (found.message !== w.message || found.title !== w.title) {
            await dbRun(`UPDATE notifications SET title = ?, message = ?, is_read = 0, is_dismissed = 0 WHERE id = ?`,
                [w.title, w.message, found.id]);
            toPopUp.push(await dbGet(`SELECT * FROM notifications WHERE id = ?`, [found.id]));
        }
    }

    if (toPopUp.length || changed) broadcastNotifications(toPopUp);
    return toPopUp;
}

// Looks for two or more ACTIVE students with the same roll in the same class.
async function runDuplicateRollCheck() {
    const dups = await dbAll(`SELECT s.class_id, c.class_name, s.roll, GROUP_CONCAT(s.name, char(31)) AS names
        FROM students s LEFT JOIN classes c ON c.id = s.class_id
        WHERE s.status = 'Active'
        GROUP BY s.class_id, s.roll HAVING COUNT(*) > 1
        ORDER BY s.class_id, s.roll`);

    const wanted = dups.map(d => ({
        key: `dup-roll:${d.class_id}:${d.roll}`,
        severity: 'warning',
        title: `Duplicate roll in ${d.class_name || 'a class'}`,
        message: `Roll ${pad2(d.roll)} is used by ${String(d.names).split(String.fromCharCode(31)).join(', ')}. Please give one of them a different roll.`,
        target: JSON.stringify({ tab: 'db-students', class_id: d.class_id })
    }));
    return syncConditionNotifications('dup-roll:', wanted);
}

// --- MISSING-DETAILS CHECK (students and teachers with an empty optional field) ---
// Fields that are enforced by the form already (Name, Roll, Guardian Contact,
// Teacher Name) are not checked here — they can never be empty.
const STUDENT_MISSING_FIELDS = [
    ['blood_group', 'Blood Group'],
    ['fathers_name', "Father's Name"],
    ['mothers_name', "Mother's Name"],
    ['address', 'Address'],
    ['dob', 'Date of Birth'],
    ['birth_reg_number', 'Birth Registration No.']
];
const TEACHER_MISSING_FIELDS = [
    ['title', 'Title'],
    ['contact_number', 'Contact Number'],
    ['blood_group', 'Blood Group'],
    ['nid_number', 'NID Number'],
    ['fathers_name', "Father's Name"],
    ['mothers_name', "Mother's Name"]
];
const MAX_MISSING_NOTIFICATIONS = 10; // keeps a freshly-imported database from flooding the bell

function missingFieldLabels(row, fields) {
    return fields.filter(([col]) => !row[col] || !String(row[col]).trim()).map(([, label]) => label);
}

// Only ACTIVE students are checked (Graduated/Removed records are no longer being edited).
async function runMissingFieldsCheck() {
    const students = await dbAll(`SELECT students.*, classes.class_name FROM students
        LEFT JOIN classes ON students.class_id = classes.id
        WHERE students.status = 'Active' ORDER BY students.class_id, students.roll`);
    const teachers = await dbAll(`SELECT * FROM teachers ORDER BY name`);

    const wanted = [];
    students.forEach(s => {
        const missing = missingFieldLabels(s, STUDENT_MISSING_FIELDS);
        if (missing.length) wanted.push({
            key: `missing:student:${s.id}`,
            severity: 'info',
            title: `${s.name} is missing details`,
            message: `${s.name} (${s.class_name || 'no class'}, roll ${pad2(s.roll)}) is missing: ${missing.join(', ')}.`,
            target: JSON.stringify({ tab: 'db-students', student_id: s.id })
        });
    });
    teachers.forEach(t => {
        const missing = missingFieldLabels(t, TEACHER_MISSING_FIELDS);
        if (missing.length) wanted.push({
            key: `missing:teacher:${t.id}`,
            severity: 'info',
            title: `${t.name} is missing details`,
            message: `${t.name} is missing: ${missing.join(', ')}.`,
            target: JSON.stringify({ tab: 'db-teachers', teacher_id: t.id })
        });
    });

    // Cap how many individual messages appear; fold the rest into one summary line.
    let toKeep = wanted;
    let summary = [];
    if (wanted.length > MAX_MISSING_NOTIFICATIONS) {
        toKeep = wanted.slice(0, MAX_MISSING_NOTIFICATIONS);
        summary = [{
            key: 'missing:more',
            severity: 'info',
            title: 'More records need details',
            message: `${wanted.length - MAX_MISSING_NOTIFICATIONS} more student(s)/teacher(s) are missing details. Fill them in from the Students and Teachers tabs.`,
            target: null
        }];
    }
    return syncConditionNotifications('missing:', toKeep.concat(summary));
}

// Runs every data check. A failed check must never break the action that triggered it.
async function runDataChecks() {
    try { await runDuplicateRollCheck(); } catch (e) { console.error('Data check failed:', e.message); }
    try { await runMissingFieldsCheck(); } catch (e) { console.error('Data check failed:', e.message); }
}

ipcMain.handle('get-notifications', async () => {
    try {
        return await dbAll(`SELECT * FROM notifications WHERE is_dismissed = 0 ORDER BY id DESC LIMIT 100`);
    } catch (e) { return []; }
});

ipcMain.handle('mark-notifications-read', async () => {
    try {
        await dbRun(`UPDATE notifications SET is_read = 1 WHERE is_read = 0`);
        return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
});

// "Clear all": one-time events are deleted; "something is wrong" messages are only hidden.
ipcMain.handle('clear-notifications', async () => {
    try {
        await dbRun(`DELETE FROM notifications WHERE key IS NULL`);
        await dbRun(`UPDATE notifications SET is_dismissed = 1, is_read = 1 WHERE key IS NOT NULL`);
        return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
});

// Called once after login.
ipcMain.handle('run-data-checks', async () => {
    await runDataChecks();
    return { success: true };
});

// Which active students already use this roll in that class? (for the warning in the pop-up)
ipcMain.handle('get-roll-holders', async (event, { class_id, roll, except_id }) => {
    try {
        const rows = await dbAll(`SELECT name FROM students WHERE class_id = ? AND roll = ? AND status = 'Active' AND id != ?`,
            [class_id, roll, except_id || 0]);
        return rows.map(r => r.name);
    } catch (e) { return []; }
});


// --- ADD / EDIT STUDENT ---
ipcMain.handle('add-student', async (event, s) => {
    try {
        const r = await dbRun(`INSERT INTO students (roll, name, blood_group, fathers_name, mothers_name, guardian_name, guardian_contact, address, dob, birth_reg_number, class_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [s.roll, s.name, s.blood_group, s.fathers_name || null, s.mothers_name || null, s.guardian_name, s.guardian_contact, s.address, s.dob || null, s.birth_reg_number || null, s.class_id]);
        await runDataChecks();
        return { success: true, id: r.lastID };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Saves the graduation / drop-out date (and the drop-out reason) of an archived student.
// The date lives in the history log; the reason also lives on the student record.
async function saveArchiveDetails(st, archive) {
    const action = st.status === 'Graduated' ? 'Graduated' : 'Dropped Out';
    const reason = action === 'Dropped Out' ? String(archive.cause || '').trim() : null;
    if (action === 'Dropped Out') {
        await dbRun(`UPDATE students SET removal_cause = ? WHERE id = ?`, [reason, st.id]);
    }
    const dateText = archive.date ? `${archive.date} 00:00:00` : null;
    const row = await dbGet(`SELECT id FROM student_history WHERE student_id = ? AND action = ? ORDER BY id DESC LIMIT 1`, [st.id, action]);
    if (row) {
        await dbRun(`UPDATE student_history SET action_date = COALESCE(?, action_date), cause = ? WHERE id = ?`, [dateText, reason, row.id]);
    } else {
        // Records made before the history log existed: create the entry now.
        await dbRun(`INSERT INTO student_history (student_id, action, from_class_id, roll, cause, action_date)
                     VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now', 'localtime')))`,
            [st.id, action, st.class_id, st.roll, reason, dateText]);
    }
}

ipcMain.handle('update-student', async (event, s) => {
    try {
        const current = await dbGet(`SELECT * FROM students WHERE id = ?`, [s.id]);
        if (!current) return { success: false, error: 'Student not found.' };

        const archived = current.status === 'Graduated' || current.status === 'Removed';
        if (s.archive && current.status === 'Removed' && !String(s.archive.cause || '').trim()) {
            return { success: false, error: 'Please enter the reason for dropping out.' };
        }

        await dbRun(`UPDATE students SET roll = ?, name = ?, blood_group = ?, fathers_name = ?, mothers_name = ?, guardian_name = ?, guardian_contact = ?, address = ?, dob = ?, birth_reg_number = ?, class_id = ? WHERE id = ?`,
            [s.roll, s.name, s.blood_group, s.fathers_name || null, s.mothers_name || null, s.guardian_name, s.guardian_contact, s.address, s.dob || null, s.birth_reg_number || null, s.class_id, s.id]);

        if (s.archive && archived) await saveArchiveDetails(current, s.archive);

        await runDataChecks();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});


// --- STUDENT LIFECYCLE: PROMOTE / GRADUATE / DROP OUT / REINSTATE ---

// Which class(es) a student can be promoted into, by class name.
// Class Eight has two options because Nine splits into Science / Humanities.
const PROMOTION_PATH = {
    'Play': ['Nursery'],
    'Nursery': ['Class One'],
    'Class One': ['Class Two'],
    'Class Two': ['Class Three'],
    'Class Three': ['Class Four'],
    'Class Four': ['Class Five'],
    'Class Five': ['Class Six'],
    'Class Six': ['Class Seven'],
    'Class Seven': ['Class Eight'],
    'Class Eight': ['Class Nine (Science)', 'Class Nine (Humanities)'],
    'Class Nine (Science)': ['Class Ten (Science)'],
    'Class Nine (Humanities)': ['Class Ten (Humanities)']
};
const GRADUATING_CLASSES = ['Class Ten (Science)', 'Class Ten (Humanities)'];

function getStudentWithClass(id) {
    return dbGet(`SELECT students.*, classes.class_name FROM students
                  LEFT JOIN classes ON students.class_id = classes.id WHERE students.id = ?`, [id]);
}

function logStudentHistory(studentId, action, fromClassId, toClassId, roll, cause) {
    return dbRun(`INSERT INTO student_history (student_id, action, from_class_id, to_class_id, roll, cause) VALUES (?, ?, ?, ?, ?, ?)`,
        [studentId, action, fromClassId, toClassId, roll, cause || null]);
}

// Which class(es) can this student be promoted into?
ipcMain.handle('get-promotion-targets', async (event, studentId) => {
    try {
        const st = await getStudentWithClass(studentId);
        if (!st) return { success: false, error: 'Student not found.' };
        if (st.status !== 'Active') return { success: false, error: 'Only active students can be promoted.' };
        const names = PROMOTION_PATH[st.class_name];
        if (!names) return { success: false, error: 'This class has no next class. Use Graduate instead.' };
        const targets = await dbAll(`SELECT id, class_name FROM classes WHERE class_name IN (${names.map(() => '?').join(',')}) ORDER BY id`, names);
        if (!targets.length) return { success: false, error: 'The next class was not found in the database.' };
        return { success: true, student: st, targets };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Move a student into the next class (with a roll for the new class).
// A roll that is already used is allowed; the duplicate-roll notification will flag it.
ipcMain.handle('promote-student', async (event, { id, to_class_id, new_roll }) => {
    try {
        const st = await getStudentWithClass(id);
        if (!st || st.status !== 'Active') return { success: false, error: 'Only active students can be promoted.' };

        const allowed = PROMOTION_PATH[st.class_name] || [];
        const target = await dbGet(`SELECT id, class_name FROM classes WHERE id = ?`, [to_class_id]);
        if (!target || !allowed.includes(target.class_name)) {
            return { success: false, error: 'That is not the next class for this student.' };
        }

        const roll = parseInt(new_roll, 10);
        if (!Number.isInteger(roll) || roll <= 0) return { success: false, error: 'Enter a valid roll number.' };

        await dbRun(`UPDATE students SET class_id = ?, roll = ? WHERE id = ?`, [target.id, roll, id]);
        await logStudentHistory(id, 'Promoted', st.class_id, target.id, roll, null);
        await runDataChecks();
        return { success: true, student: await getStudentWithClass(id) };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Class Ten only: the student stays on record but leaves the Current list.
ipcMain.handle('graduate-student', async (event, { id }) => {
    try {
        const st = await getStudentWithClass(id);
        if (!st || st.status !== 'Active') return { success: false, error: 'Only active students can graduate.' };
        if (!GRADUATING_CLASSES.includes(st.class_name)) return { success: false, error: 'Only Class Ten students can graduate.' };
        await dbRun(`UPDATE students SET status = 'Graduated', removal_cause = NULL WHERE id = ?`, [id]);
        await logStudentHistory(id, 'Graduated', st.class_id, null, st.roll, null);
        await runDataChecks();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Any class: the student stays on record with a reason, but leaves the Current list.
ipcMain.handle('drop-out-student', async (event, { id, cause }) => {
    try {
        const reason = String(cause || '').trim();
        if (!reason) return { success: false, error: 'Please enter a reason.' };
        const st = await getStudentWithClass(id);
        if (!st || st.status !== 'Active') return { success: false, error: 'Only active students can be dropped out.' };
        await dbRun(`UPDATE students SET status = 'Removed', removal_cause = ? WHERE id = ?`, [reason, id]);
        await logStudentHistory(id, 'Dropped Out', st.class_id, null, st.roll, reason);
        await runDataChecks();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// Bring a graduated / dropped-out student back into their last class.
// A roll that is already used is allowed; the duplicate-roll notification will flag it.
ipcMain.handle('reinstate-student', async (event, { id, new_roll }) => {
    try {
        const st = await getStudentWithClass(id);
        if (!st || st.status === 'Active') return { success: false, error: 'This student is already active.' };

        const roll = parseInt(new_roll, 10);
        if (!Number.isInteger(roll) || roll <= 0) return { success: false, error: 'Enter a valid roll number.' };

        await dbRun(`UPDATE students SET status = 'Active', removal_cause = NULL, roll = ? WHERE id = ?`, [roll, id]);
        await logStudentHistory(id, 'Reinstated', null, st.class_id, roll, null);
        await runDataChecks();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

ipcMain.handle('get-student-subjects', async (event, student_id) => {
    return new Promise((resolve) => {
        db.all(`SELECT subject_name, role FROM student_subjects WHERE student_id = ?`, [student_id], (err, rows) => {
            resolve(rows || []);
        });
    });
});

ipcMain.handle('save-student-subjects', async (event, { student_id, subjects }) => {
    return new Promise((resolve) => {
        db.run(`DELETE FROM student_subjects WHERE student_id = ?`, [student_id], (err) => {
            if (err) return resolve({ success: false, error: err.message });
            if (!subjects || !subjects.length) return resolve({ success: true });
            const stmt = db.prepare(`INSERT INTO student_subjects (student_id, subject_name, role) VALUES (?, ?, ?)`);
            subjects.forEach(s => stmt.run(student_id, s.subject_name, s.role));
            stmt.finalize((err2) => {
                if (err2) resolve({ success: false, error: err2.message });
                else resolve({ success: true });
            });
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
    try {
        const r = await dbRun(`INSERT INTO teachers (name, title, fathers_name, mothers_name, contact_number, blood_group, nid_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.name, t.title, t.fathers_name || null, t.mothers_name || null, t.contact_number, t.blood_group, t.nid_number || null]);
        await runDataChecks();
        return { success: true, id: r.lastID };
    } catch (e) {
        return { success: false, error: e.message };
    }
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
    try {
        await dbRun(`UPDATE teachers SET name = ?, title = ?, fathers_name = ?, mothers_name = ?, contact_number = ?, blood_group = ?, nid_number = ? WHERE id = ?`,
            [t.name, t.title, t.fathers_name || null, t.mothers_name || null, t.contact_number, t.blood_group, t.nid_number || null, t.id]);
        await runDataChecks();
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
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

const VALID_EXAM_TYPES = ['1st Monthly Exam', '2nd Monthly Exam', 'Half Yearly Exam', '3rd Monthly Exam', '4th Monthly Exam', 'Yearly Exam'];

// Find an exam by year+type, or create it if it doesn't exist yet
ipcMain.handle('get-or-create-exam', async (event, data) => {
    return new Promise((resolve) => {
        const year = parseInt(data.year, 10);
        if (!Number.isInteger(year) || year < 2000 || year > 2100) {
            return resolve({ success: false, error: 'Enter a valid year between 2000 and 2100.' });
        }
        if (!VALID_EXAM_TYPES.includes(data.exam_type)) {
            return resolve({ success: false, error: 'Unknown exam type.' });
        }
        db.get(`SELECT * FROM exams WHERE year = ? AND exam_type = ?`, [year, data.exam_type], (err, row) => {
            if (err) return resolve({ success: false, error: err.message });
            if (row) return resolve(row);
            db.run(`INSERT INTO exams (year, exam_type) VALUES (?, ?)`, [year, data.exam_type], function (err2) {
                if (err2) return resolve({ success: false, error: err2.message });
                resolve({ id: this.lastID, year: year, exam_type: data.exam_type });
            });
        });
    });
});

// Pull students + subjects (with their totals) + saved marks + each student's
// Nine/Ten subject choices for one class+exam in one shot
ipcMain.handle('get-marks-sheet', async (event, { class_id, exam_id }) => {
    return new Promise((resolve) => {
        db.all(`SELECT id, roll, name FROM students WHERE class_id = ? AND status = 'Active' ORDER BY roll`, [class_id], (err, students) => {
            db.all(`SELECT id, subject_name, sequence_order, monthly_marks, yearly_marks FROM subjects WHERE class_id = ? ORDER BY sequence_order, id`, [class_id], (err2, subjects) => {
                db.all(`SELECT m.student_id, m.subject_id, m.marks_obtained, m.is_present
                        FROM marks m JOIN students s ON s.id = m.student_id
                        WHERE m.exam_id = ? AND s.class_id = ?`, [exam_id, class_id], (err3, marks) => {
                    db.all(`SELECT ss.student_id, ss.subject_name
                            FROM student_subjects ss JOIN students s ON s.id = ss.student_id
                            WHERE s.class_id = ? AND s.status = 'Active'`, [class_id], (err4, studentSubjects) => {
                        resolve({
                            students: students || [],
                            subjects: subjects || [],
                            marks: marks || [],
                            studentSubjects: studentSubjects || []
                        });
                    });
                });
            });
        });
    });
});

// Save ONE mark. value is: '' (clear it), 'A' (absent) or a number as text.
// Rule: no row in the marks table = not entered yet.
ipcMain.handle('save-mark', async (event, { exam_id, student_id, subject_id, value }) => {
    return new Promise((resolve) => {
        const v = String(value === undefined || value === null ? '' : value).trim().toUpperCase();

        if (v === '') {
            db.run(`DELETE FROM marks WHERE exam_id = ? AND student_id = ? AND subject_id = ?`,
                [exam_id, student_id, subject_id], (err) => {
                if (err) resolve({ success: false, error: err.message });
                else resolve({ success: true });
            });
            return;
        }

        let marks = 0;
        let present = 1;
        if (v === 'A') {
            present = 0;
        } else {
            marks = parseFloat(v);
            if (!Number.isFinite(marks) || marks < 0) {
                return resolve({ success: false, error: 'Invalid mark.' });
            }
        }

        db.get(`SELECT e.exam_type, s.monthly_marks, s.yearly_marks
                FROM exams e, subjects s WHERE e.id = ? AND s.id = ?`, [exam_id, subject_id], (err, row) => {
            if (err || !row) return resolve({ success: false, error: 'Exam or subject not found.' });
            const max = row.exam_type.includes('Monthly') ? row.monthly_marks : row.yearly_marks;
            if (present && max && marks > max) {
                return resolve({ success: false, error: `Mark cannot be more than ${max}.` });
            }
            db.run(`INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained, is_present)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(student_id, subject_id, exam_id)
                DO UPDATE SET marks_obtained = excluded.marks_obtained, is_present = excluded.is_present`,
                [student_id, subject_id, exam_id, marks, present], (err2) => {
                if (err2) resolve({ success: false, error: err2.message });
                else resolve({ success: true });
            });
        });
    });
});