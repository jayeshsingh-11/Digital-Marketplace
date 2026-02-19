import { formatPrice } from '../../lib/utils'

import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  render,
} from '@react-email/components'

import * as React from 'react'
import { format } from 'date-fns'

interface ReceiptEmailProps {
  email: string
  date: Date
  orderId: string
  products: any[]
  invoiceNumber?: string
  adminCommission?: number
  sellerEarnings?: number
  razorpayPaymentId?: string
}

export const ReceiptEmail = ({
  email,
  date,
  orderId,
  products,
  invoiceNumber,
  adminCommission,
  sellerEarnings,
  razorpayPaymentId,
}: ReceiptEmailProps) => {
  const subtotal = products.reduce((acc, curr) => acc + (curr.price || 0), 0)
  const fee = 1
  const total = subtotal + fee
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>Your Creative Cascade order is confirmed! {invoiceNumber ? `Invoice ${invoiceNumber}` : ''}</Preview>

      <Body style={main}>
        <Container style={container}>

          {/* Header with Logo */}
          <Section style={headerSection}>
            <Row>
              <Column>
                <Text style={logoText}>
                  <span style={{ color: '#000000', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.5px' }}>Creative</span>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '28px', letterSpacing: '-0.5px' }}> Cascade</span>
                </Text>
                <Text style={logoTagline}>Your Digital Marketplace</Text>
              </Column>
              <Column align='right'>
                <Text style={receiptBadge}>✓ Payment Confirmed</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={mainDivider} />

          {/* Greeting */}
          <Section style={{ padding: '20px 0 10px 0' }}>
            <Text style={greetingText}>
              Hi {email.split('@')[0]},
            </Text>
            <Text style={subText}>
              Thank you for your purchase! Your payment has been verified and your digital assets are ready for download.
            </Text>
          </Section>

          {/* Invoice Details Card */}
          <Section style={infoCard}>
            <Text style={infoCardTitle}>Order Details</Text>
            <Row style={infoRow}>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Invoice Number</Text>
                <Text style={infoValue}>{invoiceNumber || '—'}</Text>
              </Column>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Order Date</Text>
                <Text style={infoValue}>{format(date, 'dd MMM yyyy, hh:mm a')}</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Order ID</Text>
                <Text style={{ ...infoValue, fontSize: '11px', wordBreak: 'break-all' as const }}>{orderId}</Text>
              </Column>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Payment ID</Text>
                <Text style={{ ...infoValue, fontSize: '11px', wordBreak: 'break-all' as const }}>{razorpayPaymentId || '—'}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Email</Text>
                <Text style={infoValue}>{email}</Text>
              </Column>
              <Column style={infoLabelCol}>
                <Text style={infoLabel}>Payment Method</Text>
                <Text style={infoValue}>Razorpay</Text>
              </Column>
            </Row>
          </Section>

          {/* Products */}
          <Section style={{ marginTop: '24px' }}>
            <Text style={sectionTitle}>Items Purchased</Text>
          </Section>

          {products.map((product, index) => {
            const image = product.product_images?.[0]?.media
            const imageUrl = image?.url

            return (
              <Section key={product.id || index} style={productRow}>
                <Row>
                  <Column style={{ width: '56px', verticalAlign: 'top' }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        width='48'
                        height='48'
                        alt={product.name}
                        style={productImg}
                      />
                    ) : (
                      <div style={productImgPlaceholder}>📦</div>
                    )}
                  </Column>
                  <Column style={{ paddingLeft: '12px', verticalAlign: 'top' }}>
                    <Text style={productName}>{product.name}</Text>
                    <Text style={productCategory}>{product.category}</Text>
                  </Column>
                  <Column align='right' style={{ verticalAlign: 'top', width: '100px' }}>
                    <Text style={productPriceText}>{formatPrice(product.price)}</Text>
                  </Column>
                </Row>
              </Section>
            )
          })}

          {/* Price Breakdown */}
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0 16px 0' }} />

          <Section>
            <Row>
              <Column><Text style={priceLabel}>Subtotal</Text></Column>
              <Column align='right'><Text style={priceValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={priceLabel}>Transaction Fee</Text></Column>
              <Column align='right'><Text style={priceValue}>{formatPrice(fee)}</Text></Column>
            </Row>
          </Section>

          <Hr style={{ borderColor: '#111827', margin: '12px 0', borderWidth: '2px' }} />

          <Section>
            <Row>
              <Column><Text style={totalLabel}>Total Paid</Text></Column>
              <Column align='right'><Text style={totalValue}>{formatPrice(total)}</Text></Column>
            </Row>
          </Section>

          {/* Commission Breakdown (subtle) */}
          {(adminCommission !== undefined && sellerEarnings !== undefined) && (
            <Section style={commissionCard}>
              <Text style={commissionTitle}>Payment Split</Text>
              <Row>
                <Column><Text style={commissionLabel}>Platform Fee (10%)</Text></Column>
                <Column align='right'><Text style={commissionValue}>{formatPrice(adminCommission)}</Text></Column>
              </Row>
              <Row>
                <Column><Text style={commissionLabel}>Seller Earnings (90%)</Text></Column>
                <Column align='right'><Text style={commissionValue}>{formatPrice(sellerEarnings)}</Text></Column>
              </Row>
            </Section>
          )}

          {/* Download CTA */}
          <Section style={ctaSection}>
            <Text style={ctaTitle}>🎉 Your downloads are ready!</Text>
            <Text style={ctaSubtext}>
              Access your purchased assets from your orders page. Download links are secured and only available to you.
            </Text>
            <Section style={{ textAlign: 'center' as const, marginTop: '16px' }}>
              <Link
                href={`${serverUrl}/thank-you?orderId=${orderId}`}
                style={ctaButton}
              >
                Download Your Assets →
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: '#e5e7eb', margin: '32px 0 20px 0' }} />

          <Section>
            <Text style={footerBrand}>
              <span style={{ color: '#000', fontWeight: 600 }}>Creative</span>
              <span style={{ color: '#6366f1', fontWeight: 600 }}> Cascade</span>
            </Text>
            <Text style={footerLinks}>
              <Link href={`${serverUrl}/account`} style={footerLink}>Account</Link>
              {' • '}
              <Link href={`${serverUrl}/products`} style={footerLink}>Browse Products</Link>
              {' • '}
              <Link href='#' style={footerLink}>Help Center</Link>
            </Text>
            <Text style={footerCopy}>
              © {new Date().getFullYear()} Creative Cascade. All rights reserved.
            </Text>
            <Text style={footerNote}>
              This email was sent to {email} because you made a purchase on Creative Cascade.
              If you did not make this purchase, please contact our support immediately.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

export const ReceiptEmailHtml = (props: ReceiptEmailProps) =>
  render(<ReceiptEmail {...props} />, { pretty: true })

// ─── Styles ──────────────────────────────────────────

const main = {
  fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  backgroundColor: '#f9fafb',
}

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
}

