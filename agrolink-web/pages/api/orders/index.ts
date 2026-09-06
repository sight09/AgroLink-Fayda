import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifySession } from "@/lib/auth";

const createOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
  notes: z.string().max(500).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const session = await verifySession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = session.userId;

      const where =
        session.role === "FARMER"
          ? { userId }
          : {};

      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");

      if (status) {
        (where as any).status = status;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
                faydaId: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    unit: true,
                  },
                },
              },
            },
          },
        }),
        prisma.order.count({ where }),
      ]);

      // Convert string amounts to numbers for the response
      const formattedOrders = orders.map(o => ({
        ...o,
        totalAmount: parseFloat(o.totalAmount),
        items: o.items?.map(i => ({
          ...i,
          unitPrice: parseFloat(i.unitPrice),
          subtotal: parseFloat(i.subtotal),
        })),
      }));

      return res.status(200).json({
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const session = await verifySession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (session.role !== "FARMER") {
        return res.status(403).json({ error: "Only farmers can place orders" });
      }

      const body = createOrderSchema.parse(req.body);
      const userId = session.userId;

      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });

      if (!product || !product.isActive) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Parse price from string (SQLite stores as text)
      const productPrice = parseFloat(product.price);
      if (isNaN(productPrice)) {
        return res.status(500).json({ error: "Invalid product price" });
      }

      const inventory = await prisma.inventory.findFirst({
        where: { productId: body.productId },
        orderBy: { quantity: "desc" },
      });

      if (!inventory || inventory.quantity < body.quantity) {
        return res.status(400).json({
          error: "Insufficient stock",
          available: inventory?.quantity || 0,
        });
      }

      const subtotal = productPrice * body.quantity;

      const order = await prisma.order.create({
        data: {
          userId,
          status: "PENDING",
          totalAmount: subtotal.toFixed(2), // Store as string for SQLite
          faydaVerified: session.faydaVerified,
          notes: body.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              faydaId: true,
            },
          },
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: body.productId,
          quantity: body.quantity,
          unitPrice: productPrice.toFixed(2),
          subtotal: subtotal.toFixed(2),
        },
      });

      await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: inventory.quantity - body.quantity },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "ORDER_CREATED",
          details: JSON.stringify({
            orderId: order.id,
            productId: body.productId,
            productName: product.name,
            quantity: body.quantity,
            totalAmount: subtotal,
          }),
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          type: "ORDER_UPDATE",
          title: "Order Placed Successfully",
          message: `Your order for ${product.name} has been placed. Order ID: ${order.id.slice(0, 8).toUpperCase()}`,
          link: `/dashboard/farmer/orders`,
        },
      });

      return res.status(201).json({
        orderId: order.id,
        status: order.status,
        totalAmount: subtotal,
        createdAt: order.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const session = await verifySession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { orderId, status, ...data } = req.body;

      if (!["GOVERNMENT", "ADMIN"].includes(session.role)) {
        return res.status(403).json({ error: "Unauthorized to update order status" });
      }

      const validStatuses = [
        "PENDING",
        "PAID",
        "READY_FOR_PICKUP",
        "PICKED_UP",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          user: true,
          items: {
            include: { product: true },
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: `ORDER_STATUS_CHANGED`,
          details: JSON.stringify({
            orderId,
            oldStatus: data.previousStatus || "UNKNOWN",
            newStatus: status,
          }),
        },
      });

      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER_UPDATE",
          title: "Order Status Updated",
          message: `Your order status has been updated to: ${status.replace(/_/g, " ")}`,
          link: "/dashboard/farmer/orders",
        },
      });

      return res.status(200).json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
