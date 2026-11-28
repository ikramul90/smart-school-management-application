// ============================================================
// RENDERER.JS — runs inside the app window itself (the UI side).
// Cannot touch the database directly — every data operation goes
// through ipcRenderer.invoke() to ask main.js to do it instead.
// ============================================================
const { ipcRenderer } = require('electron');

const ACTION_ICONS = {
    info: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    edit: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 10L14 6M2.49997 21.5L5.88434 21.124C6.29783 21.078 6.50457 21.055 6.69782 20.9925C6.86926 20.937 7.03242 20.8586 7.18286 20.7594C7.35242 20.6475 7.49951 20.5005 7.7937 20.2063L21 7C22.1046 5.89543 22.1046 4.10457 21 3C19.8954 1.89543 18.1046 1.89543 17 3L3.7937 16.2063C3.49952 16.5005 3.35242 16.6475 3.24061 16.8171C3.1414 16.9676 3.06298 17.1307 3.00748 17.3022C2.94493 17.4954 2.92195 17.7021 2.87601 18.1156L2.49997 21.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    delete: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    dropOut: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    graduate: `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10.0001V16.0112C5 16.3702 5 16.5496 5.05465 16.7081C5.10299 16.8482 5.18187 16.9759 5.28558 17.0817C5.40287 17.2015 5.5634 17.2818 5.88446 17.4423L11.2845 20.1423C11.5468 20.2735 11.678 20.3391 11.8156 20.3649C11.9375 20.3877 12.0625 20.3877 12.1844 20.3649C12.322 20.3391 12.4532 20.2735 12.7155 20.1423L18.1155 17.4423C18.4366 17.2818 18.5971 17.2015 18.7144 17.0817C18.8181 16.9759 18.897 16.8482 18.9453 16.7081C19 16.5496 19 16.3702 19 16.0112V10.0001M2 8.50006L11.6422 3.67895C11.7734 3.61336 11.839 3.58056 11.9078 3.56766C11.9687 3.55622 12.0313 3.55622 12.0922 3.56766C12.161 3.58056 12.2266 3.61336 12.3578 3.67895L22 8.50006L12.3578 13.3212C12.2266 13.3868 12.161 13.4196 12.0922 13.4325C12.0313 13.4439 11.9687 13.4439 11.9078 13.4325C11.839 13.4196 11.7734 13.3868 11.6422 13.3212L2 8.50006Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    reinstate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
};

function renderActionIcon(svgString) {
    return `<span style="width:13px; height:13px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">${svgString}</span>`;
}


// Grab references to the full-screen "views" of the app:
// activation & checking (first run only), setup (first run only), login, and the main dashboard.
const activationScreen = document.getElementById('activation-screen');
const activationCheckingScreen = document.getElementById('activation-checking-screen');
const setupScreen = document.getElementById('setup-screen');
const schoolSetupScreen = document.getElementById('school-setup-screen');
const academicSetupScreen = document.getElementById('academic-setup-screen');
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');


// ============================================================
// FIRST-TIME SETUP: REVERSE CALCULATION ACTIVATION ENGINE
// ============================================================
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const FULL_LICENSE_TEXT = "TCSAC Management Software";
const TRIAL_LICENSE_TEXT = "Trial Management Software";

// Pre-compute 32-bit XOR to ASCII lookup table (ASCII 0-255)
// S Formula: (ASCII * 1664525 + 1013904223) >>> 0
// K Formula: (S + 45294729) >>> 0
// XOR: (S ^ K) >>> 0
const XOR_TO_ASCII = new Map();
for (let ascii = 0; ascii <= 255; ascii++) {
    const s = (1664525 * ascii + 1013904223) >>> 0;
    const k = (s + 45294729) >>> 0;
    const xorVal = (s ^ k) >>> 0;
    XOR_TO_ASCII.set(xorVal, ascii);
}

function base32ToBytes(base32) {
    const clean = base32.toUpperCase().replace(/[\s-]+/g, "").replace(/=+$/, "");
    if (!clean) throw new Error("Please enter an activation code.");

    let bits = 0;
    let value = 0;
    const bytes = [];

    for (let i = 0; i < clean.length; i++) {
        const idx = BASE32_ALPHABET.indexOf(clean[i]);
        if (idx === -1) {
            throw new Error("Invalid character detected in activation code.");
        }
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return bytes;
}

function decodeActivationCode(code) {
    const bytes = base32ToBytes(code);
    if (bytes.length === 0 || bytes.length % 4 !== 0) {
        throw new Error("Invalid activation code length.");
    }

    let decodedText = "";
    for (let i = 0; i < bytes.length; i += 4) {
        const xorVal =
            ((bytes[i] << 24) |
                (bytes[i + 1] << 16) |
                (bytes[i + 2] << 8) |
                bytes[i + 3]) >>> 0;

        if (!XOR_TO_ASCII.has(xorVal)) {
            throw new Error("Activation code is corrupted or unrecognized.");
        }
        decodedText += String.fromCharCode(XOR_TO_ASCII.get(xorVal));
    }
    return decodedText;
}

let activationCheckInterval = null;
let currentVerifiedLicenseType = 'trial';
let appLicenseStatus = { isTrial: true, license_type: 'trial' };

async function refreshLicenseStatus() {
    try {
        const res = await ipcRenderer.invoke('get-license-status');
        if (res && res.success) {
            appLicenseStatus = res;
        }
    } catch (err) {
        console.warn('Could not fetch license status:', err);
    }
    updateTrialUiIndicators();
}

function updateTrialUiIndicators() {
    const isTrial = !!(appLicenseStatus && appLicenseStatus.isTrial);
    const isExpired = !!(appLicenseStatus && appLicenseStatus.isTrialExpired);

    const pill = document.getElementById('home-trial-pill');
    if (pill) {
        if (!isTrial) {
            pill.style.display = 'none';
        } else if (isExpired) {
            pill.style.display = 'inline-flex';
            pill.style.backgroundColor = '#fee2e2';
            pill.style.borderColor = '#ef4444';
            pill.style.color = '#b91c1c';
            pill.textContent = 'Trial Expired (Locked)';
        } else {
            pill.style.display = 'inline-flex';
            pill.style.backgroundColor = '#fef3c7';
            pill.style.borderColor = '#f59e0b';
            pill.style.color = '#b45309';
            const remainingHours = appLicenseStatus.remainingHours;
            if (typeof remainingHours === 'number' && remainingHours > 0) {
                pill.textContent = `Trial Version (${remainingHours}h left)`;
            } else {
                pill.textContent = 'Trial Version (2 Days)';
            }
        }
    }

    const expiredCard = document.getElementById('home-trial-expired');
    const normalContent = document.getElementById('home-normal-content');
    const navButtons = document.querySelectorAll('.dashboard-sidebar-nav .nav-btn');
    const notifBell = document.getElementById('notif-bell');

    if (isExpired) {
        // Show expired message card in the dashboard
        if (expiredCard) expiredCard.style.display = 'block';
        // Close/hide all normal dashboard things (cards, charts)
        if (normalContent) normalContent.style.display = 'none';

        // Close/disable all navigation buttons except Home
        navButtons.forEach(btn => {
            const tab = btn.getAttribute('data-tab');
            if (tab && tab !== 'home-tab') {
                btn.classList.add('nav-btn-locked');
                btn.disabled = true;
                btn.title = 'All other modules are closed because the trial version has expired. Please make payment to get the real version.';
            } else if (tab === 'home-tab') {
                btn.classList.add('active');
            }
        });

        if (notifBell) {
            notifBell.disabled = true;
            notifBell.style.pointerEvents = 'none';
            notifBell.style.opacity = '0.35';
        }

        // Force visible tab to be home-tab and hide all other tabs
        const allTabs = document.querySelectorAll('.dashboard-main .tab-content');
        allTabs.forEach(t => {
            if (t.id === 'home-tab') {
                t.style.display = 'block';
            } else {
                t.style.display = 'none';
            }
        });
    } else {
        // Normal trial or full version
        if (expiredCard) expiredCard.style.display = 'none';
        if (normalContent) normalContent.style.display = 'block';

        navButtons.forEach(btn => {
            btn.classList.remove('nav-btn-locked');
            btn.disabled = false;
            btn.removeAttribute('title');
        });

        if (notifBell) {
            notifBell.disabled = false;
            notifBell.style.pointerEvents = 'auto';
            notifBell.style.opacity = '1';
        }
    }

    const genBtn = document.getElementById('btn-generate-transcript');
    if (genBtn) {
        if (isTrial) {
            genBtn.classList.add('btn-trial-disabled');
            genBtn.title = isExpired ? 'Software is locked (Trial Expired).' : 'PDF generation is disabled in Trial Version.';
            genBtn.textContent = '📄 Generate PDF (Disabled in Trial Version)';
        } else {
            genBtn.classList.remove('btn-trial-disabled');
            genBtn.title = 'Export all displayed transcripts as a single PDF document';
            genBtn.textContent = '📄 Generate Transcripts PDF';
        }
    }
}

let trialExpiredActionsInitialized = false;
function setupTrialExpiredActions() {
    if (trialExpiredActionsInitialized) return;
    trialExpiredActionsInitialized = true;

    const btnActivate = document.getElementById('btn-trial-activate-full');
    const inputKey = document.getElementById('trial-expired-key-input');
    const errEl = document.getElementById('trial-expired-error');
    const successEl = document.getElementById('trial-expired-success');
    const btnCloseApp = document.getElementById('btn-trial-close-app');

    if (btnCloseApp) {
        btnCloseApp.addEventListener('click', async () => {
            await ipcRenderer.invoke('quit-app');
        });
    }

    if (btnActivate && inputKey) {
        const handleFullActivation = async () => {
            if (errEl) {
                errEl.innerText = '';
                errEl.style.display = 'none';
            }
            if (successEl) {
                successEl.innerText = '';
                successEl.style.display = 'none';
            }

            const rawCode = inputKey.value.trim();
            if (!rawCode) {
                if (errEl) {
                    errEl.innerText = 'Please enter your Full Version activation code.';
                    errEl.style.display = 'block';
                }
                return;
            }

            try {
                const decodedText = decodeActivationCode(rawCode);
                if (decodedText === FULL_LICENSE_TEXT) {
                    btnActivate.disabled = true;
                    btnActivate.innerHTML = 'Activating...';

                    const res = await ipcRenderer.invoke('update-license-type', 'full');
                    if (res && res.success) {
                        currentVerifiedLicenseType = 'full';
                        await refreshLicenseStatus();
    await loadAcademicScheduleConfig();
                        if (successEl) {
                            successEl.innerText = '🎉 Real Full Version activated successfully! All modules and features are now fully open.';
                            successEl.style.display = 'block';
                        }
                        inputKey.value = '';
                        startNotificationCenter();
                        loadDashboardStats();
                    } else {
                        throw new Error((res && res.error) || 'Failed to update license.');
                    }
                } else if (decodedText === TRIAL_LICENSE_TEXT) {
                    if (errEl) {
                        errEl.innerText = 'This is a Trial activation code, but your 2-day trial has already expired. Please make payment to get the real version code.';
                        errEl.style.display = 'block';
                    }
                } else {
                    throw new Error('Unrecognized activation key.');
                }
            } catch (e) {
                if (errEl) {
                    errEl.innerText = 'Invalid activation code. Please check your payment code and try again.';
                    errEl.style.display = 'block';
                }
            } finally {
                btnActivate.disabled = false;
                btnActivate.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Activate Real Version</span>
                `;
            }
        };

        btnActivate.addEventListener('click', handleFullActivation);
        inputKey.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || (e.key === 'Enter' && !e.shiftKey)) {
                e.preventDefault();
                handleFullActivation();
            }
        });
    }
}

function startActivationVerification() {
    const inputEl = document.getElementById('activation-code-input');
    const errorEl = document.getElementById('activation-error');
    if (!inputEl) return;

    if (errorEl) errorEl.innerText = "";
    const rawCode = inputEl.value.trim();

    if (!rawCode) {
        if (errorEl) errorEl.innerText = "Please enter an activation code to proceed.";
        return;
    }

    // Switch to 10-second checking screen
    if (activationScreen) activationScreen.style.display = 'none';
    if (activationCheckingScreen) activationCheckingScreen.style.display = 'block';

    const progressBar = document.getElementById('checking-progress-bar');
    if (progressBar) progressBar.style.width = '0%';

    const totalDurationMs = 10000;
    const intervalMs = 100;
    let elapsedMs = 0;

    if (activationCheckInterval) {
        clearInterval(activationCheckInterval);
    }

    activationCheckInterval = setInterval(() => {
        elapsedMs += intervalMs;
        const progressPercent = Math.min(100, (elapsedMs / totalDurationMs) * 100);

        if (progressBar) progressBar.style.width = progressPercent + '%';

        if (elapsedMs >= totalDurationMs) {
            clearInterval(activationCheckInterval);
            activationCheckInterval = null;
            finishActivationVerification(rawCode);
        }
    }, intervalMs);
}

function finishActivationVerification(code) {
    const errorEl = document.getElementById('activation-error');

    try {
        const decodedText = decodeActivationCode(code);

        if (decodedText === FULL_LICENSE_TEXT || decodedText === TRIAL_LICENSE_TEXT) {
            currentVerifiedLicenseType = (decodedText === FULL_LICENSE_TEXT) ? 'full' : 'trial';
            // Success: reveal main setup screen with welcome text
            if (activationCheckingScreen) activationCheckingScreen.style.display = 'none';
            if (setupScreen) setupScreen.style.display = 'block';
            displaySetupWelcomeMessage(decodedText);
        } else {
            throw new Error("Unrecognized license text.");
        }
    } catch (err) {
        // Verification failed: return to activation screen and show error
        if (activationCheckingScreen) activationCheckingScreen.style.display = 'none';
        if (activationScreen) activationScreen.style.display = 'block';
        if (errorEl) {
            errorEl.innerText = "Invalid activation code. Please check your code and try again.";
        }
    }
}

function displaySetupWelcomeMessage(decodedText) {
    const welcomeBox = document.getElementById('setup-welcome-message');
    const welcomeTitle = document.getElementById('setup-welcome-title');
    const welcomeDesc = document.getElementById('setup-welcome-desc');
    if (!welcomeBox) return;

    if (decodedText === FULL_LICENSE_TEXT) {
        welcomeBox.className = 'setup-welcome-card full-license';
        if (welcomeTitle) welcomeTitle.innerText = "Welcome to EduKit Campus";
        if (welcomeDesc) welcomeDesc.innerText = "Activation verified successfully! Please configure your administrator profile below.\nThanks for your purchase.";
    } else {
        welcomeBox.className = 'setup-welcome-card trial-license';
        if (welcomeTitle) welcomeTitle.innerText = "Trial version unlocked.";
        if (welcomeDesc) welcomeDesc.innerText = "You are using a trial version. Make full payment to unlock all features.";
    }

    welcomeBox.style.display = 'flex';
}

const btnVerifyActivation = document.getElementById('btn-verify-activation');
if (btnVerifyActivation) {
    btnVerifyActivation.addEventListener('click', startActivationVerification);
}

const activationCodeInput = document.getElementById('activation-code-input');
if (activationCodeInput) {
    activationCodeInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault();
            startActivationVerification();
        }
    });
}


// On app startup: ask main.js whether an admin account already
// exists, and show either the first-time Activation screen or the
// normal Login screen accordingly.
window.addEventListener('DOMContentLoaded', async () => {
    const adminExists = await ipcRenderer.invoke('check-admin-exists');
    await refreshLicenseStatus();
    setupTrialExpiredActions();
    initStudentSearch();
    initTeacherSearch();

    // Periodic check every 60 seconds
    setInterval(async () => {
        if (appLicenseStatus && appLicenseStatus.isTrial && !appLicenseStatus.isTrialExpired) {
            await refreshLicenseStatus();
        }
    }, 60000);

    if (adminExists) {
        loginScreen.style.display = 'block';
    } else {
        activationScreen.style.display = 'block';
    }
});

// Reusable Logo & Signature Upload Zone controller (supports Setup Screen, Settings Tab, etc.)
function attachLogoZoneHandlers(options = {}) {
    const {
        zoneId,
        fileInputId,
        previewId,
        phId,
        clearBtnId,
        filenameId,
        onError,
        maxBytes = 2 * 1024 * 1024,
        allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
        label = 'Image'
    } = options;

    const zone = document.getElementById(zoneId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const ph = document.getElementById(phId);
    const clearBtn = document.getElementById(clearBtnId);
    const filename = document.getElementById(filenameId);

    if (!zone || !fileInput) return null;

    const state = {
        dataUrl: null,
        file: null,
        isRemoved: false
    };

    function flashError(msg) {
        zone.classList.add('upload-error');
        if (onError) onError(msg);
        setTimeout(() => {
            zone.classList.remove('upload-error');
        }, 2500);
    }

    function setLogo(dataUrl, nameText, sizeBytes) {
        state.dataUrl = dataUrl || null;
        if (dataUrl) {
            state.isRemoved = false;
            if (preview) {
                preview.src = dataUrl;
                preview.style.display = 'block';
            }
            if (ph) ph.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'flex';
            zone.classList.add('has-logo');
            if (filename) {
                filename.textContent = nameText
                    ? nameText + (sizeBytes ? ' (' + Math.round(sizeBytes / 1024) + ' KB)' : '')
                    : '';
            }
            if (onError) onError('');
        } else {
            reset();
        }
    }

    function reset() {
        state.dataUrl = null;
        state.file = null;
        state.isRemoved = true;
        if (preview) {
            preview.removeAttribute('src');
            preview.style.display = 'none';
        }
        if (ph) ph.style.display = 'flex';
        if (clearBtn) clearBtn.style.display = 'none';
        zone.classList.remove('has-logo');
        zone.classList.remove('drag-over');
        if (filename) filename.textContent = '';
        if (fileInput) fileInput.value = '';
    }

    function handleFile(file) {
        if (!file) return;
        if (allowedTypes && allowedTypes.length && !allowedTypes.includes(file.type)) {
            flashError(`${label}: please upload a PNG, JPG or WebP image.`);
            if (fileInput) fileInput.value = '';
            return;
        }
        const limitBytes = maxBytes;
        if (file.size > limitBytes) {
            const mb = (limitBytes / (1024 * 1024)).toFixed(0);
            flashError(`${label} exceeds the ${mb} MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).`);
            if (fileInput) fileInput.value = '';
            return;
        }
        if (onError) onError('');
        state.isRemoved = false;
        state.file = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogo(e.target.result, file.name, file.size);
        };
        reader.onerror = () => {
            flashError(`Could not read the ${label.toLowerCase()} file.`);
        };
        reader.readAsDataURL(file);
    }

    if (!zone.dataset.bound) {
        zone.dataset.bound = 'true';

        zone.addEventListener('click', () => {
            fileInput.value = '';
            fileInput.click();
        });

        zone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.value = '';
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files && fileInput.files[0]) {
                handleFile(fileInput.files[0]);
            }
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                reset();
                if (onError) onError('');
            });
            clearBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    reset();
                    if (onError) onError('');
                }
            });
        }
    }

    return {
        setLogo,
        reset,
        getState: () => ({
            dataUrl: state.dataUrl,
            file: state.file,
            isRemoved: state.isRemoved
        })
    };
}

let schoolSetupLogoController = null;

async function initSchoolSetupScreen() {
    const titleInput = document.getElementById('ss-title');
    const addrInput = document.getElementById('ss-address');
    const errEl = document.getElementById('ss-error');
    const okEl = document.getElementById('ss-success');
    const saveBtn = document.getElementById('btn-save-school-setup');

    if (errEl) errEl.innerText = '';
    if (okEl) okEl.style.display = 'none';

    if (!schoolSetupLogoController) {
        schoolSetupLogoController = attachLogoZoneHandlers({
            zoneId: 'ss-logo-zone',
            fileInputId: 'ss-logo-input',
            previewId: 'ss-logo-preview',
            phId: 'ss-logo-ph',
            clearBtnId: 'ss-logo-clear',
            filenameId: 'ss-logo-filename',
            label: 'School Logo',
            maxBytes: 5 * 1024 * 1024,
            onError: (msg) => {
                if (errEl) errEl.innerText = msg;
            }
        });
    }

    try {
        const info = await ipcRenderer.invoke('get-school-info');
        if (titleInput && !titleInput.value) titleInput.value = info?.name || '';
        if (addrInput && !addrInput.value) addrInput.value = info?.address || '';
        if (schoolSetupLogoController && info?.logo_data_url) {
            schoolSetupLogoController.setLogo(info.logo_data_url, 'Current Logo');
        }
    } catch (e) { }

    if (saveBtn && !saveBtn.dataset.bound) {
        saveBtn.dataset.bound = 'true';
        saveBtn.addEventListener('click', async () => {
            const title = titleInput?.value.trim() || '';
            const address = addrInput?.value.trim() || '';
            if (errEl) errEl.innerText = '';

            if (!title) {
                if (errEl) errEl.innerText = 'Institute name is required.';
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';

            const logoState = schoolSetupLogoController ? schoolSetupLogoController.getState() : {};
            const saveResult = await ipcRenderer.invoke('save-school-info', {
                name: title,
                address,
                logo_data_url: logoState.dataUrl || null,
                logo_removed: logoState.isRemoved
            });

            if (saveResult && saveResult.success) {
                cachedSchoolInfo = {
                    name: title,
                    address,
                    logo_path: saveResult.logo_path || null,
                    logo_data_url: logoState.dataUrl || null
                };
                if (okEl) {
                    okEl.style.display = 'block';
                    okEl.textContent = 'Configuration saved successfully!';
                }
                setTimeout(async () => {
                    if (schoolSetupScreen) schoolSetupScreen.style.display = 'none';
                    if (academicSetupScreen) {
                        academicSetupScreen.style.display = 'block';
                        await initAcademicSetupScreen();
                    } else if (loginScreen) {
                        loginScreen.style.display = 'block';
                    }
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Configuration';
                }, 800);
            } else {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Configuration';
                if (errEl) errEl.innerText = 'Error saving school configuration: ' + ((saveResult && saveResult.message) || 'Unknown error');
            }
        });
    }
}

// Toggle optional security questions (Q3 - Q5) in initial setup
const btnToggleSetupMore = document.getElementById('btn-toggle-setup-more-questions');
const setupMoreContent = document.getElementById('setup-more-questions-content');
const setupMoreToggleText = document.getElementById('setup-more-toggle-text');
if (btnToggleSetupMore && setupMoreContent) {
    btnToggleSetupMore.addEventListener('click', () => {
        const isHidden = setupMoreContent.style.display === 'none' || !setupMoreContent.style.display;
        if (isHidden) {
            setupMoreContent.style.display = 'block';
            btnToggleSetupMore.setAttribute('aria-expanded', 'true');
            if (setupMoreToggleText) setupMoreToggleText.textContent = 'Hide Additional Questions (3 to 5)';
        } else {
            setupMoreContent.style.display = 'none';
            btnToggleSetupMore.setAttribute('aria-expanded', 'false');
            if (setupMoreToggleText) setupMoreToggleText.textContent = 'Add More Security Questions (3 to 5)';
        }
    });
}

// First-time setup form: collects the new admin's username,
// password, and custom security questions/answers, then transitions to School Setup.
document.getElementById('btn-save-setup').addEventListener('click', async () => {
    const username = document.getElementById('setup-username').value.trim();
    const password = document.getElementById('setup-password').value.trim();
    const q1 = document.getElementById('q1')?.value.trim() || '';
    const a1 = document.getElementById('a1')?.value.trim() || '';
    const q2 = document.getElementById('q2')?.value.trim() || '';
    const a2 = document.getElementById('a2')?.value.trim() || '';
    const q3 = document.getElementById('q3')?.value.trim() || '';
    const a3 = document.getElementById('a3')?.value.trim() || '';
    const q4 = document.getElementById('q4')?.value.trim() || '';
    const a4 = document.getElementById('a4')?.value.trim() || '';
    const q5 = document.getElementById('q5')?.value.trim() || '';
    const a5 = document.getElementById('a5')?.value.trim() || '';

    if (!username || !password) {
        document.getElementById('setup-error').innerText = "Please complete admin username and password!";
        return;
    }

    if (!q1 || !a1) {
        document.getElementById('setup-error').innerText = "Please provide at least Security Question 1 and Answer 1!";
        return;
    }

    for (let i = 2; i <= 5; i++) {
        const qVal = document.getElementById('q' + i)?.value.trim() || '';
        const aVal = document.getElementById('a' + i)?.value.trim() || '';
        if ((qVal && !aVal) || (!qVal && aVal)) {
            document.getElementById('setup-error').innerText = `Please enter both Question and Answer for Question ${i}.`;
            return;
        }
    }

    const result = await ipcRenderer.invoke('setup-admin', {
        username, password,
        q1, a1,
        q2, a2,
        q3, a3,
        q4, a4,
        q5, a5,
        license_type: currentVerifiedLicenseType
    });

    if (result.success) {
        setupScreen.style.display = 'none';
        if (schoolSetupScreen) {
            schoolSetupScreen.style.display = 'block';
            await initSchoolSetupScreen();
        } else {
            loginScreen.style.display = 'block';
        }
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
        await refreshLicenseStatus();
        setupTrialExpiredActions();
        if (!appLicenseStatus || !appLicenseStatus.isTrialExpired) {
            startNotificationCenter();
            loadDashboardStats();
        }
    } else {
        document.getElementById('login-error').innerText = response.message;
    }
});

// Universal password visibility toggle helper
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-pw-btn');
    if (!btn) return;
    const targetId = btn.dataset.target;
    if (!targetId) return;
    const input = document.getElementById(targetId);
    if (!input) return;
    const eyeIcon = btn.querySelector('.eye-icon');
    const eyeOffIcon = btn.querySelector('.eye-off-icon');
    const isPassword = input.type === 'password';

    input.type = isPassword ? 'text' : 'password';
    btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    btn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
    if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : 'block';
    if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? 'block' : 'none';
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

// --- FORGOT / RESET PASSWORD ON LOGIN SCREEN ---
const linkForgotPassword = document.getElementById('link-forgot-password');
const resetPasswordScreen = document.getElementById('reset-password-screen');
const btnCancelResetPassword = document.getElementById('btn-cancel-reset-password');
const btnSubmitResetPassword = document.getElementById('btn-submit-reset-password');

if (linkForgotPassword) {
    linkForgotPassword.addEventListener('click', async (e) => {
        e.preventDefault();
        loginScreen.style.display = 'none';
        resetPasswordScreen.style.display = 'block';
        document.getElementById('reset-error').innerText = '';
        document.getElementById('reset-success').style.display = 'none';
        document.getElementById('reset-new-password').value = '';
        document.getElementById('reset-confirm-password').value = '';

        const container = document.getElementById('reset-questions-container');
        container.innerHTML = '<div style="color:#64748b; font-size:13px; text-align:center; padding:10px 0;">Loading security questions...</div>';

        const res = await ipcRenderer.invoke('get-recovery-questions');
        if (res && res.success && res.questions && res.questions.length > 0) {
            container.innerHTML = res.questions.map(q => `
                <div class="input-group" style="margin-bottom: 12px;">
                    <label class="no-select" style="color:#334155; font-size:13px; font-weight:600;">${escapeHtml(q.question)}</label>
                    <input type="text" class="reset-answer-input" data-key="${q.key}" placeholder="Your Answer" autocomplete="off" style="margin-top:4px;">
                </div>
            `).join('');
            if (typeof enableEnterNavigation === 'function') {
                enableEnterNavigation(resetPasswordScreen, btnSubmitResetPassword);
            }
        } else {
            container.innerHTML = `<div style="color:#ef4444; font-size:13px; padding:10px 0;">${(res && res.message) || 'No recovery security questions found. Please contact an administrator.'}</div>`;
        }
    });
}

if (btnCancelResetPassword) {
    btnCancelResetPassword.addEventListener('click', () => {
        resetPasswordScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });
}

if (btnSubmitResetPassword) {
    btnSubmitResetPassword.addEventListener('click', async () => {
        const errorEl = document.getElementById('reset-error');
        const successEl = document.getElementById('reset-success');
        errorEl.innerText = '';
        successEl.style.display = 'none';

        const answers = {};
        const answerInputs = document.querySelectorAll('.reset-answer-input');
        let allFilled = true;
        answerInputs.forEach(input => {
            const val = input.value.trim();
            if (!val) allFilled = false;
            answers[input.dataset.key] = val;
        });

        if (!allFilled || answerInputs.length === 0) {
            errorEl.innerText = 'Please answer all security questions!';
            return;
        }

        const newPw = document.getElementById('reset-new-password').value.trim();
        const confirmPw = document.getElementById('reset-confirm-password').value.trim();

        if (!newPw) {
            errorEl.innerText = 'Please enter a new password.';
            return;
        }
        if (newPw !== confirmPw) {
            errorEl.innerText = 'New password and confirm password do not match!';
            return;
        }

        btnSubmitResetPassword.disabled = true;
        btnSubmitResetPassword.textContent = 'Verifying...';

        const res = await ipcRenderer.invoke('reset-admin-password-via-questions', {
            answers,
            newPassword: newPw
        });

        btnSubmitResetPassword.disabled = false;
        btnSubmitResetPassword.textContent = 'Save New Password';

        if (res && res.success) {
            successEl.innerText = res.message || 'Password reset successfully! Returning to login...';
            successEl.style.display = 'block';
            setTimeout(() => {
                resetPasswordScreen.style.display = 'none';
                loginScreen.style.display = 'block';
                document.getElementById('login-password').value = '';
                document.getElementById('login-error').innerText = 'Password reset successful! Please log in.';
            }, 1800);
        } else {
            errorEl.innerText = (res && res.message) || 'Verification failed. Please check your answers.';
        }
    });
}

// Login form: sends the entered username/password to main.js for
// verification, then swaps the login screen out for the dashboard
// if correct.
window.switchTab = function (tabId) {
    if (appLicenseStatus && appLicenseStatus.isTrialExpired && tabId !== 'home-tab') {
        alert('Trial Version Expired: All features and modules are closed. Please make payment to get the real version.');
        return;
    }

    // Hide all tab contents
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    // Clear form highlight animations from all details forms
    ['student-details', 'teacher-details', 'subject-details'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('details-highlight'); });

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


// ---------- SIDEBAR: collapse / expand ----------
const dashboardSidebar = document.querySelector('.dashboard-sidebar');

// When collapsed only icons show, so give each button a hover tooltip with its label.
function syncSidebarTitles() {
    const collapsed = dashboardSidebar.classList.contains('collapsed');
    document.querySelectorAll('.dashboard-sidebar .nav-btn').forEach(btn => {
        const label = btn.querySelector('span');
        if (!label) return;
        if (collapsed) btn.title = label.textContent.trim();
        else btn.removeAttribute('title');
    });
}

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const isCollapsed = dashboardSidebar.classList.toggle('collapsed');
    document.getElementById('sidebar-toggle').setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    syncSidebarTitles();
    closeNotificationPanel();   // the panel is anchored to the bell, which fades out
});
syncSidebarTitles();

