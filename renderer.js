// ============================================================
// RENDERER.JS — runs inside the app window itself (the UI side).
// Cannot touch the database directly — every data operation goes
// through ipcRenderer.invoke() to ask main.js to do it instead.
// ============================================================
const { ipcRenderer } = require('electron');


// Grab references to the three full-screen "views" of the app:
// setup (first run only), login, and the main dashboard.
const setupScreen = document.getElementById('setup-screen');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');


// On app startup: ask main.js whether an admin account already
// exists, and show either the first-time Setup screen or the
// normal Login screen accordingly.
window.addEventListener('DOMContentLoaded', async () => {
    const adminExists = await ipcRenderer.invoke('check-admin-exists');
    
    if (adminExists) {
        loginScreen.style.display = 'block';
    } else {
        setupScreen.style.display = 'block';
    }
});

// First-time setup form: collects the new admin's username,
// password, and two security-question answers, then sends them
// to main.js to be saved. Reloads the page into the login screen
// on success.
document.getElementById('btn-save-setup').addEventListener('click', async () => {
    const username = document.getElementById('setup-username').value.trim();
    const password = document.getElementById('setup-password').value.trim();
    const a1 = document.getElementById('a1').value.trim();
    const a2 = document.getElementById('a2').value.trim();

    if (!username || !password || !a1 || !a2) {
        document.getElementById('setup-error').innerText = "Please complete all registration fields!";
        return;
    }

    const result = await ipcRenderer.invoke('setup-admin', {
        username, password,
        q1: "What was your first school's name?", a1,
        q2: "What is your favorite book?", a2,
        q3: "", a3: "", q4: "", a4: "", q5: "", a5: ""
    });

    if (result.success) {
        alert("System initialized cleanly!");
        location.reload(); // Reloads page to show the login screen now
    } else {
        document.getElementById('setup-error').innerText = "Database Setup Error: " + result.message;
    }
});

// Login form: sends the entered username/password to main.js for
// verification, then swaps the login screen out for the dashboard
// if correct.
document.getElementById('btn-login').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        document.getElementById('login-error').innerText = "Please fill in all inputs!";
        return;
    }

    const response = await ipcRenderer.invoke('attempt-login', { username, password });

    if (response.success) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
    } else {
        document.getElementById('login-error').innerText = response.message;
    }
});

// Login form: sends the entered username/password to main.js for
// verification, then swaps the login screen out for the dashboard
// if correct.
window.switchTab = function(tabId) {
    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    // Show the specific clicked tab
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.style.display = 'block';
    }

    // Highlight the matching sidebar button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
};

//  CRUD MANAGEMENT OPERATORS 

// Load data automatically when entering a database tab
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId) {
    originalSwitchTab(tabId);
    if (tabId === 'db-subjects') loadSubjectsPage();
    if (tabId === 'db-students') loadStudentsPage();
    if (tabId === 'db-teachers') loadTeachersPage();
};


// --- SUBJECT CATALOG LOOKUP (per class subject list) ---
// Edit these arrays once the official curriculum is confirmed — nothing
// else in the app needs to change when these lists are updated.
const SUBJECT_CATALOG = {
    playNurseryOneTwo: ["Bangla", "English", "Math", "General Knowledge", "Drawing", "Spoken", "Religious Education", "Clothes/Manner/Presence"],
    threeFourFive: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "Science", "Bangladesh & Global Studies", "General Knowledge", "Drawing", "Spoken", "Religious Education", "Clothes/Manner/Presence"],
    sixSevenEight: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "Science", "Bangladesh & Global Studies", "Agriculture/Domestic Science", "Religious Education", "ICT", "Clothes/Manner/Presence"],
    nineTenScience: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "General Math", "Religious Education", "ICT", "Bangladesh & Global Studies", "Physics", "Chemistry", "Higher Math", "Biology", "Agriculture/Domestic Science", "Clothes/Manner/Presence"],
    nineTenHumanities: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "General Math", "Religious Education", "ICT", "General Science", "History", "Geography & Environment", "Civics & Citizenship", "Economics", "Agriculture/Domestic Science", "Clothes/Manner/Presence"]
};

