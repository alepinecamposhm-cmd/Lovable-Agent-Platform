import { Outlet } from 'react-router-dom';
import { TeamV2WorkspaceProvider } from '@/lib/team/teamV2Workspace';

export default function TeamV2WorkspaceLayout() {
  return (
    <TeamV2WorkspaceProvider>
      <Outlet />
    </TeamV2WorkspaceProvider>
  );
}