// ---------- DETAILS / FORMS: smooth collapse / expand ----------
function setupSmoothDetails(detailsId) {
    const details = document.getElementById(detailsId);
    if (!details) return;
    const summary = details.querySelector('summary');
    const content = details.querySelector('.details-collapse-wrapper');
    if (!summary || !content) return;

    let currentAnim = null;

    function expand(duration = 400) {
        if (details.open && !details.classList.contains('collapsing') && !currentAnim) return;

        const startHeight = currentAnim ? (content.offsetHeight || 0) : 0;

        if (currentAnim) {
            currentAnim.cancel();
            currentAnim = null;
        }

        details.classList.remove('collapsing');
        details.open = true;

        content.style.overflow = 'hidden';
        content.style.height = 'auto';
        content.style.paddingBottom = '16px';
        const targetHeight = content.scrollHeight;

        content.style.height = `${startHeight}px`;
        const startPadding = startHeight > 0 && targetHeight > 0 ? `${Math.min(16, (startHeight / targetHeight) * 16)}px` : '0px';
        content.style.paddingBottom = startPadding;

        const anim = content.animate([
            { height: `${startHeight}px`, opacity: startHeight > 0 ? (startHeight / targetHeight) : 0, paddingBottom: startPadding },
            { height: `${targetHeight}px`, opacity: 1, paddingBottom: '16px' }
        ], {
            duration,
            easing: 'ease-in-out'
        });

        currentAnim = anim;

        anim.onfinish = () => {
            content.style.height = '';
            content.style.overflow = '';
            content.style.opacity = '';
            content.style.paddingBottom = '';
            currentAnim = null;
        };
        anim.oncancel = () => {
            currentAnim = null;
        };
    }

    function collapse(duration = 400) {
        if (!details.open && !currentAnim) return;

        if (currentAnim) {
            currentAnim.cancel();
            currentAnim = null;
        }

        details.classList.add('collapsing');
        content.style.overflow = 'hidden';
        const startHeight = content.offsetHeight || content.scrollHeight;

        const anim = content.animate([
            { height: `${startHeight}px`, opacity: 1, paddingBottom: '16px' },
            { height: '0px', opacity: 0, paddingBottom: '0px' }
        ], {
            duration,
            easing: 'ease-in-out'
        });

        currentAnim = anim;

        anim.onfinish = () => {
            details.open = false;
            details.classList.remove('collapsing');
            content.style.height = '';
            content.style.overflow = '';
            content.style.opacity = '';
            content.style.paddingBottom = '';
            currentAnim = null;
        };
        anim.oncancel = () => {
            currentAnim = null;
        };
    }

    summary.addEventListener('click', (e) => {
        if (details.classList.contains('disabled')) {
            e.preventDefault();
            return;
        }
        if (detailsId === 'student-details' && typeof promoteModeActive !== 'undefined' && promoteModeActive) {
            e.preventDefault();
            return;
        }

        e.preventDefault();

        if (details.open && !details.classList.contains('collapsing')) {
            collapse();
        } else {
            expand();
        }
    });

    details.expandSmooth = expand;
    details.collapseSmooth = collapse;
}

window.openDetailsSmooth = function (details) {
    if (!details) return;
    if (typeof details.expandSmooth === 'function') {
        details.expandSmooth();
    } else {
        details.open = true;
    }
};

window.closeDetailsSmooth = function (details) {
    if (!details) return;
    if (typeof details.collapseSmooth === 'function') {
        details.collapseSmooth();
    } else {
        details.open = false;
    }
};

// Controls smooth scrolling to a form with custom top spacing (e.g. 24px)
window.scrollToForm = function (details, offset = 24) {
    if (!details) return;
    const container = details.closest('.dashboard-main') || document.querySelector('.dashboard-main');
    if (container) {
        const detailsRect = details.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (detailsRect.top - containerRect.top) - offset;
        container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
        });
    } else {
        details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.triggerFormHighlight = function (details) {
    if (!details) return;
    window.openDetailsSmooth(details);
    window.scrollToForm(details, 24);
    details.classList.remove('details-highlight');
    void details.offsetWidth;
    details.classList.add('details-highlight');
    const onEnd = () => {
        details.classList.remove('details-highlight');
        details.removeEventListener('animationend', onEnd);
    };
    details.addEventListener('animationend', onEnd);
};

['student-details', 'teacher-details', 'subject-details'].forEach(setupSmoothDetails);

//  CRUD MANAGEMENT OPERATORS 

// Load data automatically when entering a database tab
const originalSwitchTab = window.switchTab;
window.switchTab = function (tabId) {
    originalSwitchTab(tabId);
    if (tabId === 'db-subjects') loadSubjectsPage();
    if (tabId === 'db-students') loadStudentsPage();
    if (tabId === 'db-teachers') loadTeachersPage();
    if (tabId === 'settings-admin') {
        loadAdminSettingsPage();
        loadSchoolInfo();
    }
    if (tabId === 'home-tab') loadDashboardStats();
};


// ============================================================
// HOME DASHBOARD — summary cards and charts
// ============================================================

// "Class Nine (Science)" -> "Nine (Sci)" so the chart labels stay short.
function shortClassName(name) {
    return String(name || '')
        .replace(/^Class\s+/i, '')
        .replace('(Science)', '(Sci)')
        .replace('(Humanities)', '(Hum)')
        .replace('(Business Studies)', '(Bus)');
}

// Bars start empty and grow on the next frame so the CSS transition plays.
function animateBars(box) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
        box.querySelectorAll('[data-width]').forEach(el => { el.style.width = el.dataset.width + '%'; });
        box.querySelectorAll('[data-height]').forEach(el => { el.style.height = el.dataset.height + '%'; });
    }));
}

// Small horizontal bars: one row per class.
function renderStudentsPerClassChart(rows) {
    const box = document.getElementById('chart-students-per-class');
    if (!rows || !rows.length) {
        box.innerHTML = '<div class="home-empty">No classes found.</div>';
        return;
    }
    const max = Math.max(...rows.map(r => r.total), 1);
    box.innerHTML = rows.map(r => `
        <div class="hbar-row">
            <div class="hbar-label" title="${escapeHtml(r.class_name)}">${escapeHtml(shortClassName(r.class_name))}</div>
            <div class="hbar-track"><div class="hbar-fill" data-width="${(r.total / max) * 100}"></div></div>
            <div class="hbar-value">${r.total}</div>
        </div>`).join('');
    animateBars(box);
}

// Vertical bar chart: one column per class.
function renderSubjectsPerClassChart(rows) {
    const box = document.getElementById('chart-subjects-per-class');
    if (!rows || !rows.length) {
        box.innerHTML = '<div class="home-empty">No classes found.</div>';
        return;
    }
    const max = Math.max(...rows.map(r => r.total), 1);
    box.innerHTML = '<div class="vbar-chart">' + rows.map(r => `
        <div class="vbar-col" title="${escapeHtml(r.class_name)}: ${r.total}">
            <div class="vbar-plot">
                <span class="vbar-value">${r.total}</span>
                <div class="vbar-fill" data-height="${(r.total / max) * 85}"></div>
            </div>
            <div class="vbar-label">${escapeHtml(shortClassName(r.class_name))}</div>
        </div>`).join('') + '</div>';
    animateBars(box);
}

async function loadDashboardStats() {
    try {
        const stats = await ipcRenderer.invoke('get-dashboard-stats');
        if (!stats) return;

        document.getElementById('stat-classes').textContent = stats.totalClasses;
        document.getElementById('stat-students').textContent = stats.totalStudents;
        document.getElementById('stat-teachers').textContent = stats.totalTeachers;

        const known = stats.boys + stats.girls;
        document.getElementById('stat-boys').textContent = stats.boys;
        document.getElementById('stat-girls').textContent = stats.girls;
        document.getElementById('gender-bar-boys').style.width = known ? (stats.boys / known * 100) + '%' : '0%';
        document.getElementById('gender-bar-girls').style.width = known ? (stats.girls / known * 100) + '%' : '0%';
        document.getElementById('stat-gender-unset').textContent =
            stats.genderUnset > 0 ? `${stats.genderUnset} not set yet` : '';

        renderStudentsPerClassChart(stats.studentsPerClass);
        renderSubjectsPerClassChart(stats.subjectsPerClass);
    } catch (e) {
        console.error('Could not load dashboard stats:', e);
    }
}


// --- SUBJECT CATALOG LOOKUP (per class subject list) ---
// Edit these arrays once the official curriculum is confirmed — nothing
// else in the app needs to change when these lists are updated.
const SUBJECT_CATALOG = {
    playNurseryOneTwo: ["Bangla", "English", "Math", "General Knowledge", "Drawing", "Spoken", "Religious Studies and Moral Education", "Clothes/Manner/Presence"],
    threeFourFive: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "Science", "Bangladesh & Global Studies", "General Knowledge", "Drawing", "Spoken", "Religious Studies and Moral Education", "Clothes/Manner/Presence"],
    sixSevenEight: ["Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math", "Science", "Bangladesh & Global Studies", "Agriculture/Home Science", "Religious Studies and Moral Education", "Information and Communication Technology", "Clothes/Manner/Presence"],
    nineTenScience: [
        "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
        "Information and Communication Technology", "Religious Studies and Moral Education",
        "Physical Education, Health Science and Sports", "Career Education",
        "Bangladesh & Global Studies", "Physics", "Chemistry", "Higher Math", "Biology",
        "Agriculture/Home Science", "Clothes/Manner/Presence"
    ],
    nineTenHumanities: [
        "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
        "Information and Communication Technology", "Religious Studies and Moral Education",
        "Physical Education, Health Science and Sports", "Career Education",
        "Science", "History", "Geography & Environment", "Civics & Citizenship", "Economics",
        "Agriculture/Home Science", "Clothes/Manner/Presence"
    ],
    nineTenBusiness: [
        "Bangla 1st", "Bangla 2nd", "English 1st", "English 2nd", "Math",
        "Information and Communication Technology", "Religious Studies and Moral Education",
        "Physical Education, Health Science and Sports", "Career Education",
        "Science", "Accounting", "Finance and Banking", "Business Entrepreneurship",
        "Agriculture Studies", "Home Science", "Clothes/Manner/Presence"
    ]
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
    "Class Ten (Humanities)": SUBJECT_CATALOG.nineTenHumanities,
    "Class Nine (Business Studies)": SUBJECT_CATALOG.nineTenBusiness,
    "Class Ten (Business Studies)": SUBJECT_CATALOG.nineTenBusiness
};

const MAIN_SUBJECT_POOLS = {
    "Class Nine (Science)": ["Physics", "Chemistry", "Biology", "Higher Math"],
    "Class Ten (Science)": ["Physics", "Chemistry", "Biology", "Higher Math"],
    "Class Nine (Humanities)": ["History", "Geography & Environment", "Civics & Citizenship", "Economics"],
    "Class Ten (Humanities)": ["History", "Geography & Environment", "Civics & Citizenship", "Economics"],
    "Class Nine (Business Studies)": ["Accounting", "Finance and Banking", "Business Entrepreneurship"],
    "Class Ten (Business Studies)": ["Accounting", "Finance and Banking", "Business Entrepreneurship"]
};
const OPTIONAL_FALLBACK_SUBJECT = "Agriculture/Home Science";
const ALL_OPTIONAL_SUBJECT_VARIANTS = [
    "Agriculture Studies",
    "Home Science",
    "Agriculture/Home Science",
    "Agriculture/Domestic Science",
    "Domestic Science"
];
let allClassesForStudents = [];

let allClassesCache = []; // filled by loadSubjectsPage, reused for filters + name dropdown
let subjectClassFilter = ""; // "" = show all classes
let allClassesForTeachers = []; // filled by loadTeachersPage, tracks which class belongs to which teacher

// --- SUBJECT MATRICES GENERATOR ---
async function loadSubjectsPage() {
    const subjectDetails = document.getElementById('subject-details');
    if (subjectDetails) subjectDetails.classList.remove('details-highlight');
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

const PRACTICAL_SUBJECT_NAMES = [
    'Physics',
    'Chemistry',
    'Higher Math',
    'Biology',
    'Agriculture/Home Science',
    'Agriculture Studies',
    'Home Science'
];

function isPracticalSubject(subjectName) {
    if (!subjectName) return false;
    const norm = String(subjectName).trim().toLowerCase();
    return PRACTICAL_SUBJECT_NAMES.some(p => p.toLowerCase() === norm);
}

function updateSubjectYearlyInputsVisibility() {
    const nameSelect = document.getElementById('sub-name-select');
    const customInput = document.getElementById('sub-custom-name-input');
    const subjectName = nameSelect && nameSelect.value === '__custom__'
        ? (customInput ? customInput.value.trim() : '')
        : (nameSelect ? nameSelect.value.trim() : '');

    const singleWrap = document.getElementById('sub-yearly-single-wrap');
    const practicalWrap = document.getElementById('sub-yearly-practical-wrap');
    if (!singleWrap || !practicalWrap) return;

    if (isPracticalSubject(subjectName)) {
        singleWrap.style.display = 'none';
        practicalWrap.style.display = 'flex';
        const thInput = document.getElementById('sub-yearly-theory-input');
        const prInput = document.getElementById('sub-yearly-practical-input');
        if (thInput && !thInput.value) thInput.value = '75';
        if (prInput && !prInput.value) prInput.value = '25';
    } else {
        singleWrap.style.display = 'block';
        practicalWrap.style.display = 'none';
    }
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
    updateSubjectYearlyInputsVisibility();
}
document.getElementById('sub-class-select').addEventListener('change', updateSubjectNameOptions);
document.getElementById('sub-name-select').addEventListener('change', handleSubjectNameChange);

const customSubjectInputEl = document.getElementById('sub-custom-name-input');
if (customSubjectInputEl) {
    customSubjectInputEl.addEventListener('input', () => {
        const errEl = document.getElementById('sub-custom-error');
        if (errEl && customSubjectInputEl.value.trim()) errEl.textContent = '';
        updateSubjectYearlyInputsVisibility();
    });
}

window.filterSubjectsByClass = function (classId) {
    subjectClassFilter = classId;
    loadSubjectsPage();
};

let allLoadedSubjects = [];

const SUBJECT_BTN_STYLE = 'padding:4px 8px; font-size:11px; width:auto; display:inline-flex; align-items:center; gap:4px; margin:2px 4px 2px 0; line-height:1; vertical-align:middle; ';

async function renderSubjectsTable() {
    const subjects = await ipcRenderer.invoke('get-subjects');
    allLoadedSubjects = subjects;
    const filtered = subjectClassFilter === '' ? subjects : subjects.filter(s => String(s.class_id) === String(subjectClassFilter));
    const tbody = document.getElementById('subject-table-body');
    tbody.innerHTML = filtered.map(s => {
        let yearlyDisplay = s.yearly_marks ?? '<i style="color:gray;">—</i>';
        if (s.yearly_marks !== null && (s.yearly_theory_marks != null || s.yearly_practical_marks != null || isPracticalSubject(s.subject_name))) {
            const th = s.yearly_theory_marks != null ? s.yearly_theory_marks : 75;
            const pr = s.yearly_practical_marks != null ? s.yearly_practical_marks : 25;
            yearlyDisplay = `${s.yearly_marks} <small style="color:#64748b;">(Th: ${th}, Pr: ${pr})</small>`;
        }
        return `
        <tr>
            <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px;">${s.sequence_order}</span></td>
            <td><b>${s.class_name || 'Unassigned'}</b></td>
            <td>${escapeHtml(s.subject_name)}</td>
            <td>${s.monthly_marks ?? '<i style="color:gray;">—</i>'}</td>
            <td>${yearlyDisplay}</td>
            <td>
                <button onclick="editSubject(${s.id})" style="${SUBJECT_BTN_STYLE}background:#2563eb;">${renderActionIcon(ACTION_ICONS.edit)}Edit</button>
                <button onclick="deleteSubject(${s.id})" style="${SUBJECT_BTN_STYLE}background:#ef4444;">${renderActionIcon(ACTION_ICONS.delete)}Delete</button>
            </td>
        </tr>
    `;
    }).join('');
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

    const thInput = document.getElementById('sub-yearly-theory-input');
    const prInput = document.getElementById('sub-yearly-practical-input');
    if (thInput) thInput.value = s.yearly_theory_marks != null ? s.yearly_theory_marks : (isPracticalSubject(s.subject_name) ? '75' : '');
    if (prInput) prInput.value = s.yearly_practical_marks != null ? s.yearly_practical_marks : (isPracticalSubject(s.subject_name) ? '25' : '');

    updateSubjectYearlyInputsVisibility();

    document.getElementById('btn-add-subject').textContent = 'Update Subject';
    document.getElementById('btn-cancel-subject').style.display = 'inline-block';
    const details = document.getElementById('subject-details');
    if (details) {
        window.triggerFormHighlight(details);
    }
};

function resetSubjectForm() {
    document.getElementById('sub-edit-id').value = '';
    document.getElementById('sub-seq-input').value = '1';
    document.getElementById('sub-monthly-input').value = '';
    document.getElementById('sub-yearly-input').value = '';
    const thInput = document.getElementById('sub-yearly-theory-input');
    const prInput = document.getElementById('sub-yearly-practical-input');
    if (thInput) thInput.value = '';
    if (prInput) prInput.value = '';
    document.getElementById('sub-monthly-check').checked = true;
    document.getElementById('sub-yearly-check').checked = true;
    syncSubjectMarksInput('sub-monthly-check', 'sub-monthly-input', 'sub-monthly-error');
    syncSubjectMarksInput('sub-yearly-check', 'sub-yearly-input', 'sub-yearly-error');
    const customInput = document.getElementById('sub-custom-name-input');
    if (customInput) customInput.value = '';
    const customWrap = document.getElementById('sub-custom-name-wrap');
    if (customWrap) customWrap.style.display = 'none';
    const customErr = document.getElementById('sub-custom-error');
    if (customErr) customErr.textContent = '';
    updateSubjectNameOptions();
    updateSubjectYearlyInputsVisibility();
    document.getElementById('btn-add-subject').textContent = 'Save Subject';
    document.getElementById('btn-cancel-subject').style.display = 'none';
    const subjectDetails = document.getElementById('subject-details');
    if (subjectDetails) subjectDetails.classList.remove('details-highlight');
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
    const monthly_marks = document.getElementById('sub-monthly-check').checked
        ? (document.getElementById('sub-monthly-input').value || null) : null;

    let yearly_marks = null;
    let yearly_theory_marks = null;
    let yearly_practical_marks = null;

    if (document.getElementById('sub-yearly-check').checked) {
        if (isPracticalSubject(subject_name)) {
            const thVal = document.getElementById('sub-yearly-theory-input').value;
            const prVal = document.getElementById('sub-yearly-practical-input').value;
            yearly_theory_marks = thVal !== '' ? Number(thVal) : 75;
            yearly_practical_marks = prVal !== '' ? Number(prVal) : 25;
            yearly_marks = (yearly_theory_marks || 0) + (yearly_practical_marks || 0);
        } else {
            yearly_marks = document.getElementById('sub-yearly-input').value || null;
        }
    }

    const payload = { class_id, subject_name, sequence_order, monthly_marks, yearly_marks, yearly_theory_marks, yearly_practical_marks };
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
        const editIdEl = document.getElementById('sub-edit-id');
        if (editIdEl && String(editIdEl.value) === String(id)) {
            resetSubjectForm();
        }
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
    // Clear form highlight animations from all details forms
    ['student-details', 'teacher-details', 'subject-details'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('details-highlight'); });

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

    const isScience = cls.class_name === "Class Nine (Science)" || cls.class_name === "Class Ten (Science)";
    const mandatoryScience = ["Physics", "Chemistry"];

    const isBusiness = cls.class_name === "Class Nine (Business Studies)" || cls.class_name === "Class Ten (Business Studies)";
    const mandatoryBusiness = ["Accounting", "Finance and Banking", "Business Entrepreneurship"];

    panel.style.display = 'block';
    document.getElementById('stu-main-subjects-list').innerHTML = pool.map(subj => {
        const isLocked = (isScience && mandatoryScience.includes(subj)) || (isBusiness && mandatoryBusiness.includes(subj));
        return `
        <label style="font-weight:normal; display:flex; align-items:center; gap:5px; ${isLocked ? 'opacity:0.85; cursor:not-allowed;' : ''}">
            <input type="checkbox" class="stu-main-checkbox" value="${subj}" 
                ${isLocked ? 'checked disabled data-locked="true"' : ''} 
                onchange="handleMainSubjectToggle(this)"> ${subj}
        </label>
        `;
    }).join('');
    updateOptionalSubjectOptions();
};

// A checked box past 3 gets auto-unchecked with a warning, so the
// count can never exceed 3.
window.handleMainSubjectToggle = function (checkbox) {
    if (checkbox.dataset.locked === "true") {
        checkbox.checked = true;
        return;
    }
    const checked = document.querySelectorAll('.stu-main-checkbox:checked');
    if (checked.length > 3) {
        checkbox.checked = false;
        alert("You can only select 3 main subjects.");
        return;
    }
    updateOptionalSubjectOptions();
};

function updateOptionalSubjectOptions() {
    const classId = document.getElementById('st-class').value;
    const cls = allClassesForStudents.find(c => String(c.id) === String(classId));
    const sel = document.getElementById('stu-optional-select');
    if (!sel || !cls) return;

    const pool = MAIN_SUBJECT_POOLS[cls.class_name] || [];
    const checked = Array.from(document.querySelectorAll('.stu-main-checkbox:checked')).map(cb => cb.value);

    if (checked.length !== 3) {
        sel.innerHTML = '<option value="">-- pick 3 main subjects first --</option>';
        return;
    }

    const isBusiness = cls.class_name === "Class Nine (Business Studies)" || cls.class_name === "Class Ten (Business Studies)";
    let options;
    if (isBusiness) {
        options = ["Agriculture Studies", "Home Science"];
    } else {
        const leftover = pool.find(s => !checked.includes(s));
        options = [leftover, OPTIONAL_FALLBACK_SUBJECT].filter(Boolean);
    }

    const prev = sel.value;
    sel.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join('');
    if (options.includes(prev)) sel.value = prev;
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
    Active: ['ID', 'Roll', 'Name', 'Class', 'Guardian Contact', 'Actions'],
    Graduated: ['ID', 'Roll', 'Name', 'Last Class', 'Guardian Contact', 'Graduated On', 'Actions'],
    Removed: ['ID', 'Roll', 'Name', 'Last Class', 'Guardian Contact', 'Dropped Out On', 'Reason', 'Actions']
};

const STUDENT_BTN_STYLE = 'padding:4px 8px; font-size:11px; width:auto; display:inline-flex; align-items:center; gap:4px; margin:2px 4px 2px 0; line-height:1; vertical-align:middle; ';

// Formats YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY to DD/MM/YYYY
function formatDob(text) {
    if (!text) return '—';
    const str = String(text).trim();
    if (str.includes('/')) {
        const p = str.split('/');
        if (p.length === 3) {
            const d = p[0].padStart(2, '0');
            const m = p[1].padStart(2, '0');
            const y = p[2].length === 2 ? '20' + p[2] : p[2];
            return `${d}/${m}/${y}`;
        }
        return str;
    }
    if (str.includes('-')) {
        const p = str.slice(0, 10).split('-');
        if (p.length === 3) {
            if (p[0].length === 4) {
                // YYYY-MM-DD
                return `${p[2].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[0]}`;
            } else {
                // DD-MM-YYYY
                return `${p[0].padStart(2, '0')}/${p[1].padStart(2, '0')}/${p[2]}`;
            }
        }
    }
    return str;
}

// "2026-03-05 14:20:11" -> "05/03/2026" (blank for old records with no date)
function formatHistoryDate(text) {
    if (!text) return '—';
    return formatDob(text);
}

