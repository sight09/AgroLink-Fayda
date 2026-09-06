import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
  role: z.enum(["FARMER", "GOVERNMENT", "ADMIN"]).default("FARMER"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const body = createUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: body.email || undefined },
            { phone: body.phone || undefined },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: "User with this email or phone already exists" });
      }

      // Hash password if provided
      let passwordHash: string | undefined;
      if (body.password) {
        passwordHash = await bcrypt.hash(body.password, 12);
      }

      const user = await prisma.user.create({
        data: {
          fullName: body.fullName,
          email: body.email || undefined,
          phone: body.phone || undefined,
          passwordHash,
          role: body.role,
        },
      });

      return res.status(201).json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        faydaVerified: user.faydaVerified,
        createdAt: user.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const role = searchParams.get("role");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const search = searchParams.get("search");

      const where = {
        ...(role && { role: role as "FARMER" | "GOVERNMENT" | "ADMIN" }),
        ...(search && {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
        isActive: true,
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            faydaVerified: true,
            faydaId: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
