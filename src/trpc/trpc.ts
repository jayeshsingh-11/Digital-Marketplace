import { User } from '@/payload-types'
import { TRPCError, initTRPC } from '@trpc/server'

interface Context {
  user: User | null
}

const t = initTRPC.context<Context>().create()
const middleware = t.middleware

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const isAuth = middleware(async ({ ctx, next }) => {
  console.log('TRPC Middleware: Checking auth')
  const supabase = createClient(cookies())
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('TRPC Middleware: Auth error', error)
  }

  if (!user || !user.id) {
    console.error('TRPC Middleware: No user found')
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  console.log('TRPC Middleware: Authorized user', user.id)

  // Fetch the role from public.users table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  console.log('TRPC Middleware: User role', profile?.role)

  const userWithRole = {
    ...user,
    role: profile?.role || 'user',
  }

  return next({
    ctx: {
      user: userWithRole as unknown as User,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
