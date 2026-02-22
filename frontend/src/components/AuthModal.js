import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
      <DialogContent className="sm:max-w-md" data-testid="auth-modal">
        <DialogHeader>
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/logo-transparent.png" 
              alt="Remember QRCode" 
              className="h-20 w-auto mb-2"
            />
          </div>
          <DialogTitle className="text-2xl font-light text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.name')}</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="auth-name-input"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="auth-email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="auth-password-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={loading}
            data-testid="auth-submit-button"
          >
            {loading ? 'Carregando...' : isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
          data-testid="google-signin-button"
        >
          {t('auth.continueWithGoogle')}
        </Button>

        <div className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-primary hover:underline"
            data-testid="auth-toggle-button"
          >
            {isSignUp ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;