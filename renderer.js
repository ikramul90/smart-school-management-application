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
        startNotificationCenter();
    } else {
        document.getElementById('login-error').innerText = response.message;
    }
});

// Toggle password visibility on admin login screen
const btnToggleLoginPassword = document.getElementById('btn-toggle-login-password');
if (btnToggleLoginPassword) {
    btnToggleLoginPassword.addEventListener('click', () => {
        const passwordInput = document.getElementById('login-password');
        if (!passwordInput) return;
        const eyeIcon = btnToggleLoginPassword.querySelector('.eye-icon');
        const eyeOffIcon = btnToggleLoginPassword.querySelector('.eye-off-icon');
        const isPassword = passwordInput.type === 'password';

        passwordInput.type = isPassword ? 'text' : 'password';
        btnToggleLoginPassword.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        btnToggleLoginPassword.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
        if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : 'block';
        if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? 'block' : 'none';
    });
}

// Login form: sends the entered username/password to main.js for
// verification, then swaps the login screen out for the dashboard
// if correct.
window.switchTab = function (tabId) {
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
window.switchTab = function (tabId) {
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
    let optionsHtml = list.map(name => `<option value="${name}">${name}</option>`).join('');
    optionsHtml += `<option value="__custom__">Custom Subject</option>`;
    nameSelect.innerHTML = optionsHtml;
    handleSubjectNameChange();
}

function handleSubjectNameChange() {
    const nameSelect = document.getElementById('sub-name-select');
    const customWrap = document.getElementById('sub-custom-name-wrap');
    const customInput = document.getElementById('sub-custom-name-input');
    const customErr = document.getElementById('sub-custom-error');
    if (!nameSelect || !customWrap) return;

    if (nameSelect.value === '__custom__') {
        customWrap.style.display = 'block';
        if (customInput) customInput.focus();
    } else {
        customWrap.style.display = 'none';
        if (customInput) customInput.value = '';
        if (customErr) customErr.textContent = '';
    }
}
document.getElementById('sub-class-select').addEventListener('change', updateSubjectNameOptions);
document.getElementById('sub-name-select').addEventListener('change', handleSubjectNameChange);

const customSubjectInputEl = document.getElementById('sub-custom-name-input');
if (customSubjectInputEl) {
    customSubjectInputEl.addEventListener('input', () => {
        const errEl = document.getElementById('sub-custom-error');
        if (errEl && customSubjectInputEl.value.trim()) errEl.textContent = '';
    });
}

window.filterSubjectsByClass = function (classId) {
    subjectClassFilter = classId;
    loadSubjectsPage();
};

let allLoadedSubjects = [];

async function renderSubjectsTable() {
    const subjects = await ipcRenderer.invoke('get-subjects');
    allLoadedSubjects = subjects;
    const filtered = subjectClassFilter === '' ? subjects : subjects.filter(s => String(s.class_id) === String(subjectClassFilter));
    const tbody = document.getElementById('subject-table-body');
    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">${s.sequence_order}</span></td>
            <td><b>${s.class_name || 'Unassigned'}</b></td>
            <td>${escapeHtml(s.subject_name)}</td>
            <td>${s.monthly_marks ?? '<i style="color:gray;">—</i>'}</td>
            <td>${s.yearly_marks ?? '<i style="color:gray;">—</i>'}</td>
            <td>
                <button onclick="editSubject(${s.id})" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
                <button onclick="deleteSubject(${s.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">🗑 Delete</button>
            </td>
        </tr>
    `).join('');
}

window.editSubject = function (id, classId, subjectName, sequence, monthlyMarks, yearlyMarks) {
    let s = allLoadedSubjects.find(item => item.id === id);
    if (!s) {
        s = { id, class_id: classId, subject_name: subjectName, sequence_order: sequence, monthly_marks: monthlyMarks, yearly_marks: yearlyMarks };
    }

    document.getElementById('sub-edit-id').value = s.id;
    document.getElementById('sub-class-select').value = s.class_id;
    updateSubjectNameOptions();

    const nameSelect = document.getElementById('sub-name-select');
    const customWrap = document.getElementById('sub-custom-name-wrap');
    const customInput = document.getElementById('sub-custom-name-input');
    const customErr = document.getElementById('sub-custom-error');
    if (customErr) customErr.textContent = '';

    const matchingOption = Array.from(nameSelect.options).find(opt => opt.value === s.subject_name && opt.value !== '__custom__');
    if (matchingOption) {
        nameSelect.value = s.subject_name;
        customWrap.style.display = 'none';
        if (customInput) customInput.value = '';
    } else {
        nameSelect.value = '__custom__';
        customWrap.style.display = 'block';
        if (customInput) customInput.value = s.subject_name;
    }

    document.getElementById('sub-seq-input').value = s.sequence_order;
    document.getElementById('sub-monthly-input').value = s.monthly_marks || '';
    document.getElementById('sub-yearly-input').value = s.yearly_marks || '';
    document.getElementById('btn-add-subject').textContent = 'Update Subject';
    document.getElementById('btn-cancel-subject').style.display = 'inline-block';
    const details = document.getElementById('subject-details');
    if (details) details.open = true;
};

function resetSubjectForm() {
    document.getElementById('sub-edit-id').value = '';
    document.getElementById('sub-seq-input').value = '1';
    document.getElementById('sub-monthly-input').value = '';
    document.getElementById('sub-yearly-input').value = '';
    const customInput = document.getElementById('sub-custom-name-input');
    if (customInput) customInput.value = '';
    const customWrap = document.getElementById('sub-custom-name-wrap');
    if (customWrap) customWrap.style.display = 'none';
    const customErr = document.getElementById('sub-custom-error');
    if (customErr) customErr.textContent = '';
    updateSubjectNameOptions();
    document.getElementById('btn-add-subject').textContent = 'Save Subject';
    document.getElementById('btn-cancel-subject').style.display = 'none';
}

document.getElementById('btn-add-subject').addEventListener('click', async () => {
    const editId = document.getElementById('sub-edit-id').value;
    const class_id = document.getElementById('sub-class-select').value;
    const nameSelectValue = document.getElementById('sub-name-select').value;
    let subject_name = '';

    if (nameSelectValue === '__custom__') {
        const customInput = document.getElementById('sub-custom-name-input');
        subject_name = (customInput ? customInput.value : '').trim();
        if (!subject_name) {
            const errEl = document.getElementById('sub-custom-error');
            if (errEl) errEl.textContent = 'Please enter custom subject name';
            if (customInput) customInput.focus();
            return alert("Please enter the custom subject name!");
        }
    } else {
        subject_name = nameSelectValue.trim();
        if (!subject_name) {
            return alert("Pick a subject from the list first!");
        }
    }

    const sequence_order = document.getElementById('sub-seq-input').value || 1;
    const monthly_marks = document.getElementById('sub-monthly-input').value || null;
    const yearly_marks = document.getElementById('sub-yearly-input').value || null;

    const payload = { class_id, subject_name, sequence_order, monthly_marks, yearly_marks };
    const res = editId
        ? await ipcRenderer.invoke('update-subject', { ...payload, id: editId })
        : await ipcRenderer.invoke('add-subject', payload);

    if (res.success) {
        resetSubjectForm();
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
let selectedStudentClassFilter = '';

function renderStudentClassFilterChips(classes = allClassesForStudents) {
    const container = document.getElementById('student-class-filter-buttons');
    if (!container) return;
    container.innerHTML = '';

    const list = classes || [];

    // Reset filter if previous class was removed
    if (selectedStudentClassFilter && !list.some(c => String(c.id) === String(selectedStudentClassFilter))) {
        selectedStudentClassFilter = '';
    }

    const filterSelect = document.getElementById('filter-student-class');
    if (filterSelect) filterSelect.value = selectedStudentClassFilter;

    // "All Classes" chip
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'chip-btn' + (!selectedStudentClassFilter ? ' active' : '');
    allBtn.textContent = 'All Classes';
    allBtn.addEventListener('click', () => {
        selectedStudentClassFilter = '';
        if (filterSelect) filterSelect.value = '';
        renderStudentClassFilterChips(list);
        loadStudents();
    });
    container.appendChild(allBtn);

    // Individual class chips
    list.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn' + (String(c.id) === String(selectedStudentClassFilter) ? ' active' : '');
        btn.textContent = c.class_name;
        btn.addEventListener('click', () => {
            if (String(selectedStudentClassFilter) === String(c.id)) {
                selectedStudentClassFilter = '';
            } else {
                selectedStudentClassFilter = String(c.id);
            }
            if (filterSelect) filterSelect.value = selectedStudentClassFilter;
            renderStudentClassFilterChips(list);
            loadStudents();
        });
        container.appendChild(btn);
    });
}

async function loadStudentsPage() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    allClassesForStudents = classes;

    // Setup class options for filters and enrollment form forms
    const filterClass = document.getElementById('filter-student-class');
    const formClass = document.getElementById('st-class');

    const optionsHtml = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    if (filterClass) {
        filterClass.innerHTML = `<option value="">All Classes</option>` + optionsHtml;
        filterClass.value = selectedStudentClassFilter;
    }
    formClass.innerHTML = optionsHtml;

    renderStudentClassFilterChips(classes);

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


// --- CLASS ROLL FIELD: manual digits only, padded to 2 digits (2 -> 02) ---
// The database still stores the roll as a plain number (2), so sorting and
// duplicate checks are unaffected. Padding is only for display.
function formatRoll(roll) {
    const n = parseInt(roll, 10);
    if (Number.isNaN(n)) return '';
    return String(n).padStart(2, '0');
}

(function setupRollInput() {
    const rollInput = document.getElementById('st-roll');
    if (!rollInput) return;
    rollInput.addEventListener('input', () => {
        rollInput.value = rollInput.value.replace(/[^0-9]/g, '');
    });
    rollInput.addEventListener('blur', () => {
        rollInput.value = formatRoll(rollInput.value);
    });
})();


// --- STUDENT LIST: Current / Graduated / Dropped Out views ---
// The three small tabs above the table decide which students are listed
// and which columns and buttons each row gets.
let currentStudentView = 'Active';   // 'Active' | 'Graduated' | 'Removed'
let studentListCache = [];           // the rows currently on screen (used by the row buttons)

const STUDENT_VIEW_HEADERS = {
    Active: ['Roll', 'Name', 'Class', 'Guardian Contact', 'Management Actions'],
    Graduated: ['Roll', 'Name', 'Last Class', 'Guardian Contact', 'Graduated On', 'Actions'],
    Removed: ['Roll', 'Name', 'Last Class', 'Guardian Contact', 'Dropped Out On', 'Reason', 'Actions']
};

const STUDENT_BTN_STYLE = 'padding:4px 8px; font-size:11px; width:auto; display:inline-block; margin-right:4px; ';

// "2026-03-05 14:20:11" -> "05-03-2026" (blank for old records with no date)
function formatHistoryDate(text) {
    if (!text) return '—';
    const parts = String(text).slice(0, 10).split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '—';
}

function studentRowHtml(s, view) {
    const editBtn = `<button onclick="editStudentById(${s.id})" style="${STUDENT_BTN_STYLE}background:#2563eb;">✏️ Edit</button>`;
    let html = `
        <td>${formatRoll(s.roll)}</td>
        <td><b>${escapeHtml(s.name || '')}</b></td>
        <td>${escapeHtml(s.class_name || '')}</td>
        <td>${escapeHtml(s.guardian_contact || '')}</td>`;

    if (view === 'Active') {
        const isTen = (s.class_name || '').startsWith('Class Ten');
        const mainBtn = isTen
            ? `<button onclick="graduateStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#10b981;">🎓 Graduate</button>`
            : `<button onclick="promoteStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#0ea5e9;">⬆️ Promote</button>`;
        const dropBtn = `<button onclick="dropOutStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#ef4444;">❌ Drop Out</button>`;
        html += `<td>${editBtn}${mainBtn}${dropBtn}</td>`;
    } else {
        const reinstateBtn = `<button onclick="reinstateStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#f59e0b;">↩️ Reinstate</button>`;
        html += `<td>${formatHistoryDate(s.status_date)}</td>`;
        if (view === 'Removed') html += `<td>${escapeHtml(s.removal_cause || '')}</td>`;
        html += `<td>${editBtn}${reinstateBtn}</td>`;
    }
    return `<tr>${html}</tr>`;
}

// Re-fetches students from the database using the selected view (tab)
// and class filter, then redraws the table header and rows.
window.loadStudents = async function () {
    const filterSelect = document.getElementById('filter-student-class');
    const class_id = filterSelect ? filterSelect.value : selectedStudentClassFilter;
    const view = currentStudentView;

    const students = await ipcRenderer.invoke('get-students', { class_id, status: view });
    studentListCache = students;

    const headers = STUDENT_VIEW_HEADERS[view];
    document.getElementById('student-table-head-row').innerHTML = headers.map(h => `<th>${h}</th>`).join('');

    const tbody = document.getElementById('student-table-body');
    if (!students.length) {
        const emptyText = { Active: 'No current students match this filter.', Graduated: 'No graduated students yet.', Removed: 'No dropped-out students.' }[view];
        tbody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align:center; color:#64748b; padding:20px;">${emptyText}</td></tr>`;
        return;
    }
    tbody.innerHTML = students.map(s => studentRowHtml(s, view)).join('');
};

