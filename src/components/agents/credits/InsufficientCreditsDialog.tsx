import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onRecharge: () => void;
  variant?: 'balance' | 'daily_limit' | 'rule_disabled';
  meta?: { dailyLimit?: number; spentToday?: number };
}

export function InsufficientCreditsDialog({ open, onClose, onRecharge, variant = 'balance', meta }: Props) {
  const title =
    variant === 'daily_limit'
      ? 'Límite diario alcanzado'
      : variant === 'rule_disabled'
        ? 'Regla deshabilitada'
        : 'Saldo insuficiente';
  const description =
    variant === 'daily_limit'
      ? `Has gastado ${meta?.spentToday ?? 0} créditos hoy. Límite diario: ${meta?.dailyLimit ?? '—'}.`
      : variant === 'rule_disabled'
        ? 'Esta acción está deshabilitada en tus reglas de consumo. Actívala en Créditos.'
        : 'Necesitas recargar créditos para completar esta acción.';

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onRecharge}>Recargar créditos</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
