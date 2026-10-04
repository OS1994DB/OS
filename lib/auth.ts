import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { normalizeUsername } from "@/lib/username";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = normalizeUsername(credentials?.username);
        if (!username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        await logAudit({
          userId: user.id,
          action: "auth.login",
          entityType: "User",
          entityId: user.id,
        });

        return { id: user.id, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        return token;
      }
      // Re-check the account on every session read so deactivation and role
      // changes take effect immediately rather than when the JWT expires.
      const current = token.id
        ? await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { active: true, role: true },
          })
        : null;
      if (!current || !current.active) return { revoked: true } as typeof token;
      token.role = current.role;
      return token;
    },
    async session({ session, token }) {
      // A revoked token yields an empty session, which getServerSession
      // reports as null.
      if (token.revoked) return {} as typeof session;
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
