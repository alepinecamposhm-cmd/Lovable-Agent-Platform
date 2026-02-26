import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isPreviewEnabled, getPreviewRole, setPreviewRole } from '@/lib/permissions/previewRole';

export function RolePreviewTabs() {
  const [enabled, setEnabled] = useState(false);
  const [role, setRole] = useState<'agent' | 'leader'>('agent');

  useEffect(() => {
    const refresh = () => {
      const isEnabled = isPreviewEnabled();
      setEnabled(isEnabled);
      if (!isEnabled) return;
      setRole(getPreviewRole() ?? 'agent');
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('preview-role-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('preview-role-changed', refresh);
    };
  }, []);

  if (!enabled) return null;

  return (
    <Tabs value={role} onValueChange={(v) => { if (v === 'agent' || v === 'leader') { setPreviewRole(v); setRole(v); } }}>
      <TabsList className="h-8">
        <TabsTrigger value="agent" className="text-xs px-2">V1-AGENT</TabsTrigger>
        <TabsTrigger value="leader" className="text-xs px-2">V2-LIDER</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
