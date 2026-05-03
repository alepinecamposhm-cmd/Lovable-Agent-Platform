import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Command, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockNotifications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { RolePreviewTabs } from "@/components/auth/RolePreviewTabs";
import { PersonaPreviewSelect } from "@/components/auth/PersonaPreviewSelect";
import { useAccess } from "@/lib/permissions/useAccess";

const commandItems = [
  { label: "Ir a Dashboard", shortcut: "D", action: "/agents" },
  { label: "Ir a Inbox", shortcut: "I", action: "/agents/inbox" },
  { label: "Ir a Leads", shortcut: "L", action: "/agents/leads" },
  { label: "Ir a Calendario", shortcut: "C", action: "/agents/calendar" },
  { label: "Ir a Propiedades", shortcut: "P", action: "/agents/listings" },
  { label: "Ir a Créditos", shortcut: "R", action: "/agents/credits" },
  { label: "Ir a Equipo (v2)", shortcut: "E", action: "/agents/team-v2" },
  { label: "Ir a Reportes", shortcut: "A", action: "/agents/reports" },
];

export function LovableAgentHeader() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();
  const location = useLocation();
  const access = useAccess();
  const settingsRoute = location.pathname.startsWith("/agents/team-v2") && access.can("manage_team_settings")
    ? "/agents/team-v2/settings"
    : "/agents/settings";
  const navigationItems = useMemo(
    () => [...commandItems, { label: "Ir a Configuración", shortcut: "S", action: settingsRoute }],
    [settingsRoute]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
      if (e.key === "Escape") setIsCommandOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarTrigger />

        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar leads, propiedades..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center gap-2"
          >
            <Command className="h-4 w-4" />
            <span>Buscar</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <div className="hidden xl:flex items-center gap-2">
            <RolePreviewTabs />
            <PersonaPreviewSelect />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className={cn("flex flex-col items-start gap-1 p-3 rounded-md", !n.isRead && "bg-muted/50")}
                    onClick={() => markAsRead(n.id)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium text-sm">{n.title}</span>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{n.message}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <CommandInput placeholder="Escribe para buscar..." />
          <CommandList>
            <CommandEmpty>No hay resultados.</CommandEmpty>
            <CommandGroup heading="Navegación">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.action}
                  onSelect={() => {
                    setIsCommandOpen(false);
                    navigate(item.action);
                  }}
                >
                  <span className="flex-1">{item.label}</span>
                  <kbd className="text-xs text-muted-foreground">{item.shortcut}</kbd>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Acciones rápidas">
              <CommandItem onSelect={() => { setIsCommandOpen(false); navigate("/agents/leads"); }}>
                <span className="flex-1">Crear Lead</span>
              </CommandItem>
              <CommandItem onSelect={() => { setIsCommandOpen(false); navigate("/agents/listings/new"); }}>
                <span className="flex-1">Crear Propiedad</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </header>
  );
}
