import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/api';

const CATEGORIES = ['All Items', 'Momo', 'Chowmein', 'Paratha', 'Beverages', 'Snacks'];

const MENU_ITEMS = [
  {
    name: 'Buff Momo',
    category: 'Momo',
    price: 150,
    description: '10 pcs, hand-folded meat dumplings',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBCLJuBhawYvgIk-mPCy0wXvYavuTiI26NXXBEAYJWAC10rUZW-3Nco10xly-Na7NBL8UctZfBCd1Z9CELJGzEIH9-hAKLqG_G9Jv7eCLWNfSVZ_RM5USgu0SbPPlYRjruGquGDW_NeWi5v1WWOX9V2OgHi9U8kHz9J7hKyTsspoZqakbLGxRs5whisSS32vDd-IZ6rCZvTo9UUIXbFmgnB0bxiJYUxq9QGJt-F-dQjBwpcj0AZZXrXnhEmhB6iFmtmZjDrAF5PyxM',
    badges: ['Top Rated', 'Spicy'],
  },
  {
    name: 'Kothey Momo',
    category: 'Momo',
    price: 180,
    description: 'Half-fried, half-steamed signature dumplings',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBfYkCIymOyo7GMoqpiTJsq-Vggj-g6rVPp7u9T9qEeOFUThcxwApqKZEPG4-BRfagLsjUlPMf6fMA_6_qerGHzL0MpLVbJ8Y0hEkZlwmFuUamCCrOzSMe6k60su81M_NfbDrzh7SlHtKQcCvxeorEF3OAHj08qIDBGiFPyuVMhX0PqM-bBEyFZZOYtpUDWkFKrVkdD00SmNTiiSyTv7PnpIUQ-AHPoFdJyMdNO0MFK-HsPLOoVuvIkhoZmqfLPeDqN0deOTQJJJkw',
    badges: ['Must Try'],
  },
  {
    name: 'Samosa Set',
    category: 'Snacks',
    price: 90,
    description: '2 crispy samosas with tamarind chutney',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgI2AU5oojHOwI8_AXS-Kb0xmBJdgw-2fr3da-mgFrWtdzXlybuZDOOrwYPNOO9wo7Bw_6Za5yRhqPqc7LUbfVdW48UswyyGOdBgdV37c1CKKMGBkxusozBYNA2zIRqMnetdAf4xrrxZl4tTkKkbvNqvuEC5GocVIMPIwNe_jXNBlVF8Nrp4sR1A_jKfkQaOwnxruy-TPHWqHSehRdFOoOv8buY9PvoUCKAXZonhmrK9g9t9QgijZjtbTsl8j8CRpOIXkL9fuNtRo',
    badges: ['Breakfast'],
  },
  {
    name: 'Masala Milk Tea',
    category: 'Beverages',
    price: 35,
    description: 'Brewed with ginger, cardamom and fresh milk',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCV9mmXkw8HXyODOL3uJOnGbUKzaIV8bv6s1iKn2y5enHU0XrHmWNj8jPpnOJHclqzbj4Y8F2wXmYks6UC0-NYCJvFy11TSSjWOB51gvIYorotL06nhQpgFrAHkc9zhHB-l6MUWarZZFV-9i_cnH3ZtNe1ozc37s81-98E6ilJ-WmR-Oh0as3VRZ-TdY-uAkJqkQCM_4w7j5UO_G91Vg2fxnuxYybhiWF5W9TYRMfLK6hkio55lfjIz4aGw_kBsx-1N8fJl381Vs6w',
    badges: ['Hot'],
  },
  {
    name: 'Veg Chowmein',
    category: 'Chowmein',
    price: 120,
    description: 'Wok-fried noodles with seasonal greens',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB46PO0ugvYE3gemZde2dNZdeiz-PQctRNKO6d6GIPd8TkcArMBPGV_nnWvPnMAv_JZ3LvST7R8gRvfGWxHJQzTd6iI39V3x06J3eTzQjkZh4y4EbezIOf_8Vy8Q6uKiCowS9W1u-IRM2bnk_nlmoqCcwxgvGW-LVE_nFvnFXZOGFs7w-fSzgQcjTE9tL6FxVoStYYjOfhV7hVXlfYuxyrA8Vkz-s-nUyOYOntPK-h8iRHT5H2OD2iSN1EqCsbkC9VGDOQ8WXhmK2w',
    badges: ['Vegan Option'],
  },
  {
    name: 'Aloo Paratha',
    category: 'Paratha',
    price: 110,
    description: 'Stuffed potato flatbread with butter',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKwlqqSuQ8n7H6SR37HHOuOWZZTMQqyTn0SS9B_liozwT0R3DV2aIbG60eMYabL3_yNdQrjDi7_jaEtvLOC92oVEEvrNf0o7Gf9Y4hpkwqlU7zDcvLQ3Cj2sY33stzjWzApXKDSJEQmBOSnWh9nJmK3Oad0DWu3R796jmIssk7_naBjwB5AoN8VbRjMRFvKRdAVW9QigZxHZfU-6n5FLIyaI1BkUMMzgeZwYP9PPyPqLQ940ubcCR4XiIQZ6Kxjr0jw2wEj9JjKkc',
    badges: ['Restocking Soon'],
    soldOut: true,
  },
];

