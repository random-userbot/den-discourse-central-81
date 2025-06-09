
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function Sidebar() {
  const [dens, setDens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDens();
  }, []);

  const loadDens = async () => {
    try {
      const data = await apiService.getDens();
      setDens(data);
    } catch (error) {
      console.error('Failed to load dens:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sidebar">
        <div className="loading">Loading dens...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
        Communities
      </h3>
      
      <ul className="den-list">
        {dens.map(den => (
          <li key={den.id} className="den-item">
            <a href={`/den/${den.id}`} className="den-link">
              d/{den.title}
            </a>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              {den.description.substring(0, 50)}...
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
