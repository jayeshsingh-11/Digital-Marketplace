import { User } from '../payload-types'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { NextRequest } from 'next/server'
import { getPayloadClient } from '../get-payload'

export const getServerSideUser = async (
  cookies: NextRequest['cookies'] | ReadonlyRequestCookies
) => {
  const token = cookies.get('payload-token')?.value

  if (!token) return { user: null }

  try {
    const payload = await getPayloadClient()
    const { user } = await (payload as any).auth({
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    return { user }
  } catch (err) {
    // console.error(err)
    return { user: null }
  }
}
