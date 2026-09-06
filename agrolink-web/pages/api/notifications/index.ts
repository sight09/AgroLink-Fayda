import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await verifySession(req);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const userId = session.userId;
      const { searchParams } = new URL(req.url);
      const unreadOnly = searchParams.get("unread") === "true";
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      const where = {
        userId,
        ...(unreadOnly && { read: false }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.notification.count({ where }),
      ]);

      const unreadCount = await prisma.notification.count({
        where: { userId, read: false },
      });

      return res.status(200).json({
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { notificationId, markAllRead } = req.body;
      const userId = session.userId;

      if (markAllRead) {
        await prisma.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        });
        return res.status(200).json({ message: "All notifications marked as read" });
      }

      if (notificationId) {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { read: true },
        });
        return res.status(200).json({ message: "Notification marked as read" });
      }

      return res.status(400).json({ error: "Notification ID or markAllRead required" });
    } catch (error) {
      console.error("Error updating notifications:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
