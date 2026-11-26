const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const electron = require('electron');

// When packaged as an installer/exe, store database in the user's AppData (userData)
// so it has full read/write permissions and survives software updates.
// During development, keep using the local project directory.
const app = electron ? (electron.app || (electron.remote && electron.remote.app)) : null;
const isPackaged = app ? app.isPackaged : false;
const dbDir = (isPackaged && typeof app.getPath === 'function')
    ? app.getPath('userData')
    : __dirname;

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'school.db');
console.log('[Database] Connected to database at:', dbPath);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Classes Table (Handles your 16 unique classes)
    db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT NOT NULL UNIQUE,
        department TEXT DEFAULT NULL -- 'Science', 'Humanities', or NULL
    )`);

    // Seed the 16 distinct school classes if they don't exist yet
    const classNames = [
        "Play", "Nursery", "Class One", "Class Two", "Class Three", 
        "Class Four", "Class Five", "Class Six", "Class Seven", "Class Eight", 
        "Class Nine (Science)", "Class Nine (Humanities)", "Class Nine (Business Studies)",
        "Class Ten (Science)", "Class Ten (Humanities)", "Class Ten (Business Studies)"
    ];
    const stmt = db.prepare(`INSERT OR IGNORE INTO classes (class_name) VALUES (?)`);
    classNames.forEach(name => stmt.run(name));
    stmt.finalize();

    // Migrate old subject names to current curriculum standards
    db.run(`UPDATE subjects SET subject_name = 'Math' WHERE subject_name = 'General Math'`);
    db.run(`UPDATE student_subjects SET subject_name = 'Math' WHERE subject_name = 'General Math'`);

    db.run(`UPDATE subjects SET subject_name = 'Information and Communication Technology' WHERE subject_name = 'ICT'`);
    db.run(`UPDATE student_subjects SET subject_name = 'Information and Communication Technology' WHERE subject_name = 'ICT'`);

    db.run(`UPDATE subjects SET subject_name = 'Religious Studies and Moral Education' WHERE subject_name = 'Religious Education'`);
    db.run(`UPDATE student_subjects SET subject_name = 'Religious Studies and Moral Education' WHERE subject_name = 'Religious Education'`);

    db.run(`UPDATE subjects SET subject_name = 'Science' WHERE subject_name = 'General Science'`);
    db.run(`UPDATE student_subjects SET subject_name = 'Science' WHERE subject_name = 'General Science'`);

    db.run(`UPDATE subjects SET subject_name = 'Agriculture/Home Science' WHERE subject_name = 'Agriculture/Domestic Science'`);
    db.run(`UPDATE student_subjects SET subject_name = 'Agriculture/Home Science' WHERE subject_name = 'Agriculture/Domestic Science'`);

    // Ensure all Class 9 and 10 classes have complete subject lists and accurate sequence orders
    const NINE_TEN_CATALOG = {
        "Class Nine (Science)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Bangladesh & Global Studies", "Physics", "Chemistry", "Higher Math", "Biology",
            "Agriculture/Home Science", "Clothes/Manner/Presence"
        ],
        "Class Ten (Science)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Bangladesh & Global Studies", "Physics", "Chemistry", "Higher Math", "Biology",
            "Agriculture/Home Science", "Clothes/Manner/Presence"
        ],
        "Class Nine (Humanities)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Science", "History", "Geography & Environment", "Civics & Citizenship", "Economics",
            "Agriculture/Home Science", "Clothes/Manner/Presence"
        ],
        "Class Ten (Humanities)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Science", "History", "Geography & Environment", "Civics & Citizenship", "Economics",
            "Agriculture/Home Science", "Clothes/Manner/Presence"
        ],
        "Class Nine (Business Studies)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Science", "Accounting", "Finance and Banking", "Business Entrepreneurship",
            "Agriculture Studies", "Home Science", "Clothes/Manner/Presence"
        ],
        "Class Ten (Business Studies)": [
            "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
            "Information and Communication Technology", "Religious Studies and Moral Education",
            "Physical Education, Health Science and Sports", "Career Education",
            "Science", "Accounting", "Finance and Banking", "Business Entrepreneurship",
            "Agriculture Studies", "Home Science", "Clothes/Manner/Presence"
        ]
    };

    const nineTenNames = Object.keys(NINE_TEN_CATALOG);
    db.all(`SELECT id, class_name FROM classes WHERE class_name IN (${nineTenNames.map(() => '?').join(',')})`, nineTenNames, (err, rows) => {
        if (!rows || !rows.length) return;
        rows.forEach(cls => {
            const list = NINE_TEN_CATALOG[cls.class_name];
            if (!list) return;

            db.all(`SELECT id, subject_name FROM subjects WHERE class_id = ?`, [cls.id], (err2, existingSubs) => {
                const existingMap = {};
                (existingSubs || []).forEach(s => { existingMap[s.subject_name] = s.id; });

                list.forEach((subName, idx) => {
                    const seq = idx + 1;
                    if (existingMap[subName]) {
                        db.run(`UPDATE subjects SET sequence_order = ? WHERE id = ?`, [seq, existingMap[subName]]);
                    } else {
                        db.run(
                            `INSERT INTO subjects (class_id, subject_name, sequence_order, monthly_marks, yearly_marks) VALUES (?, ?, ?, ?, ?)`,
                            [cls.id, subName, seq, 25, 100]
                        );
                    }
                });
            });
        });
    });

    // 2. Students Table
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll INTEGER NOT NULL,
        name TEXT NOT NULL,
        student_id_number TEXT,
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

    // Ensure student_id_number column exists on students (self-repairing migration)
    db.all("PRAGMA table_info(students)", [], (err, columns) => {
        const names = (columns || []).map(c => c.name);
        if (names.length > 0 && !names.includes('student_id_number')) {
            db.run(`ALTER TABLE students ADD COLUMN student_id_number TEXT DEFAULT NULL`, (err2) => {
                if (!err2) {
                    console.log("✅ Added student_id_number column to students");
                }
            });
        }
    });

    // 3. Teachers Table
    db.run(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id_number TEXT,
        name TEXT NOT NULL,
        title TEXT,
        signature_path TEXT,
        fathers_name TEXT,
        mothers_name TEXT,
        photo_path TEXT,
        contact_number TEXT,
        blood_group TEXT,
        nid_number TEXT,
        address TEXT
    )`);

    // Migration: add teacher_id_number, address, photo_path, signature_path columns to teachers if they don't exist yet
    db.all("PRAGMA table_info(teachers)", [], (err, columns) => {
        if (err || !columns) return;
        const columnNames = columns.map(c => c.name);
        if (!columnNames.includes('teacher_id_number')) {
            db.run(`ALTER TABLE teachers ADD COLUMN teacher_id_number TEXT`);
        }
        if (!columnNames.includes('address')) {
            db.run(`ALTER TABLE teachers ADD COLUMN address TEXT`);
        }
        if (!columnNames.includes('photo_path')) {
            db.run(`ALTER TABLE teachers ADD COLUMN photo_path TEXT`);
        }
        if (!columnNames.includes('signature_path')) {
            db.run(`ALTER TABLE teachers ADD COLUMN signature_path TEXT`);
        }
    });

    // Migration: ensure students table has photo_path column
    db.all("PRAGMA table_info(students)", [], (err, columns) => {
        if (err || !columns) return;
        const columnNames = columns.map(c => c.name);
        if (!columnNames.includes('photo_path')) {
            db.run(`ALTER TABLE students ADD COLUMN photo_path TEXT`);
        }
    });

    // 4. Subjects Table (Tracks subjects per class)
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        subject_name TEXT NOT NULL,
        sequence_order INTEGER, -- To keep your exact layout order
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);

        // Migration: add marks-total columns to subjects if they don't exist yet (safe to run every startup)
        db.all("PRAGMA table_info(subjects)", [], (err, columns) => {
            if (err || !columns) return;
            const columnNames = columns.map(c => c.name);
            const runNext = (tasks, onComplete) => {
                if (!tasks.length) return onComplete ? onComplete() : null;
                const task = tasks.shift();
                task(() => runNext(tasks, onComplete));
            };

            const alterTasks = [];
            if (!columnNames.includes('monthly_marks')) {
                alterTasks.push((cb) => db.run(`ALTER TABLE subjects ADD COLUMN monthly_marks INTEGER`, cb));
            }
            if (!columnNames.includes('yearly_marks')) {
                alterTasks.push((cb) => db.run(`ALTER TABLE subjects ADD COLUMN yearly_marks INTEGER`, cb));
            }
            if (!columnNames.includes('yearly_theory_marks')) {
                alterTasks.push((cb) => db.run(`ALTER TABLE subjects ADD COLUMN yearly_theory_marks REAL DEFAULT NULL`, cb));
            }
            if (!columnNames.includes('yearly_practical_marks')) {
                alterTasks.push((cb) => db.run(`ALTER TABLE subjects ADD COLUMN yearly_practical_marks REAL DEFAULT NULL`, cb));
            }

            runNext(alterTasks, () => {
                // Populate default 75 theory and 25 practical for practical subjects that have yearly_marks = 100
                db.run(`UPDATE subjects
                        SET yearly_theory_marks = 75, yearly_practical_marks = 25
                        WHERE (yearly_theory_marks IS NULL OR yearly_practical_marks IS NULL)
                          AND yearly_marks = 100
                          AND subject_name IN ('Physics', 'Chemistry', 'Biology', 'Higher Math', 'Agriculture/Home Science', 'Agriculture Studies', 'Home Science')`);
            });
        });

        // Migration: add class_teacher_id to classes if it doesn't exist yet
        db.all("PRAGMA table_info(classes)", [], (err, columns) => {
            if (err || !columns) return;
            const columnNames = columns.map(c => c.name);
            if (!columnNames.includes('class_teacher_id')) {
                db.run(`ALTER TABLE classes ADD COLUMN class_teacher_id INTEGER REFERENCES teachers(id)`);
            }
        });

        
        // Migration: add gender column to students if it doesn't exist yet
        db.all("PRAGMA table_info(students)", [], (err, columns) => {
            if (err || !columns) return;
            const columnNames = columns.map(c => c.name);
            if (!columnNames.includes('gender')) {
                db.run(`ALTER TABLE students ADD COLUMN gender TEXT`);
            }
        });

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
        theory_marks REAL DEFAULT NULL,
        practical_marks REAL DEFAULT NULL,
        is_present INTEGER DEFAULT 1, -- 0 if absent, 1 if present
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(subject_id) REFERENCES subjects(id),
        FOREIGN KEY(exam_id) REFERENCES exams(id)
    )`);

    // Migration: ensure theory_marks and practical_marks columns exist in marks table
    db.all("PRAGMA table_info(marks)", [], (err, columns) => {
        if (err || !columns) return;
        const columnNames = columns.map(c => c.name);
        if (!columnNames.includes('theory_marks')) {
            db.run(`ALTER TABLE marks ADD COLUMN theory_marks REAL DEFAULT NULL`);
        }
        if (!columnNames.includes('practical_marks')) {
            db.run(`ALTER TABLE marks ADD COLUMN practical_marks REAL DEFAULT NULL`);
        }
    });

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
        q5 TEXT, a5 TEXT,
        license_type TEXT DEFAULT 'trial',
        trial_started_at TEXT
    )`);

    // Ensure license_type and trial_started_at columns exist on admin_profile (self-repairing migration)
    db.all("PRAGMA table_info(admin_profile)", [], (err, columns) => {
        const names = (columns || []).map(c => c.name);
        if (names.length > 0 && !names.includes('license_type')) {
            db.run(`ALTER TABLE admin_profile ADD COLUMN license_type TEXT DEFAULT 'trial'`, (err2) => {
                if (!err2) {
                    console.log("✅ Added license_type column to admin_profile");
                }
            });
        }
        if (names.length > 0 && !names.includes('trial_started_at')) {
            db.run(`ALTER TABLE admin_profile ADD COLUMN trial_started_at TEXT`, (err2) => {
                if (!err2) {
                    console.log("✅ Added trial_started_at column to admin_profile");
                }
            });
        }
    });


        // 9. Student Subjects Table (Nine/Ten Main + Optional subject selections)
    db.run(`CREATE TABLE IF NOT EXISTS student_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_name TEXT NOT NULL,
        role TEXT NOT NULL, -- 'main' or 'optional'
        FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // 10. Student History Table (log of every promote / graduate / drop out / reinstate)
    db.run(`CREATE TABLE IF NOT EXISTS student_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        action TEXT NOT NULL, -- 'Promoted', 'Graduated', 'Dropped Out', 'Reinstated'
        from_class_id INTEGER,
        to_class_id INTEGER,
        roll INTEGER,
        cause TEXT,
        action_date TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // 11. Notifications Table (messages shown by the bell button)
    // key = NULL   -> a one-time event
    // key = text   -> a "something is wrong" message that is removed automatically once fixed
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT,
        severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        target TEXT, -- JSON like {"tab":"db-students","class_id":5}; reserved for click-through later
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        is_read INTEGER DEFAULT 0,
        is_dismissed INTEGER DEFAULT 0
    )`);

    // 12. School Information Table (Stores school profile name, address, and logo path)
    // Self-repairing: if an old/incorrect school_info table exists, rebuild it.
    db.all("PRAGMA table_info(school_info)", [], (err, columns) => {
        const names = (columns || []).map(c => c.name);
        const isValid = names.includes('id') && names.includes('name') && names.includes('address');

        const createAndSeed = () => {
            db.run(`CREATE TABLE IF NOT EXISTS school_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT DEFAULT '',
                address TEXT DEFAULT '',
                logo_path TEXT DEFAULT NULL,
                head_teacher_name TEXT DEFAULT '',
                head_teacher_signature_path TEXT DEFAULT NULL
            )`, () => {
                db.get("SELECT COUNT(*) as count FROM school_info", [], (err2, row) => {
                    if (row && row.count === 0) {
                        db.run(`INSERT INTO school_info (name, address, logo_path, head_teacher_name, head_teacher_signature_path) VALUES (?, ?, ?, ?, ?)`,
                            ['', '', null, '', null]);
                    }
                });
            });
        };

        if (names.length > 0 && !isValid) {
            console.log("⚠️ school_info table had the wrong structure. Rebuilding it...");
            db.run("DROP TABLE school_info", createAndSeed);
        } else {
            createAndSeed();
            if (names.length > 0 && !names.includes('logo_path')) {
                db.run(`ALTER TABLE school_info ADD COLUMN logo_path TEXT DEFAULT NULL`);
            }
            if (names.length > 0 && !names.includes('head_teacher_name')) {
                db.run(`ALTER TABLE school_info ADD COLUMN head_teacher_name TEXT DEFAULT ''`);
            }
            if (names.length > 0 && !names.includes('head_teacher_signature_path')) {
                db.run(`ALTER TABLE school_info ADD COLUMN head_teacher_signature_path TEXT DEFAULT NULL`);
            }
        }
    });

        // 13. Attendance tables
    // Working days are set once per class + year + term; days present is per student.
    // term is 'Half Yearly' or 'Yearly' (same names as the transcript's Test dropdown).
    db.run(`CREATE TABLE IF NOT EXISTS attendance_working_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        term TEXT NOT NULL,
        working_days INTEGER NOT NULL,
        UNIQUE(class_id, year, term),
        FOREIGN KEY(class_id) REFERENCES classes(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        term TEXT NOT NULL,
        days_present INTEGER NOT NULL,
        UNIQUE(student_id, year, term),
        FOREIGN KEY(student_id) REFERENCES students(id)
    )`);

    // 14. Auto-seed sample data (students, teachers, subjects) from seed.sql on fresh database
    db.get("SELECT COUNT(*) as count FROM students", [], (err, row) => {
        if (!err && row && row.count === 0) {
            // Check possible locations for seed.sql (unpacked ASAR, resources extraResource, or local __dirname)
            const possibleSeedPaths = [
                path.join(__dirname, 'seed.sql'),
                path.join(process.resourcesPath || '', 'seed.sql'),
                path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'seed.sql')
            ];

            let seedPath = null;
            for (const p of possibleSeedPaths) {
                if (p && fs.existsSync(p)) {
                    seedPath = p;
                    break;
                }
            }

            if (seedPath) {
                try {
                    const sql = fs.readFileSync(seedPath, 'utf8');
                    db.exec(sql, (execErr) => {
                        if (execErr) {
                            console.error("❌ Failed to seed sample data from seed.sql:", execErr);
                        } else {
                            console.log("🌱 Successfully seeded sample students, teachers, and subjects from seed.sql!");
                        }
                    });
                } catch (readErr) {
                    console.error("❌ Could not read seed.sql:", readErr);
                }
            } else {
                console.warn("⚠️ seed.sql was not found in checked locations.");
            }
        }
    });

    console.log("🎉 Database tables successfully initialized!");
});

module.exports = db;