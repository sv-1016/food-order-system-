import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import MenuItemCard from '../components/MenuItemCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/menu/items').then(res => {
      const items = res.data;
      const shuffled = [...items].sort(() => 0.5 - Math.random());
      setFeatured(shuffled.slice(0, 4));
      setAllItems(items);
    });
    api.get('/menu/categories').then(res => setCategories(res.data));
  }, []);

  const filteredItems = activeTab === 'all'
    ? allItems
    : allItems.filter(i => i.category_id === activeTab);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-9xl flex flex-wrap gap-8 p-8 overflow-hidden select-none">
          {['🍔','🍕','🍣','🥗','🍰','🥤','🌮','🍜'].map((e, i) => (
            <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
          ))}
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            🚀 Fast delivery in 30 mins
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
            Delicious Food,<br />
            <span className="text-yellow-300">Delivered Fast</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            From juicy burgers to fresh sushi — your favourite meals, just a few clicks away.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/menu" className="bg-white text-brand-600 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition text-lg">
              Order Now 🍽️
            </Link>
            <Link to="/menu" className="bg-white/20 backdrop-blur-sm text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/30 transition text-lg border border-white/30">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: '30-Min Delivery', desc: 'Hot food at your door in under 30 minutes.' },
            { icon: '👨‍🍳', title: 'Fresh Ingredients', desc: 'Made daily with locally sourced ingredients.' },
            { icon: '💳', title: 'Easy Ordering', desc: 'Browse, add to cart, and checkout in seconds.' },
          ].map(f => (
            <div key={f.title} className="card p-6 text-center hover:shadow-md transition">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🔥 Featured Today</h2>
            <Link to="/menu" className="text-brand-600 font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Browse the Menu Section */}
      {allItems.length > 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2">Browse the Menu</h2>
              <p className="text-gray-500">Pick your favourites and add them to cart</p>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  activeTab === 'all'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
                }`}
              >
                🍽️ All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    activeTab === cat.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-400'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
              {filteredItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <p className="text-gray-500 mb-4">Want to see more options and search by name?</p>
              <Link to="/menu" className="btn-primary text-base px-8 py-3">
                Open Full Menu
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Fallback CTA (shown only while items are loading) */}
      {allItems.length === 0 && (
        <section className="bg-gray-100 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-3">Ready to order?</h2>
            <p className="text-gray-600 mb-6">Explore our full menu and find your next favourite meal.</p>
            <Link to="/menu" className="btn-primary text-base px-8 py-3">Browse the Menu</Link>
          </div>
        </section>
      )}
    </div>
  );
}
