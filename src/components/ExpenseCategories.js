import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpenseCategories.css';

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const apiBase = 'http://localhost:3000/category';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(apiBase+"/");
      setCategories(res.data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${apiBase}/${editingId}`, form);
      } else {
        await axios.post(`${apiBase}/create`, form);
      }
      setForm({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError('Error saving category');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${apiBase}/${id}`);
        fetchCategories();
      } catch (err) {
        setError('Error deleting category');
        console.error(err);
      }
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description });
  };

  return (
    <div className="categories-container">
      <h1 className="title">Expense Categories</h1>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <button type="submit">
          {editingId ? 'Update Category' : 'Add Category'}
        </button>
        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', description: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(cat)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(cat._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseCategories;
