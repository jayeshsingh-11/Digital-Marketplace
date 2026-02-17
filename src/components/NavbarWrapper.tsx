'use client'

import { usePathname } from 'next/navigation'

const NavbarWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    // Normalizing pathname to handle potential trailing slashes or query params if needed, 
    // though usePathname usually gives the path.
    // We strictly hide on sign-in and sign-up.
    const authRoutes = ['/sign-in', '/sign-up']

    if (pathname && authRoutes.includes(pathname)) {
        return null
    }

    return <>{children}</>
}

export default NavbarWrapper
