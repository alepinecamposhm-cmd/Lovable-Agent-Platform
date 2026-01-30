import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Download, Share2, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useMarketingStore } from '@/lib/agents/marketing/store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { Skeleton } from '@/components/ui/skeleton';

export default function AgentMarketing() {
    const {
        templates,
        fetchTemplates,
        isLoading,
        generateDesign,
        isGenerating,
        generatedAsset,
        clearGenerated
    } = useMarketingStore();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleGenerate = (templateId: string) => {
        // Mock listing ID, in real app would open a listing selector first
        generateDesign(templateId, 'listing-123');
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={staggerItem} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                    <Palette className="h-4 w-4" /> Marketing Center
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Diseños y Redes Sociales</h1>
                <p className="text-muted-foreground">
                    Crea materiales visuales profesionales para tus propiedades en segundos.
                </p>
            </motion.div>

            {/* Templates Grid */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    templates.map((template) => (
                        <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="aspect-[4/5] overflow-hidden relative">
                                <img
                                    src={template.thumbnailUrl}
                                    alt={template.title}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleGenerate(template.id)}
                                        className="gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Diseñar
                                    </Button>
                                </div>
                                <Badge className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border-none text-white">
                                    {template.type}
                                </Badge>
                            </div>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base truncate">{template.title}</CardTitle>
                                <CardDescription className="text-xs">{template.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </motion.div>

            {/* Generation Dialog */}
            <Dialog open={!!generatedAsset || isGenerating} onOpenChange={(open) => !open && !isGenerating && clearGenerated()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{isGenerating ? 'Generando diseño...' : '¡Listo para compartir!'}</DialogTitle>
                        <DialogDescription>
                            {isGenerating
                                ? 'Nuestra IA está adaptando el diseño con los datos de tu propiedad.'
                                : 'Tu material de marketing ha sido generado exitosamente.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center py-6">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground animate-pulse">Personalizando colores y textos...</p>
                            </div>
                        ) : (
                            generatedAsset && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="rounded-lg overflow-hidden border shadow-lg relative"
                                >
                                    <img src={generatedAsset} alt="Generated" className="max-h-[300px] object-contain" />
                                </motion.div>
                            )
                        )}
                    </div>

                    {!isGenerating && (
                        <DialogFooter className="sm:justify-between gap-2">
                            <Button variant="ghost" onClick={clearGenerated}>Cerrar</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" className="gap-2">
                                    <Download className="h-4 w-4" /> Descargar
                                </Button>
                                <Button className="gap-2">
                                    <Share2 className="h-4 w-4" /> Publicar
                                </Button>
                            </div>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
