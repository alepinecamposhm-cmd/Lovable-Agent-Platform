import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TeamV2Settings } from '@/lib/team/teamV2Workspace';

interface TeamSettingsFormProps {
  settings: TeamV2Settings;
  onSave: (settings: Pick<TeamV2Settings, 'name' | 'description'>) => void;
}

export function TeamSettingsForm({ settings, onSave }: TeamSettingsFormProps) {
  const [name, setName] = useState(settings.name);
  const [description, setDescription] = useState(settings.description);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    setName(settings.name);
    setDescription(settings.description);
    setErrors({});
  }, [settings]);

  const validate = () => {
    const nextErrors: { name?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 3) {
      nextErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const hasChanges =
    name.trim() !== settings.name || description.trim() !== settings.description;

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave({
      name: name.trim(),
      description: description.trim(),
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Configuración general</h3>
          <p className="text-sm text-muted-foreground">
            Edita la información base del equipo.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-name">Nombre del equipo</Label>
        <Input
          id="team-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors({});
          }}
          placeholder="Ej: Equipo Polanco"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="team-description">
          Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="team-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe tu equipo..."
          rows={4}
          maxLength={500}
        />
        <p className="text-right text-xs text-muted-foreground">{description.length}/500</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  );
}

