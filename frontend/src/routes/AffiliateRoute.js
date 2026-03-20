import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API } from '@/config';

export default function AffiliateRoute({ children }) {
  const { user, getToken } = useAuth(); 
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!user) {
      setStatus('denied');
      return;
    }

    (async () => {
      try {
        const token = await getToken(); 

        if (!token) {
          setStatus('denied');
          return;
        }

        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const role = res.data?.role || 'user';
        if (role === 'affiliate' || role === 'admin') {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      } catch (e) {
        console.error('affiliateRoute erro:', e?.response?.data || e.message);
        setStatus('denied');
      }
    })();
  }, [user, getToken]);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#f0f4f8',
        fontFamily: '"Georgia", serif', color: '#1a2744', fontSize: '0.95rem',
        gap: 12,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5aa8e0" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Verificando acesso...
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (status === 'denied') return <Navigate to="/" replace />;

  return children;
}