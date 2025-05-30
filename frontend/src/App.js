import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './logo.svg';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload'; // Import FileUpload

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [timestamp, setTimestamp] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [protectedData, setProtectedData] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/status')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setBackendStatus(data.backend || 'Error fetching status');
        setDbStatus(data.database || 'Error fetching status');
        setTimestamp(data.timestamp || 'N/A');
      })
      .catch(err => {
        console.error('Error fetching API status:', err);
        setBackendStatus('Failed to connect');
        setDbStatus('Failed to connect');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProtectedData(null);
    setShowLogin(true); // Show login form after logout
  };

  const fetchProtectedData = async () => {
    if (!token) {
      setProtectedData({ message: 'You need to be logged in to see this.' });
      return;
    }
    try {
      const response = await fetch('/api/protected', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch protected data');
      }
      setProtectedData(data);
    } catch (error) {
      setProtectedData({ message: error.message });
      if (error.message === 'Invalid token.') {
        // If token is invalid (e.g. expired), log out user
        handleLogout();
      }
    }
  };

  // Update user state if token changes (e.g., after login)
  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [token]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>AudioClean SaaS</h1>
        <p>Backend Status: {backendStatus}</p>
        <p>Database Status: {dbStatus}</p>
        <p>Server Timestamp: {timestamp}</p>
      </header>
      <main>
        {!token ? (
          <>
            {showLogin ? (
              <Login setToken={setToken} />
            ) : (
              <Register />
            )}
            <button onClick={() => setShowLogin(!showLogin)} style={{ marginTop: '10px' }}>
              {showLogin ? 'Need to register?' : 'Already have an account? Login'}
            </button>
          </>
        ) : (
          <div>
            <h2>Welcome, {user?.username || 'User'}!</h2>
            <button onClick={handleLogout}>Logout</button>
            
            {/* File Upload Component */} 
            <FileUpload />

            <div style={{ marginTop: '20px' }}>
              <button onClick={fetchProtectedData}>Fetch Protected Data</button>
              {protectedData && (
                <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>
                  {JSON.stringify(protectedData, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