// Maps each exact class_name (as stored in the classes table) to its catalog list above
const CLASS_TO_CATALOG = {
    "Play": SUBJECT_CATALOG.playNurseryOneTwo,
    "Nursery": SUBJECT_CATALOG.playNurseryOneTwo,
    "Class One": SUBJECT_CATALOG.playNurseryOneTwo,
    "Class Two": SUBJECT_CATALOG.playNurseryOneTwo,
    "Class Three": SUBJECT_CATALOG.threeFourFive,
    "Class Four": SUBJECT_CATALOG.threeFourFive,
    "Class Five": SUBJECT_CATALOG.threeFourFive,
    "Class Six": SUBJECT_CATALOG.sixSevenEight,
    "Class Seven": SUBJECT_CATALOG.sixSevenEight,
    "Class Eight": SUBJECT_CATALOG.sixSevenEight,
    "Class Nine (Science)": SUBJECT_CATALOG.nineTenScience,
    "Class Ten (Science)": SUBJECT_CATALOG.nineTenScience,
    "Class Nine (Humanities)": SUBJECT_CATALOG.nineTenHumanities,
    "Class Ten (Humanities)": SUBJECT_CATALOG.nineTenHumanities
};

let allClassesCache = []; // filled by loadSubjectsPage, reused for filters + name dropdown
let subjectClassFilter = ""; // "" = show all classes
let allClassesForTeachers = []; // filled by loadTeachersPage, tracks which class belongs to which teacher

// --- SUBJECT MATRICES GENERATOR ---
async function loadSubjectsPage() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    allClassesCache = classes;

    const classSelect = document.getElementById('sub-class-select');
    classSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');

    // Populate the class filter button row
    const filterContainer = document.getElementById('subject-class-filters');
    filterContainer.innerHTML = `<button class="nav-btn" style="background:${subjectClassFilter === '' ? '#3b82f6' : '#e2e8f0'}; color:${subjectClassFilter === '' ? 'white' : '#1e293b'}; width:auto; padding:8px 16px;" onclick="filterSubjectsByClass('')">All Classes</button>` +
        classes.map(c => `<button class="nav-btn" style="background:${subjectClassFilter == c.id ? '#3b82f6' : '#e2e8f0'}; color:${subjectClassFilter == c.id ? 'white' : '#1e293b'}; width:auto; padding:8px 16px;" onclick="filterSubjectsByClass(${c.id})">${c.class_name}</button>`).join('');

    updateSubjectNameOptions();
    renderSubjectsTable();
}

// Refills the Subject Name dropdown based on whichever class is selected in the form
function updateSubjectNameOptions() {
    const classId = document.getElementById('sub-class-select').value;
    const cls = allClassesCache.find(c => String(c.id) === String(classId));
    const nameSelect = document.getElementById('sub-name-select');
    const list = (cls && CLASS_TO_CATALOG[cls.class_name]) || [];
    nameSelect.innerHTML = list.length
        ? list.map(name => `<option value="${name}">${name}</option>`).join('')
        : `<option value="">No catalog set for this class</option>`;
}
document.getElementById('sub-class-select').addEventListener('change', updateSubjectNameOptions);

window.filterSubjectsByClass = function (classId) {
    subjectClassFilter = classId;
    loadSubjectsPage();
};

async function renderSubjectsTable() {
    const subjects = await ipcRenderer.invoke('get-subjects');
    const filtered = subjectClassFilter === '' ? subjects : subjects.filter(s => String(s.class_id) === String(subjectClassFilter));
    const tbody = document.getElementById('subject-table-body');
        tbody.innerHTML = filtered.map(s => `
            <tr>
                <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">${s.sequence_order}</span></td>
                <td><b>${s.class_name || 'Unassigned'}</b></td>
                <td>${s.subject_name}</td>
                <td>${s.monthly_marks ?? '<i style="color:gray;">—</i>'}</td>
                <td>${s.yearly_marks ?? '<i style="color:gray;">—</i>'}</td>
                <td>
                    <button onclick="editSubject(${s.id}, ${s.class_id}, '${s.subject_name.replace(/'/g, "\\'")}', ${s.sequence_order}, ${s.monthly_marks || 'null'}, ${s.yearly_marks || 'null'})" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
                    <button onclick="deleteSubject(${s.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">🗑 Delete</button>
                </td>
            </tr>
        `).join('');
}

