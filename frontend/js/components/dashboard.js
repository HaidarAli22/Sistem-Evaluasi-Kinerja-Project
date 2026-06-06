import { apiGet } from '../api.js';
import AppState from '../state.js';
// import { isHR } from './rbac.js';


// Chart instances (untuk destroy sebelum re-render)
let chartKPI = null;
let chartTrend = null;

let chartDistribusi = null;

const CHART_COLORS = {
    primary:  'rgba(15, 43, 91, 0.85)',      // Navy
    secondary:'rgba(255, 138, 0, 0.80)',     // Accent Orange
    success:  'rgba(40, 199, 111, 0.80)',
    warning:  'rgba(255, 159, 67, 0.80)',
    danger:   'rgba(234, 84, 85, 0.80)',
    info:     'rgba(15, 43, 91, 0.55)',

    border: {
        primary:   'rgba(15, 43, 91, 1)',
        secondary: 'rgba(255, 138, 0, 1)',
        success:   'rgba(40, 199, 111, 1)',
        warning:   'rgba(255, 159, 67, 1)',
        danger:    'rgba(234, 84, 85, 1)',
        info:      'rgba(15, 43, 91, 1)'
    }
};


const DISTRIBUSI_COLORS = [
    CHART_COLORS.success,
    CHART_COLORS.primary,
    CHART_COLORS.warning,
    CHART_COLORS.secondary,
    CHART_COLORS.danger
];

// ── Init Charts ───────────────────────────────────────────────────────────────
/**
 * Initialize all dashboard charts.
 * Only for authenticated users who can view dashboard.
 */
export function initCharts() {
    try {
        const role = document.body.dataset.role;
        console.log(`[Dashboard] Initializing charts for role: ${role}`);
        
        createBarChart();
        createLineChart();

        createDoughnutChart();
        updateCharts();


        
        console.log('[Dashboard] Charts initialized successfully');
    } catch (err) {
        console.error('Error initializing charts:', err);
    }
}

function createBarChart() {
    const ctx = document.getElementById('chartKPI')?.getContext('2d');
    if (!ctx) return;
    if (chartKPI) chartKPI.destroy();

    chartKPI = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Skor Komposit per Karyawan',
                    font: { size: 14, weight: '700' },
                    color: '#0F2B5B'
                },

                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const val = parseFloat(ctx.raw);
                            const jumlah = ctx.dataset.extra?.[ctx.dataIndex] || 0;
                            return ` Skor: ${Number.isFinite(val) ? val.toFixed(2) : '0.00'} (penilaian: ${jumlah})`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Nilai Rata-rata' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function formatBulanLabel(bulan){
    if(!bulan) return '';
    const [y,m] = String(bulan).split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
    const mi = parseInt(m,10);
    return mi>=1 && mi<=12 ? `${months[mi-1]} ${y}` : bulan;
}

function createLineChart() {
    const ctx = document.getElementById('chartTrend')?.getContext('2d');
    if (!ctx) {
        console.warn('[Dashboard] Canvas element for trend chart not found');
        return;
    }
    if (chartTrend) chartTrend.destroy();

    chartTrend = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tren Peningkatan Nilai',

                    font: { size: 14, weight: '700' },
                    color: '#0F2B5B'
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    // Jangan paksa max=100 karena dataset "Jumlah Penilaian" bisa > 100
                    title: { display: false, text: 'Nilai / Jumlah' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: { 
                    grid: { display: false },
                    title: { display: false, text: 'Karyawan' }
                }

            }
        }
    });
    
    console.log('[Dashboard] Trend line chart initialized');
}

/* disabled createCompositeTrendChart() {

    const ctx = document.getElementById('chartCompositeTrend')?.getContext('2d');

    if (!ctx) {
        console.warn('[Dashboard] Canvas element for composite trend chart not found');
        return;
    }
    if (chartCompositeTrend) chartCompositeTrend.destroy();

    chartCompositeTrend = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Tren Skor Komposit (per bulan)',
                    font: { size: 14, weight: '600' },
                    color: '#2c3e50'
                },
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 15 }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Skor Komposit' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false },
                    title: { display: true, text: 'Bulan' }
                }
            }
        }
    });

    console.log('[Dashboard] Composite trend line chart initialized');
}*/


