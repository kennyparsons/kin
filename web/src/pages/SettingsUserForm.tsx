import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { apiFetch } from '../utils/api';

export function SettingsUserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      apiFetch(`/api/users`) // Assuming we fetch list and find? Or add GET /api/users/:id
        .then(res => res.json())
        .then((users: any[]) => {
          const user = users.find(u => u.id === Number(id));
          if (user) {
            setFormData({ name: user.name || '', email: user.email, password: '' });
          }
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/users/${id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        navigate('/settings/users');
      } else {
        alert('Failed to save user');
      }
    } catch (err) {
      alert('Error saving user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate('/settings/users')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit User' : 'Add User'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
            </label>
            <input 
              type="password" 
              required={!isEditing}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save User
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