function studentRowHtml(s, view) {
    const infoBtn = `<button onclick="showStudentInfoModal(${s.id})" style="${STUDENT_BTN_STYLE}background:#0284c7;">${renderActionIcon(ACTION_ICONS.info)}Info</button>`;
    const editBtn = `<button onclick="editStudentById(${s.id})" style="${STUDENT_BTN_STYLE}background:#2563eb;">${renderActionIcon(ACTION_ICONS.edit)}Edit</button>`;

    // Promote-mode checkbox column: shown only for Active view when promote mode is on.
    // Hidden via inline style when mode is off so toggling is instant without re-rendering.
    const isTen = (s.class_name || '').startsWith('Class Ten');
    const checkboxCell = (view === 'Active' && !isTen)
        ? `<td class="promote-checkbox-cell" style="display:${promoteModeActive ? 'table-cell' : 'none'}; text-align:center; width:36px;">
               <input type="checkbox" class="promote-checkbox" data-id="${s.id}" data-class="${escapeHtml(s.class_name || '')}">
           </td>`
        : (view === 'Active'
            ? `<td class="promote-checkbox-cell" style="display:${promoteModeActive ? 'table-cell' : 'none'}; width:36px;"></td>`
            : '');

    let html = checkboxCell + `
        <td><span style="font-weight:600; color:#2563eb;">${escapeHtml(s.student_id_number || '-')}</span></td>
        <td>${formatRoll(s.roll)}</td>
        <td><b>${escapeHtml(s.name || '')}</b></td>
        <td>${escapeHtml(s.class_name || '')}</td>
        <td>${escapeHtml(s.guardian_contact || '')}</td>`;

    const actionCellDisplay = (view === 'Active' && promoteModeActive) ? 'display:none;' : '';

    if (view === 'Active') {
        const graduateBtn = isTen
            ? `<button onclick="graduateStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#10b981;">${renderActionIcon(ACTION_ICONS.graduate)}Graduate</button>`
            : '';
        const dropBtn = `<button onclick="dropOutStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#ef4444;">${renderActionIcon(ACTION_ICONS.dropOut)}Drop Out</button>`;
        html += `<td class="student-action-cell" style="${actionCellDisplay}">${infoBtn}${editBtn}${graduateBtn}${dropBtn}</td>`;
    } else {
        const reinstateBtn = `<button onclick="reinstateStudent(${s.id})" style="${STUDENT_BTN_STYLE}background:#f59e0b;">${renderActionIcon(ACTION_ICONS.reinstate)}Reinstate</button>`;
        html += `<td>${formatHistoryDate(s.status_date)}</td>`;
        if (view === 'Removed') html += `<td>${escapeHtml(s.removal_cause || '')}</td>`;
        html += `<td class="student-action-cell" style="${actionCellDisplay}">${infoBtn}${editBtn}${reinstateBtn}</td>`;
    }
    return `<tr data-name="${escapeHtml((s.name || '').toLowerCase())}" data-id="${escapeHtml((s.student_id_number || '').toLowerCase())}" data-roll="${escapeHtml(String(s.roll || '').toLowerCase())} ${escapeHtml(formatRoll(s.roll).toLowerCase())}">${html}</tr>`;
}

// Re-fetches students from the database using the selected view (tab)
// and class filter, then redraws the table header and rows.
window.loadStudents = async function () {
    const filterSelect = document.getElementById('filter-student-class');
    const class_id = filterSelect ? filterSelect.value : selectedStudentClassFilter;
    const view = currentStudentView;

    const students = await ipcRenderer.invoke('get-students', { class_id, status: view });
    studentListCache = students;

    const actionsSection = document.getElementById('student-actions-section');
    if (actionsSection) {
        actionsSection.style.display = (view === 'Active') ? '' : 'none';
    }

    const headers = (view === 'Active' && promoteModeActive)
        ? STUDENT_VIEW_HEADERS[view].filter(h => h !== 'Actions')
        : STUDENT_VIEW_HEADERS[view];
    const checkboxTh = (view === 'Active' && promoteModeActive)
        ? `<th class="promote-checkbox-head"><input type="checkbox" id="promote-select-all" title="Select All"></th>`
        : '';
    document.getElementById('student-table-head-row').innerHTML = checkboxTh + headers.map(h => `<th>${h}</th>`).join('');

    const tbody = document.getElementById('student-table-body');
    if (!students.length) {
        const emptyText = { Active: 'No current students match this filter.', Graduated: 'No graduated students yet.', Removed: 'No dropped-out students.' }[view];
        const totalCols = headers.length + (checkboxTh ? 1 : 0);
        tbody.innerHTML = `<tr><td colspan="${totalCols}" style="text-align:center; color:#64748b; padding:20px;">${emptyText}</td></tr>`;
        updatePromoteCount();
        syncPromoteTabsState();
        return;
    }
    tbody.innerHTML = students.map(s => studentRowHtml(s, view)).join('');
    updatePromoteCount();
    syncPromoteTabsState();
};

function initStudentSearch() {
    const input = document.getElementById('student-search');
    const clearBtn = document.getElementById('student-search-clear');
    const tbody = document.getElementById('student-table-body');
    if (!input || !tbody) return;

    function applyStudentSearch() {
        const q = input.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

        const rows = Array.from(tbody.querySelectorAll('tr:not(.search-empty-row)'));
        let matchCount = 0;
        let realRowCount = 0;

        rows.forEach(tr => {
            const isDefaultEmpty = tr.cells.length === 1 && tr.cells[0].hasAttribute('colspan');
            if (isDefaultEmpty) {
                tr.style.display = q ? 'none' : '';
                return;
            }
            realRowCount++;
            const name = tr.dataset.name || '';
            const id = tr.dataset.id || '';
            const roll = tr.dataset.roll || '';
            const matches = !q || name.includes(q) || id.includes(q) || roll.includes(q);
            tr.style.display = matches ? '' : 'none';
            if (matches) matchCount++;
        });

        const existingNoResults = tbody.querySelector('.search-empty-row');
        if (q && matchCount === 0 && realRowCount > 0) {
            if (!existingNoResults) {
                const noResultsTr = document.createElement('tr');
                noResultsTr.className = 'search-empty-row';
                const colSpan = document.getElementById('student-table-head-row')?.children.length || 8;
                noResultsTr.innerHTML = `<td colspan="${colSpan}" style="text-align:center; color:#64748b; padding:20px;">No students match &ldquo;${escapeHtml(q)}&rdquo;</td>`;
                tbody.appendChild(noResultsTr);
            }
        } else if (existingNoResults) {
            existingNoResults.remove();
        }
    }

    input.addEventListener('input', applyStudentSearch);
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            input.value = '';
            applyStudentSearch();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            applyStudentSearch();
            input.focus();
        });
    }

    new MutationObserver((mutations) => {
        const hasExternalChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => !n.classList || !n.classList.contains('search-empty-row')) ||
                Array.from(m.removedNodes).some(n => !n.classList || !n.classList.contains('search-empty-row'));
        });
        if (hasExternalChanges) {
            applyStudentSearch();
        }
    }).observe(tbody, { childList: true });
}

function syncPromoteTabsState() {
    document.querySelectorAll('#student-view-tabs .chip-btn').forEach(b => {
        b.removeAttribute('title');
        if (b.dataset.view !== 'Active') {
            if (promoteModeActive) {
                b.classList.add('disabled');
                b.setAttribute('data-tooltip', 'The promotion page is running. Cancel this first.');
            } else {
                b.classList.remove('disabled');
                b.removeAttribute('data-tooltip');
            }
        } else {
            b.classList.remove('disabled');
            b.removeAttribute('data-tooltip');
        }
    });

    // Clear form highlight animations from all details forms
    const studentSummary = document.getElementById('student-details-summary');
    if (studentDetails) {
        if (promoteModeActive) {
            window.closeDetailsSmooth(studentDetails);
            studentDetails.classList.add('disabled');
            studentDetails.setAttribute('data-tooltip', 'The promotion page is running. Cancel this first.');
            if (studentSummary) studentSummary.removeAttribute('data-tooltip');
        } else {
            studentDetails.classList.remove('disabled');
            studentDetails.removeAttribute('data-tooltip');
            if (studentSummary) studentSummary.removeAttribute('data-tooltip');
        }
    }
}

// Prevent opening "Enroll New Student" while promotion mode is running
document.getElementById('student-details')?.addEventListener('click', (e) => {
    if (promoteModeActive) {
        e.preventDefault();
    }
});

// Switching the Current / Graduated / Dropped Out tabs
document.querySelectorAll('#student-view-tabs .chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled') || btn.disabled || (promoteModeActive && btn.dataset.view !== 'Active')) {
            return;
        }
        currentStudentView = btn.dataset.view;
        if (promoteModeActive && currentStudentView !== 'Active') {
            promoteModeActive = false;
            const bar = document.getElementById('promote-confirm-bar');
            if (bar) bar.style.display = 'none';
            const modeBtn = document.getElementById('btn-promote-mode');
            if (modeBtn) {
                modeBtn.textContent = 'Promote';
                modeBtn.classList.remove('active');
            }
        }
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
    const photoSrc = s.photo_data_url || s.photo_path || '';
    editStudent(s.id, s.class_id, s.roll, s.name || '', s.blood_group || '', s.guardian_contact || '',
        s.address || '', s.dob || '', s.fathers_name || '', s.mothers_name || '', s.birth_reg_number || '', photoSrc);
    document.getElementById('st-gender').value = s.gender || '';
    const stIdEl = document.getElementById('st-student-id');
    if (stIdEl) stIdEl.value = s.student_id_number || '';
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
window.editStudent = async function (id, classId, roll, name, bloodGroup, guardianContact, address, dob, fathersName, mothersName, birthRegNumber, photoSrc) {
    document.getElementById('st-edit-id').value = id;
    document.getElementById('st-class').value = classId || '';
    document.getElementById('st-roll').value = formatRoll(roll);
    document.getElementById('st-name').value = name;
    document.getElementById('st-blood').value = bloodGroup;
    document.getElementById('st-phone').value = guardianContact;
    document.getElementById('st-address').value = address;
    document.getElementById('st-dob').value = dob ? formatDob(dob) : '';
    document.getElementById('st-father').value = fathersName || '';
    document.getElementById('st-mother').value = mothersName || '';
    document.getElementById('st-birth-reg').value = birthRegNumber || '';
    if (window.StudentUpload) {
        window.StudentUpload.setPhoto(photoSrc || '');
    }
    const errBox = document.getElementById('st-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
    document.getElementById('btn-save-student').textContent = 'Update Student';
    document.getElementById('btn-cancel-student').style.display = 'inline-block';
    const details = document.getElementById('student-details');
    if (details) {
        window.triggerFormHighlight(details);
    }

    updateStudentSubjectSelection();
    const existing = await ipcRenderer.invoke('get-student-subjects', id);
    existing.filter(r => r.role === 'main').forEach(r => {
        const cb = document.querySelector(`.stu-main-checkbox[value="${CSS.escape(r.subject_name)}"]`);
        if (cb && cb.dataset.locked !== "true") cb.checked = true;
    });
    updateOptionalSubjectOptions();
    const optionalRow = existing.find(r => r.role === 'optional');
    if (optionalRow) {
        const optSelect = document.getElementById('stu-optional-select');
        let optName = optionalRow.subject_name;
        if (optName === 'Agriculture/Domestic Science') optName = 'Agriculture/Home Science';
        optSelect.value = optName;
        if (!optSelect.value && optName) {
            if (optName.includes('Agriculture')) optSelect.value = 'Agriculture Studies';
            else if (optName.includes('Home') || optName.includes('Domestic')) optSelect.value = 'Home Science';
        }
    }
};

function resetStudentForm() {
    const editIdEl = document.getElementById('st-edit-id');
    if (editIdEl) editIdEl.value = '';
    ['st-student-id', 'st-roll', 'st-name', 'st-blood', 'st-gender', 'st-phone', 'st-address', 'st-dob', 'st-father', 'st-mother', 'st-birth-reg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    if (window.StudentUpload) {
        window.StudentUpload.reset();
    }
    const errBox = document.getElementById('st-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
    const formClass = document.getElementById('st-class');
    if (formClass && formClass.options.length > 0) {
        formClass.selectedIndex = 0;
    }
    const mainList = document.getElementById('stu-main-subjects-list');
    if (mainList) mainList.innerHTML = '';
    const optSelect = document.getElementById('stu-optional-select');
    if (optSelect) optSelect.innerHTML = '<option value="">-- pick 3 main subjects first --</option>';
    const subjSection = document.getElementById('stu-subject-selection');
    if (subjSection) subjSection.style.display = 'none';
    const saveBtn = document.getElementById('btn-save-student');
    if (saveBtn) saveBtn.textContent = 'Register Student';
    const cancelBtn = document.getElementById('btn-cancel-student');
    if (cancelBtn) cancelBtn.style.display = 'none';
    hideArchiveFields();
    // Clear form highlight animations from all details forms
    ['student-details', 'teacher-details', 'subject-details'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('details-highlight'); });
    updateStudentSubjectSelection();
}

document.getElementById('btn-save-student').addEventListener('click', async () => {
    const editId = document.getElementById('st-edit-id').value;
    const photoDataUrl = window.StudentUpload ? window.StudentUpload.getPhoto() : '';
    const isPhotoRemoved = window.StudentUpload ? window.StudentUpload.isPhotoRemoved() : false;

    const s = {
        student_id_number: document.getElementById('st-student-id')?.value.trim() || '',
        class_id: document.getElementById('st-class').value,
        roll: parseInt(document.getElementById('st-roll').value, 10),
        name: document.getElementById('st-name').value.trim(),
        blood_group: document.getElementById('st-blood').value.trim(),
        gender: document.getElementById('st-gender').value,
        fathers_name: document.getElementById('st-father').value.trim(),
        mothers_name: document.getElementById('st-mother').value.trim(),
        guardian_name: '',
        guardian_contact: document.getElementById('st-phone').value.trim(),
        address: document.getElementById('st-address').value.trim(),
        dob: document.getElementById('st-dob').value || '',
        birth_reg_number: document.getElementById('st-birth-reg').value.trim(),
        photo_data_url: photoDataUrl,
        photo_removed: isPhotoRemoved
    };

    // --- Mandatory fields (marked with a red * in the form), checked in form order ---
    const errBox = document.getElementById('st-error');
    if (errBox) { errBox.style.display = 'none'; errBox.textContent = ''; }
    const fail = (msg, focusId) => {
        if (errBox) { errBox.style.display = 'block'; errBox.textContent = msg; }
        alert(msg);
        const el = focusId ? document.getElementById(focusId) : null;
        if (el) el.focus();
    };

    if (!s.student_id_number) return fail("Student ID is required!", 'st-student-id');
    if (!s.class_id) return fail("Class is required!", 'st-class');
    if (!s.roll) return fail("Class Roll is required!", 'st-roll');

    // Nine/Ten only: exactly 3 Main subjects are mandatory (Optional is filled in automatically)
    const cls = allClassesForStudents.find(c => String(c.id) === String(s.class_id));
    const pool = cls && MAIN_SUBJECT_POOLS[cls.class_name];
    let subjectSelections = null;
    if (pool && !editingArchiveStatus) {
        const mains = Array.from(document.querySelectorAll('.stu-main-checkbox:checked')).map(cb => cb.value);
        if (mains.length !== 3) return fail("Please select exactly 3 Main Subjects!");
        const optional = document.getElementById('stu-optional-select').value;
        subjectSelections = mains.map(name => ({ subject_name: name, role: 'main' }));
        if (optional) subjectSelections.push({ subject_name: optional, role: 'optional' });
    }

    if (!s.name) return fail("Full Name is required!", 'st-name');
    if (!s.guardian_contact) return fail("Guardian Contact is required!", 'st-phone');
    if (!photoDataUrl) {
        const zone = document.getElementById('st-photo-zone');
        if (zone) {
            zone.classList.add('upload-error');
            setTimeout(() => zone.classList.remove('upload-error'), 2500);
        }
        return fail("Student Photo is required!");
    }

    if (!editId && appLicenseStatus && appLicenseStatus.isTrial) {
        const classStudents = await ipcRenderer.invoke('get-students', { class_id: s.class_id, status: 'Active' });
        if (classStudents && classStudents.length >= 5) {
            const errBox = document.getElementById('st-error');
            const msg = 'Trial Limit: Maximum 5 active students allowed per class in trial mode. Please upgrade to the full license to add more students.';
            if (errBox) {
                errBox.style.display = 'block';
                errBox.textContent = msg;
            }
            return alert(msg);
        }
    }

    if (s.dob) {
        s.dob = formatDob(s.dob);
        const parts = s.dob.split('/');
        if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
            return alert("Please enter Date of Birth in DD/MM/YYYY format (e.g. 15/08/2012)!");
        }
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1950 || y > 2100) {
            return alert("Please enter a valid Date of Birth (DD/MM/YYYY)!");
        }
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
        } else if (editId && !pool) {
            await ipcRenderer.invoke('save-student-subjects', { student_id: studentId, subjects: [] });
        }
        resetStudentForm();
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


// --- BULK PROMOTE: state, mode toggle, and execution ---

let promoteModeActive = false;

// Toggles the promote mode on/off. When ON:
//   - A checkbox column appears to the left of Roll.
//   - The "Actions" button label changes to "Cancel".
//   - A "Promote Selected" confirm button appears below the table.
// When OFF: everything reverts and the table re-renders normally.
window.togglePromoteMode = function () {
    let switchedView = false;
    if (currentStudentView !== 'Active') {
        currentStudentView = 'Active';
        document.querySelectorAll('#student-view-tabs .chip-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.view === 'Active');
        });
        promoteModeActive = false;
        switchedView = true;
    }

    promoteModeActive = !promoteModeActive;

    // Update the chip button label & active style (remains 'Promote', gets active blue)
    const modeBtn = document.getElementById('btn-promote-mode');
    if (modeBtn) {
        modeBtn.textContent = 'Promote';
        modeBtn.classList.toggle('active', promoteModeActive);
    }

    // Show / hide the confirm bar at the bottom
    let bar = document.getElementById('promote-confirm-bar');
    if (promoteModeActive) {
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'promote-confirm-bar';
            bar.className = 'promote-confirm-bar';
            bar.innerHTML = `
                <span id="promote-selected-count">0 students selected</span>
                <div style="display:flex; gap:8px;">
                    <button type="button" id="btn-confirm-promote" class="marks-view-btn"
                        style="background:#0ea5e9;" onclick="bulkPromoteSelected()">
                        ⬆️ Promote Selected
                    </button>
                    <button type="button" class="marks-view-btn"
                        style="background:#ef4444;" onclick="togglePromoteMode()">
                        Cancel
                    </button>
                </div>`;
            const tab = document.getElementById('db-students');
            if (tab) tab.appendChild(bar);
        }
        bar.style.display = 'flex';
    } else {
        if (bar) bar.style.display = 'none';
    }

    if (switchedView) {
        loadStudents();
        return;
    }

    // Re-render headers and checkbox cells without a full DB round-trip
    const headRow = document.getElementById('student-table-head-row');
    if (headRow) {
        const view = currentStudentView;
        const headers = (view === 'Active' && promoteModeActive)
            ? STUDENT_VIEW_HEADERS[view].filter(h => h !== 'Actions')
            : STUDENT_VIEW_HEADERS[view];
        const checkboxTh = promoteModeActive ? `<th class="promote-checkbox-head"><input type="checkbox" id="promote-select-all" title="Select All"></th>` : '';
        headRow.innerHTML = checkboxTh + headers.map(h => `<th>${h}</th>`).join('');
    }
    document.querySelectorAll('.promote-checkbox-cell').forEach(cell => {
        cell.style.display = promoteModeActive ? 'table-cell' : 'none';
    });
    document.querySelectorAll('.student-action-cell').forEach(cell => {
        cell.style.display = (promoteModeActive && currentStudentView === 'Active') ? 'none' : 'table-cell';
    });

    syncPromoteTabsState();

    // Reset counter
    updatePromoteCount();
};

// Updates the "N students selected" counter in the confirm bar & synchronizes select-all.
function updatePromoteCount() {
    const allCheckboxes = document.querySelectorAll('.promote-checkbox');
    const checked = document.querySelectorAll('.promote-checkbox:checked');
    const el = document.getElementById('promote-selected-count');
    if (el) el.textContent = `${checked.length} student${checked.length !== 1 ? 's' : ''} selected`;

    const selectAll = document.getElementById('promote-select-all');
    if (selectAll) {
        if (allCheckboxes.length === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        } else if (checked.length === allCheckboxes.length) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
        } else if (checked.length > 0) {
            selectAll.checked = false;
            selectAll.indeterminate = true;
        } else {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        }
    }
}

// Delegate select-all checkbox change on the table header
document.getElementById('student-table-head-row')?.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'promote-select-all') {
        const checkedState = e.target.checked;
        document.querySelectorAll('.promote-checkbox').forEach(cb => {
            cb.checked = checkedState;
        });
        updatePromoteCount();
    }
});

// Delegate checkbox changes to the table body so dynamically rendered rows are covered.
document.getElementById('student-table-body')?.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('promote-checkbox')) {
        updatePromoteCount();
    }
});

// Runs the bulk promotion. Handles three cases:
//   Class Eight   → asks Science or Humanities first (reuses the existing modal)
//   Class Nine    → auto-maps to corresponding Class Ten (same department)
//   All others    → straight single-step promotion (next class in PROMOTION_PATH)
window.bulkPromoteSelected = async function () {
    const checked = Array.from(document.querySelectorAll('.promote-checkbox:checked'));
    if (checked.length === 0) {
        alert('Select at least one student to promote.');
        return;
    }

    const classEight = checked.filter(cb => cb.dataset.class === 'Class Eight');
    const nineSci = checked.filter(cb => cb.dataset.class === 'Class Nine (Science)');
    const nineHum = checked.filter(cb => cb.dataset.class === 'Class Nine (Humanities)');
    const nineBus = checked.filter(cb => cb.dataset.class === 'Class Nine (Business Studies)');
    const others = checked.filter(cb => ![
        'Class Eight',
        'Class Nine (Science)',
        'Class Nine (Humanities)',
        'Class Nine (Business Studies)'
    ].includes(cb.dataset.class));

    const classId = (name) => allClassesForStudents.find(c => c.class_name === name)?.id;

    const buildPromotions = (cbs, targetClassName) => {
        const targetId = classId(targetClassName);
        if (!targetId) return [];
        return cbs.map(cb => ({
            id: Number(cb.dataset.id),
            to_class_id: targetId
        }));
    };

    const getOtherPromotions = () => others.map(cb => {
        const idx = allClassesForStudents.findIndex(c => c.class_name === cb.dataset.class);
        const next = idx >= 0 ? allClassesForStudents[idx + 1] : null;
        return next ? { id: Number(cb.dataset.id), to_class_id: next.id } : null;
    }).filter(Boolean);

    const executePromotion = async (promotions) => {
        if (promotions.length === 0) {
            alert('No eligible students selected for promotion.');
            return { success: false };
        }
        const res = await ipcRenderer.invoke('bulk-promote-students', { promotions });
        if (res && res.success) {
            togglePromoteMode();
            await loadStudents();
        }
        return res;
    };

    if (classEight.length > 0) {
        const targets = [
            { id: classId('Class Nine (Science)'), label: 'Class Nine (Science)' },
            { id: classId('Class Nine (Humanities)'), label: 'Class Nine (Humanities)' },
            { id: classId('Class Nine (Business Studies)'), label: 'Class Nine (Business Studies)' }
        ].filter(t => t.id);

        showStudentDialog({
            title: 'Promote Class Eight Students',
            message: `Choose which Class Nine group the ${classEight.length} selected Class Eight student(s) will move into (any other selected students will advance to their next class automatically).`,
            targets,
            confirmText: 'Promote Selected',
            onConfirm: async (v) => {
                const allPromotions = [
                    ...classEight.map(cb => ({ id: Number(cb.dataset.id), to_class_id: v.target_id })),
                    ...buildPromotions(nineSci, 'Class Ten (Science)'),
                    ...buildPromotions(nineHum, 'Class Ten (Humanities)'),
                    ...buildPromotions(nineBus, 'Class Ten (Business Studies)'),
                    ...getOtherPromotions()
                ];
                return await executePromotion(allPromotions);
            }
        });
    } else {
        const promotions = [
            ...buildPromotions(nineSci, 'Class Ten (Science)'),
            ...buildPromotions(nineHum, 'Class Ten (Humanities)'),
            ...buildPromotions(nineBus, 'Class Ten (Business Studies)'),
            ...getOtherPromotions()
        ];
        const res = await executePromotion(promotions);
        if (res && !res.success && res.error) {
            alert('Promotion failed: ' + res.error);
        }
    }
};

// --- TEACHER REGISTRY CONTROLLERS ---
let cachedTeachers = [];

async function loadTeachersPage() {
    const teacherDetails = document.getElementById('teacher-details');
    if (teacherDetails) teacherDetails.classList.remove('details-highlight');
    allClassesForTeachers = await ipcRenderer.invoke('get-classes-list') || [];
    const classSelect = document.getElementById('tc-classes');
    if (classSelect) {
        classSelect.innerHTML = `<option value="">-- Select Class --</option>` +
            allClassesForTeachers.map(c => `<option value="${c.id}">${escapeHtml(c.class_name)}</option>`).join('');
    }
    await renderTeachersTable();
}

const TEACHER_BTN_STYLE = 'padding:4px 8px; font-size:11px; width:auto; display:inline-flex; align-items:center; gap:4px; margin:2px 4px 2px 0; line-height:1; vertical-align:middle; ';

async function renderTeachersTable() {
    cachedTeachers = await ipcRenderer.invoke('get-teachers') || [];
    const tbody = document.getElementById('teacher-table-body');
    if (!tbody) return;
    tbody.innerHTML = cachedTeachers.map(t => {
        const assignedClasses = allClassesForTeachers.filter(c => c.class_teacher_id === t.id).map(c => c.class_name);
        return `
        <tr data-name="${escapeHtml((t.name || '').toLowerCase())}" data-id="${escapeHtml((t.teacher_id_number || '').toLowerCase())}">
            <td><span style="font-weight:600; color:#2563eb;">${escapeHtml(t.teacher_id_number || '-')}</span></td>
            <td><b>${escapeHtml(t.name || '')}</b></td>
            <td>${escapeHtml(t.title || '')}</td>
            <td>${assignedClasses.length ? assignedClasses.map(escapeHtml).join(', ') : '<i style="color:gray;">None</i>'}</td>
            <td>${escapeHtml(t.contact_number || '')}</td>
            <td>
                <button onclick="showTeacherInfoModal(${t.id})" style="${TEACHER_BTN_STYLE}background:#0284c7;">${renderActionIcon(ACTION_ICONS.info)}Info</button>
                <button onclick="editTeacherById(${t.id})" style="${TEACHER_BTN_STYLE}background:#2563eb;">${renderActionIcon(ACTION_ICONS.edit)}Edit</button>
                <button onclick="deleteTeacher(${t.id})" style="${TEACHER_BTN_STYLE}background:#ef4444;">${renderActionIcon(ACTION_ICONS.delete)}Delete</button>
            </td>
        </tr>
    `;
    }).join('');
}

