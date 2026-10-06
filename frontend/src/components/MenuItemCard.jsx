import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function MenuItemCard({ item }) {
  const { addToCart, items } = useCart();
  const cartItem = items.find(i => i.id === item.id);

  const handleAdd = () => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '12px' }
    });
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
        />
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
          {item.category_icon} {item.category_name}
        </span>
        {cartItem && (
          <span className="absolute top-2 right-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {cartItem.quantity} in cart
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-brand-600 font-bold text-lg">₹{item.price.toFixed(2)}</span>
          <button onClick={handleAdd} className="btn-primary text-sm py-1.5 px-4">
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
