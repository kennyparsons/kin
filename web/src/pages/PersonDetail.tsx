import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Users, MessageSquare, Clock, CheckCircle, Edit2, X, Save } from 'lucide-react';
import { Person, Interaction } from '../types';
import { format } from 'date-fns';
import { apiFetch } from '../utils/api';

export function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction Form State
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionType, setInteractionType] = useState<Interaction['type']>('call');
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionDate, setInteractionDate] = useState(new Date().toISOString().split('T')[0]);

  // Editing Interaction State
  const [editingInteractionId, setEditingInteractionId] = useState<number | null>(null);
  const [editInteractionType, setEditInteractionType] = useState<Interaction['type']>('call');
  const [editInteractionSummary, setEditInteractionSummary] = useState('');
  const [editInteractionDate, setEditInteractionDate] = useState<string>('');

  // Reminder Form State
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const fetchPerson = () => {
    apiFetch(`/api/people/${id}`)
      .then(res => res.json())
      .then(data => {
        setPerson(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (id) fetchPerson();
  }, [id]);

  const handleInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    await apiFetch('/api/interactions', {
      method: 'POST',
      body: JSON.stringify({
        person_id: id,
        type: interactionType,
        summary: interactionSummary,
        date: interactionDate ? Math.floor(new Date(interactionDate).getTime() / 1000) : Math.floor(Date.now() / 1000)
      })
    });
    
    setShowInteractionForm(false);
    setInteractionSummary('');
    setInteractionDate(new Date().toISOString().split('T')[0]); // Reset to today
    fetchPerson();
  };

  const startEditingInteraction = (interaction: Interaction) => {
    setEditingInteractionId(interaction.id);
    setEditInteractionType(interaction.type);
    setEditInteractionSummary(interaction.summary || '');
    // Convert timestamp to YYYY-MM-DD for date input (simplified for now, ideally datetime-local)
    setEditInteractionDate(new Date(interaction.date * 1000).toISOString().split('T')[0]);
  };

  const cancelEditingInteraction = () => {
    setEditingInteractionId(null);
    setEditInteractionSummary('');
  };

  const handleEditInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInteractionId) return;

    await apiFetch(`/api/interactions/${editingInteractionId}`, {
      method: 'PUT',
      body: JSON.stringify({
        type: editInteractionType,
        summary: editInteractionSummary,
        date: Math.floor(new Date(editInteractionDate).getTime() / 1000)
      })
    });

    setEditingInteractionId(null);
    fetchPerson();
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    await apiFetch('/api/reminders', {
      method: 'POST',
      body: JSON.stringify({
        person_id: id,
        title: reminderTitle,
        due_date: reminderDate ? Math.floor(new Date(reminderDate).getTime() / 1000) : null
      })
    });
    
    setShowReminderForm(false);
    setReminderTitle('');
    setReminderDate('');
    fetchPerson();
  };

  const toggleReminderStatus = async (reminderId: number, currentStatus: string) => {
    await apiFetch(`/api/reminders/${reminderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: currentStatus === 'pending' ? 'done' : 'pending'
      })
    });
    fetchPerson();
  };

  if (loading) return <div>Loading...</div>;
  if (!person) return <div>Person not found</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/people')} className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft size={20} className="mr-1" /> Back to List
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{person.name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              {person.role && <span className="flex items-center"><Users size={16} className="mr-1"/> {person.role}</span>}
              {person.company && <span className="flex items-center">@ {person.company}</span>}
              {person.manager_name && <span className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded">Manager: {person.manager_name}</span>}
            </div>
          </div>
          <button 
            onClick={() => navigate(`/people/${person.id}/edit`)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactions Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Interaction History</h2>
              <button 
                onClick={() => setShowInteractionForm(!showInteractionForm)}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                + Log Interaction
              </button>
            </div>

            {showInteractionForm && (
              <form onSubmit={handleInteractionSubmit} className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <div className="mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                    <div className="flex space-x-2">
                      {['call', 'email', 'meeting', 'text', 'other'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInteractionType(type as any)}
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                            interactionType === type 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="date"
                      required
                      value={interactionDate}
                      onChange={e => setInteractionDate(e.target.value)}
                      className="text-xs border rounded p-1.5 outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <textarea 
                    placeholder="What did you talk about?"
                    required
                    value={interactionSummary}
                    onChange={e => setInteractionSummary(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                    Log it
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gray-100">
              {person.interactions?.map(interaction => (
                <div key={interaction.id} className="relative group">
                  {editingInteractionId === interaction.id ? (
                    <form onSubmit={handleEditInteractionSubmit} className="ml-12 bg-gray-50 p-4 rounded-lg border border-blue-200 shadow-sm relative z-10">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex space-x-2">
                            {['call', 'email', 'meeting', 'text', 'other'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEditInteractionType(type as any)}
                                className={`px-2 py-0.5 rounded text-xs font-medium capitalize transition-colors ${
                                  editInteractionType === type 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                          <input 
                            type="date" 
                            required
                            value={editInteractionDate}
                            onChange={e => setEditInteractionDate(e.target.value)}
                            className="text-xs border rounded p-1"
                          />
                      </div>
                      <textarea 
                        required
                        value={editInteractionSummary}
                        onChange={e => setEditInteractionSummary(e.target.value)}
                        className="w-full rounded border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={cancelEditingInteraction} className="p-1 text-gray-500 hover:text-gray-700">
                           <X size={16} />
                        </button>
                        <button type="submit" className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                           <Save size={14} /> <span>Save</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start">
                      <div className={`absolute left-0 p-2 rounded-full border-2 border-white ${
                        interaction.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                        interaction.type === 'call' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {interaction.type === 'call' ? <Phone size={14} /> : 
                         interaction.type === 'email' ? <Mail size={14} /> : 
                         interaction.type === 'meeting' ? <Users size={14} /> : 
                         <MessageSquare size={14} />}
                      </div>
                      <div className="ml-12 w-full group/item">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{interaction.type}</span>
                          <div className="flex items-center space-x-2">
                             <span className="text-xs text-gray-400">{format(new Date(interaction.date * 1000), 'MMM d, yyyy')}</span>
                             <button 
                              onClick={() => startEditingInteraction(interaction)}
                              className="text-gray-300 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity"
                             >
                               <Edit2 size={12} />
                             </button>
                          </div>
                        </div>
                        <p className="text-gray-800 mt-1 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {interaction.summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!person.interactions || person.interactions.length === 0) && (
                <p className="text-gray-400 text-center py-4 text-sm ml-10">No interactions logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Reminders & Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Reminders</h2>
              <button 
                onClick={() => setShowReminderForm(!showReminderForm)}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <PlusIcon />
              </button>
            </div>

            {showReminderForm && (
              <form onSubmit={handleReminderSubmit} className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input 
                  type="text" 
                  placeholder="Follow up about..." 
                  required
                  value={reminderTitle}
                  onChange={e => setReminderTitle(e.target.value)}
                  className="w-full rounded border-gray-300 border p-1.5 text-sm mb-2"
                />
                <input 
                  type="date" 
                  value={reminderDate}
                  onChange={e => setReminderDate(e.target.value)}
                  className="w-full rounded border-gray-300 border p-1.5 text-sm mb-2"
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700">Add Reminder</button>
              </form>
            )}

            <div className="space-y-3">
              {person.reminders?.map(reminder => (
                <div key={reminder.id} className="flex items-start space-x-3 group">
                  <button 
                    onClick={() => toggleReminderStatus(reminder.id, reminder.status)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      reminder.status === 'done' 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {reminder.status === 'done' && <CheckCircle size={12} />}
                  </button>
                  <div className={`${reminder.status === 'done' ? 'opacity-50 line-through' : ''}`}>
                    <p className="text-sm font-medium text-gray-800">{reminder.title}</p>
                    {reminder.due_date && (
                      <p className="text-xs text-red-500 flex items-center mt-0.5">
                        <Clock size={10} className="mr-1" />
                        {format(new Date(reminder.due_date * 1000), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!person.reminders || person.reminders.length === 0) && (
                <p className="text-gray-400 text-sm">No active reminders.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Metadata</h2>
            <dl className="space-y-3 text-sm">
              {person.email && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 font-medium truncate ml-2">{person.email}</dd>
                </div>
              )}
              {person.tags && (
                <div>
                  <dt className="text-gray-500 mb-1">Tags</dt>
                  <dd className="flex flex-wrap gap-2">
                    {person.tags.split(',').map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs border border-gray-200">
                        {tag.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {/* Parse and display extra metadata */}
              {person.metadata && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  {Object.entries(typeof person.metadata === 'string' ? JSON.parse(person.metadata) : person.metadata).map(([key, value]) => (
                     <div key={key} className="flex justify-between py-1">
                      <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-gray-900 font-medium ml-2">{String(value)}</dd>
                    </div>
                  ))}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}