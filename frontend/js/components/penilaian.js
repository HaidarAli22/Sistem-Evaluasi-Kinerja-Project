import AppState from '../state.js';
import { apiGet, apiPost, apiPut, apiDelete } from '../api.js';
import { hasPermission } from './rbac.js';

// ── Render Table ──────────────────────────────────────────────────────────────
export function renderPenilaianTable() {
    const tbody = document.querySelector('#penilaianTable tbody');
    if (!tbody) return;

    const list       = AppState.getState('penilaianList');
    const karyawanList = AppState.getState('karyawanList');
    const kpiList    = AppState.getState('kpiList');
    const canEdit    = hasPermission('canEditPenilaian');

    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Belum ada data penilaian</td></tr>`;
        return;
    }

    // Group by karyawan => satu baris per KPI (sesuai request "berdasarkan kpi setiap karyawan")
    const grouped = new Map();

    list.forEach(p => {
        const idK = p.id_karyawan;
        if (!grouped.has(idK)) grouped.set(idK, []);
        grouped.get(idK).push(p);
    });

    // Urutkan berdasarkan nama karyawan
    const sortedKaryawanIds = Array.from(grouped.keys()).sort((a, b) => {
        const na = karyawanList.find(k => k.id_karyawan === a)?.nama ?? '';
        const nb = karyawanList.find(k => k.id_karyawan === b)?.nama ?? '';
        return na.localeCompare(nb);
    });

    let rowNum = 0;
    sortedKaryawanIds.forEach((idKaryawan) => {
        const items = grouped.get(idKaryawan);
        const namaKaryawan = items[0].nama_karyawan ||
            (karyawanList.find(k => k.id_karyawan === idKaryawan)?.nama ?? '-');

        items
            .slice()
            // Pastikan urutan deterministik dan memasukkan tanggal_penilaian.
            // Karena tabel ditampilkan "per KPI", namun di database bisa ada lebih dari 1 baris per (karyawan, KPI)
            // (mis. per bulan). Dengan ini, baris yang baru saja di-edit akan terlihat berubah.
            .sort((x, y) => {
                const nkx = x.nama_kpi || '';
                const nky = y.nama_kpi || '';
                const byKPI = nkx.localeCompare(nky);
                if (byKPI !== 0) return byKPI;

                const tx = x.tanggal_penilaian ? new Date(x.tanggal_penilaian).getTime() : -Infinity;
                const ty = y.tanggal_penilaian ? new Date(y.tanggal_penilaian).getTime() : -Infinity;
                return ty - tx; // DESC (terbaru dulu)
            })
            .forEach((p, idx) => {
                rowNum++;
                const namaKPI = p.nama_kpi ||
                    (kpiList.find(k => k.id_kpi === p.id_kpi)?.nama_kpi ?? '-');

                const nilaiClass = getNilaiClass(p.nilai);
                const tanggal = p.tanggal_penilaian
                    ? new Date(p.tanggal_penilaian).toLocaleDateString('id-ID')
                    : '-';

                const aksiHtml = canEdit
                    ? `<button class="btn-edit" id="editPenilaian-${p.id_penilaian}" onclick="window._editPenilaian(${p.id_penilaian})">Edit</button>
                       <button class="btn-delete" id="delPenilaian-${p.id_penilaian}" onclick="window._deletePenilaian(${p.id_penilaian})">Hapus</button>`
                    : `<span class="text-muted">—</span>`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rowNum}</td>
                    <td>${idx === 0 ? escHtml(namaKaryawan) : ''}</td>
                    <td>${escHtml(namaKPI)}</td>
                    <td><span class="badge-nilai ${nilaiClass}">${p.nilai}</span></td>
                    <td>${tanggal}</td>
                    <td class="catatan-cell" style="white-space:normal; word-break:break-word;">${escHtml(p.catatan ?? '-')}</td>
                    <td>${aksiHtml}</td>
                `;
                tbody.appendChild(row);
            });
    });
}

