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

const MAIN_SUBJECT_POOLS = {
    "Class Nine (Science)": ["Physics", "Chemistry", "Biology", "Higher Math"],
    "Class Ten (Science)": ["Physics", "Chemistry", "Biology", "Higher Math"],
    "Class Nine (Humanities)": ["History", "Geography & Environment", "Civics & Citizenship", "Economics"],
    "Class Ten (Humanities)": ["History", "Geography & Environment", "Civics & Citizenship", "Economics"]
};
const OPTIONAL_FALLBACK_SUBJECT = "Agriculture/Domestic Science";
let allClassesForStudents = [];

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
    allClassesForStudents = classes;

    // Setup class options for filters and enrollment form forms
    const filterClass = document.getElementById('filter-student-class');
    const formClass = document.getElementById('st-class');

    const optionsHtml = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    filterClass.innerHTML = `<option value="">All 16 Classes</option>` + optionsHtml;
    formClass.innerHTML = optionsHtml;

    loadStudents();
}

// Shows/hides and (re)builds the Main/Optional subject panel based on
// whichever class is currently picked in the enrollment form.
window.updateStudentSubjectSelection = function () {
    const classId = document.getElementById('st-class').value;
    const cls = allClassesForStudents.find(c => String(c.id) === String(classId));
    const pool = cls && MAIN_SUBJECT_POOLS[cls.class_name];
    const panel = document.getElementById('stu-subject-selection');

    if (!pool) {
        panel.style.display = 'none';
        document.getElementById('stu-main-subjects-list').innerHTML = '';
        document.getElementById('stu-optional-select').innerHTML = '<option value="">-- pick 3 main subjects first --</option>';
        return;
    }

    panel.style.display = 'block';
    document.getElementById('stu-main-subjects-list').innerHTML = pool.map(subj => `
        <label style="font-weight:normal; display:flex; align-items:center; gap:5px;">
            <input type="checkbox" class="stu-main-checkbox" value="${subj}" onchange="handleMainSubjectToggle(this)"> ${subj}
        </label>
    `).join('');
    updateOptionalSubjectOptions();
};

// A checked box past 3 gets auto-unchecked with a warning, so the
// count can never exceed 3.
window.handleMainSubjectToggle = function (checkbox) {
    const checked = document.querySelectorAll('.stu-main-checkbox:checked');
    if (checked.length > 3) {
        checkbox.checked = false;
        alert("You can only select 3 main subjects.");
        return;
    }
    updateOptionalSubjectOptions();
};

