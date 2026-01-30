import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export interface RoutingRule {
    id: string;
    zone: string;
    priceMin?: number;
    assignToEmail: string;
}

interface RoutingRulesDialogProps {
    initialRules?: RoutingRule[];
    teamMembers: { email: string; name: string }[];
}

export function RoutingRulesDialog({ initialRules = [], teamMembers }: RoutingRulesDialogProps) {
    const [open, setOpen] = useState(false);
    const [rules, setRules] = useState<RoutingRule[]>(initialRules.length > 0 ? initialRules : [
        { id: '1', zone: 'Polanco', assignToEmail: 'lucia@realty.com' } // Mock default
    ]);

    // New rule form state
    const [newZone, setNewZone] = useState('');
    const [newAssignee, setNewAssignee] = useState('');

    const handleAddRule = () => {
        if (!newZone || !newAssignee) return;

        const newRule: RoutingRule = {
            id: Math.random().toString(36).substr(2, 9),
            zone: newZone,
            assignToEmail: newAssignee
        };

        setRules([...rules, newRule]);
        setNewZone('');
        setNewAssignee('');
        toast.success("Regla agregada (borrador)");
    };

    const handleRemoveRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const handleSave = () => {
        // Here we would sync with backend
        toast.success("Reglas de ruteo actualizadas", {
            description: `Se aplicarán a los nuevos leads entrantes.`
        });
        setOpen(false);
    };

    const getMemberName = (email: string) => teamMembers.find(m => m.email === email)?.name || email;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full">Editar reglas</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Reglas de Ruteo de Leads</DialogTitle>
                    <DialogDescription>
                        Configura cómo se asignan automáticamente los leads según su zona de interés.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2 items-end border-b pb-4">
                        <div className="grid gap-1.5 flex-1">
                            <Label>Zona / Ciudad</Label>
                            <Input
                                placeholder="Ej. Condesa, Roma Norte..."
                                value={newZone}
                                onChange={(e) => setNewZone(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label>Asignar a</Label>
                            <Select value={newAssignee} onValueChange={setNewAssignee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar agente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teamMembers.map(member => (
                                        <SelectItem key={member.email} value={member.email}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddRule} disabled={!newZone || !newAssignee}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Reglas Activas ({rules.length})</h4>
                        {rules.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No hay reglas definidas. Los leads se asignarán manualmente.</p>
                        )}
                        <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                            {rules.map((rule) => (
                                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{rule.zone}</Badge>
                                        <span className="text-sm text-muted-foreground">→</span>
                                        <span className="text-sm font-medium">{getMemberName(rule.assignToEmail)}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveRule(rule.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