window.editSubject = function (id, classId, subjectName, sequence, monthlyMarks, yearlyMarks) {
    document.getElementById('sub-edit-id').value = id;
    document.getElementById('sub-class-select').value = classId;
    updateSubjectNameOptions();
    document.getElementById('sub-name-select').value = subjectName;
    document.getElementById('sub-seq-input').value = sequence;
    document.getElementById('sub-monthly-input').value = monthlyMarks || '';
    document.getElementById('sub-yearly-input').value = yearlyMarks || '';
    document.getElementById('btn-add-subject').textContent = 'Update Subject';
    document.getElementById('btn-cancel-subject').style.display = 'inline-block';
    const details = document.getElementById('subject-details');
    if (details) details.open = true;
};

document.getElementById('btn-add-subject').addEventListener('click', async () => {
    const editId = document.getElementById('sub-edit-id').value;
    const class_id = document.getElementById('sub-class-select').value;
    const subject_name = document.getElementById('sub-name-select').value;
    const sequence_order = document.getElementById('sub-seq-input').value;
    const monthly_marks = document.getElementById('sub-monthly-input').value || null;
    const yearly_marks = document.getElementById('sub-yearly-input').value || null;

    if (!subject_name) return alert("Pick a subject from the list first!");

    const payload = { class_id, subject_name, sequence_order, monthly_marks, yearly_marks };
    const res = editId
        ? await ipcRenderer.invoke('update-subject', { ...payload, id: editId })
        : await ipcRenderer.invoke('add-subject', payload);

    if (res.success) {
        document.getElementById('sub-edit-id').value = '';
        document.getElementById('sub-seq-input').value = '1';
        document.getElementById('sub-monthly-input').value = '';
        document.getElementById('sub-yearly-input').value = '';
        document.getElementById('btn-add-subject').textContent = 'Save Subject';
        document.getElementById('btn-cancel-subject').style.display = 'none';
        renderSubjectsTable();
    } else {
        alert('Could not save subject: ' + res.error);
    }
});

window.deleteSubject = async function (id) {
    if (confirm("Delete this subject? This can't be undone.")) {
        await ipcRenderer.invoke('delete-subject', id);
        renderSubjectsTable();
    }
};










// ------------------------------------------------------------
// Populates the class dropdown used by both the student filter
// and the enrollment form, then loads the student table.
// ------------------------------------------------------------
// --- STUDENT REGISTRY CONTROLLERS ---
async function loadStudentsPage() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    
    // Setup class options for filters and enrollment form forms
    const filterClass = document.getElementById('filter-student-class');
    const formClass = document.getElementById('st-class');
    
    const optionsHtml = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    filterClass.innerHTML = `<option value="">All 16 Classes</option>` + optionsHtml;
    formClass.innerHTML = optionsHtml;

    loadStudents();
}


// Re-fetches students from the database using whatever class/
// status filters are currently selected, and redraws the table
// — including the Graduate/Drop Out action buttons per row.
window.loadStudents = async function() {
    const class_id = document.getElementById('filter-student-class').value;
    const status = document.getElementById('filter-student-status').value;

    const students = await ipcRenderer.invoke('get-students', { class_id, status });
    const tbody = document.getElementById('student-table-body');
    
    tbody.innerHTML = students.map(s => `
        <tr>
            <td>${s.roll}</td>
            <td><b>${s.name}</b></td>
            <td>${s.class_name}</td>
            <td><span style="color:red; font-weight:bold;">${s.blood_group || 'N/A'}</span></td>
            <td>${s.guardian_contact}</td>
            <td><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${s.status==='Active'?'#dcfce7':'#fee2e2'}; color:${s.status==='Active'?'#16a34a':'#dc2626'};">${s.status}</span></td>
            <td>
            <button onclick="editStudent(${s.id}, ${s.class_id || 'null'}, ${s.roll}, '${(s.name||'').replace(/'/g, "\\'")}', '${(s.blood_group||'').replace(/'/g, "\\'")}', '${(s.guardian_name||'').replace(/'/g, "\\'")}', '${(s.guardian_contact||'').replace(/'/g, "\\'")}', '${(s.address||'').replace(/'/g, "\\'")}')" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
            ${s.status === 'Active' ? `
                <button onclick="changeStudentStatus(${s.id}, 'Graduated', 'Graduated Program')" style="padding:4px 8px; background:#10b981; font-size:11px; width:auto; display:inline-block; margin-right:4px;">🎓 Graduate</button>
                <button onclick="kickStudent(${s.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">❌ Drop Out</button>
            ` : `<small style="color:gray;">History Logged</small>`}
            </td>
        </tr>
    `).join('');    
};


