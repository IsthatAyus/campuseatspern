import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getCanteenRestaurant,
  getCanteenMenu,
  getCanteenOrders,
  addMenuItem,
  deleteMenuItem,
  updateMenuAvailability,
  updateOrderStatus,
  addStudentBalance
} from '../lib/api';
import Navbar from '../components/Navbar';

export default function CanteenDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [studentEmail, setStudentEmail] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userData = await getCurrentUser(token);
        if (userData.role !== 'canteen') {
          navigate('/dashboard');
          return;
        }
        setUser(userData);

        const restaurantData = await getCanteenRestaurant(token);
        setRestaurant(restaurantData);

        const menuData = await getCanteenMenu(token);
        setMenu(menuData);

        const ordersData = await getCanteenOrders(token);
        setOrders(ordersData);
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newItem.name || !newItem.price) {
      setError('Name and price are required');
      return;
    }

    try {
      const item = await addMenuItem(token, newItem.name, newItem.description, parseFloat(newItem.price));
      setMenu([...menu, item]);
      setNewItem({ name: '', description: '', price: '' });
      setSuccess('Menu item added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(token, id);
        setMenu(menu.filter((item) => item.id !== id));
        setSuccess('Menu item deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      const updated = await updateMenuAvailability(token, id, !current);
      setMenu(menu.map((item) => (item.id === id ? updated : item)));
      setSuccess(`Item marked as ${!current ? 'available' : 'sold out'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(token, orderId, newStatus);
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setSuccess(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddStudentBalance = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!studentEmail || !balanceAmount) {
      setError('Email and amount are required');
      return;
    }

    try {
      const result = await addStudentBalance(token, studentEmail, parseFloat(balanceAmount));
      setSuccess(`Added रू ${balanceAmount} to ${result.full_name}'s account`);
      setStudentEmail('');
      setBalanceAmount('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <Navbar
      activePath="/canteen"
      userRole={user?.role || 'canteen'}
      sidebarFooter={
        <div className="rounded-2xl bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Canteen'}</p>
          <p className="text-xs text-on-surface-variant">{restaurant?.name || 'Canteen Staff'}</p>
          <p className="mt-2 text-xs text-on-surface-variant">{restaurant?.location || 'Location'}</p>
        </div>
      }
      desktopHeader={
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">Canteen Manager</span>
          </div>
        </header>
      }
      mobileNav={null}
      onOrders={() => {}}
      onProfile={() => {}}
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="sticky top-20 z-30 flex gap-2 overflow-x-auto bg-background/95 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('menu')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'balance'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Add Balance
          </button>
        </div>

        {/* Menu Management */}
        {activeTab === 'menu' && (
          <section className="space-y-8">
            {/* Add New Item Form */}
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="text-xl font-bold text-on-surface mb-6">Add New Menu Item</h2>
              <form onSubmit={handleAddMenuItem} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant">Item Name *</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Buff Momo"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant">Price (रू) *</label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="150"
                      step="0.01"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-on-surface-variant">Description</label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Item description"
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-6 py-2 font-semibold text-on-primary hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined mr-2 inline">add</span>
                  Add Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-on-surface">Current Menu</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {menu.map((item) => (
                  <div key={item.id} className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-on-surface">{item.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">{item.description}</p>
                    <p className="text-lg font-bold text-primary mb-4">रू {parseFloat(item.price).toFixed(2)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleAvailability(item.id, item.is_available)}
                        className="flex-1 rounded-lg bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="material-symbols-outlined inline mr-1 text-sm">
                          {item.is_available ? 'visibility_off' : 'visibility'}
                        </span>
                        {item.is_available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <span className="material-symbols-outlined inline text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">Order Management</h2>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-8 text-center">
                  <p className="text-on-surface-variant">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-on-surface">{order.full_name}</h3>
                        <p className="text-xs text-on-surface-variant">{order.email}</p>
                        <p className="text-xs text-on-surface-variant mt-1">Order ID: #{order.id}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4 bg-surface-container-high rounded-lg p-3">
                      <p className="text-xs font-semibold text-on-surface-variant mb-2">Items:</p>
                      <ul className="space-y-1">
                        {order.items && order.items.map((item, idx) => (
                          item && (
                            <li key={idx} className="text-sm text-on-surface">
                              {item.item} x{item.quantity} - रू {parseFloat(item.price).toFixed(2)}
                            </li>
                          )
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <p className="font-bold text-on-surface">Total: रू {parseFloat(order.total_amount).toFixed(2)}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {['confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateOrderStatus(order.id, status)}
                          disabled={order.status === status}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                            order.status === status
                              ? 'bg-primary text-on-primary cursor-default'
                              : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Add Balance */}
        {activeTab === 'balance' && (
          <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm max-w-md">
            <h2 className="text-xl font-bold text-on-surface mb-6">Add Balance to Student</h2>
            <form onSubmit={handleAddStudentBalance} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Student Email *</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface-variant">Amount (रू) *</label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="500"
                  step="0.01"
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-6 py-2 font-semibold text-on-primary hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined mr-2 inline">add_circle</span>
                Add Balance
              </button>
            </form>
          </section>
        )}
      </div>
    </Navbar>
  );
}
