import { getPayloadClient } from './get-payload'

const run = async () => {
    const payload = await getPayloadClient({
        initOptions: {
            express: undefined,
        },
    })

    // Email to promote - grabbing from screenshot context
    const email = 'janhvisingh955@gmail.com'

    const { docs: users } = await payload.find({
        collection: 'users',
        where: {
            email: {
                equals: email,
            },
        },
    })

    if (!users[0]) {
        console.log(`User with email ${email} not found.`)
        process.exit(1)
    }

    await payload.update({
        collection: 'users',
        id: users[0].id,
        data: {
            role: 'admin',
        },
    })

    console.log(`Successfully promoted ${email} to admin!`)
    process.exit(0)
}

run()
