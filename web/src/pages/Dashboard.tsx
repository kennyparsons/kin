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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Pending Reminders
          </h2>
          {/* ... reminders code ... */}
          {loading ? (
             <p>Loading...</p>
          ) : data.reminders.length === 0 ? (
             <p className="text-gray-500 text-sm">No pending reminders.</p>
          ) : (
            <div className="space-y-3">
              {data.reminders.map(reminder => (
                <div key={reminder.id} className="flex items-start space-x-3 group">
                  <button 
                    onClick={() => toggleReminder(reminder.id, reminder.status)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border border-gray-300 hover:border-blue-500 flex items-center justify-center transition-colors"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{reminder.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                       {reminder.person_name && <span>For: {reminder.person_name}</span>}
                       {reminder.due_date && (
                         <span className={reminder.due_date * 1000 < Date.now() ? 'text-red-500' : ''}>
                           {format(new Date(reminder.due_date * 1000), 'MMM d')}
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-orange-500" size={20} />
            Needs Attention
          </h2>
          <p className="text-sm text-gray-500 mb-4">People you are overdue to contact.</p>
          
          <div className="space-y-4">
            {data.stalePeople.map((person: any) => (
              <div key={person.id} className="flex justify-between items-center">
                <div>
                  <Link to={`/people/${person.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {person.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    Last interaction: {person.last_interaction ? format(new Date(person.last_interaction * 1000), 'MMM d, yyyy') : 'Never'}
                  </p>
                </div>
                <Link to={`/people/${person.id}`} className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-100">
                  Connect
                </Link>
              </div>
            ))}
            {data.stalePeople.length === 0 && !loading && (
              <p className="text-gray-500 text-sm">Everyone is healthy!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}