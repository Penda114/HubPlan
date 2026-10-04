import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Configuration Auth.js partagée, compatible Edge (aucun import Node/Prisma).
 * Utilisée par le middleware ; `src/auth.ts` la réutilise côté serveur.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        token.githubId = account.providerAccountId;
        token.login =
          (profile as { login?: string } | undefined)?.login ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.githubId = token.githubId as string | undefined;
        session.user.login = token.login as string | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
