import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockListings } from '@/lib/agents/fixtures';
import { toast } from 'sonner';

export default function KioskPage() {
    const { listingId } = useParams();
    const navigate = useNavigate();
    const listing = mockListings.find(l => l.id === listingId) || mockListings[0];
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would push to useLeadStore
        setStep('success');
        toast.success("¡Registro completado!");

        // Auto reset after 5 seconds
        setTimeout(() => {
            setStep('form');
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={listing.coverImage}
                    alt="Background"
                    className="w-full h-full object-cover blur-sm opacity-50"
                />
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 rounded-full"
                onClick={() => navigate('/agents/open-house')}
            >
                <X className="h-6 w-6" />
            </Button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-lg"
            >
                <Card className="border-none shadow-2xl bg-card/95 backdrop-blur">
                    <AnimatePresence mode="wait">
                        {step === 'form' ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <CardHeader className="text-center space-y-2">
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl">Bienvenidos</CardTitle>
                                    <CardDescription className="text-base">
                                        Open House: {listing.address.street}
                                    </CardDescription>
                                    <p className="text-sm text-muted-foreground pt-2">
                                        Por favor, regístrate para ingresar.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre completo</Label>
                                            <Input id="name" required placeholder="Ej. Juan Pérez" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <Input id="email" type="email" required placeholder="juan@email.com" className="h-11" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input id="phone" type="tel" placeholder="55 1234 5678" className="h-11" />
                                        </div>
                                        <Button type="submit" size="lg" className="w-full mt-2">
                                            Registrar Visita
                                        </Button>
                                    </form>
                                </CardContent>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-12"
                            >
                                <CardContent className="space-y-4">
                                    <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">¡Gracias por tu visita!</h2>
                                    <p className="text-muted-foreground">
                                        Disfruta el recorrido. Te hemos enviado la ficha técnica a tu correo.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-8">
                                        La pantalla se reiniciará en unos segundos...
                                    </p>
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>
        </div>
    );
}
