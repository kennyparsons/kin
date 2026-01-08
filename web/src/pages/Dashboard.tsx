import { useEffect, useState } from 'react';
import { Clock, CheckCircle, UserPlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reminder } from '../types';
import { apiFetch } from '../utils/api';
import { format } from 'date-fns';

export function Dashboard() {
  const [data, setData] = useState<{ reminders: Reminder[], stalePeople: any[] }>({ reminders: [], stalePeople: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const toggleReminder = async (id: number, currentStatus: string) => {
    await apiFetch(`/api/reminders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: currentStatus === 'pending' ? 'done' : 'pending' })
    });
    // Refresh data
    const res = await apiFetch('/api/dashboard');
    const newData = await res.json();
    setData(newData);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your day...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500">Here's what's happening in your network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reminders Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900">
            <Clock className="text-blue-600" size={20} />
            <h2 className="text-xl font-bold">Upcoming Reminders</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {data?.reminders && data.reminders.length > 0 ? (
              data.reminders.map(reminder => (
                <div key={reminder.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-start space-x-3">
                    <button 
                      onClick={() => toggleReminder(reminder.id, reminder.status)}
                      className="mt-1 w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      {reminder.status === 'done' && <CheckCircle size={12} className="text-blue-600" />}
                    </button>
                    <div>
                      <p className="font-medium text-gray-900">{reminder.title}</p>
                      <Link to={`/people/${reminder.person_id}`} className="text-sm text-blue-600 hover:underline">
                        {reminder.person_name}
                      </Link>
                    </div>
                  </div>
                  {reminder.due_date && (
                    <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded">
                      {format(new Date(reminder.due_date * 1000), 'MMM d')}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                All caught up! No pending reminders.
              </div>
            )}
          </div>
        </div>

        {/* Keep in Touch Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-900">
            <UserPlus className="text-orange-500" size={20} />
            <h2 className="text-xl font-bold">Keep in Touch</h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {data?.stalePeople && data.stalePeople.length > 0 ? (
              data.stalePeople.map(person => (
                <div key={person.id} className="p-4 flex items-center justify-between group">
                  <div>
                    <h3 className="font-medium text-gray-900">{person.name}</h3>
                    <p className="text-xs text-gray-500">
                      {person.last_interaction 
                        ? `Last spoke ${format(new Date(person.last_interaction * 1000), 'MMM d')}`
                        : 'No interactions yet'}
                    </p>
                  </div>
                  <Link 
                    to={`/people/${person.id}`} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                You're doing great! Everyone is warmed up.
              </div>
            )}
            <div className="p-4 bg-gray-50">
              <Link to="/people" className="text-sm text-gray-600 font-medium hover:text-gray-900 flex items-center justify-center">
                View All People <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}