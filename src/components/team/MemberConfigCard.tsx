import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MemberConfigCardProps {
  weight: number;
  isPaused: boolean;
  onWeightChange: (weight: number) => void;
  onPauseToggle: (paused: boolean) => void;
}

export function MemberConfigCard({
  weight,
  isPaused,
  onWeightChange,
  onPauseToggle,
}: MemberConfigCardProps) {
  const [localWeight, setLocalWeight] = useState(weight);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = localWeight !== weight;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onWeightChange(localWeight);
    setIsSaving(false);
    toast.success('Configuración guardada');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Configuración de Ruteo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Peso de distribución</Label>
            <span className="font-bold text-lg">{localWeight}%</span>
          </div>
          <Slider
            value={[localWeight]}
            onValueChange={([value]) => setLocalWeight(value)}
            max={100}
            step={5}
            className="w-full"
            disabled={isPaused}
          />
          <p className="text-xs text-muted-foreground">
            Este porcentaje determina cuántos leads nuevos recibe este agente
            en comparación con el resto del equipo.
          </p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-0.5">
            <Label>Recibir nuevos leads</Label>
            <p className="text-sm text-muted-foreground">
              {isPaused
                ? 'No recibirá leads mientras esté pausado'
                : 'Recibe leads según su peso configurado'}
            </p>
          </div>
          <Switch
            checked={!isPaused}
            onCheckedChange={(checked) => onPauseToggle(!checked)}
          />
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
