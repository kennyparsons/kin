import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Send, Calendar, ChevronRight, Loader } from 'lucide-react';
import { Campaign } from '../types';
import { apiFetch } from '../utils/api';
import { format } from 'date-fns';

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [showCompleted]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const status = showCompleted ? 'all' : 'open';
      const res = await apiFetch(`/api/campaigns?status=${status}`);
      const data = await res.json();
      // Client-side filter if 'all' returns everything, but we want 'completed' specifically? 
      // The API returns everything if 'all'.
      // If we want just completed, we filter. If we want open, we filter.
      // API currently: status='all' -> ALL. status='open' -> OPEN.
      // So if showCompleted is true, we fetch ALL.
      // But maybe we want to see Completed separately?
      // The requirement: "Only show by default open... option to see completed".
      // Usually this means "Show Open" OR "Show Completed". Or "Show All".
      // Let's filter on client side if we fetch 'all', or just fetch 'all' and sort?
      // I'll stick to: Toggle ON -> Fetch ALL (showing mixed). Toggle OFF -> Fetch OPEN.
      // Actually, if I fetch ALL, I can separate them visually.
      // But let's keep it simple: "Show Completed" -> Fetch 'completed' or 'all'? 
      // Let's adjust API logic slightly? No, client logic is fine.
      // Let's just fetch ALL if toggled, and OPEN if not.
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    const title = prompt('Enter campaign title:');
    if (!title) return;

    try {
      const res = await apiFetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      navigate(`/campaigns/${data.id}`);
    } catch (err) {
      alert('Failed to create campaign');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Outreach Campaigns</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-600 select-none">
            <input 
              type="checkbox" 
              checked={showCompleted}
              onChange={e => setShowCompleted(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300"
            />
            <span>Show All (History)</span>
          </label>
          <button 
            onClick={createCampaign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} className="mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader className="animate-spin mx-auto mb-4" />
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Send size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No campaigns yet</p>
            <p className="text-sm">Create your first campaign to reach out to multiple contacts.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {campaigns.map(campaign => (
              <Link 
                key={campaign.id} 
                to={`/campaigns/${campaign.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {campaign.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Created {format(new Date(campaign.created_at * 1000), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-gray-500 transition-colors" size={24} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
