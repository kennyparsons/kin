import React from 'react';
import { NavLink } from 'react-router-dom';
import { Folder, Users } from 'lucide-react';

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
      isActive 
        ? 'bg-blue-50 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <nav className="w-full md:w-64 flex flex-col space-y-1">
        <h2 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Settings</h2>
        <NavLink to="/settings/projects" className={linkClass}>
          <Folder size={18} />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/settings/users" className={linkClass}>
          <Users size={18} />
          <span>Users</span>
        </NavLink>
      </nav>
      
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
