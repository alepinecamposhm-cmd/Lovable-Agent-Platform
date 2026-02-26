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
  Map,
  Bell,
  Settings,
  ChevronLeft,
  Home,
  AlarmClock,
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
import { useTaskStore } from '@/lib/agents/tasks/store';
import { getRoutingAlert } from '@/lib/agents/routing/store';
import type { Capability } from '@/lib/permissions/capabilities';
import { useAccess } from '@/lib/permissions/useAccess';
import { isPreviewEnabled } from '@/lib/permissions/previewRole';
import { getPreviewPersonById } from '@/lib/permissions/mockPeopleCatalog';

const mainNavItems = [
  { title: 'Dashboard', url: '/agents/overview', icon: LayoutDashboard, cap: 'view_dashboard' as Capability },
  { title: 'Leads', url: '/agents/leads', icon: Users, cap: 'view_leads' as Capability },
  { title: 'Inbox', url: '/agents/inbox', icon: MessageSquare, badge: 2, cap: 'view_inbox' as Capability },
  { title: 'Calendario', url: '/agents/calendar', icon: Calendar, cap: 'view_calendar' as Capability },
  { title: 'Propiedades', url: '/agents/listings', icon: Building2, cap: 'view_listings' as Capability },
];

const secondaryNavItems = [
  { title: 'Créditos', url: '/agents/credits', icon: CreditCard, cap: 'view_billing' as Capability },
  { title: 'Reportes', url: '/agents/reports', icon: BarChart3, cap: 'view_reports_self' as Capability },
  { title: 'Mapa (Plan)', url: '/agents/roadmap', icon: Map, cap: 'view_dashboard' as Capability },
  { title: 'Notificaciones', url: '/agents/notifications', icon: Bell, cap: 'view_notifications' as Capability },
  { title: 'Tareas', url: '/agents/tasks', icon: AlarmClock, badgeKey: 'tasks', cap: 'view_tasks' as Capability },
  { title: 'Audit', url: '/agents/audit', icon: BarChart3, cap: 'view_settings' as Capability },
];

const comparisonNavItems = [
  { title: 'Equipo (v1)', url: '/agents/team', icon: UsersRound, cap: 'view_team' as Capability },
  { title: 'Equipo (v2)', url: '/agents/team-v2', icon: UsersRound, cap: 'view_team' as Capability },
];

const settingsItem = { title: 'Configuración', url: '/agents/settings', icon: Settings, cap: 'view_settings' as Capability };

export function AgentSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { pending: pendingTasks } = useTaskStore();
  const access = useAccess();
  const visibleComparisonItems = isPreviewEnabled()
    ? comparisonNavItems.filter((item) => access.can(item.cap))
    : [];
  const previewPerson = getPreviewPersonById(access.effectivePersonaId);
  const footerName = previewPerson?.name ?? `${mockAgent.firstName} ${mockAgent.lastName}`;
  const footerEmail = previewPerson?.email ?? mockAgent.email;
  const footerAvatar = previewPerson?.avatar ?? mockAgent.avatarUrl;
  const footerRoleLabel = access.role === 'leader' ? 'Líder' : access.role === 'admin' ? 'Admin' : 'Agente';

  const isActive = (url: string) => {
    if (url === '/agents/team') {
      return location.pathname === '/agents/team' || location.pathname.startsWith('/agents/team/');
    }
    if (url === '/agents/team-v2') {
      return location.pathname === '/agents/team-v2' || location.pathname.startsWith('/agents/team-v2/');
    }
    return location.pathname.startsWith(url);
  };

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
                access.can(item.cap) ? (
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
                ) : null
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
              {[{ title: 'Equipo', url: '/agents/team', icon: UsersRound, cap: 'view_team' as Capability },
                ...secondaryNavItems].map((item) => {
                  if (!access.can(item.cap)) {
                    return null;
                  }
                  return (
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
                      {!isCollapsed && (
                        <span className="flex items-center gap-1">
                          {item.title}
                          {item.title === 'Equipo' && getRoutingAlert() && <span className="h-2 w-2 rounded-full bg-destructive inline-block" />}
                        </span>
                      )}
                      {item.badgeKey === 'tasks' && pendingTasks > 0 && !isCollapsed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-medium text-sidebar-primary-foreground"
                        >
                          {pendingTasks}
                        </motion.span>
                      )}
                      {item.badgeKey === 'tasks' && pendingTasks > 0 && isCollapsed && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sidebar-primary text-[9px] font-medium text-sidebar-primary-foreground">
                          {pendingTasks}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleComparisonItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
              Comparación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleComparisonItems.map((item) => (
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
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            {access.can(settingsItem.cap) && (
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
            )}
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 mt-2 rounded-lg bg-sidebar-accent/30"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={footerAvatar} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {footerName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {footerName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {footerEmail}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60">{footerRoleLabel}</p>
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
