
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PostList from '../components/PostList';
import { apiService } from '../services/api';

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
              Recent Posts
            </h1>
            <p style={{ color: '#666' }}>
              Discover discussions from all communities
            </p>
          </div>
          <PostList user={user} />
        </main>
      </div>
    </div>
  );
}
