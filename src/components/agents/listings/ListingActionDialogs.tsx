import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, Check, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Listing } from '@/types/agents';

interface VerificationDialogProps {
    listing: Listing;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerify: () => void;
}

export function ListingVerificationDialog({ listing, open, onOpenChange, onVerify }: VerificationDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onVerify();
            toast.success("Solicitud enviada", {
                description: "Revisaremos tus documentos en las próximas 24h."
            });
            onOpenChange(false);
        }, 1500);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verificar Propiedad</DialogTitle>
                    <DialogDescription>
                        Sube documentos que acrediten tu autorización para vender/rentar esta propiedad ({listing.address.street}).
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="doc">Documento de Propiedad / Autorización</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Arrastra un archivo o haz clic</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG hasta 5MB</p>
                            <Input id="doc" type="file" className="hidden" required />
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded flex gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>La verificación aumenta la confianza de los compradores y añade un badge oficial a tu listing.</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar solicitud'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface BoostDialogProps {
    listing: Listing;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBoost: () => void;
}

export function ListingBoostDialog({ listing, open, onOpenChange, onBoost }: BoostDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleBoost = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onBoost();
            toast.success("¡Propiedad Destacada!", {
                description: "Tu listing aparecerá en los primeros resultados por 7 días."
            });
            // tracking mock: listing boost
            window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'listing.boost', listingId: listing.id, duration: '7d' } }));
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-warning" />
                        Destacar Propiedad
                    </DialogTitle>
                    <DialogDescription>
                        Aumenta la visibilidad de <strong>{listing.address.street}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/30 flex justify-between items-center">
                        <div>
                            <p className="font-medium">Boost Semanal</p>
                            <p className="text-sm text-muted-foreground">+30% vistas estimadas</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold">10</span>
                            <span className="text-xs text-muted-foreground block">créditos</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Se debitarán 10 créditos de tu saldo actual.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleBoost} disabled={loading} className="bg-warning text-warning-foreground hover:bg-warning/90">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Boost'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
