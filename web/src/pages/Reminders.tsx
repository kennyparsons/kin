import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Search, Loader } from 'lucide-react';
import { Reminder } from '../types';
import { API_BASE } from '../config';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchReminders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('status', filterStatus);
    if (debouncedSearch) params.append('search', debouncedSearch);

    try {
      const res = await fetch(`${API_BASE}/api/reminders?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      setReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [filterStatus, debouncedSearch]);

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    
    // Optimistic update
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

    await fetch(`${API_BASE}/api/reminders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    });

    // If we are hiding completed, remove it from list after a short delay or immediately?
    // User requested: "load just incomplete... uncheck incomplete or check completed... show them all"
    // So if 'pending' filter is active, switching to 'done' should remove it.
    if (filterStatus === 'pending' && newStatus === 'done') {
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search reminders..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-gray-700">
              <input 
                type="checkbox" 
                checked={filterStatus === 'all'}
                onChange={e => setFilterStatus(e.target.checked ? 'all' : 'pending')}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
              />
              <span>Show Completed</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex justify-center">
            <Loader className="animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No reminders found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reminders.map(reminder => (
              <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                 <button 
                    onClick={() => toggleStatus(reminder.id, reminder.status)}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      reminder.status === 'done' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {reminder.status === 'done' && <CheckCircle size={12} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-gray-900 ${reminder.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                      {reminder.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                       {reminder.person_name && (
                         <Link to={`/people/${reminder.person_id}`} className="hover:text-blue-600 truncate">
                           For: {reminder.person_name}
                         </Link>
                       )}
                       {reminder.due_date && (
                         <span className={`flex items-center ${reminder.status !== 'done' && reminder.due_date * 1000 < Date.now() ? 'text-red-600' : ''}`}>
                           <Clock size={12} className="mr-1" />
                           {format(new Date(reminder.due_date * 1000), 'MMM d, yyyy')}
                         </span>
                       )}
                    </div>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
