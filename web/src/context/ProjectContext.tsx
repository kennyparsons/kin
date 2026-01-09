import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';

export interface Project {
  id: number;
  name: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProjectId: number;
  setProjectId: (id: number) => void;
  refreshProjects: () => void;
  createProject: (name: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number>(() => {
    const saved = localStorage.getItem('kin_project_id');
    return saved ? parseInt(saved, 10) : 1;
  });

  const refreshProjects = async () => {
    try {
      const res = await apiFetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const setProjectId = (id: number) => {
    setCurrentProjectId(id);
    localStorage.setItem('kin_project_id', id.toString());
    // Force reload to refresh data? Or rely on React Query / SWR / Component updates?
    // Since we don't use React Query yet, most components fetch on mount.
    // A hard reload is the safest way to ensure all components refetch with new ID immediately.
    // Or we can expose this ID and components depend on it.
    window.location.reload(); 
  };

  const createProject = async (name: string) => {
    await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    await refreshProjects();
  };

  return (
    <ProjectContext.Provider value={{ projects, currentProjectId, setProjectId, refreshProjects, createProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
