import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Loader2, KeyRound } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

const CreateAdmin: React.FC = () => {
  const { superInvoke } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; prefix: string; tempPassword: string } | null>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await superInvoke('createAdmin', form);
      setResult({ name: res.admin.name, prefix: res.admin.admin_prefix, tempPassword: res.tempPassword });
    } catch {
      toast({ title: t('nc.failed'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (result) {
      navigator.clipboard.writeText(`Username: ${result.name}\nPassword: ${result.tempPassword}`);
      toast({ title: t('nc.copied') });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/super-admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader><CardTitle>{t('ca.title')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('ca.name')} *</Label>
              <Input id="name" value={form.name} onChange={set('name')} required placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('ca.email')}</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('ca.phone')}</Label>
              <Input id="phone" value={form.phone} onChange={set('phone')} placeholder="+33 ..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">{t('ca.company')}</Label>
              <Input id="company" value={form.companyName} onChange={set('companyName')} placeholder="Optional" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('ca.create')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!result} onOpenChange={(o) => { if (!o) { setResult(null); navigate('/super-admin/dashboard'); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> {t('ca.created')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('ca.share')}</p>
          <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t('ca.username')}</span><span className="font-medium">{result?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('ca.trackingPrefix')}</span><span className="font-mono">{result?.prefix}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('ca.tempPassword')}</span><span className="font-mono font-semibold">{result?.tempPassword}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copy}><Copy className="w-4 h-4 mr-2" /> {t('common.copy')}</Button>
            <Button onClick={() => { setResult(null); navigate('/super-admin/dashboard'); }}>{t('common.done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateAdmin;