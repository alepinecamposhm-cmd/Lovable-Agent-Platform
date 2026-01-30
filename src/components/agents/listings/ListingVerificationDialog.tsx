import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ListingVerificationDialog({ listingId }: { listingId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate upload
        setTimeout(() => {
            setLoading(false);
            setVerified(true);
            toast.success("Documentos enviados", { description: "El equipo de legal revisará tu solicitud en <24h." });
            setTimeout(() => setOpen(false), 2000);
        }, 1500);
    };

    if (verified) {
        return (
            <Button variant="outline" className="gap-2 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 pointer-events-none">
                <ShieldCheck className="h-4 w-4" /> Pendiente de Aprobación
            </Button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <ShieldCheck className="h-4 w-4" /> Solicitar Verificación
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Verificar Propiedad</DialogTitle>
                    <DialogDescription>
                        Sube la documentación legal para obtener la insignia de "Verificado" y aumentar la confianza.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="title">Título de Propiedad / Escritura</Label>
                            <Input id="title" type="file" required />
                            <p className="text-[10px] text-muted-foreground">PDF máximo 10MB.</p>
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="id">Identificación Oficial (Propietario)</Label>
                            <Input id="id" type="file" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" /> Enviar a Revisión
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
