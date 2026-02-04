import { useMemo, useState } from 'react';
import { Check, CreditCard, Loader2, Mail, Receipt, Share } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fetchInvoicePdf, usePurchaseCredits, useSendReceiptEmail } from '@/lib/credits/query';
import { format } from 'date-fns';
import { downloadBlob } from '@/lib/credits/download';
import { PAYMENT_METHODS, type PaymentMethodId, getPaymentMethod } from '@/lib/credits/paymentMethods';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/agents/team/store';

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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

const track = (event: string, properties?: Record<string, unknown>) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
};

export function BuyCreditsDialog({
  accountId = 'credit-1',
  trigger,
  open: openProp,
  onOpenChange,
  showTrigger = true,
}: BuyCreditsDialogProps) {
  const navigate = useNavigate();
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const open = openProp ?? openUncontrolled;
  const setOpen = onOpenChange ?? setOpenUncontrolled;
  const [selected, setSelected] = useState<string>('pro');
  const [receipt, setReceipt] = useState<ReceiptInfo | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<PaymentMethodId>('card_4242');

  const { mutateAsync, isPending } = usePurchaseCredits();
  const { mutateAsync: sendReceiptEmail, isPending: emailSending } = useSendReceiptEmail();

  const pkgSelected = useMemo(() => packages.find(p => p.id === selected), [selected]);
  const paymentMethod = useMemo(() => getPaymentMethod(paymentMethodId), [paymentMethodId]);

  const handlePurchase = async () => {
    if (!pkgSelected) return;
    track('credits_purchase_start', { packageId: pkgSelected.id, credits: pkgSelected.credits, price: pkgSelected.price, paymentMethodId });
    try {
      const result = await mutateAsync({
        accountId,
        packageId: pkgSelected.id,
        credits: pkgSelected.credits,
        price: pkgSelected.price,
        paymentMethodId,
      });
      setReceipt(result.receipt);
      toast.success('Compra realizada. Recibo generado.', {
        description: `+${pkgSelected.credits} créditos · ${paymentMethod.label}`,
        action: {
          label: 'Ver en Facturas',
          onClick: () => {
            setOpen(false);
            navigate('/agents/credits?tab=invoices');
          },
        },
      });
      track('credits_purchase_complete', { packageId: pkgSelected.id, credits: pkgSelected.credits, price: pkgSelected.price, paymentMethodId });
      track('credits_purchase_receipt_view', { receiptId: result.receipt.id, amount: result.receipt.amount });

      const email = getCurrentUser().email || 'agent@example.com';
      track('credits_receipt_email_auto_attempt', { receiptId: result.receipt.id, email });
      sendReceiptEmail({ receiptId: result.receipt.id, email })
        .then(() => {
          track('credits_receipt_email_auto_result', { receiptId: result.receipt.id, ok: true });
        })
        .catch(() => {
          toast.error('No se pudo enviar el recibo (puedes reintentar)');
          track('credits_receipt_email_auto_result', { receiptId: result.receipt.id, ok: false });
        });
    } catch (e) {
      toast.error('No se pudo procesar el pago, intenta otra tarjeta.');
      track('credits_purchase_error', { packageId: pkgSelected?.id, message: String(e) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          {trigger || <Button>Comprar Créditos</Button>}
        </DialogTrigger>
      ) : null}
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
              <p className="text-xs text-muted-foreground">{paymentMethod.label}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-7" disabled={isPending}>
                  Cambiar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PAYMENT_METHODS.map((m) => (
                  <DropdownMenuItem
                    key={m.id}
                    onSelect={() => {
                      const prev = paymentMethodId;
                      setPaymentMethodId(m.id);
                      track('credits_payment_method_change', { from: prev, to: m.id });
                    }}
                  >
                    {m.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {receipt && (
            <Card className="p-3 flex items-start gap-3">
              <Receipt className="h-4 w-4 text-primary mt-1" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Recibo #{receipt.id}</p>
                <p className="text-muted-foreground">Pago ${receipt.amount} · {receipt.credits} créditos · {receipt.paymentMethod || paymentMethod.label}</p>
                <p className="text-muted-foreground text-xs">
                  {receipt.createdAt ? format(new Date(receipt.createdAt), 'd MMM y, HH:mm') : ''}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={async () => {
                      try {
                        const blob = await fetchInvoicePdf(receipt.id);
                        downloadBlob(blob, `recibo-${receipt.id}.pdf`);
                        track('credits_invoice_pdf_download', { receiptId: receipt.id, source: 'purchase_receipt_card' });
                      } catch (err) {
                        toast.error('No se pudo descargar el PDF');
                      }
                    }}
                  >
                    <Share className="h-3.5 w-3.5 mr-1" />
                    Descargar PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={emailSending}
                    className="text-xs"
                    onClick={async () => {
                      try {
                        const email = getCurrentUser().email || 'agent@example.com';
                        await sendReceiptEmail({ receiptId: receipt.id, email });
                        toast.success('Recibo enviado por email');
                        track('credits_receipt_email_manual', { receiptId: receipt.id });
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
