import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, LayoutTemplate, ExternalLink, Save, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

export default function AgentWebsite() {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [config, setConfig] = useState({
        title: 'Carlos Mendez | Real Estate',
        bio: 'Especialista en propiedades de lujo en CDMX con más de 10 años de experiencia.',
        primaryColor: '#0f172a',
        showBlog: true,
        showTestimonials: true
    });

    const handleSave = () => {
        toast.success("Cambios publicados", { description: "Tu sitio ha sido actualizado correctamente." });
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6"
        >
            {/* Config Sidebar */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
                <motion.div variants={staggerItem} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                        <Globe className="h-4 w-4" /> Personal Brand
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Website Builder</h1>
                    <p className="text-muted-foreground text-sm">
                        Personaliza tu landing page pública para captar leads.
                    </p>
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título del Sitio</Label>
                                <Input
                                    value={config.title}
                                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Biografía Corta</Label>
                                <Textarea
                                    value={config.bio}
                                    onChange={(e) => setConfig({ ...config, bio: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Color Primario</Label>
                                <div className="flex gap-2">
                                    {['#0f172a', '#2563eb', '#16a34a', '#dc2626', '#9333ea'].map((color) => (
                                        <div
                                            key={color}
                                            className={`w-8 h-8 rounded-full cursor-pointer ring-offset-2 ${config.primaryColor === color ? 'ring-2 ring-primary' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setConfig({ ...config, primaryColor: color })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Secciones</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex flex-col">
                                    <span>Mostrar Blog</span>
                                    <span className="font-normal text-xs text-muted-foreground">Artículos recientes</span>
                                </Label>
                                <Switch
                                    checked={config.showBlog}
                                    onCheckedChange={(checked) => setConfig({ ...config, showBlog: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="flex flex-col">
                                    <span>Testimonios</span>
                                    <span className="font-normal text-xs text-muted-foreground">Reseñas de clientes</span>
                                </Label>
                                <Switch
                                    checked={config.showTestimonials}
                                    onCheckedChange={(checked) => setConfig({ ...config, showTestimonials: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button className="w-full gap-2" onClick={handleSave}>
                        <Save className="h-4 w-4" /> Guardar y Publicar
                    </Button>
                </motion.div>
            </div>

            {/* Preview Area */}
            <motion.div variants={staggerItem} className="flex-1 bg-muted/50 rounded-xl border flex flex-col overflow-hidden">
                <div className="bg-background border-b p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'desktop' ? 'bg-secondary' : ''}
                            onClick={() => setViewMode('desktop')}
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={viewMode === 'mobile' ? 'bg-secondary' : ''}
                            onClick={() => setViewMode('mobile')}
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Vista Previa en Vivo
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950 overflow-auto">
                    <div
                        className={`bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 overflow-hidden flex flex-col ${viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-3xl border-4 border-slate-800' : 'w-full h-full rounded-md max-w-4xl border'
                            }`}
                    >
                        {/* Mock Website Content */}
                        <header className="p-6 flex justify-between items-center text-white" style={{ backgroundColor: config.primaryColor }}>
                            <div className="font-bold text-xl">CM.</div>
                            <nav className="hidden sm:flex gap-4 text-sm opacity-90">
                                <span>Propiedades</span>
                                <span>Blog</span>
                                <span>Contacto</span>
                            </nav>
                        </header>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-12 text-center space-y-4 bg-slate-50 dark:bg-transparent">
                                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto" />
                                <h2 className="text-3xl font-bold">{config.title}</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">{config.bio}</p>
                                <Button style={{ backgroundColor: config.primaryColor }}>Contactar Agente</Button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                                {[1, 2].map(i => (
                                    <div key={i} className="aspect-video bg-slate-100 rounded-lg border" />
                                ))}
                            </div>

                            {config.showTestimonials && (
                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50">
                                    <h3 className="text-center font-semibold mb-4">Lo que dicen mis clientes</h3>
                                    <div className="p-4 border bg-background rounded-lg text-sm italic text-center max-w-md mx-auto">
                                        "Excelente servicio y atención personalizada."
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
