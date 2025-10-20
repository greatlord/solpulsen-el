import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, Square, Calendar,
  BarChart3, Edit3, CheckCircle,
  AlertCircle, Timer, TrendingUp, Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

const TimeTracking = () => {
  const { user, apiCall } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);  
  const [workStartTime, setWorkStartTime] = useState(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);  
  const [selectedPeriod, setSelectedPeriod] = useState('Idag');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(8);
  const [weeklyTarget, setWeeklyTarget] = useState(40);
  const [activeTimeLogId, setActiveTimeLogId] = useState(null);  
  const [entries, setEntries] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Form refs for modal
  const dateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const projectRef = useRef(null);
  const descriptionRef = useRef(null);

  // Fetch today's entries and calculate total work time
  const fetchTodaysEntries = async () => {
    try {
      const response = await apiCall(`/time/report.php?period=today`);
      if (response.success) {
        setEntries(response.data.entries);
        
        // Beräkna total endast för avslutade poster
        const completedTotal = calculateTotalWorkTime(response.data.entries);
        
        // Om vi inte arbetar just nu, sätt totalen till den beräknade
        if (!isWorking) {
          setTotalWorkTime(completedTotal);
        }
        
        setIsDataLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      setIsDataLoaded(true);
    }
  };

  // Fetch active time log on component mount
  const fetchActiveTimeLog = async () => {
    try {
      const response = await apiCall('/time/active.php');
      
      if (response.success) {
        // Kolla båda möjliga strukturer
        const activeLog = response.data?.active_log || response.active_log || response.data;
        
        if (activeLog && activeLog.id && activeLog.start_time) {
          // Fix för tidzon-skillnad: Lägg till 1 timme
          const serverStartTime = new Date(activeLog.start_time.replace(' ', 'T'));
          const adjustedStartTime = new Date(serverStartTime.getTime() + (1 * 60 * 60 * 1000));
          
          setWorkStartTime(adjustedStartTime);
          setActiveTimeLogId(activeLog.id);
          setIsWorking(true);
          
          // Beräkna korrekt total tid baserat på justerad tid
          const now = new Date();
          const currentSessionSeconds = Math.floor((now - adjustedStartTime) / 1000);
          
          // Hämta dagens poster för att få korrekt bas-tid
          const todayResponse = await apiCall(`/time/report.php?period=today`);
          if (todayResponse.success) {
            const completedTotal = calculateTotalWorkTime(todayResponse.data.entries);
            setTotalWorkTime(completedTotal + currentSessionSeconds);
            setEntries(todayResponse.data.entries);
          }
        } else {
          // Ingen aktiv session
          setIsWorking(false);
          setWorkStartTime(null);
          setActiveTimeLogId(null);
        }
      }
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching active time log:', error);
      setIsDataLoaded(true);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user) {
      setIsDataLoaded(false);
      fetchActiveTimeLog();
    }
  }, [user]);

  // Update total work time every second when working - FÖRBÄTTRAD VERSION
  useEffect(() => {
    let interval;
    
    if (isWorking && workStartTime && isDataLoaded) {
      interval = setInterval(() => {
        // Beräkna total från avslutade poster
        const completedTotal = calculateTotalWorkTime(entries);

        // Lägg till nuvarande aktiva sessionstid
        const now = new Date();
        const currentSessionSeconds = Math.floor((now - workStartTime) / 1000);
        
        setTotalWorkTime(completedTotal + currentSessionSeconds);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [entries, isWorking, workStartTime, isDataLoaded]);

  // Hämta rapport-data när selectedPeriod ändras
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const periodMap = {
          'Idag': 'today',
          'Denna vecka': 'this_week',
          'Denna månad': 'this_month',
          'Senaste 3 månader': 'last_3_months'
        };
        
        const response = await apiCall(`/time/report.php?period=${periodMap[selectedPeriod]}`);
        
        if (response.success && response.data) {
          setTimeEntries(response.data.entries || []);
          setDailyTarget((response.data.daily_target || 28800) / 3600);
          setWeeklyTarget((response.data.weekly_target || 144000) / 3600);
          
          setWeeklyData(generateWeeklyData(response.data.entries || [], selectedPeriod));
          setMonthlyTrend(generateMonthlyTrend(response.data.entries || [], selectedPeriod));
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        setTimeEntries([]);
        setWeeklyData(generateEmptyWeeklyData());
        setMonthlyTrend([]);
      }
    };

    if (user && isDataLoaded) {
      fetchReportData();
    }
  }, [user, selectedPeriod, isDataLoaded]);

  // Generate weekly data from entries
  const generateWeeklyData = (entries, period) => {
    const days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    const dayMap = {
      'Mån': 1, 'Tis': 2, 'Ons': 3, 'Tor': 4, 'Fre': 5, 'Lör': 6, 'Sön': 0
    };
    
    const weekData = days.map(day => ({
      day,
      hours: 0,
      target: dailyTarget
    }));

    if (!entries || entries.length === 0) {
      return weekData;
    }

    entries.forEach(entry => {
      const startTime = new Date(entry.start_time.replace(" ", "T"));
      
      // Använd duration_seconds från backend om tillgängligt
      let durationSeconds = 0;
      if (entry.duration_seconds && entry.end_time && entry.end_time !== "0000-00-00 00:00:00") {
        durationSeconds = parseInt(entry.duration_seconds, 10);
      }

      if (durationSeconds > 0) {
        const dayOfWeek = startTime.getDay();
        const dayName = days.find(day => dayMap[day] === dayOfWeek);
        
        if (dayName) {
          const dayIndex = days.indexOf(dayName);
          if (dayIndex !== -1) {
            weekData[dayIndex].hours += durationSeconds / 3600;
          }
        }
      }
    });

    return weekData;
  };

  // Generate monthly trend data from entries
  const generateMonthlyTrend = (entries, period) => {
    if (!entries || entries.length === 0) {
      return [];
    }

    const weeklyHours = {};
    
    entries.forEach(entry => {
      const startTime = new Date(entry.start_time.replace(" ", "T"));
      
      // Använd duration_seconds från backend om tillgängligt
      let durationSeconds = 0;
      if (entry.duration_seconds && entry.end_time && entry.end_time !== "0000-00-00 00:00:00") {
        durationSeconds = parseInt(entry.duration_seconds, 10);
      }

      if (durationSeconds > 0) {
        const weekNumber = getWeekNumber(startTime);
        const weekKey = `Vecka ${weekNumber}`;
        
        if (!weeklyHours[weekKey]) {
          weeklyHours[weekKey] = 0;
        }
        weeklyHours[weekKey] += durationSeconds / 3600;
      }
    });

    return Object.entries(weeklyHours).map(([week, hours]) => ({
      week,
      hours: Math.round(hours * 100) / 100
    }));
  };

  // Generate empty weekly data
  const generateEmptyWeeklyData = () => {
    const days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    return days.map(day => ({
      day,
      hours: 0,
      target: dailyTarget
    }));
  };

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeShort = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalWorkTime = (entries) => {
    let totalSeconds = 0;

    entries.forEach((entry) => {
      // Räkna ENDAST avslutade poster (duration_seconds är null för aktiva sessioner)
      if (entry.duration_seconds !== null && entry.duration_seconds !== undefined && entry.end_time && entry.end_time !== "0000-00-00 00:00:00") {
        const duration = parseInt(entry.duration_seconds, 10);
        totalSeconds += duration;
      }
    });

    return totalSeconds;
  };

  const handleStartWork = async () => {
    try {
      const response = await apiCall('/time/start.php', {
        method: 'POST',
        body: JSON.stringify({
          project: 'Default Project',
          description: 'Working...'
        })
      });
      
      const currentDate = new Date();
      setIsWorking(true);
      setWorkStartTime(currentDate);
      setActiveTimeLogId(response.time_log_id);
      
      // Uppdatera dagens poster
      await fetchTodaysEntries();
           
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const handleStopWork = async () => {
    try {
      await apiCall('/time/stop.php', {
        method: 'POST'
      });
      
      setIsWorking(false);      
      setWorkStartTime(null);      
      setActiveTimeLogId(null);
      
      // Uppdatera dagens poster
      await fetchTodaysEntries();
      
      // Uppdatera rapport-data
      const periodMap = {
        'Idag': 'today',
        'Denna vecka': 'this_week',
        'Denna månad': 'this_month',
        'Senaste 3 månader': 'last_3_months'
      };
      
      const response = await apiCall(`/time/report.php?period=${periodMap[selectedPeriod]}`);
      if (response.success && response.data) {
        setTimeEntries(response.data.entries || []);
      }
    } catch (error) {
      console.error('Error stopping work:', error);
    }
  };

  const handleSaveManualEntry = async (entryData) => {
    try {
      await apiCall('/time/manual.php', {
        method: 'POST',
        body: JSON.stringify(entryData)
      });
      
      setShowEditModal(false);
      setEditEntry(null);
      
      // Uppdatera dagens poster
      await fetchTodaysEntries();
      
      // Uppdatera rapport-data
      const periodMap = {
        'Idag': 'today',
        'Denna vecka': 'this_week',
        'Denna månad': 'this_month',
        'Senaste 3 månader': 'last_3_months'
      };
      
      const response = await apiCall(`/time/report.php?period=${periodMap[selectedPeriod]}`);
      if (response.success && response.data) {
        setTimeEntries(response.data.entries || []);
      }
    } catch (error) {
      console.error('Error saving manual entry:', error);
    }
  };

  // Handle form submission with refs
  const handleFormSubmit = () => {
    try {
      if (!dateRef.current || !startTimeRef.current || !endTimeRef.current || 
          !projectRef.current || !descriptionRef.current) {
            //console.error('Form refs not available');
        return;
      }

      const formData = {
        date: dateRef.current.value,
        start_time: startTimeRef.current.value + ':00',
        end_time: endTimeRef.current.value + ':00',
        project_name: projectRef.current.value,
        description: descriptionRef.current.value
      };
      
      if (editEntry && editEntry.id) {
        formData.id = editEntry.id;
      }
      
      handleSaveManualEntry(formData);
    } catch (error) {
      console.error('Error handling form submit:', error);
    }
  };

  const getCurrentStatus = () => {
    if (!isWorking) return { text: 'Ej påbörjad', color: 'text-slate-400', bg: 'bg-slate-500/20' };    
    return { text: 'Arbetar', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const status = getCurrentStatus();
  const periods = ['Idag', 'Denna vecka', 'Denna månad', 'Senaste 3 månader'];

  // Calculate efficiency percentage
  const efficiency = useMemo(() => {
    const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
    return weeklyTarget > 0 ? Math.min(100, Math.round((totalHours / weeklyTarget) * 100)) : 0;
  }, [weeklyData, weeklyTarget]);

  // Visa loading state medan data laddas
  if (!isDataLoaded) {
    return (
      <div className="p-8 space-y-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-300 text-xl font-medium">Laddar tidrapportering...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-3 leading-tight tracking-tight">
            Tidrapportering
          </h1>
          <p className="text-slate-300 text-xl font-medium">Stämpla in/ut och följ upp din arbetstid</p>
        </div>
        
        <div className="flex items-center space-x-4">          
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 font-bold"
          >
            <Edit3 className="w-6 h-6" />
            <span>Manuell registrering</span>
          </button>
        </div>
      </div>

      {/* Stämpelklocka */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Huvudklocka */}
        <div className="xl:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent mb-4 leading-tight">
              {currentTime.toLocaleTimeString('sv-SE')}
            </div>
            <div className="text-slate-300 text-lg sm:text-xl font-medium mb-6 sm:mb-8">
              {currentTime.toLocaleDateString('sv-SE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            {/* Status */}
            <div className={`inline-flex items-center space-x-3 px-4 sm:px-6 py-3 rounded-2xl ${status.bg} border border-slate-600/30 mb-6 sm:mb-8`}>
              <div className={`w-3 h-3 rounded-full ${status.color.replace('text-', 'bg-')} animate-pulse`} />
              <span className={`font-bold text-base sm:text-lg ${status.color}`}>{status.text}</span>
            </div>

            {/* Arbetstid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-slate-700/30 rounded-xl p-4 sm:p-6 border border-slate-600/30">
                <div className="text-slate-400 text-xs sm:text-sm uppercase tracking-wide mb-2 font-bold">Arbetstid idag</div>
                <div className="text-2xl sm:text-3xl font-black text-green-400">
                  {formatTime(totalWorkTime)}
                </div>
              </div>
            </div>

            {/* Kontrollknappar */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              {!isWorking ? (
                <button
                  onClick={handleStartWork}
                  className="flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 font-bold text-base sm:text-lg"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>Stämpla in</span>
                </button>
              ) : (
                <button
                  onClick={handleStopWork}
                  className="flex items-center space-x-2 sm:space-x-3 px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105 font-bold text-base sm:text-lg"
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Stämpla ut</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dagens statistik */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs sm:text-sm font-medium">Idag</div>
                  <div className="text-white font-bold text-base sm:text-lg">Arbetstid</div>
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mb-2">
              {formatTimeShort(totalWorkTime)}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm">Mål: {dailyTarget}h 0m</div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 group">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs sm:text-sm font-medium">Denna vecka</div>
                  <div className="text-white font-bold text-base sm:text-lg">Effektivitet</div>
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-green-400 mb-2">{efficiency}%</div>
            <div className="text-slate-400 text-xs sm:text-sm">
              {weeklyData.reduce((sum, day) => sum + day.hours, 0).toFixed(2)}h / {weeklyTarget}h
            </div>
          </div>
        </div>
      </div>

      {/* Rapporter */}
      <div className="space-y-6 sm:space-y-8">
        {/* Period selector */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-xl shadow-amber-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white border border-slate-600/50 hover:border-slate-500/50'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Diagram */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 group">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center">
              <BarChart3 className="mr-3 sm:mr-4 text-amber-400 group-hover:text-amber-300 transition-colors" size={24} />
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Veckoöversikt
              </span>
            </h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} fontWeight="600" />
                  <YAxis stroke="#9ca3af" fontSize={12} fontWeight="600" />
                  <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="#374151" radius={[4, 4, 0, 0]} opacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 group">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center">
              <TrendingUp className="mr-3 sm:mr-4 text-amber-400 group-hover:text-amber-300 transition-colors" size={24} />
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Månadstrend
              </span>
            </h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} fontWeight="600" />
                  <YAxis stroke="#9ca3af" fontSize={12} fontWeight="600" />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#f59e0b" 
                    strokeWidth={4}
                    dot={{ fill: '#f59e0b', strokeWidth: 3, r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tidsposter */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 flex items-center">
            <Calendar className="mr-3 sm:mr-4 text-amber-400" size={24} />
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Senaste tidsposter
            </span>
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            {timeEntries.length > 0 ? (
              timeEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-700/30 rounded-xl p-4 sm:p-6 border border-slate-600/30 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
                      <div className="text-center sm:text-left">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-bold">Datum</div>
                        <div className="text-white font-bold text-sm sm:text-base">{new Date(entry.start_time).toLocaleDateString('sv-SE')}</div>
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-bold">Tid</div>
                        <div className="text-white font-bold text-sm sm:text-base">
                          {new Date(entry.start_time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {entry.end_time && entry.end_time !== "0000-00-00 00:00:00" ? new Date(entry.end_time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : 'Pågår'}
                        </div>
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-bold">Totalt</div>
                        <div className="text-amber-400 font-bold text-base sm:text-lg">
                          {entry.end_time && entry.end_time !== "0000-00-00 00:00:00" ? 
                            (entry.duration_seconds ? formatTimeShort(parseInt(entry.duration_seconds, 10)) : formatTimeShort(Math.floor((new Date(entry.end_time) - new Date(entry.start_time)) / 1000))) : 
                            'Pågår'
                          }
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-400 text-xs uppercase tracking-wide mb-1 font-bold">Projekt</div>
                        <div className="text-white font-bold text-sm sm:text-base truncate">{entry.project_name || 'Inget projekt'}</div>
                        <div className="text-slate-400 text-xs sm:text-sm truncate">{entry.description || 'Ingen beskrivning'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-600/30">
                      <button 
                        onClick={() => {
                          setEditEntry({
                            ...entry,
                            date: new Date(entry.start_time).toISOString().split('T')[0],
                            startTime: new Date(entry.start_time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
                            endTime: entry.end_time && entry.end_time !== "0000-00-00 00:00:00" ? new Date(entry.end_time).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '17:00'
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 sm:p-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300 hover:scale-105"
                      >
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <div className="flex items-center space-x-2">
                        {entry.status === 'approved' ? (
                          <>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            <span className="text-green-400 text-xs sm:text-sm font-medium">Godkänd</span>
                          </>
                        ) : entry.status === 'rejected' ? (
                          <>
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                            <span className="text-red-400 text-xs sm:text-sm font-medium">Avvisad</span>
                          </>
                        ) : (
                          <>
                            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            <span className="text-yellow-400 text-xs sm:text-sm font-medium">Väntar</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="text-slate-400 text-base sm:text-lg">Inga tidsposter hittades för vald period</div>
                <div className="text-slate-500 text-sm mt-2">Välj en annan period eller lägg till en manuell registrering</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
              {editEntry ? 'Redigera tidspost' : 'Manuell registrering'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Datum</label>
                <input 
                  ref={dateRef}
                  type="date" 
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm sm:text-base"
                  defaultValue={editEntry?.date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Starttid</label>
                  <input 
                    ref={startTimeRef}
                    type="time" 
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm sm:text-base"
                    defaultValue={editEntry?.startTime || '08:00'}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-bold mb-2">Sluttid</label>
                  <input 
                    ref={endTimeRef}
                    type="time" 
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm sm:text-base"
                    defaultValue={editEntry?.endTime || '17:00'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Projekt</label>
                <input 
                  ref={projectRef}
                  type="text" 
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm sm:text-base"
                  defaultValue={editEntry?.project_name || ''}
                  placeholder="Projektnamn"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-bold mb-2">Beskrivning</label>
                <textarea 
                  ref={descriptionRef}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white h-20 sm:h-24 resize-none text-sm sm:text-base"
                  defaultValue={editEntry?.description || ''}
                  placeholder="Beskrivning av arbetet"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditEntry(null);
                }}
                className="w-full sm:flex-1 px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-300 font-bold"
              >
                Avbryt
              </button>
              <button 
                onClick={handleFormSubmit}
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-bold"
              >
                Spara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracking;