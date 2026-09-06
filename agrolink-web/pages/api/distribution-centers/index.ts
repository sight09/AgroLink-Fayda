import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createDistributionCenterSchema = z.object({
  name: z.string().min(2).max(200),
  location: z.string().min(5).max(500),
  contactPhone: z.string().optional().or(z.literal("")),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const isActive = searchParams.get("isActive") === "true";
      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { location: { contains: search } },
          ],
        }),
      };

      const [centers, total] = await Promise.all([
        prisma.distributionCenter.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: "asc" },
          include: {
            inventory: {
              where: { quantity: { gt: 0 } },
              include: {
                product: true,
              },
            },
          },
        }),
        prisma.distributionCenter.count({ where }),
      ]);

      return res.status(200).json({
        centers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching distribution centers:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = createDistributionCenterSchema.parse(req.body);

      const center = await prisma.distributionCenter.create({
        data: {
          name: body.name,
          location: body.location,
          contactPhone: body.contactPhone || undefined,
        },
      });

      return res.status(201).json(center);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating distribution center:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const body = await req.getBody?.() || req.body;

      const center = await prisma.distributionCenter.update({
        where: { id: id as string },
        data: {
          name: body.name,
          location: body.location,
          contactPhone: body.contactPhone,
          isActive: body.isActive ?? true,
        },
      });

      return res.status(200).json(center);
    } catch (error) {
      console.error("Error updating distribution center:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      await prisma.distributionCenter.update({
        where: { id: id as string },
        data: { isActive: false },
      });

      return res.status(200).json({ message: "Distribution center deactivated" });
    } catch (error) {
      console.error("Error deactivating distribution center:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