function createDoughnutChart() {
    const ctx = document.getElementById('chartDistribusi')?.getContext('2d');
    if (!ctx) return;
    if (chartDistribusi) chartDistribusi.destroy();

    chartDistribusi = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribusi Kategori Nilai',
                    font: { size: 14, weight: '600' },
                    color: '#2c3e50'
                },
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ── Update Charts dengan Filter ───────────────────────────────────────────────
/**
 * Update all dashboard charts with current filters.
 * Fetches data from API and renders charts.
 */
export async function updateCharts() {
    const filters = AppState.getState('dashboardFilters') || { dateFrom: '', dateTo: '' };
    const params = {};
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;

    showChartsLoading(true);

    try {
        const role =
            AppState.getState('auth')?.role ||
            AppState.getState('currentUser')?.role ||
            document.body.dataset.role;
        const canViewTrend = role === 'hr' || role === 'kaprodi';

        // Tampilkan/sembunyikan chart card sesuai role (HR & kaprodi saja)
        const chartTrendCard = document.getElementById('chartTrendCard');
        if (chartTrendCard) chartTrendCard.style.display = canViewTrend ? '' : 'none';

        // Pastikan chart line selalu di-update supaya terlihat datanya.
        // (tanpa mengubah role guard dan tanpa mengubah perilaku pemanggilan endpoint)

        const responses = await Promise.all([
            apiGet('/dashboard/stats', params).catch(e => {
                console.error('Error fetching stats:', e);
                return { data: null };
            }),
            apiGet('/dashboard/composite-scores', params).catch(e => {
                console.error('Error fetching composite scores:', e);
                // Biar mudah debugging: tampilkan error di console + payload yang tetap aman
                return { data: { karyawan: [], _error: e?.message || String(e) } };
            }),

            apiGet('/dashboard/score-distribution', params).catch(e => {
                console.error('Error fetching score distribution:', e);
                return { data: null };
            }),
            (canViewTrend
                ? apiGet('/dashboard/monthly-trend', params).catch(e => {
                    console.error('Error fetching monthly trend:', e);
                    return { data: { labels: [], jumlah: [], rata_rata: [] } };
                })
                : Promise.resolve({ data: { labels: [], jumlah: [], rata_rata: [] } })
            ),
            apiGet('/dashboard/areas-of-improvement', params).catch(e => {
                console.error('Error fetching areas of improvement:', e);
                return { data: { kpis: [], karyawans: [] } };
            })
        ]);

        const [statsRes, compositeRes, distribusiRes, monthlyTrendRes, areasRes] = responses;




        // Stats cards

        if (statsRes && statsRes.data) renderStats(statsRes.data);

            // Bar Chart: Skor Komposit per Karyawan
        if (chartKPI && compositeRes && compositeRes.data) {
            // Logika filter: kalau belum ada filter date (dateFrom/dateTo kosong), TAMPILKAN kosong
            // sesuai request: visualisasi baru jalan jika range filter diterapkan.
            const currentFilters = AppState.getState('dashboardFilters') || { dateFrom: '', dateTo: '' };
            const dateFrom = currentFilters.dateFrom || '';
            const dateTo = currentFilters.dateTo || '';
            const hasFilterRange = Boolean(dateFrom && dateTo);

            if (!hasFilterRange) {
                chartKPI.data.labels = [];
                chartKPI.data.datasets = [{
                    label: 'Skor Komposit',
                    data: [0],
                    extra: [0],
                    backgroundColor: ['rgba(0,0,0,0.05)'],
                    borderRadius: 6,
                    borderSkipped: false
                }];
                chartKPI.update('none');
                return;
            }


            const karyawans = Array.isArray(compositeRes.data) ? compositeRes.data : [];

            if (karyawans.length > 0) {
                chartKPI.data.labels = karyawans.map(d => d.nama);
                const skorArr = karyawans.map(d => {
                    const v = parseFloat(d.skor_komposit);
                    return Number.isFinite(v) ? v : 0;
                });

                chartKPI.data.datasets = [{
                    label: 'Skor Komposit',
                    data: skorArr,
                    extra: karyawans.map(d => d.jumlah_penilaian),

                    backgroundColor: karyawans.map((_, i) =>
                        Object.values(CHART_COLORS).filter(v => typeof v === 'string')[i % 6]
                    ),

                    borderRadius: 6,
                    borderSkipped: false
                }];
                chartKPI.update('none');
            } else {
                chartKPI.data.labels = ['Tidak ada KPI'];
                chartKPI.data.datasets = [{
                    label: 'No Data',
                    data: [0],
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: 6
                }];
                chartKPI.update('none');
            }
        }

        // Line Chart: Tren peningkatan nilai per karyawan (tren bulanan agregat)
        if (chartTrend && canViewTrend && monthlyTrendRes && monthlyTrendRes.data) {


            const normalized = (() => {
                const d = monthlyTrendRes.data;

                // Format ideal backend saat ini:
                // { data: [{ bulan, jumlah, rata_rata }, ...] }
                // tapi karena di response wrapper, kita pastikan bentuknya.
                if (Array.isArray(d)) {
                    return {
                        labels: d.map(x => x.bulan),
                        jumlah: d.map(x => x.jumlah),
                        rata_rata: d.map(x => x.rata_rata)
                    };
                }

                // Jika bentuknya { labels, jumlah, rata_rata }
                if (d && Array.isArray(d.labels) && Array.isArray(d.jumlah) && Array.isArray(d.rata_rata)) {
                    return { labels: d.labels, jumlah: d.jumlah, rata_rata: d.rata_rata };
                }

                // Jika bentuknya { data: [{...}] }
                const anyData = d?.data;
                if (Array.isArray(anyData) && anyData.length > 0) {
                    return {
                        labels: anyData.map(x => x.bulan),
                        jumlah: anyData.map(x => x.jumlah),
                        rata_rata: anyData.map(x => x.rata_rata)
                    };
                }

                // fallback default
                return { labels: [], jumlah: [], rata_rata: [] };
            })();

            const normLabels = normalized.labels;
            const jumlahArr = normalized.jumlah;
            const rataRataArr = normalized.rata_rata;

                // Validasi: pastikan chartTrend tidak error dan data memang ada
            if (Array.isArray(normLabels) && normLabels.length > 0) {




                // Request audit: hanya tampilkan bulan dan rata-rata nilai.
                const datasetAvg = {
                    label: '',
                    data: rataRataArr.map(v => parseFloat(v) || 0),
                    borderColor: CHART_COLORS.border.info,
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: CHART_COLORS.border.info,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                };

                chartTrend.data.labels = normLabels;
                chartTrend.data.datasets = [datasetAvg];


                // Sesuaikan sumbu untuk nilai ganda (jumlah bisa >100). Paling aman: biarkan default.
                // Format label bulan agar tampil seperti "Jan 2025" (bukan "2025-01")
                chartTrend.data.labels = normLabels.map(formatBulanLabel);

                chartTrend.update('none');
            } else {
                chartTrend.data.labels = ['Tidak ada data'];
                chartTrend.data.datasets = [{
                    label: 'No Data',
                    data: [0],
                    borderColor: 'rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderDash: [5, 5]
                }];
                chartTrend.update('none');
            }
        }

        // Doughnut Chart: distribusi
        if (chartDistribusi && distribusiRes.data) {
            const { labels, values } = distribusiRes.data;
            const totalValues = values.reduce((a, b) => a + b, 0);

            if (totalValues > 0) {
                chartDistribusi.data.labels = labels;
                chartDistribusi.data.datasets = [{
                    data: values,
                    backgroundColor: DISTRIBUSI_COLORS,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 8
                }];
                chartDistribusi.update('none');
            } else {
                chartDistribusi.data.labels = ['Tidak ada data'];
                chartDistribusi.data.datasets = [{
                    data: [1],
                    backgroundColor: ['rgba(0,0,0,0.1)'],
                    borderWidth: 1
                }];
                chartDistribusi.update('none');
            }
        }

        // Areas of improvement
        if (areasRes && areasRes.data) renderAreasOfImprovement(areasRes.data);
    } catch (err) {
        console.error('[Dashboard] Error updating charts:', err.message, err);
        // hindari memblokir login flow: hanya alert jika dashboard sudah tampil
        alert(`Error loading dashboard data: ${err.message}`);
    } finally {
        showChartsLoading(false);
        console.log('[Dashboard] Chart update completed');
    }
}

