import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/i18n/LanguageContext';

export const EXTRA_FIELDS = [
  'sender_name', 'sender_phone', 'sender_email', 'sender_address', 'receiver_address',
  'package_weight', 'package_dimensions', 'package_type', 'package_quantity',
  'declared_value', 'package_contents', 'special_instructions',
] as const;

type Props = { values: Record<string, any>; onChange: (key: string, value: string) => void };

const F: React.FC<{ k: string; values: any; onChange: Props['onChange']; type?: string; ph?: string; area?: boolean }> = ({ k, values, onChange, type, ph, area }) => {
  const { t } = useLang();
  return (
    <div className={`space-y-2 ${area ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={k}>{t(`sx.${k}`)}</Label>
      {area
        ? <Textarea id={k} rows={2} value={values[k] || ''} onChange={(e) => onChange(k, e.target.value)} />
        : <Input id={k} type={type} placeholder={ph} value={values[k] || ''} onChange={(e) => onChange(k, e.target.value)} />}
    </div>
  );
};

const ShipmentExtraFields: React.FC<Props> = ({ values, onChange }) => {
  const { t } = useLang();
  const p = { values, onChange };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3 text-secondary">{t('sx.senderTitle')}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F k="sender_name" {...p} />
          <F k="sender_phone" {...p} type="tel" />
          <F k="sender_email" {...p} type="email" />
          <F k="sender_address" {...p} />
          <F k="receiver_address" {...p} area />
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3 text-secondary">{t('sx.packageTitle')}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <F k="package_weight" {...p} ph="e.g. 12 kg" />
          <F k="package_dimensions" {...p} ph="e.g. 40 × 30 × 20 cm" />
          <F k="package_type" {...p} ph="e.g. Box, Pallet, Envelope" />
          <F k="package_quantity" {...p} ph="e.g. 2" />
          <F k="declared_value" {...p} ph="e.g. 250 €" />
          <F k="package_contents" {...p} />
          <F k="special_instructions" {...p} area />
        </div>
      </div>
    </div>
  );
};

export default ShipmentExtraFields;
