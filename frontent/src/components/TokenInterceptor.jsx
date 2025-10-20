import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

const TokenInterceptor = ({ children }) => {
  const { logout, renewToken, setUser } = useAuth();

  const updateUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.user) {
        setUser(decoded.user);
      }
    } catch (error) {
      console.error('Error decoding token for user update:', error);
    }
  };

  useEffect(() => {
    const checkTokenValidity = () => {
      //  console.log('Token checkTokenValidity()');
      const token = localStorage.getItem('jwt');
      
      if (!token) {
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;        
        // If token is expired
        if (timeUntilExpiry <= 0) {
         // console.log('Token expired, logout...');
          logout();          
        }
        // If token is expiring soon (within 5 minutes), renew proactively
        /* turn off auto renew of token 
        else if (timeUntilExpiry < 300) { // 300 seconds = 5 minutes
          console.log('Token expiring soon, attempting proactive renewal...');
          renewToken().then(success => {
            if (success) {
              console.log('Token renewed successfully');
              // Update user info from new token
              const newToken = localStorage.getItem('jwt');
              if (newToken) {
                updateUserFromToken(newToken);
              }
            } else {
              console.log('Proactive token renewal failed, will retry later');
              // Don't logout here - token is still valid, just renewal failed
            }
          });
        }
        */
      } catch (error) {
        console.error('Invalid token, logging out:', error);
        logout();
      }
    };

    // Check token validity every 30 seconds
    const interval = setInterval(checkTokenValidity, 30000);
    
    // Check immediately on mount
    checkTokenValidity();

    return () => clearInterval(interval);
  }, [logout, renewToken, setUser]);

  // Handle visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = localStorage.getItem('jwt');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = decoded.exp - currentTime;
            
            // If token is expired, try to renew
            if (timeUntilExpiry <= 0) {
              logout();              
            }
            // If token is expiring soon (within 5 minutes), renew proactively
            /* turn off auto renew of token 
            else if (timeUntilExpiry < 300) {
              console.log('Token expiring soon after tab focus, attempting renewal...');
              renewToken().then(success => {
                if (success) {
                  // Update user info from new token
                  const newToken = localStorage.getItem('jwt');
                  if (newToken) {
                    updateUserFromToken(newToken);
                  }
                }
                // Don't logout on failure - token is still valid
              });
           
            } else {
              // Token is still valid, just update user info in case it changed
              updateUserFromToken(token);
            }
            */
          } catch (error) {
            logout();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [logout, renewToken, setUser]);

  return children;
};

export default TokenInterceptor;

