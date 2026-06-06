import AppState from './state.js';

/**
 * Router — mengelola navigasi antar halaman dan section dashboard.
 * Halaman: 'login' | 'register' | 'dashboard'
 * Section: 'overview' | 'karyawan' | 'kpi' | 'penilaian'
 */

const PAGES = ['loginPage', 'registerPage', 'dashboardPage'];
const SECTIONS = ['overviewSection', 'karyawanSection', 'kpiSection', 'penilaianSection'];

/**
 * Tampilkan halaman tertentu.
 * @param {'login'|'register'|'dashboard'} page
 */
export function showPage(page) {
    PAGES.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.classList.toggle('active', p === `${page}Page`);
    });

    // Bersihkan pesan error saat pindah halaman
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

/**
 * Tampilkan section dalam dashboard.
 * Guard: beberapa section hanya untuk role tertentu.
 * @param {'overview'|'karyawan'|'kpi'|'penilaian'} sectionName
 */
export function showSection(sectionName) {
    const role = AppState.getState('currentUser')?.role || 'hr';

    // RBAC guard — dosen & kaprodi tidak bisa akses karyawan/kpi section
    if ((sectionName === 'karyawan' || sectionName === 'kpi') && role !== 'hr') {
        sectionName = 'overview';
    }

    // Sembunyikan semua section
    SECTIONS.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.remove('active');
    });

    const target = document.getElementById(`${sectionName}Section`);
    if (target) target.classList.add('active');

    // Update active state nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        const onclick = link.getAttribute('onclick') || '';
        link.classList.toggle('active', onclick.includes(`'${sectionName}'`));
    });
}

/**
 * Route guard: cek apakah user sudah login.
 * Dipanggil di init app.
 * @returns {boolean} true jika sudah login
 */
export function guardAuth() {
    const hasAuth = AppState.loadAuth();
    if (!hasAuth) {
        showPage('login');
        return false;
    }
    return true;
}
