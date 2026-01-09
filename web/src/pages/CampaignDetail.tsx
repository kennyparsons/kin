import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus, Mail, CheckCircle, X, ListPlus, RefreshCw, Trash2 } from 'lucide-react';
import { Campaign, Person, CampaignRecipient } from '../types';
import { apiFetch } from '../utils/api';
import { format } from 'date-fns';
import { PersonSelectorModal } from '../components/PersonSelectorModal';
import { marked } from 'marked';

export function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Selector Modal
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await apiFetch(`/api/campaigns/${id}`);
      const data = await res.json();
      setCampaign(data);
      setTitle(data.title);
      setSubject(data.subject_template || '');
      setBody(data.body_template || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          subject_template: subject,
          body_template: body
        })
      });
      alert('Campaign saved');
    } catch (err) {
      alert('Failed to save campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (status: 'open' | 'completed') => {
    try {
      await apiFetch(`/api/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchCampaign();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
      navigate('/campaigns');
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  const addRecipients = async (selectedPeople: Person[]) => {
    const ids = selectedPeople.map(p => p.id);
    if (ids.length === 0) return;

    try {
      await apiFetch(`/api/campaigns/${id}/recipients`, {
        method: 'POST',
        body: JSON.stringify({ person_ids: ids })
      });
      fetchCampaign();
    } catch (err) {
      alert('Failed to add recipients');
    }
  };

  const removeRecipient = async (personId: number) => {
    if (!confirm('Remove this recipient?')) return;
    try {
      await apiFetch(`/api/campaigns/${id}/recipients/${personId}`, {
        method: 'DELETE'
      });
      fetchCampaign();
    } catch (err) {
      alert('Failed to remove recipient');
    }
  };

  const draftEmail = async (recipient: CampaignRecipient) => {
    if (!recipient.email) {
      alert('No email for this contact');
      return;
    }

    const firstName = (recipient.name || '').trim().split(/\s+/)[0];
    const personalizedMarkdown = body.replace(/{name}/g, firstName);

    // 1. Generate Gmail Link with Raw Markdown in the body
    // This allows browser plugins to convert MD to Rich Text automatically.
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(personalizedMarkdown)}`;
    
    window.open(gmailUrl, '_blank');

    // 2. Log interaction & Update status in Kin
    try {
      await apiFetch(`/api/campaigns/${id}/send/${recipient.person_id}`, {
        method: 'POST'
      });
      
      setCampaign(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recipients: prev.recipients?.map(r => 
            r.person_id === recipient.person_id ? { ...r, status: 'sent', sent_at: Math.floor(Date.now() / 1000) } : r
          )
        };
      });
    } catch (err) {
      console.error('Failed to log interaction', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!campaign) return <div className="p-8 text-center text-red-500">Campaign not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate('/campaigns')} className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} className="mr-1" /> Back to Campaigns
          </button>
          <div className="flex space-x-2">
            {campaign.status === 'open' ? (
              <button 
                onClick={() => handleStatus('completed')}
                className="flex items-center text-gray-600 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                title="Mark as Completed"
              >
                <CheckCircle size={20} className="mr-2" />
                Complete
              </button>
            ) : (
              <button 
                onClick={() => handleStatus('open')}
                className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                title="Reopen"
              >
                <RefreshCw size={20} className="mr-2" />
                Reopen
              </button>
            )}
            <button 
              onClick={handleDelete}
              className="flex items-center text-gray-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Campaign"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <input 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`text-3xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full mr-4 transition-all ${campaign.status === 'completed' ? 'text-gray-400 line-through decoration-2' : 'text-gray-900'}`}
          />
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Template Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Email Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Catching up!"
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Body
                    <span className="text-xs text-gray-400 font-normal italic ml-2">Use {'{name}'} for personalization</span>
                  </label>
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('write')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === 'write' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
                
                {activeTab === 'write' ? (
                  <textarea 
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Hi {name},..."
                    rows={12}
                    className="w-full rounded-lg border-gray-300 border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono"
                  />
                ) : (
                  <div 
                    className="w-full rounded-lg border-gray-300 border p-4 text-sm min-h-[300px] max-h-[500px] overflow-y-auto prose prose-sm max-w-none bg-white"
                    dangerouslySetInnerHTML={{ __html: marked.parse(body.replace(/{name}/g, 'John Doe')) as string }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recipient Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <UserPlus className="mr-2 text-blue-600" size={20} />
              Recipients
            </h2>
            <button 
              onClick={() => setShowSelector(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center font-medium"
            >
              <ListPlus size={20} className="mr-2" />
              Add From List...
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recipients ({campaign.recipients?.length || 0})</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
              {campaign.recipients?.map(recipient => (
                <div key={recipient.id} className="p-4 flex items-center justify-between group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
                    <p className="text-xs text-gray-500 truncate">{recipient.email}</p>
                    {recipient.status === 'sent' && (
                      <p className="text-[10px] text-green-600 mt-0.5 flex items-center">
                        <CheckCircle size={10} className="mr-1" />
                        Sent {format(new Date((recipient.sent_at || 0) * 1000), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => draftEmail(recipient)}
                      title="Draft Email"
                      className={`p-2 rounded-full transition-colors ${
                        recipient.status === 'sent' 
                          ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <Mail size={16} />
                    </button>
                    <button 
                      onClick={() => removeRecipient(recipient.person_id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {(!campaign.recipients || campaign.recipients.length === 0) && (
                <p className="p-8 text-center text-gray-400 text-sm italic">No recipients added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PersonSelectorModal 
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={addRecipients}
      />
    </div>
  );
}