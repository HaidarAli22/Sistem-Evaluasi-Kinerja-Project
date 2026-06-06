import AppState from '../state.js';
import { apiGet, apiPost, apiPut, apiDelete } from '../api.js';

// ── Render Table ──────────────────────────────────────────────────────────────
export function renderKPITable() {
    const tbody = document.querySelector('#kpiTable tbody');
    if (!tbody) return;

    const list = AppState.getState('kpiList');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Belum ada data KPI</td></tr>`;
        return;
    }

    list.forEach((k, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escHtml(k.nama_kpi)}</td>
            <td>${escHtml(k.deskripsi || '-')}</td>
            <td><span class="badge-bobot">${k.bobot}%</span></td>
            <td>
                <button class="btn-edit" id="editKpi-${k.id_kpi}" onclick="window._editKPI(${k.id_kpi})">Edit</button>
                <button class="btn-delete" id="delKpi-${k.id_kpi}" onclick="window._deleteKPI(${k.id_kpi})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ── Update Select Options ─────────────────────────────────────────────────────
export function updateKPISelect() {
    const select = document.getElementById('penilaianKPI');
    if (!select) return;

    const list = AppState.getState('kpiList');
    select.innerHTML = '<option value="">-- Pilih KPI --</option>';
    list.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k.id_kpi;
        opt.textContent = `${k.nama_kpi} (${k.bobot}%)`;
        select.appendChild(opt);
    });
}

// ── Load ──────────────────────────────────────────────────────────────────────
export async function loadKPI() {
    try {
        const res = await apiGet('/kpi');
        AppState.setState('kpiList', res.data || []);
        renderKPITable();
        updateKPISelect();
    } catch (err) {
        console.error('Gagal memuat KPI:', err.message);
    }
}

// ── Form Management ───────────────────────────────────────────────────────────
export function showAddKPIForm() {
    document.getElementById('kpiId').value = '';
    document.getElementById('kpiNama').value = '';
    document.getElementById('kpiDeskripsi').value = '';
    document.getElementById('kpiBobot').value = '';
    document.getElementById('kpiForm').style.display = 'block';
    document.getElementById('kpiNama').focus();
}

export function editKPI(id) {
    const kpi = AppState.getState('kpiList').find(k => k.id_kpi === id);
    if (!kpi) return;

    document.getElementById('kpiId').value = kpi.id_kpi;
    document.getElementById('kpiNama').value = kpi.nama_kpi;
    document.getElementById('kpiDeskripsi').value = kpi.deskripsi || '';
    document.getElementById('kpiBobot').value = kpi.bobot;
    document.getElementById('kpiForm').style.display = 'block';
    document.getElementById('kpiNama').focus();
}

export async function handleSaveKPI(e) {
    e.preventDefault();
    const id       = document.getElementById('kpiId').value;
    const nama_kpi = document.getElementById('kpiNama').value.trim();
    const deskripsi = document.getElementById('kpiDeskripsi').value.trim();
    const bobot    = parseFloat(document.getElementById('kpiBobot').value);
    const btn      = e.target.querySelector('[type="submit"]');

    try {
        btn.disabled = true;
        if (id) {
            await apiPut(`/kpi/${id}`, { nama_kpi, deskripsi, bobot });
        } else {
            await apiPost('/kpi', { nama_kpi, deskripsi, bobot });
        }
        cancelKPIForm();
        await loadKPI();
        updateStats();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.disabled = false;
    }
}

export async function deleteKPI(id) {
    if (!confirm('Yakin ingin menghapus KPI ini?')) return;
    try {
        await apiDelete(`/kpi/${id}`);
        await loadKPI();
        updateStats();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

export function cancelKPIForm() {
    document.getElementById('kpiForm').style.display = 'none';
    document.getElementById('kpiFormElement').reset();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

function updateStats() {
    const totalEl = document.getElementById('totalKPI');
    if (totalEl) totalEl.textContent = AppState.getState('kpiList').length;
}

window._editKPI   = editKPI;
window._deleteKPI = deleteKPI;
