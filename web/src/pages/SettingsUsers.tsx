import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import { Plus, Edit2, Trash2, Check, X, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: number;
  email: string;
  name?: string;
  created_at: number;
}

export function SettingsUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ email: '', name: '', password: '' });

  // Creating State
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', name: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditForm({ email: user.email, name: user.name || '', password: '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ email: '', name: '', password: '' });
  };

  const saveUser = async (id: number) => {
    try {
      await apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const createUser = async () => {
    try {
      const res = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });
      if (!res.ok) throw new Error();
      setIsCreating(false);
      setCreateForm({ email: '', name: '', password: '' });
      fetchUsers();
    } catch (err) {
      alert('Failed to create user');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Create Form */}
        {isCreating && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input 
                placeholder="Display Name"
                value={createForm.name}
                onChange={e => setCreateForm({...createForm, name: e.target.value})}
                className="rounded border border-blue-200 p-2 text-sm"
              />
              <input 
                placeholder="Email *"
                value={createForm.email}
                onChange={e => setCreateForm({...createForm, email: e.target.value})}
                className="rounded border border-blue-200 p-2 text-sm"
              />
              <input 
                placeholder="Password *"
                type="password"
                value={createForm.password}
                onChange={e => setCreateForm({...createForm, password: e.target.value})}
                className="rounded border border-blue-200 p-2 text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1">Cancel</button>
              <button onClick={createUser} className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">Save</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-100">
          {users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between group">
              {editingId === user.id ? (
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <input 
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="rounded border p-2 text-sm"
                      placeholder="Name"
                    />
                    <input 
                      value={editForm.email}
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="rounded border p-2 text-sm"
                      placeholder="Email"
                    />
                    <input 
                      value={editForm.password}
                      onChange={e => setEditForm({...editForm, password: e.target.value})}
                      className="rounded border p-2 text-sm"
                      placeholder="New Password (Optional)"
                      type="password"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={cancelEditing} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
                    <button onClick={() => saveUser(user.id)} className="text-green-600 hover:text-green-700 text-sm font-medium">Save Changes</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-400 space-x-4">
                    <span>Joined {format(new Date(user.created_at * 1000), 'MMM d, yyyy')}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex space-x-2 transition-opacity">
                      <button onClick={() => startEditing(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
