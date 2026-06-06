const API_URL = 'http://localhost:3000/api/penilaian';

// GET - Ambil semua penilaian
async function getAllPenilaian() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data penilaian');
        return await response.json();
    } catch (error) {
        console.error('Error fetching penilaian data:', error);
        throw error;
    }
}

// GET - Ambil penilaian by ID
async function getPenilaianById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Penilaian tidak ditemukan');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching penilaian ${id}:`, error);
        throw error;
    }
}

// GET - Ambil penilaian by karyawan ID
async function getPenilaianByKaryawan(karyawanId) {
    try {
        const response = await fetch(`${API_URL}?id_karyawan=${karyawanId}`);
        if (!response.ok) throw new Error('Gagal mengambil penilaian karyawan');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching penilaian for karyawan ${karyawanId}:`, error);
        throw error;
    }
}

// POST - Tambah penilaian baru
async function addPenilaian(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal menambah penilaian');
        return await response.json();
    } catch (error) {
        console.error('Error adding penilaian:', error);
        throw error;
    }
}

// PUT - Update penilaian
async function updatePenilaian(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal mengupdate penilaian');
        return await response.json();
    } catch (error) {
        console.error(`Error updating penilaian ${id}:`, error);
        throw error;
    }
}

// DELETE - Hapus penilaian
async function deletePenilaian(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Gagal menghapus penilaian');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting penilaian ${id}:`, error);
        throw error;
    }
}

// Backward compatibility
const getPenilaian = getAllPenilaian;