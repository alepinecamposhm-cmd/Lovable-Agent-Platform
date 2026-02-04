import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bath,
  Bed,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Pencil,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { updateListing, useListingStore } from '@/lib/agents/listings/store';
import { listListingActivities } from '@/lib/agents/listings/store';
import { ListingBoostDialog, ListingVerificationDialog } from '@/components/agents/listings/ListingActionDialogs';
import type { Listing, ListingActivityEvent, ListingStatus, VerificationStatus } from '@/types/agents';

const statusConfig: Record<ListingStatus, { label: string; pill: string }> = {
  draft: { label: 'Borrador', pill: 'bg-muted text-muted-foreground' },
  active: { label: 'Activo', pill: 'bg-success/10 text-success' },
  paused: { label: 'Pausado', pill: 'bg-warning/10 text-warning' },
  sold: { label: 'Vendido', pill: 'bg-primary/10 text-primary' },
  rented: { label: 'Rentado', pill: 'bg-primary/10 text-primary' },
  expired: { label: 'Expirado', pill: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Archivado', pill: 'bg-muted text-muted-foreground' },
};

const verificationConfig: Record<VerificationStatus, { label: string; icon: ElementType; color: string }> = {
  none: { label: 'Sin verificar', icon: AlertCircle, color: 'text-muted-foreground' },
  pending: { label: 'En verificación', icon: Clock, color: 'text-warning' },
  verified: { label: 'Verificado', icon: BadgeCheck, color: 'text-success' },
  rejected: { label: 'Rechazado', icon: AlertCircle, color: 'text-destructive' },
};

function track(event: string, properties?: Record<string, unknown>) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

export default function AgentListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { listings, activities } = useListingStore();
  const listing = listings.find((l) => l.id === listingId);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);
  const [closeoutOpen, setCloseoutOpen] = useState(false);
  const [closeoutStatus, setCloseoutStatus] = useState<'sold' | 'rented'>('sold');
  const [closeoutDate, setCloseoutDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [closeoutPrice, setCloseoutPrice] = useState<number>(0);
  const [closeoutBuyer, setCloseoutBuyer] = useState('');
  const [activityReady, setActivityReady] = useState(false);

  const isFeatured = Boolean(listing?.featuredUntil && listing.featuredUntil > new Date());
  const featuredDays = useMemo(() => {
    if (!listing?.featuredUntil) return 0;
    return Math.max(1, Math.ceil((listing.featuredUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [listing?.featuredUntil]);

  const activityFeed = useMemo(() => {
    if (!listingId) return [] as ListingActivityEvent[];
    try {
      return listListingActivities(listingId);
    } catch {
      return [] as ListingActivityEvent[];
    }
  }, [listingId, activities]);

  const activityState: 'loading' | 'success' | 'empty' | 'error' = !activityReady
    ? 'loading'
    : activityFeed.length
      ? 'success'
      : 'empty';

  useEffect(() => {
    if (!listingId) return;
    track('listing.detail_view', { listingId });
  }, [listingId]);

  useEffect(() => {
    setActivityReady(false);
    const t = window.setTimeout(() => setActivityReady(true), 250);
    return () => window.clearTimeout(t);
  }, [listingId]);

  useEffect(() => {
    if (!listing) return;
    setCloseoutPrice(listing.price);
  }, [listing?.id]);

  const VerificationIcon = verificationConfig[listing?.verificationStatus ?? 'none'].icon;

  const backToListings = () => {
    if (listingId) track('listing.detail_back', { listingId });
    navigate('/agents/listings');
  };

  const handleArchive = () => {
    if (!listing) return;
    updateListing(listing.id, { status: 'archived', archivedFromStatus: listing.status });
    track('listing.archive', { listingId: listing.id, from: listing.status, source: 'detail' });
    toast({ title: 'Archivado', description: 'El listing se movió a Archivados.' });
  };

  const handleRestore = () => {
    if (!listing) return;
    const to = listing.archivedFromStatus && listing.archivedFromStatus !== 'archived'
      ? listing.archivedFromStatus
      : 'draft';
    updateListing(listing.id, { status: to, archivedFromStatus: undefined });
    track('listing.restore', { listingId: listing.id, to, source: 'detail' });
    toast({ title: 'Restaurado', description: 'El listing volvió a tu inventario.' });
  };

  const handleStatusChange = (next: ListingStatus) => {
    if (!listing) return;
    if (next === 'sold' || next === 'rented') {
      setCloseoutStatus(next);
      setCloseoutOpen(true);
      track('listing.closeout_open', { listingId: listing.id, toStatus: next });
      return;
    }
    const prev = listing.status;
    updateListing(listing.id, { status: next });
    track('listing.status_change', { listingId: listing.id, from: prev, to: next, source: 'detail' });
    toast({ title: 'Estado actualizado', description: `Listing marcado como ${statusConfig[next].label}.` });
  };

  const submitCloseout = () => {
    if (!listing) return;
    const date = new Date(closeoutDate);
    if (Number.isNaN(date.getTime())) {
      toast({ title: 'Fecha inválida', variant: 'destructive' });
      return;
    }
    updateListing(listing.id, {
      status: closeoutStatus,
      soldAt: date,
      closedPrice: Number(closeoutPrice) || undefined,
      closedBuyerName: closeoutBuyer.trim() || undefined,
    });
    track('listing.closeout_submit', {
      listingId: listing.id,
      toStatus: closeoutStatus,
      hasBuyerName: Boolean(closeoutBuyer.trim()),
      finalPrice: Number(closeoutPrice) || undefined,
    });
    toast({ title: 'Cierre registrado', description: `Listing marcado como ${statusConfig[closeoutStatus].label}.` });
    setCloseoutOpen(false);
  };

  const engagement = useMemo(() => {
    if (!listing) return [];
    return [
      { label: 'Vistas', icon: Eye, value: listing.viewCount },
      { label: 'Guardados', icon: Heart, value: listing.saveCount },
      { label: 'Consultas', icon: MessageSquare, value: listing.inquiryCount },
    ];
  }, [listing]);

  if (!listing) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={backToListings} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Propiedades
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Propiedad no encontrada.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={staggerItem} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={backToListings}>
              <ArrowLeft className="h-4 w-4" />
              Volver a Propiedades
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/agents/listings/${listing.id}/edit`} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  track('listing.action_click', { listingId: listing.id, action: 'boost_open', source: 'detail' });
                  setBoostOpen(true);
                }}
              >
                <Sparkles className="h-4 w-4 text-warning" />
                Boost
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  track('listing.action_click', { listingId: listing.id, action: 'verification_open', source: 'detail' });
                  setVerifyOpen(true);
                }}
                disabled={listing.verificationStatus === 'verified'}
              >
                <VerificationIcon className={cn('h-4 w-4', verificationConfig[listing.verificationStatus].color)} />
                {listing.verificationStatus === 'rejected' ? 'Reintentar' : 'Verificar'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">ID {listing.id}</p>
              <h1 className="text-2xl font-bold leading-tight">{listing.address.street}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.address.city}, {listing.address.state}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="capitalize">{listing.propertyType}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{listing.listingType === 'rent' ? 'Renta' : 'Venta'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusConfig[listing.status].pill}>{statusConfig[listing.status].label}</Badge>
              <Badge variant="secondary" className="gap-1">
                <VerificationIcon className={cn('h-4 w-4', verificationConfig[listing.verificationStatus].color)} />
                {verificationConfig[listing.verificationStatus].label}
              </Badge>
              {isFeatured && (
                <Badge className="bg-warning text-warning-foreground gap-1">
                  <Sparkles className="h-3 w-3" />
                  Destacado · {featuredDays}d
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

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
                <p className="text-3xl font-bold">
                  {formatCurrency(listing.price, listing.currency)}
                  {listing.listingType === 'rent' && <span className="text-sm font-normal"> /mes</span>}
                </p>
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
                  <DetailItem label="Estatus" value={statusConfig[listing.status].label} />
                  <DetailItem label="Publicación" value={listing.listedAt?.toLocaleDateString() || '—'} />
                  <DetailItem label="Verificación" value={verificationConfig[listing.verificationStatus].label} />
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
                {(listing.status === 'sold' || listing.status === 'rented') && (
                  <div className="pt-2 text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Cierre: {listing.soldAt ? listing.soldAt.toLocaleDateString() : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Precio final: {listing.closedPrice ? formatCurrency(listing.closedPrice, listing.currency) : '—'}</span>
                    </div>
                    {listing.closedBuyerName && (
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4" />
                        <span>Comprador: {listing.closedBuyerName}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={listing.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                  >
                    Activo
                  </Button>
                  <Button
                    variant={listing.status === 'paused' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('paused')}
                  >
                    Pausado
                  </Button>
                  <Button
                    variant={listing.status === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('draft')}
                  >
                    Borrador
                  </Button>
                  <Button
                    variant={listing.status === 'sold' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('sold')}
                  >
                    Vendido
                  </Button>
                  <Button
                    variant={listing.status === 'rented' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('rented')}
                  >
                    Rentado
                  </Button>
                </div>

                <Separator />

                {listing.status === 'archived' ? (
                  <Button variant="outline" className="w-full gap-2" onClick={handleRestore}>
                    <RotateCcw className="h-4 w-4" />
                    Restaurar listing
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full gap-2" onClick={handleArchive}>
                    <AlertCircle className="h-4 w-4" />
                    Archivar listing
                  </Button>
                )}

                <p className="text-xs text-muted-foreground">
                  Mantén el estatus actualizado para reflejar disponibilidad en el marketplace.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <span className="flex items-center gap-2">
                    <VerificationIcon className={cn('h-4 w-4', verificationConfig[listing.verificationStatus].color)} />
                    {verificationConfig[listing.verificationStatus].label}
                  </span>
                </div>
                {listing.verificationDocs?.length ? (
                  <p className="text-xs text-muted-foreground">
                    {listing.verificationDocs.length} documento(s) enviados.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sube documentos para iniciar la revisión.
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  variant={listing.verificationStatus === 'verified' ? 'secondary' : 'default'}
                  onClick={() => setVerifyOpen(true)}
                  disabled={listing.verificationStatus === 'verified'}
                >
                  {listing.verificationStatus === 'rejected' ? <AlertCircle className="h-4 w-4" /> : <BadgeCheck className="h-4 w-4" />}
                  {listing.verificationStatus === 'rejected' ? 'Reintentar verificación' : 'Solicitar verificación'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <ListingVerificationDialog
        listing={listing}
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onVerify={() => {}}
      />

      <ListingBoostDialog
        listing={listing}
        open={boostOpen}
        onOpenChange={setBoostOpen}
        onBoost={() => {}}
      />

      <Dialog open={closeoutOpen} onOpenChange={setCloseoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar cierre</DialogTitle>
            <DialogDescription>
              {statusConfig[closeoutStatus].label}: <strong>{listing.address.street}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="closeDate">Fecha</Label>
              <Input id="closeDate" type="date" value={closeoutDate} onChange={(e) => setCloseoutDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="closePrice">Precio final</Label>
              <Input id="closePrice" type="number" value={String(closeoutPrice)} onChange={(e) => setCloseoutPrice(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="closeBuyer">Comprador (opcional)</Label>
              <Input id="closeBuyer" value={closeoutBuyer} onChange={(e) => setCloseoutBuyer(e.target.value)} placeholder="Nombre del comprador" />
            </div>
            <p className="text-xs text-muted-foreground">
              Esto retirará la propiedad del marketplace.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCloseoutOpen(false)}>Cancelar</Button>
            <Button onClick={submitCloseout}>Guardar cierre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
