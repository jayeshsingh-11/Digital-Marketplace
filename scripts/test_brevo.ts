
import dotenv from 'dotenv'
import path from 'path'
import { sendBrevoEmail } from '../src/lib/brevo'

// Load env vars from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const runTest = async () => {
    console.log('Testing Brevo SMTP...')
    try {
        // Ensure SMTP_PASS is set for the test context matching the key provided
        // If .env loaded correctly, it should be there.
        if (!process.env.SMTP_PASS) {
            // Fallback for immediate testing if .env isn't picking up the key yet
            process.env.SMTP_PASS = process.env.BREVO_API_KEY
        }

        const email = process.env.SMTP_USER || 'jayeshsingh881@gmail.com'

        await sendBrevoEmail({
            subject: 'SMTP Test',
            htmlContent: '<h1>It Works!</h1><p>This email was sent using Nodemailer and Brevo SMTP.</p>',
            to: [{ email, name: 'Test User' }],
            sender: { email: process.env.GMAIL_USER || 'techglow881@gmail.com', name: 'Creative Cascade Test' }
        })
        console.log('Test successful')
    } catch (err) {
        console.error('Test failed:', err)
    }
}

runTest()
