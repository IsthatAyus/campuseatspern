import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats, getStudents, getCanteenUsers, getMenuItems, getCurrentUser,
  updateStudent, deleteStudent,
  addCanteenUser, updateCanteenUser, deleteCanteenUser
} from '../lib/api';
import Navbar from '../components/Navbar';

// ── Reusable Modal ──────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface-container p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <Modal title="Confirm Delete" onClose={onClose}>
      <p className="mb-6 text-sm text-on-surface-variant">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-highest">Cancel</button>
        <button onClick={onConfirm} className="rounded-xl bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90">Delete</button>
      </div>
    </Modal>
  );
}

// ── Field Input ─────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [stats, setStats]             = useState(null);
  const [activeTab, setActiveTab]     = useState('overview');
  const [students, setStudents]       = useState([]);
  const [canteenUsers, setCanteenUsers] = useState([]);
  const [menuItems, setMenuItems]     = useState([]);
  const [tabError, setTabError]       = useState('');

  // Modal state
  const [modal, setModal] = useState(null); // { type, data }
  const [form, setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const navigate = useNavigate();

  // Auth + stats — once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const init = async () => {
      try {
        const userData = await getCurrentUser(token);
        if (userData.role !== 'admin') { navigate('/dashboard'); return; }
        setUser(userData);
        setStats(await getAdminStats(token));
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  // Tab data — never logs out
  useEffect(() => {
    if (activeTab === 'overview') return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setTabError('');

    const fetch = async () => {
      try {
        if (activeTab === 'students')      setStudents(await getStudents(token));
        else if (activeTab === 'canteen')  setCanteenUsers(await getCanteenUsers(token));
        else if (activeTab === 'menu')     setMenuItems(await getMenuItems(token));
      } catch (err) {
        setTabError(`Failed to load ${activeTab} data: ${err.message}`);
      }
    };
    fetch();
  }, [activeTab]);

  const token = localStorage.getItem('token');

  const openModal = (type, data = {}) => {
    setForm({ ...data });
    setModalError('');
    setModal({ type, data });
  };
  const closeModal = () => { setModal(null); setForm({}); setModalError(''); };

  // ── Save handlers ──────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setModalError('');
    try {
      if (modal.type === 'edit-student') {
        const updated = await updateStudent(token, modal.data.id, {
          full_name: form.full_name,
          balance: parseFloat(form.balance)
        });
        setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
      }

      if (modal.type === 'add-canteen') {
        const created = await addCanteenUser(token, {
          full_name: form.full_name,
          email: form.email,
          password: form.password
        });
        setCanteenUsers(prev => [created, ...prev]);
        // Refresh stats
        setStats(await getAdminStats(token));
      }

      if (modal.type === 'edit-canteen') {
        const updated = await updateCanteenUser(token, modal.data.id, {
          full_name: form.full_name,
          email: form.email
        });
        setCanteenUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      }

      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      if (modal.type === 'delete-student') {
        await deleteStudent(token, modal.data.id);
        setStudents(prev => prev.filter(s => s.id !== modal.data.id));
        setStats(await getAdminStats(token));
      }
      if (modal.type === 'delete-canteen') {
        await deleteCanteenUser(token, modal.data.id);
        setCanteenUsers(prev => prev.filter(u => u.id !== modal.data.id));
        setStats(await getAdminStats(token));
      }
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <>
      {/* ── Modals ── */}
      {modal?.type === 'edit-student' && (
        <Modal title="Edit Student" onClose={closeModal}>
          <div className="space-y-3">
            <Field label="Full Name" value={form.full_name ?? ''} onChange={v => setForm(f => ({ ...f, full_name: v }))} />
            <Field label="Balance (रू)" type="number" value={form.balance ?? ''} onChange={v => setForm(f => ({ ...f, balance: v }))} />
            {modalError && <p className="text-xs text-error">{modalError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'delete-student' && (
        <ConfirmModal
          message={`Delete student "${modal.data.full_name}"? This will also delete all their orders.`}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'add-canteen' && (
        <Modal title="Add Canteen User" onClose={closeModal}>
          <div className="space-y-3">
            <Field label="Full Name" value={form.full_name ?? ''} onChange={v => setForm(f => ({ ...f, full_name: v }))} />
            <Field label="Email" type="email" value={form.email ?? ''} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Field label="Password" type="password" value={form.password ?? ''} onChange={v => setForm(f => ({ ...f, password: v }))} />
            {modalError && <p className="text-xs text-error">{modalError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">
                {saving ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'edit-canteen' && (
        <Modal title="Edit Canteen User" onClose={closeModal}>
          <div className="space-y-3">
            <Field label="Full Name" value={form.full_name ?? ''} onChange={v => setForm(f => ({ ...f, full_name: v }))} />
            <Field label="Email" type="email" value={form.email ?? ''} onChange={v => setForm(f => ({ ...f, email: v }))} />
            {modalError && <p className="text-xs text-error">{modalError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={closeModal} className="rounded-xl bg-surface-container-high px-4 py-2 text-sm font-semibold text-on-surface-variant">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === 'delete-canteen' && (
        <ConfirmModal
          message={`Delete canteen user "${modal.data.full_name}"?`}
          onConfirm={handleDelete}
          onClose={closeModal}
        />
      )}

      <Navbar
        activePath="/admin"
        userRole={user?.role || 'admin'}
        sidebarFooter={
          <div className="rounded-2xl bg-surface-container-low p-4">
            <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Admin'}</p>
            <p className="text-xs text-on-surface-variant">Admin Role</p>
            <p className="mt-2 text-xs text-on-surface-variant">ID: {user?.id ?? '-'}</p>
          </div>
        }
        desktopHeader={
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
            <span className="text-3xl font-bold text-primary">Admin Dashboard</span>
          </header>
        }
        mobileNav={null}
        onOrders={() => {}}
        onProfile={() => {}}
      >
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">

          {/* Stats */}
          {activeTab === 'overview' && stats && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Students', value: stats.totalStudents, icon: 'group' },
                { label: 'Canteen Users', value: stats.totalCanteenUsers, icon: 'restaurant' },
                { label: 'Total Orders', value: stats.totalOrders, icon: 'shopping_bag' },
                { label: 'Total Revenue', value: `रू ${stats.totalRevenue.toFixed(2)}`, icon: 'trending_up' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-on-surface-variant">{label}</p>
                      <h3 className="mt-2 text-3xl font-bold text-primary">{value}</h3>
                    </div>
                    <span className="material-symbols-outlined text-5xl text-primary/20">{icon}</span>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Tab Nav */}
          <div className="sticky top-20 z-30 flex gap-2 overflow-x-auto bg-background/95 backdrop-blur-sm">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'students', label: 'Students' },
              { id: 'canteen', label: 'Canteen Users' },
              { id: 'menu', label: 'Menu Items' },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
                }`}
              >{label}</button>
            ))}
          </div>

          {tabError && (
            <div className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{tabError}</div>
          )}

          {/* Students Table */}
          {activeTab === 'students' && (
            <section className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container-high">
                    <tr>
                      {['Name', 'Email', 'Balance', 'Orders', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {students.map(s => (
                      <tr key={s.id} className="transition-colors hover:bg-surface-container-high">
                        <td className="px-6 py-4 text-sm font-medium text-on-surface">{s.full_name}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{s.email}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">रू {parseFloat(s.balance).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-on-surface">{s.order_count}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal('edit-student', s)}
                              className="rounded-lg bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container hover:opacity-80">
                              Edit
                            </button>
                            <button onClick={() => openModal('delete-student', s)}
                              className="rounded-lg bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container hover:opacity-80">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Canteen Users Table */}
          {activeTab === 'canteen' && (
            <section className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-sm font-semibold text-on-surface">Canteen Users</h2>
                <button onClick={() => openModal('add-canteen')}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:opacity-90">
                  <span className="material-symbols-outlined text-sm">add</span> Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container-high">
                    <tr>
                      {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {canteenUsers.map(u => (
                      <tr key={u.id} className="transition-colors hover:bg-surface-container-high">
                        <td className="px-6 py-4 text-sm font-medium text-on-surface">{u.full_name}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">{u.role}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal('edit-canteen', u)}
                              className="rounded-lg bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container hover:opacity-80">
                              Edit
                            </button>
                            <button onClick={() => openModal('delete-canteen', u)}
                              className="rounded-lg bg-error-container px-3 py-1 text-xs font-semibold text-on-error-container hover:opacity-80">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Menu Items Table (read-only) */}
          {activeTab === 'menu' && (
            <section className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container-high">
                    <tr>
                      {['Item', 'Restaurant', 'Price', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {menuItems.map(item => (
                      <tr key={item.id} className="transition-colors hover:bg-surface-container-high">
                        <td className="px-6 py-4 text-sm font-medium text-on-surface">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{item.restaurant_name}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-primary">रू {parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </Navbar>
    </>
  );
}