// ── Load ──────────────────────────────────────────────────────────────────────
export async function loadPenilaian() {
    try {
        // Auto-seed hanya untuk role HR agar tabel penilaian terisi (karyawan x KPI)
        const user = AppState.getState('currentUser');
        if (user && user.role === 'hr') {
            try {
                await apiPost('/penilaian/seed', {});
            } catch (e) {
                // Jika seed gagal (mis. schema belum sinkron), tetap lanjut load penilaian.
                console.warn('Gagal seed penilaian:', e.message);
            }
        }

        // Force fetch ulang data (hindari state lama)
        AppState.setState('penilaianList', []);
        const res = await apiGet('/penilaian');
        AppState.setState('penilaianList', res.data || []);
        renderPenilaianTable();
        updateStats();
    } catch (err) {
        console.error('Gagal memuat penilaian:', err.message);
    }
}


// ── Form Management ───────────────────────────────────────────────────────────
export function showAddPenilaianForm() {
    document.getElementById('penilaianId').value = '';
    document.getElementById('penilaianKaryawan').value = '';
    document.getElementById('penilaianKPI').value = '';
    document.getElementById('penilaianNilai').value = '';
    document.getElementById('penilaianTanggal').value = '';
    document.getElementById('penilaianCatatan').value = '';
    document.getElementById('penilaianForm').style.display = 'block';
}

export function editPenilaian(id) {
    const p = AppState.getState('penilaianList').find(p => p.id_penilaian === id);
    if (!p) return;

    document.getElementById('penilaianId').value = p.id_penilaian;
    document.getElementById('penilaianKaryawan').value = p.id_karyawan;
    document.getElementById('penilaianKPI').value = p.id_kpi;
    document.getElementById('penilaianNilai').value = p.nilai;

    // Format tanggal untuk input type="date"
    // Request: ketika HR edit, set otomatis tanggal menjadi HARI INI.
    // Catatan: gunakan Date lokal agar tidak error karena timezone.
    const user = AppState.getState('currentUser');
    const isHR = user && user.role === 'hr';

    const pad2 = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

    const tgl = isHR
        ? todayStr
        : (p.tanggal_penilaian
            ? new Date(p.tanggal_penilaian).toISOString().split('T')[0]
            : '');

    document.getElementById('penilaianTanggal').value = tgl;
    document.getElementById('penilaianCatatan').value = p.catatan || '';
    document.getElementById('penilaianForm').style.display = 'block';

    // Jika role HR, saat klik tombol Edit lakukan auto-scroll ke atas agar form terlihat.
    if (isHR) {
        try {
            // scroll ke form (lebih aman daripada scroll ke atas halaman)
            document.getElementById('penilaianForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {
            // fallback
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
}

export async function handleSavePenilaian(e) {
    e.preventDefault();
    const id               = document.getElementById('penilaianId').value;
    const id_karyawan      = parseInt(document.getElementById('penilaianKaryawan').value);
    const id_kpi           = parseInt(document.getElementById('penilaianKPI').value);
    const nilai            = parseFloat(document.getElementById('penilaianNilai').value);
    const tanggal_penilaian = document.getElementById('penilaianTanggal').value;
    const catatan          = document.getElementById('penilaianCatatan').value.trim();
    const btn              = e.target.querySelector('[type="submit"]');

    try {
        btn.disabled = true;
        const payload = { id_karyawan, id_kpi, nilai, tanggal_penilaian, catatan };
        if (id) {
            await apiPut(`/penilaian/${id}`, payload);
        } else {
            await apiPost('/penilaian', payload);
        }
        cancelPenilaianForm();
        await loadPenilaian();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.disabled = false;
    }
}

export async function deletePenilaian(id) {
    if (!confirm('Yakin ingin menghapus penilaian ini?')) return;
    try {
        await apiDelete(`/penilaian/${id}`);
        await loadPenilaian();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

export function cancelPenilaianForm() {
    document.getElementById('penilaianForm').style.display = 'none';
    document.getElementById('penilaianFormElement').reset();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

function getNilaiClass(nilai) {
    if (nilai >= 85) return 'nilai-sangat-baik';
    if (nilai >= 70) return 'nilai-baik';
    if (nilai >= 55) return 'nilai-cukup';
    if (nilai >= 40) return 'nilai-kurang';
    return 'nilai-sangat-kurang';
}

function updateStats() {
    const totalEl = document.getElementById('totalPenilaian');
    if (totalEl) totalEl.textContent = AppState.getState('penilaianList').length;
}

window._editPenilaian   = editPenilaian;
window._deletePenilaian = deletePenilaian;
