import { useMemo, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConsumeCredits } from '@/lib/credits/query';
import { InsufficientCreditsDialog } from '@/components/agents/credits/InsufficientCreditsDialog';
import { updateListing } from '@/lib/agents/listings/store';

interface BoostDialogProps {
  listingId: string;
  cost?: number;
  options?: { label: string; cost: number; action: 'boost_24h' | 'boost_7d'; durationHours: number }[];
}

const DEFAULT_OPTIONS = [
  { label: 'Boost 24h', cost: 10, action: 'boost_24h' as const, durationHours: 24 },
  { label: 'Boost 7 días', cost: 5, action: 'boost_7d' as const, durationHours: 24 * 7 },
];

export function BoostDialog({ listingId, cost, options = DEFAULT_OPTIONS }: BoostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const [insufficientVariant, setInsufficientVariant] = useState<'balance' | 'daily_limit' | 'rule_disabled'>('balance');
  const { mutateAsync: consumeCredits } = useConsumeCredits();
  const [selected, setSelected] = useState(options[0]?.action ?? 'boost_24h');

  const track = (event: string, properties?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    }).catch(() => {});
  };

  const handleBoost = async () => {
    setLoading(true);
    try {
      const opt = options.find((o) => o.action === selected) || options[0];
      const useCost = cost ?? opt.cost;
      track('boost_started', { listingId, action: opt.action, amount: useCost, durationHours: opt.durationHours });
      const { transaction, account } = await consumeCredits({
        accountId: 'credit-1',
        amount: cost ?? options.find((o) => o.action === selected)?.cost ?? 10,
        action: selected,
        referenceType: 'listing',
        referenceId: listingId,
      });
      // mark listing featured
      const durationHours = options.find((o) => o.action === selected)?.durationHours || 24;
      const expires = new Date(Date.now() + durationHours * 3600 * 1000);
      updateListing(listingId, { featuredUntil: expires });
      track('boost_applied', { transactionId: transaction.id, listingId, amount: useCost, action: selected, featuredUntil: expires.toISOString(), balance: account?.balance });
      setTimeout(() => {
        track('boost_expired', { listingId, action: selected });
      }, durationHours * 3600 * 1000);
      toast.success('Boost aplicado. Tu listing se ha destacado.');
      setOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === 'Error: INSUFFICIENT_BALANCE' || message === 'INSUFFICIENT_BALANCE') {
        setInsufficientVariant('balance');
        setShowInsufficient(true);
        track('credits_insufficient_modal_shown', { source: 'boost', listingId, amount: cost ?? options.find((o) => o.action === selected)?.cost });
      } else if (message === 'Error: DAILY_LIMIT' || message === 'DAILY_LIMIT') {
        setInsufficientVariant('daily_limit');
        setShowInsufficient(true);
        track('credits_daily_limit_blocked', { source: 'boost', listingId });
      } else if (message === 'Error: RULE_DISABLED' || message === 'RULE_DISABLED') {
        setInsufficientVariant('rule_disabled');
        setShowInsufficient(true);
        track('credits_rule_disabled_block', { source: 'boost', listingId, action: selected });
      } else {
        toast.error('No se pudo aplicar el boost.');
        track('credit_consumption_error', { listingId, amount: cost, message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Boost</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirmar Boost</DialogTitle>
          <DialogDescription>Selecciona la duración para destacar tu listing.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {options.map((opt) => (
            <Button
              key={opt.action}
              variant={selected === opt.action ? 'default' : 'outline'}
              className="w-full justify-between"
              onClick={() => setSelected(opt.action)}
            >
              <span>{opt.label}</span>
              <span className="text-sm text-muted-foreground">{opt.cost} créditos</span>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleBoost} disabled={loading}>
            {loading ? 'Procesando...' : `Confirmar (${options.find((o) => o.action === selected)?.cost ?? cost ?? 10} créditos)`}
          </Button>
        </DialogFooter>
      </DialogContent>
      <InsufficientCreditsDialog
        open={showInsufficient}
        onClose={() => setShowInsufficient(false)}
        onRecharge={() => {
          window.location.assign('/agents/credits');
        }}
        variant={insufficientVariant}
      />
    </Dialog>
  );
}
