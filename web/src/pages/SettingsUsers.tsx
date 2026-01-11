import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Plus, ChevronRight } from 'lucide-react';
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
  const navigate = useNavigate();

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
        <Link 
          to="/settings/users/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} className="mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {users.map(user => (
            <Link key={user.id} to={`/settings/users/${user.id}`} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
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
                <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
