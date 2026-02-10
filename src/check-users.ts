import { getPayloadClient } from './get-payload'

const checkUsers = async () => {
    const payload = await getPayloadClient()

    const users = await payload.find({
        collection: 'users',
    })

    console.log('--- USERS ---')
    users.docs.forEach((user) => {
        console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role}`)
    })
    console.log('------------')

    process.exit(0)
}

checkUsers()
