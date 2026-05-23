import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    displayOrder: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories/all');
      setCategories(data.categories);
    } catch (err) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', formData);
        toast.success('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '', displayOrder: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) return <div className="text-center py-10 text-navy/40 tracking-wide">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair text-2xl font-semibold text-navy">Category Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-navy text-white px-6 py-2 hover:bg-navy-light transition font-medium text-sm uppercase tracking-widest"
        >
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 border border-navy/10">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-widest mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm"
                placeholder="e.g., Necklaces, Earrings"
                required
              />
            </div>

            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm"
                rows="3"
                placeholder="Brief description of this category"
              />
            </div>

            <div>
              <label className="block text-navy/60 mb-2 text-xs font-semibold uppercase tracking-wider">Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                className="w-full p-3 border border-navy/20 focus:ring-2 focus:ring-gold focus:outline-none text-navy text-sm"
                placeholder="0 (lower numbers appear first)"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gold text-white py-3 hover:bg-gold-dark transition font-medium text-sm uppercase tracking-widest"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-navy/20 text-navy hover:bg-navy/5 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-navy/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-navy/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Order</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/60">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-navy/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5">
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-navy/[0.02]">
                <td className="px-6 py-4 font-medium text-navy">{category.name}</td>
                <td className="px-6 py-4 text-sm text-navy/50">{category.slug}</td>
                <td className="px-6 py-4 text-navy/60">{category.displayOrder}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium ${
                    category.isActive ? 'bg-gold/10 text-gold border border-gold/30' : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-gold hover:text-gold-dark font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-10 text-navy/40">
            No categories yet. Create your first category!
          </div>
        )}
      </div>
    </div>
  );
}