// Optional dropdown = whichever pool subject wasn't picked as Main,
// plus Agriculture/Domestic Science — only once exactly 3 are checked.
function updateOptionalSubjectOptions() {
    const classId = document.getElementById('st-class').value;
    const cls = allClassesForStudents.find(c => String(c.id) === String(classId));
    const pool = cls && MAIN_SUBJECT_POOLS[cls.class_name];
    const select = document.getElementById('stu-optional-select');
    if (!pool) return;

    const checkedMains = Array.from(document.querySelectorAll('.stu-main-checkbox:checked')).map(cb => cb.value);
    if (checkedMains.length !== 3) {
        select.innerHTML = '<option value="">-- pick 3 main subjects first --</option>';
        select.disabled = true;
        return;
    }

    const leftover = pool.find(subj => !checkedMains.includes(subj));
    const options = [leftover, OPTIONAL_FALLBACK_SUBJECT].filter(Boolean);
    const previousValue = select.value;
    select.disabled = false;
    select.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join('');
    if (options.includes(previousValue)) select.value = previousValue;
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
            <td>${s.guardian_contact}</td>
            <td><span style="padding:2px 6px; border-radius:4px; font-size:12px; background:${s.status==='Active'?'#dcfce7':'#fee2e2'}; color:${s.status==='Active'?'#16a34a':'#dc2626'};">${s.status}</span></td>
            <td>
            <button onclick="editStudent(${s.id}, ${s.class_id || 'null'}, ${s.roll}, '${(s.name||'').replace(/'/g, "\\'")}', '${(s.blood_group||'').replace(/'/g, "\\'")}', '${(s.guardian_contact||'').replace(/'/g, "\\'")}', '${(s.address||'').replace(/'/g, "\\'")}', '${(s.dob||'').replace(/'/g, "\\'")}', '${(s.fathers_name||'').replace(/'/g, "\\'")}', '${(s.mothers_name||'').replace(/'/g, "\\'")}', '${(s.birth_reg_number||'').replace(/'/g, "\\'")}')" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
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
window.editStudent = async function(id, classId, roll, name, bloodGroup, guardianContact, address, dob, fathersName, mothersName, birthRegNumber) {
    document.getElementById('st-edit-id').value = id;
    document.getElementById('st-class').value = classId || '';
    document.getElementById('st-roll').value = roll;
    document.getElementById('st-name').value = name;
    document.getElementById('st-blood').value = bloodGroup;
    document.getElementById('st-phone').value = guardianContact;
    document.getElementById('st-address').value = address;
    document.getElementById('st-dob').value = dob || '';
    document.getElementById('st-father').value = fathersName || '';
    document.getElementById('st-mother').value = mothersName || '';
    document.getElementById('st-birth-reg').value = birthRegNumber || '';
    document.getElementById('btn-save-student').textContent = 'Update Student';
    document.getElementById('btn-cancel-student').style.display = 'inline-block';
    const details = document.getElementById('student-details');
    if (details) details.open = true;

    updateStudentSubjectSelection();
    const existing = await ipcRenderer.invoke('get-student-subjects', id);
    existing.filter(r => r.role === 'main').forEach(r => {
        const cb = document.querySelector(`.stu-main-checkbox[value="${CSS.escape(r.subject_name)}"]`);
        if (cb) cb.checked = true;
    });
    updateOptionalSubjectOptions();
    const optionalRow = existing.find(r => r.role === 'optional');
    if (optionalRow) document.getElementById('stu-optional-select').value = optionalRow.subject_name;
};

