import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: res.data.status } : o));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex justify-center py-20"><div className="text-5xl animate-bounce">🍔</div></div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              filter === s ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">No orders found</div>
        )}
        {filtered.map(order => (
          <div key={order.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">Order #{order.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  👤 {order.customer_name} ({order.customer_email})
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand-600 text-xl">&#8377;{order.total.toFixed(2)}</div>
                <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 my-3">
              {order.items.map(item => (
                <span key={item.id} className="bg-gray-50 border text-xs px-2.5 py-1 rounded-full text-gray-600">
                  {item.name} × {item.quantity}
                </span>
              ))}
            </div>

            {order.address && <p className="text-sm text-gray-500 mb-3">📍 {order.address}</p>}

            {/* Status selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Update status:</span>
              <select
                value={order.status}
                onChange={e => updateStatus(order.id, e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
