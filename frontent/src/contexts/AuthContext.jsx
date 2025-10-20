import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Base URL - adjust based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://crm.solpulsen.se/php' : import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tokenRenewalTimeout, setTokenRenewalTimeout] = useState(null);

  // Check if token is about to expire (within 5 minutes)
  const isTokenExpiringSoon = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      return timeUntilExpiry < 300; // 5 minutes
    } catch {
      return true; // If we can't decode, assume it needs renewal
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Renew token
  const renewToken = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/renewtoken.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Token renewal failed');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        if (data.user) {
          setUser(data.user);
        }
        scheduleTokenRenewal(data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token renewal error:', error);
      return false;
    }
  };

  // Schedule automatic token renewal
  const scheduleTokenRenewal = useCallback((token) => {
    if (tokenRenewalTimeout) {
      clearTimeout(tokenRenewalTimeout);
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // Schedule renewal 5 minutes before expiry
      const renewalTime = Math.max(0, (timeUntilExpiry - 300) * 1000);
      
      const timeout = setTimeout(async () => {
        const success = await renewToken();
        if (!success) {
          // If renewal fails, log out user
          logout();
        }
      }, renewalTime);
      
      setTokenRenewalTimeout(timeout);
    } catch (error) {
      console.error('Error scheduling token renewal:', error);
    }
  }, [tokenRenewalTimeout]);

  // Enhanced API call with automatic token renewal
  const apiCall = async (endpoint, options = {}) => {
    try {
      let token = localStorage.getItem('jwt');
      
      if (!token) {
        throw new Error('No token available');
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        const renewed = await renewToken();
        if (!renewed) {
          logout();
          throw new Error('Token expired and renewal failed');
        }
        token = localStorage.getItem('jwt');
      }
      // Check if token is expiring soon and renew proactively
      else if (isTokenExpiringSoon(token)) {
        renewToken(); // Don't wait for this, continue with current token
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        headers,
        ...options,
      });

      if (response.status === 401) {
        // Token might be invalid, try to renew once
        const renewed = await renewToken();
        if (renewed) {
          // Retry the request with new token
          const newToken = localStorage.getItem('jwt');
          const retryResponse = await fetch(`${API_BASE_URL}/${endpoint}`, {
            ...options,
            headers: {
              ...headers,
              'Authorization': `Bearer ${newToken}`,
            },
          });
          
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `API call failed: ${retryResponse.status}`);
          }
          
          return await retryResponse.json();
        } else {
          logout();
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Check if token is completely expired
    if (isTokenExpired(token)) {
      const renewed = await renewToken();
      if (!renewed) {
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      // Decode JWT token locally to get user info - no API call needed!
      const currentToken = localStorage.getItem('jwt');
      const decoded = jwtDecode(currentToken);
      
      if (decoded.user) {
        setUser(decoded.user);
        scheduleTokenRenewal(currentToken);
      } else {
        throw new Error('Invalid token structure - missing user data');
      }
    } catch (error) {     
      setUser(null);
      localStorage.removeItem('jwt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup timeout on unmount
    return () => {
      if (tokenRenewalTimeout) {
        clearTimeout(tokenRenewalTimeout);
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Save token
        localStorage.setItem('jwt', data.token);
        
        // Decode token to get user info locally
        try {
          const decoded = jwtDecode(data.token);
          if (decoded.user) {
            setUser(decoded.user);
          }
        } catch (decodeError) {
          // console.error('Error decoding token:', decodeError);
          throw new Error('Invalid token received');
        }
        
        // Schedule automatic renewal
        scheduleTokenRenewal(data.token);
        
        return { success: true };
      } else {
        throw new Error(data.message || 'Inloggning misslyckades');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('jwt');
    setUser(null);
    /*
    try {
      await apiCall('/logout.php', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token renewal timeout
      if (tokenRenewalTimeout) {
        clearTimeout(tokenRenewalTimeout);
        setTokenRenewalTimeout(null);
      }
      
      localStorage.removeItem('jwt');
      setUser(null);
    }
    */
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await apiCall('/profile.php', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (response.user) {
        setUser(response.user);
        return { success: true };
      }
      
      return { success: false, error: 'Uppdatering misslyckades' };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/change-password.php', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/reset-password.php', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced role-based permissions - FIXED VERSION
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    // Handle array of roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    // Handle specific permission requirements
    if (requiredRole === 'user-management') {
      return user.role === 'admin' || user.role === 'säljchef';
    }
    
    // Updated role hierarchy to include all roles properly
    const roleHierarchy = {
      'admin': 4,          // Highest level
      'säljchef': 3,       // Sales manager level
      'projektledare': 2,  // Project leader level
      'säljare': 1         // Sales person level
    };
    
    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  // Updated permission functions
  const canAccessUserManagement = () => {
    return user && (user.role === 'admin' || user.role === 'säljchef');
  };

  const canAccessAllData = () => hasPermission('admin');
  const canAccessAssignedData = () => hasPermission('projektledare');

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    apiCall, 
    login,
    logout,
    setUser,
    updateUser,
    updateProfile,
    changePassword,
    resetPassword,
    renewToken,
    loading,
    error,
    setError,
    hasPermission,
    canAccessUserManagement,
    canAccessAllData,
    canAccessAssignedData,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;