document.getElementById('btn-save-student').addEventListener('click', async () => {
    const editId = document.getElementById('st-edit-id').value;
    const s = {
        class_id: document.getElementById('st-class').value,
        roll: document.getElementById('st-roll').value,
        name: document.getElementById('st-name').value.trim(),
        blood_group: document.getElementById('st-blood').value.trim(),
        fathers_name: document.getElementById('st-father').value.trim(),
        mothers_name: document.getElementById('st-mother').value.trim(),
        guardian_name: '',
        guardian_contact: document.getElementById('st-phone').value.trim(),
        address: document.getElementById('st-address').value.trim(),
        dob: document.getElementById('st-dob').value || '',
        birth_reg_number: document.getElementById('st-birth-reg').value.trim()
    };

    if(!s.roll || !s.name) return alert("Roll and Name are required!");

    // Nine/Ten Main + Optional subject validation
    const cls = allClassesForStudents.find(c => String(c.id) === String(s.class_id));
    const pool = cls && MAIN_SUBJECT_POOLS[cls.class_name];
    let subjectSelections = null;
    if (pool) {
        const mains = Array.from(document.querySelectorAll('.stu-main-checkbox:checked')).map(cb => cb.value);
        const optional = document.getElementById('stu-optional-select').value;
        if (mains.length !== 3 || !optional) {
            return alert("Please select exactly 3 Main subjects and 1 Optional subject.");
        }
        subjectSelections = mains.map(name => ({ subject_name: name, role: 'main' }))
            .concat([{ subject_name: optional, role: 'optional' }]);
    }

    const res = editId
        ? await ipcRenderer.invoke('update-student', { ...s, id: editId })
        : await ipcRenderer.invoke('add-student', s);

    if(res.success) {
        const studentId = editId || res.id;
        if (subjectSelections) {
            await ipcRenderer.invoke('save-student-subjects', { student_id: studentId, subjects: subjectSelections });
        }
        document.getElementById('st-edit-id').value = '';
        document.getElementById('st-roll').value = "";
        document.getElementById('st-name').value = "";
        document.getElementById('st-blood').value = "";
        document.getElementById('st-phone').value = "";
        document.getElementById('st-address').value = "";
        document.getElementById('st-dob').value = "";
        document.getElementById('st-father').value = "";
        document.getElementById('st-mother').value = "";
        document.getElementById('st-birth-reg').value = "";
        document.getElementById('stu-main-subjects-list').innerHTML = '';
        document.getElementById('stu-optional-select').innerHTML = '<option value="">-- pick 3 main subjects first --</option>';
        document.getElementById('stu-subject-selection').style.display = 'none';
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
    document.getElementById('btn-cancel-teacher').style.display = 'inline-block';
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
        document.getElementById('btn-cancel-teacher').style.display = 'none';
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

// --- STEP 5: EXAMS MODULE — SUBJECT-WISE MARKS ENTRY ---
// ============================================================
// STEP 5: MARKS ENTRY
// Pick a year + test, click a class, click a subject chip, then
// type marks down the roll list (one subject at a time).
// Every mark is saved the moment you leave the box or press Enter.
//   blank  = not entered yet (no row in the database)
//   A      = absent in that subject
//   number = marks (the maximum is that subject's own total)
// ============================================================
let currentExam = null;
let currentClassId = null;
let currentClassName = '';
let currentSubjectId = null;
let marksSheet = null;   // everything about the class that is currently open


// ---------- small helpers ----------

function escapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Monthly exams use each subject's Monthly Total; Half Yearly and
// Yearly use its Yearly Total.
function examUsesMonthlyTotal(examType) {
    return examType.includes('Monthly');
}

// Returns the subject's total for this exam type, or null if none is set
// (a subject with no total for this exam type is hidden from the screen).
function totalForSubject(sub, examType) {
    const total = examUsesMonthlyTotal(examType) ? sub.monthly_marks : sub.yearly_marks;
    return total > 0 ? total : null;
}

// Keeps only what a mark box may contain: digits with one decimal place,
// or a single "A" for absent.
function sanitizeMarkInput(raw) {
    let t = String(raw).toUpperCase().replace(/[^0-9.A]/g, '');
    if (t.startsWith('A')) return 'A';
    t = t.replace(/A/g, '');
    const dot = t.indexOf('.');
    if (dot === -1) return t.slice(0, 3);
    const intPart = t.slice(0, dot).slice(0, 3);
    const decPart = t.slice(dot + 1).replace(/\./g, '').slice(0, 1);
    return intPart + '.' + decPart;
}

// Final tidy-up before saving: "12." -> "12", "007" -> "7", "." -> ""
function normalizeMarkText(raw) {
    const t = sanitizeMarkInput(raw);
    if (t === '' || t === 'A') return t;
    const n = parseFloat(t);
    return Number.isNaN(n) ? '' : String(n);
}

function getCell(studentId, subjectId) {
    const row = marksSheet.cells[studentId];
    return row && row[subjectId] !== undefined ? row[subjectId] : '';
}

function setCell(sheet, studentId, subjectId, value) {
    if (!sheet.cells[studentId]) sheet.cells[studentId] = {};
    if (value === '') delete sheet.cells[studentId][subjectId];
    else sheet.cells[studentId][subjectId] = value;
}

// Nine/Ten only: a student sits a choosable subject (Physics, Biology,
// Economics, Agriculture/Domestic Science, etc.) only if it is in their
// saved selections. Every other subject applies to all students.
function studentTakesSubject(studentId, subjectName) {
    const pool = MAIN_SUBJECT_POOLS[currentClassName];
    if (!pool) return true;
    const choosable = pool.concat([OPTIONAL_FALLBACK_SUBJECT]);
    if (!choosable.includes(subjectName)) return true;
    return (marksSheet.selMap[studentId] || []).includes(subjectName);
}

function studentsForSubject(sub) {
    return marksSheet.students.filter(st => studentTakesSubject(st.id, sub.subject_name));
}

function subjectProgress(sub) {
    const list = studentsForSubject(sub);
    const done = list.filter(st => getCell(st.id, sub.id) !== '').length;
    return { done, total: list.length };
}

function setSaveStatus(text, isError) {
    const el = document.getElementById('marks-save-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#dc2626' : '#16a34a';
}


// ---------- class buttons ----------

// Draws one button per class in the Exams tab. Clicking a class
// button opens the marks-entry screen for that class.
async function loadExamClassButtons() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    const container = document.getElementById('exam-class-buttons');
    container.innerHTML = '';
    classes.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'chip-btn' + (c.id === currentClassId ? ' active' : '');
        btn.textContent = c.class_name;
        btn.dataset.classId = c.id;
        btn.addEventListener('click', () => openMarksEntry(c.id, c.class_name));
        container.appendChild(btn);
    });
}


// STEP 5 ADD-ON: wraps switchTab again so opening the Exams tab
// also (re)loads the class buttons above.
const originalSwitchTabStep5 = window.switchTab;
window.switchTab = function (tabId) {
    originalSwitchTabStep5(tabId);
    if (tabId === 'exams-tab') loadExamClassButtons();
};


// ---------- opening a class ----------

// Runs when a class button is clicked (or the Year/Test changes while a
// class is open): finds or creates the exam record, then fetches that
// class's students, subjects, saved marks and Nine/Ten subject choices.
window.openMarksEntry = async function (classId, className) {
    const container = document.getElementById('marks-entry-container');
    const year = document.getElementById('exam-year').value;
    const exam_type = document.getElementById('exam-type-select').value;

    const exam = await ipcRenderer.invoke('get-or-create-exam', { year, exam_type });
    if (!exam || exam.success === false) {
        container.innerHTML = `<p class="marks-msg-error">${escapeHtml((exam && exam.error) || 'Could not open this exam.')}</p>`;
        return;
    }

    if (classId !== currentClassId) currentSubjectId = null;
    currentExam = exam;
    currentClassId = classId;
    currentClassName = className;

    document.querySelectorAll('#exam-class-buttons .chip-btn').forEach(b => {
        b.classList.toggle('active', Number(b.dataset.classId) === classId);
    });

    const sheet = await ipcRenderer.invoke('get-marks-sheet', { class_id: classId, exam_id: exam.id });
    buildMarksSheetState(sheet, exam.exam_type);
    renderMarksScreen();
};

// Turns the raw database rows into the in-memory structure the screen uses.
function buildMarksSheetState(sheet, examType) {
    const cells = {};
    sheet.marks.forEach(m => {
        if (!cells[m.student_id]) cells[m.student_id] = {};
        cells[m.student_id][m.subject_id] = m.is_present === 0 ? 'A' : String(m.marks_obtained);
    });

    const selMap = {};
    sheet.studentSubjects.forEach(r => {
        if (!selMap[r.student_id]) selMap[r.student_id] = [];
        selMap[r.student_id].push(r.subject_name);
    });

    const pool = MAIN_SUBJECT_POOLS[currentClassName];
    marksSheet = {
        examType,
        students: sheet.students,
        allSubjectCount: sheet.subjects.length,
        subjects: sheet.subjects.filter(s => totalForSubject(s, examType) !== null),
        hiddenSubjects: sheet.subjects.filter(s => totalForSubject(s, examType) === null).map(s => s.subject_name),
        missingSelections: pool ? sheet.students.filter(st => !selMap[st.id]).length : 0,
        cells,
        selMap
    };
}


// ---------- drawing the screen ----------

function renderMarksScreen() {
    const container = document.getElementById('marks-entry-container');
    const s = marksSheet;
    const heading = `<h3 style="margin-top:0;">${escapeHtml(currentClassName)} — ${escapeHtml(s.examType)} (${escapeHtml(currentExam.year)})</h3>`;
    const kind = examUsesMonthlyTotal(s.examType) ? 'monthly' : 'yearly';

    if (!s.students.length) {
        container.innerHTML = heading + `<p class="marks-msg-error">This class has no active students. Add students in the Students tab first.</p>`;
        return;
    }
    if (!s.allSubjectCount) {
        container.innerHTML = heading + `<p class="marks-msg-error">This class has no subjects yet. Add them in the Subjects tab first.</p>`;
        return;
    }
    if (!s.subjects.length) {
        container.innerHTML = heading + `<p class="marks-msg-error">None of this class's subjects have a ${kind} total set, so there is nothing to enter for this exam. Set the totals in the Subjects tab.</p>`;
        return;
    }

    if (!s.subjects.some(sub => sub.id === currentSubjectId)) currentSubjectId = s.subjects[0].id;
    const sub = s.subjects.find(x => x.id === currentSubjectId);
    const total = totalForSubject(sub, s.examType);

    let notes = '';
    if (s.missingSelections > 0) {
        notes += `<div class="marks-warn">${s.missingSelections} student(s) in this class have no subject selection saved, so they will not appear under Physics, Biology, Economics, etc. Set their subjects in the Students tab.</div>`;
    }
    if (s.hiddenSubjects.length) {
        notes += `<div class="marks-note">Not shown (no ${kind} total set): ${escapeHtml(s.hiddenSubjects.join(', '))}</div>`;
    }

    container.innerHTML = `
        ${heading}
        <div id="subject-chips" class="chip-row"></div>
        <div class="marks-head">
            <div><span class="marks-subject-title">${escapeHtml(sub.subject_name)}</span> <span class="marks-outof">out of ${total}</span></div>
            <div id="marks-progress" class="marks-progress"></div>
        </div>
        ${notes}
        <div class="marks-card">
            <div class="marks-row marks-row-head"><span>Roll</span><span>Name</span><span>Marks</span><span>Status</span></div>
            <div id="marks-rows"></div>
        </div>
        <div class="marks-foot">
            <span>Enter moves down. Type <b>A</b> for absent. Leave blank if not entered yet.</span>
            <span id="marks-save-status"></span>
        </div>
    `;

    renderSubjectChips();
    renderMarkRows(sub, total);
    updateProgressText();
    focusFirstEmptyMark();
}

function renderSubjectChips() {
    const wrap = document.getElementById('subject-chips');
    if (!wrap) return;
    wrap.innerHTML = '';
    marksSheet.subjects.forEach(sub => {
        const p = subjectProgress(sub);
        const btn = document.createElement('button');
        let cls = 'chip-btn';
        if (p.total > 0 && p.done === p.total) cls += ' done';
        if (sub.id === currentSubjectId) cls += ' active';
        btn.className = cls;
        btn.textContent = `${sub.subject_name}  ${p.done}/${p.total}`;
        btn.addEventListener('click', () => {
            currentSubjectId = sub.id;
            renderMarksScreen();
        });
        wrap.appendChild(btn);
    });
}

function updateProgressText() {
    const el = document.getElementById('marks-progress');
    if (!el || !marksSheet) return;
    const sub = marksSheet.subjects.find(x => x.id === currentSubjectId);
    if (!sub) return;
    const p = subjectProgress(sub);
    el.textContent = `${p.done} of ${p.total} done`;
}

function focusFirstEmptyMark() {
    const inputs = Array.from(document.querySelectorAll('#marks-rows .mark-cell'));
    const target = inputs.find(i => i.value === '') || inputs[0];
    if (target) target.focus();
}

// Colours the little status label beside each mark box.
function paintMarkStatus(statusEl, text, total) {
    let label = 'Empty';
    let cls = 'st-empty';
    if (text === 'A') { label = 'Absent'; cls = 'st-absent'; }
    else if (text !== '' && parseFloat(text) > total) { label = `Max ${total}`; cls = 'st-error'; }
    else if (text !== '') { label = 'Entered'; cls = 'st-ok'; }
    statusEl.textContent = label;
    statusEl.className = 'marks-status ' + cls;
}

// One row per student who sits this subject, with a single mark box.
function renderMarkRows(sub, total) {
    const rowsEl = document.getElementById('marks-rows');
    rowsEl.innerHTML = '';
    const list = studentsForSubject(sub);

    if (!list.length) {
        rowsEl.innerHTML = `<div class="marks-empty-row">No student in this class has been assigned ${escapeHtml(sub.subject_name)}.</div>`;
        return;
    }

    list.forEach(st => {
        const row = document.createElement('div');
        row.className = 'marks-row';
        row.innerHTML = `
            <span class="marks-roll">${escapeHtml(st.roll)}</span>
            <span class="marks-name">${escapeHtml(st.name)}</span>
            <span><input type="text" class="mark-cell" inputmode="decimal" autocomplete="off"></span>
            <span class="marks-status"></span>`;
        const input = row.querySelector('.mark-cell');
        const statusEl = row.querySelector('.marks-status');
        input.dataset.student = st.id;
        input.value = getCell(st.id, sub.id);
        paintMarkStatus(statusEl, input.value, total);

        input.addEventListener('focus', () => input.select());

        input.addEventListener('input', () => {
            input.value = sanitizeMarkInput(input.value);
            paintMarkStatus(statusEl, input.value, total);
        });

        input.addEventListener('change', () => commitMark(input, sub, total, statusEl));

        input.addEventListener('keydown', async (e) => {
            const inputs = Array.from(document.querySelectorAll('#marks-rows .mark-cell'));
            const idx = inputs.indexOf(input);
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (inputs[idx - 1]) inputs[idx - 1].focus();
                return;
            }
            if (e.key !== 'Enter' && e.key !== 'ArrowDown') return;
            e.preventDefault();
            if (inputs[idx + 1]) {
                inputs[idx + 1].focus();
                return;
            }
            if (e.key === 'Enter') {
                const ok = await commitMark(input, sub, total, statusEl);
                if (ok) goToNextSubject();
            }
        });

        rowsEl.appendChild(row);
    });
}

