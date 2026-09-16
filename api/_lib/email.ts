// api/_lib/email.ts
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const notificationTarget = process.env.NOTIFICATION_EMAIL || 'hariharantradersorders@gmail.com';

const resend = apiKey ? new Resend(apiKey) : null;

// Sender email (default onboarding domain from Resend until custom domain is verified)
const FROM_EMAIL = 'Hariharan Traders Rice <onboarding@resend.dev>';

export async function sendOrderConfirmationEmail(order: {
  id: string;
  items: Array<{
    product: { name: string };
    selectedWeight: { weight: string; price: number };
    quantity: number;
  }>;
  total: number;
  paymentMethod: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    name?: string;
  };
  estimatedDelivery?: string;
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured. Skipping email dispatch.');
    return null;
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${item.product.name} (${item.selectedWeight.weight})</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #d4a017; font-weight: bold; text-align: right;">₹${(item.selectedWeight.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  const customerName = order.address.name || 'Valued Customer';
  const fullAddress = [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.state,
    order.address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${order.id}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #0f1a0f; color: #ffffff; padding: 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1a2e1a; border-radius: 12px; padding: 30px; border: 1px solid #d4a017;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #d4a017; font-family: Georgia, serif; margin: 0 0 5px 0;">Hariharan Traders</h1>
          <p style="color: #a7f3d0; font-size: 14px; margin: 0;">RICE MILL • ஆரோக்கியமான வாழ்வு</p>
        </div>

        <div style="background-color: #0f1a0f; border-left: 4px solid #d4a017; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
          <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px;">🎉 Order Confirmed!</h2>
          <p style="color: #cbd5e1; margin: 0; font-size: 14px;">Order ID: <strong style="color: #d4a017;">${order.id}</strong></p>
        </div>

        <h3 style="color: #f1f5f9; border-bottom: 1px solid #2d4a2d; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <thead>
            <tr style="background-color: #0f1a0f;">
              <th style="padding: 10px; text-align: left; color: #d4a017;">Item</th>
              <th style="padding: 10px; text-align: center; color: #d4a017;">Qty</th>
              <th style="padding: 10px; text-align: right; color: #d4a017;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; background-color: #0f1a0f; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <span style="color: #cbd5e1; font-size: 16px;">Total Amount:</span>
          <span style="color: #d4a017; font-size: 20px; font-weight: bold;">₹${order.total.toLocaleString()}</span>
        </div>

        <h3 style="color: #f1f5f9; border-bottom: 1px solid #2d4a2d; padding-bottom: 8px;">Delivery Information</h3>
        <p style="color: #cbd5e1; font-size: 14px; margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>
        <p style="color: #cbd5e1; font-size: 14px; margin: 5px 0;"><strong>Address:</strong> ${fullAddress}</p>
        <p style="color: #cbd5e1; font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> ${order.address.phone || 'N/A'}</p>
        <p style="color: #cbd5e1; font-size: 14px; margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>

        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #2d4a2d; padding-top: 20px; color: #94a3b8; font-size: 12px;">
          <p>Hariharan Traders Rice Mill • Tamil Nadu, India</p>
          <p>Contact: +91 78109 90099 | hariharantradersorders@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = [notificationTarget];
  if (order.address.email && order.address.email.includes('@')) {
    recipients.push(order.address.email);
  }

  try {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `Order Confirmed #${order.id} - Hariharan Traders`,
      html: htmlContent,
    });
    return res;
  } catch (err) {
    console.error('Failed to dispatch order email via Resend:', err);
    return null;
  }
}

export async function sendContactFeedbackEmail(feedback: {
  name: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
}) {
  if (!resend) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #0f1a0f; color: #ffffff; padding: 25px;">
      <div style="max-width: 550px; margin: 0 auto; background: #1a2e1a; padding: 25px; border-radius: 12px; border: 1px solid #d4a017;">
        <h2 style="color: #d4a017; margin-top: 0;">📩 New Website Inquiry / Feedback</h2>
        <p><strong>Name:</strong> ${feedback.name}</p>
        <p><strong>Email:</strong> ${feedback.email}</p>
        <p><strong>Phone:</strong> ${feedback.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${feedback.subject || 'General Query'}</p>
        <div style="background: #0f1a0f; padding: 15px; border-radius: 8px; margin-top: 15px; color: #cbd5e1;">
          <strong style="color: #d4a017;">Message:</strong><br/>
          <p style="white-space: pre-wrap; margin-top: 8px;">${feedback.message}</p>
        </div>
      </div>
    </div>
  `;

  try {
    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [notificationTarget],
      subject: `New Inquiry: ${feedback.subject || 'Website Message'} from ${feedback.name}`,
      html,
    });
  } catch (err) {
    console.error('Failed to send contact feedback email:', err);
    return null;
  }
}

export async function sendWholesaleInquiryEmail(inquiry: {
  companyName?: string;
  contactName: string;
  phone: string;
  email: string;
  country?: string;
  products?: string[];
  quantityMT?: number;
  message?: string;
}) {
  if (!resend) return null;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #0f1a0f; color: #ffffff; padding: 25px;">
      <div style="max-width: 550px; margin: 0 auto; background: #1a2e1a; padding: 25px; border-radius: 12px; border: 1px solid #d4a017;">
        <h2 style="color: #d4a017; margin-top: 0;">🌾 New Wholesale / Bulk Order Inquiry</h2>
        <p><strong>Company:</strong> ${inquiry.companyName || 'N/A'}</p>
        <p><strong>Contact Name:</strong> ${inquiry.contactName}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Country:</strong> ${inquiry.country || 'India'}</p>
        <p><strong>Products Interested:</strong> ${inquiry.products?.join(', ') || 'Bulk Rice'}</p>
        <p><strong>Quantity (Metric Tons):</strong> ${inquiry.quantityMT || 'N/A'}</p>
        <div style="background: #0f1a0f; padding: 15px; border-radius: 8px; margin-top: 15px; color: #cbd5e1;">
          <strong style="color: #d4a017;">Additional Notes:</strong><br/>
          <p style="white-space: pre-wrap; margin-top: 8px;">${inquiry.message || 'No additional notes provided.'}</p>
        </div>
      </div>
    </div>
  `;

  try {
    return await resend.emails.send({
      from: FROM_EMAIL,
      to: [notificationTarget],
      subject: `🌾 Bulk Order Inquiry: ${inquiry.contactName} (${inquiry.companyName || 'Wholesale'})`,
      html,
    });
  } catch (err) {
    console.error('Failed to send wholesale inquiry email:', err);
    return null;
  }
}