const headerSection = {
  padding: '0 0 16px 0',
}

const logoText = {
  margin: '0',
  padding: '0',
  lineHeight: '1.2',
}

const logoTagline = {
  margin: '4px 0 0 0',
  fontSize: '12px',
  color: '#9ca3af',
  fontWeight: 400 as const,
}

const receiptBadge = {
  margin: '0',
  padding: '6px 14px',
  backgroundColor: '#ecfdf5',
  color: '#059669',
  fontSize: '13px',
  fontWeight: 600 as const,
  borderRadius: '20px',
  display: 'inline-block' as const,
}

const mainDivider = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const greetingText = {
  fontSize: '18px',
  fontWeight: 600 as const,
  color: '#111827',
  margin: '0 0 8px 0',
}

const subText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '1.6',
}

const infoCard = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '20px',
  border: '1px solid #f3f4f6',
}

const infoCardTitle = {
  fontSize: '14px',
  fontWeight: 600 as const,
  color: '#111827',
  margin: '0 0 16px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const infoRow = {
  marginBottom: '12px',
}

const infoLabelCol = {
  padding: '0 8px 0 0',
}

const infoLabel = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.3px',
  fontWeight: 500 as const,
}

const infoValue = {
  fontSize: '13px',
  color: '#111827',
  margin: '2px 0 8px 0',
  fontWeight: 500 as const,
}

const sectionTitle = {
  fontSize: '14px',
  fontWeight: 600 as const,
  color: '#111827',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const productRow = {
  padding: '12px 0',
  borderBottom: '1px solid #f3f4f6',
}

const productImg = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  objectFit: 'cover' as const,
}

const productImgPlaceholder = {
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  backgroundColor: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
}

const productName = {
  fontSize: '14px',
  fontWeight: 600 as const,
  color: '#111827',
  margin: '0 0 2px 0',
}

const productCategory = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
  textTransform: 'capitalize' as const,
}

const productPriceText = {
  fontSize: '14px',
  fontWeight: 600 as const,
  color: '#111827',
  margin: '0',
}

const priceLabel = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '4px 0',
}

const priceValue = {
  fontSize: '13px',
  color: '#111827',
  fontWeight: 500 as const,
  margin: '4px 0',
}

const totalLabel = {
  fontSize: '16px',
  fontWeight: 700 as const,
  color: '#111827',
  margin: '4px 0',
}

const totalValue = {
  fontSize: '16px',
  fontWeight: 700 as const,
  color: '#111827',
  margin: '4px 0',
}

const commissionCard = {
  backgroundColor: '#faf5ff',
  borderRadius: '8px',
  padding: '14px 16px',
  marginTop: '16px',
  border: '1px solid #f3e8ff',
}

const commissionTitle = {
  fontSize: '11px',
  fontWeight: 600 as const,
  color: '#7c3aed',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const commissionLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '2px 0',
}

const commissionValue = {
  fontSize: '12px',
  color: '#374151',
  fontWeight: 500 as const,
  margin: '2px 0',
}

const ctaSection = {
  backgroundColor: '#111827',
  borderRadius: '12px',
  padding: '28px 24px',
  marginTop: '28px',
  textAlign: 'center' as const,
}

const ctaTitle = {
  fontSize: '18px',
  fontWeight: 700 as const,
  color: '#ffffff',
  margin: '0 0 8px 0',
}

const ctaSubtext = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '0',
  lineHeight: '1.5',
}

const ctaButton = {
  display: 'inline-block' as const,
  backgroundColor: '#6366f1',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 600 as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const footerBrand = {
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0 0 12px 0',
}

const footerLinks = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0 0 12px 0',
}

const footerLink = {
  color: '#6b7280',
  textDecoration: 'none',
}

const footerCopy = {
  fontSize: '11px',
  color: '#d1d5db',
  textAlign: 'center' as const,
  margin: '0 0 8px 0',
}

const footerNote = {
  fontSize: '11px',
  color: '#d1d5db',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
}
