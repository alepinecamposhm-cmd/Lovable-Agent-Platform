import { create } from 'zustand';
import { toast } from 'sonner';

export type TemplateType = 'story' | 'post' | 'flyer';

export interface Template {
    id: string;
    title: string;
    type: TemplateType;
    thumbnailUrl: string;
    description: string;
}

interface MarketingState {
    templates: Template[];
    isLoading: boolean;
    isGenerating: boolean;
    generatedAsset: string | null;

    // Actions
    fetchTemplates: () => Promise<void>;
    generateDesign: (templateId: string, listingId: string) => Promise<void>;
    clearGenerated: () => void;
}

const MOCK_TEMPLATES: Template[] = [
    {
        id: '1',
        title: 'Open House Moderno',
        type: 'story',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-2495db98dada?auto=format&fit=crop&w=400&q=80',
        description: 'Ideal para Instagram Stories. Diseño minimalista.'
    },
    {
        id: '2',
        title: 'Just Listed (Clásico)',
        type: 'post',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
        description: 'Post cuadrado para Feed. Enfoque en fachada.'
    },
    {
        id: '3',
        title: 'Ficha Técnica Elegante',
        type: 'flyer',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80',
        description: 'PDF tamaño carta para imprimir.'
    },
    {
        id: '4',
        title: 'Sold in 7 Days',
        type: 'story',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=400&q=80',
        description: 'Anuncia tu éxito reciente.'
    }
];

export const useMarketingStore = create<MarketingState>((set) => ({
    templates: [],
    isLoading: false,
    isGenerating: false,
    generatedAsset: null,

    fetchTemplates: async () => {
        set({ isLoading: true });
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        set({ templates: MOCK_TEMPLATES, isLoading: false });
    },

    generateDesign: async (templateId, listingId) => {
        set({ isGenerating: true, generatedAsset: null });
        try {
            // Simulate generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In a real app, this would return a URL from the backend
            set({ generatedAsset: 'https://images.unsplash.com/photo-1600596542815-2495db98dada?auto=format&fit=crop&w=800&q=80' });
            toast.success("Diseño generado con éxito");
        } catch (error) {
            toast.error("Error generando el diseño");
        } finally {
            set({ isGenerating: false });
        }
    },

    clearGenerated: () => set({ generatedAsset: null })
}));
