import { useState } from 'react';
import { Users, Link2, Copy, Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeamProfileAgent {
  id: string;
  name: string;
  avatar?: string;
  status: string;
  role: string;
}

interface TeamProfileCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  teamDescription?: string;
  agents: TeamProfileAgent[];
  stats: {
    activeMembers: number;
    totalLeads: number;
    avgResponseRate: number;
  };
}

export function TeamProfileCard({
  open,
  onOpenChange,
  teamName,
  teamDescription,
  agents,
  stats,
}: TeamProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link del equipo copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el link');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Perfil del Equipo
          </SheetTitle>
          <SheetDescription>
            Resumen visual de tu equipo
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Card className="bg-gradient-to-br from-primary/5 to-background border rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold">{teamName}</h2>
                {teamDescription && (
                  <p className="text-sm text-muted-foreground mt-1">{teamDescription}</p>
                )}
              </div>

              {/* Avatars row */}
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  <TooltipProvider>
                    {agents.map((agent, i) => (
                      <Tooltip key={agent.id}>
                        <TooltipTrigger asChild>
                          <Avatar
                            className={cn(
                              'h-10 w-10 border-2 border-background',
                              agent.status === 'pausado' && 'opacity-50'
                            )}
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback className="text-xs">
                              {agent.name.split(' ').map((n) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{agent.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
                <Badge variant="secondary" className="ml-3">
                  {agents.length} miembros
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.activeMembers}</p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">Leads gestionados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.avgResponseRate}%</p>
                  <p className="text-xs text-muted-foreground">Resp. promedio</p>
                </div>
              </div>

              {/* Copy link */}
              <Button variant="outline" className="w-full" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar link del equipo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
