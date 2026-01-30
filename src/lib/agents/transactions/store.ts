import { create } from 'zustand';

export type TransactionStage = 'offer' | 'inspection' | 'appraisal' | 'financing' | 'closing' | 'closed';

export interface Transaction {
    id: string;
    propertyAddress: string;
    clientName: string;
    price: number;
    stage: TransactionStage;
    closingDate: Date;
    progress: number; // 0-100
    documentsCount: number;
    missingDocuments: number;
}

interface TransactionState {
    transactions: Transaction[];
    isLoading: boolean;

    fetchTransactions: () => Promise<void>;
    updateStage: (id: string, stage: TransactionStage) => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 't1',
        propertyAddress: 'Av. Horacio 1500, Polanco',
        clientName: 'Roberto Gómez',
        price: 12500000,
        stage: 'inspection',
        closingDate: new Date('2026-03-15'),
        progress: 35,
        documentsCount: 5,
        missingDocuments: 2
    },
    {
        id: 't2',
        propertyAddress: 'Amsterdam 25, Condesa',
        clientName: 'Ana María Sur',
        price: 8900000,
        stage: 'closing',
        closingDate: new Date('2026-02-28'),
        progress: 90,
        documentsCount: 12,
        missingDocuments: 0
    },
    {
        id: 't3',
        propertyAddress: 'Cumbres de Maltrata 45, Narvarte',
        clientName: 'Carlos D.',
        price: 4500000,
        stage: 'offer',
        closingDate: new Date('2026-04-10'),
        progress: 10,
        documentsCount: 2,
        missingDocuments: 4
    }
];

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    isLoading: false,

    fetchTransactions: async () => {
        set({ isLoading: true });
        await new Promise(resolve => setTimeout(resolve, 600)); // Mock delay
        set({ transactions: MOCK_TRANSACTIONS, isLoading: false });
    },

    updateStage: (id, stage) => set((state) => ({
        transactions: state.transactions.map(t =>
            t.id === id ? { ...t, stage } : t
        )
    }))
}));