// Switching the Current / Graduated / Dropped Out tabs
document.querySelectorAll('#student-view-tabs .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentStudentView = btn.dataset.view;
        document.querySelectorAll('#student-view-tabs .chip-btn').forEach(b => {
            b.classList.toggle('active', b === btn);
        });
        loadStudents();
    });
});

// Fills the enrollment form with a student's data so it can be edited.
// --- Extra fields shown when editing a Graduated or Dropped Out student ---
let editingArchiveStatus = null;   // null | 'Graduated' | 'Removed'

function hideArchiveFields() {
    editingArchiveStatus = null;
    document.getElementById('st-archive-fields').style.display = 'none';
    document.getElementById('st-status-date').value = '';
    document.getElementById('st-removal-cause').value = '';
}

function showArchiveFields(s) {
    editingArchiveStatus = s.status;
    const graduated = s.status === 'Graduated';
    document.getElementById('st-archive-date-label').textContent = graduated ? 'Graduation Date' : 'Drop Out Date';
    document.getElementById('st-archive-cause-wrap').style.display = graduated ? 'none' : 'block';
    document.getElementById('st-status-date').value = s.status_date ? String(s.status_date).slice(0, 10) : '';
    document.getElementById('st-removal-cause').value = graduated ? '' : (s.removal_cause || '');
    document.getElementById('st-archive-fields').style.display = 'grid';
}

document.getElementById('btn-cancel-student').addEventListener('click', hideArchiveFields);

// Fills the enrollment form with a student's data so it can be edited.
// Graduated / Dropped Out students also get their date (and reason) fields.
window.editStudentFromRow = function (s) {
    editStudent(s.id, s.class_id, s.roll, s.name || '', s.blood_group || '', s.guardian_contact || '',
        s.address || '', s.dob || '', s.fathers_name || '', s.mothers_name || '', s.birth_reg_number || '');
    if (s.status === 'Graduated' || s.status === 'Removed') showArchiveFields(s);
    else hideArchiveFields();
};

