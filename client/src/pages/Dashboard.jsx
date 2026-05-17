import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../lib/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-lg md:p-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-2xl">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Welcome, {user?.full_name}!</h1>
            <p className="font-body-md text-on-surface-variant mt-xs">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-error text-on-error font-label-md py-md px-lg rounded-xl hover:shadow-lg transition-all"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow">
            <h3 className="font-headline-md text-on-surface mb-md">Quick Stats</h3>
            <p className="font-body-md text-on-surface-variant">User ID: {user?.id}</p>
            <p className="font-body-md text-on-surface-variant mt-sm">Role: {user?.role}</p>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl shadow">
            <h3 className="font-headline-md text-on-surface mb-md">Orders</h3>
            <p className="font-body-lg text-primary">Coming Soon</p>
          </div>

          <div className="bg-surface-container-lowest p-lg rounded-xl shadow">
            <h3 className="font-headline-md text-on-surface mb-md">Restaurants</h3>
            <p className="font-body-lg text-primary">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
