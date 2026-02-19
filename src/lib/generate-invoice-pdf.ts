import { primaryFontBase64, scriptFontBase64 } from '@/lib/font-data'

// @ts-ignore - pdfkit doesn't ship types
import PDFDocument from 'pdfkit'

interface InvoiceData {
    invoiceNumber: string
    date: Date
    buyerEmail: string
    buyerName: string
    orderId: string
    razorpayPaymentId: string
    products: {
        name: string
        category: string
        price: number
    }[]
    subtotal: number
    fee: number
    total: number
    adminCommission: number
    sellerEarnings: number
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            font: null as any, // Prevent loading default font
            info: {
                Title: `Invoice ${data.invoiceNumber}`,
                Author: 'Creative Cascade',
            },
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks as any)))
        doc.on('error', reject)

        const pageWidth = doc.page.width - 100 // margins
        const accentColor = '#6366f1'
        const darkColor = '#111827'
        const grayColor = '#6b7280'
        const lightGray = '#f3f4f6'

        // Register bundled fonts
        const primaryFontBuffer = Buffer.from(primaryFontBase64, 'base64')
        const scriptFontBuffer = Buffer.from(scriptFontBase64, 'base64')

        doc.registerFont('Sans', primaryFontBuffer)
        doc.registerFont('Script', scriptFontBuffer)

        // ─── Header ─────────────────────────────────
        // Left side: Brand Logo
        // "Creative" in Script font
        doc
            .fontSize(36)
            .font('Script')
            .fillColor(darkColor)
            .text('Creative', 50, 40)

        // "CASCADE" in Sans font, uppercase, wide spacing
        doc
            .fontSize(10)
            .font('Sans')
            .fillColor(darkColor)
            .text('CASCADE', 55, 85, { characterSpacing: 5 })

        // ─── Header Right Side (Invoice Badge) ──────
        // Using Sans font for the rest
        doc
            .font('Sans')
            .fontSize(24)
            .fillColor(darkColor)
            .text('INVOICE', 350, 50, { align: 'right', characterSpacing: 0 })

        doc
            .fontSize(10)
            .fillColor(accentColor)
            .text(data.invoiceNumber, 350, 78, { align: 'right' })

        // Subtitle slogan below logo? Or just leave as is.
        // Moving "Your Digital Marketplace" down or removing it to match cleaner brand style?
        // Let's keep it but move it down or remove it if it clashes.
        // User asked for "write brand name in invoice pdf in this style".
        // I'll skip slogan to keep it clean like the reference.

        // Divider
        doc
            .moveTo(50, 110)
            .lineTo(50 + pageWidth, 110)
            .strokeColor('#e5e7eb')
            .lineWidth(1)
            .stroke()

        // ─── Invoice Details ────────────────────────
        let y = 130

        // Left column
        doc.fontSize(9).font('Sans').fillColor(grayColor).text('BILL TO', 50, y)
        y += 14
        doc.fontSize(11).font('Sans').fillColor(darkColor).text(data.buyerName, 50, y)
        y += 15
        doc.fontSize(10).font('Sans').fillColor(grayColor).text(data.buyerEmail, 50, y)

        // Right column
        let ry = 130
        doc.fontSize(9).font('Sans').fillColor(grayColor).text('INVOICE DATE', 350, ry, { align: 'right' })
        ry += 14
        doc.fontSize(10).font('Sans').fillColor(darkColor).text(
            data.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            350, ry, { align: 'right' }
        )
        ry += 20
        doc.fontSize(9).font('Sans').fillColor(grayColor).text('PAYMENT ID', 350, ry, { align: 'right' })
        ry += 14
        doc.fontSize(9).font('Sans').fillColor(darkColor).text(data.razorpayPaymentId, 350, ry, { align: 'right' })
        ry += 20
        doc.fontSize(9).font('Sans').fillColor(grayColor).text('ORDER ID', 350, ry, { align: 'right' })
        ry += 14
        doc.fontSize(8).font('Sans').fillColor(grayColor).text(data.orderId, 300, ry, { align: 'right', width: 245 })

        // ─── Products Table ─────────────────────────
        y = 250

        // Table header background
        doc
            .rect(50, y, pageWidth, 28)
            .fill(darkColor)

        doc
            .fontSize(9)
            .font('Sans')
            .fillColor('#ffffff')
            .text('#', 60, y + 9, { width: 30 })
            .text('PRODUCT', 90, y + 9, { width: 250 })
            .text('CATEGORY', 340, y + 9, { width: 100 })
            .text('PRICE', 440, y + 9, { width: 100, align: 'right' })

        y += 28

        // Table rows
        data.products.forEach((product, index) => {
            const isEven = index % 2 === 0
            if (isEven) {
                doc.rect(50, y, pageWidth, 28).fill(lightGray)
            }

            doc
                .fontSize(9)
                .font('Sans')
                .fillColor(darkColor)
                .text(String(index + 1), 60, y + 9, { width: 30 })
                .text(product.name, 90, y + 9, { width: 250 })
                .fillColor(grayColor)
                .text(product.category, 340, y + 9, { width: 100 })
                .fillColor(darkColor)
                .text(`₹${product.price.toFixed(2)}`, 440, y + 9, { width: 100, align: 'right' })

            y += 28
        })

        // ─── Price Summary ──────────────────────────
        y += 16

        // Subtotal
        doc.fontSize(10).font('Sans').fillColor(grayColor).text('Subtotal', 340, y)
        doc.fontSize(10).font('Sans').fillColor(darkColor).text(`₹${data.subtotal.toFixed(2)}`, 440, y, { width: 100, align: 'right' })
        y += 20

        // Fee
        doc.fontSize(10).font('Sans').fillColor(grayColor).text('Transaction Fee', 340, y)
        doc.fontSize(10).font('Sans').fillColor(darkColor).text(`₹${data.fee.toFixed(2)}`, 440, y, { width: 100, align: 'right' })
        y += 20

        // Divider
        doc.moveTo(340, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke()
        y += 10

        // Total
        doc.fontSize(14).font('Sans').fillColor(darkColor).text('Total', 340, y)
        doc.fontSize(14).font('Sans').fillColor(accentColor).text(`₹${data.total.toFixed(2)}`, 440, y, { width: 100, align: 'right' })
        y += 30

        // ─── Commission Breakdown ───────────────────
        // Light box
        doc.rect(50, y, pageWidth, 50).fill('#faf5ff').stroke('#e9d5ff')
        y += 12

        doc.fontSize(8).font('Sans').fillColor('#7c3aed').text('PAYMENT SPLIT', 65, y)
        y += 14

        doc.fontSize(9).font('Sans').fillColor(grayColor)
            .text('Platform Fee (10%)', 65, y)
            .text(`₹${data.adminCommission.toFixed(2)}`, 200, y)
            .text('Seller Earnings (90%)', 300, y)
            .text(`₹${data.sellerEarnings.toFixed(2)}`, 440, y)

        // ─── Footer ─────────────────────────────────
        y = doc.page.height - 100

        doc.moveTo(50, y).lineTo(50 + pageWidth, y).strokeColor('#e5e7eb').lineWidth(1).stroke()
        y += 15

        doc
            .fontSize(9)
            .font('Sans')
            .fillColor(grayColor)
            .text('Thank you for your purchase on Creative Cascade!', 50, y, { align: 'center', width: pageWidth })

        y += 14
        doc
            .fontSize(8)
            .fillColor('#d1d5db')
            .text('This is a computer-generated invoice and does not require a signature.', 50, y, { align: 'center', width: pageWidth })

        y += 12
        doc
            .fontSize(8)
            .fillColor('#d1d5db')
            .text(`© ${new Date().getFullYear()} Creative Cascade. All rights reserved.`, 50, y, { align: 'center', width: pageWidth })

        doc.end()
    })
}
