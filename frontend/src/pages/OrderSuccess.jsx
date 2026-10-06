import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(res => setOrder(res.data));
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-7xl mb-4 animate-bounce">🎉</div>
      <h1 className="text-3xl font-bold mb-2 text-green-600">Order Placed!</h1>
      <p className="text-gray-500 mb-6">
        Your order #{id} has been received and is being prepared.
      </p>

      {order && (
        <div className="card p-6 text-left mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg">Order #{order.id}</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {order.status}
            </span>
          </div>
          <div className="space-y-2 mb-4">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} × {item.quantity}</span>
                <span>&#8377;{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-brand-600">&#8377;{order.total.toFixed(2)}</span>
          </div>
          {order.address && (
            <p className="text-sm text-gray-500 mt-3">📍 {order.address}</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-outline">View All Orders</Link>
        <Link to="/menu" className="btn-primary">Order More Food</Link>
      </div>
    </div>
  );
}
