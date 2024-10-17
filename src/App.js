import './App.css';
import { Link, useHistory } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// Use Electron's IPC if available, otherwise mock for browser environment
const electron = window.electron || {
  store: {
    get: (key) => JSON.parse(localStorage.getItem(key)) || 0,
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  },
  ipcRenderer: {
    invoke: async (channel) => {
      console.warn('IPC not available in browser mode');
      return [];
    },
    send: (channel, data) => console.warn('IPC not available in browser mode'),
  },
};

function App() {
  const history = useHistory();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const [inactiveStartTime, setInactiveStartTime] = useState(null);
  const [thresholdReachedTime, setThresholdReachedTime] = useState(null);
  const [totalInactiveTime, setTotalInactiveTime] = useState(() => {
    return electron.store.get('inactiveTime') || 0;
  });
  const [currentInactiveTime, setCurrentInactiveTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [runningApps, setRunningApps] = useState([]);
  const INACTIVITY_THRESHOLD = 60000; // 1 minute

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loginStatus);
      electron.ipcRenderer.send(loginStatus ? 'user-logged-in' : 'user-logged-out');
    };

    checkLoginStatus();

    // Fetch running apps using Electron IPC
    const fetchRunningApps = async () => {
      try {
        const appNames = await electron.ipcRenderer.invoke('get-running-apps');
        setRunningApps(appNames);
      } catch (error) {
        console.warn('Failed to fetch running apps:', error);
      }
    };

    // Update running apps every 10 seconds
    const appUpdateInterval = setInterval(fetchRunningApps, 10000);
    fetchRunningApps();  // Initial fetch

    const activityCheck = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivity;

      if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
        if (isActive) {
          setIsActive(false);
          setInactiveStartTime(lastActivity);
          setThresholdReachedTime(currentTime);
        } else {
          const timeAfterThreshold = Math.floor(
            (currentTime - thresholdReachedTime) / 1000
          );
          setCurrentInactiveTime(timeAfterThreshold);
          electron.store.set('inactiveTime', totalInactiveTime + timeAfterThreshold);
        }
      }
    }, 1000);

    const activityListener = () => {
      const currentTime = Date.now();

      if (!isActive) {
        const totalInactiveSeconds = Math.floor(
          (currentTime - thresholdReachedTime) / 1000
        );
        setTotalInactiveTime(totalInactiveTime + totalInactiveSeconds);
        electron.store.set('inactiveTime', totalInactiveTime + totalInactiveSeconds);
        setCurrentInactiveTime(0);
        setThresholdReachedTime(null);
      }

      setLastActivity(currentTime);
      setIsActive(true);
      setInactiveStartTime(null);
    };

    window.addEventListener('mousemove', activityListener);
    window.addEventListener('keydown', activityListener);

    return () => {
      clearInterval(activityCheck);
      clearInterval(appUpdateInterval);
      window.removeEventListener('mousemove', activityListener);
      window.removeEventListener('keydown', activityListener);
    };
  }, [lastActivity, isActive, thresholdReachedTime, totalInactiveTime]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    electron.ipcRenderer.send('user-logged-out');
    history.push('/login');
  };

  const handleExit = () => {
    if (isLoggedIn) {
      alert('Please logout first before closing the application.');
      return;
    }
    electron.ipcRenderer.send('force-quit');
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="activity-monitor">
      <div className="header">
        <h1>Activity Monitor</h1>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        ) : (
          <Link to="/login" className="login-btn">Login</Link>
        )}
      </div>

      <div className="status-container">
        <p className={`status ${isActive ? 'active' : 'inactive'}`}>
          Status: {isActive ? 'Active' : 'Inactive'}
        </p>

        {!isActive && (
          <p className="threshold-info">
            Time After 1 Minute Threshold: {formatTime(currentInactiveTime)}
          </p>
        )}

        <p className="total-inactive">
          Total Tracked Inactive Time: {formatTime(totalInactiveTime)}
        </p>

        {/* Display running applications */}
        <div className="running-apps">
          <h3>Running Applications</h3>
          <ul>
            {runningApps.length > 0 ? (
              runningApps.map((app, index) => <li key={index}>{app}</li>)
            ) : (
              <li>No running applications found.</li>
            )}
          </ul>
        </div>
      </div>

      {!isLoggedIn && (
        <button onClick={handleExit} className="exit-btn">
          Exit Application
        </button>
      )}
    </div>
  );
}

export default App;
