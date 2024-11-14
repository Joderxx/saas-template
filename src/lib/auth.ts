import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GitHub from "next-auth/providers/github";
import Google, { GoogleProfile } from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { object, string, ZodError } from "zod"
import {hashPassword, USER_ROLE} from "./utils";

export const signInSchema = object({
  email: string()
    .min(1)
    .email(),
  password: string()
    .min(1)
    .min(8)
    .max(32),
})

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // todo: add redis
        try {
          const { email, password } = await signInSchema.parseAsync(credentials)

          const user = await prisma.user.findUnique({
            where: { email }
          })
          if (!user || user.forbidden) {
            return null
          }
          if (user.password !== hashPassword(password)) {
            return null
          }
          return user
        } catch (error) {
          if (error instanceof ZodError) {
            return null
          }
          return null
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile: profile => ({
        role: USER_ROLE,
        ...profile
      })
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // @ts-ignore
      return !user.forbidden
    },
    async jwt({ token, trigger, user, session }) {
      // todo: add redis
      if (user) {
        token.id = user.id
      }
      if (trigger === "update" || trigger === "signIn") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        })
        if (dbUser && !dbUser.forbidden) {
          try {
            // @ts-ignore
            token.role = dbUser.roleId || USER_ROLE
            if (dbUser.endSubscriptionAt && dbUser.endSubscriptionAt < new Date()) {
              // 订阅过期
              token.role = USER_ROLE
              await prisma.user.update({
                where: { id: token.sub },
                data: { roleId: USER_ROLE }
              })
            }
            token.name = dbUser.name
            const role = await prisma.userRole.findUnique({
              where: {
                id: dbUser.roleId || USER_ROLE,
              }
            })
            if (role) {
              // @ts-ignore
              token.permissions = role.permissions
            }
            await prisma.user.update({
              where: { id: token.sub },
              data: { lastLoginAt: new Date() }
            })
          } catch (error) {
            console.error(error)
          }
        } else {
          token.exp = -1
        }
        return token
      } else if (trigger === "signUp" && user) {
        token.exp = -1
      }
      return token
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        // @ts-ignore
        session.user.role = token.role
        // @ts-ignore
        session.user.permissions = token.permissions
        session.user.name = token.name
      }
      return session
    }
  }
})