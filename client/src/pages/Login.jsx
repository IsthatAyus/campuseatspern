import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden box-border">
      <main className="w-full min-h-screen max-w-full rounded-none md:rounded-2xl flex flex-col lg:flex-row overflow-hidden relative bg-white md:shadow-xl box-border">
        {/* Left Section: Hero */}
        <section className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/90 to-primary/70 overflow-hidden">
          <img
            alt="Traditional Nepali Dining"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxHnZtDB99wuQCjCPAtnIajCD28Vogor-97CcTEUoDB4tVGSp7L-mBC1IJ3_WLoXR-s0kFlbr27avP58RZ4u1qVN7FR0S0Y35qHm2vb9kp9Obu-tNmgqzvX8cJ-i5O6efrXWISm6va4-Yd6p5luPJRotcnuwec1olzxsYA4MLphDUgANeZLLk-1dGraQB0xzIX8WtWAXxj6cPZu5JG9X0KmSVo-qaXTzveXb0Lov6tO6DyyPicMW4QYypPkAspiyx-2fO0qiJCpLg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Branding */}
          <div className="absolute bottom-0 left-0 w-full h-full p-6 md:p-8 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="text-white z-10 max-w-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  restaurant_menu
                </span>
                <span className="text-sm font-semibold tracking-widest uppercase">Taste Campus Life</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Authentic Flavors, Every Bite</h1>
              <p className="text-base md:text-lg opacity-90 mb-8">Premium Himalayan cuisine delivered fresh to your dorm. Fast, fresh, delicious.</p>
              
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20">
                  <span className="block text-xs text-white/70 font-medium">Momos from</span>
                  <span className="text-2xl font-bold">NPR 99</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/20">
                  <span className="block text-xs text-white/70 font-medium">Free Delivery</span>
                  <span className="text-xl font-bold">On Orders</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Login Form */}
        <section className="w-full lg:w-1/2 flex flex-col px-4 sm:px-6 md:px-8 py-6 relative bg-white overflow-visible">
          <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
            {/* Branding */}
            <div className="mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2 justify-center">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  fastfood
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-primary">CampusEats</h2>
              </div>
              <p className="text-base text-on-surface-variant uppercase tracking-widest mt-0.5 font-medium">Student Dining</p>
            </div>

            {/* Welcome Header */}
            <div className="mb-3 sm:mb-3.5">
              <h3 className="text-2xl sm:text-3xl font-bold text-on-surface">Welcome Back</h3>
              <p className="text-base text-on-surface-variant mt-0.5">Sign in to order meals</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-2.5 p-2.5 bg-error-container border border-error rounded-lg flex-shrink-0">
                <p className="text-xs text-on-error-container font-medium">{error}</p>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleLogin} className="space-y-2 w-full flex-shrink-0">
              {/* Email Input */}
              <div className="space-y-0.5">
                <label className="text-base font-medium text-on-surface-variant ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-2.5 py-2 text-base bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1.5 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-base font-medium text-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <a className="text-xs text-primary hover:text-primary/80 transition-all font-medium" href="#">
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-9 py-2 text-base bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-1.5 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-sm hover:text-on-surface transition-colors">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-0.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 text-base rounded-md shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-1.5 flex items-center gap-1.5">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="text-base text-on-surface-variant/60 font-medium px-1">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" className="py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors font-medium text-base">
                  Google
                </button>
                <button type="button" className="py-2 px-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors font-medium text-base">
                  EduPass
                </button>
              </div>
            </form>

            {/* Signup Link */}
            <div className="mt-2 text-center pt-2 border-t border-gray-200 flex-shrink-0">
              <p className="text-sm text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-bold hover:text-primary/80 transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-1.5 border-t border-gray-100 text-center text-xs text-on-surface-variant/50 flex justify-center gap-2 flex-shrink-0">
            <a className="hover:text-on-surface transition-colors" href="#">Terms</a>
            <a className="hover:text-on-surface transition-colors" href="#">Privacy</a>
            <span>© 2024</span>
          </div>
        </section>
      </main>
    </div>
  );
}
