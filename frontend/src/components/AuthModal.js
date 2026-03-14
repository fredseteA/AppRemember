import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

const AuthModal = ({ open, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        toast.success(t('auth.signUp') + ' realizado com sucesso!');
      } else {
        await signIn(email, password);
        toast.success('Login realizado com sucesso!');
      }
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Login com Google realizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Erro ao autenticar com Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0"
        data-testid="auth-modal"
        style={{
          background: 'linear-gradient(160deg, #ddf0f7 0%, #eef8fb 50%, #c8e8f5 100%)',
          borderRadius: 28,
          boxShadow: '0 24px 80px rgba(26,39,68,0.18)',
          fontFamily: '"Georgia", serif',
        }}
      >
        <style>{`
          @keyframes authReveal {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes floatA1 {
            0%,100% { transform: translateY(0) translateX(0); }
            50%     { transform: translateY(-8px) translateX(4px); }
          }
          @keyframes floatA2 {
            0%,100% { transform: translateY(0) translateX(0); }
            55%     { transform: translateY(-6px) translateX(-4px); }
          }
          .auth-input {
            width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1.5px solid rgba(26,39,68,0.12);
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(8px);
            font-family: "Georgia", serif;
            font-size: 1rem;
            color: #1a2744;
            outline: none;
            transition: border-color 0.25s ease, box-shadow 0.25s ease;
            -webkit-appearance: none;
            appearance: none;
            box-sizing: border-box;
          }
          .auth-input:focus {
            border-color: #5aa8e0;
            box-shadow: 0 0 0 3px rgba(90,168,224,0.15);
          }
          .auth-input::placeholder { color: rgba(58,80,112,0.4); }
          .auth-label {
            display: block;
            font-family: "Georgia", serif;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #2a3d5e;
            margin-bottom: 7px;
          }
          .auth-btn-primary {
            width: 100%;
            display: inline-flex; align-items: center; justify-content: center;
            padding: 14px 24px; border-radius: 999px;
            background: #1a2744; color: white;
            font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
            letter-spacing: 0.06em; border: none; cursor: pointer;
            transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 6px 20px rgba(26,39,68,0.2); min-height: 50px;
            -webkit-tap-highlight-color: transparent;
          }
          .auth-btn-primary:hover:not(:disabled) { background: #2a3d5e; transform: translateY(-1px); }
          .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .auth-btn-google {
            width: 100%;
            display: inline-flex; align-items: center; justify-content: center; gap: 10px;
            padding: 13px 24px; border-radius: 999px;
            background: rgba(255,255,255,0.75); color: #2a3d5e;
            font-family: "Georgia", serif; font-size: 0.88rem; font-weight: 700;
            letter-spacing: 0.04em;
            border: 1.5px solid rgba(26,39,68,0.14); cursor: pointer;
            transition: all 0.25s ease; min-height: 50px;
            backdrop-filter: blur(8px);
            -webkit-tap-highlight-color: transparent;
          }
          .auth-btn-google:hover:not(:disabled) {
            background: rgba(255,255,255,0.92);
            border-color: rgba(90,168,224,0.4);
            transform: translateY(-1px);
          }
          .auth-btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>

        {/* Nuvem esquerda decorativa */}
        <div
          className="absolute top-[-12px] left-[-30px] w-32 opacity-50 pointer-events-none select-none"
          style={{ animation: 'floatA1 9s ease-in-out infinite' }}
        >
          <img src="/clouds/cloud1.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Nuvem direita decorativa */}
        <div
          className="absolute top-[10px] right-[-20px] w-24 opacity-35 pointer-events-none select-none"
          style={{ animation: 'floatA2 11s ease-in-out infinite' }}
        >
          <img src="/clouds/cloud2.png" alt="" draggable={false}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        <div
          className="relative z-10"
          style={{
            padding: 'clamp(28px, 6vw, 40px)',
            animation: 'authReveal 0.5s cubic-bezier(.22,1,.36,1) both',
          }}
        >

          {/* Logo + Título */}
          <DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <img
                src="/logo-transparent.svg"
                alt="Remember QRCode"
                style={{ height: 72, width: 'auto', marginBottom: 14 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ height: 1, width: 20, background: 'rgba(42,61,94,0.3)' }} />
                <span style={{
                  textTransform: 'uppercase', letterSpacing: '0.2em',
                  fontSize: '0.58rem', fontWeight: 700, color: '#2a3d5e',
                }}>
                  {isSignUp ? 'Criar conta' : 'Entrar na conta'}
                </span>
                <div style={{ height: 1, width: 20, background: 'rgba(42,61,94,0.3)' }} />
              </div>
              <DialogTitle
                style={{
                  fontFamily: '"Georgia", serif',
                  fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                  fontWeight: 700, color: '#1a2744',
                  textAlign: 'center', lineHeight: 1.2,
                }}
              >
                {isSignUp ? t('auth.signUp') : t('auth.signIn')}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isSignUp && (
              <div>
                <label className="auth-label" htmlFor="auth-name">{t('auth.name')}</label>
                <input
                  id="auth-name"
                  type="text"
                  className="auth-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="auth-name-input"
                />
              </div>
            )}

            <div>
              <label className="auth-label" htmlFor="auth-email">{t('auth.email')}</label>
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="auth-email-input"
              />
            </div>

            <div>
              <label className="auth-label" htmlFor="auth-password">{t('auth.password')}</label>
              <input
                id="auth-password"
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="auth-password-input"
              />
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
              data-testid="auth-submit-button"
              style={{ marginTop: 4 }}
            >
              {loading ? 'Carregando...' : isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </form>

          {/* Divisor */}
          <div style={{ position: 'relative', margin: '20px 0' }}>
            <div style={{ height: 1, background: 'rgba(26,39,68,0.1)' }} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              padding: '0 12px',
              fontFamily: '"Georgia", serif',
              fontSize: '0.75rem', color: 'rgba(58,80,112,0.5)',
              backdropFilter: 'blur(4px)',
            }}>
              ou
            </span>
          </div>

          {/* Botão Google */}
          <button
            className="auth-btn-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
            data-testid="google-signin-button"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </button>

          {/* Toggle cadastro/login */}
          <p style={{
            textAlign: 'center', marginTop: 20,
            fontFamily: '"Georgia", serif',
            fontSize: '0.82rem', color: 'rgba(58,80,112,0.65)',
          }}>
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              data-testid="auth-toggle-button"
              style={{
                marginLeft: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: '"Georgia", serif',
                fontSize: '0.82rem', fontWeight: 700,
                color: '#5aa8e0', textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              {isSignUp ? t('auth.signIn') : t('auth.signUp')}
            </button>
          </p>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;