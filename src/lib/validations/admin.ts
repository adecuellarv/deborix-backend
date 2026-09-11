import { z } from "zod";

export const adminLeadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const leadDashboardStatsSchema = z.object({
  totalLeads: z.number().int().nonnegative(),
  leadsToday: z.number().int().nonnegative(),
  leadsLastSevenDays: z.number().int().nonnegative(),
  notificationsSent: z.number().int().nonnegative(),
  notificationsFailed: z.number().int().nonnegative(),
  dailyLeads: z.array(
    z.object({
      date: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
  leadsByProjectType: z.array(
    z.object({
      projectType: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
  leadsByNotificationStatus: z.array(
    z.object({
      status: z.enum(["pending", "sent", "failed"]),
      count: z.number().int().nonnegative(),
    }),
  ),
});
