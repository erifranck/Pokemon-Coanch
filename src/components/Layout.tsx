import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-yellow-400">PokeCoach Pro</h1>
          <nav className="flex space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Team Builder
            </NavLink>
            <NavLink 
              to="/synergy" 
              className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Type Synergy
            </NavLink>
            <NavLink 
              to="/threats" 
              className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Threat Matrix
            </NavLink>
            <NavLink 
              to="/simulator" 
              className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Live Simulator
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
