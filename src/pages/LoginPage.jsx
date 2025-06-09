
import { useState } from 'react';
import { apiService } from '../services/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(formData.username, formData.password);
      
      // Store token and user data
      apiService.setToken(response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        username: response.username,
        email: response.email
      }));
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', paddingTop: '60px' }}>
      <form onSubmit={handleSubmit} className="auth-form">
        <h1 className="auth-title">Sign In</h1>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#333', textDecoration: 'underline' }}>
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