function initTeacherSearch() {
    const input = document.getElementById('teacher-search');
    const clearBtn = document.getElementById('teacher-search-clear');
    const tbody = document.getElementById('teacher-table-body');
    if (!input || !tbody) return;

    function applyTeacherSearch() {
        const q = input.value.trim().toLowerCase();
        if (clearBtn) clearBtn.style.display = q ? 'flex' : 'none';

        const rows = Array.from(tbody.querySelectorAll('tr:not(.search-empty-row)'));
        let matchCount = 0;
        let realRowCount = 0;

        rows.forEach(tr => {
            const isDefaultEmpty = tr.cells.length === 1 && tr.cells[0].hasAttribute('colspan');
            if (isDefaultEmpty) {
                tr.style.display = q ? 'none' : '';
                return;
            }
            realRowCount++;
            const name = tr.dataset.name || '';
            const id = tr.dataset.id || '';
            const matches = !q || name.includes(q) || id.includes(q);
            tr.style.display = matches ? '' : 'none';
            if (matches) matchCount++;
        });

        const existingNoResults = tbody.querySelector('.search-empty-row');
        if (q && matchCount === 0 && realRowCount > 0) {
            if (!existingNoResults) {
                const noResultsTr = document.createElement('tr');
                noResultsTr.className = 'search-empty-row';
                noResultsTr.innerHTML = `<td colspan="6" style="text-align:center; color:#64748b; padding:20px;">No teachers match &ldquo;${escapeHtml(q)}&rdquo;</td>`;
                tbody.appendChild(noResultsTr);
            }
        } else if (existingNoResults) {
            existingNoResults.remove();
        }
    }

    input.addEventListener('input', applyTeacherSearch);
    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            input.value = '';
            applyTeacherSearch();
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            applyTeacherSearch();
            input.focus();
        });
    }

    new MutationObserver((mutations) => {
        const hasExternalChanges = mutations.some(m => {
            return Array.from(m.addedNodes).some(n => !n.classList || !n.classList.contains('search-empty-row')) ||
                Array.from(m.removedNodes).some(n => !n.classList || !n.classList.contains('search-empty-row'));
        });
        if (hasExternalChanges) {
            applyTeacherSearch();
        }
    }).observe(tbody, { childList: true });
}

// --- TEACHER & STUDENT PHOTO & SIGNATURE UPLOAD LOGIC ---
(function () {
    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

    function $(id) { return document.getElementById(id); }

    function showError(msg, targetBoxId = 'tc-error') {
        const box = $(targetBoxId);
        if (!box) return;
        box.textContent = msg;
        box.style.display = msg ? 'block' : 'none';
    }

    function createUploader(prefix, label, targetErrorId = 'tc-error') {
        const zone = $(prefix + '-zone');
        const input = $(prefix + '-input');
        const preview = $(prefix + '-preview');
        const ph = $(prefix + '-ph');
        const clearBtn = $(prefix + '-clear');
        const nameEl = $(prefix + '-filename');
        if (!zone || !input) return null;

        let dataUrl = '';
        let isRemoved = false;

        function flashError(msg) {
            zone.classList.add('upload-error');
            showError(msg, targetErrorId);
            setTimeout(() => { zone.classList.remove('upload-error'); }, 2500);
        }

        function render(url, fileName, sizeBytes) {
            dataUrl = url || '';
            if (dataUrl) {
                preview.src = dataUrl;
                preview.style.display = 'block';
                if (ph) ph.style.display = 'none';
                if (clearBtn) clearBtn.style.display = 'flex';
                zone.classList.add('has-logo');
                if (nameEl) {
                    nameEl.textContent = fileName
                        ? fileName + (sizeBytes ? ' (' + Math.round(sizeBytes / 1024) + ' KB)' : '')
                        : '';
                }
            } else {
                preview.removeAttribute('src');
                preview.style.display = 'none';
                if (ph) ph.style.display = 'flex';
                if (clearBtn) clearBtn.style.display = 'none';
                zone.classList.remove('has-logo');
                if (nameEl) nameEl.textContent = '';
                input.value = '';
            }
        }

        function handleFile(file) {
            if (!file) return;
            if (ALLOWED.indexOf(file.type) === -1) {
                flashError(label + ': please upload a PNG, JPG or WebP image.');
                return;
            }
            if (file.size > MAX_BYTES) {
                flashError(label + ' exceeds the 2 MB limit (' + (file.size / 1024 / 1024).toFixed(2) + ' MB).');
                input.value = '';
                return;
            }
            showError('', targetErrorId);
            isRemoved = false;
            const reader = new FileReader();
            reader.onload = (e) => { render(e.target.result, file.name, file.size); };
            reader.onerror = () => { flashError('Could not read the ' + label.toLowerCase() + ' file.'); };
            reader.readAsDataURL(file);
        }

        zone.addEventListener('click', () => { input.click(); });
        zone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
        });
        input.addEventListener('change', () => { handleFile(input.files[0]); });

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isRemoved = true;
                render('');
            });
            clearBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    isRemoved = true;
                    render('');
                }
            });
        }

        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        return {
            get: () => dataUrl,
            set: (url) => {
                isRemoved = false;
                render(url || '', url ? 'Saved image' : '');
            },
            reset: () => {
                isRemoved = false;
                render('');
            },
            isRemoved: () => isRemoved
        };
    }

    function init() {
        const photo = createUploader('tc-photo', 'Photo', 'tc-error');
        const sign = createUploader('tc-sign', 'Signature', 'tc-error');

        window.TeacherUploads = {
            getPhoto: () => (photo ? photo.get() : ''),
            getSignature: () => (sign ? sign.get() : ''),
            isPhotoRemoved: () => (photo ? photo.isRemoved() : false),
            isSignatureRemoved: () => (sign ? sign.isRemoved() : false),
            setPhoto: (url) => { if (photo) photo.set(url); },
            setSignature: (url) => { if (sign) sign.set(url); },
            reset: () => {
                if (photo) photo.reset();
                if (sign) sign.reset();
                showError('', 'tc-error');
            }
        };

        const studentPhoto = createUploader('st-photo', 'Student Photo', 'st-error');
        window.StudentUpload = {
            getPhoto: () => (studentPhoto ? studentPhoto.get() : ''),
            isPhotoRemoved: () => (studentPhoto ? studentPhoto.isRemoved() : false),
            setPhoto: (url) => { if (studentPhoto) studentPhoto.set(url); },
            reset: () => {
                if (studentPhoto) studentPhoto.reset();
                showError('', 'st-error');
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

function resetTeacherForm() {
    const editIdEl = document.getElementById('tc-edit-id');
    if (editIdEl) editIdEl.value = '';
    ['tc-teacher-id', 'tc-name', 'tc-title', 'tc-contact', 'tc-blood', 'tc-father', 'tc-mother', 'tc-nid', 'tc-address'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const classSelect = document.getElementById('tc-classes');
    if (classSelect) {
        classSelect.value = '';
    }
    if (window.TeacherUploads) {
        window.TeacherUploads.reset();
    }
    const saveBtn = document.getElementById('btn-save-teacher');
    if (saveBtn) saveBtn.textContent = 'Save Teacher';
    const cancelBtn = document.getElementById('btn-cancel-teacher');
    if (cancelBtn) cancelBtn.style.display = 'none';
    const teacherDetails = document.getElementById('teacher-details');
    if (teacherDetails) teacherDetails.classList.remove('details-highlight');
    const errorEl = document.getElementById('tc-error');
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
}

window.editTeacherById = function (id) {
    const t = cachedTeachers.find(item => item.id === id);
    if (!t) return;
    const photoSrc = t.photo_data_url || t.photo_path || '';
    const signSrc = t.signature_data_url || t.signature_path || '';
    window.editTeacher(t.id, t.name, t.title, t.contact_number, t.blood_group, t.fathers_name, t.mothers_name, t.nid_number, t.address, t.teacher_id_number, photoSrc, signSrc);
};

window.editTeacher = function (id, name, title, contact, bloodGroup, fathersName, mothersName, nid, address, teacherIdNumber, photoSrc, signSrc) {
    document.getElementById('tc-edit-id').value = id || '';
    const teacherIdEl = document.getElementById('tc-teacher-id');
    if (teacherIdEl) teacherIdEl.value = teacherIdNumber || '';
    document.getElementById('tc-name').value = name || '';
    document.getElementById('tc-title').value = title || '';
    document.getElementById('tc-contact').value = contact || '';
    document.getElementById('tc-blood').value = bloodGroup || '';
    document.getElementById('tc-father').value = fathersName || '';
    document.getElementById('tc-mother').value = mothersName || '';
    document.getElementById('tc-nid').value = nid || '';
    document.getElementById('tc-address').value = address || '';

    if (window.TeacherUploads) {
        window.TeacherUploads.setPhoto(photoSrc || '');
        window.TeacherUploads.setSignature(signSrc || '');
    }

    // Pre-select this teacher's currently assigned class
    const classSelect = document.getElementById('tc-classes');
    if (classSelect) {
        const assignedClass = allClassesForTeachers.find(c => c.class_teacher_id === id);
        classSelect.value = assignedClass ? String(assignedClass.id) : '';
    }

    document.getElementById('btn-save-teacher').textContent = 'Update Teacher';
    document.getElementById('btn-cancel-teacher').style.display = 'inline-block';
    const details = document.getElementById('teacher-details');
    if (details) {
        window.triggerFormHighlight(details);
    }
};

document.getElementById('btn-save-teacher').addEventListener('click', async () => {
    const editId = document.getElementById('tc-edit-id').value;
    const errorEl = document.getElementById('tc-error');
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }

    const t = {
        teacher_id_number: document.getElementById('tc-teacher-id')?.value.trim() || '',
        name: document.getElementById('tc-name').value.trim(),
        title: document.getElementById('tc-title').value.trim(),
        contact_number: document.getElementById('tc-contact').value.trim(),
        blood_group: document.getElementById('tc-blood').value.trim(),
        fathers_name: document.getElementById('tc-father').value.trim(),
        mothers_name: document.getElementById('tc-mother').value.trim(),
        nid_number: document.getElementById('tc-nid').value.trim(),
        address: document.getElementById('tc-address')?.value.trim() || '',
        photo_data_url: window.TeacherUploads ? window.TeacherUploads.getPhoto() : '',
        photo_removed: window.TeacherUploads ? window.TeacherUploads.isPhotoRemoved() : false,
        signature_data_url: window.TeacherUploads ? window.TeacherUploads.getSignature() : '',
        signature_removed: window.TeacherUploads ? window.TeacherUploads.isSignatureRemoved() : false
    };

    // --- Mandatory fields (marked with a red * in the form), checked in form order ---
    const fail = (msg, focusId) => {
        if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = msg; }
        alert(msg);
        const el = focusId ? document.getElementById(focusId) : null;
        if (el) el.focus();
    };

    if (!t.teacher_id_number) return fail("Teacher ID is required!", 'tc-teacher-id');
    if (!t.name) return fail("Full Name is required!", 'tc-name');
    const selectedVal = document.getElementById('tc-classes')?.value;
    if (!selectedVal) return fail("Please select a class for 'Class Teacher Of'!", 'tc-classes');
    if (!t.contact_number) return fail("Contact Number is required!", 'tc-contact');
    if (!t.nid_number) return fail("NID Number is required!", 'tc-nid');
    if (!t.photo_data_url) {
        const photoZone = document.getElementById('tc-photo-zone');
        if (photoZone) { photoZone.classList.add('upload-error'); setTimeout(() => photoZone.classList.remove('upload-error'), 2500); }
        return fail("Teacher Photo is required!");
    }
    if (!t.signature_data_url) {
        const signZone = document.getElementById('tc-sign-zone');
        if (signZone) { signZone.classList.add('upload-error'); setTimeout(() => signZone.classList.remove('upload-error'), 2500); }
        return fail("Teacher Signature is required!");
    }

    if (!editId && appLicenseStatus && appLicenseStatus.isTrial) {
        const teachersList = await ipcRenderer.invoke('get-teachers');
        if (teachersList && teachersList.length >= 5) {
            const msg = 'Trial Limit: Maximum 5 teachers allowed in trial mode. Please upgrade to the full license to add more teachers.';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent = msg;
            }
            return alert(msg);
        }
    }

    const selectedClassIds = [parseInt(selectedVal, 10)];

    // Warn if selected class already belongs to a different teacher
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

        resetTeacherForm();
        await loadTeachersPage();
    } else {
        console.error('save-teacher failed:', res.error);
        const errorEl = document.getElementById('tc-error');
        if (errorEl) {
            errorEl.textContent = res.error || 'Could not save teacher.';
            errorEl.style.display = 'block';
        } else {
            alert('Could not save teacher: ' + res.error);
        }
    }
});