// ── Render Stats Cards ────────────────────────────────────────────────────────
function renderStats(stats) {
    if (!stats) return;
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;

        // Biar tidak overflow / tidak bikin layout berubah,
        // batasi panjang teks numerik yang tampil di panel statistik.
        let out = val;
        if (out === null || out === undefined || out === '' || out === '—') {
            out = '—';
        }

        // Supaya konsisten tampilan "angka" (contoh: 80, 80.5, 80.00)
        const num = typeof out === 'number' ? out : (typeof out === 'string' ? Number(out) : NaN);
        if (Number.isFinite(num)) {
            out = num.toFixed(2);
        }

        // Batasi karakter agar rapi sesuai ukuran kotak
        const str = String(out);
        el.textContent = str.length > 12 ? str.slice(0, 12) + '…' : str;
    };
    set('totalKaryawan', stats.totalKaryawan);
    set('totalKPI', stats.totalKPI);
    set('totalPenilaian', stats.totalPenilaian);
    set('rataRataNilai', stats.rataRataNilai || '—');
    // UI di index.html memakai id="rataRataNilai2"
    set('rataRataNilai2', stats.rataRataNilai || '—');
    set('nilaiTertinggi', stats.nilaiTertinggi || '—');
    set('nilaiTerendah', stats.nilaiTerendah || '—');
}

