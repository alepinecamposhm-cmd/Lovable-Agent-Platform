import { Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MemberInfoCardProps {
  email: string;
  phone?: string;
  joinedAt: Date;
}

export function MemberInfoCard({ email, phone, joinedAt }: MemberInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Información de Contacto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email}</p>
          </div>
        </div>

        {phone && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{phone}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Miembro desde</p>
            <p className="font-medium">
              {format(joinedAt, "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