window.deleteTeacher = async function (id) {
    if (confirm("Delete this teacher? This can't be undone.")) {
        const res = await ipcRenderer.invoke('delete-teacher', id);
        if (res && res.success === false) {
            alert('Could not delete teacher: ' + (res.error || 'Unknown error'));
            return;
        }
        const editIdEl = document.getElementById('tc-edit-id');
        if (editIdEl && String(editIdEl.value) === String(id)) {
            resetTeacherForm();
        }
        await loadTeachersPage();
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

function getTheoryCell(studentId, subjectId) {
    const row = marksSheet.theoryCells && marksSheet.theoryCells[studentId];
    return row && row[subjectId] !== undefined ? row[subjectId] : '';
}

function getPracticalCell(studentId, subjectId) {
    const row = marksSheet.practicalCells && marksSheet.practicalCells[studentId];
    return row && row[subjectId] !== undefined ? row[subjectId] : '';
}

function setCell(sheet, studentId, subjectId, value) {
    if (!sheet.cells[studentId]) sheet.cells[studentId] = {};
    if (value === '') delete sheet.cells[studentId][subjectId];
    else sheet.cells[studentId][subjectId] = value;
}

function setPracticalCells(sheet, studentId, subjectId, thVal, prVal, totalVal) {
    if (!sheet.theoryCells) sheet.theoryCells = {};
    if (!sheet.practicalCells) sheet.practicalCells = {};
    if (!sheet.cells) sheet.cells = {};

    if (!sheet.theoryCells[studentId]) sheet.theoryCells[studentId] = {};
    if (!sheet.practicalCells[studentId]) sheet.practicalCells[studentId] = {};
    if (!sheet.cells[studentId]) sheet.cells[studentId] = {};

    if (thVal === '') delete sheet.theoryCells[studentId][subjectId];
    else sheet.theoryCells[studentId][subjectId] = thVal;

    if (prVal === '') delete sheet.practicalCells[studentId][subjectId];
    else sheet.practicalCells[studentId][subjectId] = prVal;

    if (totalVal === '') delete sheet.cells[studentId][subjectId];
    else sheet.cells[studentId][subjectId] = totalVal;
}

// Nine/Ten only: a student sits a choosable subject (Physics, Biology,
// Economics, Agriculture Studies, Home Science, etc.) only if it is in their
// saved selections. Every other subject applies to all students.
function studentTakesSubject(studentId, subjectName) {
    const pool = MAIN_SUBJECT_POOLS[currentClassName];
    if (!pool) return true;
    if (!isNineTenChoosable(currentClassName, subjectName)) return true;
    const selections = marksSheet.selMap[studentId] || [];
    if (selections.includes(subjectName)) return true;
    if (subjectName === 'Agriculture/Domestic Science' && selections.includes('Agriculture/Home Science')) return true;
    if (subjectName === 'Agriculture/Home Science' && selections.includes('Agriculture/Domestic Science')) return true;
    if (subjectName === 'Home Science' && (selections.includes('Home Science') || selections.includes('Agriculture/Home Science') || selections.includes('Agriculture/Domestic Science'))) return true;
    if (subjectName === 'Agriculture Studies' && (selections.includes('Agriculture Studies') || selections.includes('Agriculture/Home Science') || selections.includes('Agriculture/Domestic Science'))) return true;
    return false;
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
    document.getElementById('attendance-page').style.display = 'none';
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

    const isPractical = isPracticalSubject(subject.subject_name) || (subject.yearly_theory_marks != null && subject.yearly_practical_marks != null);

    const byStudent = {};
    const byStudentTh = {};
    const byStudentPr = {};
    ALL_MARKS_EXAM_TYPES.forEach(type => {
        byStudent[type] = {};
        byStudentTh[type] = {};
        byStudentPr[type] = {};
    });

    result.marks.forEach(row => {
        if (!ALL_MARKS_EXAM_TYPES.includes(row.exam_type) || !row.student_id) return;
        byStudent[row.exam_type][row.student_id] = row.is_present === 0 ? 'A' : String(row.marks_obtained);
        byStudentTh[row.exam_type][row.student_id] = row.is_present === 0 ? 'A' : (row.theory_marks != null ? String(row.theory_marks) : '—');
        byStudentPr[row.exam_type][row.student_id] = row.is_present === 0 ? 'A' : (row.practical_marks != null ? String(row.practical_marks) : '—');
    });

    let theadHtml = '';
    let rowsHtml = '';

    if (isPractical) {
        theadHtml = `
            <thead>
                <tr>
                    <th rowspan="2">Roll</th>
                    <th rowspan="2">Name</th>
                    <th rowspan="2">1st Monthly</th>
                    <th rowspan="2">2nd Monthly</th>
                    <th colspan="2">Half Yearly</th>
                    <th rowspan="2">3rd Monthly</th>
                    <th rowspan="2">4th Monthly</th>
                    <th colspan="2">Yearly</th>
                </tr>
                <tr>
                    <th>Theory</th>
                    <th>Practical</th>
                    <th>Theory</th>
                    <th>Practical</th>
                </tr>
            </thead>
        `;

        rowsHtml = result.students.map(st => {
            const m1 = byStudent['1st Monthly Exam'][st.id] || '—';
            const m2 = byStudent['2nd Monthly Exam'][st.id] || '—';
            const hyTh = byStudentTh['Half Yearly Exam'][st.id] || (byStudent['Half Yearly Exam'][st.id] ? byStudent['Half Yearly Exam'][st.id] : '—');
            const hyPr = byStudentPr['Half Yearly Exam'][st.id] || (byStudent['Half Yearly Exam'][st.id] === 'A' ? 'A' : '—');
            const m3 = byStudent['3rd Monthly Exam'][st.id] || '—';
            const m4 = byStudent['4th Monthly Exam'][st.id] || '—';
            const yTh = byStudentTh['Yearly Exam'][st.id] || (byStudent['Yearly Exam'][st.id] ? byStudent['Yearly Exam'][st.id] : '—');
            const yPr = byStudentPr['Yearly Exam'][st.id] || (byStudent['Yearly Exam'][st.id] === 'A' ? 'A' : '—');

            return `<tr>
                <td>${formatRoll(st.roll)}</td>
                <td>${escapeHtml(st.name)}</td>
                <td class="marks-view-mark">${escapeHtml(m1)}</td>
                <td class="marks-view-mark">${escapeHtml(m2)}</td>
                <td class="marks-view-mark">${escapeHtml(hyTh)}</td>
                <td class="marks-view-mark">${escapeHtml(hyPr)}</td>
                <td class="marks-view-mark">${escapeHtml(m3)}</td>
                <td class="marks-view-mark">${escapeHtml(m4)}</td>
                <td class="marks-view-mark">${escapeHtml(yTh)}</td>
                <td class="marks-view-mark">${escapeHtml(yPr)}</td>
            </tr>`;
        }).join('');
    } else {
        theadHtml = `
            <thead><tr><th>Roll</th><th>Name</th>${ALL_MARKS_EXAM_TYPES.map(type => `<th>${escapeHtml(type.replace(' Exam', ''))}</th>`).join('')}</tr></thead>
        `;
        rowsHtml = result.students.map(st => {
            const cells = ALL_MARKS_EXAM_TYPES.map(type => byStudent[type][st.id] || '—');
            return `<tr><td>${formatRoll(st.roll)}</td><td>${escapeHtml(st.name)}</td>${cells.map(v => `<td class="marks-view-mark">${escapeHtml(v)}</td>`).join('')}</tr>`;
        }).join('');
    }

    const className = cls ? cls.class_name : 'Class';
    status.textContent = `${className} — ${subject.subject_name} — ${year} (${result.students.length} active student${result.students.length === 1 ? '' : 's'})`;
    const colSpanTotal = isPractical ? 10 : 8;
    wrap.innerHTML = `
        <table class="marks-view-table">
            ${theadHtml}
            <tbody>${rowsHtml || `<tr><td colspan="${colSpanTotal}">No active students in this class.</td></tr>`}</tbody>
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
const TRANSCRIPT_V100_CLASSES = [
    'Play', 'Nursery', 'Class One', 'Class Two', 'Class Three',
    'Class Four', 'Class Five', 'Class Six', 'Class Seven', 'Class Eight',
    'Class Nine (Science)', 'Class Nine (Humanities)', 'Class Nine (Business Studies)',
    'Class Ten (Science)', 'Class Ten (Humanities)', 'Class Ten (Business Studies)'
];

let transcriptClasses = [];
let transcriptSelectedClassId = null;
let transcriptStudents = [];
let transcriptSubjects = [];
let transcriptCurrentClassTeacher = null;
let transcriptHiddenColumns = new Set(['pct', 'gpwo', 'gpa']);   // unchecked by default: percentage, grade points w/o optional, side GPA
let transcriptLoadToken = 0;               // ignores stale async loads
let transcriptMarksData = {};              // studentId -> subjectId -> { m1, m2, m3, total }
let transcriptHighestBySubject = {};       // subjectId -> max total marks across class
let transcriptAttendance = { workingDays: null, present: {} };   // class working days + studentId -> days present
let transcriptIsNineTen = false;           // true when the open class is Nine/Ten (own table layout + GPA rules)
let transcriptClassName = '';              // class_name of the open class
let transcriptStudentSubjects = {};        // studentId -> { mains: [names], optional: name | null }
let transcriptSiblingEntries = [];         // other department's totals, for the combined class position
let cachedSchoolInfo = { name: '', address: '' };

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
    if (transcriptIsNineTen) {
        return [
            { key: 'sn', label: 'S/N', headerHtml: 'S/N' },
            { key: 'subject', label: 'Subject Name', headerHtml: 'Subject Name' },
            { key: 'st', label: 'Full Marks', headerHtml: 'Full<br>Marks' },
            { key: 'high', label: 'Highest Marks', headerHtml: 'Highest<br>Marks' },
            { key: 'm1', label: t1, headerHtml: t1Html, marks: true },
            { key: 'm2', label: t2, headerHtml: t2Html, marks: true },
            { key: 'm3', label: t3, headerHtml: t3Html, marks: true },
            { key: 'total', label: 'Total Marks', headerHtml: 'Total<br>Marks', marks: true },
            { key: 'pct', label: 'Percentage', headerHtml: 'Percentage' },
            { key: 'grade', label: 'Letter Grade', headerHtml: 'Letter<br>Grade' },
            { key: 'gp', label: 'Grade Points', headerHtml: 'Grade<br>Points' },
            { key: 'gpwo', label: 'Grade Points without optional subject', headerHtml: 'Grade Points<br>without optional<br>subject' },
            { key: 'gpa', label: 'GPA', headerHtml: 'GPA' }
        ];
    }

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
    transcriptCurrentClassTeacher = null;
    transcriptHighestBySubject = {};
    document.getElementById('transcript-columns-section').style.display = 'none';
    const optionsSection = document.getElementById('transcript-options-section');
    if (optionsSection) optionsSection.style.display = 'none';
    const showAllTotalsCb = document.getElementById('transcript-show-all-exam-totals');
    if (showAllTotalsCb) showAllTotalsCb.checked = false;
    const combineCb = document.getElementById('transcript-combine-departments');
    if (combineCb) combineCb.checked = true;
    const combineRowEl = document.getElementById('transcript-combine-row');
    if (combineRowEl) combineRowEl.style.display = 'none';
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
    if (transcriptIsNineTen) return buildNineTenTranscriptTable(studentId);
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
    let hasFailedSubject = false;

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
                if (rowGrade.letter === 'F') hasFailedSubject = true;
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

    const gpa = gpCount > 0 ? (hasFailedSubject ? 0 : (totalGP / gpCount)) : null;
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

// ============================================================
// TRANSCRIPT: result summary (positions / GPA / result), remarks, signatures
// ============================================================
let transcriptRemarkRules = [];   // [{ text, min, max }] min/max = overall percentage limits (inclusive)
const REMARK_RULES_STORAGE_KEY = 'transcriptRemarkRules';

function loadTranscriptRemarkRules() {
    try {
        const saved = JSON.parse(localStorage.getItem(REMARK_RULES_STORAGE_KEY));
        if (Array.isArray(saved) && saved.length) { transcriptRemarkRules = saved; return; }
    } catch (e) { /* storage unavailable or corrupt: start fresh */ }
    transcriptRemarkRules = [{ text: '', min: '', max: '' }];
}

function saveTranscriptRemarkRules() {
    try { localStorage.setItem(REMARK_RULES_STORAGE_KEY, JSON.stringify(transcriptRemarkRules)); } catch (e) { }
}

function renderTranscriptRemarkRules() {
    const box = document.getElementById('transcript-remark-rules');
    if (!box) return;
    box.innerHTML = '';

    transcriptRemarkRules.forEach((rule) => {
        const row = document.createElement('div');
        row.className = 'transcript-remark-rule';
        row.innerHTML = `
            <input type="text" class="remark-text" placeholder="Remark (e.g. Excellent)">
            <input type="text" class="remark-min" placeholder="Min %" inputmode="numeric">
            <input type="text" class="remark-max" placeholder="Max %" inputmode="numeric">
            <button type="button" class="remark-remove" title="Remove this remark">✕</button>`;

        const textInput = row.querySelector('.remark-text');
        const minInput = row.querySelector('.remark-min');
        const maxInput = row.querySelector('.remark-max');
        textInput.value = rule.text || '';
        minInput.value = rule.min ?? '';
        maxInput.value = rule.max ?? '';

        const update = () => {
            rule.text = textInput.value;
            rule.min = minInput.value;
            rule.max = maxInput.value;
            saveTranscriptRemarkRules();
            paintTranscriptPreview();
        };
        textInput.addEventListener('input', update);
        [minInput, maxInput].forEach(inp => inp.addEventListener('input', () => {
            inp.value = inp.value.replace(/[^0-9]/g, '');
            update();
        }));

        row.querySelector('.remark-remove').addEventListener('click', () => {
            transcriptRemarkRules = transcriptRemarkRules.filter(r => r !== rule);
            if (!transcriptRemarkRules.length) transcriptRemarkRules.push({ text: '', min: '', max: '' });
            saveTranscriptRemarkRules();
            renderTranscriptRemarkRules();
            paintTranscriptPreview();
        });

        box.appendChild(row);
    });
}

function getTranscriptRemark(avgPct) {
    if (avgPct === null || avgPct === undefined) return '';
    for (const r of transcriptRemarkRules) {
        const text = (r.text || '').trim();
        const a = parseInt(r.min, 10), b = parseInt(r.max, 10);
        if (!text || Number.isNaN(a) || Number.isNaN(b)) continue;
        if (avgPct >= Math.min(a, b) && avgPct <= Math.max(a, b)) return text;
    }
    return '';
}

// Same maths as the table: per-subject percentage -> grade -> average GPA.
function getTranscriptStudentSummary(studentId) {
    if (transcriptIsNineTen) {
        const r = computeNineTenResult(studentId);
        return { total: r.total, hasMarks: r.hasMarks, hasFail: r.hasFail, avgPct: r.avgPct, gpa: r.gpa };
    }
    let total = 0, hasMarks = false, pctSum = 0, pctCount = 0, gpSum = 0, gpCount = 0, hasFail = false;
    transcriptSubjects.forEach(sub => {
        const m = transcriptMarksData[studentId]?.[sub.id];
        const full = (Number(sub.monthly_marks) || 0) * 2 + (Number(sub.yearly_marks) || 0);
        if (m && typeof m.total === 'number') {
            total += m.total;
            hasMarks = true;
            if (full > 0) {
                const rawPct = (m.total / full) * 100;
                pctSum += rawPct; pctCount += 1;
                const g = getGradeFromPercentage(rawPct);
                gpSum += parseFloat(g.point); gpCount += 1;
                if (g.letter === 'F') hasFail = true;
            }
        }
    });
    return {
        total, hasMarks, hasFail,
        avgPct: pctCount > 0 ? Math.round(pctSum / pctCount) : null,
        gpa: gpCount > 0 ? (hasFail ? 0 : gpSum / gpCount) : null
    };
}

// Class position = rank by total marks (highest first). Equal totals share a position.
// Class Nine/Ten can rank Science + Humanities together (the "Combine" tool).
function computeTranscriptClassPositions() {
    let pool = transcriptStudents
        .map(st => ({ id: st.id, total: getTranscriptStudentSummary(st.id) }))
        .filter(e => e.total.hasMarks);

    const combine = document.getElementById('transcript-combine-departments')?.checked ?? true;
    if (transcriptIsNineTen && combine) pool = pool.concat(transcriptSiblingEntries);

    const ranked = pool.sort((x, y) => y.total.total - x.total.total);
    const positions = {};
    let rank = 0;
    ranked.forEach((e, i) => {
        if (i === 0 || e.total.total !== ranked[i - 1].total.total) rank = i + 1;
        positions[e.id] = rank;
    });
    return positions;
}

function buildTranscriptResultSection(studentId, positions) {
    const show = (id) => document.getElementById(id)?.checked ?? true;
    const s = getTranscriptStudentSummary(studentId);

    const cols = [];
    if (show('transcript-show-section-position')) cols.push(['Section Position', 'N/A']);
    if (show('transcript-show-class-position')) cols.push(['Class Position', positions[studentId] ?? '-']);
    cols.push(['Result', s.hasMarks ? (s.hasFail ? 'FAIL' : 'PASS') : '-']);
    cols.push(['GPA', s.gpa !== null ? s.gpa.toFixed(2) : '-']);
    if (show('transcript-show-working-days')) cols.push(['Working Days', transcriptAttendance.workingDays ?? 'N/A']);
    if (show('transcript-show-total-present')) cols.push(['Total Present', transcriptAttendance.present[studentId] ?? 'N/A']);
    const remark = getTranscriptRemark(s.avgPct);

    const sigSrc = (transcriptCurrentClassTeacher && (transcriptCurrentClassTeacher.signature_data_url || transcriptCurrentClassTeacher.signature_path)) || '';
    const teacherSigHtml = sigSrc
        ? `<img src="${sigSrc}" class="transcript-sig-img" alt="Class Teacher Signature" onerror="this.style.display='none'">`
        : '';

    const principalSigSrc = cachedSchoolInfo?.head_teacher_signature_data_url || cachedSchoolInfo?.head_teacher_signature_path || '';
    const principalSigHtml = principalSigSrc
        ? `<img src="${principalSigSrc}" class="transcript-sig-img" alt="Principal Signature" onerror="this.style.display='none'">`
        : '';

    return `
            <div class="transcript-result-summary">
                <table class="transcript-result-table">
                    <thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead>
                    <tbody><tr>${cols.map(c => `<td>${escapeHtml(String(c[1]))}</td>`).join('')}</tr></tbody>
                </table>
                <table class="transcript-remarks-table">
                    <tr><th>Remarks</th><td>${escapeHtml(remark)}</td></tr>
                </table>
            </div>
            <div class="transcript-signature-row">
                <div class="transcript-signature-col">
                    <div class="transcript-signature-space">${teacherSigHtml}</div>
                    <div class="transcript-signature-box">Class Teacher</div>
                </div>
                <div class="transcript-signature-col">
                    <div class="transcript-signature-space">${principalSigHtml}</div>
                    <div class="transcript-signature-box">Principal</div>
                </div>
            </div>`;
}

['transcript-show-section-position', 'transcript-show-class-position',
    'transcript-show-working-days', 'transcript-show-total-present',
    'transcript-show-student-photo'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => paintTranscriptPreview());
    });

document.getElementById('btn-add-remark-rule')?.addEventListener('click', () => {
    transcriptRemarkRules.push({ text: '', min: '', max: '' });
    saveTranscriptRemarkRules();
    renderTranscriptRemarkRules();
});

loadTranscriptRemarkRules();
renderTranscriptRemarkRules();

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
    const schoolLogo = cachedSchoolInfo?.logo_data_url || 'assets/logo.png';
    const positions = computeTranscriptClassPositions();

    const showStudentPhoto = document.getElementById('transcript-show-student-photo')?.checked ?? true;

    const isTrial = !!(appLicenseStatus && appLicenseStatus.isTrial);
    const trialWatermarkHtml = isTrial
        ? `<div class="transcript-trial-watermark">
               <span class="transcript-trial-watermark-brand">EduKit Solutions</span>
               <img src="icon.ico" class="transcript-trial-watermark-icon" alt="EduKit Solutions">
           </div>
           <div class="transcript-trial-footer">
               Unlicensed Trial Version, All copyrights reserved &copy; EduKit Solutions.
           </div>`
        : '';

    preview.innerHTML = transcriptStudents.map(st => {
        const photoSrc = (showStudentPhoto && (st.photo_data_url || st.photo_path))
            ? (st.photo_data_url || st.photo_path)
            : 'assets/std.png';
        const photoImgTag = showStudentPhoto
            ? `<img src="${photoSrc}" class="transcript-std-img" alt="Student Photo" onerror="this.src='assets/std.png'">`
            : '';
        return `
        <div class="transcript-page">
            ${trialWatermarkHtml}
            <div class="transcript-header-top">
                <div class="transcript-std-img-wrap">
                    ${photoImgTag}
                </div>
                <div class="transcript-inst-header">
                    ${schoolName ? `<div class="transcript-inst-name">${escapeHtml(schoolName)}</div>` : ''}
                    ${schoolAddress ? `<div class="transcript-inst-address">${escapeHtml(schoolAddress)}</div>` : ''}
                    <div class="transcript-logo-wrap"><img src="${schoolLogo}" class="transcript-inst-logo" alt="School Logo" onerror="this.src='assets/logo.png'"></div>
                </div>
                <div class="transcript-grade-scale-box">
                    <table class="transcript-grade-scale-table">
                        <thead>
                            <tr><th>Range</th><th>Letter Grade</th><th>Grade Point</th></tr>
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
                    <div class="transcript-info-row"><span class="info-label">Student ID</span><span class="info-colon">:</span><span class="info-value">${escapeHtml(String(st.student_id_number || st.roll))}</span></div>
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
            ${buildTranscriptResultSection(st.id, positions)}
        </div>`;
    }).join('');
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
        status.textContent = `The transcript template for ${cls.class_name} is not available yet (it currently covers Play to Class Ten).`;
        return;
    }

    const token = ++transcriptLoadToken;
    status.textContent = 'Loading students...';

    try {
        const [classesList, students, allSubjects, schoolInfo, allTeachers] = await Promise.all([
            ipcRenderer.invoke('get-classes-list').catch(() => []),
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
            }),
            ipcRenderer.invoke('get-teachers').catch(err => {
                console.error('Failed to get teachers:', err);
                return [];
            })
        ]);
        if (classesList && classesList.length) transcriptClasses = classesList;
        const currentCls = transcriptClasses.find(c => String(c.id) === String(transcriptSelectedClassId)) || cls;
        transcriptCurrentClassTeacher = (allTeachers || []).find(t => t.id === currentCls.class_teacher_id) || null;
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


        // Attendance for this class + year + test (Half Yearly / Yearly), read from the database
        const attendanceRes = await ipcRenderer.invoke('get-attendance-sheet', {
            class_id: cls.id, year, term: test
        }).catch(() => null);
        if (token !== transcriptLoadToken) return;

        transcriptAttendance = { workingDays: null, present: {} };
        if (attendanceRes && attendanceRes.success) {
            transcriptAttendance.workingDays = attendanceRes.working_days;
            attendanceRes.records.forEach(r => {
                transcriptAttendance.present[r.student_id] = r.days_present;
            });
        }

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

        // ---- Class Nine / Ten extras: each student's Main/Optional subjects + the other department's totals ----
        transcriptIsNineTen = !!MAIN_SUBJECT_POOLS[cls.class_name];
        transcriptClassName = cls.class_name;
        transcriptStudentSubjects = {};
        transcriptSiblingEntries = [];
        let missingSelectionNote = '';

        if (transcriptIsNineTen) {
            transcriptStudents.forEach(st => { transcriptStudentSubjects[st.id] = { mains: [], optional: null }; });
            ((marksSheets[0] && marksSheets[0].studentSubjects) || []).forEach(r => {
                const entry = transcriptStudentSubjects[r.student_id];
                if (!entry) return;
                if (r.role === 'optional') entry.optional = r.subject_name;
                else entry.mains.push(r.subject_name);
            });
            const missing = transcriptStudents.filter(st => transcriptStudentSubjects[st.id].mains.length === 0).length;
            if (missing > 0) missingSelectionNote = ` — ${missing} student(s) have no Main/Optional subjects saved`;

            transcriptSiblingEntries = await loadNineTenSiblingTotals(cls, allSubjects, exams);
            if (token !== transcriptLoadToken) return;
        }
        const combineRow = document.getElementById('transcript-combine-row');
        if (combineRow) combineRow.style.display = transcriptIsNineTen ? 'block' : 'none';

        status.textContent = `${cls.class_name} — ${test} Transcript — ${year} (${transcriptStudents.length} student${transcriptStudents.length === 1 ? '' : 's'}, one page each)${missingSelectionNote}`;
        columnsSection.style.display = 'block';
        if (optionsSection) optionsSection.style.display = 'block';
        generateBtn.style.display = 'inline-block';
        updateTrialUiIndicators();
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
document.getElementById('btn-generate-transcript').addEventListener('click', async () => {
    if (appLicenseStatus && appLicenseStatus.isTrial) {
        alert('Generating PDF is disabled in the Trial Version. Please upgrade to the full license to export transcript PDFs.');
        const status = document.getElementById('transcript-status');
        if (status) status.textContent = 'PDF generation is disabled in Trial Mode.';
        return;
    }

    const preview = document.getElementById('transcript-preview');
    const status = document.getElementById('transcript-status');
    const generateBtn = document.getElementById('btn-generate-transcript');

    if (!transcriptStudents || !transcriptStudents.length || !preview.innerHTML.trim()) {
        alert('Please select a class and ensure transcripts are loaded before generating PDF.');
        return;
    }

    const year = document.getElementById('transcript-year').value;
    const test = document.getElementById('transcript-test').value;
    const cls = transcriptClasses.find(c => String(c.id) === String(transcriptSelectedClassId));
    const className = cls ? cls.class_name : 'Class';

    const cleanClassName = className.replace(/[/\\?%*:|"<>]/g, '-');
    const cleanTest = test.replace(/[/\\?%*:|"<>]/g, '-');
    const defaultFileName = `Transcripts - ${cleanClassName} - ${cleanTest} (${year}).pdf`;

    const originalBtnText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating PDF...';
    if (status) status.textContent = `Generating PDF for ${transcriptStudents.length} student(s)...`;

    try {
        const res = await ipcRenderer.invoke('generate-transcripts-pdf', {
            html: preview.innerHTML,
            defaultFileName
        });

        if (res && res.success) {
            if (status) {
                status.innerHTML = `✅ Saved ${transcriptStudents.length} transcript(s) to <b>${escapeHtml(res.filePath)}</b> (<a href="#" id="link-open-transcript-folder" style="color:#2563eb; text-decoration:underline;">Show in folder</a>)`;
                const link = document.getElementById('link-open-transcript-folder');
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        ipcRenderer.invoke('show-item-in-folder', res.filePath);
                    });
                }
            }
        } else if (res && res.cancelled) {
            if (status) status.textContent = 'PDF export cancelled.';
        } else {
            alert('Could not generate PDF: ' + ((res && res.error) || 'Unknown error'));
            if (status) status.textContent = 'Error generating PDF: ' + ((res && res.error) || 'Unknown error');
        }
    } catch (err) {
        console.error('Failed to generate PDF:', err);
        alert('Error generating PDF: ' + err.message);
        if (status) status.textContent = 'Error: ' + err.message;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = originalBtnText;
    }
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
    const theoryCells = {};
    const practicalCells = {};

    sheet.marks.forEach(m => {
        if (!cells[m.student_id]) cells[m.student_id] = {};
        cells[m.student_id][m.subject_id] = m.is_present === 0 ? 'A' : String(m.marks_obtained);

        if (!theoryCells[m.student_id]) theoryCells[m.student_id] = {};
        theoryCells[m.student_id][m.subject_id] = m.is_present === 0 ? 'A' : (m.theory_marks != null ? String(m.theory_marks) : '');

        if (!practicalCells[m.student_id]) practicalCells[m.student_id] = {};
        practicalCells[m.student_id][m.subject_id] = m.is_present === 0 ? 'A' : (m.practical_marks != null ? String(m.practical_marks) : '');
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
        theoryCells,
        practicalCells,
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
    const isYearly = !examUsesMonthlyTotal(s.examType);
    const isPractical = isYearly && (isPracticalSubject(sub.subject_name) || (sub.yearly_theory_marks != null && sub.yearly_practical_marks != null));
    const thMax = sub.yearly_theory_marks != null ? sub.yearly_theory_marks : 75;
    const prMax = sub.yearly_practical_marks != null ? sub.yearly_practical_marks : 25;

    let notes = '';
    if (s.missingSelections > 0) {
        notes += `<div class="marks-warn">${s.missingSelections} student(s) in this class have no subject selection saved, so they will not appear under Physics, Biology, Economics, etc. Set their subjects in the Students tab.</div>`;
    }
    if (s.hiddenSubjects.length) {
        notes += `<div class="marks-note">Not shown (no ${kind} total set): ${escapeHtml(s.hiddenSubjects.join(', '))}</div>`;
    }

    const headerHtml = isPractical
        ? `<div class="marks-row marks-row-practical marks-row-head"><span>Roll</span><span>Name</span><span>Theory (${thMax})</span><span>Practical (${prMax})</span><span>Total</span><span>Status</span></div>`
        : `<div class="marks-row marks-row-head"><span>Roll</span><span>Name</span><span>Marks</span><span>Status</span></div>`;

    const outOfText = isPractical
        ? `out of ${total} (Theory: ${thMax}, Practical: ${prMax})`
        : `out of ${total}`;

    container.innerHTML = `
        ${heading}
        <div id="subject-chips" class="chip-row"></div>
        <div class="marks-head">
            <div><span class="marks-subject-title">${escapeHtml(sub.subject_name)}</span> <span class="marks-outof">${outOfText}</span></div>
            <div id="marks-progress" class="marks-progress"></div>
        </div>
        ${notes}
        <div class="marks-card">
            ${headerHtml}
            <div id="marks-rows"></div>
        </div>
        <div class="marks-foot">
            <span>Enter moves down. Type <b>A</b> for absent. Leave blank if not entered yet.</span>
            <span id="marks-save-status"></span>
        </div>
    `;

    renderSubjectChips();
    if (isPractical) {
        renderMarkRowsPractical(sub, thMax, prMax, total);
    } else {
        renderMarkRows(sub, total);
    }
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

// Renders marks entry table for practical subjects (Theory + Practical columns)
function renderMarkRowsPractical(sub, thMax, prMax, total) {
    const rowsEl = document.getElementById('marks-rows');
    rowsEl.innerHTML = '';
    const list = studentsForSubject(sub);

    if (!list.length) {
        rowsEl.innerHTML = `<div class="marks-empty-row">No student in this class has been assigned ${escapeHtml(sub.subject_name)}.</div>`;
        return;
    }

    list.forEach(st => {
        const row = document.createElement('div');
        row.className = 'marks-row marks-row-practical';
        row.innerHTML = `
            <span class="marks-roll">${formatRoll(st.roll)}</span>
            <span class="marks-name">${escapeHtml(st.name)}</span>
            <span><input type="text" class="mark-cell mark-cell-th" style="width:75px;" inputmode="decimal" autocomplete="off" placeholder="0-${thMax}"></span>
            <span><input type="text" class="mark-cell mark-cell-pr" style="width:75px;" inputmode="decimal" autocomplete="off" placeholder="0-${prMax}"></span>
            <span class="marks-practical-total" style="font-weight:600; color:#1e293b; padding-left:4px;">—</span>
            <span class="marks-status"></span>`;

        const thInput = row.querySelector('.mark-cell-th');
        const prInput = row.querySelector('.mark-cell-pr');
        const totalSpan = row.querySelector('.marks-practical-total');
        const statusEl = row.querySelector('.marks-status');

        thInput.dataset.student = st.id;
        prInput.dataset.student = st.id;

        const savedTh = getTheoryCell(st.id, sub.id);
        const savedPr = getPracticalCell(st.id, sub.id);
        const savedTotal = getCell(st.id, sub.id);

        thInput.value = savedTh;
        prInput.value = savedPr;
        updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);

        [thInput, prInput].forEach(inp => {
            inp.addEventListener('focus', () => inp.select());
            inp.addEventListener('input', () => {
                inp.value = sanitizeMarkInput(inp.value);
                updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);
            });
            inp.addEventListener('change', () => commitMarkPractical(thInput, prInput, sub, thMax, prMax, total, totalSpan, statusEl));
        });

        // Key navigation between cells and rows
        thInput.addEventListener('keydown', async (e) => {
            const allTh = Array.from(document.querySelectorAll('#marks-rows .mark-cell-th'));
            const idx = allTh.indexOf(thInput);
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (allTh[idx - 1]) allTh[idx - 1].focus();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (allTh[idx + 1]) allTh[idx + 1].focus();
                return;
            }
            if (e.key === 'Enter' || e.key === 'ArrowRight') {
                e.preventDefault();
                prInput.focus();
            }
        });

        prInput.addEventListener('keydown', async (e) => {
            const allPr = Array.from(document.querySelectorAll('#marks-rows .mark-cell-pr'));
            const idx = allPr.indexOf(prInput);
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                thInput.focus();
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (allPr[idx - 1]) allPr[idx - 1].focus();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (allPr[idx + 1]) allPr[idx + 1].focus();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const ok = await commitMarkPractical(thInput, prInput, sub, thMax, prMax, total, totalSpan, statusEl);
                if (allPr[idx + 1]) {
                    const allTh = Array.from(document.querySelectorAll('#marks-rows .mark-cell-th'));
                    if (allTh[idx + 1]) allTh[idx + 1].focus();
                } else if (ok) {
                    goToNextSubject();
                }
            }
        });

        rowsEl.appendChild(row);
    });
}

function updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total) {
    const th = thInput.value.trim().toUpperCase();
    const pr = prInput.value.trim().toUpperCase();

    if (th === '' && pr === '') {
        totalSpan.textContent = '—';
        statusEl.textContent = 'Empty';
        statusEl.className = 'marks-status st-empty';
        return;
    }

    if (th === 'A' || pr === 'A') {
        totalSpan.textContent = 'A';
        statusEl.textContent = 'Absent';
        statusEl.className = 'marks-status st-absent';
        return;
    }

    const thNum = th !== '' ? parseFloat(th) : null;
    const prNum = pr !== '' ? parseFloat(pr) : null;

    if (thNum !== null && thNum > thMax) {
        totalSpan.textContent = '—';
        statusEl.textContent = `Th Max ${thMax}`;
        statusEl.className = 'marks-status st-error';
        return;
    }
    if (prNum !== null && prNum > prMax) {
        totalSpan.textContent = '—';
        statusEl.textContent = `Pr Max ${prMax}`;
        statusEl.className = 'marks-status st-error';
        return;
    }

    const sum = (thNum || 0) + (prNum || 0);
    totalSpan.textContent = String(sum);
    statusEl.textContent = 'Entered';
    statusEl.className = 'marks-status st-ok';
}

async function commitMarkPractical(thInput, prInput, sub, thMax, prMax, total, totalSpan, statusEl) {
    const sheet = marksSheet;
    const studentId = Number(thInput.dataset.student);
    const thText = normalizeMarkText(thInput.value);
    const prText = normalizeMarkText(prInput.value);
    thInput.value = thText;
    prInput.value = prText;

    const oldTh = getTheoryCell(studentId, sub.id);
    const oldPr = getPracticalCell(studentId, sub.id);

    if (thText === oldTh && prText === oldPr) {
        updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);
        return true;
    }

    if (thText !== '' && thText !== 'A' && parseFloat(thText) > thMax) {
        updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);
        setSaveStatus(`Not saved: ${sub.subject_name} Theory is out of ${thMax}.`, true);
        return false;
    }

    if (prText !== '' && prText !== 'A' && parseFloat(prText) > prMax) {
        updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);
        setSaveStatus(`Not saved: ${sub.subject_name} Practical is out of ${prMax}.`, true);
        return false;
    }

    setSaveStatus('Saving…', false);
    const res = await ipcRenderer.invoke('save-mark', {
        exam_id: currentExam.id,
        student_id: studentId,
        subject_id: sub.id,
        theory_value: thText,
        practical_value: prText,
        is_practical: true
    });

    if (!res || !res.success) {
        setSaveStatus('Not saved: ' + ((res && res.error) || 'unknown error'), true);
        return false;
    }

    let calculatedTotal = '';
    if (thText === 'A' || prText === 'A') {
        calculatedTotal = 'A';
    } else if (thText !== '' || prText !== '') {
        const sum = (thText !== '' ? parseFloat(thText) : 0) + (prText !== '' ? parseFloat(prText) : 0);
        calculatedTotal = String(sum);
    }

    setPracticalCells(sheet, studentId, sub.id, thText, prText, calculatedTotal);
    if (marksSheet !== sheet) return true;
    updatePracticalRowDisplay(thInput, prInput, totalSpan, statusEl, thMax, prMax, total);
    setSaveStatus('Saved', false);
    renderSubjectChips();
    updateProgressText();
    return true;
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

// --- "APPEARS IN EXAMS" CHECKBOXES: block the marks field while its checkbox is unchecked ---
function syncSubjectMarksInput(checkId, inputId, errorId) {
    const check = document.getElementById(checkId);
    const input = document.getElementById(inputId);
    if (!check || !input) return;
    input.disabled = !check.checked;
    input.style.cursor = check.checked ? '' : 'not-allowed';
    input.style.background = check.checked ? '' : '#f1f5f9';
    if (!check.checked) {
        input.value = '';
        const errorEl = errorId && document.getElementById(errorId);
        if (errorEl) errorEl.textContent = '';
    }
}

document.getElementById('sub-monthly-check').addEventListener('change', () =>
    syncSubjectMarksInput('sub-monthly-check', 'sub-monthly-input', 'sub-monthly-error'));
document.getElementById('sub-yearly-check').addEventListener('change', () =>
    syncSubjectMarksInput('sub-yearly-check', 'sub-yearly-input', 'sub-yearly-error'));
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

function handleNotificationTarget(targetStr) {
    if (!targetStr) return;
    try {
        const target = typeof targetStr === 'string' ? JSON.parse(targetStr) : targetStr;
        if (target.tab) {
            window.switchTab(target.tab);
        }
        if (target.section) {
            setTimeout(() => {
                const el = document.getElementById(target.section);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    window.triggerFormHighlight?.(el);
                }
            }, 150);
        }
    } catch (e) {
        console.error('Failed to handle notification target:', e);
    }
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
        if (n.target) {
            item.style.cursor = 'pointer';
            item.title = 'Click to open';
            item.addEventListener('click', () => {
                handleNotificationTarget(n.target);
                closeNotificationPanel();
            });
        }
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
    // Only show notification toasts when the user is logged into the main application (dashboard)
    if (!notificationsStarted || !dashboardScreen || dashboardScreen.style.display !== 'block') {
        return;
    }
    const wrap = document.getElementById('notif-toasts');
    if (!wrap) return;
    while (wrap.children.length >= MAX_VISIBLE_TOASTS) wrap.removeChild(wrap.firstChild);

    const toast = document.createElement('div');
    toast.className = 'notif-toast ' + n.severity;
    toast.innerHTML = `<b>${escapeHtml(n.title)}</b>${escapeHtml(n.message)}`;
    if (n.target) {
        toast.style.cursor = 'pointer';
        toast.title = 'Click to open';
        toast.addEventListener('click', () => {
            handleNotificationTarget(n.target);
            toast.remove();
        });
    }
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

// main.js says something changed: refresh, and slide in the brand-new messages (inside dashboard only).
ipcRenderer.on('notifications-changed', async (event, payload) => {
    if (!notificationsStarted || !dashboardScreen || dashboardScreen.style.display !== 'block') {
        return;
    }
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
    await refreshNotifications();                      // existing messages: badge only
    await ipcRenderer.invoke('run-data-checks');       // check data conditions

    // Pop up reminder toast inside the main application after login if Head Teacher signature is missing
    setTimeout(() => {
        const headTeacherNotif = (notificationList || []).find(n => n.key === 'head-teacher:missing-signature');
        if (headTeacherNotif) {
            showNotificationToast(headTeacherNotif);
        }
    }, 600);
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
enableEnterNavigation(document.getElementById('school-setup-screen'), document.getElementById('btn-save-school-setup'));
enableEnterNavigation(document.getElementById('academic-setup-screen'), document.getElementById('btn-save-academic-setup'));

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
enforceNumericInput('sub-yearly-theory-input', 'sub-yearly-theory-error');
enforceNumericInput('sub-yearly-practical-input', 'sub-yearly-practical-error');

// --- AUTO-FORMATTING FOR DD/MM/YYYY DATE INPUTS ---
function setupDateInputFormatting(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;

    el.addEventListener('input', (e) => {
        let val = el.value.replace(/[^0-9]/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        let formatted = '';
        if (val.length > 4) {
            formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        } else if (val.length > 2) {
            formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
        } else {
            formatted = val;
        }
        el.value = formatted;
    });

    el.addEventListener('blur', () => {
        if (el.value.trim()) {
            el.value = formatDob(el.value.trim());
        }
    });
}

setupDateInputFormatting('st-dob');



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

const btnCancelStudent = document.getElementById('btn-cancel-student');
if (btnCancelStudent) {
    btnCancelStudent.addEventListener('click', () => {
        resetStudentForm();
        window.closeDetailsSmooth(document.getElementById('student-details'));
    });
}
const btnCancelTeacher = document.getElementById('btn-cancel-teacher');
if (btnCancelTeacher) {
    btnCancelTeacher.addEventListener('click', () => {
        resetTeacherForm();
        window.closeDetailsSmooth(document.getElementById('teacher-details'));
    });
}
const btnCancelSubject = document.getElementById('btn-cancel-subject');
if (btnCancelSubject) {
    btnCancelSubject.addEventListener('click', () => {
        resetSubjectForm();
        window.closeDetailsSmooth(document.getElementById('subject-details'));
    });
}

// ============================================================
// SCHOOL INFORMATION PROFILE (Settings -> School Info)
// ============================================================
let settingsLogoController = null;
let headTeacherSignController = null;

function initSettingsLogoZone() {
    if (!settingsLogoController) {
        const feedback = document.getElementById('school-info-feedback');
        settingsLogoController = attachLogoZoneHandlers({
            zoneId: 'settings-logo-zone',
            fileInputId: 'settings-logo-input',
            previewId: 'settings-logo-preview',
            phId: 'settings-logo-ph',
            clearBtnId: 'settings-logo-clear',
            filenameId: 'settings-logo-filename',
            label: 'School Logo',
            maxBytes: 5 * 1024 * 1024,
            onError: (msg) => {
                if (feedback) {
                    feedback.style.color = '#ef4444';
                    feedback.textContent = msg;
                }
            }
        });
    }
}

function initHeadTeacherSignZone() {
    if (!headTeacherSignController) {
        const feedback = document.getElementById('head-teacher-info-feedback');
        headTeacherSignController = attachLogoZoneHandlers({
            zoneId: 'head-teacher-sign-zone',
            fileInputId: 'head-teacher-sign-input',
            previewId: 'head-teacher-sign-preview',
            phId: 'head-teacher-sign-ph',
            clearBtnId: 'head-teacher-sign-clear',
            filenameId: 'head-teacher-sign-filename',
            label: 'Signature',
            maxBytes: 2 * 1024 * 1024,
            onError: (msg) => {
                if (feedback) {
                    feedback.style.color = '#ef4444';
                    feedback.textContent = msg;
                }
            }
        });
    }
}

async function loadSchoolInfo() {
    try {
        initSettingsLogoZone();
        initHeadTeacherSignZone();
        const info = await ipcRenderer.invoke('get-school-info');
        if (info) {
            cachedSchoolInfo = info;
            const nameEl = document.getElementById('school-name-input');
            const addrEl = document.getElementById('school-address-input');
            const headNameEl = document.getElementById('head-teacher-name-input');

            if (nameEl) nameEl.value = info.name || '';
            if (addrEl) addrEl.value = info.address || '';
            if (headNameEl) headNameEl.value = info.head_teacher_name || '';

            if (settingsLogoController) {
                if (info.logo_data_url) {
                    settingsLogoController.setLogo(info.logo_data_url, 'Current Logo');
                } else {
                    settingsLogoController.reset();
                }
            }

            if (headTeacherSignController) {
                if (info.head_teacher_signature_data_url) {
                    headTeacherSignController.setLogo(info.head_teacher_signature_data_url, 'Current Signature');
                } else {
                    headTeacherSignController.reset();
                }
            }
        }
    } catch (err) {
        console.error('Error loading school info:', err);
    }
}

function setupSchoolInfoHandlers() {
    initSettingsLogoZone();
    const btnSaveSchoolInfo = document.getElementById('btn-save-school-info');
    if (btnSaveSchoolInfo && !btnSaveSchoolInfo.dataset.bound) {
        btnSaveSchoolInfo.dataset.bound = 'true';
        btnSaveSchoolInfo.addEventListener('click', async () => {
            const name = document.getElementById('school-name-input')?.value.trim() || '';
            const address = document.getElementById('school-address-input')?.value.trim() || '';
            const feedback = document.getElementById('school-info-feedback');

            const logoState = settingsLogoController ? settingsLogoController.getState() : {};

            const result = await ipcRenderer.invoke('save-school-info', {
                name,
                address,
                logo_data_url: logoState.dataUrl || null,
                logo_removed: logoState.isRemoved
            });

            if (result && result.success) {
                cachedSchoolInfo = {
                    ...cachedSchoolInfo,
                    name,
                    address,
                    logo_path: result.logo_path || null,
                    logo_data_url: logoState.dataUrl || null
                };
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

function setupHeadTeacherInfoHandlers() {
    initHeadTeacherSignZone();
    const btnSaveHeadTeacherInfo = document.getElementById('btn-save-head-teacher-info');
    if (btnSaveHeadTeacherInfo && !btnSaveHeadTeacherInfo.dataset.bound) {
        btnSaveHeadTeacherInfo.dataset.bound = 'true';
        btnSaveHeadTeacherInfo.addEventListener('click', async () => {
            const headTeacherName = document.getElementById('head-teacher-name-input')?.value.trim() || '';
            const feedback = document.getElementById('head-teacher-info-feedback');
            const signState = headTeacherSignController ? headTeacherSignController.getState() : {};

            btnSaveHeadTeacherInfo.disabled = true;
            btnSaveHeadTeacherInfo.textContent = 'Saving...';

            const result = await ipcRenderer.invoke('save-head-teacher-info', {
                head_teacher_name: headTeacherName,
                signature_data_url: signState.dataUrl || null,
                signature_removed: signState.isRemoved
            });

            btnSaveHeadTeacherInfo.disabled = false;
            btnSaveHeadTeacherInfo.textContent = 'Save Configuration';

            if (result && result.success) {
                cachedSchoolInfo = {
                    ...cachedSchoolInfo,
                    head_teacher_name: headTeacherName,
                    head_teacher_signature_path: result.signature_path || null,
                    head_teacher_signature_data_url: signState.dataUrl || null
                };
                if (feedback) {
                    feedback.style.color = '#10b981';
                    feedback.textContent = 'Configuration saved successfully!';
                    setTimeout(() => { if (feedback) feedback.textContent = ''; }, 3000);
                }
                // If transcript is currently open, repaint preview to show the new signature immediately
                if (document.getElementById('transcript-page')?.style.display === 'block') {
                    paintTranscriptPreview();
                }
            } else {
                if (feedback) {
                    feedback.style.color = '#ef4444';
                    feedback.textContent = 'Error: ' + ((result && result.message) || 'Failed to save configuration');
                }
            }
        });
    }
}

setupSchoolInfoHandlers();
setupHeadTeacherInfoHandlers();
loadSchoolInfo();



// ============================================================
// ATTENDANCE PAGE: working days per class + days present per student.
// Saved per class/student + year + term ('Half Yearly' or 'Yearly').
// ============================================================
let attendanceClasses = [];
let attendanceSelectedClassId = null;
let attendanceSheet = null;     // { classId, className, year, term, students, present: {studentId: 'text'}, workingDays }
let attendanceLoadToken = 0;    // ignores stale async loads

function openAttendancePage() {
    document.getElementById('exams-home-view').style.display = 'none';
    document.getElementById('attendance-page').style.display = 'block';
    attendanceSelectedClassId = null;
    resetAttendanceView('Select a class to enter attendance.');
    ipcRenderer.invoke('get-classes-list').then(classes => {
        attendanceClasses = classes;
        renderAttendanceClassButtons();
    });
}

function resetAttendanceView(message) {
    attendanceSheet = null;
    const wd = document.getElementById('attendance-working-days');
    wd.value = '';
    wd.disabled = true;
    document.getElementById('attendance-entry-container').innerHTML = '';
    document.getElementById('attendance-status').textContent = message;
}

function renderAttendanceClassButtons() {
    const container = document.getElementById('attendance-class-buttons');
    container.innerHTML = '';
    attendanceClasses.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip-btn' + (String(c.id) === String(attendanceSelectedClassId) ? ' active' : '');
        btn.textContent = c.class_name;
        btn.addEventListener('click', () => {
            attendanceSelectedClassId = c.id;
            renderAttendanceClassButtons();
            loadAttendanceSheet();
        });
        container.appendChild(btn);
    });
}

async function loadAttendanceSheet() {
    const cls = attendanceClasses.find(c => String(c.id) === String(attendanceSelectedClassId));
    if (!cls) { resetAttendanceView('Select a class to enter attendance.'); return; }

    const year = parseInt(document.getElementById('attendance-year').value, 10);
    const term = document.getElementById('attendance-term').value;
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        resetAttendanceView('Enter a valid year between 2000 and 2100.');
        return;
    }

    const token = ++attendanceLoadToken;
    resetAttendanceView('Loading…');
    const res = await ipcRenderer.invoke('get-attendance-sheet', { class_id: cls.id, year, term });
    if (token !== attendanceLoadToken) return;
    if (!res || !res.success) {
        document.getElementById('attendance-status').textContent = (res && res.error) || 'Could not load attendance.';
        return;
    }

    const present = {};
    res.records.forEach(r => { present[r.student_id] = String(r.days_present); });
    attendanceSheet = {
        classId: cls.id, className: cls.class_name, year, term,
        students: res.students, present, workingDays: res.working_days
    };

    const wd = document.getElementById('attendance-working-days');
    wd.disabled = false;
    wd.value = res.working_days === null ? '' : String(res.working_days);
    renderAttendanceRows();
}

function setAttendanceSaveStatus(text, isError) {
    const el = document.getElementById('attendance-save-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#dc2626' : '#16a34a';
}

function paintAttendanceStatus(statusEl, text) {
    const wd = attendanceSheet ? attendanceSheet.workingDays : null;
    let label = 'Empty';
    let cls = 'st-empty';
    if (text !== '') {
        if (wd !== null && parseInt(text, 10) > wd) { label = `Max ${wd}`; cls = 'st-error'; }
        else { label = 'Entered'; cls = 'st-ok'; }
    }
    statusEl.textContent = label;
    statusEl.className = 'marks-status ' + cls;
}

function updateAttendanceProgress() {
    const el = document.getElementById('attendance-progress');
    if (!el || !attendanceSheet) return;
    const total = attendanceSheet.students.length;
    const done = attendanceSheet.students.filter(st => (attendanceSheet.present[st.id] ?? '') !== '').length;
    el.textContent = `${done} of ${total} entered`;
}

function updateAttendanceWorkingDaysNote() {
    const note = document.getElementById('attendance-wd-note');
    if (note && attendanceSheet) note.style.display = attendanceSheet.workingDays === null ? 'block' : 'none';
}

function renderAttendanceRows() {
    const s = attendanceSheet;
    const container = document.getElementById('attendance-entry-container');
    document.getElementById('attendance-status').textContent = `${s.className} — ${s.term} — ${s.year}`;

    if (!s.students.length) {
        container.innerHTML = `<p class="marks-msg-error">This class has no active students. Add students in the Students tab first.</p>`;
        return;
    }

    container.innerHTML = `
        <div id="attendance-wd-note" class="marks-warn" style="display:none;">Enter the total working days above first, so the days present can be checked against it.</div>
        <div class="marks-head"><div></div><div id="attendance-progress" class="marks-progress"></div></div>
        <div class="marks-card">
            <div class="marks-row marks-row-head"><span>Roll</span><span>Name</span><span>Days Present</span><span>Status</span></div>
            <div id="attendance-rows"></div>
        </div>
        <div class="marks-foot">
            <span>Enter moves down. Leave blank if not entered yet.</span>
            <span id="attendance-save-status"></span>
        </div>`;

    const rowsEl = document.getElementById('attendance-rows');
    s.students.forEach(st => {
        const row = document.createElement('div');
        row.className = 'marks-row';
        row.innerHTML = `
            <span class="marks-roll">${formatRoll(st.roll)}</span>
            <span>${escapeHtml(st.name)}</span>
            <span><input type="text" class="mark-cell attendance-cell" inputmode="numeric" autocomplete="off"></span>
            <span class="marks-status"></span>`;
        const input = row.querySelector('.attendance-cell');
        const statusEl = row.querySelector('.marks-status');
        input.dataset.student = st.id;
        input.value = s.present[st.id] ?? '';
        paintAttendanceStatus(statusEl, input.value);

        input.addEventListener('focus', () => input.select());
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
            paintAttendanceStatus(statusEl, input.value);
        });
        input.addEventListener('change', () => commitAttendance(input, statusEl));
        input.addEventListener('keydown', async (e) => {
            const inputs = Array.from(document.querySelectorAll('#attendance-rows .attendance-cell'));
            const idx = inputs.indexOf(input);
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (inputs[idx - 1]) inputs[idx - 1].focus();
                return;
            }
            if (e.key !== 'Enter' && e.key !== 'ArrowDown') return;
            e.preventDefault();
            if (inputs[idx + 1]) { inputs[idx + 1].focus(); return; }
            if (e.key === 'Enter') await commitAttendance(input, statusEl);
        });

        rowsEl.appendChild(row);
    });

    updateAttendanceWorkingDaysNote();
    updateAttendanceProgress();

    if (s.workingDays === null) {
        document.getElementById('attendance-working-days').focus();
    } else {
        const inputs = Array.from(document.querySelectorAll('#attendance-rows .attendance-cell'));
        const target = inputs.find(i => i.value === '') || inputs[0];
        if (target) target.focus();
    }
}

// Saves one student's days present. Returns true if fine (saved or unchanged).
async function commitAttendance(input, statusEl) {
    const sheet = attendanceSheet;
    if (!sheet) return false;
    const studentId = Number(input.dataset.student);
    let text = input.value.trim();
    if (text !== '') text = String(parseInt(text, 10));
    input.value = text;

    if (text === (sheet.present[studentId] ?? '')) {
        paintAttendanceStatus(statusEl, text);
        return true;
    }

    if (text !== '' && sheet.workingDays !== null && parseInt(text, 10) > sheet.workingDays) {
        paintAttendanceStatus(statusEl, text);
        setAttendanceSaveStatus(`Not saved: cannot be more than ${sheet.workingDays} working days.`, true);
        return false;
    }

    setAttendanceSaveStatus('Saving…', false);
    const res = await ipcRenderer.invoke('save-attendance', {
        student_id: studentId, year: sheet.year, term: sheet.term, days_present: text
    });
    if (!res || !res.success) {
        setAttendanceSaveStatus('Not saved: ' + ((res && res.error) || 'unknown error'), true);
        return false;
    }

    if (text === '') delete sheet.present[studentId];
    else sheet.present[studentId] = text;
    if (attendanceSheet !== sheet) return true;
    paintAttendanceStatus(statusEl, text);
    setAttendanceSaveStatus('Saved', false);
    updateAttendanceProgress();
    return true;
}

// Saves the class's total working days, then re-checks every student's box against it.
async function commitAttendanceWorkingDays() {
    const sheet = attendanceSheet;
    if (!sheet) return;
    const wdInput = document.getElementById('attendance-working-days');
    let text = wdInput.value.trim();
    if (text !== '') text = String(parseInt(text, 10));
    wdInput.value = text;
    const value = text === '' ? null : parseInt(text, 10);
    if (value === sheet.workingDays) return;

    const res = await ipcRenderer.invoke('save-working-days', {
        class_id: sheet.classId, year: sheet.year, term: sheet.term, working_days: text
    });
    if (!res || !res.success) {
        wdInput.value = sheet.workingDays === null ? '' : String(sheet.workingDays);
        setAttendanceSaveStatus('Not saved: ' + ((res && res.error) || 'unknown error'), true);
        return;
    }

    sheet.workingDays = value;
    if (attendanceSheet !== sheet) return;
    document.querySelectorAll('#attendance-rows .marks-row').forEach(row => {
        paintAttendanceStatus(row.querySelector('.marks-status'), row.querySelector('.attendance-cell').value.trim());
    });
    updateAttendanceWorkingDaysNote();
    setAttendanceSaveStatus('Working days saved', false);
}

document.getElementById('btn-open-attendance').addEventListener('click', openAttendancePage);
document.getElementById('btn-back-attendance').addEventListener('click', showExamsHomeView);
['attendance-year', 'attendance-term'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadAttendanceSheet);
});

const attendanceWorkingDaysInput = document.getElementById('attendance-working-days');
attendanceWorkingDaysInput.addEventListener('input', () => {
    attendanceWorkingDaysInput.value = attendanceWorkingDaysInput.value.replace(/[^0-9]/g, '').slice(0, 3);
});
attendanceWorkingDaysInput.addEventListener('change', commitAttendanceWorkingDays);
attendanceWorkingDaysInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const first = document.querySelector('#attendance-rows .attendance-cell');
    if (first) first.focus();
});




// ============================================================
// CLASS NINE / TEN TRANSCRIPT
// Counted subjects (9) = Bangla (1st+2nd), English (1st+2nd), General Math, Religious Education,
// ICT, BGS/General Science, + the student's 3 Main subjects.
// Clothes/Manner/Presence never affects any total, the average, or the class position.
// The Optional (4th) subject is NOT in the footer total or the average (only its grade point above 2
// is added to the GPA), but its marks DO count toward the class position.
// ============================================================
const NINE_TEN_CMP_SUBJECT = 'Clothes/Manner/Presence';
const NINE_TEN_PAPER_PAIRS = [['Bangla 1st', 'Bangla 2nd'], ['English 1st', 'English 2nd']];

function isNineTenChoosable(className, subjectName) {
    if (!className || (!className.includes('Nine') && !className.includes('Ten'))) return false;
    const pool = MAIN_SUBJECT_POOLS[className] || [];
    if (pool.includes(subjectName)) return true;
    if (ALL_OPTIONAL_SUBJECT_VARIANTS.includes(subjectName)) return true;
    return false;
}

// Class-position totals of the OTHER department's students (used when "Combine departments" is ticked).
async function loadNineTenSiblingTotals(cls, allSubjects, exams) {
    const isNine = cls.class_name.startsWith('Class Nine (');
    const prefix = isNine ? 'Class Nine (' : 'Class Ten (';
    const siblings = transcriptClasses.filter(
        c => c.class_name.startsWith(prefix) && c.id !== cls.id
    );
    if (!siblings.length) return [];

    const allEntries = [];
    for (const sibling of siblings) {
        const subjects = (allSubjects || []).filter(s => String(s.class_id) === String(sibling.id));
        const sheets = await Promise.all(
            exams.map(exam => ipcRenderer.invoke('get-marks-sheet', { class_id: sibling.id, exam_id: exam.id }))
        );

        const selByStudent = {};
        ((sheets[0] && sheets[0].studentSubjects) || []).forEach(r => {
            if (!selByStudent[r.student_id]) selByStudent[r.student_id] = { mains: [], optional: null };
            if (r.role === 'optional') selByStudent[r.student_id].optional = r.subject_name;
            else selByStudent[r.student_id].mains.push(r.subject_name);
        });

        const totals = {};
        sheets.forEach(sheet => {
            ((sheet && sheet.marks) || []).forEach(m => {
                if (m.is_present === 0 || typeof m.marks_obtained !== 'number') return;
                if (!totals[m.student_id]) totals[m.student_id] = {};
                totals[m.student_id][m.subject_id] = (totals[m.student_id][m.subject_id] || 0) + m.marks_obtained;
            });
        });

        ((sheets[0] && sheets[0].students) || []).forEach(st => {
            const sel = selByStudent[st.id] || { mains: [], optional: null };
            let sum = 0, has = false;
            subjects.forEach(sub => {
                const name = sub.subject_name;
                if (name === NINE_TEN_CMP_SUBJECT) return;
                const isChoosable = isNineTenChoosable(sibling.class_name, name);
                const isMain = sel.mains.includes(name);
                const isOpt = sel.optional === name ||
                    (sel.optional === 'Agriculture/Domestic Science' && name === 'Agriculture/Home Science') ||
                    (sel.optional === 'Agriculture/Home Science' && name === 'Agriculture/Domestic Science') ||
                    (name === 'Home Science' && sel.optional && (sel.optional.includes('Home') || sel.optional.includes('Domestic'))) ||
                    (name === 'Agriculture Studies' && sel.optional && sel.optional.includes('Agri'));
                if (isChoosable && !isMain && !isOpt) return;
                const t = totals[st.id] && totals[st.id][sub.id];
                if (typeof t === 'number') { sum += t; has = true; }
            });
            if (has) allEntries.push({ id: st.id, total: { total: sum, hasMarks: true } });
        });
    }
    return allEntries;
}

// One table entry = one subject, or Bangla / English as a 2-paper pair.
function nineTenMetrics(studentId, subs) {
    const records = subs.map(sub => (transcriptMarksData[studentId] && transcriptMarksData[studentId][sub.id]) || { m1: '', m2: '', m3: '', total: null });
    const full = subs.reduce((acc, sub) => acc + (Number(sub.monthly_marks) || 0) * 2 + (Number(sub.yearly_marks) || 0), 0);
    const complete = records.every(r => typeof r.total === 'number');
    const total = complete ? records.reduce((acc, r) => acc + r.total, 0) : null;
    let rawPct = null;
    let grade = { letter: '-', point: '-' };
    if (total !== null && full > 0) {
        rawPct = (total / full) * 100;
        grade = getGradeFromPercentage(rawPct);
    }
    return { subs, records, full, total, rawPct, grade };
}

function getNineTenLayout(studentId) {
    const sel = transcriptStudentSubjects[studentId] || { mains: [], optional: null };
    const counted = [];
    let cmpSub = null, optionalSub = null;

    transcriptSubjects.forEach(sub => {
        const name = sub.subject_name;
        if (name === NINE_TEN_CMP_SUBJECT) { cmpSub = sub; return; }
        if (isNineTenChoosable(transcriptClassName, name)) {
            if (sel.mains.includes(name)) {
                counted.push(sub);
            } else if (sel.optional === name ||
                (sel.optional === 'Agriculture/Domestic Science' && (name === 'Agriculture/Home Science' || name === 'Agriculture Studies' || name === 'Home Science')) ||
                (sel.optional === 'Agriculture/Home Science' && (name === 'Agriculture/Domestic Science' || name === 'Agriculture Studies' || name === 'Home Science')) ||
                (name === 'Home Science' && sel.optional && (sel.optional.includes('Home') || sel.optional.includes('Domestic'))) ||
                (name === 'Agriculture Studies' && sel.optional && sel.optional.includes('Agri'))) {
                optionalSub = sub;
            }
            return;
        }
        counted.push(sub);
    });

    const used = new Set();
    const entries = [];
    counted.forEach(sub => {
        if (used.has(sub.id)) return;
        const pair = NINE_TEN_PAPER_PAIRS.find(p => p[0] === sub.subject_name);
        const second = pair ? counted.find(s => s.subject_name === pair[1]) : null;
        used.add(sub.id);
        if (second) {
            used.add(second.id);
            entries.push(nineTenMetrics(studentId, [sub, second]));
        } else {
            entries.push(nineTenMetrics(studentId, [sub]));
        }
    });

    return {
        entries,
        cmp: cmpSub ? nineTenMetrics(studentId, [cmpSub]) : null,
        optional: optionalSub ? nineTenMetrics(studentId, [optionalSub]) : null
    };
}

function computeNineTenResult(studentId) {
    const layout = getNineTenLayout(studentId);
    let sumGP = 0, gpCount = 0, hasFail = false, hasMarks = false;
    let countedTotal = 0, stotal = 0, pctSum = 0, pctCount = 0;
    const examSums = { m1: 0, m2: 0, m3: 0 };

    layout.entries.forEach(e => {
        stotal += e.full;
        e.records.forEach(r => {
            ['m1', 'm2', 'm3'].forEach(k => { if (typeof r[k] === 'number') examSums[k] += r[k]; });
        });
        if (e.total !== null) {
            countedTotal += e.total;
            hasMarks = true;
            if (e.rawPct !== null) {
                pctSum += e.rawPct; pctCount += 1;
                sumGP += parseFloat(e.grade.point); gpCount += 1;
                if (e.grade.letter === 'F') hasFail = true;     // F in any counted subject = FAIL
            }
        }
    });

    // Optional subject: only the grade point ABOVE 2 is added to the top of the average.
    const opt = layout.optional;
    const optPoint = opt && opt.grade.point !== '-' ? parseFloat(opt.grade.point) : null;
    const bonus = optPoint !== null && optPoint > 2 ? optPoint - 2 : 0;
    const optionalTotal = opt && opt.total !== null ? opt.total : 0;

    return {
        layout, countedTotal, stotal, hasMarks, hasFail, examSums, bonus,
        // `total` is what the class position uses: counted subjects + optional subject (never Clothes/Manner/Presence)
        total: countedTotal + optionalTotal,
        avgPct: pctCount > 0 ? Math.round(pctSum / pctCount) : null,
        gpaWithout: gpCount > 0 ? (hasFail ? 0 : sumGP / gpCount) : null,
        gpa: gpCount > 0 ? (hasFail ? 0 : Math.min(5, (sumGP + bonus) / gpCount)) : null
    };
}

function buildNineTenTranscriptTable(studentId) {
    const test = document.getElementById('transcript-test').value;
    const visible = getTranscriptColumns(test).filter(c => !transcriptHiddenColumns.has(c.key));
    const marksCols = visible.filter(c => c.marks);
    const marksCount = marksCols.length;
    const examCols = marksCols.filter(c => c.key !== 'total');
    const hasTotal = visible.some(c => c.key === 'total');
    const showAllExamTotals = document.getElementById('transcript-show-all-exam-totals')?.checked ?? false;
    const has = (key) => visible.some(c => c.key === key);

    // ---- header ----
    let head1 = '', head2 = '', groupDone = false;
    visible.forEach(c => {
        if (c.marks) {
            if (!groupDone) { head1 += `<th colspan="${marksCount}">Marks Obtained</th>`; groupDone = true; }
            head2 += `<th>${c.headerHtml || escapeHtml(c.label)}</th>`;
        } else {
            head1 += `<th${marksCount ? ' rowspan="2"' : ''}>${c.headerHtml || escapeHtml(c.label)}</th>`;
        }
    });

    const r = computeNineTenResult(studentId);
    const { entries, cmp, optional } = r.layout;

    const highestOf = (subs) => {
        if (subs.length === 1) {
            const v = transcriptHighestBySubject[subs[0].id];
            return v === null || v === undefined ? '-' : v;
        }
        let best = null;
        transcriptStudents.forEach(st => {
            const totals = subs.map(s => transcriptMarksData[st.id] && transcriptMarksData[st.id][s.id] ? transcriptMarksData[st.id][s.id].total : null);
            if (totals.every(t => typeof t === 'number')) {
                const sum = totals.reduce((a, b) => a + b, 0);
                if (best === null || sum > best) best = sum;
            }
        });
        return best === null ? '-' : best;
    };

    // rows covered by the merged "Grade Points without optional subject" cell and by the tall side GPA cell
    const subjectRowCount = entries.reduce((acc, e) => acc + e.subs.length, 0) + (cmp ? 1 : 0);
    const sideRowSpan = subjectRowCount + (optional ? 2 : 0) + 1;      // + optional label row + optional row + footer row
    const gpaText = r.gpa !== null ? r.gpa.toFixed(2) : '-';

    let sn = 0;
    // mode: 'body' (normal subject rows) or 'optional' (the single optional-subject row)
    const cellFor = (key, e, i, mode, firstRow) => {
        const sub = e.subs[i];
        const rec = e.records[i];
        const rs = e.subs.length > 1 ? ` rowspan="${e.subs.length}"` : '';
        const lead = i === 0;
        switch (key) {
            case 'sn': return `<td class="sn">${String(sn).padStart(2, '0')}</td>`;
            case 'subject': return `<td class="subject transcript-subject">${escapeHtml(sub.subject_name)}</td>`;
            case 'st': return lead ? `<td${rs}>${e.full > 0 ? e.full : '-'}</td>` : '';
            case 'high': return lead ? `<td${rs}>${highestOf(e.subs)}</td>` : '';
            case 'm1': case 'm2': case 'm3': return `<td>${rec[key] !== '' ? rec[key] : '-'}</td>`;
            case 'total': return lead ? `<td class="total"${rs}>${e.total !== null ? e.total : '-'}</td>` : '';
            case 'pct': return lead ? `<td${rs}>${e.rawPct !== null ? Math.round(e.rawPct) + '%' : '-'}</td>` : '';
            case 'grade': return lead ? `<td${rs}>${e.grade.letter}</td>` : '';
            case 'gp': return lead ? `<td${rs}>${e.grade.point}</td>` : '';
            case 'gpwo':
                if (mode === 'optional') {
                    return `<td class="transcript-gp-above-cell"><div class="gp-above-label">GP above 2</div><div class="gp-above-value">${r.bonus.toFixed(2)}</div></td>`;
                }
                return firstRow
                    ? `<td class="transcript-gpwo-cell" rowspan="${subjectRowCount}">${r.gpaWithout !== null ? r.gpaWithout.toFixed(2) : '-'}</td>`
                    : '';
            case 'gpa':
                return mode === 'body' && firstRow
                    ? `<td class="transcript-gpa-cell" rowspan="${sideRowSpan}">${gpaText}</td>`
                    : '';
            default: return '';
        }
    };

    // ---- body: counted subjects, then Clothes/Manner/Presence ----
    const bodyRows = [];
    const pushEntry = (e) => {
        e.subs.forEach((sub, i) => {
            sn += 1;
            const firstRow = bodyRows.length === 0;
            bodyRows.push(`<tr>${visible.map(c => cellFor(c.key, e, i, 'body', firstRow)).join('')}</tr>`);
        });
    };
    entries.forEach(pushEntry);
    if (cmp) pushEntry(cmp);

    // ---- optional subject: label row + one numbered row ----
    if (optional) {
        const labelCols = visible.filter(c => c.key !== 'gpa').length;
        bodyRows.push(`<tr class="transcript-optional-label"><td colspan="${labelCols}">Optional Subject</td></tr>`);
        sn += 1;
        bodyRows.push(`<tr>${visible.map(c => cellFor(c.key, optional, 0, 'optional', false)).join('')}</tr>`);
    }

    // ---- footer ----
    const leadCount = visible.filter(c => c.key === 'sn' || c.key === 'subject').length;
    let tfootCells = leadCount ? `<td colspan="${leadCount}">Total</td>` : '';
    if (has('st')) tfootCells += `<td>${r.stotal > 0 ? r.stotal : '-'}</td>`;
    if (has('high')) tfootCells += `<td>-</td>`;

    if (showAllExamTotals) {
        marksCols.forEach(c => {
            if (c.key === 'm1') tfootCells += `<td>${r.examSums.m1}</td>`;
            else if (c.key === 'm2') tfootCells += `<td>${r.examSums.m2}</td>`;
            else if (c.key === 'm3') tfootCells += `<td>${r.examSums.m3}</td>`;
            else if (c.key === 'total') tfootCells += `<td class="total">${r.countedTotal}</td>`;
        });
    } else {
        if (examCols.length > 0) tfootCells += `<td colspan="${examCols.length}" class="transcript-obtained-label">Obtained Marks &amp; GPA</td>`;
        if (hasTotal) tfootCells += `<td class="total">${r.countedTotal}</td>`;
    }

    if (has('pct')) tfootCells += `<td>${r.avgPct !== null ? r.avgPct + '%' : '-'}</td>`;
    if (has('grade')) tfootCells += `<td>${r.gpa !== null ? getGradeFromPoint(r.gpa).letter : '-'}</td>`;
    // overall GPA sits under the GPA column, unless the side GPA column is on (then it moves to the side)
    if (has('gp')) tfootCells += `<td>${has('gpa') ? '-' : gpaText}</td>`;
    if (has('gpwo')) tfootCells += `<td>-</td>`;

    return `<table class="marks transcript-table">
        <thead><tr>${head1}</tr>${marksCount ? `<tr>${head2}</tr>` : ''}</thead>
        <tbody>${bodyRows.join('')}</tbody>
        <tfoot><tr>${tfootCells}</tr></tfoot>
    </table>`;
}

document.getElementById('transcript-combine-departments')?.addEventListener('change', () => paintTranscriptPreview());

// Wire up the Promote Students chip button
document.getElementById('btn-promote-mode')?.addEventListener('click', () => togglePromoteMode());

// ============================================================
// ADMIN SETTINGS & SECURITY (Settings -> Admin Info)
// ============================================================
let securityQuestionsVisible = true;

async function loadAdminSettingsPage() {
    // Clear password inputs and status messages
    const userEl = document.getElementById('admin-username');
    const curPw = document.getElementById('admin-current-password');
    const newPw = document.getElementById('admin-new-password');
    const confPw = document.getElementById('admin-confirm-password');
    if (curPw) curPw.value = '';
    if (newPw) newPw.value = '';
    if (confPw) confPw.value = '';

    const pwErr = document.getElementById('admin-pw-error');
    const pwSucc = document.getElementById('admin-pw-success');
    const secErr = document.getElementById('admin-sec-error');
    const secSucc = document.getElementById('admin-sec-success');
    if (pwErr) pwErr.innerText = '';
    if (pwSucc) pwSucc.innerText = '';
    if (secErr) secErr.innerText = '';
    if (secSucc) secSucc.innerText = '';

    // Synchronize visibility state
    const content = document.getElementById('sec-questions-content');
    const locked = document.getElementById('sec-questions-locked');
    const btnToggle = document.getElementById('btn-toggle-security-questions');
    if (content) content.style.display = securityQuestionsVisible ? 'block' : 'none';
    if (locked) locked.style.display = securityQuestionsVisible ? 'none' : 'block';
    if (btnToggle) btnToggle.textContent = securityQuestionsVisible ? 'Hide' : 'Show';

    // Fetch security questions and profile data
    try {
        const res = await ipcRenderer.invoke('get-admin-profile');
        if (res && res.success && res.profile) {
            const p = res.profile;
            if (userEl) userEl.value = p.username || 'admin';
            for (let i = 1; i <= 5; i++) {
                const qEl = document.getElementById('admin-q' + i);
                const aEl = document.getElementById('admin-a' + i);
                if (qEl) qEl.value = p['q' + i] || '';
                if (aEl) aEl.value = p['a' + i] || '';
            }
        }
    } catch (e) {
        console.error('Failed to load admin profile:', e);
    }
}

// Toggle Security Questions Show/Hide
const btnToggleSecurityQuestions = document.getElementById('btn-toggle-security-questions');
if (btnToggleSecurityQuestions) {
    btnToggleSecurityQuestions.addEventListener('click', () => {
        securityQuestionsVisible = !securityQuestionsVisible;
        const content = document.getElementById('sec-questions-content');
        const locked = document.getElementById('sec-questions-locked');
        if (securityQuestionsVisible) {
            if (content) content.style.display = 'block';
            if (locked) locked.style.display = 'none';
            btnToggleSecurityQuestions.textContent = 'Hide';
        } else {
            if (content) content.style.display = 'none';
            if (locked) locked.style.display = 'block';
            btnToggleSecurityQuestions.textContent = 'Show';
        }
    });
}

// Update Admin Credentials Button
const btnUpdateAdminPassword = document.getElementById('btn-update-admin-password');
if (btnUpdateAdminPassword) {
    btnUpdateAdminPassword.addEventListener('click', async () => {
        const errEl = document.getElementById('admin-pw-error');
        const successEl = document.getElementById('admin-pw-success');
        if (errEl) errEl.innerText = '';
        if (successEl) successEl.innerText = '';

        const username = document.getElementById('admin-username')?.value.trim() || '';
        const currentPw = document.getElementById('admin-current-password')?.value || '';
        const newPw = document.getElementById('admin-new-password')?.value || '';
        const confirmPw = document.getElementById('admin-confirm-password')?.value || '';

        if (!currentPw) {
            if (errEl) errEl.innerText = 'Please enter your Current Password to save changes!';
            return;
        }

        if (newPw || confirmPw) {
            if (newPw !== confirmPw) {
                if (errEl) errEl.innerText = 'New password and confirmation do not match!';
                return;
            }
        }

        btnUpdateAdminPassword.disabled = true;
        btnUpdateAdminPassword.textContent = 'Updating...';

        const res = await ipcRenderer.invoke('change-admin-password', {
            username: username,
            currentPassword: currentPw,
            newPassword: newPw || null
        });

        btnUpdateAdminPassword.disabled = false;
        btnUpdateAdminPassword.textContent = 'Update Credentials';

        if (res && res.success) {
            if (successEl) successEl.innerText = '✅ ' + (res.message || 'Credentials updated successfully!');
            const cur = document.getElementById('admin-current-password');
            const nw = document.getElementById('admin-new-password');
            const cnf = document.getElementById('admin-confirm-password');
            if (cur) cur.value = '';
            if (nw) nw.value = '';
            if (cnf) cnf.value = '';
        } else {
            if (errEl) errEl.innerText = (res && res.message) || 'Failed to update credentials.';
        }
    });
}

// Save Security Questions Button
const btnSaveSecurityQuestions = document.getElementById('btn-save-security-questions');
if (btnSaveSecurityQuestions) {
    btnSaveSecurityQuestions.addEventListener('click', async () => {
        const errEl = document.getElementById('admin-sec-error');
        const successEl = document.getElementById('admin-sec-success');
        if (errEl) errEl.innerText = '';
        if (successEl) successEl.innerText = '';

        const data = {};
        for (let i = 1; i <= 5; i++) {
            const q = document.getElementById('admin-q' + i)?.value.trim() || '';
            const a = document.getElementById('admin-a' + i)?.value.trim() || '';
            if ((q && !a) || (!q && a)) {
                if (errEl) errEl.innerText = `Please provide both question and answer for Question ${i}.`;
                return;
            }
            data['q' + i] = q;
            data['a' + i] = a;
        }

        if (!data.q1 || !data.a1) {
            if (errEl) errEl.innerText = 'At least Security Question 1 and its answer are required!';
            return;
        }

        btnSaveSecurityQuestions.disabled = true;
        btnSaveSecurityQuestions.textContent = 'Saving...';

        const res = await ipcRenderer.invoke('update-admin-security-questions', data);

        btnSaveSecurityQuestions.disabled = false;
        btnSaveSecurityQuestions.textContent = 'Save Security Questions';

        if (res && res.success) {
            if (successEl) successEl.innerText = '✅ Security questions saved successfully!';
        } else {
            if (errEl) errEl.innerText = (res && res.message) || 'Failed to save security questions.';
        }
    });
}

// Enable Enter navigation on Admin Credentials & Security Questions
enableEnterNavigation(document.getElementById('admin-password-form'), document.getElementById('btn-update-admin-password'));
enableEnterNavigation(document.getElementById('sec-questions-content'), document.getElementById('btn-save-security-questions'));

// ============================================================
// MORE INFO POP-UP MODAL (Students & Teachers)
// ============================================================
function openDetailsInfoModal(title, rowsHtml) {
    const modal = document.getElementById('details-info-modal');
    const titleEl = document.getElementById('info-modal-title');
    const bodyEl = document.getElementById('info-modal-body');
    if (!modal || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = rowsHtml;
    modal.style.display = 'flex';
}

function closeDetailsInfoModal() {
    const modal = document.getElementById('details-info-modal');
    if (modal) modal.style.display = 'none';
}

document.getElementById('btn-close-info-modal')?.addEventListener('click', closeDetailsInfoModal);
document.getElementById('btn-close-info-modal-x')?.addEventListener('click', closeDetailsInfoModal);
document.getElementById('details-info-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'details-info-modal') closeDetailsInfoModal();
});

// ── Legal Documents ──────────────────────────────────────────────
document.getElementById('btn-view-privacy-policy')?.addEventListener('click', () => {
    const html = `
        <div style="font-size:13.5px; line-height:1.8; color:#0f172a;">
            <p style="margin-top:0;">
                <b>Provider:</b> EduKit Solutions<br>
                <b>Version:</b> 1.0.0<br>
                <b>Effective Date:</b> 01 December 2026
            </p>

            <h4 style="color:#1e293b; margin-bottom:4px;">1. About this policy</h4>
            <p>EduKit Campus is an institute management application provided by <b>EduKit Solutions</b> to help schools and educational institutes manage students, teachers, subjects, exams, marks, attendance, and transcripts. By installing or using the Software, the Institute confirms that it has read and accepted this policy. This policy works together with the EduKit Campus End-User License Agreement ("EULA"); if they conflict on how data is handled, this policy prevails.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">2. Who is responsible for what</h4>
            <p>The <b>Institute</b> is the data controller—it decides what information is entered and is responsible for having the legal right and required parent/guardian consent to enter it. <b>EduKit Solutions</b> is the software provider; because data is stored locally on the Institute's computer, we do not collect or process the Institute's records in the ordinary course of use.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">3. Information the Software handles</h4>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>Student information:</b> Name, student ID, class and roll number, date of birth, gender, blood group, parents' names, guardian contact number, address, birth registration number, photograph, subject choices, examination marks, attendance, and graduation or drop-out records.</li>
                <li><b>Teacher information:</b> Teacher ID, name, title, contact number, NID number, blood group, parents' names, address, photograph, signature, and class-teacher assignments.</li>
                <li><b>Institute and administrator information:</b> Institute name, address, and logo; head teacher or principal name and signature; administrator username, password, and recovery security questions and answers.</li>
                <li><b>License information:</b> Activation code and license or trial status.</li>
            </ul>
            <p>The Institute decides which optional fields to fill in, while fields marked as required must be completed to save a record.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">4. Where information is stored</h4>
            <p>All Institute records are stored locally on the computer where the Software is installed (in the Software's database and media files) and are never uploaded to our servers. The Institute controls physical and remote access to that computer and its files.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">5. Activation and licensing</h4>
            <p>The Software uses an activation code provided by EduKit Solutions to unlock the full version, verified offline via an encrypted verifier without any internet connection. License information is used solely to verify genuine licensing and apply trial or full license limits.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">6. How information is used</h4>
            <p>Entered information is used strictly to run the Institute's own functions (maintaining registries, recording marks and attendance, generating transcripts and reports, and showing alerts for missing or duplicate records). We do not sell records, use them for advertising, or use them to build profiles.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">7. Our access to your information</h4>
            <p>We do not routinely have access to the Institute's records. We may only view them if the Institute requests support (such as installation, training, data entry, migration, device transfer, or troubleshooting) and grants permission. Any copy shared for support is kept confidential and deleted once the work is finished.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">8. Sharing and disclosure</h4>
            <p>We do not share the Institute's records or confidential information with third parties. We may name the Institute as a customer using publicly available details (name and address) in promotional materials unless asked not to. Printing transcripts, exporting records, or sharing data with parents, boards, or authorities is the Institute's own responsibility. We disclose information only if required by law or court order.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">9. Security</h4>
            <p>The Software includes a password-protected administrator login and recovery security questions. While we take reasonable care in building the Software, security also requires the Institute to:</p>
            <ul style="margin-top:4px; padding-left:20px;">
                <li>Keep the computer in a secure location protected by a strong account password.</li>
                <li>Keep the administrator username, password, and security answers private.</li>
                <li>Restrict Software access strictly to authorized staff.</li>
                <li>Keep the operating system and antivirus software up to date.</li>
            </ul>
            <p>No system is completely secure, and we cannot guarantee information will never be accessed without authorization.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">10. Backups and data loss</h4>
            <p>Because records are stored locally, the Institute is responsible for regularly backing up the Software's database and media files. EduKit Solutions is not responsible for data loss or corruption caused by hardware failure, accidental deletion, viruses, power failure, theft, or lack of backups.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">11. Retention and deletion</h4>
            <p>Records remain in the Software as long as the Institute keeps them and can be edited or deleted at any time. Uninstalling the Software or ending the license does not automatically delete local database or media files; the Institute must remove them manually if desired. Upon license termination, we will confirm in writing upon request that we hold no copies of your data. We are not responsible for leaks, fraud, or misuse resulting from the Institute sharing its files or leaving them on unsecure devices.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">12. Children's information</h4>
            <p>The Software stores information about students who are children. The Institute must use this data solely for educational and administrative purposes, restrict access to authorized staff, and handle it with appropriate care.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">13. Rights of students, parents, and staff</h4>
            <p>Students, parents, guardians, and staff may request to view, correct, or delete their held information. Because the Institute controls the records, such requests must be directed to the Institute using the Software's built-in tools.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">14. Third-party components</h4>
            <p>The Software is built using open-source components that run locally on the Institute's computer. Their licenses and notices are listed in the <b>THIRD-PARTY-LICENSES</b> file supplied with the Software.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">15. Changes to this policy</h4>
            <p>We may update this policy periodically, supplying the current version and updated effective date with the Software and its updates. Continued use after an update signifies acceptance of the revised policy.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">16. Governing law</h4>
            <p>This policy is governed by the laws of Bangladesh, and any disputes will be handled by the courts of Bangladesh.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">17. Contact</h4>
            <p style="margin-bottom:0;">
                For questions about this policy, please contact:<br>
                <b>EduKit Solutions</b><br>
                <b>Email:</b> edukitsolutions@gmail.com<br>
                <b>LinkedIn:</b> linkedin.com/company/146668574<br>
                <b>Facebook:</b> facebook.com/EduKitSolutions<br>
                <b>Phone:</b> +880 15702-56457<br>
                <b>Location:</b> TB Hospital Road, Moulvibazar Sadar, Sylhet, Bangladesh
            </p>
        </div>`;
    openDetailsInfoModal('🔒 Privacy Policy', html);
});

document.getElementById('btn-view-copyright')?.addEventListener('click', () => {
    const html = `
        <div style="font-size:13.5px; line-height:1.8; color:#0f172a;">
            <p style="margin-top:0; font-size:15px; font-weight:700; color:#1e293b;">© 2026 EduKit Solutions. All Rights Reserved.</p>
            <p style="margin-top:0;">
                <b>Provider:</b> EduKit Solutions<br>
                <b>Version:</b> 1.0.0<br>
                <b>Effective Date:</b> 01 December 2026
            </p>

            <h4 style="color:#1e293b; margin-bottom:4px;">1. Copyright Ownership</h4>
            <p>All rights, title, and interest in and to <b>EduKit Campus</b> ("Software"), including its source code, compiled binaries, database architecture, user interface design, graphics, icons, installer packages, and written documentation, are the exclusive intellectual property of <b>EduKit Solutions</b>. The Software is protected by the copyright laws of Bangladesh and applicable international copyright treaties.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">2. License, Not Sale</h4>
            <p>EduKit Campus is licensed, not sold. Purchasing a license grants the educational institution ("Institute") a limited, non-exclusive, non-transferable right to install and use the Software on <b>one (1) authorized computer</b> in accordance with the EduKit Campus End-User License Agreement ("EULA"). No ownership or copyright of the Software is transferred to the Institute.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">3. Restrictions on Copying and Modification</h4>
            <p>Except as expressly permitted in the EULA (such as making local backup copies for the Institute's own protection), no person or organization may:</p>
            <ul style="margin-top:4px; padding-left:20px;">
                <li>Copy, reproduce, distribute, share, rent, lease, lend, or resell the Software or its activation code;</li>
                <li>Decompile, disassemble, reverse-engineer, modify, or create derivative works based on the Software;</li>
                <li>Remove, hide, or alter any copyright notices, watermarks, version labels, or EduKit Solutions branding inside the Software or its generated files.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">4. Ownership of Institute Data and Outputs</h4>
            <p>EduKit Solutions claims no copyright or ownership over the records entered into the Software by the Institute (including student details, teacher records, marks, attendance, or the Institute's own logo and name). The Institute retains full ownership of its data and all transcripts, mark sheets, certificates, and reports generated using that data.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">5. Third-Party and Open-Source Software</h4>
            <p>EduKit Campus incorporates certain third-party open-source libraries and components. Copyright for those components belongs to their respective authors and is governed by their individual open-source licenses, which are listed in the <b>THIRD-PARTY-LICENSES</b> file included with the Software.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">6. Trademarks and Branding</h4>
            <p>The names <b>EduKit Solutions</b> and <b>EduKit Campus</b>, along with associated logos and visual branding, are proprietary to EduKit Solutions and may not be used without prior written permission.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">7. Governing Law and Contact</h4>
            <p style="margin-bottom:0;">
                This Copyright Policy is governed by the laws of Bangladesh. To report unauthorized copying, piracy, or to request written permissions, please contact:<br>
                <b>EduKit Solutions</b><br>
                <b>Email:</b> edukitsolutions@gmail.com<br>
                <b>LinkedIn:</b> linkedin.com/company/146668574<br>
                <b>Facebook:</b> facebook.com/EduKitSolutions<br>
                <b>Phone:</b> +880 15702-56457<br>
                <b>Location:</b> TB Hospital Road, Moulvibazar Sadar, Sylhet, Bangladesh
            </p>
        </div>`;
    openDetailsInfoModal('© Copyright Notice', html);
});

document.getElementById('btn-view-eula')?.addEventListener('click', () => {
    const html = `
        <div style="font-size:13.5px; line-height:1.8; color:#0f172a;">
            <p style="margin-top:0;">
                <b>Software:</b> EduKit Campus<br>
                <b>Provider:</b> EduKit Solutions ("we," "us," or "our")<br>
                <b>Version:</b> 1.0.0<br>
                <b>Effective Date:</b> 01 December 2026
            </p>
            <p>Please read this End-User License Agreement ("Agreement") carefully before installing or using <b>EduKit Campus</b> ("Software"). By installing, activating, or using the Software, or by signing or accepting this Agreement, the educational institution ("Institute") agrees to be bound by its terms. The person accepting this Agreement confirms that they have authority to bind the Institute.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">1. Grant of License</h4>
            <p>Subject to full payment of the applicable one-time license fee and compliance with this Agreement, <b>EduKit Solutions</b> grants the Institute a non-exclusive, non-transferable, perpetual (lifetime) license to install and use the Software on <b>one (1) desktop computer or laptop</b>, solely for the internal academic and administrative operations of one (1) institute at one (1) campus.</p>
            <p>The Institute may make backup copies of the Software and of its own data for its own protection. The Institute's authorized staff may access the licensed computer remotely, but the Software must not be installed or run on any other computer. A separate license is required for each additional campus or institute. The license may not be transferred to a new owner, a merged institute, or any other organization without our prior written consent.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">2. Free Trial Version</h4>
            <p>Before purchasing a license, the Institute may use the trial version of the Software free of charge under the following conditions:</p>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>Duration:</b> The trial period lasts two (2) days from initial setup.</li>
                <li><b>Feature limits:</b> The trial version is limited to storing a maximum of five (5) student records and five (5) teacher records, and certain advanced features may be restricted.</li>
                <li><b>Expiration:</b> When the 2-day trial ends, the Software automatically locks until a valid activation code is entered.</li>
                <li><b>Trial data:</b> Data entered during the trial remains stored locally on the Institute's computer and can continue to be used once the Software is activated.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">3. Activation and Device Transfers</h4>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>Activation:</b> Upon receiving full payment, EduKit Solutions will provide the activation code, or an authorized representative will enter the code directly on the Institute's computer, to unlock the full version.</li>
                <li><b>Single-device rule:</b> One license may not be used to activate the Software on multiple computers at the same time.</li>
                <li><b>Changing computers:</b> While EduKit Solutions remains in operation, the Institute may request to move the Software to a replacement computer, subject to a transfer fee of <b>1,000 BDT</b> payable before the transfer. The transfer will be carried out by an authorized EduKit Solutions staff member, and only with the Institute's permission. EduKit Solutions will use the Institute's data only to complete the transfer, will keep it confidential, and will delete any copy it received once the transfer is finished. The Software and its activation must be completely removed from the old computer.</li>
                <li><b>Lost, stolen, or broken computers:</b> If the old computer is lost, stolen, or broken and the activation cannot be removed from it, the transfer cannot be made and the activation will not be moved to another computer, unless EduKit Solutions agrees otherwise in writing.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">4. Restrictions on Use</h4>
            <p>The Institute agrees not to:</p>
            <ul style="margin-top:4px; padding-left:20px;">
                <li>Copy, distribute, rent, lease, lend, sublicense, or resell the Software, or share its activation code with anyone outside the Institute, or install the activated Software on unauthorized computers.</li>
                <li>Reverse-engineer, decompile, disassemble, modify, or attempt to extract the source code of the Software, or bypass its licensing mechanism.</li>
                <li>Remove or alter any copyright notices, branding, or proprietary labels inside the Software.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">5. Payments and No-Refund Policy</h4>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>One-time fee:</b> The license is sold for a one-time fee of <b>15,000 BDT</b>, as agreed at the time of purchase. Unless stated otherwise in writing, the fee is exclusive of applicable taxes. Payment is due in full.</li>
                <li><b>No refunds:</b> Because the Institute is given access to a free trial version to test the Software before purchasing, all payments are non-refundable once the activation code has been issued or entered, including if this Agreement is later terminated. This does not limit any right the Institute may have under applicable law that cannot be waived.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">6. Software Updates and Upgrades</h4>
            <p>EduKit Solutions may release updates and upgrades at its discretion and provides them free of charge to licensed Institutes while the Software is actively maintained. EduKit Solutions has no obligation to develop, provide, or continue providing any updates, upgrades, or maintenance. We will give reasonable notice if we stop releasing updates. Any updates already released will remain usable under this license.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">7. Customer Support and Discontinuation of Operations</h4>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>Free Support (Discretionary):</b> EduKit Solutions provides initial setup assistance and technical support (via WhatsApp or remote session during our available hours) free of charge. Support is provided at our sole discretion and is not guaranteed for any fixed period, such as lifetime or a set number of years.</li>
                <li><b>Ending Support by Official Notice:</b> EduKit Solutions may modify, pause, or permanently stop providing customer support at any time by issuing an official notice (via WhatsApp, email, or our official Facebook/web page) at least 15 days in advance.</li>
                <li><b>Closure, Relocation, or Unavailability of Proprietor:</b> EduKit Solutions is operated as an independent business. If EduKit Solutions ceases operations, or if its sole proprietor relocates, becomes permanently unavailable, or passes away, all technical support, software updates, and device transfer services will automatically end without liability or refund.</li>
                <li><b>Continued Use of Software:</b> Because EduKit Campus operates offline on the Institute's computer, ending support or closing operations does not affect the Institute's perpetual license. The Institute may continue using the installed Software and its locally stored data indefinitely.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">8. Backups and Data Responsibility</h4>
            <p>Because the Software stores all data locally on the Institute's computer, the Institute is solely responsible for regularly backing up the Software's database and media files and storing those backups safely on a separate device. The Institute must also verify all marks, results, transcripts, and other outputs generated by the Software for accuracy before using them officially or distributing them to students, parents, boards, or authorities.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">9. Ownership and Intellectual Property</h4>
            <p>EduKit Campus is licensed, not sold. EduKit Solutions retains all ownership, copyright, and intellectual property rights in the Software, its design, code, and documentation. Third-party open-source libraries included in the Software are governed by their respective licenses, as listed in the <b>THIRD-PARTY-LICENSES</b> file supplied with the Software.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">10. Data Ownership and Privacy</h4>
            <p>The Institute retains full ownership of all student, teacher, staff, and administrative records entered into the Software. Because the Software operates offline and stores data locally on the Institute's computer, our handling of information is governed by the <b>EduKit Campus Privacy Policy</b>. If this Agreement and the Privacy Policy conflict on how data is handled, the Privacy Policy prevails; on all other matters, this Agreement prevails.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">11. Disclaimer of Warranties</h4>
            <p>The Software is provided "AS IS" without warranties of any kind, whether express or implied. While we strive to make EduKit Campus reliable and accurate, we do not guarantee that the Software will be completely free of bugs, interruptions, or compatibility issues caused by the Institute's hardware or operating system.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">12. Limitation of Liability</h4>
            <p>To the maximum extent permitted by applicable law:</p>
            <ul style="margin-top:4px; padding-left:20px;">
                <li>EduKit Solutions is not liable for any indirect, incidental, or consequential damages, including loss of data (including where the Institute has not kept backups as required by Section 8), business interruption, or financial loss arising from the use of, or inability to use, the Software.</li>
                <li>Our total cumulative liability under this Agreement shall not exceed the one-time license fee actually paid by the Institute for the Software.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">13. Termination</h4>
            <p>This Agreement remains effective until terminated. If the Institute breaches this Agreement (for example, by unauthorized copying or sharing of the activation code), EduKit Solutions may give written notice describing the breach. If the breach is not fixed within 7 to 14 days of the notice, or cannot be fixed, the license terminates. We may terminate immediately where the breach involves unauthorized sharing or use of the activation code on other computers.</p>
            <p>Upon termination, the Institute must stop using the Software and uninstall it. The Institute keeps ownership of its data files. Termination does not entitle the Institute to a refund.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">14. General Terms</h4>
            <ul style="margin-top:4px; padding-left:20px;">
                <li><b>Entire agreement:</b> This Agreement, together with the Privacy Policy, is the entire agreement between the parties about the Software and replaces earlier discussions about it.</li>
                <li><b>Amendments:</b> This Agreement may be changed only in writing signed or accepted by both parties. Updated versions supplied with new releases of the Software apply to those releases once the Institute accepts them.</li>
                <li><b>Severability:</b> If any part of this Agreement is found unenforceable, the rest remains in effect.</li>
                <li><b>No waiver:</b> Failure to enforce a term is not a waiver of it.</li>
                <li><b>Survival:</b> Sections 4, 5, 9, 10, 11, 12, 13, and 15 continue after termination.</li>
                <li><b>Language:</b> This Agreement is written in English. A Bangla translation soft-copy is provided for convenience; if the two differ, the English version prevails.</li>
            </ul>

            <h4 style="color:#1e293b; margin-bottom:4px;">15. Governing Law and Jurisdiction</h4>
            <p>This Agreement is governed by and construed in accordance with the laws of Bangladesh. Any dispute arising out of or relating to this Agreement is subject to the exclusive jurisdiction of the courts of Bangladesh.</p>

            <h4 style="color:#1e293b; margin-bottom:4px;">16. Contact Information</h4>
            <p>
                For licensing, device transfers, updates, or support inquiries, please contact:<br>
                <b>EduKit Solutions</b><br>
                <b>Email:</b> edukitsolutions@gmail.com<br>
                <b>LinkedIn:</b> linkedin.com/company/146668574<br>
                <b>Facebook:</b> facebook.com/EduKitSolutions<br>
                <b>Phone:</b> +880 15702-56457<br>
                <b>Location:</b> TB Hospital Road, Moulvibazar Sadar, Sylhet, Bangladesh
            </p>

            <h4 style="color:#1e293b; margin-bottom:4px;">17. Acceptance</h4>
            <p style="margin-bottom:0;">By signing below, or by clicking "I agree" when installing the Software, the Institute confirms that it has read and accepts this Agreement and the <b>EduKit Campus Privacy Policy</b>.</p>
        </div>`;
    openDetailsInfoModal('📜 End-User License Agreement (EULA)', html);
});

function renderInfoGrid(items) {
    return `<div style="display:grid; grid-template-columns: 130px minmax(0, 1fr); row-gap:10px; column-gap:12px; font-size:13.5px; line-height:1.5; width:100%;">` +
        items.map(([label, val]) => `
            <div style="color:#64748b; font-weight:600;">${escapeHtml(label)}:</div>
            <div style="color:#0f172a; font-weight:500; word-break:break-word; overflow-wrap:anywhere;">${val || '<i style="color:#94a3b8;">Not provided</i>'}</div>
        `).join('') + `</div>`;
}

window.showStudentInfoModal = async function (id) {
    const s = studentListCache.find(x => x.id === id);
    if (!s) return;

    // Fetch subjects if available
    let subjectsText = '';
    try {
        const subs = await ipcRenderer.invoke('get-student-subjects', id);
        if (subs && subs.length) {
            const mains = subs.filter(r => r.role === 'main').map(r => r.subject_name).join(', ');
            const opt = subs.find(r => r.role === 'optional')?.subject_name;
            subjectsText = `Main: ${mains || 'None'} | Optional: ${opt || 'None'}`;
        }
    } catch (err) {
        console.error('Failed to load student subjects for modal:', err);
    }

    const items = [
        ['Full Name', s.name ? `<b>${escapeHtml(s.name)}</b>` : ''],
        ['Class', s.class_name ? escapeHtml(s.class_name) : ''],
        ['Class Roll', s.roll !== undefined && s.roll !== null ? formatRoll(s.roll) : ''],
        ['Status', s.status ? `<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:bold; ${s.status === 'Active' ? 'background:#dcfce7; color:#15803d;' : (s.status === 'Graduated' ? 'background:#dbeafe; color:#1d4ed8;' : 'background:#fee2e2; color:#b91c1c;')}">${escapeHtml(s.status)}</span>` : ''],
        ['Gender', s.gender ? escapeHtml(s.gender) : ''],
        ['Guardian Contact', s.guardian_contact ? escapeHtml(s.guardian_contact) : ''],
        ['Blood Group', s.blood_group ? `<span style="color:#dc2626; font-weight:bold;">${escapeHtml(s.blood_group)}</span>` : ''],
        ['Date of Birth', s.dob ? formatHistoryDate(s.dob) : ''],
        ['Birth Reg. No.', s.birth_reg_number ? escapeHtml(s.birth_reg_number) : ''],
        ["Father's Name", s.fathers_name ? escapeHtml(s.fathers_name) : ''],
        ["Mother's Name", s.mothers_name ? escapeHtml(s.mothers_name) : ''],
        ['Address', s.address ? escapeHtml(s.address) : '']
    ];

    if (subjectsText) {
        items.push(['Subjects Selection', escapeHtml(subjectsText)]);
    }

    if (s.status === 'Graduated') {
        items.push(['Graduation Date', s.status_date ? formatHistoryDate(s.status_date) : '']);
    } else if (s.status === 'Removed') {
        items.push(['Drop Out Date', s.status_date ? formatHistoryDate(s.status_date) : '']);
        items.push(['Drop Out Reason', s.removal_cause ? escapeHtml(s.removal_cause) : '']);
    }

    const photoSrc = s.photo_data_url || s.photo_path;
    const photoHtml = photoSrc
        ? `<div style="width:130px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; border:1px solid #e2e8f0; border-radius:8px; padding:6px; background:#f8fafc; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <img src="${photoSrc}" alt="${escapeHtml(s.name || 'Student Photo')}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff;">
            <span style="font-size:11px; color:#64748b; margin-top:6px; font-weight:600; text-align:center;">Student Photo</span>
          </div>`
        : `<div style="width:130px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1.5px dashed #cbd5e1; border-radius:8px; padding:12px 6px; background:#f8fafc; text-align:center; min-height:130px;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:6px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span style="font-size:11px; color:#94a3b8; font-weight:500;">No Photo</span>
          </div>`;

    const bodyHtml = `
        <div style="display:flex; gap:16px; align-items:flex-start;">
            <div style="flex:1; min-width:0;">
                ${renderInfoGrid(items)}
            </div>
            ${photoHtml}
        </div>
    `;

    openDetailsInfoModal(`Student Profile: ${s.name || 'Details'}`, bodyHtml);
};

window.showTeacherInfoModal = function (id) {
    const t = cachedTeachers.find(x => x.id === id);
    if (!t) return;

    const assignedClasses = allClassesForTeachers.filter(c => c.class_teacher_id === t.id).map(c => c.class_name);

    const items = [
        ['Teacher ID', t.teacher_id_number ? `<b>${escapeHtml(t.teacher_id_number)}</b>` : '<i style="color:#94a3b8;">None</i>'],
        ['Full Name', t.name ? `<b>${escapeHtml(t.name)}</b>` : ''],
        ['Title / Designation', t.title ? escapeHtml(t.title) : ''],
        ['Class Teacher Of', assignedClasses.length ? assignedClasses.map(escapeHtml).join(', ') : '<i style="color:#94a3b8;">None</i>'],
        ['Contact Number', t.contact_number ? escapeHtml(t.contact_number) : ''],
        ['Blood Group', t.blood_group ? `<span style="color:#dc2626; font-weight:bold;">${escapeHtml(t.blood_group)}</span>` : ''],
        ['NID Number', t.nid_number ? escapeHtml(t.nid_number) : ''],
        ["Father's Name", t.fathers_name ? escapeHtml(t.fathers_name) : ''],
        ["Mother's Name", t.mothers_name ? escapeHtml(t.mothers_name) : ''],
        ['Address', t.address ? escapeHtml(t.address) : '']
    ];

    const photoSrc = t.photo_data_url || t.photo_path;
    const photoHtml = photoSrc
        ? `<div style="width:120px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; border:1px solid #e2e8f0; border-radius:8px; padding:6px; background:#f8fafc; box-shadow:0 1px 3px rgba(0,0,0,0.05); box-sizing:border-box;">
            <img src="${photoSrc}" alt="${escapeHtml(t.name || 'Teacher Photo')}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff;">
            <span style="font-size:11px; color:#64748b; margin-top:5px; font-weight:600; text-align:center;">Teacher Photo</span>
          </div>`
        : `<div style="width:120px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1.5px dashed #cbd5e1; border-radius:8px; padding:10px 6px; background:#f8fafc; text-align:center; min-height:120px; box-sizing:border-box;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:4px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span style="font-size:11px; color:#94a3b8; font-weight:500;">No Photo</span>
          </div>`;

    const signSrc = t.signature_data_url || t.signature_path;
    const signHtml = signSrc
        ? `<div style="width:120px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; border:1px solid #e2e8f0; border-radius:8px; padding:6px; background:#f8fafc; box-shadow:0 1px 3px rgba(0,0,0,0.05); box-sizing:border-box;">
            <div style="width:100%; height:52px; display:flex; align-items:center; justify-content:center; background:#ffffff; border-radius:6px; border:1px solid #cbd5e1; padding:2px; box-sizing:border-box; overflow:hidden;">
                <img src="${signSrc}" alt="${escapeHtml(t.name || 'Teacher Signature')}" style="max-width:100%; max-height:100%; object-fit:contain;">
            </div>
            <span style="font-size:11px; color:#64748b; margin-top:5px; font-weight:600; text-align:center;">Signature</span>
          </div>`
        : `<div style="width:120px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1.5px dashed #cbd5e1; border-radius:8px; padding:8px 6px; background:#f8fafc; text-align:center; min-height:60px; box-sizing:border-box;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:2px;">
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span style="font-size:11px; color:#94a3b8; font-weight:500;">No Signature</span>
          </div>`;

    const bodyHtml = `
        <div style="display:flex; gap:16px; align-items:flex-start; width:100%; box-sizing:border-box;">
            <div style="flex:1; min-width:0;">
                ${renderInfoGrid(items)}
            </div>
            <div style="display:flex; flex-direction:column; gap:10px; flex-shrink:0;">
                ${photoHtml}
                ${signHtml}
            </div>
        </div>
    `;

    openDetailsInfoModal(`Teacher Profile: ${t.name || 'Details'}`, bodyHtml);
};


// ============================================================
// ACADEMIC SETUP SCREEN & EXAM SCHEDULE CONFIGURATION
// ============================================================

let academicConfigState = {
    yearly_exams: 2,
    monthly_exams: 1
};

let academicSetupInitialized = false;
let academicSetupInitialPanelContent = {};
let academicSetupCurrentClassId = null;
let academicSetupDeletedCustomSubjectIds = [];

function generateExamScheduleList(yearlyExams, monthlyExams) {
    const y = Math.max(1, Math.min(4, parseInt(yearlyExams, 10) || 2));
    const m = Math.max(1, Math.min(4, parseInt(monthlyExams, 10) || 1));
    const ord = ['1st', '2nd', '3rd', '4th'];
    const list = [];
    let monthlyCount = 0;

    for (let term = 1; term <= y; term++) {
        for (let mon = 1; mon <= m; mon++) {
            monthlyCount++;
            const ordMonth = ord[monthlyCount - 1] || (monthlyCount + 'th');
            list.push(ordMonth + ' Monthly Exam');
        }
        let yearlyName = '';
        if (y === 2) {
            yearlyName = term === 1 ? 'Half Yearly Exam' : 'Yearly Exam';
        } else if (y === 1) {
            yearlyName = 'Yearly Exam';
        } else {
            yearlyName = (ord[term - 1] || term + 'th') + ' Yearly Exam';
        }
        list.push(yearlyName);
    }
    return list;
}

function applyDynamicExamSchedule(yearlyExams, monthlyExams) {
    const schedule = generateExamScheduleList(yearlyExams, monthlyExams);
    academicConfigState.yearly_exams = parseInt(yearlyExams, 10) || 2;
    academicConfigState.monthly_exams = parseInt(monthlyExams, 10) || 1;

    // Update global ALL_MARKS_EXAM_TYPES array
    if (typeof ALL_MARKS_EXAM_TYPES !== 'undefined') {
        ALL_MARKS_EXAM_TYPES.length = 0;
        schedule.forEach(e => ALL_MARKS_EXAM_TYPES.push(e));
    }

    // Update Marks Entry dropdown (exam-type-select)
    const examSelect = document.getElementById('exam-type-select');
    if (examSelect) {
        const currentVal = examSelect.value;
        examSelect.innerHTML = schedule.map(e => `<option value="${e}">${e}</option>`).join('');
        if (schedule.includes(currentVal)) {
            examSelect.value = currentVal;
        } else if (schedule.length > 0) {
            examSelect.value = schedule[0];
        }
    }
}

async function loadAcademicScheduleConfig() {
    try {
        const data = await ipcRenderer.invoke('get-academic-setup-data');
        if (data && data.success && data.config) {
            applyDynamicExamSchedule(data.config.yearly_exams, data.config.monthly_exams);
        } else {
            applyDynamicExamSchedule(2, 1);
        }
    } catch (e) {
        console.error('Error loading academic config:', e);
        applyDynamicExamSchedule(2, 1);
    }
}

async function initAcademicSetupScreen() {
    const form = document.getElementById('academic-setup-screen');
    if (!form) return;

    const classCountEl = document.getElementById('class-count');
    const classChecks = form.querySelectorAll('.row-class input[type="checkbox"]');
    const classNames = form.querySelectorAll('.row-class input[type="text"]');
    const panelsEl = document.getElementById('sub-panels');
    const titleEl = document.getElementById('sub-title');
    const layout = document.getElementById('sub-layout');
    const emptyEl = document.getElementById('sub-empty');
    const navItems = form.querySelectorAll('.nav-item');
    const yearlyInput = document.getElementById('yearly_exams');
    const monthlyInput = document.getElementById('monthly_exams');
    const termsEl = document.getElementById('preview-terms');
    const totalEl = document.getElementById('preview-total');
    const saveBtn = document.getElementById('btn-save-academic-setup');
    const okMsg = document.getElementById('as-success-msg');

    const idOf = el => el.name.match(/class_(\d+)_/)[1];
    const rowsOf = id => panelsEl ? panelsEl.querySelector('.sub-rows[data-class="' + id + '"]') : null;
    const activeIds = () => [...classChecks].filter(c => c.checked).map(idOf);

    function getClassName(id) {
        const inp = form.querySelector('input[name="class_' + id + '_name"]');
        return inp ? (inp.value.trim() || inp.dataset.default) : '';
    }

    function countSubjects(id) {
        const panel = rowsOf(id);
        if (!panel) return 0;
        let n = 0;
        panel.querySelectorAll('.row').forEach(r => {
            const sw = r.querySelector('input[type="checkbox"]');
            if (!sw || sw.checked) n++;
        });
        return n;
    }

    function refreshLabels() {
        navItems.forEach(n => {
            const cid = n.dataset.class;
            const nameEl = n.querySelector('.nav-name');
            const cntEl = n.querySelector('.nav-count');
            if (nameEl) nameEl.textContent = getClassName(cid);
            if (cntEl) cntEl.textContent = countSubjects(cid);
        });
        if (academicSetupCurrentClassId && titleEl) {
            titleEl.textContent = getClassName(academicSetupCurrentClassId);
        }
    }

    function selectClass(id) {
        academicSetupCurrentClassId = id;
        navItems.forEach(n => n.classList.toggle('active', n.dataset.class === id));
        if (panelsEl) {
            panelsEl.querySelectorAll('.sub-rows').forEach(p => {
                p.hidden = p.dataset.class !== id;
            });
        }
        refreshLabels();
    }

    function syncClasses() {
        let active = 0;
        classChecks.forEach(cb => {
            const row = cb.closest('.row');
            if (row) {
                row.classList.toggle('is-off', !cb.checked);
                const txt = row.querySelector('input[type="text"]');
                if (txt) txt.disabled = !cb.checked;
            }
            if (cb.checked) active++;
        });
        if (classCountEl) classCountEl.textContent = active + ' of ' + classChecks.length + ' active';
        syncNav();
    }

    function syncNav() {
        const act = activeIds();
        navItems.forEach(n => {
            n.hidden = !act.includes(n.dataset.class);
        });
        if (layout) layout.hidden = act.length === 0;
        if (emptyEl) emptyEl.hidden = act.length > 0;
        if (!act.length) {
            academicSetupCurrentClassId = null;
            return;
        }
        if (!academicSetupCurrentClassId || !act.includes(academicSetupCurrentClassId)) {
            selectClass(act[0]);
        } else {
            refreshLabels();
        }
    }

    const ord = n => ['1st', '2nd', '3rd', '4th'][n - 1] || (n + 'th');

    function renderPreview() {
        if (!yearlyInput || !monthlyInput || !termsEl || !totalEl) return;
        const y = +yearlyInput.value, m = +monthlyInput.value;
        let html = '';
        for (let t = 1; t <= y; t++) {
            let chips = '';
            for (let i = 1; i <= m; i++) {
                chips += '<span class="chip">Monthly ' + i + '</span><span class="arrow">&rarr;</span>';
            }
            let yName = (ord(t) + ' Yearly');
            if (y === 2) yName = (t === 1 ? 'Half Yearly' : 'Yearly');
            else if (y === 1) yName = 'Yearly';

            chips += '<span class="chip yearly">' + yName + '</span>';
            const span = 12 % y === 0 ? 'every ' + (12 / y) + ' months' : '';
            html += '<div class="term"><div class="term-label">Term ' + t + '<small>' + span + '</small></div><div class="chips">' + chips + '</div></div>';
        }
        termsEl.innerHTML = html;
        totalEl.innerHTML = '<b>' + (y * m) + '</b> monthly + <b>' + y + '</b> yearly = <b>' + (y * m + y) + '</b> exams per year';
    }

    function updateStepperState() {
        form.querySelectorAll('.stepper button').forEach(btn => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            const next = +input.value + +btn.dataset.dir;
            btn.disabled = next < +input.min || next > +input.max;
        });
    }

    // Load initial data from DB
    try {
        const setupData = await ipcRenderer.invoke('get-academic-setup-data');
        if (setupData && setupData.success) {
            if (setupData.config) {
                if (yearlyInput) yearlyInput.value = setupData.config.yearly_exams || 2;
                if (monthlyInput) monthlyInput.value = setupData.config.monthly_exams || 1;
            }
            // Populate classes display name and active status
            if (Array.isArray(setupData.classes)) {
                setupData.classes.forEach(c => {
                    const row = form.querySelector('.row-class input[data-default="' + c.class_name + '"]');
                    if (row) {
                        row.value = c.class_name;
                        const cb = row.closest('.row').querySelector('input[type="checkbox"]');
                        if (cb) cb.checked = c.is_active !== 0;
                    }
                });
            }
        }
    } catch (e) {
        console.error('Error fetching academic setup data:', e);
    }

    // Cache initial HTML of panels for Reset button
    if (!academicSetupInitialPanelContent['cached'] && panelsEl) {
        panelsEl.querySelectorAll('.sub-rows').forEach(p => {
            academicSetupInitialPanelContent[p.dataset.class] = p.innerHTML;
        });
        academicSetupInitialPanelContent['cached'] = true;
    }

    if (!academicSetupInitialized) {
        academicSetupInitialized = true;

        classChecks.forEach(cb => cb.addEventListener('change', syncClasses));
        const clsAll = document.getElementById('cls-all');
        const clsNone = document.getElementById('cls-none');
        if (clsAll) clsAll.addEventListener('click', () => { classChecks.forEach(c => c.checked = true); syncClasses(); });
        if (clsNone) clsNone.addEventListener('click', () => { classChecks.forEach(c => c.checked = false); syncClasses(); });

        navItems.forEach(n => n.addEventListener('click', () => selectClass(n.dataset.class)));
        classNames.forEach(i => i.addEventListener('input', () => refreshLabels()));

        if (panelsEl) {
            panelsEl.addEventListener('change', e => {
                if (e.target.type !== 'checkbox') return;
                const row = e.target.closest('.row');
                if (row) {
                    row.classList.toggle('is-off', !e.target.checked);
                    const inp = row.querySelector('input[type="text"]');
                    if (inp) inp.disabled = !e.target.checked;
                }
                refreshLabels();
            });

            panelsEl.addEventListener('click', e => {
                const btn = e.target.closest('.row-remove');
                if (btn) {
                    const row = btn.closest('.row');
                    if (row) {
                        const dbId = row.dataset.dbId;
                        if (dbId) academicSetupDeletedCustomSubjectIds.push(parseInt(dbId, 10));
                        row.remove();
                        refreshLabels();
                    }
                }
            });
        }

        const addSubjectBtn = document.getElementById('add-subject');
        if (addSubjectBtn) {
            addSubjectBtn.addEventListener('click', () => {
                if (!academicSetupCurrentClassId) return;
                const rows = rowsOf(academicSetupCurrentClassId);
                if (!rows) return;
                const used = [...rows.querySelectorAll('input[name*="_custom_"]')].map(i => {
                    const m = i.name.match(/_custom_(\d+)_/);
                    return m ? +m[1] : 0;
                });
                const k = (used.length ? Math.max(...used) : 0) + 1;
                rows.insertAdjacentHTML('beforeend',
                    '<div class="row row-subject row-custom">' +
                      '<button type="button" class="row-remove" aria-label="Remove subject"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
                      '<span class="default-name">Custom</span>' +
                      '<input type="text" name="class_' + academicSetupCurrentClassId + '_custom_' + k + '_name" placeholder="Subject name" autocomplete="off" aria-label="Custom subject name">' +
                    '</div>'
                );
                const lastInp = rows.lastElementChild.querySelector('input');
                if (lastInp) lastInp.focus();
                refreshLabels();
            });
        }

        const resetClassBtn = document.getElementById('reset-class');
        if (resetClassBtn) {
            resetClassBtn.addEventListener('click', () => {
                if (!academicSetupCurrentClassId) return;
                const rows = rowsOf(academicSetupCurrentClassId);
                if (rows && academicSetupInitialPanelContent[academicSetupCurrentClassId]) {
                    rows.innerHTML = academicSetupInitialPanelContent[academicSetupCurrentClassId];
                    refreshLabels();
                }
            });
        }

        form.querySelectorAll('.stepper button').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById(btn.dataset.target);
                if (!input) return;
                const next = +input.value + +btn.dataset.dir;
                if (next < +input.min || next > +input.max) return;
                input.value = next;
                updateStepperState();
                renderPreview();
            });
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';

                // Collect data
                const yearly = parseInt(yearlyInput?.value, 10) || 2;
                const monthly = parseInt(monthlyInput?.value, 10) || 1;

                const classesData = [];
                const subjectsData = [];

                // 1. Classes
                const existingData = await ipcRenderer.invoke('get-academic-setup-data');
                const dbClasses = (existingData && existingData.classes) || [];
                const dbSubjects = (existingData && existingData.subjects) || [];

                for (let i = 1; i <= 16; i++) {
                    const cb = form.querySelector('input[name="class_' + i + '_enabled"]');
                    const txt = form.querySelector('input[name="class_' + i + '_name"]');
                    if (cb && txt) {
                        const defaultName = txt.dataset.default;
                        const finalName = txt.value.trim() || defaultName;
                        const isEnabled = cb.checked;
                        const matchCls = dbClasses.find(c => c.class_name === defaultName || c.class_name === finalName) || dbClasses[i - 1];
                        if (matchCls) {
                            classesData.push({
                                id: matchCls.id,
                                class_name: finalName,
                                is_active: isEnabled ? 1 : 0
                            });
                        }
                    }
                }

                // 2. Subjects per class
                if (panelsEl) {
                    panelsEl.querySelectorAll('.sub-rows').forEach(panel => {
                        const classNum = panel.dataset.class;
                        const clsTxt = form.querySelector('input[name="class_' + classNum + '_name"]');
                        const defClsName = clsTxt ? clsTxt.dataset.default : '';
                        const currentClsName = clsTxt ? (clsTxt.value.trim() || defClsName) : '';
                        const matchCls = dbClasses.find(c => c.class_name === defClsName || c.class_name === currentClsName) || dbClasses[+classNum - 1];
                        const classId = matchCls ? matchCls.id : null;

                        if (classId) {
                            const subRows = panel.querySelectorAll('.row');
                            let seq = 1;
                            subRows.forEach(row => {
                                const cb = row.querySelector('input[type="checkbox"]');
                                const txt = row.querySelector('input[type="text"]');
                                if (!txt) return;

                                const isCustom = row.classList.contains('row-custom');
                                const finalSubName = txt.value.trim() || txt.dataset.default || '';
                                const isEnabled = cb ? cb.checked : true;

                                if (isCustom) {
                                    if (finalSubName) {
                                        subjectsData.push({
                                            is_new: true,
                                            class_id: classId,
                                            subject_name: finalSubName,
                                            sequence_order: seq++,
                                            is_active: 1
                                        });
                                    }
                                } else {
                                    const defaultSubName = txt.dataset.default;
                                    const matchSub = dbSubjects.find(s => s.class_id === classId && (s.subject_name === defaultSubName || s.subject_name === finalSubName));
                                    if (matchSub) {
                                        subjectsData.push({
                                            id: matchSub.id,
                                            class_id: classId,
                                            subject_name: finalSubName,
                                            sequence_order: seq++,
                                            is_active: isEnabled ? 1 : 0
                                        });
                                    }
                                }
                            });
                        }
                    });
                }

                const payload = {
                    config: { yearly_exams: yearly, monthly_exams: monthly },
                    classes: classesData,
                    subjects: subjectsData,
                    deleted_subject_ids: academicSetupDeletedCustomSubjectIds
                };

                const res = await ipcRenderer.invoke('save-academic-setup-data', payload);
                if (res && res.success) {
                    applyDynamicExamSchedule(yearly, monthly);
                    if (okMsg) {
                        okMsg.classList.add('show');
                        okMsg.textContent = 'Configuration saved successfully!';
                    }
                    setTimeout(() => {
                        if (academicSetupScreen) academicSetupScreen.style.display = 'none';
                        if (loginScreen) loginScreen.style.display = 'block';
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save Configuration';
                        if (okMsg) okMsg.classList.remove('show');
                    }, 900);
                } else {
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Configuration';
                    alert('Error saving academic setup: ' + ((res && res.error) || 'Unknown error'));
                }
            });
        }
    }

    syncClasses();
    updateStepperState();
    renderPreview();
}
