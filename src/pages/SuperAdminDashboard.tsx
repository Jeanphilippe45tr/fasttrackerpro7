import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, LogOut, Users, Eye, Loader2, Shield } from 'lucide-react';
import { useLang } from '@/i18n/LanguageContext';

interface AdminRow {
  id: string; name: string; email: string; phone: string;
  company_name: string; admin_prefix: string; is_active: boolean; created_at: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { superInvoke, logout, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewClients, setViewClients] = useState<{ name: string; clients: any[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await superInvoke('listAdmins');
      setAdmins(res.admins ?? []);
    } catch {
      toast({ title: 'Failed to load admins', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [superInvoke, toast]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (a: AdminRow) => {
    await superInvoke('toggleActive', { id: a.id, isActive: !a.is_active });
    toast({ title: a.is_active ? t('sa.deactivate') : t('sa.activate') });
    load();
  };

  const deleteAdmin = async (a: AdminRow) => {
    await superInvoke('deleteAdmin', { id: a.id });
    toast({ title: t('cd.deleted') });
    load();
  };

  const showClients = async (a: AdminRow) => {
    const res = await superInvoke('adminClients', { id: a.id });
    setViewClients({ name: a.name, clients: res.clients ?? [] });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('sa.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('sa.welcome')}, {user?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/super-admin/create-admin')}>
            <UserPlus className="w-4 h-4 mr-2" /> {t('sa.createAdmin')}
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="w-4 h-4 mr-2" /> {t('adm.dash.logout')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{t('sa.total')}</p>
          <p className="text-3xl font-bold">{admins.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{t('sa.active')}</p>
          <p className="text-3xl font-bold">{admins.filter(a => a.is_active).length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{t('sa.inactive')}</p>
          <p className="text-3xl font-bold">{admins.filter(a => !a.is_active).length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> {t('sa.allAdmins')}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : admins.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center">{t('sa.noAdmins')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sa.name')}</TableHead>
                    <TableHead>{t('sa.email')}</TableHead>
                    <TableHead>{t('sa.prefix')}</TableHead>
                    <TableHead>{t('sa.created')}</TableHead>
                    <TableHead>{t('sa.status')}</TableHead>
                    <TableHead className="text-right">{t('sa.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.email || '—'}</TableCell>
                      <TableCell><Badge variant="secondary">{a.admin_prefix}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={a.is_active ? 'default' : 'outline'}>
                          {a.is_active ? t('sa.active') : t('sa.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => showClients(a)} title="View clients">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleActive(a)}>
                          {a.is_active ? t('sa.deactivate') : t('sa.activate')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {a.name}?</AlertDialogTitle>
                              <AlertDialogDescription>{t('sa.deleteDesc')}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAdmin(a)}>{t('common.delete')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewClients} onOpenChange={(o) => !o && setViewClients(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{viewClients?.name} — {t('sa.clientsTitle')}</DialogTitle></DialogHeader>
          {viewClients && viewClients.clients.length === 0 ? (
            <p className="text-muted-foreground py-4">{t('sa.noClientsYet')}</p>
          ) : (
            <div className="overflow-x-auto max-h-[60vh]">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>{t('adm.dash.client')}</TableHead><TableHead>{t('adm.dash.trackingCode')}</TableHead>
                  <TableHead>{t('adm.dash.route')}</TableHead><TableHead>{t('adm.dash.status')}</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {viewClients?.clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.client_name}</TableCell>
                      <TableCell><Badge variant="secondary">{c.tracking_code}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{c.origin} → {c.destination}</TableCell>
                      <TableCell>{c.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;