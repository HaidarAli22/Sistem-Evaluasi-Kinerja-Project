/**
 * main.js — Entry Point ES6 Module
 * Semua import & inisialisasi komponen dimulai dari sini.
 */

import AppState from './state.js';


import { showPage, showSection, guardAuth } from './router.js';
import { handleLogin, handleRegister, logout, showDashboard, updatePasswordStrength } from './auth.js';
import { loadKaryawan, showAddKaryawanForm, handleSaveKaryawan, cancelKaryawanForm } from './components/karyawan.js';
import { loadKPI, showAddKPIForm, handleSaveKPI, cancelKPIForm } from './components/kpi.js';
import { loadPenilaian, showAddPenilaianForm, handleSavePenilaian, cancelPenilaianForm } from './components/penilaian.js';
import { initCharts, applyDashboardFilters, resetDashboardFilters, applyMonthlyTrendFilter } from './components/dashboard.js';
import { loadAllData } from './data.js';

// ── Expose fungsi ke window (untuk onclick di HTML) ───────────────────────────
window.showSection           = showSection;
window.showPage              = showPage;
window.showRegisterPage      = () => showPage('register');
window.showLoginPage         = () => showPage('login');
window.logout                = logout;
window.showAddKaryawanForm   = showAddKaryawanForm;
window.cancelKaryawanForm    = cancelKaryawanForm;
window.showAddKPIForm        = showAddKPIForm;
window.cancelKPIForm         = cancelKPIForm;
window.showAddPenilaianForm  = showAddPenilaianForm;
window.cancelPenilaianForm   = cancelPenilaianForm;
window.applyDashboardFilters = applyDashboardFilters;
window.resetDashboardFilters = resetDashboardFilters;
window.applyMonthlyTrendFilter = applyMonthlyTrendFilter;
window.loadAllData           = loadAllData;

// loadAllData dikelola di data.js — di-expose ke window di bawah

// ── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    // Pastikan auth state ter-load sebelum memanggil guardAuth/showDashboard
    AppState.loadAuth();

    // 1. Cek auth & tentukan halaman awal
    const isLoggedIn = guardAuth();
    if (isLoggedIn) {
        showDashboard();
    }

    // 2. Form Event Listeners
    document.getElementById('loginForm')
        ?.addEventListener('submit', handleLogin);

    document.getElementById('registerForm')
        ?.addEventListener('submit', handleRegister);

    document.getElementById('karyawanFormElement')
        ?.addEventListener('submit', handleSaveKaryawan);

    document.getElementById('kpiFormElement')
        ?.addEventListener('submit', handleSaveKPI);

    document.getElementById('penilaianFormElement')
        ?.addEventListener('submit', handleSavePenilaian);

    // 3. Password strength indicator (register form)
    document.getElementById('regPassword')
        ?.addEventListener('input', e => {
            updatePasswordStrength(e.target.value, 'passwordStrength');
        });

    // 4. Initialize password toggle for login and register
    import('./auth-toggle.js').then(mod => {
        mod.initPasswordToggle();
        mod.initRegisterPasswordToggle();
    }).catch(() => {});
});
