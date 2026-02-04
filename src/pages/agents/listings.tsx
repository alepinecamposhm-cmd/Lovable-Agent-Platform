import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Eye,
  Heart,
  MessageSquare,
  MoreHorizontal,
  MapPin,
  Bed,
  Bath,
  Square,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Pencil,
  PauseCircle,
  PlayCircle,
  Archive,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { deleteListing, updateListing, useListingStore } from '@/lib/agents/listings/store';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Listing, ListingStatus, VerificationStatus } from '@/types/agents';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ListingVerificationDialog, ListingBoostDialog } from '@/components/agents/listings/ListingActionDialogs';

const statusConfig: Record<ListingStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-muted text-muted-foreground' },
  active: { label: 'Activo', color: 'bg-success/10 text-success' },
  paused: { label: 'Pausado', color: 'bg-warning/10 text-warning' },
  sold: { label: 'Vendido', color: 'bg-primary/10 text-primary' },
  rented: { label: 'Rentado', color: 'bg-primary/10 text-primary' },
  expired: { label: 'Expirado', color: 'bg-destructive/10 text-destructive' },
  archived: { label: 'Archivado', color: 'bg-muted text-muted-foreground' },
};

const verificationConfig: Record<VerificationStatus, { icon: typeof CheckCircle; color: string }> = {
  none: { icon: AlertCircle, color: 'text-muted-foreground' },
  pending: { icon: Clock, color: 'text-warning' },
  verified: { icon: CheckCircle, color: 'text-success' },
  rejected: { icon: AlertCircle, color: 'text-destructive' },
};