// Edit button on a table row.
window.editStudentById = function (id) {
    const s = studentListCache.find(x => x.id === id);
    if (s) editStudentFromRow(s);
};

// "Register Student" button: gathers the enrollment form fields
// into one object and sends it to main.js to insert. Shows an
// alert with the exact database error if the save fails.
window.editStudent = async function (id, classId, roll, name, bloodGroup, guardianContact, address, dob, fathersName, mothersName, birthRegNumber) {
    document.getElementById('st-edit-id').value = id;
    document.getElementById('st-class').value = classId || '';
    document.getElementById('st-roll').value = formatRoll(roll);
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
        roll: parseInt(document.getElementById('st-roll').value, 10),
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

    if (!s.roll || !s.name) return alert("Roll and Name are required!");

    // Nine/Ten Main + Optional subject validation
    const cls = allClassesForStudents.find(c => String(c.id) === String(s.class_id));
    const pool = cls && MAIN_SUBJECT_POOLS[cls.class_name];
    let subjectSelections = null;
    if (pool && !editingArchiveStatus) {
        const mains = Array.from(document.querySelectorAll('.stu-main-checkbox:checked')).map(cb => cb.value);
        const optional = document.getElementById('stu-optional-select').value;
        if (mains.length !== 3 || !optional) {
            return alert("Please select exactly 3 Main subjects and 1 Optional subject.");
        }
        subjectSelections = mains.map(name => ({ subject_name: name, role: 'main' }))
            .concat([{ subject_name: optional, role: 'optional' }]);
    }

    const updateData = { ...s, id: editId };
    if (editId && editingArchiveStatus) {
        updateData.archive = {
            date: document.getElementById('st-status-date').value || '',
            cause: document.getElementById('st-removal-cause').value.trim()
        };
        if (editingArchiveStatus === 'Removed' && !updateData.archive.cause) {
            return alert('Please enter the reason for dropping out.');
        }
    }

    const res = editId
        ? await ipcRenderer.invoke('update-student', updateData)
        : await ipcRenderer.invoke('add-student', s);

    if (res.success) {
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
        hideArchiveFields();
        loadStudents();
    } else {
        console.error('save-student failed:', res.error);
        alert('Could not save student: ' + res.error);
    }
});

// --- STUDENT ACTIONS: Promote / Graduate / Drop Out / Reinstate ---

// Roll box inside the pop-up: digits only, padded to 2 digits (same as the enrollment form).
(function setupDialogRollInput() {
    const rollInput = document.getElementById('sam-roll');
    if (!rollInput) return;
    rollInput.addEventListener('input', () => {
        rollInput.value = rollInput.value.replace(/[^0-9]/g, '');
    });
    rollInput.addEventListener('blur', () => {
        rollInput.value = formatRoll(rollInput.value);
    });
})();

// One reusable pop-up for all four actions (Electron does not support prompt()).
//   cfg.title / cfg.message   text shown at the top
//   cfg.targets               [{id, label}] classes to choose from (dropdown shows only if 2+)
//   cfg.rollValue / rollLabel show a roll box, pre-filled with rollValue
//   cfg.rollHolders(roll, targetId)  optional async; returns the names of students who already
//                             use that roll, shown as a warning (it does not block saving)
//   cfg.askCause              show a required "reason" box
//   cfg.onConfirm(values)     async; must return {success, error?}. The pop-up stays open and
//                             shows the error if success is false.
//   cfg.onDone(values, res)   runs after a successful save
function showStudentDialog(cfg) {
    const $ = (id) => document.getElementById(id);
    const overlay = $('student-action-modal');
    const targetSel = $('sam-target');
    const rollInput = $('sam-roll');
    const causeInput = $('sam-cause');
    const confirmBtn = $('sam-confirm');
    const cancelBtn = $('sam-cancel');
    const warnEl = $('sam-warning');
    const targets = cfg.targets || [];
    const asksRoll = cfg.rollValue !== undefined;

    $('sam-title').textContent = cfg.title;
    $('sam-message').textContent = cfg.message;
    $('sam-error').textContent = '';
    warnEl.style.display = 'none';

    targetSel.innerHTML = '';
    targets.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.label;
        targetSel.appendChild(opt);
    });
    $('sam-target-row').style.display = targets.length > 1 ? 'block' : 'none';

    $('sam-roll-row').style.display = asksRoll ? 'block' : 'none';
    if (asksRoll) {
        $('sam-roll-label').textContent = cfg.rollLabel || 'Roll';
        rollInput.value = formatRoll(cfg.rollValue);
    }

    $('sam-cause-row').style.display = cfg.askCause ? 'block' : 'none';
    causeInput.value = '';

    confirmBtn.textContent = cfg.confirmText || 'Confirm';
    confirmBtn.style.background = cfg.confirmColor || '#2563eb';
    confirmBtn.disabled = false;

    // Warn (but never block) when the chosen roll is already used in the target class.
    let warnToken = 0;
    async function updateRollWarning() {
        warnEl.style.display = 'none';
        if (!asksRoll || !cfg.rollHolders) return;
        const roll = parseInt(rollInput.value, 10);
        if (!Number.isInteger(roll) || roll <= 0) return;
        const token = ++warnToken;
        const names = await cfg.rollHolders(roll, targets.length ? Number(targetSel.value) : null);
        if (token !== warnToken || !names || !names.length) return;
        warnEl.textContent = `Roll ${formatRoll(roll)} is already used by ${names.join(', ')} in that class. ` +
            `You can still continue, and a notification will remind you to fix it.`;
        warnEl.style.display = 'block';
    }
    rollInput.oninput = updateRollWarning;
    targetSel.onchange = updateRollWarning;

    const close = () => { overlay.style.display = 'none'; };
    cancelBtn.onclick = close;

    confirmBtn.onclick = async () => {
        const values = {
            target_id: targets.length ? Number(targetSel.value) : null,
            roll: parseInt(rollInput.value, 10),
            cause: causeInput.value.trim()
        };
        if (asksRoll && (!Number.isInteger(values.roll) || values.roll <= 0)) {
            $('sam-error').textContent = 'Enter a valid roll number.';
            return;
        }
        if (cfg.askCause && !values.cause) {
            $('sam-error').textContent = 'Please enter a reason.';
            return;
        }
        $('sam-error').textContent = '';
        confirmBtn.disabled = true;
        const res = await cfg.onConfirm(values);
        confirmBtn.disabled = false;
        if (res && res.success) {
            close();
            if (cfg.onDone) await cfg.onDone(values, res);
        } else {
            $('sam-error').textContent = (res && res.error) || 'Something went wrong.';
        }
    };

    // Enter confirms, Escape cancels
    overlay.onkeydown = (e) => {
        if (e.key === 'Enter' && !confirmBtn.disabled) { e.preventDefault(); confirmBtn.click(); }
        else if (e.key === 'Escape') close();
    };

    overlay.style.display = 'flex';
    (cfg.askCause ? causeInput : asksRoll ? rollInput : confirmBtn).focus();
    updateRollWarning();
}

// Looks up a student on screen by id (the row buttons only carry the id).
function studentOnScreen(id) {
    return studentListCache.find(x => x.id === id);
}

