const API_URL = 'http://localhost:3000/api/karyawan';

// GET - Ambil semua karyawan
async function getAllKaryawan() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data karyawan');
        return await response.json();
    } catch (error) {
        console.error('Error fetching karyawan data:', error);
        throw error;
    }
}

// GET - Ambil karyawan by ID
async function getKaryawanById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Karyawan tidak ditemukan');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching karyawan ${id}:`, error);
        throw error;
    }
}

// POST - Tambah karyawan baru
async function addKaryawan(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal menambah karyawan');
        return await response.json();
    } catch (error) {
        console.error('Error adding karyawan:', error);
        throw error;
    }
}

// PUT - Update karyawan
async function updateKaryawan(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal mengupdate karyawan');
        return await response.json();
    } catch (error) {
        console.error(`Error updating karyawan ${id}:`, error);
        throw error;
    }
}

// DELETE - Hapus karyawan
async function deleteKaryawan(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Gagal menghapus karyawan');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting karyawan ${id}:`, error);
        throw error;
    }
}

// Backward compatibility
const getKaryawan = getAllKaryawan;