// "Register Student" button: gathers the enrollment form fields
// into one object and sends it to main.js to insert. Shows an
// alert with the exact database error if the save fails.
window.editStudent = function(id, classId, roll, name, bloodGroup, guardianName, guardianContact, address) {
    document.getElementById('st-edit-id').value = id;
    document.getElementById('st-class').value = classId || '';
    document.getElementById('st-roll').value = roll;
    document.getElementById('st-name').value = name;
    document.getElementById('st-blood').value = bloodGroup;
    document.getElementById('st-guardian').value = guardianName;
    document.getElementById('st-phone').value = guardianContact;
    document.getElementById('st-address').value = address;
    document.getElementById('btn-save-student').textContent = 'Update Student';
    document.getElementById('btn-cancel-student').style.display = 'inline-block';
    const details = document.getElementById('student-details');
    if (details) details.open = true;
};

document.getElementById('btn-save-student').addEventListener('click', async () => {
    const editId = document.getElementById('st-edit-id').value;
    const s = {
        class_id: document.getElementById('st-class').value,
        roll: document.getElementById('st-roll').value,
        name: document.getElementById('st-name').value.trim(),
        blood_group: document.getElementById('st-blood').value.trim(),
        fathers_name: '', mothers_name: '', guardian_name: document.getElementById('st-guardian').value.trim(),
        guardian_contact: document.getElementById('st-phone').value.trim(),
        address: document.getElementById('st-address').value.trim(), dob: '', birth_reg_number: ''
    };

    if(!s.roll || !s.name) return alert("Roll and Name are required!");

    const res = editId
        ? await ipcRenderer.invoke('update-student', { ...s, id: editId })
        : await ipcRenderer.invoke('add-student', s);

    if(res.success) {
        document.getElementById('st-edit-id').value = '';
        document.getElementById('st-roll').value = "";
        document.getElementById('st-name').value = "";
        document.getElementById('st-blood').value = "";
        document.getElementById('st-guardian').value = "";
        document.getElementById('st-phone').value = "";
        document.getElementById('st-address').value = "";
        document.getElementById('btn-save-student').textContent = 'Register Student';
        document.getElementById('btn-cancel-student').style.display = 'none';
        loadStudents();
    } else {
        console.error('save-student failed:', res.error);
        alert('Could not save student: ' + res.error);
    }
});

window.changeStudentStatus = async function(id, status, cause) {
    if(confirm(`Are you sure you want to alter this student status to ${status}?`)) {
        await ipcRenderer.invoke('remove-student-with-cause', { id, status, cause });
        loadStudents();
    }
};


// "Drop Out" button handler: asks for a reason via prompt(),
// then hands off to changeStudentStatus() with status "Removed".
window.kickStudent = function(id) {
    const cause = prompt("Enter cause of student removal/drop-out:");
    if (cause) changeStudentStatus(id, 'Removed', cause);
};


// --- TEACHER REGISTRY CONTROLLERS ---
async function loadTeachersPage() {
    allClassesForTeachers = await ipcRenderer.invoke('get-classes-list');
    const classSelect = document.getElementById('tc-classes');
    classSelect.innerHTML = allClassesForTeachers.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    renderTeachersTable();
}

