import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedbackItem {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    tags: string[];
}

const mockFeedback: FeedbackItem[] = [
    {
        id: '1',
        customerName: 'Roberto Gómez',
        rating: 5,
        comment: 'Excelente atención, muy puntual y conocía bien la zona.',
        date: 'Hace 2 días',
        tags: ['Puntualidad', 'Conocimiento']
    },
    {
        id: '2',
        customerName: 'Ana María Sur',
        rating: 4,
        comment: 'Todo bien, aunque tardó un poco en enviar la documentación final.',
        date: 'Hace 5 días',
        tags: ['Seguimiento']
    },
    {
        id: '3',
        customerName: 'Carlos D.',
        rating: 5,
        comment: 'Nos encantó el tour virtual, muy profesional.',
        date: 'Hace 1 semana',
        tags: ['Tour', 'Profesionalismo']
    }
];

export function CustomerFeedbackDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">Ver feedback reciente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Opiniones de Clientes
                        <Badge variant="secondary" className="gap-1 text-xs font-normal">
                            4.6 <Star className="h-3 w-3 fill-primary text-primary" />
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Comentarios recolectados automáticamente post-visita.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                        {mockFeedback.map((item) => (
                            <div key={item.id} className="p-4 rounded-lg bg-muted/30 space-y-2 border">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{item.customerName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{item.customerName}</p>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3 w-3 ${i < item.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{item.date}</span>
                                </div>

                                <p className="text-sm">{item.comment}</p>

                                <div className="flex flex-wrap gap-1 pt-1">
                                    {item.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-[10px] bg-background">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="bg-primary/5 p-3 rounded-lg flex items-center gap-3 text-xs text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <p>
                        Tip: Responder al feedback positivo aumenta un 20% la retención de clientes referidos.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
