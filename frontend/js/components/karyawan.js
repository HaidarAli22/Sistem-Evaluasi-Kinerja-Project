import AppState from '../state.js';
import { apiGet, apiPost, apiPut, apiDelete } from '../api.js';

// ── Render Table ──────────────────────────────────────────────────────────────
export function renderKaryawanTable() {
    const tbody = document.querySelector('#karyawanTable tbody');
    if (!tbody) return;

    const list = AppState.getState('karyawanList');
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Belum ada data karyawan</td></tr>`;
        return;
    }

    list.forEach((k, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escHtml(k.nama)}</td>
            <td>${escHtml(k.jabatan)}</td>
            <td>
                <button class="btn-edit" id="editKaryawan-${k.id_karyawan}" onclick="window._editKaryawan(${k.id_karyawan})">Edit</button>
                <button class="btn-delete" id="delKaryawan-${k.id_karyawan}" onclick="window._deleteKaryawan(${k.id_karyawan})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ── Update Select Options ─────────────────────────────────────────────────────
export function updateKaryawanSelect() {
    const select = document.getElementById('penilaianKaryawan');
    if (!select) return;

    const list = AppState.getState('karyawanList');
    select.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
    list.forEach(k => {
        const opt = document.createElement('option');
        opt.value = k.id_karyawan;
        opt.textContent = k.nama;
        select.appendChild(opt);
    });
}

// ── Load ──────────────────────────────────────────────────────────────────────
export async function loadKaryawan() {
    try {
        const res = await apiGet('/karyawan');
        AppState.setState('karyawanList', res.data || []);
        renderKaryawanTable();
        updateKaryawanSelect();
    } catch (err) {
        console.error('Gagal memuat karyawan:', err.message);
    }
}

// ── Form Management ───────────────────────────────────────────────────────────
export function showAddKaryawanForm() {
    document.getElementById('karyawanId').value = '';
    document.getElementById('karyawanNama').value = '';
    document.getElementById('karyawanJabatan').value = '';
    document.getElementById('formKaryawanTitle').textContent = 'Tambah Karyawan';
    document.getElementById('karyawanForm').style.display = 'block';
    document.getElementById('karyawanNama').focus();
}

export function editKaryawan(id) {
    const karyawan = AppState.getState('karyawanList').find(k => k.id_karyawan === id);
    if (!karyawan) return;

    document.getElementById('karyawanId').value = karyawan.id_karyawan;
    document.getElementById('karyawanNama').value = karyawan.nama;
    document.getElementById('karyawanJabatan').value = karyawan.jabatan;
    document.getElementById('formKaryawanTitle').textContent = 'Edit Karyawan';
    document.getElementById('karyawanForm').style.display = 'block';
    document.getElementById('karyawanNama').focus();
}

export async function handleSaveKaryawan(e) {
    e.preventDefault();
    const id      = document.getElementById('karyawanId').value;
    const nama    = document.getElementById('karyawanNama').value.trim();
    const jabatan = document.getElementById('karyawanJabatan').value.trim();
    const btn     = e.target.querySelector('[type="submit"]');

    try {
        btn.disabled = true;
        if (id) {
            await apiPut(`/karyawan/${id}`, { nama, jabatan });
        } else {
            await apiPost('/karyawan', { nama, jabatan });
        }
        cancelKaryawanForm();
        await loadKaryawan();
        updateStats();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.disabled = false;
    }
}

export async function deleteKaryawan(id) {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;
    try {
        await apiDelete(`/karyawan/${id}`);
        await loadKaryawan();
        updateStats();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

export function cancelKaryawanForm() {
    document.getElementById('karyawanForm').style.display = 'none';
    document.getElementById('karyawanFormElement').reset();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str || ''));
    return d.innerHTML;
}

function updateStats() {
    const totalEl = document.getElementById('totalKaryawan');
    if (totalEl) totalEl.textContent = AppState.getState('karyawanList').length;
}

// Expose ke window untuk onclick handlers di HTML
window._editKaryawan   = editKaryawan;
window._deleteKaryawan = deleteKaryawan;
