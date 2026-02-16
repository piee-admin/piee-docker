// lib/auth/session.ts
export function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('piee_token');
}

export function setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('piee_token', token);
}

export function clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('piee_token');
}
