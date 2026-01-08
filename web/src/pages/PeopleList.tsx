import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building } from 'lucide-react';
import { Person } from '../types';
import { apiFetch } from '../utils/api';

export function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/people')
      .then(res => res.json())
      .then(setPeople)
      .finally(() => setLoading(false));
  }, []);

  const getHealthColor = (person: Person) => {
    if (!person.frequency_days) return null; // No rule
    
    const now = Math.floor(Date.now() / 1000);
    const last = person.last_interaction || 0;
    const diffDays = (now - last) / 86400;
    
    if (diffDays > person.frequency_days) return 'bg-red-500';
    if (diffDays > person.frequency_days * 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">People</h1>
        <Link to="/people/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
          <Plus size={20} className="mr-2" />
          Add Person
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {people.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(person => {
              const healthColor = getHealthColor(person);
              return (
                <Link key={person.id} to={`/people/${person.id}`} className="block p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold relative">
                      {person.name.charAt(0)}
                      {healthColor && (
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${healthColor}`}></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{person.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        {person.company && <span className="flex items-center"><Building size={12} className="mr-1" /> {person.company}</span>}
                        {person.role && <span>{person.role}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {person.tags && (
                      <div className="hidden sm:flex space-x-2 mr-4">
                        {person.tags.split(',').slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
            {people.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No people found. Add your first contact!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
