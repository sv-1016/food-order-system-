import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '👨‍🍳',
  out_for_delivery: '🛵',
  delivered: '🎉',
  cancelled: '❌',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="text-5xl animate-bounce">🍔</div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
      <p className="text-gray-500 mb-6">Your order history will appear here.</p>
      <Link to="/menu" className="btn-primary">Order Now</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-lg">Order #{order.id}</span>
                <span className="text-gray-400 text-sm ml-3">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                {STATUS_ICONS[order.status]} {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {order.items.map(item => (
                <span key={item.id} className="bg-gray-50 border border-gray-100 text-sm px-3 py-1 rounded-full text-gray-600">
                  {item.name} × {item.quantity}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">📍 {order.address || 'No address'}</span>
              <span className="font-bold text-brand-600 text-lg">&#8377;{order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
