import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── Beautiful HTML Order Confirmation ───────────────────────────────────────
export const sendOrderConfirmationEmail = async (orderData, userEmail) => {
  try {
    const orderDate = new Date(orderData.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const mailOptions = {
      from: `"Naavori Nuts 🌿" <${process.env.EMAIL_USER}>`,
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
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#38243F;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:28px;letter-spacing:4px;font-weight:300;">NAAVORI NUTS</h1>
              <p style="margin:8px 0 0;color:#c5b5c5;font-size:13px;letter-spacing:2px;">PURE ORIGINS · REAL GOODNESS</p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#D4AF37;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#38243F;font-size:16px;font-weight:600;">✅ Your order has been confirmed!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              
              <p style="font-size:16px;color:#333;margin:0 0 8px;">Dear <strong>${orderData.shipping_name || 'Valued Customer'}</strong>,</p>
              <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 32px;">
                Thank you for your order! We've received your purchase and our team is already preparing it with care. 
                You'll receive a shipping update soon.
              </p>

              <!-- Order Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f0;border-radius:8px;border:1px solid #e8ddd0;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 16px;font-size:13px;color:#888;letter-spacing:1px;font-weight:600;">ORDER DETAILS</p>
                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="font-size:14px;color:#555;">Order Number</td>
                        <td align="right" style="font-size:14px;color:#38243F;font-weight:700;">#${orderData.order_number}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#555;">Order Date</td>
                        <td align="right" style="font-size:14px;color:#38243F;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#555;">Payment Method</td>
                        <td align="right" style="font-size:14px;color:#38243F;">${(orderData.payment_method || 'Online').toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="font-size:14px;color:#555;">Payment Status</td>
                        <td align="right" style="font-size:14px;color:#27ae60;font-weight:600;">✅ Paid</td>
                      </tr>
                      <tr style="border-top:1px solid #e8ddd0;">
                        <td style="font-size:16px;color:#38243F;font-weight:700;padding-top:12px;">Total Amount</td>
                        <td align="right" style="font-size:18px;color:#D4AF37;font-weight:800;padding-top:12px;">₹${Number(orderData.total).toLocaleString('en-IN')}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f0;border-radius:8px;border:1px solid #e8ddd0;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:13px;color:#888;letter-spacing:1px;font-weight:600;">📦 SHIPPING ADDRESS</p>
                    <p style="margin:0;font-size:14px;color:#444;line-height:1.8;">
                      <strong>${orderData.shipping_name}</strong><br/>
                      ${orderData.shipping_address_line1 || ''}${orderData.shipping_address_line2 ? ', ' + orderData.shipping_address_line2 : ''}<br/>
                      ${orderData.shipping_city}, ${orderData.shipping_state} — ${orderData.shipping_pin_code}<br/>
                      📞 ${orderData.shipping_phone}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/account" 
                       style="display:inline-block;padding:14px 36px;background:#38243F;color:#D4AF37;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:1px;">
                      TRACK YOUR ORDER →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:0;border-top:1px solid #eee;margin:32px 0;"/>

              <!-- Promise -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px;">
                    <p style="font-size:13px;color:#888;margin:0;">🌿 Hand-selected · 100% Natural · No Preservatives</p>
                    <p style="font-size:13px;color:#aaa;margin:8px 0 0;">
                      Questions? Write to us at 
                      <a href="mailto:concierge@naavorinuts.com" style="color:#D4AF37;text-decoration:none;">concierge@naavorinuts.com</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#38243F;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#c5b5c5;font-size:12px;">
                © 2024 Naavori Nuts · K63/112, Nakkash, Varanasi – 221001<br/>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="color:#D4AF37;text-decoration:none;">www.naavorinuts.com</a>
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', userEmail, '| MessageId:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return false;
  }
};

// ─── Order Shipped Email ────────────────────────────────────────────────────
export const sendOrderShippedEmail = async (orderData, userEmail) => {
  try {
    const mailOptions = {
      from: `"Naavori Nuts 🌿" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🚚 Your order #${orderData.order_number} is on the way! | Naavori Nuts`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#38243F;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#D4AF37;font-size:28px;letter-spacing:4px;font-weight:300;">NAAVORI NUTS</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#27ae60;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#fff;font-size:16px;font-weight:600;">🚚 Your order is out for delivery!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333;">Dear <strong>${orderData.shipping_name || 'Valued Customer'}</strong>,</p>
              <p style="font-size:14px;color:#666;line-height:1.6;">
                Great news! Your order <strong>#${orderData.order_number}</strong> has been shipped and is on its way to you in Varanasi. 
                Our delivery team will reach you soon!
              </p>
              <p style="font-size:14px;color:#888;margin-top:32px;">
                Expected delivery: <strong>Within 24 hours</strong> 🕐
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#38243F;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#c5b5c5;font-size:12px;">© 2024 Naavori Nuts · Varanasi</p>
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

    await transporter.sendMail(mailOptions);
    console.log('✅ Shipping email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending shipping email:', error.message);
    return false;
  }
};
