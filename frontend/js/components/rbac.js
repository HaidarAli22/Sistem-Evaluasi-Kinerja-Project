/**
 * RBAC — Role-Based UI Permissions
 * Mendefinisikan apa yang boleh/tidak ditampilkan per role.
 */

// Definisi permissions per role
const PERMISSIONS = {
    hr: {
        showNavKaryawan: true,
        showNavKPI: true,
        showNavPenilaian: true,
        showBtnTambahKaryawan: true,
        showBtnTambahKPI: true,
        showBtnTambahPenilaian: true,
        canEditPenilaian: true,
        canDeletePenilaian: true,
        canViewDashboard: true
    },
    kaprodi: {
        showNavKaryawan: false,
        showNavKPI: false,
        showNavPenilaian: true,
        showBtnTambahKaryawan: false,
        showBtnTambahKPI: false,
        showBtnTambahPenilaian: false,
        canEditPenilaian: false,
        canDeletePenilaian: false,
        canViewDashboard: true
    },
    dosen: {
        showNavKaryawan: false,
        showNavKPI: false,
        showNavPenilaian: true,
        showBtnTambahKaryawan: false,
        showBtnTambahKPI: false,
        showBtnTambahPenilaian: false,
        canEditPenilaian: false,
        canDeletePenilaian: false,
        canViewDashboard: true
    }
};

/**
 * Terapkan RBAC ke elemen UI berdasarkan role.
 * @param {string} role - 'hr' | 'kaprodi' | 'dosen'
 */
export function applyRoleUI(role) {
    const perms = PERMISSIONS[role] || PERMISSIONS.dosen;
    
    console.log(`[RBAC] Applying permissions for role: ${role}`, perms);

    const toggleEl = (id, visible) => {
        const el = document.getElementById(id);
        if (el) {
            if (visible) {
                el.style.display = '';
                el.classList.remove('hidden-by-rbac');
            } else {
                el.style.display = 'none';
                el.classList.add('hidden-by-rbac');
            }
            console.log(`[RBAC] Toggle ${id}: ${visible ? 'visible' : 'hidden'}`);
        } else {
            console.warn(`[RBAC] Element not found: ${id}`);
        }
    };

    // Toggle navigation links
    toggleEl('navKaryawan',        perms.showNavKaryawan);
    toggleEl('navKPI',             perms.showNavKPI);
    toggleEl('navPenilaian',       perms.showNavPenilaian);
    
    // Toggle action buttons
    toggleEl('btnTambahKaryawan',  perms.showBtnTambahKaryawan);
    toggleEl('btnTambahKPI',       perms.showBtnTambahKPI);
    toggleEl('btnTambahPenilaian', perms.showBtnTambahPenilaian);

    // Simpan permissions di dataset untuk digunakan komponen lain
    document.body.dataset.role = role;
    document.body.dataset.canEdit = perms.canEditPenilaian;
    document.body.dataset.permissions = JSON.stringify(perms);
    
    console.log(`[RBAC] Role permissions applied to body dataset`);
}

/**
 * Cek apakah role saat ini memiliki permission tertentu.
 * @param {string} perm - nama permission key
 * @returns {boolean}
 */
export function hasPermission(perm) {
    const role = document.body.dataset.role || 'dosen';
    return PERMISSIONS[role]?.[perm] === true;
}

/**
 * Ambil semua permissions untuk role saat ini.
 * @returns {object}
 */
export function getCurrentPermissions() {
    const role = document.body.dataset.role || 'dosen';
    return PERMISSIONS[role] || PERMISSIONS.dosen;
}

/**
 * Cek apakah user adalah HR.
 * @returns {boolean}
 */
export function isHR() {
    return document.body.dataset.role === 'hr';
}

/**
 * Cek apakah user adalah Kaprodi.
 * @returns {boolean}
 */
export function isKaprodi() {
    return document.body.dataset.role === 'kaprodi';
}

/**
 * Cek apakah user adalah Dosen.
 * @returns {boolean}
 */
export function isDosen() {
    return document.body.dataset.role === 'dosen';
}
