import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Film, Calendar, Users, Package, MapPin, 
  DollarSign, FileText, MessageSquare, Cloud,
  LogOut, Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Film },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
    { name: 'Crew', href: '/crew', icon: Users },
    { name: 'Equipment', href: '/equipment', icon: Package },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Budget', href: '/budget', icon: DollarSign },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Communication', href: '/communication', icon: MessageSquare },
    { name: 'Weather', href: '/weather', icon: Cloud },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800">
      <div className="flex items-center justify-center h-16 bg-slate-900 border-b border-slate-800">
        <Film className="w-8 h-8 text-red-600" />
        <span className="ml-2 text-xl font-bold text-white">FilmFlow</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};
