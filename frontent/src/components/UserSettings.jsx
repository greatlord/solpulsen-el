import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Lock, 
  Bell, 
  Settings as SettingsIcon,
  Save,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  Globe,
  Mail,
  Phone,
  FileText,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Server // Add this import
} from 'lucide-react';

const UserSettings = () => {
  const { user, updateUser, apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [language, setLanguage] = useState('sv');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [smtpSettings, setSmtpSettings] = useState({
    host: 'prime6.inleed.net',
    port: 587,
    username: 'noreply@solpulsen.se',
    password: 'jXtj7RDRu72pdUXqxHC3',
    encryption: 'starttls', // Default to STARTTLS
    fromEmail: 'noreply@solpulsen.se',
    fromName: 'SolPulsen',
    leadNotificationEmail: 'olsen.sweden@gmail.com'
  });

  const encryptionOptions = [
    { value: 'none', label: 'Ingen kryptering' },
    { value: 'starttls', label: 'STARTTLS' },
    { value: 'ssl/tls', label: 'SSL/TLS' }
  ];


  // Form states
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    signature: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    leadUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [crmSettings, setCrmSettings] = useState({
    pipelineStages: [
      'Prospekt',
      'Kvalificering',
      'Förhandling',
      'Avslut',      
    ],
    leadsStatus: [
      'Ny',
      'Kontaktad',
      'Dialog',
      'Offert skickad',
      'Varm lead',
      'Kund',
      'Ej intresserad'
    ],
    autoAssignment: true,
    leadScoring: true,
    emailTemplates: true,
    conversionGoals: {
      monthly: 50,
      quarterly: 150,
      yearly: 600
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Lösenord', icon: Lock },
   /* { id: 'notifications', label: 'Notifikationer', icon: Bell }, */
    ...(user?.role === 'admin' ? [{ id: 'crm', label: 'CRM-inställningar', icon: SettingsIcon }] : []),
    { id: 'smtp', label: 'SMTP-inställningar', icon: Server }
  ];

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const response = await apiCall('/auth/currentuser.php');
                
        if (response && response.success && response.data) {
          const userData = response.data;
          setProfileData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            signature: userData.signature || '',
            avatar: userData.avatar || ''
          });
        }
      } catch (error) {        
        setSaveStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [apiCall]);

  // Also load from user context if available
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        signature: user.signature || prev.signature,
        avatar: user.avatar || prev.avatar
      }));
    }
  }, [user]);


  const handleSaveSmtpSettings = async () => {
    setSaveStatus('saving');
    
    try {
      const response = await apiCall('/smtp-settings.php', {
        method: 'PUT',
        body: JSON.stringify(smtpSettings)
      });

      if (response) {
        setSaveStatus('saved');
      } else {
        throw new Error('Failed to save SMTP settings');
      }
    } catch (error) {
      setSaveStatus('error');
    }
    
    setTimeout(() => setSaveStatus(''), 2000);
  };


  const handleSave = async (section) => {
    setSaveStatus('saving');
    
    try {
      if (section === 'profile') {
        const response = await apiCall('/auth/currentuser.php', {
          method: 'PUT',
          body: JSON.stringify({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            phone: profileData.phone
          })
        });

        if (response) {
          setSaveStatus('saved');
          if (updateUser) {
            updateUser(response);
          }
        } else {
          throw new Error('Failed to save profile');
        }
      }
    } catch (error) {
      setSaveStatus('error');
    }
    
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus('error');
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      const response = await apiCall('/auth/currentuser.php', {
        method: 'PUT',
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });

      if (response) {
        setSaveStatus('saved');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {      
      setSaveStatus('error');
    }
    
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const SaveButton = ({ onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled || saveStatus === 'saving' || loading}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
        ${saveStatus === 'saved' 
          ? 'bg-green-600 text-white' 
          : saveStatus === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
        }
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {saveStatus === 'saving' || loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {loading ? 'Laddar...' : 'Sparar...'}
        </>
      ) : saveStatus === 'saved' ? (
        <>
          <Check className="w-4 h-4" />
          Sparat!
        </>
      ) : saveStatus === 'error' ? (
        <>
          <X className="w-4 h-4" />
          Fel
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Spara
        </>
      )}
    </button>
  );

  const renderProfileTab = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Profilinställningar</h2>
        <p className="text-slate-400 text-sm sm:text-base">Hantera din personliga information och inställningar</p>
      </div>

      {/* Avatar Upload */}
      <div style={{display:'none'}} className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-xl">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              (profileData.first_name?.charAt(0) || '').toUpperCase()
            )}
          </div>
          <label  className="absolute -bottom-2 -right-2 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-slate-400">Klicka för att ladda upp ny profilbild</p>
      </div>

      {/* Language Selection */}
      <div style={{ display: 'none' }} className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Språk</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-300
                ${language === lang.code
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }
              `}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <User className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Personlig Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Förnamn
            </label>
            <input
              type="text"
              value={profileData.first_name || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
              placeholder="Ditt förnamn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Efternamn
            </label>
            <input
              type="text"
              value={profileData.last_name || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
              placeholder="Ditt efternamn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              E-postadress
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input readOnly
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                placeholder="din@email.se"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Telefonnummer
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              <input
                type="tel"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                placeholder="+46 70 123 45 67"
              />
            </div>
          </div>

          <div style={{display:'none'}} className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              E-postsignatur
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <textarea
                value={profileData.signature}
                onChange={(e) => setProfileData(prev => ({ ...prev, signature: e.target.value }))}
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                placeholder="Din e-postsignatur..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <SaveButton onClick={() => handleSave('profile')} />
        </div>
      </div>
    </div>
  );

  const renderPasswordTab = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Lösenordssäkerhet</h2>
        <p className="text-slate-400 text-sm sm:text-base">Uppdatera ditt lösenord för att hålla kontot säkert</p>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Säkerhetstips</h3>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Använd minst 8 tecken
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Inkludera stora och små bokstäver
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Lägg till siffror och specialtecken
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Undvik vanliga ord och personlig information
          </li>
        </ul>
      </div>

      {/* Password Form */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Lock className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Ändra lösenord</h3>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div style={{display:'none'}}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nuvarande lösenord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full pl-12 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="Ange ditt nuvarande lösenord"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nytt lösenord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                placeholder="Ange ditt nya lösenord"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bekräfta nytt lösenord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
                placeholder="Bekräfta ditt nya lösenord"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-red-400 text-sm mt-2">Lösenorden matchar inte</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <SaveButton 
            onClick={handlePasswordChange}
            disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Notifikationsinställningar</h2>
        <p className="text-slate-400">Anpassa hur och när du vill få meddelanden</p>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {/* General Notifications */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-white">Allmänna notifikationer</h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'E-postnotifikationer', desc: 'Få meddelanden via e-post' },
              { key: 'pushNotifications', label: 'Push-notifikationer', desc: 'Få meddelanden i webbläsaren' },
              { key: 'smsNotifications', label: 'SMS-notifikationer', desc: 'Få viktiga meddelanden via SMS' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{item.label}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings[item.key]}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Business Notifications */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-white">Affärsnotifikationer</h3>
          </div>

          <div className="space-y-4">
            {[
              { key: 'leadUpdates', label: 'Lead-uppdateringar', desc: 'När leads ändrar status eller får nya aktiviteter' },
              { key: 'systemAlerts', label: 'Systemvarningar', desc: 'Viktiga systemmeddelanden och uppdateringar' },
              { key: 'weeklyReports', label: 'Veckorapporter', desc: 'Automatiska sammanfattningar av din prestanda' },
              { key: 'marketingEmails', label: 'Marknadsföringsmail', desc: 'Produktuppdateringar och tips' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">{item.label}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings[item.key]}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={() => handleSave('notifications')} />
      </div>
    </div>
  );

  const renderCrmTab = () => (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">CRM-konfiguration</h2>
        <p className="text-slate-400 text-sm sm:text-base">Anpassa systemet efter dina affärsbehov</p>
      </div>

      {/* Pipeline Configuration */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Pipeline-steg</h3>
        </div>

        <div className="space-y-3">
          {crmSettings.pipelineStages.map((stage, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <input
                type="text"
                value={stage}
                onChange={(e) => {
                  const newStages = [...crmSettings.pipelineStages];
                  newStages[index] = e.target.value;
                  setCrmSettings(prev => ({ ...prev, pipelineStages: newStages }));
                }}
                className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-slate-600 border border-slate-500 rounded text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
              />
              <button className="text-red-400 hover:text-red-300 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button className="w-full p-2 sm:p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors text-sm sm:text-base">
            + Lägg till nytt steg
          </button>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <SettingsIcon className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Systemfunktioner</h3>
        </div>

        <div className="space-y-4">
          {[
            { key: 'autoAssignment', label: 'Automatisk tilldelning', desc: 'Tilldela nya leads automatiskt till säljare' },
            { key: 'leadScoring', label: 'Lead-poängsättning', desc: 'Automatisk bedömning av lead-kvalitet' },
            { key: 'emailTemplates', label: 'E-postmallar', desc: 'Använd fördefinierade e-postmallar' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 sm:p-4 bg-slate-700/50 rounded-lg">
              <div className="flex-1 pr-4">
                <h4 className="text-white font-medium text-sm sm:text-base">{item.label}</h4>
                <p className="text-slate-400 text-xs sm:text-sm">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={crmSettings[item.key]}
                  onChange={(e) => setCrmSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Goals */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Target className="w-5 h-5 text-amber-500" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Konverteringsmål</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { key: 'monthly', label: 'Månatligt mål', icon: Calendar },
            { key: 'quarterly', label: 'Kvartalsmål', icon: TrendingUp },
            { key: 'yearly', label: 'Årsmål', icon: Target }
          ].map((goal) => (
            <div key={goal.key} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <goal.icon className="w-5 h-5 text-amber-500" />
                <h4 className="text-white font-medium">{goal.label}</h4>
              </div>
              <input
                type="number"
                value={crmSettings.conversionGoals[goal.key]}
                onChange={(e) => setCrmSettings(prev => ({
                  ...prev,
                  conversionGoals: {
                    ...prev.conversionGoals,
                    [goal.key]: parseInt(e.target.value) || 0
                  }
                }))}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="Antal leads"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={() => handleSave('crm')} />
      </div>
    </div>
  );

  const renderSmtpTab = () => (
  <div className="space-y-6 sm:space-y-8">
    {/* Header */}
    <div className="text-center">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">SMTP-inställningar</h2>
      <p className="text-slate-400 text-sm sm:text-base">Konfigurera e-postserverinställningar</p>
    </div>

    {/* SMTP Form */}
    <div style="display:none" className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Server className="w-5 h-5 text-amber-500" />
        <h3 className="text-base sm:text-lg font-semibold text-white">SMTP-server</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            SMTP-server
          </label>
          <input
            type="text"
            value={smtpSettings.host}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, host: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="smtp.example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Port
          </label>
          <input
            type="number"
            value={smtpSettings.port}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, port: parseInt(e.target.value) }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="587"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Kryptering
          </label>
          <select
            value={smtpSettings.encryption}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, encryption: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
          >
            {encryptionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Användarnamn
          </label>
          <input
            type="text"
            value={smtpSettings.username}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, username: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="noreply@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Lösenord
          </label>
          <input
            type="password"
            value={smtpSettings.password}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, password: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="Ditt lösenord"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Avsändarens e-post
          </label>
          <input
            type="email"
            value={smtpSettings.fromEmail}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="noreply@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Avsändarens namn
          </label>
          <input
            type="text"
            value={smtpSettings.fromName}
            onChange={(e) => setSmtpSettings(prev => ({ ...prev, fromName: e.target.value }))}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
            placeholder="SolPulsen"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 sm:mt-6">
        <SaveButton onClick={handleSaveSmtpSettings} />
      </div>
    </div>

    {/* Test Connection Section */}
    <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Mail className="w-5 h-5 text-amber-500" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Testa anslutning</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="email"
          placeholder="test@example.com"
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm sm:text-base"
        />
        <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-300">
          Skicka testmail
        </button>
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 ml-14 lg:ml-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2 sm:mb-4">
            Inställningar
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Anpassa din SolPulsen CRM-upplevelse
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 px-2 sm:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-700 shadow-2xl">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'password' && renderPasswordTab()}
          {/*activeTab === 'notifications' && renderNotificationsTab() */}
          {activeTab === 'crm' && user?.role === 'admin' && renderCrmTab()}
          {activeTab === 'smtp' && user?.role === 'admin' && renderSmtpTab()}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;