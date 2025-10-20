import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Clock,
  Menu,
  X,
  Settings,
  UserCog,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';


import { AuthProvider, useAuth } from './contexts/AuthContext';
import TokenInterceptor from './components/TokenInterceptor';

import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PWAUpdateNotification from './components/PWAUpdateNotification';
const UserManagement = lazy(() => import('./components/UserManagement'));
//import { default as SettingsPage } from './components/UserSettings';
import UserSettings from "./components/UserSettings";


import Footer from './components/Footer';
const TimeTracking = lazy(() => import('./components/TimeTracking'));

const EgenkontrollForm = lazy(() => import('./components/El-EgenkontrollForm'));
const InstallForm = lazy(() => import('./components/El-Installation'));

import './styles/animations.css';
import './App.css';


// Navigation Component with Submenus
const Navigation = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout, hasPermission, canAccessUserManagement } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Organize navigation items into categories with submenus
  const navSections = [
    {
      title: 'Huvudmeny',
      items: [
        { path: '/', label: 'EgenkontrollForm', icon: BarChart3 },
        { path: '/installform', label: 'InstallForm', icon: CalendarIcon }
        
      ]
    },       
    {
      title: 'Administration',
      items: [
        { path: '/time-tracking', label: 'Tidrapportering', icon: Clock, requiredRole: ['admin', 'säljchef'] },
        { 
          path: '/user-management', 
          label: 'Användarhantering', 
          icon: UserCog,
          customPermissionCheck: () => canAccessUserManagement()
        },
        { path: '/settings', label: 'Inställningar', icon: Settings }
      ]
    }
  ];

  const toggleSubmenu = (sectionTitle) => {
    setExpandedMenus(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const isPathActive = (path) => {
    return location.pathname === path;
  };

  const isSectionActive = (items) => {
    return items.some(item => location.pathname === item.path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-slate-800/90 backdrop-blur-sm rounded-xl text-white shadow-lg hover:bg-slate-700 transition-all duration-200"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 border-r border-slate-700/50 shadow-2xl shadow-black/20`}>
        
        {/* Logo */}
        <div className="flex items-center p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
          <div className="w-12 h-12 flex items-center justify-center mr-4">
            <img 
              src="/solpulsen_logo-0.png" 
              alt="SolPulsen" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent tracking-tight">
            SolPulsen
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="mt-6 px-4 space-y-4 flex-1 overflow-y-auto pb-20">
          {navSections.map((section) => {
            const isExpanded = expandedMenus[section.title] !== false; // Default to expanded
            const hasActiveItem = isSectionActive(section.items);

            return (
              <div key={section.title} className="space-y-2">
                {/* Section Header */}
                <button
                  onClick={() => toggleSubmenu(section.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-400 hover:text-slate-200 transition-colors duration-200 group ${
                    hasActiveItem ? 'text-amber-400' : ''
                  }`}
                >
                  <span className="uppercase tracking-wider text-xs">{section.title}</span>
                  <div className="transform transition-transform duration-200">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {/* Section Items */}
                <div className={`space-y-1 transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isPathActive(item.path);
                    
                    // Updated permission checking logic
                    let hasAccess = true;
                    if (item.customPermissionCheck) {
                      hasAccess = item.customPermissionCheck();
                    } else if (item.requiredRole && user) {
                      hasAccess = hasPermission(item.requiredRole);
                    }
                    
                    if (!hasAccess) {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ml-2 ${
                          isActive 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 scale-[1.02]' 
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-[1.02] hover:translate-x-1'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <Icon size={18} className={`mr-3 transition-transform duration-300 group-hover:scale-110 ${
                          isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-white'
                        }`} />
                        
                        <span className="relative z-10 font-semibold">{item.label}</span>
                        
                        {isActive && (
                          <div className="absolute right-2 w-2 h-2 bg-slate-900 rounded-full animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700/50 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="text-white text-sm font-semibold">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-slate-400 text-xs">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              title="Logga ut"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
      <div className="mt-4 text-slate-400 text-sm font-medium">Laddar...</div>
    </div>
  </div>
);

// Main App Content
const AppContent = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Offentliga ruter som inte kräver autentisering
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Om det är en offentlig rutt, visa den utan autentisering
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-slate-900">
        <TokenInterceptor>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>              
              <Route path="/login" element={<Login />} />
            </Routes>
          </Suspense>
          <PWAUpdateNotification />
        </TokenInterceptor>
      </div>
    );
  }

  // För alla andra ruter, kräv autentisering
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <TokenInterceptor>
        <div className="">
          <Navigation isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-80">
            
            
            
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<EgenkontrollForm />} />
                      <Route path="/time-tracking" element={<ProtectedRoute requiredRole={['admin', 'säljchef']}><TimeTracking /></ProtectedRoute>} />                                            
                      <Route path="/user-management" element={<ProtectedRoute requiredRole={['admin', 'säljchef']}><UserManagement /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
                      <Route path="/egenkontrollform" element={<ProtectedRoute><EgenkontrollForm /></ProtectedRoute>} />
                      <Route path="/installform" element={<ProtectedRoute><InstallForm /></ProtectedRoute>} />
                    </Routes>
                  </Suspense>
            
            
            <Footer />
          </div>
        </div>
        
        <PWAUpdateNotification />
      </TokenInterceptor>
    </div>
  );
};

// Main App with Router and Auth Provider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;