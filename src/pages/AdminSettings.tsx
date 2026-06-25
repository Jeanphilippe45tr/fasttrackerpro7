import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, KeyRound, AlertCircle } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

const AdminSettings: React.FC = () => {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast({ title: t('set.mismatch'), variant: 'destructive' });
      return;
    }
    if (form.next.length < 6) {
      toast({ title: t('set.tooShort'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await changePassword(form.current, form.next);
    setLoading(false);
    if (!res.ok) {
      toast({ title: 'Failed', description: res.error, variant: 'destructive' });
      return;
    }
    toast({ title: t('set.updated') });
    setForm({ current: '', next: '', confirm: '' });
    navigate('/admin/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> {t('set.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.mustChangePassword && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/10 text-primary p-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{t('set.must')}</span>
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">{t('set.current')}</Label>
              <Input id="current" type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">{t('set.next')}</Label>
              <Input id="next" type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t('set.confirm')}</Label>
              <Input id="confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('set.update')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;