async function renderTeachersTable() {
    const teachers = await ipcRenderer.invoke('get-teachers');
    const tbody = document.getElementById('teacher-table-body');
    tbody.innerHTML = teachers.map(t => {
        const assignedClasses = allClassesForTeachers.filter(c => c.class_teacher_id === t.id).map(c => c.class_name);
        return `
        <tr>
            <td><b>${t.name}</b></td>
            <td>${t.title || ''}</td>
            <td>${assignedClasses.length ? assignedClasses.join(', ') : '<i style="color:gray;">None</i>'}</td>
            <td>${t.contact_number || ''}</td>
            <td><span style="color:red; font-weight:bold;">${t.blood_group || 'N/A'}</span></td>
            <td>${t.nid_number || ''}</td>
            <td>
                <button onclick="editTeacher(${t.id}, '${(t.name||'').replace(/'/g, "\\'")}', '${(t.title||'').replace(/'/g, "\\'")}', '${(t.contact_number||'').replace(/'/g, "\\'")}', '${(t.blood_group||'').replace(/'/g, "\\'")}', '${(t.fathers_name||'').replace(/'/g, "\\'")}', '${(t.mothers_name||'').replace(/'/g, "\\'")}', '${(t.nid_number||'').replace(/'/g, "\\'")}')" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
                <button onclick="deleteTeacher(${t.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">🗑 Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

window.editTeacher = function(id, name, title, contact, bloodGroup, fathersName, mothersName, nid) {
    document.getElementById('tc-edit-id').value = id;
    document.getElementById('tc-name').value = name;
    document.getElementById('tc-title').value = title;
    document.getElementById('tc-contact').value = contact;
    document.getElementById('tc-blood').value = bloodGroup;
    document.getElementById('tc-father').value = fathersName;
    document.getElementById('tc-mother').value = mothersName;
    document.getElementById('tc-nid').value = nid;

    // Pre-select this teacher's currently assigned classes
    const classSelect = document.getElementById('tc-classes');
    const assignedIds = allClassesForTeachers.filter(c => c.class_teacher_id === id).map(c => String(c.id));
    Array.from(classSelect.options).forEach(opt => {
        opt.selected = assignedIds.includes(opt.value);
    });

    document.getElementById('btn-save-teacher').textContent = 'Update Teacher';
    const details = document.getElementById('teacher-details');
    if (details) details.open = true;
};

document.getElementById('btn-save-teacher').addEventListener('click', async () => {
    const editId = document.getElementById('tc-edit-id').value;
    const t = {
        name: document.getElementById('tc-name').value.trim(),
        title: document.getElementById('tc-title').value.trim(),
        contact_number: document.getElementById('tc-contact').value.trim(),
        blood_group: document.getElementById('tc-blood').value.trim(),
        fathers_name: document.getElementById('tc-father').value.trim(),
        mothers_name: document.getElementById('tc-mother').value.trim(),
        nid_number: document.getElementById('tc-nid').value.trim()
    };

    if (!t.name) return alert("Teacher name is required!");

    const selectedClassIds = Array.from(document.getElementById('tc-classes').selectedOptions).map(opt => parseInt(opt.value));

    // Warn if any selected class already belongs to a different teacher
    const conflicts = allClassesForTeachers.filter(c =>
        selectedClassIds.includes(c.id) && c.class_teacher_id && String(c.class_teacher_id) !== String(editId)
    );
    if (conflicts.length) {
        const names = conflicts.map(c => c.class_name).join(', ');
        const ok = confirm(`${names} ${conflicts.length > 1 ? 'are' : 'is'} already assigned to another teacher. Reassign to this teacher instead?`);
        if (!ok) return;
    }

    const res = editId
        ? await ipcRenderer.invoke('update-teacher', { ...t, id: editId })
        : await ipcRenderer.invoke('add-teacher', t);

    if (res.success) {
        const teacherId = editId || res.id;
        await ipcRenderer.invoke('set-teacher-classes', { teacher_id: teacherId, class_ids: selectedClassIds });

        document.getElementById('tc-edit-id').value = '';
        document.getElementById('tc-name').value = "";
        document.getElementById('tc-title').value = "";
        document.getElementById('tc-contact').value = "";
        document.getElementById('tc-blood').value = "";
        document.getElementById('tc-father').value = "";
        document.getElementById('tc-mother').value = "";
        document.getElementById('tc-nid').value = "";
        document.getElementById('tc-classes').selectedIndex = -1;
        document.getElementById('btn-save-teacher').textContent = 'Save Teacher';
        loadTeachersPage();
    } else {
        console.error('save-teacher failed:', res.error);
        alert('Could not save teacher: ' + res.error);
    }
});

window.deleteTeacher = async function (id) {
    if (confirm("Delete this teacher? This can't be undone.")) {
        await ipcRenderer.invoke('delete-teacher', id);
        renderTeachersTable();
    }
};

// --- STEP 5: EXAMS MODULE — MARKS ENTRY ---
// ============================================================
// STEP 5: MARKS ENTRY
// Lets the admin pick a year+test, click a class button, and
// fill in a marks grid (students × subjects) for that exam.
// currentExam / currentClassId track what's currently open.
// ============================================================
let currentExam = null;
let currentClassId = null;


// Draws one button per class in the Exams tab. Clicking a class
// button opens the marks-entry grid for that class.
async function loadExamClassButtons() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    const container = document.getElementById('exam-class-buttons');
    container.innerHTML = classes.map(c =>
        `<button class="nav-btn" style="background:#e2e8f0; color:#1e293b; width:auto; padding:8px 16px;" onclick="openMarksEntry(${c.id}, '${c.class_name.replace(/'/g, "\\'")}')">${c.class_name}</button>`
    ).join('');
}


