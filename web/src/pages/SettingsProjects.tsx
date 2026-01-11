import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../utils/api';
import { Edit2, Trash2, Check, X } from 'lucide-react';

export function SettingsProjects() {
  const { projects, currentProjectId, refreshProjects } = useProject();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (project: { id: number, name: string }) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveProject = async (id: number) => {
    try {
      await apiFetch(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName })
      });
      setEditingId(null);
      refreshProjects();
    } catch (err) {
      alert('Failed to update project');
    }
  };

  const deleteProject = async (id: number) => {
    if (projects.length <= 1) {
      alert("You cannot delete the only project.");
      return;
    }
    if (id === currentProjectId) {
      alert("You cannot delete the active project. Switch to another project first.");
      return;
    }
    if (!confirm("Are you sure? This will delete ALL data (people, interactions, campaigns) associated with this project.")) return;

    try {
      await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
      refreshProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your workspaces.</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {projects.map(project => (
            <div key={project.id} className="p-4 flex items-center justify-between group">
              <div className="flex-1">
                {editingId === project.id ? (
                  <div className="flex items-center space-x-2">
                    <input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="border border-blue-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveProject(project.id)} className="text-green-600 hover:text-green-700"><Check size={18} /></button>
                    <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{project.name}</span>
                    {project.id === currentProjectId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Active</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {editingId !== project.id && (
                  <>
                    <button 
                      onClick={() => startEditing(project)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={16} />
                    </button>
                    {projects.length > 1 && project.id !== currentProjectId && (
                      <button 
                        onClick={() => deleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
