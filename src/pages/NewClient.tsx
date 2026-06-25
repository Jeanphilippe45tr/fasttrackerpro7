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

const NewClient: React.FC = () => {
  const { adminInvoke } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    clientName: '', phone: '', email: '', shipmentDescription: '',
    origin: '', destination: '', status: 'pending',
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
      toast({ title: 'Failed to create client', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <Card>
        <CardHeader><CardTitle>Add a new client</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client name *</Label>
                <Input id="clientName" value={form.clientName} onChange={set('clientName')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={set('status')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={form.origin} onChange={set('origin')} placeholder="e.g. Paris, France" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={form.destination} onChange={set('destination')} placeholder="e.g. Berlin, Germany" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Shipment description</Label>
              <Textarea id="desc" value={form.shipmentDescription} onChange={set('shipmentDescription')} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create client & generate tracking code'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!created} onOpenChange={(o) => { if (!o) navigate('/admin/dashboard'); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Client created</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Share this unique tracking code with your client.</p>
          <div className="rounded-lg border bg-muted/40 p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tracking code</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{created?.tracking_code}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(created?.tracking_code); toast({ title: 'Copied' }); }}>
              <Copy className="w-4 h-4 mr-2" /> Copy code
            </Button>
            <Button onClick={() => navigate('/admin/dashboard')}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewClient;