import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  Building2,
  CreditCard,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  CheckSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/agents/team/store";
import type { Capability } from "@/lib/permissions/capabilities";
import { useAccess } from "@/lib/permissions/useAccess";
import { isPreviewEnabled } from "@/lib/permissions/previewRole";
import { getPreviewPersonById } from "@/lib/permissions/mockPeopleCatalog";

const mainNavItems = [
  { title: "Dashboard", url: "/agents", icon: LayoutDashboard, cap: "view_dashboard" as Capability },
  { title: "Inbox", url: "/agents/inbox", icon: MessageSquare, badge: 3, cap: "view_inbox" as Capability },
  { title: "Leads", url: "/agents/leads", icon: Users, badge: 1, cap: "view_leads" as Capability },
  { title: "Tareas", url: "/agents/tasks", icon: CheckSquare, badge: 2, cap: "view_tasks" as Capability },
  { title: "Calendario", url: "/agents/calendar", icon: Calendar, cap: "view_calendar" as Capability },
  { title: "Propiedades", url: "/agents/listings", icon: Building2, cap: "view_listings" as Capability },
];

const secondaryNavItems = [
  { title: "Créditos", url: "/agents/credits", icon: CreditCard, cap: "view_billing" as Capability },
  // v2 lives here:
  { title: "Equipo", url: "/agents/team-v2", icon: UsersRound, cap: "view_team" as Capability },
  { title: "Reportes", url: "/agents/reports", icon: BarChart3, cap: "view_reports_self" as Capability },
];

const comparisonNavItems = [
  { title: "Equipo (v1)", url: "/agents/team", icon: UsersRound, cap: "view_team" as Capability },
  { title: "Equipo (v2)", url: "/agents/team-v2", icon: UsersRound, cap: "view_team" as Capability },
];

export function LovableAgentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const user = getCurrentUser();
  const access = useAccess();
  const settingsRoute = location.pathname.startsWith("/agents/team-v2") && access.can("manage_team_settings")
    ? "/agents/team-v2/settings"
    : "/agents/settings";
  const visibleComparisonItems = isPreviewEnabled()
    ? comparisonNavItems.filter((item) => access.can(item.cap))
    : [];
  const previewPerson = getPreviewPersonById(access.effectivePersonaId);
  const footerName = previewPerson?.name || user.name || "Agente";
  const footerEmail = previewPerson?.email || user.email;
  const footerAvatar = previewPerson?.avatar || user.avatarUrl || "";
  const footerRole = access.role === "leader" ? "Líder" : access.role === "admin" ? "Admin" : "Agente";

  const isActive = (path: string) => {
    if (path === "/agents") return location.pathname === "/agents" || location.pathname.startsWith("/agents/overview");
    if (path === "/agents/team") return location.pathname === "/agents/team" || location.pathname.startsWith("/agents/team/");
    if (path === "/agents/team-v2") return location.pathname === "/agents/team-v2" || location.pathname.startsWith("/agents/team-v2/");
    return location.pathname.startsWith(path);
  };

  const initials = (footerName || footerEmail || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-sm font-semibold">Portal Inmobiliario</h2>
                <p className="text-xs text-muted-foreground">Panel de Agente</p>
              </div>
            )}
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                access.can(item.cap) ? (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                ) : null
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                access.can(item.cap) ? (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="w-full justify-start"
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="flex-1">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                ) : null
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleComparisonItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>Comparación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleComparisonItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      className="w-full justify-start"
                    >
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="flex-1">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center gap-3", isCollapsed && "flex-col gap-2")}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={footerAvatar} alt={footerName || footerEmail} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{footerName}</p>
              <p className="text-xs text-muted-foreground truncate">{footerEmail}</p>
              <p className="text-[10px] text-muted-foreground">{footerRole}</p>
            </div>
          )}

          <div className={cn("flex gap-1", isCollapsed && "flex-col")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(settingsRoute)}
              className="h-8 w-8"
              aria-label="Configuración"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="h-8 w-8"
              aria-label="Salir"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