// "Promote" button (Play to Class Nine).
window.promoteStudent = async function (id) {
    const info = await ipcRenderer.invoke('get-promotion-targets', id);
    if (!info || !info.success) return alert((info && info.error) || 'Could not promote this student.');
    const st = info.student;
    const fromEight = st.class_name === 'Class Eight';

    let message = `${st.name} is in ${st.class_name}. ` + (info.targets.length > 1
        ? 'Choose the group they are moving into.'
        : `They will move to ${info.targets[0].class_name}.`);
    if (fromEight) message += ' Next you will set their Main and Optional subjects.';

    showStudentDialog({
        title: 'Promote Student',
        message,
        targets: info.targets.map(t => ({ id: t.id, label: t.class_name })),
        rollLabel: 'Roll in the new class',
        rollValue: st.roll,
        rollHolders: (roll, targetId) => ipcRenderer.invoke('get-roll-holders', { class_id: targetId, roll, except_id: id }),
        confirmText: 'Promote',
        onConfirm: (v) => ipcRenderer.invoke('promote-student', { id, to_class_id: v.target_id, new_roll: v.roll }),
        onDone: async (v, res) => {
            await loadStudents();
            if (fromEight) {
                // Class Nine needs Main/Optional subjects, so open the Edit form right away.
                editStudentFromRow(res.student);
                document.getElementById('student-details').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
};

// "Graduate" button (Class Ten only).
window.graduateStudent = function (id) {
    const s = studentOnScreen(id);
    if (!s) return;
    showStudentDialog({
        title: 'Graduate Student',
        message: `${s.name} (${s.class_name}, roll ${formatRoll(s.roll)}) has completed Class Ten. They will move to the Graduated tab.`,
        confirmText: 'Graduate',
        confirmColor: '#10b981',
        onConfirm: () => ipcRenderer.invoke('graduate-student', { id }),
        onDone: () => loadStudents()
    });
};

// "Drop Out" button (any class). A reason is required.
window.dropOutStudent = function (id) {
    const s = studentOnScreen(id);
    if (!s) return;
    showStudentDialog({
        title: 'Drop Out Student',
        message: `${s.name} (${s.class_name}, roll ${formatRoll(s.roll)}) will leave the Current list and be kept in the Dropped Out tab.`,
        askCause: true,
        confirmText: 'Drop Out',
        confirmColor: '#ef4444',
        onConfirm: (v) => ipcRenderer.invoke('drop-out-student', { id, cause: v.cause }),
        onDone: () => loadStudents()
    });
};

// "Reinstate" button (Graduated and Dropped Out tabs).
window.reinstateStudent = function (id) {
    const s = studentOnScreen(id);
    if (!s) return;
    showStudentDialog({
        title: 'Reinstate Student',
        message: `${s.name} will return to ${s.class_name} as a current student.`,
        rollLabel: 'Roll',
        rollValue: s.roll,
        rollHolders: (roll) => ipcRenderer.invoke('get-roll-holders', { class_id: s.class_id, roll, except_id: id }),
        confirmText: 'Reinstate',
        confirmColor: '#f59e0b',
        onConfirm: (v) => ipcRenderer.invoke('reinstate-student', { id, new_roll: v.roll }),
        onDone: () => loadStudents()
    });
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
                <button onclick="editTeacher(${t.id}, '${(t.name || '').replace(/'/g, "\\'")}', '${(t.title || '').replace(/'/g, "\\'")}', '${(t.contact_number || '').replace(/'/g, "\\'")}', '${(t.blood_group || '').replace(/'/g, "\\'")}', '${(t.fathers_name || '').replace(/'/g, "\\'")}', '${(t.mothers_name || '').replace(/'/g, "\\'")}', '${(t.nid_number || '').replace(/'/g, "\\'")}')" style="padding:4px 8px; background:#2563eb; font-size:11px; width:auto; display:inline-block; margin-right:4px;">✏️ Edit</button>
                <button onclick="deleteTeacher(${t.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">🗑 Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

window.editTeacher = function (id, name, title, contact, bloodGroup, fathersName, mothersName, nid) {
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
    if (tabId === 'exams-tab') {
        showExamsHomeView();
        loadExamClassButtons();
    } else if (tabId === 'settings-school') {
        loadSchoolInfo();
    }
};


// ============================================================
// ALL MARKS VIEW — read-only matrix across all six exam types.
// ============================================================
const ALL_MARKS_EXAM_TYPES = [
    '1st Monthly Exam',
    '2nd Monthly Exam',
    'Half Yearly Exam',
    '3rd Monthly Exam',
    '4th Monthly Exam',
    'Yearly Exam'
];

let allMarksClasses = [];
let allMarksSelectedClassId = null;
let allMarksSelectedSubject = null;
let allMarksClassSubjects = [];

function showExamsHomeView() {
    document.getElementById('exams-home-view').style.display = 'block';
    document.getElementById('marks-view-page').style.display = 'none';
    document.getElementById('transcript-page').style.display = 'none';
}

function clearAllMarksResults(message = 'Select a class and subject to view marks.') {
    document.getElementById('marks-view-status').textContent = message;
    document.getElementById('marks-view-table-wrap').innerHTML = '';
}

async function openAllMarksView() {
    document.getElementById('exams-home-view').style.display = 'none';
    document.getElementById('marks-view-page').style.display = 'block';

    if (!allMarksClasses.length) {
        allMarksClasses = await ipcRenderer.invoke('get-classes-list');
    }

    allMarksSelectedClassId = null;
    allMarksSelectedSubject = null;
    allMarksClassSubjects = [];

    renderAllMarksClassButtons();
    document.getElementById('marks-view-subject-section').style.display = 'none';
    document.getElementById('marks-view-subject-buttons').innerHTML = '';
    clearAllMarksResults();
}

function renderAllMarksClassButtons() {
    const container = document.getElementById('marks-view-class-buttons');
    container.innerHTML = '';

    allMarksClasses.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn' + (String(c.id) === String(allMarksSelectedClassId) ? ' active' : '');
        btn.textContent = c.class_name;
        btn.addEventListener('click', () => selectAllMarksClass(c.id));
        container.appendChild(btn);
    });
}

async function selectAllMarksClass(classId) {
    allMarksSelectedClassId = classId;
    allMarksSelectedSubject = null;
    renderAllMarksClassButtons();

    const subjectSection = document.getElementById('marks-view-subject-section');
    const subjectContainer = document.getElementById('marks-view-subject-buttons');
    subjectSection.style.display = 'block';
    subjectContainer.innerHTML = '';
    document.getElementById('marks-view-table-wrap').innerHTML = '';

    const subjects = await ipcRenderer.invoke('get-subjects');
    allMarksClassSubjects = subjects
        .filter(s => String(s.class_id) === String(classId))
        .sort((a, b) => (Number(a.sequence_order) || 0) - (Number(b.sequence_order) || 0) || a.id - b.id);

    allMarksClassSubjects.forEach(subject => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn';
        btn.textContent = subject.subject_name;
        btn.addEventListener('click', () => selectAllMarksSubject(subject));
        subjectContainer.appendChild(btn);
    });

    clearAllMarksResults(allMarksClassSubjects.length
        ? 'Now select a subject.'
        : 'No subjects are configured for this class.');
}

function selectAllMarksSubject(subject) {
    allMarksSelectedSubject = subject;

    document.querySelectorAll('#marks-view-subject-buttons .chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === subject.subject_name);
    });

    renderAllMarksView();
}

