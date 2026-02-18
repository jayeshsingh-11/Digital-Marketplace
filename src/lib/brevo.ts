
import nodemailer from 'nodemailer'

interface BrevoEmailProps {
    subject: string
    htmlContent: string
    to: { email: string; name?: string }[]
    sender?: { email: string; name: string }
}

export const sendBrevoEmail = async ({
    subject,
    htmlContent,
    to,
    sender = { email: process.env.GMAIL_USER || 'creativecascade@email.com', name: 'Creative Cascade' },
}: BrevoEmailProps) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || process.env.BREVO_API_KEY, // Use SMTP_PASS or fallback to the key we added
        },
    })

    try {
        const info = await transporter.sendMail({
            from: `"${sender.name}" <${sender.email}>`,
            to: to.map(t => t.name ? `"${t.name}" <${t.email}>` : t.email).join(', '),
            subject,
            html: htmlContent,
        })

        console.log('Message sent: %s', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email via SMTP:', error)
        throw error
    }
}
