const API_URL = 'http://localhost:3000/api/kpi';

// GET - Ambil semua KPI
async function getAllKPI() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Gagal mengambil data KPI');
        return await response.json();
    } catch (error) {
        console.error('Error fetching KPI data:', error);
        throw error;
    }
}

// GET - Ambil KPI by ID
async function getKPIById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('KPI tidak ditemukan');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching KPI ${id}:`, error);
        throw error;
    }
}

// POST - Tambah KPI baru
async function addKPI(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal menambah KPI');
        return await response.json();
    } catch (error) {
        console.error('Error adding KPI:', error);
        throw error;
    }
}

// PUT - Update KPI
async function updateKPI(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Gagal mengupdate KPI');
        return await response.json();
    } catch (error) {
        console.error(`Error updating KPI ${id}:`, error);
        throw error;
    }
}

// DELETE - Hapus KPI
async function deleteKPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Gagal menghapus KPI');
        return await response.json();
    } catch (error) {
        console.error(`Error deleting KPI ${id}:`, error);
        throw error;
    }
}

// Backward compatibility
const getKPI = getAllKPI;