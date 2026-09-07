const { ipcRenderer } = require('electron');

// Get window elements
const setupScreen = document.getElementById('setup-screen');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

// On system boot: Ask the database if an admin account exists
window.addEventListener('DOMContentLoaded', async () => {
    const adminExists = await ipcRenderer.invoke('check-admin-exists');
    
    if (adminExists) {
        loginScreen.style.display = 'block';
    } else {
        setupScreen.style.display = 'block';
    }
});

// Handle saving setup credentials
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

// Handle Login Button Clicks
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

// --- LAYOUT NAVIGATION TAB SWITCHER ---
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

// --- STEP 4: CRUD MANAGEMENT OPERATORS ---

// Load data automatically when entering a database tab
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId) {
    originalSwitchTab(tabId);
    if (tabId === 'db-subjects') loadSubjectsPage();
    if (tabId === 'db-students') loadStudentsPage();
};

// --- SUBJECT MATRICES GENERATOR ---
async function loadSubjectsPage() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    const teachers = await ipcRenderer.invoke('get-teachers-list');
    
    // Populate select fields
    const classSelect = document.getElementById('sub-class-select');
    classSelect.innerHTML = classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    
    const teacherSelect = document.getElementById('sub-teacher-select');
    teacherSelect.innerHTML = `<option value="">No Teacher Allocated</option>` + 
        teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    renderSubjectsTable();
}

async function renderSubjectsTable() {
    const subjects = await ipcRenderer.invoke('get-subjects');
    const tbody = document.getElementById('subject-table-body');
    tbody.innerHTML = subjects.map(s => `
        <tr>
            <td><b>${s.class_name || 'Unassigned'}</b></td>
            <td>${s.teacher_name || '<i style="color:gray;">None Assigned</i>'}</td>
            <td>${s.subject_name}</td>
            <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">Row ${s.sequence_order}</span></td>
        </tr>
    `).join('');
}

document.getElementById('btn-add-subject').addEventListener('click', async () => {
    const class_id = document.getElementById('sub-class-select').value;
    const class_teacher_id = document.getElementById('sub-teacher-select').value || null;
    const subject_name = document.getElementById('sub-name-input').value.trim();
    const sequence_order = document.getElementById('sub-seq-input').value;

    if (!subject_name) return alert("Type a subject name first!");

    const res = await ipcRenderer.invoke('add-subject', { class_id, class_teacher_id, subject_name, sequence_order });
    if(res.success) {
        document.getElementById('sub-name-input').value = "";
        renderSubjectsTable();
    }
});

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
                ${s.status === 'Active' ? `
                    <button onclick="changeStudentStatus(${s.id}, 'Graduated', 'Graduated Program')" style="padding:4px 8px; background:#10b981; font-size:11px; width:auto; display:inline-block; margin-right:4px;">🎓 Graduate</button>
                    <button onclick="kickStudent(${s.id})" style="padding:4px 8px; background:#ef4444; font-size:11px; width:auto; display:inline-block;">❌ Drop Out</button>
                ` : `<small style="color:gray;">History Logged</small>`}
            </td>
        </tr>
    `).join('');
};

document.getElementById('btn-save-student').addEventListener('click', async () => {
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
    
    const res = await ipcRenderer.invoke('add-student', s);
    if(res.success) {
        document.getElementById('st-roll').value = "";
        document.getElementById('st-name').value = "";
        loadStudents();
    } else {
        console.error('add-student failed:', res.error);
        alert('Could not save student: ' + res.error);
    }
});

window.changeStudentStatus = async function(id, status, cause) {
    if(confirm(`Are you sure you want to alter this student status to ${status}?`)) {
        await ipcRenderer.invoke('remove-student-with-cause', { id, status, cause });
        loadStudents();
    }
};

window.kickStudent = function(id) {
    const cause = prompt("Enter cause of student removal/drop-out:");
    if (cause) changeStudentStatus(id, 'Removed', cause);
};

// --- STEP 5: EXAMS MODULE — MARKS ENTRY ---

let currentExam = null;
let currentClassId = null;

async function loadExamClassButtons() {
    const classes = await ipcRenderer.invoke('get-classes-list');
    const container = document.getElementById('exam-class-buttons');
    container.innerHTML = classes.map(c =>
        `<button class="nav-btn" style="background:#e2e8f0; color:#1e293b; width:auto; padding:8px 16px;" onclick="openMarksEntry(${c.id}, '${c.class_name.replace(/'/g, "\\'")}')">${c.class_name}</button>`
    ).join('');
}

const originalSwitchTabStep5 = window.switchTab;
window.switchTab = function (tabId) {
    originalSwitchTabStep5(tabId);
    if (tabId === 'exams-tab') loadExamClassButtons();
};

window.openMarksEntry = async function (classId, className) {
    const year = document.getElementById('exam-year').value;
    const exam_type = document.getElementById('exam-type-select').value;
    currentExam = await ipcRenderer.invoke('get-or-create-exam', { year, exam_type });
    currentClassId = classId;

    const sheet = await ipcRenderer.invoke('get-marks-sheet', { class_id: classId, exam_id: currentExam.id });
    renderMarksTable(className, sheet);
};

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