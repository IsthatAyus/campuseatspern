import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getPublicMenu } from '../lib/api';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function Menu() {
  const [user, setUser]           = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [menuError, setMenuError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [addedItems, setAddedItems] = useState({});
  const { addToCart, getCartCount } = useCart();
  const navigate = useNavigate();

  const balance   = Number(user?.balance ?? 0);
  const cartCount = getCartCount();

  // Categories derived dynamically from DB — grouped by restaurant name
  const categories = useMemo(() => {
    const unique = [...new Set(menuItems.map(i => i.restaurant_name))];
    return ['All Items', ...unique];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All Items') return menuItems;
    return menuItems.filter(i => i.restaurant_name === activeCategory);
  }, [activeCategory, menuItems]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const init = async () => {
      // Auth check
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      // Menu fetch — separate so auth errors don't swallow menu errors
      try {
        const items = await getPublicMenu();
        setMenuItems(items);
      } catch (err) {
        setMenuError('Failed to load menu. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  const addToTray = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description,
      restaurant_id: item.restaurant_id,
      restaurant_name: item.restaurant_name,
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <Navbar
      activePath="/menu"
      userRole={user?.role || 'student'}
      sidebarFooter={
        <div className="rounded-2xl bg-surface-container-low p-4">
          <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Student'}</p>
          <p className="text-xs text-on-surface-variant">Student ID: {user?.id ?? '-'}</p>
          <p className="mt-2 text-xs font-semibold text-primary">रू {balance.toFixed(2)}</p>
        </div>
      }
      desktopHeader={
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-8 shadow-sm backdrop-blur-md">
          <span className="text-3xl font-bold text-primary">Menu</span>
          <div className="flex items-center gap-4">
            <div
              onClick={() => navigate('/cart')}
              className="relative cursor-pointer rounded-full bg-surface-container-high p-2 transition-colors hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden flex-col items-end md:flex">
              <span className="text-xs text-on-surface-variant">Wallet Balance</span>
              <span className="text-sm font-bold text-primary">रू {balance.toFixed(2)}</span>
            </div>
          </div>
        </header>
      }
      mobileNav={
        <button
          onClick={() => navigate('/cart')}
          className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
        >
          <span className="material-symbols-outlined">shopping_basket</span>
        </button>
      }
      onOrders={() => navigate('/orders')}
      onProfile={() => navigate('/profile')}
    >
      {/* Category filter — dynamic from DB */}
      <div className="sticky top-20 z-30 flex items-center gap-3 overflow-x-auto whitespace-nowrap bg-background/95 px-8 py-4 backdrop-blur-sm">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
              activeCategory === cat
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">

        {/* Error state */}
        {menuError && (
          <div className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">
            {menuError}
          </div>
        )}

        {/* Empty state */}
        {!menuError && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined mb-4 text-7xl text-on-surface-variant/20">
              restaurant_menu
            </span>
            <p className="text-lg font-semibold text-on-surface-variant">No items available right now</p>
            <p className="mt-1 text-sm text-on-surface-variant/60">
              The canteen hasn't added any items yet. Check back later.
            </p>
          </div>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm transition-all hover:shadow-md"
            >
              {/* Image placeholder — no image field in DB */}
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="material-symbols-outlined text-7xl text-primary/20">restaurant</span>
                <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-primary shadow-sm backdrop-blur-md">
                  रू {parseFloat(item.price).toFixed(0)}
                </span>
              </div>

              <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-on-surface">{item.name}</h3>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {item.description || 'No description available'}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/50">
                  {item.restaurant_name}
                </p>

                <button
                  onClick={() => addToTray(item)}
                  className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    addedItems[item.id]
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-primary text-on-primary shadow-md hover:bg-primary/90 active:scale-95'
                  }`}
                >
                  {addedItems[item.id] ? (
                    <><span className="material-symbols-outlined text-[18px]">check_circle</span> Added!</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">add_shopping_cart</span> Add to Tray</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Navbar>
  );
}