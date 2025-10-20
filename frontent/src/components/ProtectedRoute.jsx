import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, Lock } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, requireAuth = true }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-slate-900 font-black text-2xl">S</span>
          </div>
          <p className="text-slate-300 text-lg font-medium">Laddar...</p>
        </div>
      </div>
    );
  }

  // Om autentisering krävs men användaren inte är inloggad
  if (requireAuth && !user) {
    return null; // Login-komponenten kommer att visas istället
  }

  // Om specifik roll krävs men användaren har inte behörighet
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Åtkomst nekad</h2>
            
            <p className="text-slate-300 text-lg mb-6 leading-relaxed">
              Du har inte behörighet att komma åt denna sida. 
              {requiredRole && (
                <span className="block mt-2 text-amber-400 font-medium">
                  Krävs: {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)}-behörighet
                </span>
              )}
            </p>
            
            <div className="bg-slate-700/30 rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center space-x-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">Din nuvarande roll:</span>
              </div>
              <span className="text-amber-400 font-bold text-lg capitalize">
                {user?.role || 'Okänd'}
              </span>
            </div>
            
            <p className="text-slate-400 text-sm mt-6">
              Kontakta din administratör om du behöver utökad åtkomst.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

