import { useState } from 'react';
import { Pause, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TeamMemberRole } from '@/types';

interface BulkActionToolbarProps {
  selectedIds: Set<string>;
  memberNames: Map<string, string>;
  onPause: (ids: string[]) => void;
  onChangeRole: (ids: string[], newRole: TeamMemberRole) => void;
  onClear: () => void;
}

export function BulkActionToolbar({
  selectedIds,
  memberNames,
  onPause,
  onChangeRole,
  onClear,
}: BulkActionToolbarProps) {
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agente'>('agente');
  const [isProcessing, setIsProcessing] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const selectedNames = Array.from(selectedIds)
    .map((id) => memberNames.get(id) || 'Desconocido');

  const handlePause = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    onPause(Array.from(selectedIds));
    setIsProcessing(false);
    setPauseDialogOpen(false);
    onClear();
  };

  const handleChangeRole = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 400));
    onChangeRole(Array.from(selectedIds), selectedRole);
    setIsProcessing(false);
    setRoleDialogOpen(false);
    onClear();
  };

  return (
    <>
      {/* Floating toolbar */}
      <div
        className={cn(
          'fixed bottom-4 inset-x-0 mx-auto max-w-lg z-50',
          'bg-card border shadow-xl rounded-xl px-6 py-3',
          'animate-in slide-in-from-bottom-4 fade-in duration-200'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium whitespace-nowrap">
            {count} seleccionado{count > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPauseDialogOpen(true)}
              disabled={isProcessing}
            >
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Pausar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleDialogOpen(true)}
              disabled={isProcessing}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Cambiar rol
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pause confirmation */}
      <AlertDialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Pausar {count} agente{count > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Los siguientes agentes dejarán de recibir nuevos leads:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button
              onClick={handlePause}
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isProcessing ? 'Pausando...' : 'Pausar todos'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change role dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar rol de {count} agente{count > 1 ? 's' : ''}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Selecciona el nuevo rol para:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
                <RadioGroup
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as 'admin' | 'agente')}
                  className="mt-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="bulk-admin" />
                    <Label htmlFor="bulk-admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agente" id="bulk-agente" />
                    <Label htmlFor="bulk-agente">Agente</Label>
                  </div>
                </RadioGroup>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole} disabled={isProcessing}>
              {isProcessing ? 'Actualizando...' : 'Cambiar rol'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
