import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Send, Calendar, ChevronRight, Loader } from 'lucide-react';
import { Campaign } from '../types';
import { apiFetch } from '../utils/api';
import { format } from 'date-fns';

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await apiFetch('/api/campaigns');
      const data = await res.json();
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
        <button 
          onClick={createCampaign}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          New Campaign
        </button>
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
