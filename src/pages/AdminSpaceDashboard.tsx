import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, LogOut, Settings, Loader2, Package, Search, Copy } from 'lucide-react';

const statusColor: Record<string, string> = {
  pending: 'outline', in_transit: 'default', delivered: 'secondary', failed: 'destructive',
};

const AdminSpaceDashboard: React.FC = () => {
  const { adminInvoke, logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await adminInvoke('listClients');
      setClients(res.clients ?? []);
    } catch {
      toast({ title: 'Failed to load clients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [adminInvoke, toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter((c) =>
    `${c.client_name} ${c.tracking_code} ${c.destination} ${c.origin}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {user?.name} · prefix <span className="font-mono">{user?.prefix}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/clients/new')}>
            <UserPlus className="w-4 h-4 mr-2" /> Add client
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(['pending', 'in_transit', 'delivered', 'failed'] as const).map((s) => (
          <Card key={s}><CardContent className="p-5">
            <p className="text-sm text-muted-foreground capitalize">{s.replace('_', ' ')}</p>
            <p className="text-3xl font-bold">{clients.filter((c) => c.status === s).length}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>My clients</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">No clients found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Client</TableHead><TableHead>Tracking code</TableHead>
                  <TableHead>Route</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/admin/clients/${c.id}`)}>
                      <TableCell className="font-medium">{c.client_name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{c.tracking_code}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 ml-1"
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.tracking_code); toast({ title: 'Tracking code copied' }); }}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.origin || '—'} → {c.destination || '—'}</TableCell>
                      <TableCell><Badge variant={(statusColor[c.status] as any) || 'outline'}>{c.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${c.id}`); }}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSpaceDashboard;