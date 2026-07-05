import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCurrentUser, placeOrder } from '../lib/api';
import Navbar from '../components/Navbar';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const total = getTotalPrice();
  const balance = Number(user?.balance ?? 0);
  const canCheckout = balance >= total && cartItems.length > 0;

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
      } catch (_) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleCheckout = async () => {
    if (!canCheckout) return;
    
    setPlacing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Group items by restaurant
      const items = cartItems.map((item) => ({
        menu_item_id: parseInt(item.menu_item_id) || 1,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      await placeOrder(token, 1, items, total);
      
      clearCart();
      navigate('/orders', { state: { success: true } });
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <Navbar
      activePath="/cart"
      userRole={user?.role || 'student'}
      sidebarFooter={
        <div className="rounded-2xl bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Student'}</p>
          <p className="text-xs text-on-surface-variant">Student ID: {user?.id ?? '-'}</p>
          <p className="mt-2 text-xs text-on-surface-variant">Balance: रू {balance.toFixed(2)}</p>
        </div>
      }
      desktopHeader={
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">Shopping Cart</span>
          </div>
          <div className="hidden flex-col items-end md:flex">
            <span className="text-xs text-on-surface-variant">Total Items</span>
            <span className="text-sm font-bold text-primary">{cartItems.length}</span>
          </div>
        </header>
      }
      mobileNav={
        <button
          onClick={() => navigate('/menu')}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
        >
          <span className="material-symbols-outlined">shopping_bag</span>
        </button>
      }
      onOrders={() => navigate('/orders')}
      onProfile={() => navigate('/profile')}
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-lg border border-error bg-error-container/10 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 py-16">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">shopping_cart</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Your cart is empty</h2>
            <p className="text-on-surface-variant mb-6">Start adding delicious items from the menu!</p>
            <button
              onClick={() => navigate('/menu')}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-all hover:bg-primary/90 active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="flex gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-bold text-on-surface">{item.name}</h3>
                    <p className="text-xs text-on-surface-variant">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-primary">रू {item.price}</span>
                      <div className="flex items-center gap-2 rounded-lg bg-surface-container-high p-1">
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-md h-fit sticky top-32">
              <h3 className="mb-4 text-lg font-bold text-on-surface">Order Summary</h3>

              <div className="mb-4 space-y-2 border-b border-outline-variant/20 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold text-on-surface">रू {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Delivery</span>
                  <span className="font-semibold text-on-surface">Free</span>
                </div>
              </div>

              <div className="mb-6 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">रू {total.toFixed(2)}</span>
              </div>

              <div className="mb-4 rounded-lg bg-primary/10 p-3">
                <p className="text-xs text-on-surface-variant mb-1">Available Balance</p>
                <p className="text-lg font-bold text-primary">रू {balance.toFixed(2)}</p>
              </div>

              {balance < total && (
                <div className="mb-4 rounded-lg border border-error/20 bg-error/10 p-3">
                  <p className="text-xs text-error">
                    Insufficient balance. Need रू {(total - balance).toFixed(2)} more
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={!canCheckout || placing}
                className={`w-full rounded-xl py-3 font-bold uppercase tracking-wider transition-all ${
                  canCheckout && !placing
                    ? 'bg-primary text-on-primary shadow-md hover:bg-primary/90 active:scale-95'
                    : 'cursor-not-allowed bg-surface-container text-on-surface-variant/40'
                }`}
              >
                {placing ? 'Placing Order...' : 'Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
}
