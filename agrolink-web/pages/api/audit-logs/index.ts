import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only government/admin can access audit logs
  const session = await verifySession(req);
  if (!session || !["GOVERNMENT", "ADMIN"].includes(session.role)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action");
      const userId = searchParams.get("userId");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where = {
        ...(action && { action }),
        ...(userId && { userId }),
      };

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      return res.status(200).json({
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
