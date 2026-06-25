import React, { useState } from 'react';
import { Bell, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageContext';
import { enablePush, pushSupported, pushPermission } from '@/lib/push';

interface Props {
  subscriberType: 'admin' | 'client';
  token?: string;
  trackingCode?: string;
  className?: string;
}

const PushToggle: React.FC<Props> = ({ subscriberType, token, trackingCode, className }) => {
  const { t } = useLang();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [on, setOn] = useState(() => pushSupported() && pushPermission() === 'granted');

  const handle = async () => {
    if (!pushSupported()) {
      toast({ title: t('push.unsupported'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await enablePush({ subscriberType, token, trackingCode });
      setOn(true);
      toast({ title: t('push.enabled'), description: t('push.on') });
    } catch (e: any) {
      const msg = e?.message === 'denied' ? t('push.denied')
        : e?.message === 'unsupported' ? t('push.unsupported')
        : (e?.message || 'Error');
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant={on ? 'secondary' : 'outline'} size="sm" onClick={handle} disabled={loading} className={className}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : on ? <BellRing className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
      {!loading && (on ? t('push.enabled') : t('push.enable'))}
    </Button>
  );
};

export default PushToggle;
