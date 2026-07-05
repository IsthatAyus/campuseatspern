const API_BASE = '/api';

// Helper to safely parse JSON responses
const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid response: ${text}`);
  }
};

// Signup
export const signup = async (full_name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, email, password })
  });
  if (!res.ok) {
    try {
      const err = await parseResponse(res);
      throw new Error(err?.error || `Signup failed (${res.status})`);
    } catch (e) {
      throw new Error(e.message || 'Signup failed');
    }
  }
  return parseResponse(res);
};

// Login
export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    try {
      const err = await parseResponse(res);
      throw new Error(err?.error || `Login failed (${res.status})`);
    } catch (e) {
      throw new Error(e.message || 'Login failed');
    }
  }
  return parseResponse(res);
};

// Get current user
export const getCurrentUser = async (token) => {
  const res = await fetch(`${API_BASE}/user/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    try {
      const err = await parseResponse(res);
      throw new Error(err?.error || 'Failed to fetch user');
    } catch (e) {
      throw new Error(e.message || 'Failed to fetch user');
    }
  }
  return parseResponse(res);
};

// Get user orders
export const getUserOrders = async (token) => {
  const res = await fetch(`${API_BASE}/user/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch orders');
  }
  return parseResponse(res);
};

// Place order
export const placeOrder = async (token, restaurant_id, items, total_amount) => {
  const res = await fetch(`${API_BASE}/user/orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ restaurant_id, items, total_amount })
  });
  if (!res.ok) {
    try {
      const err = await parseResponse(res);
      throw new Error(err?.error || 'Failed to place order');
    } catch (e) {
      throw new Error(e.message || 'Failed to place order');
    }
  }
  return parseResponse(res);
};

// Update user profile
export const updateProfile = async (token, full_name, balance) => {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ full_name, balance })
  });
  if (!res.ok) {
    try {
      const err = await parseResponse(res);
      throw new Error(err?.error || 'Failed to update profile');
    } catch (e) {
      throw new Error(e.message || 'Failed to update profile');
    }
  }
  return parseResponse(res);
};

// ===== ADMIN ROUTES =====

export const getAdminStats = async (token) => {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return parseResponse(res);
};

export const getStudents = async (token) => {
  const res = await fetch(`${API_BASE}/admin/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return parseResponse(res);
};

export const getCanteenUsers = async (token) => {
  const res = await fetch(`${API_BASE}/admin/canteen-users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch canteen users');
  return parseResponse(res);
};

export const getMenuItems = async (token) => {
  const res = await fetch(`${API_BASE}/admin/menu-items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch menu items');
  return parseResponse(res);
};

// ===== CANTEEN ROUTES =====

export const getCanteenRestaurant = async (token) => {
  const res = await fetch(`${API_BASE}/canteen/restaurant`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch restaurant');
  return parseResponse(res);
};

export const getCanteenMenu = async (token) => {
  const res = await fetch(`${API_BASE}/canteen/menu`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch menu');
  return parseResponse(res);
};

export const addMenuItem = async (token, name, description, price) => {
  const res = await fetch(`${API_BASE}/canteen/menu`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, description, price })
  });
  if (!res.ok) {
    const err = await parseResponse(res);
    throw new Error(err?.error || 'Failed to add menu item');
  }
  return parseResponse(res);
};

export const deleteMenuItem = async (token, id) => {
  const res = await fetch(`${API_BASE}/canteen/menu/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete menu item');
  return parseResponse(res);
};

export const updateMenuAvailability = async (token, id, is_available) => {
  const res = await fetch(`${API_BASE}/canteen/menu/${id}/availability`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ is_available })
  });
  if (!res.ok) throw new Error('Failed to update menu');
  return parseResponse(res);
};

export const getCanteenOrders = async (token) => {
  const res = await fetch(`${API_BASE}/canteen/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return parseResponse(res);
};

export const updateOrderStatus = async (token, orderId, status) => {
  const res = await fetch(`${API_BASE}/canteen/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return parseResponse(res);
};

export const addStudentBalance = async (token, email, amount) => {
  const res = await fetch(`${API_BASE}/canteen/add-student-balance`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ email, amount })
  });
  if (!res.ok) {
    const err = await parseResponse(res);
    throw new Error(err?.error || 'Failed to add balance');
  }
  return parseResponse(res);
};
