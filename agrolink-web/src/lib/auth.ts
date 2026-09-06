import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function verifySession(req: any) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    faydaVerified: session.user.faydaVerified || false,
    email: session.user.email,
  };
}

export async function requireRole(req: any, allowedRoles: string[]) {
  const session = await verifySession(req);
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
