/**
 * data.js — Data Loading Module
 * Dipisah dari main.js untuk menghindari circular import
 * antara auth.js ↔ main.js
 */
import AppState from './state.js';
import { loadKaryawan } from './components/karyawan.js';
import { loadKPI } from './components/kpi.js';
import { loadPenilaian } from './components/penilaian.js';
import { initCharts } from './components/dashboard.js';

/**
 * Load semua data master + penilaian, lalu inisialisasi charts.
 */
export async function loadAllData() {
    AppState.setState('isLoading', true);
    try {
        await Promise.all([loadKaryawan(), loadKPI(), loadPenilaian()]);
        initCharts();
    } catch (err) {
        console.error('Gagal memuat data:', err.message);
    } finally {
        AppState.setState('isLoading', false);
    }
}
