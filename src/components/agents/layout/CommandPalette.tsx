import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  Building2,
  CreditCard,
  UsersRound,
  BarChart3,
  Settings,
  Plus,
  Search,
} from 'lucide-react';
import { mockLeads, mockListings } from '@/lib/agents/fixtures';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  // Navigation shortcuts
  useHotkeys('g+o', () => runCommand(() => navigate('/agents/overview')), { enabled: !open });
  useHotkeys('g+l', () => runCommand(() => navigate('/agents/leads')), { enabled: !open });
  useHotkeys('g+i', () => runCommand(() => navigate('/agents/inbox')), { enabled: !open });
  useHotkeys('g+c', () => runCommand(() => navigate('/agents/calendar')), { enabled: !open });

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G O', href: '/agents/overview' },
    { icon: Users, label: 'Leads', shortcut: 'G L', href: '/agents/leads' },
    { icon: MessageSquare, label: 'Inbox', shortcut: 'G I', href: '/agents/inbox' },
    { icon: Calendar, label: 'Calendario', shortcut: 'G C', href: '/agents/calendar' },
    { icon: Building2, label: 'Propiedades', href: '/agents/listings' },
    { icon: CreditCard, label: 'Créditos', href: '/agents/credits' },
    { icon: UsersRound, label: 'Equipo', href: '/agents/team' },
    { icon: BarChart3, label: 'Reportes', href: '/agents/reports' },
    { icon: Settings, label: 'Configuración', href: '/agents/settings' },
  ];

  const actionItems = [
    { icon: Plus, label: 'Nuevo lead', action: () => navigate('/agents/leads?new=true') },
    { icon: Plus, label: 'Nueva propiedad', action: () => navigate('/agents/listings/new') },
    { icon: Plus, label: 'Nueva cita', action: () => navigate('/agents/calendar?new=true') },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar o ejecutar comando..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        <CommandGroup heading="Acciones rápidas">
          {actionItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegación">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => navigate(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {item.shortcut && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.shortcut}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Leads recientes">
          {mockLeads.slice(0, 3).map((lead) => (
            <CommandItem
              key={lead.id}
              onSelect={() => runCommand(() => navigate(`/agents/leads/${lead.id}`))}
            >
              <Search className="mr-2 h-4 w-4" />
              {lead.firstName} {lead.lastName}
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {lead.stage.replace('_', ' ')}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Propiedades">
          {mockListings.slice(0, 3).map((listing) => (
            <CommandItem
              key={listing.id}
              onSelect={() => runCommand(() => navigate(`/agents/listings/${listing.id}`))}
            >
              <Building2 className="mr-2 h-4 w-4" />
              {listing.address.street}
              <span className="ml-auto text-xs text-muted-foreground">
                ${listing.price.toLocaleString()}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
