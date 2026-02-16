'use client'

import { User } from '@/payload-types'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'
import { User as UserIcon } from 'lucide-react'

const UserAccountNav = ({ user }: { user: User }) => {
  const { signOut } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='overflow-visible'>
        <Button
          variant='ghost'
          size='sm'
          className='relative h-8 w-8 rounded-full'>
          {user.image_url ? (
            <div className='relative aspect-square h-full w-full'>
              <Image
                fill
                src={user.image_url}
                alt='profile picture'
                referrerPolicy='no-referrer'
                className='rounded-full object-cover'
              />
            </div>
          ) : (
            <div className='flex h-full w-full items-center justify-center rounded-full bg-slate-100'>
              <UserIcon className='h-4 w-4 text-slate-500' aria-hidden='true' />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className='bg-white w-60'
        align='end'>
        <div className='flex items-center justify-start gap-2 p-2'>
          <div className='flex flex-col space-y-0.5 leading-none'>
            <p className='font-medium text-sm text-black'>
              {user.name || user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href='/admin'>Admin Dashboard</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href='/account'>Account Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/seller'>Seller Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={signOut}
          className='cursor-pointer'>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav
