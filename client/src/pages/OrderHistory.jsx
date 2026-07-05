import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, getUserOrders } from '../lib/api';
import Navbar from '../components/Navbar';

export default function OrderHistory() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);

        const ordersData = await getUserOrders(token);
        setOrders(ordersData || []);

        if (location.state?.success) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, location]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'preparing':
        return 'bg-purple-100 text-purple-700';
      case 'ready':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'schedule';
      case 'confirmed':
        return 'check_circle';
      case 'preparing':
        return 'local_fire_department';
      case 'ready':
        return 'done_all';
      case 'completed':
        return 'verified';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <Navbar
      activePath="/orders"
      userRole={user?.role || 'student'}
      sidebarFooter={
        <div className="rounded-2xl bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Student'}</p>
          <p className="text-xs text-on-surface-variant">Student ID: {user?.id ?? '-'}</p>
          <p className="mt-2 text-xs text-on-surface-variant">Total Orders: {orders.length}</p>
        </div>
      }
      desktopHeader={
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">Order History</span>
          </div>
          <div className="hidden flex-col items-end md:flex">
            <span className="text-xs text-on-surface-variant">Total Orders</span>
            <span className="text-sm font-bold text-primary">{orders.length}</span>
          </div>
        </header>
      }
      mobileNav={
        <button
          onClick={() => navigate('/menu')}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
        >
          <span className="material-symbols-outlined">receipt_long</span>
        </button>
      }
      onOrders={() => {}}
      onProfile={() => navigate('/profile')}
    >
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {showSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-sm font-semibold text-green-700">Order placed successfully! 🎉</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 py-16">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">receipt_long</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">No orders yet</h2>
            <p className="text-on-surface-variant mb-6">Start ordering your favorite meals!</p>
            <button
              onClick={() => navigate('/menu')}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:bg-primary/90 active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">
                      Order #{order.id}
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      <span className="material-symbols-outlined text-sm">{getStatusIcon(order.status)}</span>
                      {order.status}
                    </span>
                    <span className="font-bold text-primary">रू {parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-4 border-t border-outline-variant/20 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-on-surface-variant">
                    From {order.restaurant_name}
                  </h4>
                  <div className="space-y-2">
                    {order.items && order.items.length > 0 && order.items[0].name ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-on-surface">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="font-semibold text-on-surface">
                            रू {(item.unit_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-on-surface-variant">No items details available</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-outline-variant/20">
                  <button className="flex-1 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20">
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate('/menu')}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary/90"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Navbar>
  );
}
