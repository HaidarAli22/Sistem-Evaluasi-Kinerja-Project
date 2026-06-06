import AppState from './state.js';
import { apiPost } from './api.js';
import { showPage, showSection } from './router.js';
import { applyRoleUI } from './components/rbac.js';
import { loadAllData } from './data.js';
import { loadPenilaian } from './components/penilaian.js';

// ── Password Policy Validator (frontend) ──────────────────────────────────────
function validatePasswordPolicy(password) {
    const errors = [];
    if (password.length < 8)              errors.push('Minimal 8 karakter');
    if (!/[A-Z]/.test(password))          errors.push('Minimal 1 huruf besar');
    if (!/[0-9]/.test(password))          errors.push('Minimal 1 angka');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
                                           errors.push('Minimal 1 karakter spesial');
    return errors;
}

// ── Password Strength Indicator ───────────────────────────────────────────────
export function updatePasswordStrength(password, indicatorId) {
    const indicator = document.getElementById(indicatorId);
    if (!indicator) return;

    const strength = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    ].filter(Boolean).length;

    const levels = [
        { label: '', cls: '' },
        { label: 'Lemah', cls: 'strength-weak' },
        { label: 'Sedang', cls: 'strength-fair' },
        { label: 'Kuat', cls: 'strength-good' },
        { label: 'Sangat Kuat', cls: 'strength-strong' }
    ];

    const level = levels[strength];
    indicator.textContent = password ? level.label : '';
    indicator.className = `password-strength ${level.cls}`;
}

// ── Helper: tampilkan error/success ──────────────────────────────────────────
function showMsg(id, msg, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.className = type === 'error' ? 'error-message show' : 'success-message show';
}

function hideMsg(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('show'); el.textContent = ''; }
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function handleLogin(e) {
    e.preventDefault();
    hideMsg('loginError');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = e.target.querySelector('button[type="submit"]');

    try {
        btn.disabled = true;
        btn.textContent = 'Masuk...';

        // Jika domain bukan @ac.id, anggap kredensial salah agar muncul alert "email salah"
        // (sesuai instruksi user).
        if (!username.endsWith('@ac.id')) {
            throw new Error('email salah');
        }

        const data = await apiPost('/login', { username, password });

        AppState.persistAuth(data.user, data.token);

        document.getElementById('loginForm').reset();
        showDashboard();
    } catch (err) {
        showMsg('loginError', err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
    }
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function handleRegister(e) {
    e.preventDefault();
    hideMsg('registerError');
    hideMsg('registerSuccess');

    const username    = document.getElementById('regUsername').value.trim();
    const password    = document.getElementById('regPassword').value;
    const confirmPwd  = document.getElementById('regConfirmPassword').value;
    const role        = document.getElementById('regRole').value;
    const idKaryawan  = document.getElementById('regKaryawanId').value || null;
    const btn         = e.target.querySelector('button[type="submit"]');

    // Validasi email domain
    if (!username.endsWith('@ac.id')) {
        // Pastikan error login/register tampil sebagai alert email salah (sesuai instruksi pengguna)
        // untuk setiap kasus domain email tidak valid.
        return showMsg('registerError', 'email salah');
    }

    // Validasi password match
    if (password !== confirmPwd) {
        return showMsg('registerError', 'Password dan konfirmasi password tidak cocok!');
    }

    // Validasi password policy (frontend — double check sebelum kirim)
    const policyErrors = validatePasswordPolicy(password);
    if (policyErrors.length > 0) {
        return showMsg('registerError', 'Password tidak memenuhi syarat: ' + policyErrors.join(', '));
    }

    try {
        btn.disabled = true;
        btn.textContent = 'Mendaftar...';

        await apiPost('/register', {
            username,
            password,
            role,
            id_karyawan: idKaryawan ? parseInt(idKaryawan) : null
        });

        showMsg('registerSuccess', 'Pendaftaran berhasil! Redirecting ke login...', 'success');
        document.getElementById('registerForm').reset();

        setTimeout(() => showPage('login'), 2000);
    } catch (err) {
        showMsg('registerError', err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Daftar';
    }
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function logout() {
    AppState.clearAuth();
    document.getElementById('loginForm')?.reset();
    showPage('login');
}

// ── Show Dashboard ────────────────────────────────────────────────────────────
export function showDashboard() {
    const user = AppState.getState('currentUser');
    if (!user) { showPage('login'); return; }

    const userDisplay = document.getElementById('userDisplay');
    const roleDisplay = document.getElementById('roleDisplay');
    if (userDisplay) userDisplay.textContent = user.username;
    if (roleDisplay) roleDisplay.textContent = user.role.toUpperCase();

    // Untuk role Dosen: hanya tampilkan penilaian milik dosen sendiri.
    // Dashboard tidak dipakai sama sekali.
    if (user.role === 'dosen') {
        // Aktifkan wrapper dashboardPage agar section tetap bisa dirender.
        showPage('dashboard');
        applyRoleUI(user.role);
        showSection('penilaian');

        // Nonaktifkan tombol menu dashboard (Overview/Karyawan/KPI)
        // Untuk dosen, hanya tampilkan menu Penilaian.
        const btnOverview = document.getElementById('navOverview');
        if (btnOverview) btnOverview.style.display = 'none';

        const btnKaryawan = document.getElementById('navKaryawan');
        if (btnKaryawan) btnKaryawan.style.display = 'none';

        const btnKPI = document.getElementById('navKPI');
        if (btnKPI) btnKPI.style.display = 'none';

        const btnPenilaian = document.getElementById('navPenilaian');
        if (btnPenilaian) btnPenilaian.style.display = '';

        // Pastikan bagian dashboard lain tidak terlihat.
        const overviewSection = document.getElementById('overviewSection');
        if (overviewSection) overviewSection.classList.remove('active');

        const karyawanSection = document.getElementById('karyawanSection');
        if (karyawanSection) karyawanSection.classList.remove('active');

        const kpiSection = document.getElementById('kpiSection');
        if (kpiSection) kpiSection.classList.remove('active');

        // Sembunyikan filter & chart (bagian dashboard overview)
        const filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) filterPanel.style.display = 'none';
        const chartsGrid = document.querySelector('.charts-grid');
        if (chartsGrid) chartsGrid.style.display = 'none';

        loadPenilaian();
        return;
    } else {
        // Untuk HR dan Kaprodi: dashboard tetap tampil (tidak menghapus dashboard).
        showPage('dashboard');
        applyRoleUI(user.role);

        // Tampilkan kembali menu navigasi dashboard.
        const btnOverview = document.getElementById('navOverview');
        if (btnOverview) btnOverview.style.display = '';
        const btnKaryawan = document.getElementById('navKaryawan');
        if (btnKaryawan) btnKaryawan.style.display = '';
        const btnKPI = document.getElementById('navKPI');
        if (btnKPI) btnKPI.style.display = '';
        const btnPenilaian = document.getElementById('navPenilaian');
        if (btnPenilaian) btnPenilaian.style.display = '';

        // Untuk HR dan Kaprodi: TIDAK menghapus filter visualisasi.
        // Biarkan tombol filter (termasuk tren bulanan) muncul sesuai requirement.
        const filterPanel = document.querySelector('.filter-panel');
        if (filterPanel) filterPanel.style.display = '';

        const btnApplyFilter = document.getElementById('btnApplyFilter');
        const btnResetFilter = document.getElementById('btnResetFilter');
        if (btnApplyFilter) btnApplyFilter.disabled = false;
        if (btnResetFilter) btnResetFilter.disabled = false;


        loadAllData();
        showSection('overview');
    }
}