async function renderAllMarksView() {
    const year = document.getElementById('marks-view-year').value;
    const classId = allMarksSelectedClassId;
    const subject = allMarksSelectedSubject;
    const status = document.getElementById('marks-view-status');
    const wrap = document.getElementById('marks-view-table-wrap');

    if (!classId || !subject) {
        clearAllMarksResults(classId ? 'Now select a subject.' : 'Select a class and subject to view marks.');
        return;
    }

    const cls = allMarksClasses.find(c => String(c.id) === String(classId));
    status.textContent = 'Loading marks…';
    wrap.innerHTML = '';

    const result = await ipcRenderer.invoke('get-all-marks-view', {
        year, class_id: Number(classId), subject_id: subject.id
    });

    if (!result || !result.success) {
        status.textContent = (result && result.error) || 'Could not load marks.';
        return;
    }

    const byStudent = {};
    ALL_MARKS_EXAM_TYPES.forEach(type => { byStudent[type] = {}; });
    result.marks.forEach(row => {
        if (!ALL_MARKS_EXAM_TYPES.includes(row.exam_type) || !row.student_id) return;
        byStudent[row.exam_type][row.student_id] = row.is_present === 0 ? 'A' : String(row.marks_obtained);
    });

    const rows = result.students.map(st => {
        const cells = ALL_MARKS_EXAM_TYPES.map(type => byStudent[type][st.id] || '—');
        return `<tr><td>${formatRoll(st.roll)}</td><td>${escapeHtml(st.name)}</td>${cells.map(v => `<td class="marks-view-mark">${escapeHtml(v)}</td>`).join('')}</tr>`;
    }).join('');

    const className = cls ? cls.class_name : 'Class';
    status.textContent = `${className} — ${subject.subject_name} — ${year} (${result.students.length} active student${result.students.length === 1 ? '' : 's'})`;
    wrap.innerHTML = `
        <table class="marks-view-table">
            <thead><tr><th>Roll</th><th>Name</th>${ALL_MARKS_EXAM_TYPES.map(type => `<th>${escapeHtml(type.replace(' Exam', ''))}</th>`).join('')}</tr></thead>
            <tbody>${rows || '<tr><td colspan="8">No active students in this class.</td></tr>'}</tbody>
        </table>`;
}

document.getElementById('btn-open-marks-view').addEventListener('click', openAllMarksView);
document.getElementById('btn-back-marks-view').addEventListener('click', showExamsHomeView);
document.getElementById('marks-view-year').addEventListener('change', renderAllMarksView);




// ============================================================
// GENERATE TRANSCRIPT PAGE — V1.0.0 shell (Classes 6–8).
// Preview is a skeleton for now: names + subject rows, blank cells.
// ============================================================
const TRANSCRIPT_TESTS = {
    'Half Yearly': ['1st Monthly', '2nd Monthly', 'Half Yearly'],
    'Yearly': ['3rd Monthly', '4th Monthly', 'Yearly']
};
const TRANSCRIPT_V100_CLASSES = ['Class Six', 'Class Seven', 'Class Eight'];

let transcriptClasses = [];
let transcriptSelectedClassId = null;
let transcriptStudents = [];
let transcriptSubjects = [];
let transcriptHiddenColumns = new Set(['pct']);   // keys of unchecked columns (pct hidden by default)
let transcriptLoadToken = 0;               // ignores stale async loads
let transcriptMarksData = {};              // studentId -> subjectId -> { m1, m2, m3, total }
let transcriptHighestBySubject = {};       // subjectId -> max total marks across class
let cachedSchoolInfo = { name: 'The Cadet School & College (TCSAC)', address: '' };

const TRANSCRIPT_GRADING_SCALE = [
    { min: 79.5, letter: 'A+', point: '5.0' },
    { min: 69.5, letter: 'A', point: '4.0' },
    { min: 59.5, letter: 'A-', point: '3.5' },
    { min: 49.5, letter: 'B', point: '3.0' },
    { min: 39.5, letter: 'C', point: '2.0' },
    { min: 32.5, letter: 'D', point: '1.0' },
    { min: 0, letter: 'F', point: '0.0' }
];

function getGradeFromPercentage(pct) {
    if (typeof pct !== 'number' || Number.isNaN(pct)) return { letter: '-', point: '-' };
    for (const g of TRANSCRIPT_GRADING_SCALE) {
        if (pct >= g.min) return g;
    }
    return { letter: 'F', point: '0.0' };
}

function getGradeFromPoint(gp) {
    if (typeof gp !== 'number' || Number.isNaN(gp)) return { letter: '-', point: '-' };
    if (gp >= 5.0) return { letter: 'A+', point: '5.0' };
    if (gp >= 4.0) return { letter: 'A', point: '4.0' };
    if (gp >= 3.5) return { letter: 'A-', point: '3.5' };
    if (gp >= 3.0) return { letter: 'B', point: '3.0' };
    if (gp >= 2.0) return { letter: 'C', point: '2.0' };
    if (gp >= 1.0) return { letter: 'D', point: '1.0' };
    return { letter: 'F', point: '0.0' };
}

function getTranscriptColumns(test) {
    const isYearly = test === 'Yearly';
    const t1 = isYearly ? '3rd Monthly' : '1st Monthly';
    const t2 = isYearly ? '4th Monthly' : '2nd Monthly';
    const t3 = isYearly ? 'Yearly' : 'Half Yearly';
    const t1Html = isYearly ? '3rd<br>Monthly' : '1st<br>Monthly';
    const t2Html = isYearly ? '4th<br>Monthly' : '2nd<br>Monthly';
    const t3Html = isYearly ? 'Yearly' : 'Half<br>Yearly';

    return [
        { key: 'sn', label: 'S/N', headerHtml: 'S/N' },
        { key: 'subject', label: 'Subject', headerHtml: 'Subject' },
        { key: 'st', label: 'Full Marks', headerHtml: 'Full<br>Marks' },
        { key: 'high', label: 'Highest Marks', headerHtml: 'Highest<br>Marks' },
        { key: 'm1', label: t1, headerHtml: t1Html, marks: true },
        { key: 'm2', label: t2, headerHtml: t2Html, marks: true },
        { key: 'm3', label: t3, headerHtml: t3Html, marks: true },
        { key: 'total', label: 'Total', headerHtml: 'Total', marks: true },
        { key: 'pct', label: 'Percentage', headerHtml: 'Percentage' },
        { key: 'grade', label: 'Letter Grade', headerHtml: 'Letter<br>Grade' },
        { key: 'gp', label: 'Grade Points', headerHtml: 'Grade<br>Points' }
    ];
}

function openTranscriptPage() {
    document.getElementById('exams-home-view').style.display = 'none';
    document.getElementById('marks-view-page').style.display = 'none';
    document.getElementById('transcript-page').style.display = 'block';

    transcriptSelectedClassId = null;
    transcriptStudents = [];
    transcriptSubjects = [];
    transcriptHighestBySubject = {};
    document.getElementById('transcript-columns-section').style.display = 'none';
    const optionsSection = document.getElementById('transcript-options-section');
    if (optionsSection) optionsSection.style.display = 'none';
    const showAllTotalsCb = document.getElementById('transcript-show-all-exam-totals');
    if (showAllTotalsCb) showAllTotalsCb.checked = false;
    document.getElementById('btn-generate-transcript').style.display = 'none';
    document.getElementById('transcript-preview').innerHTML = '';
    document.getElementById('transcript-status').textContent = 'Select a class to preview transcripts.';

    ipcRenderer.invoke('get-classes-list').then(classes => {
        transcriptClasses = classes;
        renderTranscriptClassButtons();
    });
}

function renderTranscriptClassButtons() {
    const container = document.getElementById('transcript-class-buttons');
    container.innerHTML = '';
    transcriptClasses.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn' + (String(c.id) === String(transcriptSelectedClassId) ? ' active' : '');
        btn.textContent = c.class_name;
        btn.addEventListener('click', () => {
            transcriptSelectedClassId = c.id;
            renderTranscriptClassButtons();
            loadTranscriptPreview();
        });
        container.appendChild(btn);
    });
}

function renderTranscriptToggles() {
    const test = document.getElementById('transcript-test').value;
    const box = document.getElementById('transcript-column-toggles');
    box.innerHTML = '';
    getTranscriptColumns(test).forEach(col => {
        const label = document.createElement('label');
        label.className = 'transcript-toggle';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !transcriptHiddenColumns.has(col.key);
        cb.addEventListener('change', () => {
            if (cb.checked) transcriptHiddenColumns.delete(col.key);
            else transcriptHiddenColumns.add(col.key);
            paintTranscriptPreview();          // no re-fetch, just redraw
        });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(' ' + col.label));
        box.appendChild(label);
    });
}

