import { motion } from 'framer-motion';
import { Store, Star, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { toast } from 'sonner';

interface Vendor {
    id: string;
    name: string;
    category: string;
    rating: number;
    reviews: number;
    phone: string;
    email: string;
    location: string;
    image: string;
    verified: boolean;
}

const MOCK_VENDORS: Vendor[] = [
    {
        id: 'v1',
        name: 'Notaría 123 CDMX',
        category: 'Legal',
        rating: 4.8,
        reviews: 120,
        phone: '55 1234 5678',
        email: 'contacto@notaria123.com',
        location: 'Polanco, CDMX',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
        verified: true
    },
    {
        id: 'v2',
        name: 'FotoReal Estate Pro',
        category: 'Fotografía',
        rating: 5.0,
        reviews: 45,
        phone: '55 8765 4321',
        email: 'info@fotoreal.Mx',
        location: 'Servicio a domicilio',
        image: 'https://images.unsplash.com/photo-1554048612-387768052bf7?w=200&h=200&fit=crop',
        verified: true
    },
    {
        id: 'v3',
        name: 'Creditaria Hipotecas',
        category: 'Financiero',
        rating: 4.6,
        reviews: 89,
        phone: '55 1111 2222',
        email: 'hola@creditaria.com',
        location: 'Roma Norte, CDMX',
        image: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=200&h=200&fit=crop',
        verified: false
    }
];

export default function AgentVendors() {
    const handleContact = (vendorName: string) => {
        toast.info(`Iniciando contacto con ${vendorName}...`, {
            description: "Se ha abierto tu cliente de correo predeterminado."
        });
        window.location.href = `mailto:?subject=Consulta desde Agent Platform`;
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
                    <Store className="h-4 w-4" /> Partner Network
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Directorio de Proveedores</h1>
                <p className="text-muted-foreground">
                    Red de aliados verificados para agilizar tus operaciones (Notarios, Valuadores, Mantenimiento).
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_VENDORS.map((vendor) => (
                    <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row gap-4 items-center pb-2">
                            <Avatar className="h-16 w-16 border-2 border-border">
                                <AvatarImage src={vendor.image} />
                                <AvatarFallback>{vendor.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{vendor.name}</h3>
                                <Badge variant="secondary" className="mt-1">{vendor.category}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-semibold">{vendor.rating}</span>
                                <span className="text-muted-foreground">({vendor.reviews} reseñas)</span>
                            </div>
                            <div className="space-y-1 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" /> {vendor.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> {vendor.phone}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/30 pt-4">
                            <Button className="w-full gap-2" variant="outline" onClick={() => handleContact(vendor.name)}>
                                <Mail className="h-4 w-4" /> Contactar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </motion.div>
        </motion.div>
    );
}
