import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bed,
  Bath,
  CheckCircle,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldHalf,
  Square,
  Upload,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useListingStore, listListingActivities } from '@/lib/agents/listings/store';
import { addAppointment } from '@/lib/agents/appointments/store';
import { add as addNotification } from '@/lib/agents/notifications/store';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import type { Listing, ListingStatus, VerificationStatus } from '@/types/agents';

const statusConfig: Record<ListingStatus, { label: string; color: string; pill: string }> = {
  draft: { label: 'Borrador', color: 'text-muted-foreground', pill: 'bg-muted text-muted-foreground' },
  active: { label: 'Activo', color: 'text-success', pill: 'bg-success/10 text-success' },
  paused: { label: 'Pausado', color: 'text-warning', pill: 'bg-warning/10 text-warning' },
  sold: { label: 'Vendido', color: 'text-primary', pill: 'bg-primary/10 text-primary' },
  rented: { label: 'Rentado', color: 'text-primary', pill: 'bg-primary/10 text-primary' },
  expired: { label: 'Expirado', color: 'text-destructive', pill: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Archivado', color: 'text-muted-foreground', pill: 'bg-muted text-muted-foreground' },
};

const verificationConfig: Record<VerificationStatus, { label: string; icon: React.ElementType; color: string }> = {
  none: { label: 'Sin verificar', icon: AlertCircle, color: 'text-muted-foreground' },
  pending: { label: 'Pendiente', icon: ShieldHalf, color: 'text-warning' },
  verified: { label: 'Verificado', icon: BadgeCheck, color: 'text-success' },
  rejected: { label: 'Rechazado', icon: AlertCircle, color: 'text-destructive' },
};

export default function AgentListingDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const { listings } = useListingStore();
  const listing = listings.find((l) => l.id === params.listingId);
  const [status, setStatus] = useState<ListingStatus>(listing?.status ?? 'draft');
  const [verification, setVerification] = useState<VerificationStatus>(listing?.verificationStatus ?? 'none');
  const [activityState, setActivityState] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [activityFeed, setActivityFeed] = useState<ReturnType<typeof listListingActivities>>([]);
  const [openHouseDate, setOpenHouseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [openHouseTime, setOpenHouseTime] = useState('12:00');
  const [scheduling, setScheduling] = useState(false);

  if (!listing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Propiedad no encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  const engagement = useMemo(
    () => [
      { label: 'Vistas', icon: Eye, value: listing.viewCount },
      { label: 'Guardados', icon: Heart, value: listing.saveCount },
      { label: 'Consultas', icon: MessageSquare, value: listing.inquiryCount },
    ],
    [listing]
  );

  const handleBoost = (duration: '24h' | '7d') => {
    toast({
      title: `Boost ${duration} activado`,
      description: 'Tu listing subirá posiciones y notificaremos a leads compatibles.',
    });
  };

  const handleVerify = () => {
    setVerification('pending');
    toast({
      title: 'Solicitud enviada',
      description: 'Equipo de verificación revisará la evidencia en &lt;24h.',
    });
  };

  const handleStatus = (newStatus: ListingStatus) => {
    setStatus(newStatus);
    toast({
      title: 'Estado actualizado',
      description: `Listing marcado como ${statusConfig[newStatus].label}.`,
    });
  };

  const VerificationIcon = verificationConfig[verification].icon;

  const scheduleOpenHouse = () => {
    if (!listing) return;
    setScheduling(true);
    try {
      const [hours, minutes] = openHouseTime.split(':').map(Number);
      const date = new Date(openHouseDate);
      date.setHours(hours || 12, minutes || 0, 0, 0);
      const pseudoLead = {
        id: `open-house-${listing.id}`,
        firstName: 'Open House',
        lastName: listing.address.street,
        stage: 'appointment_set' as const,
        temperature: 'warm' as const,
        assignedTo: listing.agentId,
        source: 'manual' as const,
        interestedIn: 'buy' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const apt = addAppointment({
        scheduledAt: date,
        duration: 90,
        leadId: pseudoLead.id,
        lead: pseudoLead as any,
        agentId: listing.agentId,
        listingId: listing.id,
        listing,
        type: 'open_house',
        status: 'pending',
        location: listing.address.street,
        notes: 'Open house auto-creado desde listing',
      });
      addNotification({
        type: 'appointment',
        title: 'Open house creado',
        body: `${listing.address.street} · ${date.toLocaleString()}`,
        actionUrl: '/agents/calendar',
      });
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'openhouse.create', listingId: listing.id, appointmentId: apt.id } }));
      toast({ title: 'Open house programado', description: 'Se añadió al calendario (mock local).' });
      setScheduling(false);
    } catch (e) {
      setScheduling(false);
      toast({ title: 'Error', description: 'No se pudo crear el open house', variant: 'destructive' });
    }
  };

  useEffect(() => {
    try {
      if (!listing) {
        setActivityState('empty');
        return;
      }
      const events = listListingActivities(listing.id);
      if (!events.length) {
        setActivityState('empty');
      } else {
        setActivityFeed(events);
        setActivityState('success');
      }
    } catch (e) {
      setActivityState('error');
    }
  }, [listing?.id]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <motion.div variants={staggerItem} className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Volver a Propiedades
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">ID {listing.id}</p>
            <h1 className="text-2xl font-bold leading-tight">{listing.address.street}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{listing.address.city}, {listing.address.state}</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="capitalize">{listing.propertyType}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>{listing.listingType === 'rent' ? 'Renta' : 'Venta'}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="flex items-center gap-2">
          <Badge className={statusConfig[status].pill}>{statusConfig[status].label}</Badge>
          <Badge variant="secondary" className="gap-1">
            <VerificationIcon className={cn('h-4 w-4', verificationConfig[verification].color)} />
            {verificationConfig[verification].label}
          </Badge>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleVerify}>
            <Upload className="h-4 w-4" />
            Verificar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => handleBoost('24h')}>
            <Zap className="h-4 w-4" />
            Boost 24h
          </Button>
        </motion.div>
      </div>

      {/* Hero and stats */}
      <motion.div variants={staggerItem} className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="relative">
            {listing.media[0] ? (
              <img
                src={listing.media[0].url}
                alt={listing.address.street}
                className="w-full aspect-[16/9] object-cover"
              />
            ) : (
              <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
                <Square className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold">
                  ${listing.price.toLocaleString()}
                  {listing.listingType === 'rent' && <span className="text-sm font-normal"> /mes</span>}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm mt-2">
                {listing.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" /> {listing.bedrooms} hab
                  </span>
                )}
                {listing.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" /> {listing.bathrooms} baños
                  </span>
                )}
                {listing.squareFeet && (
                  <span className="flex items-center gap-1">
                    <Square className="h-4 w-4" /> {listing.squareFeet} m²
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {engagement.map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-muted/50 text-center">
                <stat.icon className="h-4 w-4 mx-auto text-muted-foreground" />
                <p className="text-xl font-semibold mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Actividad del listing</CardTitle>
              <Badge variant="outline">{activityFeed.length} eventos</Badge>
            </CardHeader>
            <CardContent>
              {activityState === 'loading' && (
                <p className="text-sm text-muted-foreground">Cargando actividad…</p>
              )}
              {activityState === 'error' && (
                <p className="text-sm text-destructive">Error al cargar el feed. Reintenta.</p>
              )}
              {activityState === 'empty' && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>No hay actividad aún.</p>
                  <p className="text-xs">Tip: comparte el listing o actívalo para generar visitas.</p>
                </div>
              )}
              {activityState === 'success' && (
                <div className="space-y-3">
                  {activityFeed.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <Badge variant="secondary" className="capitalize">
                        {event.type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {event.type === 'view' && 'Nueva vista'}
                          {event.type === 'save' && 'Guardado en favoritos'}
                          {event.type === 'unsave' && 'Favorito removido'}
                          {event.type === 'inquiry' && 'Nueva consulta'}
                          {event.type === 'share' && 'Compartido'}
                        </p>
                        {event.metadata?.message && (
                          <p className="text-sm text-muted-foreground">{String(event.metadata.message)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {event.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <DetailItem label="Tipo" value={listing.propertyType} />
                <DetailItem label="Estatus" value={statusConfig[status].label} />
                <DetailItem label="Publicación" value={listing.listedAt?.toLocaleDateString() || '—'} />
                <DetailItem label="Verificación" value={verificationConfig[verification].label} />
              </div>
              <Separator />
              <p className="text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
              {listing.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4">
                <BoostDialog listingId={listing.id} cost={10} />
                <BuyCreditsDialog onPurchase={(credits) => {
                  // Local optimistic update: append ledger entry
                  // For demo only; real backend would update
                  // eslint-disable-next-line no-console
                  console.log('purchased', credits);
                }} />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList className="mb-3">
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="status">Estatus</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Actividad reciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'ev1', label: '45 views hoy (+180%)', icon: Eye },
                    { id: 'ev2', label: '2 leads preguntaron por verificación', icon: AlertCircle },
                    { id: 'ev3', label: 'Boost recomendado para fin de semana', icon: Zap },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <item.icon className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cambiar estado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(['active', 'paused', 'draft', 'archived'] as ListingStatus[]).map((option) => (
                      <Button
                        key={option}
                        variant={status === option ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatus(option)}
                      >
                        {statusConfig[option].label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mantén estatus actualizado para reflejar disponibilidad en el marketplace.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Programar Open House</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <input
                    type="date"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={openHouseDate}
                    onChange={(e) => setOpenHouseDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Hora</p>
                  <input
                    type="time"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={openHouseTime}
                    onChange={(e) => setOpenHouseTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Se creará un evento tipo “open_house” en Calendario con persistencia local (mock).
              </p>
              <Button className="w-full gap-2" onClick={scheduleOpenHouse} disabled={scheduling}>
                {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Crear open house
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link to="/agents/leads">Notificar leads similares</Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleBoost('7d')}>
                Boost 7 días (50 créditos)
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/agents/credits" className="gap-2">
                  <ShieldHalf className="h-4 w-4" />
                  Costos y reglas
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conversión estimada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Visitas → Leads: {Math.round(listing.viewCount / Math.max(listing.inquiryCount, 1))}:1</p>
              <p>Leads → Citas: 35% (promedio agente)</p>
              <p>Tiempo publicación: {listing.listedAt ? listing.listedAt.toLocaleDateString() : '—'}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
