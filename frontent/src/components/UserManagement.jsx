import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail,
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { apiCall } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('alla');
  const [statusFilter, setStatusFilter] = useState('alla');

  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'säljare',
    is_active: 1,
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fixed roles array - removed duplicate säljchef entry
  const roles = [
    { value: 'admin', label: 'Administratör', color: 'bg-red-500' },
    { value: 'säljchef', label: 'Säljchef', color: 'bg-green-500' },
    { value: 'projektledare', label: 'Projektledare', color: 'bg-purple-500' },
    { value: 'säljare', label: 'Säljare', color: 'bg-blue-500' }
  ];

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || { label: role, color: 'bg-gray-500' };
  };

  // Load users from API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall('/auth/usersmanger.php');
      if (response.success) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Kunde inte ladda användare');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));                        
    const matchesRole = roleFilter === 'alla' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'alla' || 
                         (statusFilter === 'active' && user.is_active === 1) ||
                         (statusFilter === 'inactive' && user.is_active === 0);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetForm = () => {
    setNewUser({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'säljare',
      is_active: 1,
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    if ( !newUser.email.trim() || !newUser.first_name.trim() || !newUser.last_name.trim()) {
      alert('Vänligen fyll i alla obligatoriska fält (användarnamn/e-post, förnamn, efternamn).');
      return false;
    }

    if (!editingUser && (!newUser.password.trim() || newUser.password.length < 6)) {
      alert('Lösenord måste vara minst 6 tecken långt.');
      return false;
    }

    if (!editingUser && newUser.password !== newUser.confirmPassword) {
      alert('Lösenorden matchar inte.');
      return false;
    }

    if (editingUser && newUser.password && newUser.password !== newUser.confirmPassword) {
      alert('Lösenorden matchar inte.');
      return false;
    }

    return true;
  };

  const handleAddUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone: newUser.phone || null,
        role: newUser.role,
        is_active: newUser.is_active,
        password: newUser.password
      };

      await apiCall('/auth/usersmanger.php', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      // Reload users
      await loadUsers();
      
      // Close modal and reset form
      setShowAddUser(false);
      resetForm();
      
      alert(`Användare ${newUser.first_name} ${newUser.last_name} har skapats!`);
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Kunde inte skapa användare. Försök igen.');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({      
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'säljare',
      is_active: user.is_active,
      password: '',
      confirmPassword: ''
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        id: editingUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone: newUser.phone || null,
        role: newUser.role,
        is_active: newUser.is_active
      };

      // Only include password if it's being changed
      if (newUser.password.trim()) {
        userData.password = newUser.password;
      }

      await apiCall('/auth/usersmanger.php', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      // Reload users
      await loadUsers();
      
      // Close modal and reset form
      setShowAddUser(false);
      setEditingUser(null);
      resetForm();
      
      alert('Användare har uppdaterats!');
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Kunde inte uppdatera användare. Försök igen.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna användare?')) {
      return;
    }

    try {
      await apiCall('/auth/usersmanger.php', {
        method: 'DELETE',
        body: JSON.stringify({ id: userId })
      });

      // Reload users
      await loadUsers();
      
     // alert('Användare har tagits bort!');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kunde inte ta bort användare. Försök igen.');
    }
  };

  const toggleUserStatus = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const updatedUser = {
        id: userId,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active === 1 ? 0 : 1
      };

      await apiCall('/auth/usersmanger.php', {
        method: 'PUT',
        body: JSON.stringify(updatedUser)
      });

      // Reload users
      await loadUsers();
      
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Kunde inte ändra användarstatus. Försök igen.');
    }
  };

  const sendWelcomeEmail = (user) => {
    alert(`Välkomst-e-post skickad till ${user.email}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Laddar användare...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={loadUsers}
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 relative">
          {/* Drawer/Menu Button */}
        
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Användarhantering
              </h1>
              <p className="text-slate-400">{users.length} användare totalt</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setShowAddUser(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg w-full lg:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Bjud in användare</span>
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Sök användare..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="alla">Alla roller</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="alla">Alla statusar</option>
              <option value="active">Aktiva</option>
              <option value="inactive">Inaktiva</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredUsers.map(user => {
            const roleInfo = getRoleInfo(user.role);
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            const displayName = fullName || 'Okänd användare';
            
            return (
              <div key={user.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-200 group">
                {/* User Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-sm sm:text-base truncate">{displayName}</h3>
                      <p className="text-slate-400 text-xs sm:text-sm truncate">{user.email}</p>
                      
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {user.is_active === 1 ? 
                        <ToggleRight className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" /> : 
                        <ToggleLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
                      }
                    </button>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${roleInfo.color}`}></div>
                    <span className="text-slate-300 text-xs sm:text-sm font-medium">{roleInfo.label}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_active === 1
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.is_active === 1 ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                {/* Last Login */}
                <div className="flex items-center space-x-2 mb-4 text-slate-400 text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Senast inloggad: {user.last_login || 'Aldrig'}</span>
                </div>

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-center space-x-2 mb-4 text-slate-400 text-xs sm:text-sm">
                    <span className="truncate">Telefon: {user.phone}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="w-full sm:flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Redigera</span>
                  </button>
                  
                  <button
                    onClick={() => sendWelcomeEmail(user)}
                    className="w-full sm:flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>E-post</span>
                  </button>
                  
                  <button style={{ display: 'none' }}
                    onClick={() => handleDeleteUser(user.id)}
                    className="w-full sm:w-auto bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                {editingUser ? 'Redigera användare' : 'Bjud in ny användare'}
              </h2>
              
              <div className="space-y-4">
                

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">E-post *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                    placeholder="namn@solpulsen.se"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Förnamn *</label>
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                      placeholder="Förnamn"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">Efternamn *</label>
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                      placeholder="Efternamn"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                    placeholder="Telefonnummer"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Roll</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Status</label>
                  <select
                    value={newUser.is_active}
                    onChange={(e) => setNewUser({...newUser, is_active: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={1}>Aktiv</option>
                    <option value={0}>Inaktiv</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Lösenord {!editingUser && '*'}
                    {editingUser && <span className="text-slate-500 text-xs">(lämna tomt för att behålla nuvarande)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={editingUser ? "Nytt lösenord" : "Ange lösenord"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Bekräfta lösenord {!editingUser && '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={newUser.confirmPassword}
                      onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder={editingUser ? "Bekräfta nytt lösenord" : "Bekräfta lösenord"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddUser(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all"
                >
                  {editingUser ? 'Uppdatera' : 'Bjud in'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;