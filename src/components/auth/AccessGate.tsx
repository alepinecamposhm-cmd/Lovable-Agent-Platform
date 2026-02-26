import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import type { Capability } from '@/lib/permissions/capabilities';
import { useAccess } from '@/lib/permissions/useAccess';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccessGateProps {
  cap: Capability;
  children: ReactNode;
  fallback?: ReactNode;
}

export function AccessGate({ cap, children, fallback }: AccessGateProps) {
  const access = useAccess();

  if (access.can(cap)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="py-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-warning mt-0.5" />
          <div className="space-y-3">
            <div>
              <p className="font-medium">No tienes permisos para ver esta sección</p>
              <p className="text-sm text-muted-foreground">Cambia de vista o vuelve al dashboard.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/agents/overview">Ir a Dashboard</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
