// Production API lives on its own origin (e.g. https://api.rangvanat.com).
// VITE_API_URL is baked in at build time; leaving it empty keeps requests
// relative so the Vite dev proxy (@see vite.config.js) handles /api locally.
// `import.meta.env` only exists under Vite; node-based tests import this module
// too, so guard the access instead of assuming it is defined.
const configured = (import.meta.env && import.meta.env.VITE_API_URL) || '';

export const API_BASE = configured.replace(/\/+$/, '');

export const apiUrl = (path) => `${API_BASE}/api${path}`;