function ListingCard({ listing, onRestored }: { listing: Listing; onRestored: () => void }) {
  const status = statusConfig[listing.status];
  const verification = verificationConfig[listing.verificationStatus];
  const VerificationIcon = verification.icon;
  const isFeatured = listing.featuredUntil && listing.featuredUntil > new Date();
  const remainingDays = isFeatured
    ? Math.max(1, Math.ceil((listing.featuredUntil!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const canDelete = listing.inquiryCount === 0;

  const [showVerify, setShowVerify] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [processing, setProcessing] = useState<null | 'archive' | 'delete'>(null);

  const track = (event: string, properties?: Record<string, unknown>) => {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event, properties }),
    }).catch(() => {});
  };

  const setStatus = (next: ListingStatus) => {
    const prev = listing.status;
    updateListing(listing.id, { status: next });
    track('listing.status_change', { listingId: listing.id, from: prev, to: next, source: 'list' });
    toast({ title: 'Estado actualizado', description: `Listing marcado como ${statusConfig[next].label}.` });
  };

  const restore = () => {
    const to = listing.archivedFromStatus && listing.archivedFromStatus !== 'archived'
      ? listing.archivedFromStatus
      : 'draft';
    updateListing(listing.id, { status: to, archivedFromStatus: undefined });
    track('listing.restore', { listingId: listing.id, to });
    toast({ title: 'Restaurado', description: 'El listing volvió a tu listado.' });
    onRestored();
  };

  const archive = () => {
    setProcessing('archive');
    const from = listing.status;
    updateListing(listing.id, { status: 'archived', archivedFromStatus: from });
    track('listing.archive', { listingId: listing.id, from });
    toast({ title: 'Archivado', description: 'El listing se movió a Archivados.' });
    setProcessing(null);
    setConfirmArchive(false);
  };

  const remove = () => {
    setProcessing('delete');
    const ok = deleteListing(listing.id);
    if (ok) {
      track('listing.delete', { listingId: listing.id });
      toast({ title: 'Eliminado', description: 'El listing se eliminó de tu inventario.' });
    } else {
      toast({ title: 'No se pudo eliminar', variant: 'destructive' });
    }
    setProcessing(null);
    setConfirmDelete(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="group"
      >
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3]">
            {listing.media[0] ? (
              <img
                src={listing.media[0].url}
                alt={listing.address.street}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Square className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="absolute top-2 left-2 flex gap-1">
              <Badge className={status.color}>
                {status.label}
              </Badge>
              {listing.verificationStatus === 'verified' && (
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              )}
              {listing.verificationStatus === 'pending' && (
                <Badge className="bg-warning/10 text-warning border-warning/20">
                  <Clock className="h-3 w-3 mr-1" />
                  En verificación
                </Badge>
              )}
              {listing.verificationStatus === 'rejected' && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Rechazado
                </Badge>
              )}
              {isFeatured && (
                <Badge className="bg-warning text-warning-foreground border-warning/40">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Destacado · {remainingDays}d
                </Badge>
              )}
            </div>

            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    asChild
                    onSelect={() => track('listing.action_click', { listingId: listing.id, action: 'edit' })}
                  >
                    <Link to={`/agents/listings/${listing.id}/edit`} className="flex items-center gap-2 w-full">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>

                  {listing.verificationStatus !== 'verified' ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        track('listing.action_click', { listingId: listing.id, action: 'verification_open' });
                        setShowVerify(true);
                      }}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {listing.verificationStatus === 'rejected' ? 'Reintentar verificación' : 'Solicitar verificación'}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem disabled>
                      <CheckCircle className="h-4 w-4 mr-2 text-success" />
                      Verificado
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onSelect={() => {
                      track('listing.action_click', { listingId: listing.id, action: 'boost_open' });
                      setShowBoost(true);
                    }}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-warning" />
                    Destacar (Boost)
                  </DropdownMenuItem>

                  {listing.status === 'archived' ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        track('listing.action_click', { listingId: listing.id, action: 'restore' });
                        restore();
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar
                    </DropdownMenuItem>
                  ) : listing.status === 'active' ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        track('listing.action_click', { listingId: listing.id, action: 'pause' });
                        setStatus('paused');
                      }}
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pausar
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onSelect={() => {
                        track('listing.action_click', { listingId: listing.id, action: 'activate' });
                        setStatus('active');
                      }}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Activar
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {listing.status !== 'archived' && (
                    <DropdownMenuItem
                      onSelect={() => {
                        track('listing.action_click', { listingId: listing.id, action: 'archive' });
                        setConfirmArchive(true);
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archivar
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onSelect={() => {
                      if (!canDelete) {
                        toast({
                          title: 'No se puede eliminar',
                          description: 'Este listing tiene consultas. Te recomendamos archivarlo.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      track('listing.action_click', { listingId: listing.id, action: 'delete' });
                      setConfirmDelete(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar{!canDelete ? ' (bloqueado)' : ''}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white font-bold text-lg">
                ${listing.price.toLocaleString()}
                {listing.listingType === 'rent' && <span className="text-sm font-normal">/mes</span>}
              </p>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{listing.address.street}, {listing.address.city}</span>
              </div>
              <VerificationIcon className={cn('h-4 w-4 shrink-0', verification.color)} />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {listing.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  <span>{listing.bedrooms}</span>
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  <span>{listing.bathrooms}</span>
                </div>
              )}
              {listing.squareFeet && (
                <div className="flex items-center gap-1">
                  <Square className="h-3.5 w-3.5" />
                  <span>{listing.squareFeet} m²</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{listing.saveCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{listing.inquiryCount}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/agents/listings/${listing.id}`}>
                  Ver más
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ListingVerificationDialog
        listing={listing}
        open={showVerify}
        onOpenChange={setShowVerify}
        onVerify={() => {
          track('listing.verification_submit', { listingId: listing.id, docCount: listing.verificationDocs?.length ?? 0 });
        }}
      />

      <ListingBoostDialog
        listing={listing}
        open={showBoost}
        onOpenChange={setShowBoost}
        onBoost={() => {
          track('boost_applied', { listingId: listing.id });
        }}
      />

      <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar archivo</AlertDialogTitle>
            <AlertDialogDescription>
              El listing se moverá a la sección de Archivados y dejará de aparecer en tus activos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing === 'archive'}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={processing === 'archive'} onClick={archive}>
              {processing === 'archive' ? 'Procesando…' : 'Archivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar propiedad</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción afecta visibilidad y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing === 'delete'}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={processing === 'delete'} onClick={remove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {processing === 'delete' ? 'Procesando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function AgentListings() {
  const { listings } = useListingStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch =
        listing.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.address.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [listings, searchQuery, statusFilter]);

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    views: listings.reduce((sum, l) => sum + l.viewCount, 0),
    inquiries: listings.reduce((sum, l) => sum + l.inquiryCount, 0),
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona tus listings y su rendimiento
          </p>
        </div>
        <Button asChild>
          <Link to="/agents/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Propiedades</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Square className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vistas Totales</p>
                <p className="text-2xl font-bold">{stats.views}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consultas</p>
                <p className="text-2xl font-bold">{stats.inquiries}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar propiedades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ListingStatus | 'all')}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="active">Activos</TabsTrigger>
              <TabsTrigger value="draft">Borradores</TabsTrigger>
              <TabsTrigger value="paused">Pausados</TabsTrigger>
              <TabsTrigger value="archived">Archivados</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* Listings Grid */}
      <motion.div
        variants={staggerItem}
        className={cn(
          viewMode === 'grid'
            ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        )}
      >
        {filteredListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} onRestored={() => setStatusFilter('all')} />
        ))}

        {filteredListings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Square className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No se encontraron propiedades</h3>
            <p className="text-muted-foreground">
              Intenta con otros filtros o agrega una nueva propiedad
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link to="/agents/listings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Propiedad
                </Link>
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
