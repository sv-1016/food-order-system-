import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: [], items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders'),
      api.get('/menu/admin/items'),
    ]).then(([ordersRes, itemsRes]) => {
      setStats({ orders: ordersRes.data, items: itemsRes.data });
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenue = stats.orders.filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  const statusCount = stats.orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statCards = [
    { label: 'Total Orders', value: stats.orders.length, icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { label: 'Revenue', value: `\u20B9${totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 text-green-600' },
    { label: 'Menu Items', value: stats.items.length, icon: '🍽️', color: 'bg-orange-50 text-orange-600' },
    { label: 'Pending Orders', value: statusCount.pending || 0, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
  ];

  if (loading) return (
    <div className="flex justify-center py-20"><div className="text-5xl animate-bounce">🍔</div></div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/menu" className="btn-outline">Manage Menu</Link>
          <Link to="/admin/orders" className="btn-primary">View Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-2xl mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Recent Orders</h2>
          <Link to="/admin/orders" className="text-brand-600 text-sm hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Items</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.orders.slice(0, 8).map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">#{order.id}</td>
                  <td className="px-5 py-3 text-gray-600">{order.customer_name}</td>
                  <td className="px-5 py-3 text-gray-500">{order.items.length} item(s)</td>
                  <td className="px-5 py-3 font-semibold text-brand-600">&#8377;{order.total.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700">
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
