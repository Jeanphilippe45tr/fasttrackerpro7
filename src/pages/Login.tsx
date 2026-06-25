import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) {
      toast({ title: t('login.failed'), description: res.error, variant: 'destructive' });
      return;
    }
    const role = res.user!.role;
    if (role === 'super_admin') navigate('/super-admin/dashboard');
    else if (res.user!.mustChangePassword) navigate('/admin/settings');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <LogIn className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">{t('login.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('login.username')}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.username')} autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('login.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;