function badgeClass(label, soldOut) {
  if (soldOut) return 'bg-surface-container/50 text-on-surface-variant/50';
  if (label === 'Top Rated') return 'bg-green-100 text-green-700';
  if (label === 'Hot') return 'bg-blue-50 text-blue-600';
  return 'bg-surface-container text-on-surface-variant';
}

export default function Menu() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [cartCount, setCartCount] = useState(3);
  const navigate = useNavigate();

  const balance = Number(user?.balance ?? 0);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All Items') return MENU_ITEMS;
    return MENU_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

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
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const addToTray = (item) => {
    if (item.soldOut) return;
    setCartCount((prev) => prev + 1);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-lg border-r border-outline-variant/30 bg-surface-container p-md shadow-lg md:flex">
        <div className="px-md py-sm">
          <h1 className="text-2xl font-bold text-primary">CampusEats</h1>
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">Himalayan Dining</p>
        </div>

        <nav className="flex flex-col gap-sm">
          <Link className="flex items-center gap-md rounded-xl px-md py-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
          </Link>
          <Link className="flex scale-[0.98] items-center gap-md rounded-xl bg-primary-container px-md py-sm text-on-primary-container shadow-sm" to="/menu">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Menu</span>
          </Link>
          <button className="flex items-center gap-md rounded-xl px-md py-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" type="button">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
          </button>
          <button className="flex items-center gap-md rounded-xl px-md py-sm text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" type="button">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Profile</span>
          </button>
        </nav>

        <div className="mt-auto rounded-2xl bg-surface-container-low p-md">
          <p className="text-sm font-semibold text-on-surface">{user?.full_name || 'Student'}</p>
          <p className="text-xs text-on-surface-variant">Student ID: {user?.id ?? '-'}</p>
          <p className="mt-2 text-xs text-on-surface-variant">No profile uploaded</p>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-surface-bright/80 px-lg shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-md">
            <span className="text-3xl font-bold text-primary">Menu</span>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative cursor-pointer rounded-full bg-surface-container-high p-sm transition-colors duration-200 hover:bg-surface-container-highest">
              <span className="material-symbols-outlined text-primary">shopping_basket</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                {cartCount}
              </span>
            </div>
            <div className="hidden flex-col items-end md:flex">
              <span className="text-xs text-on-surface-variant">Wallet Balance</span>
              <span className="text-sm font-bold text-primary">रू {balance.toFixed(2)}</span>
            </div>
            <button className="material-symbols-outlined text-on-surface-variant md:hidden" type="button">menu</button>
          </div>
        </header>

        <div className="sticky top-20 z-30 flex items-center gap-md overflow-x-auto whitespace-nowrap bg-background/95 px-lg py-md backdrop-blur-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-md py-sm text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="px-lg pb-2xl">
          <div className="mt-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <div key={item.name} className="group overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest shadow-[0_4px_12px_rgba(133,83,0,0.04)] transition-all hover:shadow-[0_12px_24px_rgba(133,83,0,0.08)]">
                <div className={`relative h-48 overflow-hidden ${item.soldOut ? 'opacity-80 grayscale-[0.5]' : ''}`}>
                  <img alt={item.name} className={`h-full w-full object-cover transition-transform duration-500 ${item.soldOut ? '' : 'group-hover:scale-110'}`} src={item.image} />
                  {item.soldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="rounded-full bg-red-500 px-md py-xs text-xs font-bold uppercase text-white">Sold Out</span>
                    </div>
                  )}
                  <span className="absolute top-md right-md rounded-full bg-white/90 px-md py-xs font-bold text-primary shadow-sm backdrop-blur-md">
                    रू {item.price}
                  </span>
                </div>

                <div className="p-md">
                  <h3 className={`text-lg font-bold ${item.soldOut ? 'text-on-surface/60' : 'text-on-surface'}`}>{item.name}</h3>
                  <p className={`mt-xs text-xs ${item.soldOut ? 'text-on-surface-variant/60' : 'text-on-surface-variant'}`}>{item.description}</p>

                  <div className="mt-md flex flex-wrap items-center gap-sm">
                    {item.badges.map((badge) => (
                      <span key={`${item.name}-${badge}`} className={`${badgeClass(badge, item.soldOut)} rounded-full px-sm py-xs text-[10px] font-bold uppercase tracking-wider`}>
                        {badge}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={item.soldOut}
                    onClick={() => addToTray(item)}
                    className={`mt-lg flex w-full items-center justify-center gap-sm rounded-xl py-sm text-xs font-semibold uppercase tracking-wider transition-all ${
                      item.soldOut
                        ? 'cursor-not-allowed bg-surface-container-high text-on-surface-variant/40'
                        : 'bg-primary text-on-primary shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95'
                    }`}
                  >
                    {item.soldOut ? (
                      'Unavailable'
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        Add to Tray
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-outline-variant/20 bg-surface-bright/95 px-lg py-sm backdrop-blur-lg md:hidden">
        <Link className="flex flex-col items-center gap-xs text-on-surface-variant" to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </Link>
        <Link className="flex flex-col items-center gap-xs text-primary" to="/menu">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
          <span className="text-[10px] font-bold uppercase">Menu</span>
        </Link>
        <button className="flex flex-col items-center gap-xs text-on-surface-variant" type="button">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-bold uppercase">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-xs text-on-surface-variant" type="button">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </div>
    </div>
  );
}
