/**
 * AppState — Simple Observable State Management
 * Pattern: pub/sub (observer) dengan localStorage persistence
 */
const AppState = (() => {
    // Private state object
    const _state = {
        currentUser: null,
        token: null,
        karyawanList: [],
        kpiList: [],
        penilaianList: [],
        isLoading: false,
        dashboardFilters: {
            dateFrom: '',
            dateTo: '',
            role: 'all'
        }
    };

    // Listeners registry: { key: [callbacks...] }
    const _listeners = {};

    /**
     * Subscribe ke perubahan state key tertentu.
     * @param {string} key
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    function subscribe(key, callback) {
        if (!_listeners[key]) _listeners[key] = [];
        _listeners[key].push(callback);
        // Return unsubscribe
        return () => {
            _listeners[key] = _listeners[key].filter(cb => cb !== callback);
        };
    }

    /**
     * Update state dan notify semua subscriber.
     * @param {string} key
     * @param {*} value
     */
    function setState(key, value) {
        _state[key] = value;
        if (_listeners[key]) {
            _listeners[key].forEach(cb => cb(value));
        }
    }

    /**
     * Baca nilai state.
     * @param {string} key
     */
    function getState(key) {
        // Ensure dashboardFilters have default values if not set
        if (key === 'dashboardFilters' && !_state[key]) {
            _state[key] = { dateFrom: '', dateTo: '', role: 'all' };
        }
        return _state[key];
    }

    /** Simpan user + token ke localStorage */
    function persistAuth(user, token) {
        setState('currentUser', user);
        setState('token', token);
        try {
            localStorage.setItem('sipeka_user', JSON.stringify(user));
            localStorage.setItem('sipeka_token', token);
        } catch (e) {
            console.warn('localStorage tidak tersedia:', e);
        }
    }

    /** Muat auth dari localStorage saat app init */
    function loadAuth() {
        try {
            const savedUser = localStorage.getItem('sipeka_user');
            const savedToken = localStorage.getItem('sipeka_token');
            if (savedUser && savedToken) {
                _state.currentUser = JSON.parse(savedUser);
                _state.token = savedToken;
                return true;
            }
        } catch (e) {
            clearAuth();
        }
        return false;
    }

    /** Hapus auth dari state dan localStorage */
    function clearAuth() {
        setState('currentUser', null);
        setState('token', null);
        try {
            localStorage.removeItem('sipeka_user');
            localStorage.removeItem('sipeka_token');
        } catch (e) { /* silent */ }
    }

    return { subscribe, setState, getState, persistAuth, loadAuth, clearAuth };
})();

export default AppState;
