import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { getLocalDateString } from '../utils/date';
import { Person, Interaction } from '../types';

export function InteractionLog() {
  const navigate = useNavigate();
  
  // Person Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Form State
  const [type, setType] = useState<Interaction['type']>('call');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !selectedPerson) {
        setIsSearching(true);
        apiFetch(`/api/people/search?q=${encodeURIComponent(searchTerm)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data);
            setShowResults(true);
          })
          .catch(console.error)
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedPerson]);

  const selectPerson = (person: Person) => {
    setSelectedPerson(person);
    setSearchTerm(person.name);
    setShowResults(false);
  };

  const clearSelection = () => {
    setSelectedPerson(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    
    setSubmitting(true);
    try {
      await apiFetch('/api/interactions', {
        method: 'POST',
        body: JSON.stringify({
          person_id: selectedPerson.id,
          type,
          summary,
          date: Math.floor(new Date(date).getTime() / 1000)
        })
      });
      navigate(`/people/${selectedPerson.id}`);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Log Interaction</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Person Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Who is this with?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search person..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  if (selectedPerson) setSelectedPerson(null); // Clear selection if typing
                }}
                disabled={!!selectedPerson}
                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  selectedPerson ? 'bg-blue-50 border-blue-200 text-blue-800 font-medium' : 'border-gray-300'
                }`}
              />
              {selectedPerson && (
                <button 
                  type="button"
                  onClick={clearSelection}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => selectPerson(person)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.company || person.role || 'No details'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
             {showResults && searchResults.length === 0 && searchTerm.length > 1 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                  No people found. <button type="button" onClick={() => navigate('/people')} className="text-blue-600 hover:underline">Add new person?</button>
                </div>
            )}
          </div>

          {/* Interaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
               <div className="flex flex-wrap gap-2">
                 {['call', 'email', 'meeting', 'text', 'other'].map(t => (
                   <button
                     key={t}
                     type="button"
                     onClick={() => setType(t as any)}
                     className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                       type === t 
                         ? 'bg-blue-600 text-white border-blue-600' 
                         : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                     }`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
               <input 
                  type="date" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
               />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
             <textarea 
                placeholder="What did you discuss?"
                required
                value={summary}
                onChange={e => setSummary(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              />
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={!selectedPerson || submitting}
              className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors ${
                (!selectedPerson || submitting) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Saving...' : 'Log Interaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