function buildTranscriptTable(studentId) {
    const test = document.getElementById('transcript-test').value;
    const visible = getTranscriptColumns(test).filter(c => !transcriptHiddenColumns.has(c.key));
    const marksCols = visible.filter(c => c.marks);
    const marksCount = marksCols.length;
    const examCols = marksCols.filter(c => c.key !== 'total');
    const hasTotal = visible.some(c => c.key === 'total');
    const showAllExamTotals = document.getElementById('transcript-show-all-exam-totals')?.checked ?? false;

    let head1 = '', head2 = '', groupDone = false;
    visible.forEach(c => {
        if (c.marks) {
            if (!groupDone) { head1 += `<th colspan="${marksCount}">Marks Obtained</th>`; groupDone = true; }
            head2 += `<th>${c.headerHtml || escapeHtml(c.label)}</th>`;
        } else {
            head1 += `<th${marksCount ? ' rowspan="2"' : ''}>${c.headerHtml || escapeHtml(c.label)}</th>`;
        }
    });

    let totalMarksAgg = { m1: 0, m2: 0, m3: 0, total: 0, stotal: 0, pctSum: 0, pctCount: 0 };
    let totalGP = 0;
    let gpCount = 0;

    const body = transcriptSubjects.map((sub, i) => {
        const subMarks = transcriptMarksData[studentId]?.[sub.id] || { m1: '', m2: '', m3: '', total: null };

        if (typeof subMarks.m1 === 'number') totalMarksAgg.m1 += subMarks.m1;
        if (typeof subMarks.m2 === 'number') totalMarksAgg.m2 += subMarks.m2;
        if (typeof subMarks.m3 === 'number') totalMarksAgg.m3 += subMarks.m3;
        if (typeof subMarks.total === 'number') totalMarksAgg.total += subMarks.total;

        const stotal = (Number(sub.monthly_marks) || 0) * 2 + (Number(sub.yearly_marks) || 0);
        totalMarksAgg.stotal += stotal;

        let pct = '-';
        let rowGrade = { letter: '-', point: '-' };
        if (typeof subMarks.total === 'number' && stotal > 0) {
            const rawPct = (subMarks.total / stotal) * 100;
            pct = Math.round(rawPct);
            totalMarksAgg.pctSum += rawPct;
            totalMarksAgg.pctCount += 1;
            rowGrade = getGradeFromPercentage(rawPct);
            if (rowGrade.point !== '-') {
                totalGP += parseFloat(rowGrade.point);
                gpCount += 1;
            }
        }

        const highVal = transcriptHighestBySubject[sub.id];

        const cells = visible.map(c => {
            if (c.key === 'sn') return `<td class="sn">${String(i + 1).padStart(2, '0')}</td>`;
            if (c.key === 'subject') return `<td class="subject transcript-subject">${escapeHtml(sub.subject_name)}</td>`;
            if (c.key === 'st') return `<td>${stotal > 0 ? stotal : '-'}</td>`;
            if (c.key === 'high') return `<td>${highVal !== null && highVal !== undefined ? highVal : '-'}</td>`;
            if (c.key === 'm1') return `<td>${subMarks.m1 !== '' ? subMarks.m1 : '-'}</td>`;
            if (c.key === 'm2') return `<td>${subMarks.m2 !== '' ? subMarks.m2 : '-'}</td>`;
            if (c.key === 'm3') return `<td>${subMarks.m3 !== '' ? subMarks.m3 : '-'}</td>`;
            if (c.key === 'total') return `<td class="total">${subMarks.total !== null ? subMarks.total : '-'}</td>`;
            if (c.key === 'grade') return `<td>${rowGrade.letter}</td>`;
            if (c.key === 'gp') return `<td>${rowGrade.point}</td>`;
            if (c.key === 'pct') return `<td>${pct !== '-' ? pct + '%' : '-'}</td>`;
            return '<td></td>';
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const leadCount = visible.filter(c => c.key === 'sn' || c.key === 'subject').length;
    let tfootCells = leadCount ? `<td colspan="${leadCount}">Total</td>` : '';

    if (visible.some(c => c.key === 'st')) {
        tfootCells += `<td>${totalMarksAgg.stotal > 0 ? totalMarksAgg.stotal : '-'}</td>`;
    }
    if (visible.some(c => c.key === 'high')) {
        tfootCells += `<td>-</td>`;
    }

    if (showAllExamTotals) {
        marksCols.forEach(c => {
            if (c.key === 'm1') tfootCells += `<td>${totalMarksAgg.m1}</td>`;
            else if (c.key === 'm2') tfootCells += `<td>${totalMarksAgg.m2}</td>`;
            else if (c.key === 'm3') tfootCells += `<td>${totalMarksAgg.m3}</td>`;
            else if (c.key === 'total') tfootCells += `<td class="total">${totalMarksAgg.total}</td>`;
        });
    } else {
        if (examCols.length > 0) {
            tfootCells += `<td colspan="${examCols.length}" class="transcript-obtained-label">Obtained Marks &amp; GPA</td>`;
        }
        if (hasTotal) {
            tfootCells += `<td class="total">${totalMarksAgg.total}</td>`;
        }
    }

    const gpa = gpCount > 0 ? (totalGP / gpCount) : null;
    const overallGrade = gpa !== null ? getGradeFromPoint(gpa) : { letter: '-', point: '-' };

    if (visible.some(c => c.key === 'pct')) {
    const avgPct = totalMarksAgg.pctCount > 0 ? Math.round(totalMarksAgg.pctSum / totalMarksAgg.pctCount) : '-';
    tfootCells += `<td>${avgPct !== '-' ? avgPct + '%' : '-'}</td>`;
    }
    if (visible.some(c => c.key === 'grade')) {
        tfootCells += `<td>${overallGrade.letter}</td>`;
    }
    if (visible.some(c => c.key === 'gp')) {
        tfootCells += `<td>${gpa !== null ? gpa.toFixed(2) : '-'}</td>`;
    }

    return `<table class="marks transcript-table">
        <thead><tr>${head1}</tr>${marksCount ? `<tr>${head2}</tr>` : ''}</thead>
        <tbody>${body}</tbody>
        <tfoot><tr>${tfootCells}</tr></tfoot>
    </table>`;
}

function getStudentGroup(cls) {
    if (!cls || !cls.class_name) return 'N/A';
    const name = cls.class_name.toLowerCase();
    if (name.includes('nine') || name.includes('ten') || name.includes('9') || name.includes('10')) {
        if (name.includes('science')) return 'Science';
        if (name.includes('humanities')) return 'Humanities';
        if (name.includes('commerce') || name.includes('business')) return 'Business Studies';
        if (cls.department) return cls.department;
    }
    return 'N/A';
}

function formatTranscriptClassName(cls) {
    if (!cls || !cls.class_name) return '';
    let name = cls.class_name.replace(/\s*\([^)]*\)/g, '').trim();
    return name.replace(/^Class\s+/i, '').toUpperCase();
}

function paintTranscriptPreview() {
    const preview = document.getElementById('transcript-preview');
    if (!transcriptStudents.length) { preview.innerHTML = ''; return; }
    const year = document.getElementById('transcript-year').value;
    const test = document.getElementById('transcript-test').value;
    const cls = transcriptClasses.find(c => String(c.id) === String(transcriptSelectedClassId));
    const groupName = getStudentGroup(cls);
    const classNameFormatted = formatTranscriptClassName(cls);

    const schoolName = cachedSchoolInfo?.name || '';
    const schoolAddress = cachedSchoolInfo?.address || '';

    preview.innerHTML = transcriptStudents.map(st => `
        <div class="transcript-page">
            <div class="transcript-header-top">
                <div class="transcript-inst-header">
                    ${schoolName ? `<div class="transcript-inst-name">${escapeHtml(schoolName)}</div>` : ''}
                    ${schoolAddress ? `<div class="transcript-inst-address">${escapeHtml(schoolAddress)}</div>` : ''}
                    <div class="transcript-logo-wrap"><img src="sample data/TCSAC_logo.png" class="transcript-inst-logo" alt="School Logo" onerror="this.style.display='none'"></div>
                </div>
                <div class="transcript-grade-scale-box">
                    <table class="transcript-grade-scale-table">
                        <thead>
                            <tr><th>Range of Marks</th><th>Letter Grade</th><th>Grade Point</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>80 - 100%</td><td>A+</td><td>5.0</td></tr>
                            <tr><td>70 - 79%</td><td>A</td><td>4.0</td></tr>
                            <tr><td>60 - 69%</td><td>A-</td><td>3.5</td></tr>
                            <tr><td>50 - 59%</td><td>B</td><td>3.0</td></tr>
                            <tr><td>40 - 49%</td><td>C</td><td>2.0</td></tr>
                            <tr><td>33 - 39%</td><td>D</td><td>1.0</td></tr>
                            <tr><td>00 - 32%</td><td>F</td><td>0.0</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="transcript-title-wrap">
                <span class="transcript-main-title">ACADEMIC TRANSCRIPT</span>
            </div>

            <div class="transcript-info-section">
                <div class="transcript-info-col transcript-info-col-left">
                    <div class="transcript-info-row"><span class="info-label">Student's Name</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(st.name || '-').toUpperCase()}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Father's Name</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(st.fathers_name || st.father_name || '-').toUpperCase()}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Mother's Name</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(st.mothers_name || st.mother_name || '-').toUpperCase()}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Class</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(classNameFormatted)}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Roll No</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(String(st.roll))}</span></div>
                </div>
                <div class="transcript-info-col transcript-info-col-right">
                    <div class="transcript-info-row"><span class="info-label">Exam</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(test).toUpperCase()}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Year/Session</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(String(year))}</span></div>
                    <div class="transcript-info-row"><span class="info-label">Group</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(groupName).toUpperCase()}</span></div>
                </div>
            </div>

            <div class="transcript-table-wrap">
                ${buildTranscriptTable(st.id)}
            </div>
        </div>`).join('');
}

async function loadTranscriptPreview() {
    const status = document.getElementById('transcript-status');
    const generateBtn = document.getElementById('btn-generate-transcript');
    const columnsSection = document.getElementById('transcript-columns-section');
    const optionsSection = document.getElementById('transcript-options-section');
    const preview = document.getElementById('transcript-preview');

    const year = parseInt(document.getElementById('transcript-year').value, 10);
    const test = document.getElementById('transcript-test').value;
    const cls = transcriptClasses.find(c => String(c.id) === String(transcriptSelectedClassId));

    generateBtn.style.display = 'none';
    columnsSection.style.display = 'none';
    if (optionsSection) optionsSection.style.display = 'none';
    preview.innerHTML = '';
    transcriptStudents = [];
    transcriptSubjects = [];

    if (!cls) { status.textContent = 'Select a class to preview transcripts.'; return; }
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        status.textContent = 'Enter a valid year between 2000 and 2100.';
        return;
    }
    if (!TRANSCRIPT_V100_CLASSES.includes(cls.class_name)) {
        status.textContent = `The transcript template for ${cls.class_name} is not available yet (V1.0.0 covers Classes 6–8).`;
        return;
    }

    const token = ++transcriptLoadToken;
    status.textContent = 'Loading students...';

    try {
        const [students, allSubjects, schoolInfo] = await Promise.all([
            ipcRenderer.invoke('get-students', { class_id: cls.id, status: 'Active' }).catch(err => {
                console.error('Failed to get students:', err);
                return [];
            }),
            ipcRenderer.invoke('get-subjects').catch(err => {
                console.error('Failed to get subjects:', err);
                return [];
            }),
            ipcRenderer.invoke('get-school-info').catch(err => {
                console.warn('Failed to get school info:', err);
                return cachedSchoolInfo;
            })
        ]);
        if (schoolInfo) cachedSchoolInfo = schoolInfo;
        if (token !== transcriptLoadToken) return;

        transcriptStudents = (students || []).slice().sort((a, b) => a.roll - b.roll);
        transcriptSubjects = (allSubjects || [])
            .filter(s => String(s.class_id) === String(cls.id))
            .sort((a, b) => (Number(a.sequence_order) || 0) - (Number(b.sequence_order) || 0) || a.id - b.id);

        if (!transcriptStudents.length) { status.textContent = `No active students in ${cls.class_name}.`; return; }
        if (!transcriptSubjects.length) { status.textContent = `No subjects are configured for ${cls.class_name}.`; return; }

        status.textContent = 'Loading marks...';

        const [t1, t2, t3] = TRANSCRIPT_TESTS[test] || TRANSCRIPT_TESTS['Half Yearly'];
        const transcriptExamTypes = [t1 + ' Exam', t2 + ' Exam', t3 + ' Exam'];

        const exams = await Promise.all(
            transcriptExamTypes.map(type => ipcRenderer.invoke('get-or-create-exam', { year, exam_type: type }))
        );

        const marksSheets = await Promise.all(
            exams.map(exam => ipcRenderer.invoke('get-marks-sheet', { class_id: cls.id, exam_id: exam.id }))
        );

        if (token !== transcriptLoadToken) return;

        transcriptMarksData = {};
        transcriptStudents.forEach(st => transcriptMarksData[st.id] = {});

        marksSheets.forEach((sheet, idx) => {
            const mKey = 'm' + (idx + 1);
            if (sheet && sheet.marks) {
                sheet.marks.forEach(m => {
                    if (!transcriptMarksData[m.student_id]) return;
                    if (!transcriptMarksData[m.student_id][m.subject_id]) {
                        transcriptMarksData[m.student_id][m.subject_id] = { m1: '', m2: '', m3: '', total: null };
                    }
                    const record = transcriptMarksData[m.student_id][m.subject_id];
                    if (m.is_present === 0) {
                        record[mKey] = 'A';
                    } else if (typeof m.marks_obtained === 'number') {
                        record[mKey] = m.marks_obtained;
                        record.total = (record.total === null ? 0 : record.total) + m.marks_obtained;
                    } else {
                        record[mKey] = '';
                    }
                });
            }
        });

        transcriptHighestBySubject = {};
        transcriptSubjects.forEach(sub => {
            let maxSubTotal = null;
            transcriptStudents.forEach(st => {
                const m = transcriptMarksData[st.id]?.[sub.id];
                if (m && typeof m.total === 'number') {
                    if (maxSubTotal === null || m.total > maxSubTotal) {
                        maxSubTotal = m.total;
                    }
                }
            });
            transcriptHighestBySubject[sub.id] = maxSubTotal;
        });

        status.textContent = `${cls.class_name} — ${test} Transcript — ${year} (${transcriptStudents.length} student${transcriptStudents.length === 1 ? '' : 's'}, one page each)`;
        columnsSection.style.display = 'block';
        if (optionsSection) optionsSection.style.display = 'block';
        generateBtn.style.display = 'inline-block';
        renderTranscriptToggles();
        paintTranscriptPreview();
    } catch (err) {
        console.error('Error in loadTranscriptPreview:', err);
        status.textContent = 'Error loading transcript preview: ' + err.message;
    }
}

document.getElementById('btn-open-transcript').addEventListener('click', openTranscriptPage);
document.getElementById('btn-back-transcript').addEventListener('click', showExamsHomeView);
document.getElementById('transcript-year').addEventListener('change', loadTranscriptPreview);
document.getElementById('transcript-test').addEventListener('change', loadTranscriptPreview);
const showAllExamTotalsEl = document.getElementById('transcript-show-all-exam-totals');
if (showAllExamTotalsEl) {
    showAllExamTotalsEl.addEventListener('change', () => {
        paintTranscriptPreview();
    });
}
document.getElementById('btn-generate-transcript').addEventListener('click', () => {
    document.getElementById('transcript-status').textContent = 'PDF generation will be added in the next step.';
});

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
            <span class="marks-roll">${formatRoll(st.roll)}</span>
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


// ============================================================
// NOTIFICATION CENTER (the bell button in the sidebar)
//   - New messages slide in at the bottom-right for a few seconds.
//   - Every message is kept in the bell's panel, newest on top.
//   - The red badge counts messages you have not opened yet.
//   - The panel closes with the x button, Escape, or a click anywhere outside it.
// Messages are created by main.js (for example the duplicate-roll check) and
// arrive through the 'notifications-changed' event.
// ============================================================
let notificationList = [];
let notificationsStarted = false;
const MAX_VISIBLE_TOASTS = 3;
const TOAST_SECONDS = 6;

// "2026-09-24 14:05:00" -> "5 min ago"
function notificationTimeAgo(text) {
    const t = new Date(String(text || '').replace(' ', 'T'));
    if (isNaN(t.getTime())) return '';
    const seconds = Math.round((Date.now() - t.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.round(hours / 24)} day(s) ago`;
}

function notificationPanelIsOpen() {
    return document.getElementById('notif-panel').classList.contains('open');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge');
    const unread = notificationList.filter(n => !n.is_read).length;
    badge.style.display = unread ? 'flex' : 'none';
    badge.textContent = unread > 99 ? '99+' : String(unread);
}

function renderNotificationPanel() {
    const list = document.getElementById('notif-list');
    list.innerHTML = '';
    if (!notificationList.length) {
        list.innerHTML = '<div class="notif-empty">No notifications</div>';
    }
    notificationList.forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item ' + n.severity + (n.is_read ? '' : ' unread');
        item.innerHTML = `<b>${escapeHtml(n.title)}</b>${escapeHtml(n.message)}<small>${escapeHtml(notificationTimeAgo(n.created_at))}</small>`;
        list.appendChild(item);
    });
    updateNotificationBadge();
}

async function refreshNotifications() {
    notificationList = await ipcRenderer.invoke('get-notifications');
    renderNotificationPanel();
}

// Everything on screen counts as read once the panel has been shown.
async function markNotificationsRead() {
    await ipcRenderer.invoke('mark-notifications-read');
    notificationList.forEach(n => { n.is_read = 1; });
    updateNotificationBadge();
}

async function openNotificationPanel() {
    const bell = document.getElementById('notif-bell');
    const panel = document.getElementById('notif-panel');
    const rect = bell.getBoundingClientRect();
    panel.style.top = (rect.bottom + 8) + 'px';
    panel.style.left = Math.max(8, rect.right - 340) + 'px';
    panel.classList.add('open');
    await refreshNotifications();     // shows the unread dots
    await markNotificationsRead();    // clears the badge; the dots go away next time
}

function closeNotificationPanel() {
    document.getElementById('notif-panel').classList.remove('open');
}

// A small pop-up that slides in, waits, then slides out to the right.
function showNotificationToast(n) {
    const wrap = document.getElementById('notif-toasts');
    while (wrap.children.length >= MAX_VISIBLE_TOASTS) wrap.removeChild(wrap.firstChild);

    const toast = document.createElement('div');
    toast.className = 'notif-toast ' + n.severity;
    toast.innerHTML = `<b>${escapeHtml(n.title)}</b>${escapeHtml(n.message)}`;
    wrap.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('in')));

    let timer;
    const dismiss = () => {
        toast.classList.remove('in');
        toast.classList.add('out');
        setTimeout(() => toast.remove(), 450);
    };
    const startTimer = () => { timer = setTimeout(dismiss, TOAST_SECONDS * 1000); };
    toast.addEventListener('mouseenter', () => clearTimeout(timer));   // hovering keeps it on screen
    toast.addEventListener('mouseleave', startTimer);
    startTimer();
}

// main.js says something changed: refresh, and slide in the brand-new messages.
ipcRenderer.on('notifications-changed', async (event, payload) => {
    await refreshNotifications();
    if (notificationPanelIsOpen()) await markNotificationsRead();
    ((payload && payload.newOnes) || []).forEach(showNotificationToast);
});

document.getElementById('notif-bell').addEventListener('click', (e) => {
    e.stopPropagation();
    if (notificationPanelIsOpen()) closeNotificationPanel();
    else openNotificationPanel();
});
document.getElementById('notif-close').addEventListener('click', closeNotificationPanel);
document.getElementById('notif-clear').addEventListener('click', async () => {
    await ipcRenderer.invoke('clear-notifications');
    await refreshNotifications();
});
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notif-panel');
    if (notificationPanelIsOpen() && !panel.contains(e.target)) closeNotificationPanel();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notificationPanelIsOpen()) closeNotificationPanel();
});

// Called once, right after a successful login.
async function startNotificationCenter() {
    if (notificationsStarted) return;
    notificationsStarted = true;
    await refreshNotifications();                      // existing messages: badge only, no pop-up
    await ipcRenderer.invoke('run-data-checks');       // new problems found now slide in
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
            // skip fields that are currently hidden (they cannot take focus)
            let next = null;
            for (let i = idx + 1; i < fields.length; i++) {
                if (fields[i].offsetParent !== null) { next = fields[i]; break; }
            }
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
const btnCancelSubject = document.getElementById('btn-cancel-subject');
if (btnCancelSubject) {
    btnCancelSubject.addEventListener('click', resetSubjectForm);
}

// ============================================================
// SCHOOL INFORMATION PROFILE (Settings -> School Info)
// ============================================================
async function loadSchoolInfo() {
    try {
        const info = await ipcRenderer.invoke('get-school-info');
        if (info) {
            cachedSchoolInfo = info;
            const nameEl = document.getElementById('school-name-input');
            const addrEl = document.getElementById('school-address-input');

            if (nameEl) nameEl.value = info.name || '';
            if (addrEl) addrEl.value = info.address || '';
        }
    } catch (err) {
        console.error('Error loading school info:', err);
    }
}

function setupSchoolInfoHandlers() {
    const btnSaveSchoolInfo = document.getElementById('btn-save-school-info');
    if (btnSaveSchoolInfo) {
        btnSaveSchoolInfo.addEventListener('click', async () => {
            const name = document.getElementById('school-name-input')?.value.trim() || '';
            const address = document.getElementById('school-address-input')?.value.trim() || '';
            const feedback = document.getElementById('school-info-feedback');

            const result = await ipcRenderer.invoke('save-school-info', {
                name, address
            });

            if (result && result.success) {
                cachedSchoolInfo = { name, address };
                if (feedback) {
                    feedback.style.color = '#10b981';
                    feedback.textContent = 'Configuration saved successfully!';
                    setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3000);
                }
                // If transcript is open, re-paint preview
                if (document.getElementById('transcript-page')?.style.display === 'block') {
                    paintTranscriptPreview();
                }
            } else {
                if (feedback) {
                    feedback.style.color = '#ef4444';
                    feedback.textContent = 'Error: ' + ((result && result.message) || 'Could not save.');
                }
            }
        });
    }
}

setupSchoolInfoHandlers();
loadSchoolInfo();