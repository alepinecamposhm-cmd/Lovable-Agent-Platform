import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MonitorPlay, ScanFace, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { mockListings } from '@/lib/agents/fixtures';

export default function AgentOpenHouse() {
    const navigate = useNavigate();

    const handleLaunch = (id: string) => {
        navigate(`/kiosk/${id}`);
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
                    <ScanFace className="h-4 w-4" /> Kiosco Digital
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Open House Mode</h1>
                <p className="text-muted-foreground">
                    Convierte tu dispositivo (tablet/laptop) en un punto de registro para visitantes.
                </p>
            </motion.div>

            <motion.div variants={staggerItem} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockListings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden flex flex-col">
                        <div className="aspect-video w-full overflow-hidden relative">
                            <img
                                src={listing.coverImage}
                                alt={listing.address.street}
                                className="object-cover w-full h-full"
                            />
                            <Badge className="absolute top-2 right-2">{listing.status.replace('_', ' ')}</Badge>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-base truncate">{listing.address.street}</CardTitle>
                            <CardDescription>{listing.address.colonia}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span>{listing.features.beds} Rec • {listing.features.baths} Baños</span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button className="w-full gap-2" onClick={() => handleLaunch(listing.id)}>
                                <MonitorPlay className="h-4 w-4" />
                                Lanzar Kiosco
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </motion.div>
        </motion.div>
    );
}
