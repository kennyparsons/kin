import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Person } from '../types';

export function PersonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    email: '',
    company: '',
    manager_name: '',
    role: '',
    tags: '',
    frequency_days: undefined
  });
  
  const [metadataFields, setMetadataFields] = useState<{key: string, value: string}[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      apiFetch(`/api/people/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData(data);
          
          try {
            const parsedMeta = typeof data.metadata === 'string' 
              ? JSON.parse(data.metadata) 
              : data.metadata || {};
              
            const fields = Object.entries(parsedMeta).map(([key, value]) => ({
              key,
              value: String(value)
            }));
            setMetadataFields(fields);
          } catch (e) {
            console.error("Failed to parse metadata", e);
            setMetadataFields([]);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isEditing, id]);

  const addMetadataField = () => {
    setMetadataFields([...metadataFields, { key: '', value: '' }]);
  };

  const removeMetadataField = (index: number) => {
    const newFields = [...metadataFields];
    newFields.splice(index, 1);
    setMetadataFields(newFields);
  };

  const updateMetadataField = (index: number, field: 'key' | 'value', newValue: string) => {
    const newFields = [...metadataFields];
    newFields[index][field] = newValue;
    setMetadataFields(newFields);
  };

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await apiFetch(`/api/people/${id}`, { method: 'DELETE' });
      navigate('/people');
    } catch (err) {
      alert('Failed to delete person');
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert array back to object
      const metadataObj = metadataFields.reduce((acc, curr) => {
        if (curr.key.trim()) {
          acc[curr.key.trim()] = curr.value;
        }
        return acc;
      }, {} as Record<string, any>);

      const payload = {
        ...formData,
        metadata: metadataObj
      };

      const url = isEditing ? `/api/people/${id}` : '/api/people';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/people');
      } else {
        alert('Failed to save person');
      }
    } catch (err) {
      alert('Error saving data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Person' : 'Add Person'}
          </h1>
        </div>
        {isEditing && (
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center text-sm font-medium"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Person
          </button>
        )}
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
                value={formData.name || ''}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keep In Touch Frequency</label>
            <select 
              value={formData.frequency_days || ''}
              onChange={e => setFormData({...formData, frequency_days: e.target.value ? Number(e.target.value) : undefined})}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">No rule set</option>
              <option value="7">Every Week</option>
              <option value="14">Every 2 Weeks</option>
              <option value="30">Every Month</option>
              <option value="90">Every Quarter</option>
              <option value="180">Every 6 Months</option>
              <option value="365">Every Year</option>
            </select>
          </div>

          {/* Metadata */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Extra Details</label>
              <button 
                type="button" 
                onClick={addMetadataField}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                <Plus size={16} className="mr-1" /> Add Field
              </button>
            </div>
             
             <div className="space-y-3">
               {metadataFields.map((field, index) => (
                 <div key={index} className="flex space-x-2">
                   <input
                     type="text"
                     placeholder="Label (e.g. Birthday)"
                     value={field.key}
                     onChange={(e) => updateMetadataField(index, 'key', e.target.value)}
                     className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <input
                     type="text"
                     placeholder="Value"
                     value={field.value}
                     onChange={(e) => updateMetadataField(index, 'value', e.target.value)}
                     className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                   />
                   <button
                    type="button"
                    onClick={() => removeMetadataField(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
               ))}
               {metadataFields.length === 0 && (
                 <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                   No extra details added.
                 </div>
               )}
             </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Person?</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{formData.name}</strong>? This action cannot be undone and will remove all associated interactions and reminders.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}