import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-gray-300 select-none">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-500 mt-2">The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-750 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-6 py-3 bg-primary-650 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;