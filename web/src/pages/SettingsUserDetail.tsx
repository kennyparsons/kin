import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Mail } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { format } from 'date-fns';

export function SettingsUserDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      apiFetch(`/api/users`) // Temporary: Fetch all and find
        .then(res => res.json())
        .then((users: any[]) => {
          const u = users.find(u => u.id === Number(id));
          setUser(u);
          setLoading(false);
        });
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      navigate('/settings/users');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <button onClick={() => navigate('/settings/users')} className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-1" /> Back to Users
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name || 'Unnamed'}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <Mail size={14} className="mr-1" />
                {user.email}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate(`/settings/users/${id}/edit`)}
              className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit2 size={18} className="mr-2" />
              Edit
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center text-gray-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Details</h2>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="text-sm text-gray-900 mt-1">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Joined</dt>
            <dd className="text-sm text-gray-900 mt-1 flex items-center">
              <Calendar size={14} className="mr-1 text-gray-400" />
              {format(new Date(user.created_at * 1000), 'PPP')}
            </dd>
          </div>
          {/* Add more fields here later (Role, Last Login, etc.) */}
        </dl>
      </div>
    </div>
  );
}
