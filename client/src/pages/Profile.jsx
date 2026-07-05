import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../lib/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', balance: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
        setFormData({
          full_name: userData.full_name || '',
          balance: userData.balance || 0,
        });
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const updated = await updateProfile(token, formData.full_name, formData.balance);
      setUser(updated);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const displayUser = user || {};

  return (
    <Navbar
      activePath="/profile"
      userRole={user?.role || 'student'}
      sidebarFooter={
        <div className="rounded-2xl bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-on-surface">{displayUser.full_name || 'Student'}</p>
          <p className="text-xs text-on-surface-variant">Student ID: {displayUser.id ?? '-'}</p>
          <p className="mt-2 text-xs text-on-surface-variant">Member since</p>
          <p className="text-xs font-semibold text-on-surface">
            {displayUser.created_at
              ? new Date(displayUser.created_at).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      }
      desktopHeader={
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">My Profile</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-error/10 px-4 py-2 text-sm font-bold text-error transition-colors hover:bg-error/20"
          >
            Logout
          </button>
        </header>
      }
      mobileNav={
        <button
          onClick={() => navigate('/menu')}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
        >
          <span className="material-symbols-outlined">person</span>
        </button>
      }
      onOrders={() => navigate('/orders')}
      onProfile={() => {}}
    >
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {message.text && (
          <div
            className={`rounded-lg p-4 flex items-center gap-3 ${
              message.type === 'success'
                ? 'border border-green-200 bg-green-50'
                : 'border border-error/20 bg-error/10'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                message.type === 'success' ? 'text-green-600' : 'text-error'
              }`}
            >
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <p
              className={`text-sm font-semibold ${
                message.type === 'success' ? 'text-green-700' : 'text-error'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <span className="material-symbols-outlined text-4xl text-primary">account_circle</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{displayUser.full_name || 'Student'}</h2>
                <p className="text-sm text-on-surface-variant">{displayUser.email}</p>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">
                  {displayUser.role || 'User'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (editing) {
                  setFormData({
                    full_name: displayUser.full_name || '',
                    balance: displayUser.balance || 0,
                  });
                  setMessage({ type: '', text: '' });
                }
                setEditing(!editing);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                editing
                  ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }`}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/20 pt-6">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary">रू {parseFloat(displayUser.balance || 0).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-on-surface">{displayUser.order_count || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant mb-1">Member Since</p>
              <p className="text-sm font-bold text-on-surface">
                {displayUser.created_at
                  ? new Date(displayUser.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      year: '2-digit',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-md">
            <h3 className="mb-6 text-lg font-bold text-on-surface">Edit Profile</h3>

            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Enter your name"
                />
              </div>

              {/* Wallet Balance */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">
                  Wallet Balance (रू)
                </label>
                <input
                  type="number"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Enter balance"
                />
                <p className="text-xs text-on-surface-variant">Current balance: रू {parseFloat(displayUser.balance || 0).toFixed(2)}</p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-primary px-4 py-3 font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Activity */}
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined">history</span>
            Activity
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-surface-container-high p-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Total Orders</p>
                <p className="text-xs text-on-surface-variant">
                  {displayUser.order_count || 0} orders placed
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">{displayUser.order_count || 0}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-surface-container-high p-4">
              <div>
                <p className="text-sm font-semibold text-on-surface">Account Created</p>
                <p className="text-xs text-on-surface-variant">
                  {displayUser.created_at
                    ? new Date(displayUser.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary">calendar_today</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/orders')}
            className="mt-4 w-full rounded-lg border border-primary bg-primary/10 px-4 py-3 font-bold text-primary transition-colors hover:bg-primary/20"
          >
            View All Orders
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-error/20 bg-error/5 p-8 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-error flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Danger Zone
          </h3>

          <p className="mb-4 text-sm text-on-surface-variant">
            Once you logout, you'll need to sign in again to access your account.
          </p>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-error px-4 py-3 font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-error/90 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </Navbar>
  );
}
