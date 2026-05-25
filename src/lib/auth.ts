import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Resend from 'next-auth/providers/resend'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT strategy allows middleware to read role without hitting the DB
  session: { strategy: 'jwt' },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'Cronos <noreply@resend.dev>',
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, embed id and role into the token
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: UserRole }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as UserRole
      return session
    },
  },
})
