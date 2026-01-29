import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
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
} from '@/components/ui/dropdown-menu';
import { mockListings } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import type { Listing, ListingStatus, VerificationStatus } from '@/types/agents';

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

function ListingCard({ listing }: { listing: Listing }) {
  const status = statusConfig[listing.status];
  const verification = verificationConfig[listing.verificationStatus];
  const VerificationIcon = verification.icon;

  return (
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
          </div>

          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Pausar</DropdownMenuItem>
                <DropdownMenuItem>Boost</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Archivar</DropdownMenuItem>
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
  );
}

export default function AgentListings() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');

  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = 
      listing.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.address.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockListings.length,
    active: mockListings.filter(l => l.status === 'active').length,
    views: mockListings.reduce((sum, l) => sum + l.viewCount, 0),
    inquiries: mockListings.reduce((sum, l) => sum + l.inquiryCount, 0),
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
          <ListingCard key={listing.id} listing={listing} />
        ))}
        
        {filteredListings.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Square className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">No se encontraron propiedades</h3>
            <p className="text-muted-foreground">
              Intenta con otros filtros o agrega una nueva propiedad
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
