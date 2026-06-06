const API_URL = 'http://localhost:3000/api';

// State
let currentUser = null;
let karyawanList = [];
let kpiList = [];
let penilaianList = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showDashboard();
        } catch {
            currentUser = null;
            showLoginPage();
        }
    } else {
        showLoginPage();
    }

    // Event Listeners (guard biar tidak crash saat elemen tidak ada)
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const karyawanFormElement = document.getElementById('karyawanFormElement');
    const kpiFormElement = document.getElementById('kpiFormElement');
    const penilaianFormElement = document.getElementById('penilaianFormElement');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (karyawanFormElement) karyawanFormElement.addEventListener('submit', handleSaveKaryawan);
    if (kpiFormElement) kpiFormElement.addEventListener('submit', handleSaveKPI);
    if (penilaianFormElement) penilaianFormElement.addEventListener('submit', handleSavePenilaian);
});

// ===== LOGIN =====
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login gagal');
        }

        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginForm').reset();
        showDashboard();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
}

// ===== REGISTER =====
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const role = document.getElementById('regRole').value;
    const idKaryawan = document.getElementById('regKaryawanId').value || null;
    
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    // Validasi password match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Password tidak cocok!';
        errorDiv.classList.add('show');
        return;
    }

    // Validasi password length
    if (password.length < 6) {
        errorDiv.textContent = 'Password minimal 6 karakter!';
        errorDiv.classList.add('show');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password, 
                role,
                id_karyawan: idKaryawan ? parseInt(idKaryawan) : null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Pendaftaran gagal');
        }

        // Tampilkan pesan sukses
        successDiv.textContent = 'Pendaftaran berhasil! Redirecting ke login...';
        successDiv.classList.add('show');
        
        // Reset form
        document.getElementById('registerForm').reset();
        
        // Redirect ke login setelah 2 detik
        setTimeout(() => {
            showLoginPage();
        }, 2000);
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
}

function showRegisterPage() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
    // Clear messages
    document.getElementById('registerError').classList.remove('show');
    document.getElementById('registerSuccess').classList.remove('show');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    showLoginPage();
}

// ===== PAGE NAVIGATION =====
function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.remove('active');
    // Clear messages
    document.getElementById('loginError').classList.remove('show');
    document.getElementById('loginForm').reset();
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');

    document.getElementById('userDisplay').textContent = currentUser.username;
    document.getElementById('roleDisplay').textContent = currentUser.role;

    applyRolePermissions(currentUser?.role);
    loadAllData();
    showSection('overview');
}

function applyRolePermissions(role) {
    // Defaults: show everything (HR behavior)
    const navKaryawan = document.getElementById('navKaryawan');
    const navKPI = document.getElementById('navKPI');
    const btnTambahKaryawan = document.getElementById('btnTambahKaryawan');
    const btnTambahKPI = document.getElementById('btnTambahKPI');
    const btnTambahPenilaian = document.getElementById('btnTambahPenilaian');
    const karyawanSection = document.getElementById('karyawanSection');
    const kpiSection = document.getElementById('kpiSection');

    if (!role) role = 'hr';

    // Role mapping: hr, kaprodi, dosen
    if (role === 'hr') {
        if (navKaryawan) navKaryawan.style.display = '';
        if (navKPI) navKPI.style.display = '';
        if (btnTambahKaryawan) btnTambahKaryawan.style.display = '';
        if (btnTambahKPI) btnTambahKPI.style.display = '';
        if (btnTambahPenilaian) btnTambahPenilaian.style.display = '';

        // Tombol filter tren bulanan untuk HR
        const btnMonthlyTrend = document.getElementById('btnApplyMonthlyTrend');
        if (btnMonthlyTrend) {
            btnMonthlyTrend.style.display = '';
            btnMonthlyTrend.classList.remove('hidden-by-rbac');
        }

        if (karyawanSection) karyawanSection.style.display = '';
        if (kpiSection) kpiSection.style.display = '';
        return;
    }


    if (role === 'kaprodi') {
        // Kaprodi: CRUD karyawan/KPI tidak boleh, CRUD penilaian hanya view + filter
        if (navKaryawan) navKaryawan.style.display = 'none';
        if (navKPI) navKPI.style.display = 'none';
        if (btnTambahKaryawan) btnTambahKaryawan.style.display = 'none';
        if (btnTambahKPI) btnTambahKPI.style.display = 'none';
        if (btnTambahPenilaian) btnTambahPenilaian.style.display = 'none';

        // Karyawan/KPI section tidak ditampilkan lewat nav, tapi tetap aman disembunyikan
        if (karyawanSection) karyawanSection.style.display = 'none';
        if (kpiSection) kpiSection.style.display = 'none';
        return;
    }

    if (role === 'dosen') {
        // Dosen: hanya view penilaian milik sendiri
        if (navKaryawan) navKaryawan.style.display = 'none';
        if (navKPI) navKPI.style.display = 'none';
        if (btnTambahKaryawan) btnTambahKaryawan.style.display = 'none';
        if (btnTambahKPI) btnTambahKPI.style.display = 'none';
        if (btnTambahPenilaian) btnTambahPenilaian.style.display = 'none';

        if (karyawanSection) karyawanSection.style.display = 'none';
        if (kpiSection) kpiSection.style.display = 'none';
        return;
    }
}

