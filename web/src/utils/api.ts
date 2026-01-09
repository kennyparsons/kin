import { API_BASE } from '../config';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('kin_token');
  const projectId = localStorage.getItem('kin_project_id') || '1';
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('X-Project-ID', projectId);
  
  // Default to JSON content type if body is present and not FormData
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Keep for local dev cookies
  };

  return fetch(`${API_BASE}${path}`, config);
}