// After the last student of a subject, Enter jumps to the next subject chip.
function goToNextSubject() {
    const subs = marksSheet.subjects;
    const idx = subs.findIndex(x => x.id === currentSubjectId);
    if (idx === -1 || idx === subs.length - 1) {
        setSaveStatus('That was the last subject.', false);
        return;
    }
    currentSubjectId = subs[idx + 1].id;
    renderMarksScreen();
}


// ---------- saving ----------

// Saves one mark box. Safe to call twice: if nothing changed since the
// last save it does nothing. Returns true if the box is fine (saved or
// unchanged) and false if it was rejected.
async function commitMark(input, sub, total, statusEl) {
    const sheet = marksSheet;
    const studentId = Number(input.dataset.student);
    const text = normalizeMarkText(input.value);
    input.value = text;

    if (text === getCell(studentId, sub.id)) {
        paintMarkStatus(statusEl, text, total);
        return true;
    }

    if (text !== '' && text !== 'A' && parseFloat(text) > total) {
        paintMarkStatus(statusEl, text, total);
        setSaveStatus(`Not saved: ${sub.subject_name} is out of ${total}.`, true);
        return false;
    }

    setSaveStatus('Saving…', false);
    const res = await ipcRenderer.invoke('save-mark', {
        exam_id: currentExam.id,
        student_id: studentId,
        subject_id: sub.id,
        value: text
    });

    if (!res || !res.success) {
        setSaveStatus('Not saved: ' + ((res && res.error) || 'unknown error'), true);
        return false;
    }

    setCell(sheet, studentId, sub.id, text);
    if (marksSheet !== sheet) return true;
    paintMarkStatus(statusEl, text, total);
    setSaveStatus('Saved', false);
    renderSubjectChips();
    updateProgressText();
    return true;
}


// Changing the Year or Test while a class is open reloads that class for
// the newly chosen exam, so the screen never disagrees with the dropdowns.
['exam-year', 'exam-type-select'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        if (currentClassId) openMarksEntry(currentClassId, currentClassName);
    });
});


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

setupCancelEdit('st-edit-id', ['st-class', 'st-roll', 'st-name', 'st-blood', 'st-phone', 'st-address', 'st-dob', 'st-father', 'st-mother', 'st-birth-reg'], 'btn-save-student', 'Register Student', 'btn-cancel-student');
setupCancelEdit('tc-edit-id', ['tc-name', 'tc-title', 'tc-contact', 'tc-blood', 'tc-father', 'tc-mother', 'tc-nid'], 'btn-save-teacher', 'Save Teacher', 'btn-cancel-teacher');
setupCancelEdit('sub-edit-id', ['sub-class-select', 'sub-teacher-select', 'sub-name-select', 'sub-seq-input', 'sub-monthly-input', 'sub-yearly-input'], 'btn-add-subject', 'Save Subject', 'btn-cancel-subject');