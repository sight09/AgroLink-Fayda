import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createInventorySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(0),
  warehouse: z.string().max(200).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");
      const warehouse = searchParams.get("warehouse");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where = {
        ...(productId && { productId }),
        ...(warehouse && { warehouse }),
      };

      const [inventory, total] = await Promise.all([
        prisma.inventory.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            product: true,
          },
        }),
        prisma.inventory.count({ where }),
      ]);

      return res.status(200).json({
        inventory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = createInventorySchema.parse(req.body);

      // Check if inventory record already exists
      const existing = await prisma.inventory.findFirst({
        where: {
          productId: body.productId,
          warehouse: body.warehouse || null,
        },
      });

      if (existing) {
        // Update existing
        const updated = await prisma.inventory.update({
          where: { id: existing.id },
          data: { quantity: body.quantity },
          include: { product: true },
        });
        return res.status(200).json(updated);
      }

      // Create new
      const inventory = await prisma.inventory.create({
        data: {
          productId: body.productId,
          quantity: body.quantity,
          warehouse: body.warehouse || "Main Warehouse",
        },
        include: { product: true },
      });

      return res.status(201).json(inventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating inventory:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { id, quantity, warehouse } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Inventory ID required" });
      }

      const inventory = await prisma.inventory.update({
        where: { id },
        data: {
          ...(quantity !== undefined && { quantity }),
          ...(warehouse && { warehouse }),
        },
        include: { product: true },
      });

      return res.status(200).json(inventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