// STEP 5 ADD-ON: wraps switchTab again so opening the Exams tab
// also (re)loads the class buttons above.
const originalSwitchTabStep5 = window.switchTab;
window.switchTab = function (tabId) {
    originalSwitchTabStep5(tabId);
    if (tabId === 'exams-tab') loadExamClassButtons();
};


// Runs when a class button is clicked: finds or creates the
// exam record for the selected year+test, then fetches that
// class's students, subjects, and any marks already saved.
window.openMarksEntry = async function (classId, className) {
    const year = document.getElementById('exam-year').value;
    const exam_type = document.getElementById('exam-type-select').value;
    currentExam = await ipcRenderer.invoke('get-or-create-exam', { year, exam_type });
    currentClassId = classId;

    const sheet = await ipcRenderer.invoke('get-marks-sheet', { class_id: classId, exam_id: currentExam.id });
    renderMarksTable(className, sheet);
};


// Builds the actual marks grid: one row per student, one column
// per subject, plus an "Absent" checkbox per student. Pre-fills
// any marks that were already saved for this exam.
function renderMarksTable(className, sheet) {
    const { students, subjects, marks } = sheet;
    const markMap = {};
    marks.forEach(m => { markMap[`${m.student_id}_${m.subject_id}`] = m; });

    const container = document.getElementById('marks-entry-container');
    if (!students.length || !subjects.length) {
        container.innerHTML = `<p style="color:#dc2626;">This class needs students and subjects set up before marks can be entered.</p>`;
        return;
    }

    let header = `<th>Roll</th><th>Name</th>` + subjects.map(s => `<th>${s.subject_name}</th>`).join('') + `<th>Absent</th>`;
    let rows = students.map(st => {
        const cells = subjects.map(sub => {
            const existing = markMap[`${st.id}_${sub.id}`];
            const val = existing ? existing.marks_obtained : '';
            return `<td><input type="number" data-student="${st.id}" data-subject="${sub.id}" class="mark-input" value="${val}" style="width:70px;"></td>`;
        }).join('');
        const wasAbsent = subjects.length && markMap[`${st.id}_${subjects[0].id}`] && markMap[`${st.id}_${subjects[0].id}`].is_present === 0;
        return `<tr>
            <td>${st.roll}</td>
            <td>${st.name}</td>
            ${cells}
            <td style="text-align:center;"><input type="checkbox" class="absent-check" data-student="${st.id}" ${wasAbsent ? 'checked' : ''}></td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <h3 style="margin-top:0;">${className} — ${document.getElementById('exam-type-select').value} (${document.getElementById('exam-year').value})</h3>
        <table style="width:100%; border-collapse:collapse; background:white;" border="1" cellpadding="6" bordercolor="#e2e8f0">
            <thead style="background:#f8fafc;"><tr>${header}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <button id="btn-save-marks" style="margin-top:15px; width:200px; background-color:#10b981;">Save Marks</button>
    `;

    document.getElementById('btn-save-marks').addEventListener('click', saveMarksEntry);
}


// "Save Marks" button: reads every mark input and absent
// checkbox currently on screen, bundles them into one batch,
// and sends them to main.js to be saved/updated in one go.
async function saveMarksEntry() {
    const absentStudents = new Set(
        Array.from(document.querySelectorAll('.absent-check:checked')).map(el => el.dataset.student)
    );

    const entries = Array.from(document.querySelectorAll('.mark-input')).map(input => ({
        student_id: input.dataset.student,
        subject_id: input.dataset.subject,
        marks_obtained: parseFloat(input.value) || 0,
        is_present: absentStudents.has(input.dataset.student) ? 0 : 1
    }));

    const res = await ipcRenderer.invoke('save-marks', { exam_id: currentExam.id, entries });
    if (res.success) {
        alert('Marks saved!');
    } else {
        alert('Error saving marks: ' + res.error);
    }
}


// --- ENTER-KEY FORM NAVIGATION ---
// Pressing Enter in any input/select moves focus to the next one in the
// same container; pressing Enter on the last one clicks the submit button.
function enableEnterNavigation(container, submitBtn) {
    if (!container) return;
    const fields = Array.from(container.querySelectorAll('input, select')).filter(el => el.type !== 'hidden');
    fields.forEach((field, idx) => {
        field.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const next = fields[idx + 1];
            if (next) {
                next.focus();
            } else if (submitBtn) {
                submitBtn.click();
            }
        });
    });
}