function renderAreasOfImprovement(areasData) {
    const kpis = Array.isArray(areasData.kpis) ? areasData.kpis : [];
    const karyawans = Array.isArray(areasData.karyawans) ? areasData.karyawans : [];

    const elKpi = document.getElementById('areaPerbaikanKpi');
    const elKaryawan = document.getElementById('areaPerbaikanKaryawan');

    if (elKpi) {
        if (kpis.length === 0) {
            elKpi.textContent = 'Tidak ada data';
        } else {
            elKpi.innerHTML = kpis.map((k, idx) => {
                const score = parseFloat(k.rata_rata || 0).toFixed(2);
                return `
                    <div class="area-row">
                        <span class="area-rank">#${idx + 1}</span>
                        <span class="area-name">${k.nama_kpi}</span>
                        <span class="area-score text-danger">${score}</span>
                    </div>
                `;
            }).join('');
        }
    }

    if (elKaryawan) {
        if (karyawans.length === 0) {
            elKaryawan.textContent = 'Tidak ada data';
        } else {
            elKaryawan.innerHTML = karyawans.map((k, idx) => {
                const score = parseFloat(k.skor_komposit || 0).toFixed(2);
                return `
                    <div class="area-row">
                        <span class="area-rank">#${idx + 1}</span>
                        <span class="area-name">${k.nama}</span>
                        <span class="area-score text-danger">${score}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

// ── Filter Handlers ───────────────────────────────────────────────────────────
/**
 * Apply dashboard filters and update all charts.
 */
export function applyDashboardFilters() {
    const dateFromEl = document.getElementById('filterDateFrom');
    const dateToEl   = document.getElementById('filterDateTo');
    const role = AppState.getState('auth')?.role || document.body.dataset.role;

    const rawDateFrom = dateFromEl?.value || '';
    const rawDateTo   = dateToEl?.value   || '';

    console.log('[Dashboard] Applying filters:', { role, rawDateFrom, rawDateTo });

    // Rule:
    // - HR: boleh pilih rentang bulan kapan saja (map ke dateFrom/dateTo)
    // - kaprodi: hanya boleh lihat tren skor komposit bulan ini
    // - (dosen belum diminta, pakai default behaviour dari backend)
    if (role === 'kaprodi') {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');

        const monthStart = `${y}-${m}-01`;
        const monthEndDate = new Date(y, now.getMonth() + 1, 0);
        const monthEnd = `${y}-${m}-${String(monthEndDate.getDate()).padStart(2, '0')}`;

        AppState.setState('dashboardFilters', { dateFrom: monthStart, dateTo: monthEnd });
        updateCharts();
        return;
    }

    const dateFrom = rawDateFrom;
    const dateTo   = rawDateTo;

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai!');
        return;
    }

    AppState.setState('dashboardFilters', { dateFrom, dateTo });
    updateCharts();
}

/**
 * Reset all filters and reload charts with all data.
 */
export function resetDashboardFilters() {
    console.log('[Dashboard] Resetting filters');
    
    const fromEl = document.getElementById('filterDateFrom');
    const toEl   = document.getElementById('filterDateTo');
    if (fromEl) fromEl.value = '';
    if (toEl)   toEl.value   = '';
    
    AppState.setState('dashboardFilters', { dateFrom: '', dateTo: '' });
    updateCharts();
}

/**
 * Khusus HR: tombol untuk memuat ulang tren skor komposit per bulan
 * berdasarkan rentang tanggal yang dipilih.
 *
 * Untuk role kaprodi, fungsi ini tidak digunakan (bisa disembunyikan/diabaikan di UI).
 */
export function applyMonthlyTrendFilter() {
    const role = AppState.getState('currentUser')?.role || document.body.dataset.role;

    if (role !== 'hr' && role !== 'kaprodi') {
        alert('Aksi ini hanya untuk HR atau Kaprodi');
        return;
    }

    const dateFromEl = document.getElementById('filterDateFrom');
    const dateToEl = document.getElementById('filterDateTo');

    const dateFrom = dateFromEl?.value || '';
    const dateTo = dateToEl?.value || '';

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        alert('Tanggal mulai tidak boleh lebih besar dari tanggal selesai!');
        return;
    }

    // Untuk role hr: pakai rentang yang dipilih.
    // Untuk role kaprodi: sesuai requirement, grafik mengikuti tren bulanan bulan berjalan saja.
    if (role === 'kaprodi') {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');

        const monthStart = `${y}-${m}-01`;
        const monthEndDate = new Date(y, now.getMonth() + 1, 0);
        const monthEnd = `${y}-${m}-${String(monthEndDate.getDate()).padStart(2, '0')}`;

        AppState.setState('dashboardFilters', { dateFrom: monthStart, dateTo: monthEnd });
    } else {
        AppState.setState('dashboardFilters', { dateFrom, dateTo });
    }

    updateCharts();
}

// ── Expose fungsi untuk tombol onclick di index.html ───────────────────────
// Karena tombol di HTML menggunakan onclick="...".
// main.js sudah expose applyDashboardFilters/resetDashboardFilters.
// Kita tambahkan export ini agar bisa dipasang ke window.

export function exposeDashboardHRHelpers() {
    // Placeholder: fungsi ini tidak dipakai oleh logic.
}

// Commonjs export fallback (jika bundling/hosting mengekspos dengan cara berbeda)
// Tetap aman untuk lingkungan browser biasa.
try {
    // eslint-disable-next-line no-undef
    if (typeof window !== 'undefined') {
        window.applyMonthlyTrendFilter = applyMonthlyTrendFilter;
    }
} catch (_) {}

// Tombol ini hanya untuk HR & kaprodi, sehingga jika ada intervensi RBAC
// yang menyembunyikan elemen tanpa kita control langsung, kita paksa visibilitasnya.
try {
    const btn = document.getElementById('btnApplyMonthlyTrend');
    if (btn) {
        const r = document.body.dataset.role;
        btn.style.display = (r === 'hr' || r === 'kaprodi') ? '' : 'none';
        btn.classList.toggle('hidden-by-rbac', !(r === 'hr' || r === 'kaprodi'));
    }
} catch (_) {}



// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBulan(yearMonth) {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-');
    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
    return `${months[parseInt(month) - 1]} ${year}`;
}

function showChartsLoading(show) {
    const overlay = document.getElementById('chartsLoading');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}
