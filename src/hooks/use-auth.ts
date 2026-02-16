import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { createClient } from '@/lib/supabase/client'

export const useAuth = () => {
  const router = useRouter()
  const clearCart = useCart((state) => state.clearCart)

  const signOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      clearCart()
      toast.success('Signed out successfully')

      router.push('/sign-in')
      router.refresh()
    } catch (err) {
      toast.error("Couldn't sign out, please try again.")
    }
  }

  return { signOut }
}

