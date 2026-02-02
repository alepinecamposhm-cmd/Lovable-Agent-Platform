import { useMemo, useState } from 'react';
import { Check, CreditCard, Loader2, Mail, Receipt, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePurchaseCredits, useSendReceiptEmail } from '@/lib/credits/query';
import { format } from 'date-fns';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}

interface ReceiptInfo {
  id: string;
  amount: number;
  credits: number;
  createdAt?: string | Date;
  paymentMethod?: string;
}

const packages: CreditPackage[] = [
  { id: 'start', credits: 50, price: 50 },
  { id: 'pro', credits: 100, price: 90, popular: true },
  { id: 'business', credits: 500, price: 400 },
];

interface BuyCreditsDialogProps {
  accountId?: string;
  trigger?: React.ReactNode;
}

const track = (event: string, properties?: Record<string, unknown>) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
};

export function BuyCreditsDialog({ accountId = 'credit-1', trigger }: BuyCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>('pro');
  const [receipt, setReceipt] = useState<ReceiptInfo | null>(null);

  const { mutateAsync, isPending } = usePurchaseCredits();
  const { mutateAsync: sendReceiptEmail, isPending: emailSending } = useSendReceiptEmail();

  const pkgSelected = useMemo(() => packages.find(p => p.id === selected), [selected]);

  const handlePurchase = async () => {
    if (!pkgSelected) return;
    track('credits_purchase_start', { packageId: pkgSelected.id, credits: pkgSelected.credits, price: pkgSelected.price });
    try {
      const result = await mutateAsync({
        accountId,
        packageId: pkgSelected.id,
        credits: pkgSelected.credits,
        price: pkgSelected.price,
      });
      setReceipt(result.receipt);
      toast.success(`Has comprado ${pkgSelected.credits} créditos`, {
        description: 'Tu saldo ha sido actualizado.',
      });
      track('credits_purchase_complete', { packageId: pkgSelected.id, credits: pkgSelected.credits, price: pkgSelected.price });
      track('credits_purchase_receipt_view', { receiptId: result.receipt.id, amount: result.receipt.amount });
    } catch (e) {
      toast.error('No se pudo procesar el pago, intenta otra tarjeta.');
      track('credits_purchase_error', { packageId: pkgSelected?.id, message: String(e) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Comprar Créditos</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recargar Créditos</DialogTitle>
          <DialogDescription>
            Elige un paquete de créditos para destacar propiedades y adquirir leads premium.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-muted/50",
                  selected === pkg.id ? "border-primary bg-primary/5" : "border-muted"
                )}
                onClick={() => setSelected(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 text-[10px]">
                    Popular
                  </Badge>
                )}
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="text-2xl font-bold">{pkg.credits}</span>
                  <span className="text-xs text-muted-foreground uppercase font-medium">Créditos</span>
                  <span className="mt-2 font-semibold text-lg">${pkg.price}</span>
                </div>
                {selected === pkg.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-4 mt-2">
            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Método de pago</p>
              <p className="text-xs text-muted-foreground">Visa terminada en 4242</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7">Cambiar</Button>
          </div>

          {receipt && (
            <Card className="p-3 flex items-start gap-3">
              <Receipt className="h-4 w-4 text-primary mt-1" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Recibo #{receipt.id}</p>
                <p className="text-muted-foreground">Pago ${receipt.amount} · {receipt.credits} créditos · {receipt.paymentMethod || 'Visa 4242'}</p>
                <p className="text-muted-foreground text-xs">
                  {receipt.createdAt ? format(new Date(receipt.createdAt), 'd MMM y, HH:mm') : ''}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const blob = new Blob(
                        [`Recibo ${receipt.id}\nCréditos: ${receipt.credits}\nMonto: $${receipt.amount}\nMétodo: ${receipt.paymentMethod}\nFecha: ${new Date(receipt.createdAt || new Date()).toLocaleString()}`],
                        { type: 'text/plain' }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `recibo-${receipt.id}.txt`;
                      a.click();
                    }}
                  >
                    <Share className="h-3.5 w-3.5 mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={emailSending}
                    className="text-xs"
                    onClick={async () => {
                      try {
                        await sendReceiptEmail({ receiptId: receipt.id, email: 'agent@example.com' });
                        toast.success('Recibo enviado por email');
                        track('credits_receipt_email_sent', { receiptId: receipt.id });
                      } catch (err) {
                        toast.error('No se pudo enviar el recibo');
                      }
                    }}
                  >
                    {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5 mr-1" />}
                    Enviar email
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handlePurchase} disabled={isPending} className="min-w-[140px]">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Confirmar pago${pkgSelected ? ` ($${pkgSelected.price})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
