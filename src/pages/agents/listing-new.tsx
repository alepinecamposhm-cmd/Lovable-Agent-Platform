import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { addListing, getListing, updateListing } from '@/lib/agents/listings/store';
import type { Listing, ListingMedia, ListingStatus, PropertyType } from '@/types/agents';

const propertyTypes: PropertyType[] = ['apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'multi_family'];
const statusOptions: ListingStatus[] = ['draft', 'active', 'paused'];

function useListingData(listingId?: string) {
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!listingId) {
      setState('ready');
      return;
    }
    setState('loading');
    const found = getListing(listingId);
    if (!found) {
      setState('error');
      return;
    }
    setListing(found);
    setState('ready');
  }, [listingId]);

  return { state, listing };
}

interface FormState {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  propertyType: PropertyType;
  listingType: 'sale' | 'rent';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  amenities: string;
  description: string;
  media: ListingMedia[];
  status: ListingStatus;
}

const emptyForm: FormState = {
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'México',
  propertyType: 'apartment',
  listingType: 'sale',
  price: 0,
  bedrooms: undefined,
  bathrooms: undefined,
  squareFeet: undefined,
  yearBuilt: undefined,
  amenities: '',
  description: '',
  media: [],
  status: 'draft',
};

export default function AgentListingWizard() {
  const params = useParams();
  const listingId = params.listingId;
  const mode: 'create' | 'edit' = listingId ? 'edit' : 'create';
  const trackingListingId = listingId ?? 'new';
  const navigate = useNavigate();
  const { state: loadState, listing } = useListingData(listingId);
  const [step, setStep] = useState<'basics' | 'details' | 'media'>('basics');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialForm: FormState = useMemo(() => {
    if (!listing) return emptyForm;
    return {
      street: listing.address.street,
      city: listing.address.city,
      state: listing.address.state,
      zip: listing.address.zip,
      country: listing.address.country,
      propertyType: listing.propertyType,
      listingType: listing.listingType,
      price: listing.price,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      squareFeet: listing.squareFeet,
      yearBuilt: listing.yearBuilt,
      amenities: listing.amenities.join(', '),
      description: listing.description,
      media: (listing.media || []).slice().sort((a, b) => a.order - b.order),
      status: listing.status,
    } as FormState;
  }, [listing]);

  const [form, setForm] = useState<FormState>(initialForm);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaErrors, setMediaErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleChange = (field: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setError(null);
    try {
      const normalizedMedia = (form.media || [])
        .filter((m) => Boolean(m.url))
        .map((m, idx) => ({ ...m, order: idx + 1 }));

      const payload: Partial<Listing> = {
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
        propertyType: form.propertyType,
        listingType: form.listingType,
        price: Number(form.price) || 0,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        squareFeet: form.squareFeet ? Number(form.squareFeet) : undefined,
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
        amenities: form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [],
        description: form.description,
        status: form.status,
        media: normalizedMedia,
      };

      const saved = mode === 'create' ? addListing(payload) : updateListing(listingId!, payload);

      window.dispatchEvent(new CustomEvent('analytics', {
        detail: {
          event: mode === 'create' ? 'listing.create' : 'listing.update',
          listingId: mode === 'create' ? (saved as Listing).id : listingId,
          status: form.status,
        }
      }));

      toast({
        title: mode === 'create' ? 'Listing creado' : 'Listing actualizado',
        description: 'Persistencia mock guardada localmente.',
      });

      setSaving(false);
      const targetId = mode === 'create' && saved ? (saved as Listing).id : listingId!;
      navigate(`/agents/listings/${targetId}`);
    } catch (e: any) {
      console.error(e);
      setError('No pudimos guardar el listing.');
      setSaving(false);
    }
  };

  const loadingState = loadState === 'loading';
  const notFound = loadState === 'error';

  if (notFound) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Listing no encontrado.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="gap-2 px-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {mode === 'create' ? 'Nuevo Listing' : 'Editar Listing'}
          </h1>
          <p className="text-muted-foreground text-sm">Wizard 3 pasos · persistencia local · fotos por URL (demo).</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" /> Draft
        </Badge>
      </motion.div>

      <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="basics">1. Básicos</TabsTrigger>
          <TabsTrigger value="details">2. Detalles</TabsTrigger>
          <TabsTrigger value="media">3. Media</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Calle</label>
                  <Input value={form.street} onChange={(e) => handleChange('street', e.target.value)} placeholder="Calle Tamaulipas 87" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad</label>
                  <Input value={form.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="CDMX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <Input value={form.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="CDMX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CP</label>
                  <Input value={form.zip} onChange={(e) => handleChange('zip', e.target.value)} placeholder="06140" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Input value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio</label>
                  <Input type="number" value={form.price} onChange={(e) => handleChange('price', Number(e.target.value))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de propiedad</label>
                  <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.propertyType} onChange={(e) => handleChange('propertyType', e.target.value)}>
                    {propertyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de listing</label>
                  <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.listingType} onChange={(e) => handleChange('listingType', e.target.value)}>
                    <option value="sale">Venta</option>
                    <option value="rent">Renta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <select className="w-full rounded-md border px-3 py-2 text-sm" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recámaras</label>
                  <Input type="number" value={form.bedrooms ?? ''} onChange={(e) => handleChange('bedrooms', Number(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Baños</label>
                  <Input type="number" value={form.bathrooms ?? ''} onChange={(e) => handleChange('bathrooms', Number(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metros cuadrados</label>
                  <Input type="number" value={form.squareFeet ?? ''} onChange={(e) => handleChange('squareFeet', Number(e.target.value) || undefined)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año</label>
                  <Input type="number" value={form.yearBuilt ?? ''} onChange={(e) => handleChange('yearBuilt', Number(e.target.value) || undefined)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amenidades (separadas por coma)</label>
                <Input value={form.amenities} onChange={(e) => handleChange('amenities', e.target.value)} placeholder="Roof, Gimnasio, Estacionamiento" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Cuenta la historia de la propiedad..." rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Media</CardTitle>
                <p className="text-sm text-muted-foreground">Estado empty/error/success controlado.</p>
              </div>
              <Badge variant="secondary" className="gap-1"><ImageIcon className="h-3 w-3" /> Cover</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL de imagen</label>
                <div className="flex gap-2">
                  <Input
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="https://...jpg"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => {
                      const url = newMediaUrl.trim();
                      if (!url) return;
                      if (form.media.some((m) => m.url === url)) return;
                      const id = `media-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
                      const next = [...form.media, { id, url, type: 'image', order: form.media.length + 1 }];
                      setForm((prev) => ({ ...prev, media: next }));
                      setNewMediaUrl('');
                      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'listing.media_add', listingId: trackingListingId, source: 'url', index: next.length - 1 } }));
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Agrega varias imágenes pegando URLs (demo).</p>
              </div>

              {form.media.length === 0 && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  Aún no agregas fotos. Agrega al menos 1 para publicar.
                </div>
              )}

              {Object.keys(mediaErrors).length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  No pudimos cargar una o más imágenes.
                </div>
              )}

              {form.media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.media
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((m, idx) => (
                      <div key={m.id} className="group relative rounded-lg border overflow-hidden bg-muted/30">
                        <img
                          src={m.url}
                          alt={`media-${idx + 1}`}
                          className="w-full h-28 object-cover"
                          onError={() => setMediaErrors((prev) => ({ ...prev, [m.id]: true }))}
                        />
                        <div className="absolute top-2 left-2">
                          {idx === 0 && (
                            <Badge className="bg-warning text-warning-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              Portada
                            </Badge>
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2"
                            onClick={() => {
                              setForm((prev) => {
                                const ordered = prev.media.slice().sort((a, b) => a.order - b.order);
                                const target = ordered.find((x) => x.id === m.id);
                                if (!target) return prev;
                                const rest = ordered.filter((x) => x.id !== m.id);
                                const next = [target, ...rest].map((x, i) => ({ ...x, order: i + 1 }));
                                window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'listing.media_set_cover', listingId: trackingListingId, index: 0 } }));
                                return { ...prev, media: next };
                              });
                            }}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2"
                            onClick={() => {
                              setForm((prev) => {
                                const ordered = prev.media.slice().sort((a, b) => a.order - b.order);
                                const next = ordered.filter((x) => x.id !== m.id).map((x, i) => ({ ...x, order: i + 1 }));
                                window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'listing.media_remove', listingId: trackingListingId, index: idx } }));
                                return { ...prev, media: next };
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{form.city || 'Ciudad'} · {form.state || 'Estado'}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/agents/listings')}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || loadingState} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
