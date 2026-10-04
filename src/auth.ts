import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // `repo` est requis pour lire/écrire les issues et le README du repo configuré
  // (indispensable pour les repos privés et pour déplacer une issue).
  providers: [
    GitHub({ authorization: { params: { scope: "read:user user:email repo" } } }),
  ],
  callbacks: {
    jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
