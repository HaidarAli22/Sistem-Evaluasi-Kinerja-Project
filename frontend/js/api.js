import AppState from './state.js';
import { showPage } from './router.js';

const API_BASE = '/api';

/**
 * Core fetch wrapper — auto-inject JWT, handle 401 global.
 * @param {string} endpoint
 * @param {RequestInit} options
 */
async function apiFetch(endpoint, options = {}) {
    const token = AppState.getState('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    // Token expired / invalid — force logout
    if (response.status === 401) {
        AppState.clearAuth();
        showPage('login');
        throw new Error('Sesi berakhir. Silahkan login kembali.');
    }

    const data = await response.json();

    if (!response.ok) {
        // Format error message dari server
        const message = data.details
            ? data.details.join(', ')
            : (data.error || `HTTP Error ${response.status}`);
        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    return data;
}

/** GET request */
export function apiGet(endpoint, queryParams = {}) {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(queryParams).filter(([, v]) => v !== '' && v != null))
    ).toString();
    const url = qs ? `${endpoint}?${qs}` : endpoint;
    return apiFetch(url, { method: 'GET' });
}

/** POST request */
export function apiPost(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/** PUT request */
export function apiPut(endpoint, body) {
    return apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

/** DELETE request */
export function apiDelete(endpoint) {
    return apiFetch(endpoint, { method: 'DELETE' });
}
