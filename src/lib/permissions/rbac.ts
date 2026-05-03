import type { Capability } from './capabilities';
import { ALL_CAPABILITIES } from './capabilities';
import type { Role } from './types';

const adminCaps = new Set<Capability>(ALL_CAPABILITIES);

const leaderCaps = new Set<Capability>([
  'view_dashboard',
  'view_inbox',
  'view_calendar',
  'view_leads',
  'view_listings',
  'view_team',
  'manage_team_settings',
  'manage_team_invites',
  'manage_team_roles',
  'reset_agent_password',
  'assign_leads',
  'reassign_leads',
  'view_reports_team',
  'view_reports_self',
  'view_billing',
  'increase_budget',
  'view_credits',
  'view_notifications',
  'view_tasks',
  'view_settings',
]);

const agentCaps = new Set<Capability>([
  'view_dashboard',
  'view_inbox',
  'view_calendar',
  'view_leads',
  'view_listings',
  'view_reports_self',
  'view_billing_self',
  'view_notifications',
  'view_tasks',
  'view_settings',
]);

export const ROLE_CAPS: Record<Role, Set<Capability>> = {
  admin: adminCaps,
  leader: leaderCaps,
  agent: agentCaps,
};

export function can(role: Role, cap: Capability): boolean {
  return ROLE_CAPS[role]?.has(cap) ?? false;
}
