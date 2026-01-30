import { useState } from 'react';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const packages: CreditPackage[] = [
  { id: 'start', credits: 50, price: 50 },
  { id: 'pro', credits: 100, price: 90, popular: true },
  { id: 'business', credits: 500, price: 400 },
];

interface BuyCreditsDialogProps {
  onPurchase: (amount: number) => void;
  trigger?: React.ReactNode;
}

export function BuyCreditsDialog({ onPurchase, trigger }: BuyCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>('pro');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      const pkg = packages.find(p => p.id === selected);
      if (pkg) {
        onPurchase(pkg.credits);
        toast.success(`Has comprado ${pkg.credits} créditos`, {
          description: "Tu saldo ha sido actualizado."
        });
        setOpen(false);
      }
    }, 1500);
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
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handlePurchase} disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
