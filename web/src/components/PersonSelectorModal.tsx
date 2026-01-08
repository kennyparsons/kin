import { useEffect, useState, useMemo } from 'react';
import { Search, Building, Briefcase, X, MapPin, Check } from 'lucide-react';
import { Person } from '../types';
import { apiFetch } from '../utils/api';

interface PersonSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedPeople: Person[]) => void;
  title?: string;
}

export function PersonSelectorModal({ isOpen, onClose, onSelect, title = "Select People" }: PersonSelectorModalProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Filters
  const [filterCompany, setFilterCompany] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      apiFetch('/api/people')
        .then(res => res.json())
        .then(setPeople)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

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
      const matchesCompany = !filterCompany || p.company === filterCompany;
      const matchesFunction = !filterFunction || p.function === filterFunction;
      const matchesLocation = !filterLocation || p.location === filterLocation;
      
      return matchesSearch && matchesCompany && matchesFunction && matchesLocation;
    });
  }, [people, search, filterCompany, filterFunction, filterLocation]);

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAllFiltered = () => {
    const newSet = new Set(selectedIds);
    filteredPeople.forEach(p => newSet.add(p.id));
    setSelectedIds(newSet);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const selected = people.filter(p => selectedIds.has(p.id));
    onSelect(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search people..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select 
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
              className={`px-3 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm ${filterCompany ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
            >
              <option value="">All Companies</option>
              {uniqueCompanies.sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterFunction}
              onChange={e => setFilterFunction(e.target.value)}
              className={`px-3 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm ${filterFunction ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
            >
              <option value="">All Functions</option>
              {uniqueFunctions.sort().map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <select 
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className={`px-3 py-2 rounded-lg border appearance-none outline-none cursor-pointer text-sm ${filterLocation ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}
            >
              <option value="">All Locations</option>
              {uniqueLocations.sort().map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Selection Bar */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex justify-between items-center text-sm">
          <div className="text-blue-800 font-medium">
            {selectedIds.size} people selected
          </div>
          <div className="space-x-3">
            <button 
              onClick={selectAllFiltered} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Select All {filteredPeople.length} Matching
            </button>
            {selectedIds.size > 0 && (
              <button 
                onClick={clearSelection} 
                className="text-gray-500 hover:text-gray-700 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading contacts...</div>
          ) : filteredPeople.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No people found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPeople.map(person => (
                <div 
                  key={person.id} 
                  onClick={() => toggleSelection(person.id)}
                  className={`p-4 flex items-center cursor-pointer transition-colors ${selectedIds.has(person.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center flex-shrink-0 ${selectedIds.has(person.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                    {selectedIds.has(person.id) && <Check size={14} />}
                  </div>
                  
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold relative flex-shrink-0 mr-4">
                    {person.name.charAt(0)}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">{person.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      {person.company && <span className="flex items-center truncate"><Building size={12} className="mr-1" /> {person.company}</span>}
                      {person.function && <span className="flex items-center truncate"><Briefcase size={12} className="mr-1" /> {person.function}</span>}
                      {person.location && <span className="flex items-center truncate"><MapPin size={12} className="mr-1" /> {person.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add {selectedIds.size} People
          </button>
        </div>
      </div>
    </div>
  );
}
