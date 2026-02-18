import { AuthCredentialsValidator } from '../lib/validators/account-credentials-validator'
import { publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { resend } from '@/lib/resend'
import { ResetPasswordEmailHtml } from '@/components/emails/ResetPasswordEmail'
import { sendBrevoEmail } from '@/lib/brevo'

export const authRouter = router({
  createUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input

      // We need a Service Role client to check for existing users reliably
      // and to create verified users without sending confirmation emails immediately if we want instant login.
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // 1. Check if user already exists
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

      if (listError) {
        console.error('Error listing users:', listError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }

      const existingUser = users.find(u => u.email === email)

      if (existingUser) {
        throw new TRPCError({ code: 'CONFLICT', message: 'This email is already in use. Sign in instead?' })
      }

      // 2. Create user with email confirmed (so they can login immediately)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create account.' })
      }

      // 3. Sign in the user immediately to set the session cookie
      // We use the standard client for this because it handles cookies/middleware
      const supabase = createClient(cookies())

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        console.error('Error signing in new user:', signInError)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Account created but failed to sign in.' })
      }

      return { success: true, sentToEmail: email }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      // Supabase verification is typically done via the link sent to email which hits a Supabase endpoint
      // or a Next.js API route that exchanges the code. 
      // This TRPC endpoint might not be needed if we stick to standard Supabase flow.
      // However, if we want to confirm verification status:
      return { success: true }
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input }) => {
      const { email, password } = input
      const supabase = createClient(cookies())

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Supabase Login Error:', error)
        throw new TRPCError({ code: 'UNAUTHORIZED', message: error.message })
      }

      console.log('Supabase Login Success for:', email)

      return { success: true }
    }),

  signInWithGoogle: publicProcedure
    .input(z.object({ idToken: z.string() }))
    .mutation(async ({ input }) => {
      const { idToken } = input
      const supabase = createClient(cookies())

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      })

      if (error) {
        console.error('Google ID Token Error:', error)
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return { success: true }
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { email } = input

      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password-confirm`,
        }
      })

      if (error) {
        console.error('Error generating reset link:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate reset link.' })
      }

      const { properties } = data
      const resetLink = properties.action_link

      try {
        const htmlContent = await ResetPasswordEmailHtml({
          resetPasswordLink: resetLink,
          userFirstname: email.split('@')[0]
        })

        await sendBrevoEmail({
          subject: 'Reset your password',
          to: [{ email, name: email.split('@')[0] }], // Brevo expects array of objects
          htmlContent,
          sender: { email: 'creativecascade@email.com', name: 'Creative Cascade' } // Using a placeholder or valid sender
        })
      } catch (err) {
        console.error('Error sending email via Brevo:', err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send email.' })
      }

      return { success: true }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(), // This assumes the token is passed, but Supabase usually handles exchange via link
      password: z.string().min(8)
    }))
    .mutation(async ({ input }) => {
      const { password } = input
      const supabase = createClient(cookies())

      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })
      }

      return { success: true }
    }),
})

