import { getPayloadClient } from './get-payload'

const updateAdmin = async () => {
    const payload = await getPayloadClient()

    const email = 'jayeshsingh881@gmail.com'
    const password = '@jayesh2005'

    console.log(`Searching for user: ${email}...`)

    const users = await payload.find({
        collection: 'users',
        where: {
            email: {
                equals: email,
            },
        },
        showHiddenFields: true,
    })

    if (users.docs.length === 0) {
        console.log(`User ${email} not found. Creating new admin user...`)
        await payload.create({
            collection: 'users',
            data: {
                email,
                password,
                role: 'admin',
            },
        })
        console.log('Created new admin user.')
    } else {
        const user = users.docs[0]
        console.log(`Found user ${email} (ID: ${user.id}). Updating role and password...`)

        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                role: 'admin',
                password: password,
            },
        })
        console.log('Updated existing user credentials and role.')
    }

    process.exit(0)
}

updateAdmin()
