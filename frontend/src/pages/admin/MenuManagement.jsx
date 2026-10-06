import { useEffect, useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category_id: '', image: '', available: 1 };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/menu/admin/items'),
      api.get('/menu/categories'),
    ]).then(([itemsRes, catRes]) => {
      setItems(itemsRes.data);
      setCategories(catRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id || '',
      image: item.image || '',
      available: item.available,
    });
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        const res = await api.put(`/menu/items/${editing}`, payload);
        setItems(prev => prev.map(i => i.id === editing ? res.data : i));
        toast.success('Item updated');
      } else {
        const res = await api.post('/menu/items', payload);
        setItems(prev => [...prev, res.data]);
        toast.success('Item added');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/items/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailable = async (item) => {
    try {
      const res = await api.put(`/menu/items/${item.id}`, { available: item.available ? 0 : 1 });
      setItems(prev => prev.map(i => i.id === item.id ? res.data : i));
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="text-5xl animate-bounce">🍔</div></div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Item</button>
      </div>

      {/* Item Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Item</th>
              <th className="px-5 py-3 text-left hidden md:table-cell">Category</th>
              <th className="px-5 py-3 text-left">Price</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'; }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{item.category_name}</td>
                <td className="px-5 py-3 font-semibold text-brand-600">&#8377;{item.price.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleAvailable(item)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                      item.available ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-red-100 text-red-600 hover:bg-green-50 hover:text-green-700'
                    }`}
                  >
                    {item.available ? '✅ Available' : '❌ Hidden'}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="text-brand-600 hover:underline mr-3 text-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} className="input resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input required type="number" step="0.01" min="0" className="input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input className="input" placeholder="https://..." value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} />
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="available" checked={!!form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked ? 1 : 0 }))} className="w-4 h-4 accent-orange-500" />
                  <label htmlFor="available" className="text-sm text-gray-700">Available on menu</label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
