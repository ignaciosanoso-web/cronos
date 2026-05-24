import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Resend from 'next-auth/providers/resend'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'Cronos <noreply@resend.dev>',
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verificar',
    error: '/login',
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as { role: UserRole }).role
      return session
    },
  },
})
