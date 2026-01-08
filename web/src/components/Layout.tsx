import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Home, LogOut, Menu, X, Bell, MessageSquarePlus, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const navClass = (path: string) => 
    `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
      location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
        ? 'bg-blue-100 text-blue-700 font-medium' 
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
          <span className="text-xl font-bold text-gray-800">Kin</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-screen transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center space-x-2 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
          <span className="text-xl font-bold text-gray-800">Kin</span>
        </div>
        <nav className="space-y-1 flex-1 mt-4 md:mt-0">
          <Link to="/" className={navClass('/')} onClick={closeSidebar}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/reminders" className={navClass('/reminders')} onClick={closeSidebar}>
            <Bell size={20} />
            <span>Reminders</span>
          </Link>
          <Link to="/interactions" className={navClass('/interactions')} onClick={closeSidebar}>
            <MessageSquarePlus size={20} />
            <span>Log Interaction</span>
          </Link>
          <Link to="/campaigns" className={navClass('/campaigns')} onClick={closeSidebar}>
            <Send size={20} />
            <span>Campaigns</span>
          </Link>
          <Link to="/people" className={navClass('/people')} onClick={closeSidebar}>
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
             onClick={() => {
               closeSidebar();
               logout();
             }}
             className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
           >
             <LogOut size={20} />
             <span>Sign Out</span>
           </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}