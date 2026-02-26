export type PreviewPersonRole = 'agent' | 'leader' | 'admin';

export interface PreviewPerson {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: PreviewPersonRole;
  status?: 'active' | 'paused' | 'invited';
}

export const previewPeopleCatalog: PreviewPerson[] = [
  {
    id: 'agent-001',
    name: 'Carlos Martínez',
    email: 'carlos.martinez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'leader',
    status: 'active',
  },
  {
    id: 'agent-002',
    name: 'Laura Sánchez',
    email: 'laura.sanchez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    role: 'agent',
    status: 'active',
  },
  {
    id: 'agent-003',
    name: 'Miguel Rodríguez',
    email: 'miguel.rodriguez@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    role: 'agent',
    status: 'paused',
  },
  {
    id: 'agent-004',
    name: 'Sofía Torres',
    email: 'sofia.torres@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    role: 'agent',
    status: 'active',
  },
  {
    id: 'agent-005',
    name: 'Pedro García',
    email: 'pedro.garcia@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'agent-006',
    name: 'Javier Soto',
    email: 'javier.soto@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Javier',
    role: 'agent',
    status: 'active',
  },
  {
    id: 'agent-007',
    name: 'Lucía Reyes',
    email: 'lucia.reyes@inmobiliaria.mx',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
    role: 'agent',
    status: 'active',
  },
];

const byNameAsc = (a: PreviewPerson, b: PreviewPerson) => a.name.localeCompare(b.name);

export function getAgentPreviewOptions(): PreviewPerson[] {
  return previewPeopleCatalog.slice().sort(byNameAsc);
}

export function getLeaderPreviewOptions(): PreviewPerson[] {
  return previewPeopleCatalog
    .filter((p) => p.role === 'leader' || p.role === 'admin')
    .slice()
    .sort(byNameAsc);
}

export function getPreviewPersonById(id?: string | null): PreviewPerson | undefined {
  if (!id) return undefined;
  return previewPeopleCatalog.find((p) => p.id === id);
}
