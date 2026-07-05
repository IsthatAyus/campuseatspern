import { Link, useNavigate } from 'react-router-dom';

function NavItem({ to, icon, label, isActive }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
        isActive
          ? 'bg-primary-container text-on-primary-container shadow-sm'
          : 'text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high'
      }`}
    >
      <span className="material-symbols-outlined" style={label === 'Dashboard' ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        {icon}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </Link>
  );
}

function ActionButton({ to, icon, label, onClick }) {
  if (to) {
    return (
      <Link
        to={to}
        className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high"
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </button>
  );
}

export default function Navbar({
  activePath,
  sidebarFooter,
  desktopHeader,
  mobileNav,
  onOrders,
  onProfile,
  children,
  userRole = 'student'
}) {
  const getNavItems = () => {
    if (userRole === 'admin') {
      return [
        { to: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { to: null, icon: 'logout', label: 'Logout', onClick: handleLogout }
      ];
    }
    if (userRole === 'canteen') {
      return [
        { to: '/canteen', icon: 'restaurant', label: 'Manager' },
        { to: null, icon: 'logout', label: 'Logout', onClick: handleLogout }
      ];
    }
    // Student navigation
    return [
      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { to: '/menu', icon: 'restaurant_menu', label: 'Menu' },
      { to: '/cart', icon: 'shopping_basket', label: 'Cart' },
      { to: '/orders', icon: 'receipt_long', label: 'Orders' },
      { to: '/profile', icon: 'person', label: 'Profile' }
    ];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col gap-6 border-r border-outline-variant/30 bg-surface-container p-6 shadow-lg md:flex">
        <div className="flex flex-col px-1 py-1">
          <span className="text-2xl font-bold text-primary">CampusEats</span>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant">Himalayan Dining</span>
        </div>

        <nav className="flex flex-grow flex-col gap-2">
          {navItems.map((item) => (
            item.to ? (
              <NavItem
                key={item.label}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={activePath === item.to}
              />
            ) : (
              <ActionButton
                key={item.label}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
              />
            )
          ))}
        </nav>

        {sidebarFooter ? <div className="mt-auto px-1 py-1">{sidebarFooter}</div> : null}
      </aside>

      <main className="min-h-screen md:ml-64">
        {desktopHeader}
        {children}
        {typeof mobileNav === 'function' ? mobileNav() : mobileNav}
      </main>
    </div>
  );
}


