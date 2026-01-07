import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Person } from '../types';

export function PersonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    email: '',
    company: '',
    manager_name: '',
    role: '',
    tags: '',
    metadata: '{}'
  });

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      fetch(`/api/people/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            metadata: JSON.stringify(data.metadata || {}, null, 2)
          });
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isEditing, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Parse metadata to ensure it's valid JSON
      const payload = {
        ...formData,
        metadata: JSON.parse(formData.metadata || '{}')
      };

      const url = isEditing ? `/api/people/${id}` : '/api/people';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/people');
      } else {
        alert('Failed to save person');
      }
    } catch (err) {
      alert('Invalid JSON in metadata field');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Person' : 'Add Person'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-6">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={formData.email || ''}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input 
                type="text" 
                value={formData.company || ''}
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input 
                type="text" 
                value={formData.role || ''}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager's Name</label>
              <input 
                type="text" 
                value={formData.manager_name || ''}
                onChange={e => setFormData({...formData, manager_name: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input 
                type="text" 
                value={formData.tags || ''}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="friend, investor, colleague"
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Metadata */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Extra Metadata (JSON)</label>
             <p className="text-xs text-gray-500 mb-2">Use this for flexible fields like "favorite_drink": "coffee"</p>
             <textarea 
                rows={4}
                value={formData.metadata || '{}'}
                onChange={e => setFormData({...formData, metadata: e.target.value})}
                className="w-full rounded-lg border-gray-300 border p-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Person'}</span>
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
