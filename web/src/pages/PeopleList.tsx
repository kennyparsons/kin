import { useEffect, useState } from 'react';
import { Person } from '../types';
import { Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

export function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/people`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPeople(data as Person[]);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <Link to="/people/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          <span>Add Person</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search people..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700"
          />
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : people.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No people found. Add your first contact!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {people.map(person => (
              <Link 
                to={`/people/${person.id}`} 
                key={person.id} 
                className="block p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{person.name}</h3>
                    <div className="text-sm text-gray-500 flex space-x-2">
                      {person.role && <span>{person.role}</span>}
                      {person.company && (
                        <>
                          <span>&bull;</span>
                          <span>{person.company}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 group-hover:text-blue-600 transition-colors">
                    View
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
