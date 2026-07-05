import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getStudents, getCanteenUsers, getMenuItems, getCurrentUser } from '../lib/api';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [canteenUsers, setCanteenUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userData = await getCurrentUser(token);
        if (userData.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setUser(userData);
        
        const statsData = await getAdminStats(token);
        setStats(statsData);

        if (activeTab === 'students') {
          const studentsData = await getStudents(token);
          setStudents(studentsData);
        } else if (activeTab === 'canteen') {
          const canteenData = await getCanteenUsers(token);
          setCanteenUsers(canteenData);
        } else if (activeTab === 'menu') {
          const menuData = await getMenuItems(token);
          setMenuItems(menuData);
        }
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, activeTab]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
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
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-primary">Admin Dashboard</span>
          </div>
        </header>
      }
      mobileNav={null}
      onOrders={() => {}}
      onProfile={() => {}}
    >
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        {activeTab === 'overview' && stats && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Total Students</p>
                  <h3 className="mt-2 text-3xl font-bold text-primary">{stats.totalStudents}</h3>
                </div>
                <span className="text-5xl text-primary/20 material-symbols-outlined">group</span>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Canteen Users</p>
                  <h3 className="mt-2 text-3xl font-bold text-primary">{stats.totalCanteenUsers}</h3>
                </div>
                <span className="text-5xl text-primary/20 material-symbols-outlined">restaurant</span>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Total Orders</p>
                  <h3 className="mt-2 text-3xl font-bold text-primary">{stats.totalOrders}</h3>
                </div>
                <span className="text-5xl text-primary/20 material-symbols-outlined">shopping_bag</span>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant">Total Revenue</p>
                  <h3 className="mt-2 text-3xl font-bold text-primary">रू {stats.totalRevenue.toFixed(2)}</h3>
                </div>
                <span className="text-5xl text-primary/20 material-symbols-outlined">trending_up</span>
              </div>
            </div>
          </section>
        )}

        {/* Tab Navigation */}
        <div className="sticky top-20 z-30 flex gap-2 overflow-x-auto bg-background/95 backdrop-blur-sm">
          <button
            onClick={() => handleTabChange('overview')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('students')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => handleTabChange('canteen')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'canteen'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Canteen Users
          </button>
          <button
            onClick={() => handleTabChange('menu')}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-container'
            }`}
          >
            Menu Items
          </button>
        </div>

        {/* Students Table */}
        {activeTab === 'students' && (
          <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">{student.full_name}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{student.email}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">रू {parseFloat(student.balance).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-on-surface">{student.order_count}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(student.created_at).toLocaleDateString()}
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
          <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {canteenUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">{user.full_name}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-on-secondary-container">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Menu Items Table */}
        {activeTab === 'menu' && (
          <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{item.restaurant_name}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary">रू {parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
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
  );
}
