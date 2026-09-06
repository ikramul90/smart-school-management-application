const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// creating a database file named school.db 
const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Classes Table (Handles your 16 unique classes)
    db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT NOT NULL UNIQUE,
        department TEXT DEFAULT NULL -- 'Science', 'Humanities', or NULL
    )`);

    // Seed the 16 distinct school classes if they don't exist yet
    db.get("SELECT COUNT(*) as count FROM classes", [], (err, row) => {
        if (row && row.count === 0) {
            const classNames = [
                "Play", "Nursery", "Class One", "Class Two", "Class Three", 
                "Class Four", "Class Five", "Class Six", "Class Seven", "Class Eight", 
                "Class Nine (Science)", "Class Nine (Humanities)", 
                "Class Ten (Science)", "Class Ten (Humanities)"
            ];
            const stmt = db.prepare(`INSERT INTO classes (class_name) VALUES (?)`);
            classNames.forEach(name => stmt.run(name));
            stmt.finalize();
            console.log("🌱 Seeded classes successfully into database!");
        }
    });

    // 2. Students Table
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll INTEGER NOT NULL,
        name TEXT NOT NULL,
        blood_group TEXT,
        photo_path TEXT,
        fathers_name TEXT,
        mothers_name TEXT,
        guardian_name TEXT,
        guardian_contact TEXT NOT NULL,
        address TEXT,
        dob TEXT,
        birth_reg_number TEXT,
        class_id INTEGER,
        status TEXT DEFAULT 'Active', -- 'Active', 'Graduated', 'Removed'
        removal_cause TEXT,
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);

    // 3. Teachers Table
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT,
        signature_path TEXT,
        fathers_name TEXT,
        mothers_name TEXT,
        photo_path TEXT,
        contact_number TEXT,
        blood_group TEXT,
        nid_number TEXT
    )`);

    // 4. Subjects Table (Maps classes to class teachers and tracks subjects)
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        class_teacher_id INTEGER,
        subject_name TEXT NOT NULL,
        sequence_order INTEGER, -- To keep your exact layout order
        FOREIGN KEY(class_id) REFERENCES classes(id),
        FOREIGN KEY(class_teacher_id) REFERENCES teachers(id)
    )`);

    // 5. Exams Table (Tracks individual assessment sessions)
    db.run(`CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        exam_type TEXT NOT NULL -- '1st Monthly', 'Half Yearly', 'Yearly', etc.
    )`);

    // 6. Marks Table
    db.run(`CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject_id INTEGER,
        exam_id INTEGER,
        marks_obtained REAL DEFAULT 0,
        is_present INTEGER DEFAULT 1, -- 0 if absent, 1 if present
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(subject_id) REFERENCES subjects(id),
        FOREIGN KEY(exam_id) REFERENCES exams(id)
    )`);

    // Ensure one mark per student+subject+exam so re-saving a class updates in place
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_marks_unique ON marks (
        student_id, subject_id, exam_id
        )`);

    // 7. Admin Settings Table (Stores the single admin account and recovery questions)
    db.run(`CREATE TABLE IF NOT EXISTS admin_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL,
        q1 TEXT, a1 TEXT,
        q2 TEXT, a2 TEXT,
        q3 TEXT, a3 TEXT,
        q4 TEXT, a4 TEXT,
        q5 TEXT, a5 TEXT
    )`);


    console.log("🎉 Database tables successfully initialized!");
});

module.exports = db;