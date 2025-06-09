
import { useState, useEffect } from 'react';

export default function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <a href="/" className="nav-brand">DissDen</a>
          
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            
            {user ? (
              <>
                <a href="/create-den" className="nav-link">Create Den</a>
                <div style={{ position: 'relative' }}>
                  <button 
                    className="nav-link"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {user.username} ▼
                  </button>
                  {isMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minWidth: '150px',
                      zIndex: 1000,
                      marginTop: '4px'
                    }}>
                      <a 
                        href={`/profile/${user.id}`} 
                        className="nav-link" 
                        style={{ display: 'block', padding: '8px 12px' }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </a>
                      <button 
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="nav-link" 
                        style={{ 
                          display: 'block', 
                          width: '100%', 
                          textAlign: 'left', 
                          background: 'none',
                          border: 'none',
                          padding: '8px 12px'
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="nav-link">Login</a>
                <a href="/register" className="btn btn-primary">Register</a>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