enableEnterNavigation(document.getElementById('setup-screen'), document.getElementById('btn-save-setup'));
enableEnterNavigation(document.getElementById('login-screen'), document.getElementById('btn-login'));
enableEnterNavigation(document.getElementById('student-form'), document.getElementById('btn-save-student'));
enableEnterNavigation(document.getElementById('teacher-form'), document.getElementById('btn-save-teacher'));
enableEnterNavigation(document.getElementById('subject-form'), document.getElementById('btn-add-subject'));

// --- NUMERIC-ONLY VALIDATION FOR SEQUENCE / MONTHLY / YEARLY FIELDS ---
function enforceNumericInput(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (!input) return;

    input.addEventListener('keydown', (e) => {
        const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End'];
        if (allowedKeys.includes(e.key)) return;
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            if (errorEl) errorEl.textContent = 'Numbers only';
        }
    });

    input.addEventListener('input', () => {
        const cleaned = input.value.replace(/[^0-9]/g, '');
        if (cleaned !== input.value) input.value = cleaned;
        if (errorEl) errorEl.textContent = '';
    });
}

enforceNumericInput('sub-seq-input', 'sub-seq-error');
enforceNumericInput('sub-monthly-input', 'sub-monthly-error');
enforceNumericInput('sub-yearly-input', 'sub-yearly-error');



// --- CANCEL EDIT BUTTONS (Student / Teacher / Subject) ---
function setupCancelEdit(editIdField, formFields, saveBtnId, saveLabel, cancelBtnId) {
    const cancelBtn = document.getElementById(cancelBtnId);
    const saveBtn = document.getElementById(saveBtnId);
    if (!cancelBtn || !saveBtn) return;

    cancelBtn.addEventListener('click', () => {
        document.getElementById(editIdField).value = '';
        formFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        saveBtn.textContent = saveLabel;
        cancelBtn.style.display = 'none';
    });
}

setupCancelEdit('st-edit-id', ['st-class', 'st-roll', 'st-name', 'st-blood', 'st-guardian', 'st-phone', 'st-address'], 'btn-save-student', 'Register Student', 'btn-cancel-student');
setupCancelEdit('tc-edit-id', ['tc-name', 'tc-title', 'tc-contact', 'tc-blood', 'tc-father', 'tc-mother', 'tc-nid'], 'btn-save-teacher', 'Save Teacher', 'btn-cancel-teacher');
setupCancelEdit('sub-edit-id', ['sub-class-select', 'sub-teacher-select', 'sub-name-select', 'sub-seq-input', 'sub-monthly-input', 'sub-yearly-input'], 'btn-add-subject', 'Save Subject', 'btn-cancel-subject');