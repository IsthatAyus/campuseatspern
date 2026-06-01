import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const balance = Number(user?.balance ?? 0);
  const canReorder = Number(user?.order_count ?? 0) > 0;

  const weeklySpending = [
    { day: 'Mon', value: 'रू240', height: '40%' },
    { day: 'Tue', value: 'रू420', height: '65%' },
    { day: 'Wed', value: 'रू610', height: '85%', active: true },
    { day: 'Thu', value: 'रू180', height: '30%' },
    { day: 'Fri', value: 'रू310', height: '50%' },
    { day: 'Sat', value: 'रू120', height: '20%' },
    { day: 'Sun', value: 'रू60', height: '10%' },
  ];

  const favoriteItems = [
    {
      name: 'Veg Chowmein',
      price: 'रू 185',
      note: 'Ordered 4 days ago',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDMMN9SMbbA1nB239zq5wUaojLvIKT2N4AD_cwHgDGSiGan7NirWmIQxaBav9GjoZ0qhg3iW29NAqBCStT-CzJP1CAAF5cYQDlK04sIzp0ZPVfU9bVnv8JABeX1mjYmRbee7FakZgw0iEwpKMD9uh5b7SRy0SgOxyZAh0OqDpELX29sTb4m10YI64cao2vx-qKk8i6WSre1QTHTKjN9cSQa9CnvwrkfpTddVrDaq1oJjvZzIBC28zlinri2g_TWVpjIWXgUoYWRzbU',
    },
    {
      name: 'Masala Chai',
      price: 'रू 45',
      note: 'Ordered yesterday',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC1vkg3M3kG_RBmF20OIY6jUv-6zQ7dU4L0uduiPh7HsYT6j5-AAXJg7JgOhraZ-5zNqqPkFnBxRVFr8fNJJ8eAVK1LIqOifw0xmOD3HUBmROvVOr5994CadOU9Pb68aOz0RyIhjd0mnuSjIuQd8FH1syr2uMQq0DTzojWENyftZbGSeE2XGdgqLc9_fEtDwCTacXU0bchlp1zL8mWLOoXewpLFJ6pm5qAh9wByN6rehdKLs0vmE2c0lpXuTP4Tt58tqp3fTZLE8BE',
    },
  ];

  const recommendedItems = [
    {
      name: 'Steam Chicken Momos',
      price: 'रू 210',
      rating: '4.8',
      tag: 'Most Popular',
      tagClass: 'bg-secondary-container text-on-secondary-container',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDCs0rNiOuYsL_lRSNmaMeA0EIACu-uMp30x7vcAkpe47DevLJTz-tlQv2QXDTz_KKHGOIBHaotG2tNUOTV2hku4ppKtZVB9PkjbsoO8c7BSRzHo_PMsosBVLo3_MkgnLpDOEfJasI5sVaZZq1eF2rzD038lKKpDFMGH_3hPqwyyNZBUly4UqGmFasL6_64_RfMpRXt51IXW4clAtwYCVTScPwm0-WbRyAZ4TY9Zxii7Mo7Vj2FEndinDrbzH9cTpJ5kJ0joZG0Wpk',
      subtitle: 'With spicy tomato chutney',
    },
    {
      name: 'Thakali Thali Set',
      price: 'रू 450',
      rating: '4.9',
      tag: 'Healthy Choice',
      tagClass: 'bg-tertiary-container text-on-tertiary-container',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBIkBFZKCyqStNukZvwb4CFRYJnPRkSs7pejC_EhoPhqCqeqlfsho0lsGbTfTp12GJ4KqbSW48anhosvaDWa3OnERhtuXmdR2B8MdGD5FYbE_N0AXDJQc6YaqawLBQK4EV5hkJ2jDSa51Qs6Swo4-5SKdkJBGsxn7GYTmPog16VfSvUH2W6OTe3CuE26r58IJrm7ntrFVgxH_MxfOj3lhvCunMkhyM0oVoBTTQnsMBut8Kdak0ffZNM63M1cruluc_Elz4sgWFTpsY',
      subtitle: 'Authentic mountain flavors',
    },
    {
      name: 'Fresh Mango Lassi',
      price: 'रू 120',
      rating: '4.7',
      tag: 'Refreshing',
      tagClass: 'bg-secondary-container text-on-secondary-container',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ4yMwzjijn5zIYjdHFyg3AcRbupFvtr9TMl2AImwYH9Zi8W-13e6_AZbxtkEDBRnaiRtIhoJf-12nyMeU5eyA3lP8V56nq0bMNmCjzDOaIo9Jd6xwfwXAKKEHzDXnkHVZgPtIwIfW_6QSeHEr3SwX7J9MqXoI6MLqvqnEspYRO2KFcP-6j5kYSjdRo75RAi1_ZTUKTW0cAidYc-ty2t4O9bQImZdJ1ydTg5i4BZYSkdADls0lfYkWPImoAyzMeagWE1FS2FGIfso',
      subtitle: 'Seasonal Alphonso mangoes',
    },
    {
      name: 'Crispy Samosa Chat',
      price: 'रू 95',
      rating: '4.6',
      tag: 'Spicy',
      tagClass: 'bg-secondary-container text-on-secondary-container',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCtwt5ZvZDfHfWoUMsV0mEepo-m0jfJf9l0hk7ncITOgeiEtA77vLIvqT2V3A0mPXX5sUCKgZv9gZAXkMYweGVEbNdRjy1MrKHmhgWSpOWILVcjUTx7NGNZejC5Z5_-tRcAydP2LRkhfZDhhb9KGYGoRL7qI7emNByIXnI3w7hq80DjNeyxzAU4gsjbznMTYIoxPnzNEhhLp6nrTy_QBFTk6cMqsQV8Wg6fuK0tb9q3S8Ddc7OI_BJs5mCfh4YcJB_EsRM1458psig',
      subtitle: 'Tangy street food favorite',
    },
  ];

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-6 border-r border-outline-variant/30 bg-surface-container p-6 shadow-lg md:flex">
        <div className="flex flex-col px-1 py-1">
          <span className="text-2xl font-bold text-primary">CampusEats</span>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant">Himalayan Dining</span>
        </div>

        <nav className="flex flex-grow flex-col gap-2">
          <Link
            className="flex items-center gap-4 rounded-xl bg-primary-container px-4 py-3 text-on-primary-container shadow-sm transition-transform duration-150 active:scale-95"
            to="/dashboard"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
          </Link>
          <Link className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" to="/menu">
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Menu</span>
          </Link>
          <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" href="#">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
          </a>
          <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high" href="#">
            <span className="material-symbols-outlined">person</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Profile</span>
          </a>
        </nav>

        <div className="mt-auto px-1 py-1">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Credit Balance</span>
              <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
            </div>
            <div className="text-2xl font-bold text-primary">रू {balance.toFixed(2)}</div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-surface-bright/80 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex w-full max-w-xl items-center gap-4">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="h-10 w-full rounded-full border-none bg-surface-container-high pl-11 pr-4 text-base focus:ring-2 focus:ring-primary/20"
                placeholder="Search for momos, thali, or beverages..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="space-y-2">
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Namaste, {user?.full_name || 'Student'}</h1>
              <p className="text-lg text-on-surface-variant">Ready for your favorite Himalayan flavors today?</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="relative flex h-[240px] flex-col justify-between overflow-hidden rounded-2xl bg-primary p-6 text-on-primary shadow-lg lg:col-span-4">
              <div className="z-10">
                <p className="text-xs uppercase tracking-widest opacity-90">Campus Credit Balance</p>
                <h2 className="mt-2 text-5xl font-bold">रू {balance.toFixed(2)}</h2>
              </div>
              <div className="z-10 flex gap-2">
                <button className="rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-white/30">
                  Top Up
                </button>
                <button className="rounded-xl bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-white/30">
                  History
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 rotate-12 opacity-20">
                <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  payments
                </span>
              </div>
            </div>

            <div className="flex h-[240px] flex-col rounded-2xl border border-outline-variant/10 bg-white p-6 shadow-md lg:col-span-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Weekly Spending</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs text-on-surface-variant">Food &amp; Beverage</span>
                </div>
              </div>

              <div className="flex flex-grow items-end justify-between gap-4 px-1">
                {weeklySpending.map((entry) => (
                  <div key={entry.day} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className={`group relative w-full rounded-t-lg ${entry.active ? 'bg-primary' : 'bg-surface-container hover:bg-primary/20'} transition-colors`}
                      style={{ height: entry.height }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-inverse-surface px-2 py-1 text-xs text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100">
                        {entry.value}
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant">{entry.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {canReorder ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">Quick Re-order</h3>
                <a className="text-sm font-semibold text-primary hover:underline" href="#">
                  View All Favorites
                </a>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex cursor-pointer items-center gap-4 rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-surface-variant">
                      <img alt={item.name} className="h-full w-full object-cover" src={item.image} />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant">{item.note}</p>
                      <div className="mt-1 text-sm font-semibold text-primary">{item.price}</div>
                    </div>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-all hover:opacity-80 active:scale-95">
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-outline-variant bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="text-xl font-semibold text-on-surface">Re-order unlocks after your first order</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Once you place an order, your recent favorites will appear here for quick re-order.
              </p>
            </section>
          )}

          <section className="space-y-4 pb-16">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold">Recommended for You</h3>
              <div className="flex gap-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedItems.map((item) => (
                <div
                  key={item.name}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-outline-variant/10 bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="relative h-48">
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={item.image}
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
                      {item.price}
                    </div>
                  </div>

                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-lg font-bold">{item.name}</h4>
                      <div className="flex items-center text-primary">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="ml-1 text-xs">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
                    <div className="pt-1">
                      <span className={`rounded-full px-2 py-1 text-xs ${item.tagClass}`}>{item.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <button className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden">
        <span className="material-symbols-outlined">restaurant</span>
      </button>
    </div>
  );
}