function showSection(sectionName) {
    const role = currentUser?.role || 'hr';

    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));

    // Show selected section (with role guards)
    if (sectionName === 'overview') {
        document.getElementById('overviewSection').classList.add('active');
    } else if (sectionName === 'karyawan') {
        if (role === 'hr') {
            document.getElementById('karyawanSection').classList.add('active');
            loadKaryawan();
        } else {
            document.getElementById('overviewSection').classList.add('active');
        }
    } else if (sectionName === 'kpi') {
        if (role === 'hr') {
            document.getElementById('kpiSection').classList.add('active');
            loadKPI();
        } else {
            document.getElementById('overviewSection').classList.add('active');
        }
    } else if (sectionName === 'penilaian') {
        document.getElementById('penilaianSection').classList.add('active');
        loadPenilaian();
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeBtn = Array.from(document.querySelectorAll('.nav-link')).find(n => n.getAttribute('onclick')?.includes("'" + sectionName + "'"));
    if (activeBtn) activeBtn.classList.add('active');
}

// ===== LOAD DATA =====
async function loadAllData() {
    await loadKaryawan();
    await loadKPI();
    await loadPenilaian();
    updateStats();
}

async function loadKaryawan() {
    try {
        const response = await fetch(`${API_URL}/karyawan`);
        karyawanList = await response.json();
        renderKaryawanTable();
        updateKaryawanSelect();
    } catch (error) {
        console.error('Error loading karyawan:', error);
    }
}

async function loadKPI() {
    try {
        const response = await fetch(`${API_URL}/kpi`);
        kpiList = await response.json();
        renderKPITable();
        updateKPISelect();
    } catch (error) {
        console.error('Error loading KPI:', error);
    }
}

async function loadPenilaian() {
    try {
        const role = currentUser?.role || 'hr';

        // Dosen: hanya penilaian milik sendiri
        if (role === 'dosen') {
            const idKaryawan = currentUser?.id_karyawan;
            if (!idKaryawan) {
                penilaianList = [];
                renderPenilaianTable();
                return;
            }
            const response = await fetch(`${API_URL}/penilaian?id_karyawan=${encodeURIComponent(idKaryawan)}`);
            penilaianList = await response.json();
            renderPenilaianTable();
            return;
        }

        // Kaprodi & HR: tampilkan semua penilaian (kaprodi bisa filter di UI nanti, tapi untuk sekarang view semua)
        const response = await fetch(`${API_URL}/penilaian`);
        penilaianList = await response.json();
        renderPenilaianTable();
    } catch (error) {
        console.error('Error loading penilaian:', error);
    }
}

function updateStats() {
    document.getElementById('totalKaryawan').textContent = karyawanList.length;
    document.getElementById('totalKPI').textContent = kpiList.length;
    document.getElementById('totalPenilaian').textContent = penilaianList.length;
}

// ===== KARYAWAN FUNCTIONS =====
function showAddKaryawanForm() {
    document.getElementById('karyawanId').value = '';
    document.getElementById('karyawanNama').value = '';
    document.getElementById('karyawanJabatan').value = '';
    document.getElementById('formTitle').textContent = 'Tambah Karyawan';
    document.getElementById('karyawanForm').style.display = 'block';
}

