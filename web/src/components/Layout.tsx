import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Home, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navClass = (path: string) => 
    `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
      location.pathname === path 
        ? 'bg-blue-100 text-blue-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen flex flex-col">
        <div className="flex items-center space-x-2 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
          <span className="text-xl font-bold text-gray-800">Kin</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link to="/" className={navClass('/')}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/people" className={navClass('/people')}>
            <Users size={20} />
            <span>People</span>
          </Link>
        </nav>

        <div className="pt-4 border-t border-gray-100">
           <div className="px-2 mb-2">
             <p className="text-xs text-gray-500 font-medium truncate" title={user?.email}>
               {user?.email}
             </p>
           </div>
           <button 
             onClick={logout}
             className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
           >
             <LogOut size={20} />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}