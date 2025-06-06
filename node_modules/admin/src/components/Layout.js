import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../config/firebase';
import {
  HomeIcon,
  UserGroupIcon,
  TagIcon,
  FolderIcon,
  ChartPieIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Usuarios', href: '/users', icon: UserGroupIcon },
  { name: 'Items', href: '/items', icon: FolderIcon },
  { name: 'Alquileres', href: '/rentals', icon: FolderIcon },
  { name: 'Categorías', href: '/categories', icon: TagIcon },
  { name: 'Fees', href: '/fees', icon: CreditCardIcon },
  { name: 'Pagos', href: '/payments', icon: ChartPieIcon },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
];

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-primary-600">
            <h1 className="text-2xl font-bold text-white">Alquilalo Admin</h1>
          </div>
          <nav className="mt-5 flex-1 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <header className="h-16 flex-shrink-0 bg-white shadow">
          <div className="flex items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => auth.signOut()}
                className="text-gray-500 hover:text-gray-600"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
