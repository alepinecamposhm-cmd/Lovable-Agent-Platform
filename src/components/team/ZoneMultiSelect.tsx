import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ZoneMultiSelectProps {
  zones: string[];
  selectedZones: string[];
  onSelectionChange: (zones: string[]) => void;
  placeholder?: string;
}

export function ZoneMultiSelect({
  zones,
  selectedZones,
  onSelectionChange,
  placeholder = 'Seleccionar zonas...',
}: ZoneMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggleZone = (zone: string) => {
    if (selectedZones.includes(zone)) {
      onSelectionChange(selectedZones.filter((z) => z !== zone));
    } else {
      onSelectionChange([...selectedZones, zone]);
    }
  };

  const removeZone = (zone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(selectedZones.filter((z) => z !== zone));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selectedZones.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedZones.map((zone) => (
                <Badge
                  key={zone}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {zone}
                  <button
                    className="ml-1 rounded-full outline-none hover:bg-muted"
                    onClick={(e) => removeZone(zone, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar zona..." />
          <CommandList>
            <CommandEmpty>No se encontraron zonas.</CommandEmpty>
            <CommandGroup>
              {zones.map((zone) => (
                <CommandItem
                  key={zone}
                  value={zone}
                  onSelect={() => toggleZone(zone)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedZones.includes(zone) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {zone}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
