import { API_BASE } from "./client";
import { authHeaders } from "./authHeaders";
import type { Notification } from "@/types/notifications";

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders({ includeJson: false, includeUserId: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to load notifications (status ${res.status})`);
  }

  return res.json();
}

export async function markNotificationRead(notificationId: string) {
  const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: authHeaders({ includeJson: true, includeUserId: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark notification as read (status ${res.status})`);
  }
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: "PATCH",
    headers: authHeaders({ includeJson: true, includeUserId: true }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark notifications as read (status ${res.status})`);
  }
}
