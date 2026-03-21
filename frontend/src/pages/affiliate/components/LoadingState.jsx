import AffiliateLayout from '../layouts/AffiliateLayout';
import { RefreshCw } from 'lucide-react';

const LoadingState = ({ message = 'Carregando...' }) => {
  return (
    <AffiliateLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#7a8aaa' }}>
          <RefreshCw size={26} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.88rem', marginTop: 12 }}>{message}</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </AffiliateLayout>
  );
}

export default LoadingState;