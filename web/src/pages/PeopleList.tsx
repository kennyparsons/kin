import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building, Briefcase, Filter, Layers, X, MapPin, Heart } from 'lucide-react';
import { Person } from '../types';
import { apiFetch } from '../utils/api';

type GroupBy = 'none' | 'company' | 'function' | 'kit';

export function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters & Grouping
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    apiFetch('/api/people')
      .then(res => res.json())
      .then(setPeople)
      .finally(() => setLoading(false));
  }, []);

  const getHealthStatus = (person: Person) => {
    if (!person.frequency_days) return 'Inactive';
    const now = Math.floor(Date.now() / 1000);
    const last = person.last_interaction || 0;
    const diffDays = (now - last) / 86400;
    if (diffDays > person.frequency_days) return 'Overdue';
    if (diffDays > person.frequency_days * 0.8) return 'Due Soon';
    return 'Healthy';
  };

  const getHealthColor = (person: Person) => {
    const status = getHealthStatus(person);
    if (status === 'Overdue') return 'bg-red-500';
    if (status === 'Due Soon') return 'bg-yellow-500';
    if (status === 'Healthy') return 'bg-green-500';
    return null;
  };

  // Derive Filters
  const uniqueCompanies = useMemo(() => 
    Array.from(new Set(people.map(p => p.company).filter(Boolean))) as string[], 
  [people]);

  const uniqueFunctions = useMemo(() => 
    Array.from(new Set(people.map(p => p.function).filter(Boolean))) as string[], 
  [people]);

  const uniqueLocations = useMemo(() => 
    Array.from(new Set(people.map(p => p.location).filter(Boolean))) as string[], 
  [people]);

  // Filter Data
  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.company?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCompany = !filterCompany || 
                             (filterCompany === '__empty__' ? !p.company : p.company === filterCompany);
      
      const matchesFunction = !filterFunction || 
                              (filterFunction === '__empty__' ? !p.function : p.function === filterFunction);
      
      const matchesLocation = !filterLocation || 
                              (filterLocation === '__empty__' ? !p.location : p.location === filterLocation);
      
      const matchesStatus = !filterStatus || getHealthStatus(p) === filterStatus;
      
      return matchesSearch && matchesCompany && matchesFunction && matchesLocation && matchesStatus;
    });
  }, [people, search, filterCompany, filterFunction, filterLocation, filterStatus]);

  // Group Data
  const groupedData = useMemo(() => {
    if (groupBy === 'none') return { 'All People': filteredPeople };

    const groups: Record<string, Person[]> = {};
    
    filteredPeople.forEach(person => {
      let key = 'Uncategorized';
      if (groupBy === 'company') key = person.company || 'No Company';
      if (groupBy === 'function') key = person.function || 'No Function';
      if (groupBy === 'kit') key = getHealthStatus(person);

      if (!groups[key]) groups[key] = [];
      groups[key].push(person);
    });

    // Sort keys?
    return groups;
  }, [filteredPeople, groupBy]);

  const renderPersonRow = (person: Person) => {
    const healthColor = getHealthColor(person);
    return (
      <Link key={person.id} to={`/people/${person.id}`} className="block p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold relative flex-shrink-0">
            {person.name.charAt(0)}
            {healthColor && (
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${healthColor}`}></span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{person.name}</h3>
            <div className="flex items-center text-sm text-gray-500 space-x-3">
              {person.company && <span className="flex items-center truncate"><Building size={12} className="mr-1" /> {person.company}</span>}
              {person.function && <span className="flex items-center truncate"><Briefcase size={12} className="mr-1" /> {person.function}</span>}
              {person.location && <span className="flex items-center truncate"><MapPin size={12} className="mr-1" /> {person.location}</span>}
              {person.role && <span className="truncate hidden sm:inline">• {person.role}</span>}
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
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">People</h1>
        <Link to="/people/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors justify-center">
          <Plus size={20} className="mr-2" />
          Add Person
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col gap-4">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Filters */}
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={`w-full pl-8 pr-8 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm truncate ${filterStatus ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
              >
                <option value="">Status</option>
                <option value="Overdue">Overdue</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Healthy">Healthy</option>
                <option value="Inactive">No Rule</option>
              </select>
              <Heart size={14} className={`absolute left-2.5 top-3 ${filterStatus ? 'text-blue-500' : 'text-gray-400'}`} />
              {filterStatus && (
                 <button onClick={() => setFilterStatus('')} className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-700">
                   <X size={14} />
                 </button>
              )}
            </div>

            <div className="relative">
              <select 
                value={filterCompany}
                onChange={e => setFilterCompany(e.target.value)}
                className={`w-full pl-8 pr-8 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm truncate ${filterCompany ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
              >
                <option value="">Company</option>
                <option value="__empty__">(Empty)</option>
                {uniqueCompanies.sort().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <Filter size={14} className={`absolute left-2.5 top-3 ${filterCompany ? 'text-blue-500' : 'text-gray-400'}`} />
              {filterCompany && (
                 <button onClick={() => setFilterCompany('')} className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-700">
                   <X size={14} />
                 </button>
              )}
            </div>

            <div className="relative">
              <select 
                value={filterFunction}
                onChange={e => setFilterFunction(e.target.value)}
                className={`w-full pl-8 pr-8 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm truncate ${filterFunction ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
              >
                <option value="">Function</option>
                <option value="__empty__">(Empty)</option>
                {uniqueFunctions.sort().map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <Briefcase size={14} className={`absolute left-2.5 top-3 ${filterFunction ? 'text-blue-500' : 'text-gray-400'}`} />
              {filterFunction && (
                 <button onClick={() => setFilterFunction('')} className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-700">
                   <X size={14} />
                 </button>
              )}
            </div>

            <div className="relative">
              <select 
                value={filterLocation}
                onChange={e => setFilterLocation(e.target.value)}
                className={`w-full pl-8 pr-8 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm truncate ${filterLocation ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
              >
                <option value="">Location</option>
                <option value="__empty__">(Empty)</option>
                {uniqueLocations.sort().map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <MapPin size={14} className={`absolute left-2.5 top-3 ${filterLocation ? 'text-blue-500' : 'text-gray-400'}`} />
              {filterLocation && (
                 <button onClick={() => setFilterLocation('')} className="absolute right-2 top-2.5 text-blue-500 hover:text-blue-700">
                   <X size={14} />
                 </button>
              )}
            </div>

            {/* Group By */}
            <div className="relative md:col-span-1 col-span-2">
              <select 
                value={groupBy}
                onChange={e => setGroupBy(e.target.value as GroupBy)}
                className={`w-full pl-8 pr-4 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm truncate ${groupBy !== 'none' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-300'}`}
              >
                <option value="none">No Grouping</option>
                <option value="company">Group by Company</option>
                <option value="function">Group by Function</option>
                <option value="kit">Group by Status</option>
              </select>
              <Layers size={14} className={`absolute left-2.5 top-3 ${groupBy !== 'none' ? 'text-indigo-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedData).map(([groupTitle, groupPeople]) => (
              <div key={groupTitle}>
                {groupBy !== 'none' && (
                  <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 border-b border-gray-100">
                    {groupTitle} ({groupPeople.length})
                  </div>
                )}
                <div>
                  {groupPeople.map(renderPersonRow)}
                </div>
              </div>
            ))}
            
            {filteredPeople.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No people found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}