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

export function openNotificationStream(options: {
  onMessage: (notification: Notification) => void;
  onError?: (err: Error) => void;
}): () => void {
  const controller = new AbortController();
  const headers = authHeaders({ includeJson: false, includeUserId: true });
  const userId = headers["x-user-id"];
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/stream${query}`, {
        headers,
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(
          `Failed to open notification stream (status ${res.status})`
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const dataLine = event
            .split("\n")
            .find((line) => line.startsWith("data:"));

          if (!dataLine) continue;

          const json = dataLine.replace(/^data:\s?/, "");
          try {
            const parsed = JSON.parse(json);
            const notification: Notification = {
              _id: parsed._id || parsed.notificationId,
              userId: parsed.userId,
              artisanId: parsed.artisanId,
              productId: parsed.productId,
              productName: parsed.productName,
              type: parsed.type,
              read:
                typeof parsed.read === "string"
                  ? parsed.read === "true"
                  : Boolean(parsed.read),
              createdAt: parsed.createdAt,
            };

            options.onMessage(notification);
          } catch (err) {
            console.error("Failed to parse notification event", err);
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const error = err instanceof Error ? err : new Error("Stream error");
      options.onError?.(error);
    }
  })();

  return () => controller.abort();
}
