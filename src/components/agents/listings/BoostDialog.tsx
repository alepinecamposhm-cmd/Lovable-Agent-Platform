import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';

interface BoostDialogProps {
  listingId: string;
  cost: number;
}

export function BoostDialog({ listingId, cost }: BoostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBoost = async () => {
    setLoading(true);
    const idempotencyKey = `boost-${listingId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    try {
      track('credit_consumption_started', { listingId, action: 'boost', amount: cost });
      const res = await fetch('/api/credits/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'idempotency-key': idempotencyKey },
        body: JSON.stringify({ accountId: 'credit-1', amount: cost, action: 'boost_24h', referenceType: 'listing', referenceId: listingId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'consume failed');
      track('credit_consumption_confirmed', { transactionId: json.transaction.id, listingId, amount: cost });
      toast.success('Boost aplicado. Tu listing se ha destacado.');
      setOpen(false);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Boost 24h</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar Boost</DialogTitle>
          <DialogDescription>
            Este Boost consumirá <strong>{cost} créditos</strong> y destacará tu listing por 24 horas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleBoost} disabled={loading}>{loading ? 'Procesando...' : `Confirmar (${cost} crédits)`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
