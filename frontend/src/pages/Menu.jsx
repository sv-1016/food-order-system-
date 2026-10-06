import { useEffect, useState } from 'react';
import api from '../lib/api';
import MenuItemCard from '../components/MenuItemCard';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/menu/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (search) params.search = search;
    api.get('/menu/items', { params })
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Our Menu</h1>
      <p className="text-gray-500 mb-6">Fresh, delicious food made to order</p>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search for food..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10 max-w-md"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            activeCategory === 'all'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
          }`}
        >
          🍽️ All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
              activeCategory === cat.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-5xl animate-bounce">🍔</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => <MenuItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
