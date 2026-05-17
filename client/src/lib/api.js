const API_BASE = '/api';

// Signup
export const signup = async (full_name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Signup failed');
  }
  return res.json();
};

// Login
export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
};

// Get current user
export const getCurrentUser = async (token) => {
  const res = await fetch(`${API_BASE}/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch user');
  }
  return res.json();
};
