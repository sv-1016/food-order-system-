import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-600">
          <span className="text-2xl">🍔</span>
          <span>FoodRush</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-brand-600 transition">Home</Link>
          <Link to="/menu" className="hover:text-brand-600 transition">Menu</Link>
          {user && <Link to="/orders" className="hover:text-brand-600 transition">My Orders</Link>}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-brand-600 font-semibold">Admin</Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-brand-50 transition">
            <span className="text-2xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-sm text-gray-600">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-3">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline text-sm py-1.5 px-3">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
