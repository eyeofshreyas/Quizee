// ponytail: hardcoded local API origin, swap for a build-time env var if this ever ships beyond local dev
const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'quizee_token';
const USER_KEY = 'quizee_user';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

function sanitizeUser(user) {
    // ponytail: authService's register/login responses currently include passwordHash;
    // strip it here so a bcrypt hash never lands in localStorage.
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}

function saveSession(user, token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(sanitizeUser(user)));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// ponytail: every protected page lives at client/pages/<name>/, so the login
// page is always one directory up + login/login.html — good enough until
// pages nest deeper than one level.
const LOGIN_PATH = '../login/login.html';

function requireAuth() {
    if (!getToken()) {
        window.location.href = LOGIN_PATH;
    }
}

function wireLogout(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.addEventListener('click', () => clearSession());
    }
}

const CERT_META = {
    CLF: { level: 'Foundational', icon: 'cloud_done' },
    SAA: { level: 'Associate', icon: 'architecture' },
    DVA: { level: 'Associate', icon: 'terminal' },
    SOA: { level: 'Associate', icon: 'settings_input_component' },
    ANS: { level: 'Specialty', icon: 'lan' }
};
const DEFAULT_CERT_META = { level: 'Certification', icon: 'school' };

function metaForCode(code) {
    const prefix = (code || '').split('-')[0];
    return CERT_META[prefix] || DEFAULT_CERT_META;
}

function parseApiPayload(ok, payload) {
    if (!ok || payload.success === false) {
        throw new Error(payload.message || 'Request failed');
    }
    return payload.data;
}

async function apiRequest(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });
    const payload = await res.json().catch(() => ({}));
    return parseApiPayload(res.ok, payload);
}

if (typeof module !== 'undefined' && require.main === module) {
    const assert = require('assert');
    assert.deepStrictEqual(parseApiPayload(true, { success: true, data: { id: 1 } }), { id: 1 });
    assert.throws(() => parseApiPayload(false, { message: 'bad request' }), /bad request/);
    assert.throws(() => parseApiPayload(true, { success: false, message: 'nope' }), /nope/);
    assert.deepStrictEqual(sanitizeUser({ _id: '1', email: 'a@b.com', passwordHash: 'hash' }), { _id: '1', email: 'a@b.com' });
    assert.deepStrictEqual(metaForCode('CLF-C02'), { level: 'Foundational', icon: 'cloud_done' });
    assert.deepStrictEqual(metaForCode('ANS-C01'), { level: 'Specialty', icon: 'lan' });
    assert.deepStrictEqual(metaForCode('ZZZ-C99'), DEFAULT_CERT_META);
    assert.deepStrictEqual(metaForCode(undefined), DEFAULT_CERT_META);
    console.log('api.js self-check passed');
}
