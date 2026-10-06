import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        address,
      });
      clearCart();
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
        <Link to="/menu" className="btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart 🛒</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4 items-center">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-brand-600 font-bold">&#8377;{item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 font-bold flex items-center justify-center transition"
                >-</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 font-bold flex items-center justify-center transition"
                >+</button>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold">&#8377;{(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-xs hover:text-red-600 transition">Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span>{item.name} x {item.quantity}</span>
                <span>&#8377;{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-600">&#8377;{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address
            </label>
            <textarea
              rows={2}
              placeholder="Enter your full address..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="input resize-none"
            />
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="btn-primary w-full text-center"
          >
            {placing ? 'Placing Order...' : 'Place Order - \u20B9' + total.toFixed(2)}
          </button>

          <button onClick={clearCart} className="w-full text-center text-sm text-gray-400 hover:text-red-500 mt-3 transition">
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
