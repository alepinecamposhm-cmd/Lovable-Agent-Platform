import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChevronLeft,
  Home,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { mockAgent } from '@/lib/agents/fixtures';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNavItems = [
  { title: 'Dashboard', url: '/agents/overview', icon: LayoutDashboard },
  { title: 'Leads', url: '/agents/leads', icon: Users },
  { title: 'Inbox', url: '/agents/inbox', icon: MessageSquare, badge: 2 },
  { title: 'Calendario', url: '/agents/calendar', icon: Calendar },
  { title: 'Propiedades', url: '/agents/listings', icon: Building2 },
];

const secondaryNavItems = [
  { title: 'Créditos', url: '/agents/credits', icon: CreditCard },
  { title: 'Equipo', url: '/agents/team', icon: UsersRound },
  { title: 'Reportes', url: '/agents/reports', icon: BarChart3 },
];

const settingsItem = { title: 'Configuración', url: '/agents/settings', icon: Settings };

export function AgentSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string) => location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-sidebar-foreground"
              >
                AgentHub
              </motion.span>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <Link
                      to={item.url}
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        isActive(item.url)
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                      {item.badge && !isCollapsed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-medium text-sidebar-primary-foreground"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      {item.badge && isCollapsed && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sidebar-primary text-[9px] font-medium text-sidebar-primary-foreground">
                          {item.badge}
                        </span>
                      )}
                      {isActive(item.url) && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <Link
                      to={item.url}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                        isActive(item.url)
                          ? 'bg-sidebar-accent text-sidebar-primary'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive(settingsItem.url)}
              tooltip={isCollapsed ? settingsItem.title : undefined}
            >
              <Link
                to={settingsItem.url}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  isActive(settingsItem.url)
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <settingsItem.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{settingsItem.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 mt-2 rounded-lg bg-sidebar-accent/30"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={mockAgent.avatarUrl} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {mockAgent.firstName[0]}{mockAgent.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {mockAgent.firstName} {mockAgent.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {mockAgent.email}
              </p>
            </div>
          </motion.div>
        )}

        <SidebarTrigger className="mt-2 w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} />
          {!isCollapsed && <span className="ml-2 text-sm">Colapsar</span>}
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  );
}
