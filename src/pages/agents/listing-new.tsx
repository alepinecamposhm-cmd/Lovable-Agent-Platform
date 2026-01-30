import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Save,
  Sparkles,
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
import type { Listing, ListingStatus, PropertyType } from '@/types/agents';

const propertyTypes: PropertyType[] = ['apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'multi_family'];
const statusOptions: ListingStatus[] = ['draft', 'active', 'paused', 'sold', 'rented'];

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
  coverImage?: string;
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
  coverImage: '',
  status: 'draft',
};

export default function AgentListingWizard() {
  const params = useParams();
  const listingId = params.listingId;
  const mode: 'create' | 'edit' = listingId ? 'edit' : 'create';
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
      coverImage: listing.coverImage,
      status: listing.status,
    } as FormState;
  }, [listing]);

  const [form, setForm] = useState<FormState>(initialForm);

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
        coverImage: form.coverImage,
        status: form.status,
        media: form.coverImage ? [{ id: 'cover', url: form.coverImage, type: 'image', order: 1 }] : [],
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
          <p className="text-muted-foreground text-sm">Wizard 3 pasos · estados loading/empty/error/success · persistencia local.</p>
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
                <label className="text-sm font-medium">Imagen principal (URL)</label>
                <Input value={form.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} placeholder="https://...jpg" />
              </div>
              {!form.coverImage && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  Estado empty: añade al menos una imagen para publicar.
                </div>
              )}
              {form.coverImage && (
                <div className="rounded-lg border overflow-hidden">
                  <img src={form.coverImage} alt="cover" className="w-full h-48 object-cover" onError={() => setError('Error al cargar la imagen (estado error).')} />
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
