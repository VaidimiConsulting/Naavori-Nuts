import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const STORE_EMAIL = process.env.STORE_EMAIL || process.env.MAIL_FROM || 'info@naavori.in';
export const STORE_NAME = 'NAAVORI NUTS';

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass }
    });
  }

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return null;
};

// Safe delivery wrapper that logs if SMTP credentials aren't set
const deliverMail = async (mailOptions) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log(`[Email Service Simulated] (Configure SMTP_USER/PASS in .env to send real mail)`);
      console.log(`  From: ${mailOptions.from}`);
      console.log(`  To: ${mailOptions.to}`);
      console.log(`  Subject: ${mailOptions.subject}`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email delivered to ${mailOptions.to} | MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email delivery error (${mailOptions.to}):`, error.message);
    return { success: false, error: error.message };
  }
};

// ─── 1. Order Confirmation to Customer ───────────────────────────────────────
export const sendOrderConfirmationEmail = async (orderData, userEmail) => {
  if (!userEmail) return;

  const orderDate = new Date(orderData.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const itemsHtml = Array.isArray(orderData.items) && orderData.items.length > 0
    ? orderData.items.map(item => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0eae1;font-size:13px;color:#38243F;">
            <strong>${item.name || item.title || 'Product'}</strong><br/>
            <span style="color:#888;font-size:12px;">${item.variant_name || item.weight || 'Standard'} × ${item.quantity}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f0eae1;font-size:13px;font-weight:600;color:#38243F;">
            ₹${Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
          </td>
        </tr>
      `).join('')
    : `<tr><td colspan="2" style="padding:8px 0;font-size:13px;color:#666;">Standard Order Items</td></tr>`;

  const mailOptions = {
    from: `"${STORE_NAME} 🌿" <${STORE_EMAIL}>`,
    replyTo: STORE_EMAIL,
    to: userEmail,
    subject: `✅ Order Confirmed — #${orderData.order_number} | Naavori Nuts`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:#38243F;padding:32px 36px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:26px;letter-spacing:4px;font-weight:400;">NAAVORI NUTS</h1>
              <p style="margin:6px 0 0;color:#c5b5c5;font-size:12px;letter-spacing:2px;">PURE ORIGINS · REAL GOODNESS · VARANASI</p>
            </td>
          </tr>

          <!-- Banner -->
          <tr>
            <td style="background:#D4AF37;padding:16px 36px;text-align:center;">
              <p style="margin:0;color:#38243F;font-size:15px;font-weight:700;">✅ Your order has been placed successfully!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="font-size:15px;color:#333;margin:0 0 8px;">Namaste <strong>${orderData.shipping_name || 'Valued Patron'}</strong>,</p>
              <p style="font-size:13.5px;color:#555;line-height:1.6;margin:0 0 24px;">
                Thank you for your order with NAAVORI. We have received your order and are freshly packing your ingredients with utmost hygiene and care.
              </p>

              <!-- Order Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border-radius:10px;border:1px solid #ebdccb;margin-bottom:24px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 12px;font-size:12px;color:#8a7a8d;letter-spacing:1px;font-weight:700;">ORDER DETAILS</p>
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td style="font-size:13.5px;color:#555;">Order Number</td>
                        <td align="right" style="font-size:13.5px;color:#38243F;font-weight:700;">#${orderData.order_number}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13.5px;color:#555;">Order Date</td>
                        <td align="right" style="font-size:13.5px;color:#38243F;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size:13.5px;color:#555;">Payment Mode</td>
                        <td align="right" style="font-size:13.5px;color:#38243F;font-weight:600;">Cash on Delivery (COD)</td>
                      </tr>
                    </table>

                    <div style="margin:14px 0 10px;border-top:1px dashed #d9c7b2;"></div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                    </table>

                    <div style="margin:12px 0 8px;border-top:1px solid #ebdccb;"></div>
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td style="font-size:15px;color:#38243F;font-weight:700;">Total Payable</td>
                        <td align="right" style="font-size:17px;color:#b78d52;font-weight:800;">₹${Number(orderData.total || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Destination -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border-radius:10px;border:1px solid #ebdccb;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#8a7a8d;letter-spacing:1px;font-weight:700;">📦 DELIVERY DESTINATION</p>
                    <p style="margin:0;font-size:13.5px;color:#444;line-height:1.7;">
                      <strong>${orderData.shipping_name}</strong><br/>
                      ${orderData.shipping_address_line1 || orderData.shipping_address || ''}${orderData.shipping_address_line2 ? ', ' + orderData.shipping_address_line2 : ''}<br/>
                      ${orderData.shipping_city}, ${orderData.shipping_state || 'India'} — ${orderData.shipping_pin_code}<br/>
                      📞 ${orderData.shipping_phone}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Support and Inquiries note -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0;border-top:1px solid #eee;">
                    <p style="font-size:12.5px;color:#7a6a7c;margin:8px 0 4px;">
                      For any inquiries or assistance, write directly to 
                      <a href="mailto:${STORE_EMAIL}" style="color:#b78d52;font-weight:600;text-decoration:none;">${STORE_EMAIL}</a>
                    </p>
                    <p style="font-size:12px;color:#999;margin:0;">
                      Or call our store desk: <strong>+91 83188 19334</strong> / <strong>+91 84481 70969</strong>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#38243F;padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#c5b5c5;font-size:11.5px;line-height:1.6;">
                © 2024 NAAVORI NUTS · K63/112, Nakkash, Bhoot Bhairav, Varanasi – 221001<br/>
                Official Store Contact: <a href="mailto:${STORE_EMAIL}" style="color:#D4AF37;text-decoration:none;">${STORE_EMAIL}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};

// ─── 2. New Order Alert to info@naavori.in ────────────────────────────────────
export const sendNewOrderAdminAlert = async (orderData) => {
  const orderDate = new Date(orderData.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const itemsHtml = Array.isArray(orderData.items) && orderData.items.length > 0
    ? orderData.items.map(item => `
        <li><strong>${item.name || item.title}</strong> (${item.variant_name || item.weight || 'Standard'}) × ${item.quantity} — ₹${Number((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</li>
      `).join('')
    : '<li>Order line items attached in database</li>';

  const mailOptions = {
    from: `"${STORE_NAME} Orders" <${STORE_EMAIL}>`,
    replyTo: orderData.guest_email || STORE_EMAIL,
    to: STORE_EMAIL,
    subject: `🔔 [NEW ORDER] #${orderData.order_number} by ${orderData.shipping_name} — ₹${Number(orderData.total || 0).toLocaleString('en-IN')}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#faf8f5;padding:24px;color:#222;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5dccb;">
    <div style="border-bottom:2px solid #D4AF37;padding-bottom:12px;margin-bottom:20px;">
      <h2 style="margin:0;color:#38243F;">🔔 New Store Order Received</h2>
      <p style="margin:4px 0 0;color:#777;font-size:13px;">Placed at: ${orderDate} IST</p>
    </div>

    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;margin-bottom:20px;">
      <tr><td style="color:#666;width:140px;"><strong>Order Number:</strong></td><td>#${orderData.order_number}</td></tr>
      <tr><td style="color:#666;"><strong>Grand Total:</strong></td><td style="color:#b78d52;font-size:16px;font-weight:700;">₹${Number(orderData.total || 0).toLocaleString('en-IN')} (COD)</td></tr>
      <tr><td style="color:#666;"><strong>Customer Name:</strong></td><td><strong>${orderData.shipping_name}</strong></td></tr>
      <tr><td style="color:#666;"><strong>Customer Phone:</strong></td><td><a href="tel:${orderData.shipping_phone}">${orderData.shipping_phone}</a></td></tr>
      <tr><td style="color:#666;"><strong>Customer Email:</strong></td><td><a href="mailto:${orderData.guest_email}">${orderData.guest_email || 'Not provided'}</a></td></tr>
      <tr>
        <td style="color:#666;vertical-align:top;"><strong>Shipping Address:</strong></td>
        <td>
          ${orderData.shipping_address_line1 || orderData.shipping_address || ''}${orderData.shipping_address_line2 ? ', ' + orderData.shipping_address_line2 : ''}<br/>
          ${orderData.shipping_city}, ${orderData.shipping_state || 'India'} — <strong>${orderData.shipping_pin_code}</strong>
        </td>
      </tr>
    </table>

    <div style="background:#f7f4ee;padding:16px;border-radius:8px;margin-bottom:20px;">
      <h4 style="margin:0 0 10px;color:#38243F;">Items to Pack:</h4>
      <ul style="margin:0;padding-left:20px;font-size:13.5px;line-height:1.7;">
        ${itemsHtml}
      </ul>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders" 
         style="background:#38243F;color:#D4AF37;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;font-size:13.5px;">
        Open Admin Order Board →
      </a>
    </div>
  </div>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};

// ─── 3. Customer Inquiry / Contact Note Alert to info@naavori.in ─────────────
export const sendInquiryAdminAlert = async ({ name, email, subject, message, order_id }) => {
  const mailOptions = {
    from: `"${STORE_NAME} Concierge Desk" <${STORE_EMAIL}>`,
    replyTo: email,
    to: STORE_EMAIL,
    subject: `📩 [STORE INQUIRY] from ${name}: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#faf8f5;padding:24px;color:#222;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5dccb;">
    <h3 style="margin:0 0 16px;color:#38243F;border-bottom:2px solid #D4AF37;padding-bottom:10px;">
      📩 New Website Inquiry / Contact Message
    </h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;margin-bottom:16px;">
      <tr><td style="color:#666;width:120px;"><strong>From:</strong></td><td><strong>${name}</strong></td></tr>
      <tr><td style="color:#666;"><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
      ${order_id ? `<tr><td style="color:#666;"><strong>Related Order:</strong></td><td>#${order_id}</td></tr>` : ''}
      <tr><td style="color:#666;"><strong>Subject:</strong></td><td><strong>${subject}</strong></td></tr>
    </table>
    <div style="background:#f9f7f3;border-left:4px solid #b78d52;padding:14px 18px;border-radius:4px;font-size:14px;line-height:1.6;color:#333;">
      ${(message || '').replace(/\n/g, '<br/>')}
    </div>
    <div style="margin-top:20px;font-size:12.5px;color:#777;">
      You can reply directly to this email to respond to <strong>${name}</strong> (${email}).
    </div>
  </div>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};

// ─── 4. Customer Inquiry Acknowledgment ─────────────────────────────────────
export const sendInquiryCustomerAcknowledgment = async ({ name, email, subject }) => {
  if (!email) return;

  const mailOptions = {
    from: `"${STORE_NAME} Concierge" <${STORE_EMAIL}>`,
    replyTo: STORE_EMAIL,
    to: email,
    subject: `We have received your message | Naavori Nuts Concierge`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f1eb;padding:32px 16px;color:#333;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
    <h2 style="margin:0 0 6px;color:#38243F;letter-spacing:2px;font-size:22px;">NAAVORI NUTS</h2>
    <p style="margin:0 0 20px;color:#b78d52;font-size:12px;letter-spacing:1px;font-weight:600;">HERITAGE CONCIERGE · VARANASI</p>

    <p style="font-size:14.5px;line-height:1.6;">Dear <strong>${name || 'Patron'}</strong>,</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Thank you for writing to NAAVORI. We have registered your message regarding <em>"${subject}"</em>.
      Our concierge team reviews every note with intention and will connect back with you within one business day.
    </p>

    <div style="background:#faf7f2;border:1px solid #ebdccb;padding:14px 18px;border-radius:8px;margin:20px 0;font-size:13px;color:#6a5a6c;">
      <strong>Need immediate assistance?</strong><br/>
      Reach store ownership directly at <a href="tel:+918318819334" style="color:#b78d52;font-weight:600;">+91 83188 19334</a> or write to <a href="mailto:${STORE_EMAIL}" style="color:#b78d52;font-weight:600;">${STORE_EMAIL}</a>.
    </div>

    <p style="font-size:12px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
      NAAVORI NUTS · K63/112, Nakkash, Varanasi – 221001 · <a href="mailto:${STORE_EMAIL}" style="color:#b78d52;">${STORE_EMAIL}</a>
    </p>
  </div>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};

// ─── 5. Order Shipped / Out for Delivery Email ──────────────────────────────
export const sendOrderShippedEmail = async (orderData, userEmail) => {
  if (!userEmail) return;

  const mailOptions = {
    from: `"${STORE_NAME} 🌿" <${STORE_EMAIL}>`,
    replyTo: STORE_EMAIL,
    to: userEmail,
    subject: `🚚 Your order #${orderData.order_number} is out for delivery! | Naavori Nuts`,
    html: `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:100%;">
          <tr>
            <td style="background:#38243F;padding:32px 36px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:26px;letter-spacing:4px;font-weight:400;">NAAVORI NUTS</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#27ae60;padding:16px 36px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:15px;font-weight:600;">🚚 Your order is on its way!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="font-size:15px;color:#333;">Dear <strong>${orderData.shipping_name || 'Valued Patron'}</strong>,</p>
              <p style="font-size:14px;color:#555;line-height:1.6;">
                Great news! Your order <strong>#${orderData.order_number}</strong> has been prepared and dispatched. 
                Our delivery partner will reach your destination soon.
              </p>
              <div style="background:#faf7f2;border:1px solid #ebdccb;padding:16px;border-radius:8px;margin:20px 0;">
                <p style="margin:0;font-size:13.5px;color:#444;">
                  <strong>Payment upon Delivery:</strong> ₹${Number(orderData.total || 0).toLocaleString('en-IN')} (Cash on Delivery)<br/>
                  <strong>Contact for inquiries:</strong> <a href="mailto:${STORE_EMAIL}" style="color:#b78d52;">${STORE_EMAIL}</a> / +91 83188 19334
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#38243F;padding:18px 36px;text-align:center;">
              <p style="margin:0;color:#c5b5c5;font-size:11.5px;">© 2024 NAAVORI NUTS · Varanasi · ${STORE_EMAIL}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};

// ─── 6. Support Ticket Reply Email to Customer ──────────────────────────────
export const sendTicketReplyCustomerEmail = async (ticket, replyMessage, customerEmail) => {
  if (!customerEmail) return;

  const mailOptions = {
    from: `"${STORE_NAME} Support" <${STORE_EMAIL}>`,
    replyTo: STORE_EMAIL,
    to: customerEmail,
    subject: `Re: ${ticket.subject} | Naavori Concierge`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#faf8f5;padding:24px;color:#222;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e5dccb;">
    <h3 style="margin:0 0 12px;color:#38243F;border-bottom:2px solid #D4AF37;padding-bottom:10px;">
      Naavori Concierge Response
    </h3>
    <p style="font-size:13.5px;color:#666;margin:0 0 16px;">
      Regarding your inquiry: <strong>"${ticket.subject}"</strong>
    </p>
    <div style="background:#fbf9f5;border-left:4px solid #D4AF37;padding:16px;border-radius:6px;font-size:14px;line-height:1.6;color:#333;margin-bottom:20px;">
      ${(replyMessage || '').replace(/\n/g, '<br/>')}
    </div>
    <p style="font-size:12.5px;color:#777;margin:0;">
      Have further questions? Reply directly to this email or reach us at <a href="mailto:${STORE_EMAIL}" style="color:#b78d52;">${STORE_EMAIL}</a>.
    </p>
  </div>
</body>
</html>
    `
  };

  return deliverMail(mailOptions);
};
