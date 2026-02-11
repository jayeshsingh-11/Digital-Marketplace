import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator'
import { publicProcedure, router } from './trpc'
import { getPayloadClient } from '../get-payload'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input

      try {
        const payload = await getPayloadClient()

        // check if user already exists
        const { docs: users } = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: email,
            },
          },
        })

        if (users.length !== 0)
          throw new TRPCError({ code: 'CONFLICT' })

        await payload.create({
          collection: 'users',
          data: {
            email,
            password,
            role: 'user',
          },
        })

        return { success: true, sentToEmail: email }
      } catch (err) {
        console.error('CREATE USER ERROR:', err)
        if (err instanceof TRPCError) throw err
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: String(err) })
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const { token } = input
      const { res } = ctx

      const payload = await getPayloadClient()

      const { docs: users } = await payload.find({
        collection: 'users',
        where: {
          _verificationToken: {
            equals: token,
          },
        },
      })

      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token,
      })

      if (!isVerified)
        throw new TRPCError({ code: 'UNAUTHORIZED' })

      const user = users[0]

      if (user) {
        const token = jwt.sign(
          {
            email: user.email,
            id: user.id || (user as any)._id,
            collection: 'users',
          },
          process.env.PAYLOAD_SECRET!,
          { expiresIn: '30d' }
        )

        res.cookie('payload-token', token, {
          httpOnly: true,
          secure: false, // process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
      }

      return { success: true }
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input
      const { res } = ctx

      const payload = await getPayloadClient()

      try {
        await payload.login({
          collection: 'users',
          data: {
            email,
            password,
          },
          res,
        })

        return { success: true }
      } catch (err) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    }),

  signInWithGoogle: publicProcedure
    .input(z.object({ idToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { idToken } = input
      const { res } = ctx

      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        const payloadData = ticket.getPayload()

        if (!payloadData || !payloadData.email) {
          throw new TRPCError({ code: 'UNAUTHORIZED' })
        }

        const { email, sub: googleId } = payloadData

        const payload = await getPayloadClient()

        const { docs: users } = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: email,
            },
          },
        })

        const user = users[0]

        if (!user) {
          // Create user with random password
          const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

          await payload.create({
            collection: 'users',
            data: {
              email,
              password,
              role: 'user',
              googleId,
              _verified: true,
            } as any,
          })

          // Login the new user
          await payload.login({
            collection: 'users',
            data: { email, password },
            res,
          })
        } else {
          // Link Google Account if not linked
          // @ts-expect-error user possibly undefined typed but we checked
          if (!user.googleId) {
            await payload.update({
              collection: 'users',
              id: user.id,
              data: { googleId, _verified: true } as any
            })
          } else if (!user._verified) {
            await payload.update({
              collection: 'users',
              id: user.id,
              data: { _verified: true }
            })
          }

          // Generate a random password to log the user in
          // This ensures we can use payload.login to get a valid token/cookie
          const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

          await payload.update({
            collection: 'users',
            id: user.id || (user as any)._id,
            data: { password: generatedPassword }
          })

          await payload.login({
            collection: 'users',
            data: { email: user.email, password: generatedPassword },
            res,
          })

          // We don't need manual cookie setting anymore
        }

        return { success: true }
      } catch (err) {
        console.error('GOOGLE SIGN IN ERROR:', err)
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input
      const payload = await getPayloadClient()

      try {
        await payload.forgotPassword({
          collection: 'users',
          data: { email },
        })
        return { success: true }
      } catch (err) {
        // Don't reveal if email exists or not for security
        return { success: true }
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const { token, password } = input
      const payload = await getPayloadClient()

      try {
        await payload.resetPassword({
          collection: 'users',
          data: { token, password },
          overrideAccess: true,
        })
        return { success: true }
      } catch (err) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
    }),
})
