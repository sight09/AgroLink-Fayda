import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(1000),
  category: z.enum(["FERTILIZER", "SEED", "PESTICIDE", "FEED", "EQUIPMENT", "OTHER"]),
  price: z.string(), // Stored as string in SQLite
  unit: z.string().min(2).max(50),
  image: z.string().url().optional().or(z.literal("")),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = req.query.role as string;

  if (["POST", "PUT", "DELETE"].includes(req.method) && !["GOVERNMENT", "ADMIN"].includes(role)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");

      const where = {
        isActive: true,
        ...(category && { category }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { name: "asc" },
          include: {
            inventory: {
              orderBy: { updatedAt: "desc" },
              take: 1,
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      // Convert price to number for frontend
      const formattedProducts = products.map(p => ({
        ...p,
        price: parseFloat(p.price) || 0,
      }));

      return res.status(200).json({
        products: formattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = createProductSchema.parse(req.body);

      const product = await prisma.product.create({
        data: {
          name: body.name,
          description: body.description,
          category: body.category,
          price: body.price, // Store as string
          unit: body.unit,
          image: body.image || undefined,
        },
      });

      return res.status(201).json({ ...product, price: parseFloat(product.price) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id } = req.query;
      const body = req.body;

      const product = await prisma.product.update({
        where: { id: id as string },
        data: {
          name: body.name,
          description: body.description,
          category: body.category,
          price: body.price,
          unit: body.unit,
          image: body.image,
          isActive: body.isActive ?? true,
        },
      });

      return res.status(200).json({ ...product, price: parseFloat(product.price) });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      await prisma.product.update({
        where: { id: id as string },
        data: { isActive: false },
      });

      return res.status(200).json({ message: "Product deactivated" });
    } catch (error) {
      console.error("Error deactivating product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
