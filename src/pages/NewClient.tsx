import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

const NewClient: React.FC = () => {
  const { adminInvoke } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [form, setForm] = useState({
    clientName: '', phone: '', email: '', shipmentDescription: '',
    origin: '', destination: '', status: 'pending', transportMode: 'road',
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any | null>(null);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target ? e.target.value : e });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    setLoading(true);
    try {
      const res = await adminInvoke('createClient', form);
      setCreated(res.client);
    } catch {
      toast({ title: t('nc.failed'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </Button>
      <Card>
        <CardHeader><CardTitle>{t('nc.title')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">{t('nc.clientName')} *</Label>
                <Input id="clientName" value={form.clientName} onChange={set('clientName')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('nc.phone')}</Label>
                <Input id="phone" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('nc.email')}</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="space-y-2">
                <Label>{t('nc.status')}</Label>
                <Select value={form.status} onValueChange={set('status')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('opt.pending')}</SelectItem>
                    <SelectItem value="in_transit">{t('opt.in_transit')}</SelectItem>
                    <SelectItem value="delivered">{t('opt.delivered')}</SelectItem>
                    <SelectItem value="failed">{t('opt.failed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">{t('nc.origin')}</Label>
                <Input id="origin" value={form.origin} onChange={set('origin')} placeholder="e.g. Paris, France" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">{t('nc.destination')}</Label>
                <Input id="destination" value={form.destination} onChange={set('destination')} placeholder="e.g. Berlin, Germany" />
              </div>
              <div className="space-y-2">
                <Label>{t('nc.transportMode')}</Label>
                <Select value={form.transportMode} onValueChange={set('transportMode')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road">{t('mode.road')}</SelectItem>
                    <SelectItem value="sea">{t('mode.sea')}</SelectItem>
                    <SelectItem value="air">{t('mode.air')}</SelectItem>
                    <SelectItem value="rail">{t('mode.rail')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">{t('nc.description')}</Label>
              <Textarea id="desc" value={form.shipmentDescription} onChange={set('shipmentDescription')} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('nc.create')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!created} onOpenChange={(o) => { if (!o) navigate('/admin/dashboard'); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> {t('nc.created')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('nc.share')}</p>
          <div className="rounded-lg border bg-muted/40 p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t('adm.dash.trackingCode')}</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{created?.tracking_code}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(created?.tracking_code); toast({ title: t('nc.copied') }); }}>
              <Copy className="w-4 h-4 mr-2" /> {t('nc.copyCode')}
            </Button>
            <Button onClick={() => navigate('/admin/dashboard')}>{t('common.done')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewClient;