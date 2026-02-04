import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Sparkles, UploadCloud } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { InsufficientCreditsDialog } from '@/components/agents/credits/InsufficientCreditsDialog';
import { useConsumeCredits, useCreditAccount } from '@/lib/credits/query';
import { updateListing } from '@/lib/agents/listings/store';
import type { Listing, VerificationDoc } from '@/types/agents';

interface VerificationDialogProps {
    listing: Listing;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerify: () => void;
}

export function ListingVerificationDialog({ listing, open, onOpenChange, onVerify }: VerificationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.length) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const docs: VerificationDoc[] = files.map((f) => ({
                id: `doc-${globalThis.crypto?.randomUUID?.() || Date.now()}-${f.name}`,
                filename: f.name,
                mimeType: f.type,
                size: f.size,
            }));

            updateListing(listing.id, {
                verificationStatus: 'pending',
                verificationSubmittedAt: new Date(),
                verificationDocs: docs,
                verificationReviewNote: undefined,
            });

            fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify({ event: 'listing.verification_submit', properties: { listingId: listing.id, docCount: docs.length } }),
            }).catch(() => {});

            onVerify();
            toast({
                title: 'Solicitud enviada',
                description: 'Revisión en curso. Te notificaremos cuando haya cambios.',
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
                        <label
                            htmlFor="doc"
                            className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Arrastra un archivo o haz clic</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG o PNG hasta 5MB</p>
                            <Input
                                id="doc"
                                type="file"
                                className="hidden"
                                accept="application/pdf,image/*"
                                multiple
                                onChange={(e) => {
                                    const next = Array.from(e.target.files || []);
                                    setFiles(next);
                                }}
                            />
                        </label>
                        {files.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {files.length} archivo(s): {files.map((f) => f.name).join(', ')}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded flex gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>La verificación aumenta la confianza de los compradores y añade un badge oficial a tu listing.</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading || files.length === 0}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (listing.verificationStatus === 'rejected' ? 'Reintentar' : 'Enviar solicitud')}
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
    const [showInsufficient, setShowInsufficient] = useState(false);
    const [insufficientVariant, setInsufficientVariant] = useState<'balance' | 'daily_limit' | 'rule_disabled'>('balance');
    const { mutateAsync: consumeCredits } = useConsumeCredits();
    const { data: creditAccount } = useCreditAccount();
    const [selected, setSelected] = useState<'boost_24h' | 'boost_7d'>('boost_24h');

    const options = useMemo(() => {
        const rule24 = creditAccount?.rules?.find((r: any) => r.action === 'boost_24h');
        const rule7d = creditAccount?.rules?.find((r: any) => r.action === 'boost_7d');
        return [
            { action: 'boost_24h' as const, label: 'Boost 24h', durationHours: 24, cost: rule24?.cost ?? 10, enabled: rule24?.isEnabled ?? true },
            { action: 'boost_7d' as const, label: 'Boost 7 días', durationHours: 24 * 7, cost: rule7d?.cost ?? 5, enabled: rule7d?.isEnabled ?? true },
        ];
    }, [creditAccount]);

    const handleBoost = async () => {
        const opt = options.find((o) => o.action === selected) || options[0];
        if (!opt.enabled) {
            setInsufficientVariant('rule_disabled');
            setShowInsufficient(true);
            return;
        }
        setLoading(true);
        try {
            fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify({ event: 'boost_started', properties: { listingId: listing.id, action: opt.action, amount: opt.cost, durationHours: opt.durationHours } }),
            }).catch(() => {});

            const { transaction, account } = await consumeCredits({
                accountId: 'credit-1',
                amount: opt.cost,
                action: opt.action,
                referenceType: 'listing',
                referenceId: listing.id,
            });

            const featuredUntil = new Date(Date.now() + opt.durationHours * 60 * 60 * 1000);
            updateListing(listing.id, { featuredUntil });

            fetch('/api/analytics', {
                method: 'POST',
                body: JSON.stringify({
                    event: 'boost_applied',
                    properties: { transactionId: transaction.id, listingId: listing.id, featuredUntil: featuredUntil.toISOString(), action: opt.action, amount: opt.cost, balance: account?.balance },
                }),
            }).catch(() => {});

            onBoost();
            toast({
                title: 'Boost aplicado',
                description: `Tu listing estará destacado por ${opt.action === 'boost_24h' ? '24h' : '7 días'}.`,
            });
            onOpenChange(false);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            if (message === 'INSUFFICIENT_BALANCE') {
                setInsufficientVariant('balance');
                setShowInsufficient(true);
            } else if (message === 'DAILY_LIMIT') {
                setInsufficientVariant('daily_limit');
                setShowInsufficient(true);
            } else if (message === 'RULE_DISABLED') {
                setInsufficientVariant('rule_disabled');
                setShowInsufficient(true);
            } else {
                toast({ title: 'No se pudo aplicar el boost', variant: 'destructive' });
            }
        } finally {
            setLoading(false);
        }
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
                    <div className="space-y-2">
                        {options.map((opt) => (
                            <Button
                                key={opt.action}
                                type="button"
                                variant={selected === opt.action ? 'default' : 'outline'}
                                className="w-full justify-between"
                                onClick={() => setSelected(opt.action)}
                                disabled={!opt.enabled && selected !== opt.action}
                            >
                                <span className="flex items-center gap-2">
                                    {opt.label}
                                    {!opt.enabled && (
                                        <span className="text-xs text-muted-foreground">(No disponible)</span>
                                    )}
                                </span>
                                <span className="text-sm text-muted-foreground">{opt.cost} créditos</span>
                            </Button>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                        Se debitarán {options.find((o) => o.action === selected)?.cost ?? 0} créditos de tu saldo actual.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleBoost} disabled={loading} className="bg-warning text-warning-foreground hover:bg-warning/90">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Boost'}
                    </Button>
                </DialogFooter>
            </DialogContent>

            <InsufficientCreditsDialog
                open={showInsufficient}
                variant={insufficientVariant}
                onClose={() => setShowInsufficient(false)}
                onRecharge={() => window.location.assign('/agents/credits')}
            />
        </Dialog>
    );
}
