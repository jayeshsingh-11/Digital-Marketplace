
import {
    Body,
    Button,
    Container,
    Head,
    Html,
    Img,
    Preview,
    Section,
    Text,
    render,
} from '@react-email/components'
import * as React from 'react'

interface ResetPasswordEmailProps {
    userFirstname?: string
    resetPasswordLink?: string
}

export const ResetPasswordEmail = ({
    userFirstname,
    resetPasswordLink,
}: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Reset your password for Creative Cascade</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Text style={creativeText}>Creative</Text>
                        <Text style={cascadeText}>CASCADE</Text>
                    </Section>
                    <Section style={content}>
                        <Text style={welcomeText}>Hi {userFirstname},</Text>
                        <Text style={text}>
                            Lost your key to the creative kingdom? No worries, we&apos;ve got a spare key ready for you.
                        </Text>
                        <Text style={text}>
                            Click the button below to reset your password and get back to creating.
                        </Text>
                        <Section style={btnContainer}>
                            <Button
                                style={button}
                                href={resetPasswordLink}
                            >
                                Reset Password
                            </Button>
                        </Section>
                        <Text style={text}>
                            If you didn&apos;t request a password reset, you can safely ignore this email.
                        </Text>
                    </Section>
                    <Text style={footerText}>
                        © 2024 Creative Cascade. All rights reserved.
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

export const ResetPasswordEmailHtml = (props: ResetPasswordEmailProps) =>
    render(<ResetPasswordEmail {...props} />, {
        pretty: true,
    })

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    padding: '40px 0',
}

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
    maxWidth: '100%',
}

const logoContainer = {
    textAlign: 'center' as const,
    marginBottom: '30px',
}

const creativeText = {
    fontSize: '36px',
    fontFamily: 'Brush Script MT, cursive',
    color: '#000',
    fontStyle: 'italic',
    marginBottom: '-15px',
    marginTop: '0px',
    lineHeight: '1',
}

const cascadeText = {
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    color: '#000',
    letterSpacing: '0.4em',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    marginTop: '0px',
}

const content = {
    backgroundColor: '#ffffff',
    border: '1px solid #e7e7e7',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}

const welcomeText = {
    fontSize: '24px',
    fontWeight: 'inheirt',
    color: '#1a1a1a',
    margin: '0 0 20px',
    textAlign: 'left' as const,
}

const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4a4a4a',
    marginBottom: '20px',
    textAlign: 'left' as const,
}

const btnContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
}

const button = {
    backgroundColor: '#000000',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 40px',
}

const footerText = {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center' as const,
    marginTop: '20px',
}
