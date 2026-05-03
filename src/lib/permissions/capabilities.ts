export type Capability =
  | 'view_dashboard'
  | 'view_inbox'
  | 'view_calendar'
  | 'view_leads'
  | 'view_listings'
  | 'view_team'
  | 'manage_team_settings'
  | 'manage_team_invites'
  | 'manage_team_roles'
  | 'transfer_leadership'
  | 'reset_agent_password'
  | 'assign_leads'
  | 'reassign_leads'
  | 'view_reports_team'
  | 'view_reports_self'
  | 'view_billing'
  | 'view_billing_self'
  | 'manage_payment_method'
  | 'increase_budget'
  | 'decrease_budget'
  | 'manage_subscription_plan'
  | 'view_credits'
  | 'view_notifications'
  | 'view_tasks'
  | 'view_settings';

export const ALL_CAPABILITIES: Capability[] = [
  'view_dashboard',
  'view_inbox',
  'view_calendar',
  'view_leads',
  'view_listings',
  'view_team',
  'manage_team_settings',
  'manage_team_invites',
  'manage_team_roles',
  'transfer_leadership',
  'reset_agent_password',
  'assign_leads',
  'reassign_leads',
  'view_reports_team',
  'view_reports_self',
  'view_billing',
  'view_billing_self',
  'manage_payment_method',
  'increase_budget',
  'decrease_budget',
  'manage_subscription_plan',
  'view_credits',
  'view_notifications',
  'view_tasks',
  'view_settings',
];
