export type NotificationStatus = "pending" | "sent" | "failed";

export type AdminLead = {
  id: string;
  project_type: string;
  estimated_budget: string;
  contact_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  notification_status: NotificationStatus;
  notification_attempts: number;
  notified_at: string | null;
  created_at: string;
};

export type AdminLeadListResponse = {
  leads: AdminLead[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type LeadDashboardStats = {
  totalLeads: number;
  leadsToday: number;
  leadsLastSevenDays: number;
  notificationsSent: number;
  notificationsFailed: number;
  dailyLeads: Array<{
    date: string;
    count: number;
  }>;
  leadsByProjectType: Array<{
    projectType: string;
    count: number;
  }>;
  leadsByNotificationStatus: Array<{
    status: NotificationStatus;
    count: number;
  }>;
};
