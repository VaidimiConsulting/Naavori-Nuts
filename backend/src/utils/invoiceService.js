import PDFDocument from 'pdfkit';

/**
 * Generates an elegant, printable Tax Invoice PDF for an order.
 * @param {Object} order - Full order object with items
 * @param {stream.Writable} res - Express response stream
 */
export const generateOrderInvoicePDF = (order, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Invoice - ${order.order_number}`,
          Author: 'NAAVORI NUTS',
          Subject: 'Tax Invoice'
        }
      });

      // Stream directly to response
      doc.pipe(res);

      const plum = '#38243F';
      const gold = '#D4AF37';
      const darkGray = '#333333';
      const lightGray = '#888888';
      const borderColor = '#E0D8CC';

      // ─── Header Banner ──────────────────────────────────────────
      doc.rect(40, 40, 515, 65).fill(plum);

      doc.fillColor(gold)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('NAAVORI NUTS', 55, 52, { characterSpacing: 2 });

      doc.fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica')
        .text('PURE ORIGINS  ·  REAL GOODNESS', 55, 80, { characterSpacing: 1 });

      doc.fillColor('#FFFFFF')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('TAX INVOICE', 390, 55, { align: 'right' });

      doc.fillColor(gold)
        .fontSize(9)
        .font('Helvetica')
        .text(`Original for Recipient`, 390, 78, { align: 'right' });

      let y = 120;

      // ─── Seller & Invoice Details ────────────────────────────────
      // Seller
      doc.fillColor(plum)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('SOLD BY:', 40, y);

      doc.fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica')
        .text('Naavori Artisan Nuts & Spices LLP', 40, y + 14)
        .text('K63/112, Nakkash, Chowk', 40, y + 26)
        .text('Varanasi, Uttar Pradesh – 221001', 40, y + 38)
        .text('GSTIN: 09AAECN1234F1Z5', 40, y + 50)
        .text('info@naavori.in  |  Ph: +91 83188 29334, +91 84481 70969', 40, y + 62);

      // Invoice info block (Right)
      const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      doc.fillColor(plum)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('INVOICE DETAILS:', 340, y);

      doc.fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica')
        .text(`Invoice No:  INV-${order.order_number}`, 340, y + 14)
        .text(`Order No:    #${order.order_number}`, 340, y + 26)
        .text(`Invoice Date: ${orderDate}`, 340, y + 38)
        .text(`Payment:     ${(order.payment_method || 'Online').toUpperCase()} (${(order.payment_status || 'Paid').toUpperCase()})`, 340, y + 50)
        .text(`Status:      ${(order.order_status || 'Confirmed').toUpperCase()}`, 340, y + 62);

      y += 85;

      // ─── Bill To / Ship To ────────────────────────────────────────
      doc.rect(40, y, 515, 60).fillAndStroke('#FAF7F2', borderColor);

      doc.fillColor(plum)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('BILL TO & SHIP TO:', 50, y + 8);

      const customerName = order.shipping_name || 'Valued Customer';
      const address1 = order.shipping_address_line1 || '';
      const address2 = order.shipping_address_line2 ? `, ${order.shipping_address_line2}` : '';
      const cityStatePin = `${order.shipping_city || 'Varanasi'}, ${order.shipping_state || 'Uttar Pradesh'} – ${order.shipping_pin_code || '221001'}`;
      const phone = order.shipping_phone ? `Phone: +91 ${order.shipping_phone}` : '';

      doc.fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(customerName, 50, y + 22);

      doc.font('Helvetica')
        .text(`${address1}${address2}, ${cityStatePin}`, 50, y + 34)
        .text(`${phone}  |  Email: ${order.guest_email || '—'}`, 50, y + 46);

      y += 75;

      // ─── Items Table Header ─────────────────────────────────────
      doc.rect(40, y, 515, 22).fill(plum);

      doc.fillColor('#FFFFFF')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('#', 48, y + 6)
        .text('Item Description', 70, y + 6)
        .text('Variant', 270, y + 6)
        .text('HSN', 340, y + 6)
        .text('Qty', 390, y + 6, { align: 'right', width: 30 })
        .text('Rate (Rs.)', 430, y + 6, { align: 'right', width: 55 })
        .text('Total (Rs.)', 495, y + 6, { align: 'right', width: 55 });

      y += 24;

      // ─── Line Items ─────────────────────────────────────────────
      const items = order.items || [];
      let subtotal = 0;

      items.forEach((item, index) => {
        const itemTotal = Number(item.price_per_unit || item.price || 0) * Number(item.quantity || 1);
        subtotal += itemTotal;

        const rowBg = index % 2 === 0 ? '#FFFFFF' : '#FCFAF7';
        doc.rect(40, y, 515, 22).fillAndStroke(rowBg, '#F0EBE1');

        doc.fillColor(darkGray)
          .fontSize(9)
          .font('Helvetica')
          .text(String(index + 1), 48, y + 6)
          .text(item.product_name || 'Artisanal Selection', 70, y + 6, { width: 190, ellipsis: true })
          .text(item.weight_label || 'Standard', 270, y + 6)
          .text('0802', 340, y + 6)
          .text(String(item.quantity || 1), 390, y + 6, { align: 'right', width: 30 })
          .text(Number(item.price_per_unit || item.price || 0).toFixed(2), 430, y + 6, { align: 'right', width: 55 })
          .text(itemTotal.toFixed(2), 495, y + 6, { align: 'right', width: 55 });

        y += 22;
      });

      y += 10;

      // ─── Financial Summary ──────────────────────────────────────
      const shippingFee = Number(order.shipping_fee || 0);
      const discount = Number(order.discount_amount || 0);
      const grandTotal = Number(order.total || (subtotal + shippingFee - discount));

      const summaryX = 350;
      doc.rect(summaryX, y, 205, 75).fillAndStroke('#FAF7F2', borderColor);

      doc.fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica')
        .text('Item Subtotal:', summaryX + 10, y + 10)
        .text(`Rs. ${subtotal.toFixed(2)}`, summaryX + 100, y + 10, { align: 'right', width: 85 });

      doc.text('Shipping & Handling:', summaryX + 10, y + 24)
        .text(shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee.toFixed(2)}`, summaryX + 100, y + 24, { align: 'right', width: 85 });

      if (discount > 0) {
        doc.fillColor('#cf1322')
          .text('Discount Applied:', summaryX + 10, y + 38)
          .text(`-Rs. ${discount.toFixed(2)}`, summaryX + 100, y + 38, { align: 'right', width: 85 });
      }

      doc.rect(summaryX, y + 52, 205, 23).fill(plum);
      doc.fillColor(gold)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Total Amount Paid:', summaryX + 10, y + 58)
        .text(`Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + 100, y + 58, { align: 'right', width: 85 });

      // Notes (Left side)
      doc.fillColor(lightGray)
        .fontSize(8)
        .font('Helvetica')
        .text('Terms & Conditions:', 40, y + 15)
        .text('• All taxes inclusive under Composition / GST scheme.', 40, y + 27)
        .text('• Store in a cool, airtight and dry container away from sunlight.', 40, y + 39)
        .text('• For customer support, reach out to info@naavori.in', 40, y + 51);

      y += 110;

      // ─── Footer Sign-off ────────────────────────────────────────
      doc.rect(40, y, 515, 1).fill(borderColor);

      doc.fillColor(plum)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Thank you for choosing NAAVORI.', 40, y + 12, { align: 'center', width: 515 });

      doc.fillColor(lightGray)
        .fontSize(8)
        .font('Helvetica')
        .text('This is a computer-generated tax invoice and requires no physical signature.', 40, y + 26, { align: 'center', width: 515 });

      // Finalize PDF
      doc.end();
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};