function editKaryawan(id) {
    const karyawan = karyawanList.find(k => k.id_karyawan === id);
    if (!karyawan) return;

    document.getElementById('karyawanId').value = karyawan.id_karyawan;
    document.getElementById('karyawanNama').value = karyawan.nama;
    document.getElementById('karyawanJabatan').value = karyawan.jabatan;
    document.getElementById('formTitle').textContent = 'Edit Karyawan';
    document.getElementById('karyawanForm').style.display = 'block';
}

async function handleSaveKaryawan(e) {
    e.preventDefault();
    const id = document.getElementById('karyawanId').value;
    const nama = document.getElementById('karyawanNama').value;
    const jabatan = document.getElementById('karyawanJabatan').value;

    try {
        let response;
        if (id) {
            // Update
            response = await fetch(`${API_URL}/karyawan/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama,
                    jabatan
                })
            });
        } else {
            // Create
            response = await fetch(`${API_URL}/karyawan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama,
                    jabatan
                })
            });
        }

        if (!response.ok) throw new Error('Gagal menyimpan karyawan');

        cancelForm('karyawan');
        await loadKaryawan();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteKaryawan(id) {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return;

    try {
        const response = await fetch(`${API_URL}/karyawan/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus karyawan');

        await loadKaryawan();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function renderKaryawanTable() {
    const tbody = document.querySelector('#karyawanTable tbody');
    tbody.innerHTML = '';

    karyawanList.forEach(k => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${k.id_karyawan}</td>
            <td>${k.nama}</td>
            <td>${k.jabatan}</td>
            <td>
                <button class="btn-edit" onclick="editKaryawan(${k.id_karyawan})">Edit</button>
                <button class="btn-delete" onclick="deleteKaryawan(${k.id_karyawan})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateKaryawanSelect() {
    const select = document.getElementById('penilaianKaryawan');
    select.innerHTML = '<option value="">-- Pilih Karyawan --</option>';
    karyawanList.forEach(k => {
        const option = document.createElement('option');
        option.value = k.id_karyawan;
        option.textContent = k.nama;
        select.appendChild(option);
    });
}

// ===== KPI FUNCTIONS =====
function showAddKPIForm() {
    document.getElementById('kpiId').value = '';
    document.getElementById('kpiNama').value = '';
    document.getElementById('kpiDeskripsi').value = '';
    document.getElementById('kpiBobot').value = '';
    document.getElementById('kpiForm').style.display = 'block';
}

function editKPI(id) {
    const kpi = kpiList.find(k => k.id_kpi === id);
    if (!kpi) return;

    document.getElementById('kpiId').value = kpi.id_kpi;
    document.getElementById('kpiNama').value = kpi.nama_kpi;
    document.getElementById('kpiDeskripsi').value = kpi.deskripsi || '';
    document.getElementById('kpiBobot').value = kpi.bobot;
    document.getElementById('kpiForm').style.display = 'block';
}

async function handleSaveKPI(e) {
    e.preventDefault();
    const id = document.getElementById('kpiId').value;
    const nama_kpi = document.getElementById('kpiNama').value;
    const deskripsi = document.getElementById('kpiDeskripsi').value;
    const bobot = document.getElementById('kpiBobot').value;

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/kpi/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama_kpi,
                    deskripsi,
                    bobot
                })
            });
        } else {
            response = await fetch(`${API_URL}/kpi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama_kpi,
                    deskripsi,
                    bobot
                })
            });
        }

        if (!response.ok) throw new Error('Gagal menyimpan KPI');

        cancelForm('kpi');
        await loadKPI();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteKPI(id) {
    if (!confirm('Yakin ingin menghapus KPI ini?')) return;

    try {
        const response = await fetch(`${API_URL}/kpi/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus KPI');

        await loadKPI();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function renderKPITable() {
    const tbody = document.querySelector('#kpiTable tbody');
    tbody.innerHTML = '';

    kpiList.forEach(k => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${k.id_kpi}</td>
            <td>${k.nama_kpi}</td>
            <td>${k.deskripsi || '-'}</td>
            <td>${k.bobot}%</td>
            <td>
                <button class="btn-edit" onclick="editKPI(${k.id_kpi})">Edit</button>
                <button class="btn-delete" onclick="deleteKPI(${k.id_kpi})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateKPISelect() {
    const select = document.getElementById('penilaianKPI');
    select.innerHTML = '<option value="">-- Pilih KPI --</option>';
    kpiList.forEach(k => {
        const option = document.createElement('option');
        option.value = k.id_kpi;
        option.textContent = k.nama_kpi;
        select.appendChild(option);
    });
}

// ===== PENILAIAN FUNCTIONS =====
function showAddPenilaianForm() {
    document.getElementById('penilaianId').value = '';
    document.getElementById('penilaianKaryawan').value = '';
    document.getElementById('penilaianKPI').value = '';
    document.getElementById('penilaianNilai').value = '';
    document.getElementById('penilaianTanggal').value = '';
    document.getElementById('penilaianCatatan').value = '';
    document.getElementById('penilaianForm').style.display = 'block';
}

function editPenilaian(id) {
    const penilaian = penilaianList.find(p => p.id_penilaian === id);
    if (!penilaian) return;

    document.getElementById('penilaianId').value = penilaian.id_penilaian;
    document.getElementById('penilaianKaryawan').value = penilaian.id_karyawan;
    document.getElementById('penilaianKPI').value = penilaian.id_kpi;
    document.getElementById('penilaianNilai').value = penilaian.nilai;
    document.getElementById('penilaianTanggal').value = penilaian.tanggal_penilaian;
    document.getElementById('penilaianCatatan').value = penilaian.catatan || '';
    document.getElementById('penilaianForm').style.display = 'block';
}

async function handleSavePenilaian(e) {
    e.preventDefault();
    const id = document.getElementById('penilaianId').value;
    const id_karyawan = document.getElementById('penilaianKaryawan').value;
    const id_kpi = document.getElementById('penilaianKPI').value;
    const nilai = document.getElementById('penilaianNilai').value;
    const tanggal_penilaian = document.getElementById('penilaianTanggal').value;
    const catatan = document.getElementById('penilaianCatatan').value;

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/penilaian/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_karyawan,
                    id_kpi,
                    nilai,
                    tanggal_penilaian,
                    catatan
                })
            });
        } else {
            response = await fetch(`${API_URL}/penilaian`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_karyawan,
                    id_kpi,
                    nilai,
                    tanggal_penilaian,
                    catatan
                })
            });
        }

        if (!response.ok) throw new Error('Gagal menyimpan penilaian');

        cancelForm('penilaian');
        await loadPenilaian();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deletePenilaian(id) {
    if (!confirm('Yakin ingin menghapus penilaian ini?')) return;

    try {
        const response = await fetch(`${API_URL}/penilaian/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Gagal menghapus penilaian');

        await loadPenilaian();
        updateStats();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function renderPenilaianTable() {
    const tbody = document.querySelector('#penilaianTable tbody');
    tbody.innerHTML = '';

    const role = currentUser?.role || 'hr';
    const canEdit = role === 'hr';

    penilaianList.forEach(p => {
        const karyawan = karyawanList.find(k => k.id_karyawan === p.id_karyawan);
        const kpi = kpiList.find(k => k.id_kpi === p.id_kpi);
        const row = document.createElement('tr');

        const aksiHtml = canEdit
            ? `
                <button class="btn-edit" onclick="editPenilaian(${p.id_penilaian})">Edit</button>
                <button class="btn-delete" onclick="deletePenilaian(${p.id_penilaian})">Hapus</button>
              `
            : `-`;

        row.innerHTML = `
            <td>${p.id_penilaian}</td>
            <td>${karyawan ? karyawan.nama : '-'}</td>
            <td>${kpi ? kpi.nama_kpi : '-'}</td>
            <td>${p.nilai}</td>
            <td>${p.tanggal_penilaian}</td>
            <td>${aksiHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

// ===== FORM UTILITIES =====
function cancelForm(type) {
    if (type === 'karyawan') {
        document.getElementById('karyawanForm').style.display = 'none';
    } else if (type === 'kpi') {
        document.getElementById('kpiForm').style.display = 'none';
    } else if (type === 'penilaian') {
        document.getElementById('penilaianForm').style.display = 'none';
    }
}
