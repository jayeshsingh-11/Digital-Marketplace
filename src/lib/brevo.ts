
import nodemailer from 'nodemailer'

interface BrevoEmailProps {
    subject: string
    htmlContent: string
    to: { email: string; name?: string }[]
    sender?: { email: string; name: string }
    attachments?: { filename: string; content: Buffer; contentType?: string }[]
}

export const sendBrevoEmail = async ({
    subject,
    htmlContent,
    to,
    sender = { email: process.env.GMAIL_USER || 'techglow881@gmail.com', name: 'Creative Cascade' },
    attachments,
}: BrevoEmailProps) => {
    console.log('📧 Email: Preparing to send...')
    console.log('📧 Recipient:', to.map(t => t.email).join(', '))
    console.log('📧 Subject:', subject)

    // Determine which SMTP to use
    // Priority: Gmail App Password > Brevo SMTP
    const useGmail = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)

    let transportConfig: any

    if (useGmail) {
        console.log('📧 Using Gmail SMTP')
        transportConfig = {
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        }
    } else {
        console.log('📧 Using Brevo SMTP')
        transportConfig = {
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS || process.env.BREVO_API_KEY,
            },
        }
    }

    const transporter = nodemailer.createTransport(transportConfig)

    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${process.env.GMAIL_USER || sender.email}>`,
            to: to.map(t => t.name ? `"${t.name}" <${t.email}>` : t.email).join(', '),
            subject,
            html: htmlContent,
            attachments: attachments?.map(a => ({
                filename: a.filename,
                content: a.content,
                contentType: a.contentType || 'application/pdf',
            })),
        })

        console.log('✅ Email sent successfully! MessageId:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error: any) {
        console.error('❌ Email send FAILED:', error?.message || error)
        console.error('❌ Full error:', JSON.stringify(error, null, 2))
        throw error
    }
}
