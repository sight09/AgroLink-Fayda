import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import qs from "querystring";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Fayda",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.code) return null;

        // This is a simplified version - in production you'd use the full Fayda OIDC flow
        // For demo purposes, we'll create a session from the callback code
        try {
          const params = qs.stringify({
            grant_type: "authorization_code",
            code: credentials.code,
            redirect_uri: process.env.FAYDA_REDIRECT_URI || "http://localhost:3000/api/auth/callback/fayda",
            client_assertion_type: process.env.FAYDA_CLIENT_ASSERTION_TYPE || "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            client_assertion: "",
          });

          // In a real app, you'd exchange the code for tokens here
          // For now, return a minimal user
          return {
            id: "demo-user",
            name: "Demo User",
            email: "demo@agrolink.et",
            role: "FARMER",
            faydaVerified: true,
            faydaId: "FAYDA-DEMO-001",
          };
        } catch (error) {
          console.error("Fayda auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.faydaVerified = user.faydaVerified;
        token.faydaId = user.faydaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.faydaVerified = token.faydaVerified as boolean;
        session.user.faydaId = token.faydaId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};

export default NextAuth(authOptions);
