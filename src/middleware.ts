import { NextRequest, NextResponse } from 'next/server'


export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req
  const isLoggedIn = cookies.has('payload-token')

  // if (
  //   isLoggedIn &&
  //   ['/sign-in', '/sign-up'].includes(nextUrl.pathname)
  // ) {
  //   return NextResponse.redirect(
  //     new URL('/', req.url)
  //   )
  // }

  return NextResponse.next()
}
