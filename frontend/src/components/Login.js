import React, { useState } from 'react';
import './Form.css'; // Import the CSS file

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true); // Set loading to true
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      setMessage(data.message);
      // Assuming the token is in data.token
      if (data.token) {
        localStorage.setItem('token', data.token); // Store token in localStorage
        setToken(data.token); // Update app state
        // Optionally, store user info as well
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      // setEmail(''); // Clear fields on successful login
      // setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  return (
    <div className="form-container"> {/* Apply a container class */}
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading} // Disable input when loading
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading} // Disable input when loading
          />
        </div>
        <button type="submit" disabled={loading}> {/* Disable button when loading */}
          {loading ? 'Logging in...' : 'Login'} {/* Change button text when loading */}
        </button>
      </form>
      {error && <p className="form-message error">{error}</p>} {/* Apply message classes */}
      {message && <p className="form-message success">{message}</p>} {/* Apply message classes */}
    </div>
  );
}

export default Login;
