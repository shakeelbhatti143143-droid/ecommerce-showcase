import emailjs from "@emailjs/browser";

/**
 * Email Notification Service
 * ----------------------------
 * Prepares the project for Resend (Edge Function) or EmailJS integration.
 *
 * After every successful order we send:
 *   1. Order Confirmation email to the customer
 *   2. New Order Notification email to the admin
 *
 * Preference order:
 *   - If VITE_EMAILJS_* keys are present  -> use EmailJS (client side)
 *   - If VITE_RESEND_FUNCTION_URL present  -> use Resend Edge Function
 *   - Otherwise the email payload is logged and the call resolves silently
 *     so the checkout flow never breaks when email is not configured.
 */

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const RESEND_FUNCTION_URL = import.meta.env.VITE_RESEND_FUNCTION_URL;

export const ADMIN_EMAIL =
  import.meta.env.VITE_ADMIN_EMAIL || "shakeelbhatti143143@gmail.com";

export function isEmailConfigured() {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
}

function formatItems(items = []) {
  return (items || [])
    .map(
      (i) =>
        `• ${i.product_name} × ${i.quantity} — $${Number(i.total).toFixed(2)}`
    )
    .join("\n");
}

/**
 * Build a plain-text + HTML receipt for the customer.
 */
function buildCustomerEmail(order, items) {
  const lines = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee">${i.product_name}${
          i.size ? ` (${i.size}${i.color ? "/" + i.color : ""})` : ""
        }</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">$${Number(
          i.total
        ).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto;color:#111">
      <h2 style="margin-bottom:4px">Thank you for your order! 🎉</h2>
      <p>Hi ${order.customer_name}, your order has been received and is being processed.</p>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead><tr><th style="text-align:left">Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <p><strong>Subtotal:</strong> $${Number(order.subtotal).toFixed(2)}</p>
      <p><strong>Shipping:</strong> ${
        Number(order.shipping_cost) === 0
          ? "FREE"
          : "$" + Number(order.shipping_cost).toFixed(2)
      }</p>
      ${
        Number(order.discount) > 0
          ? `<p><strong>Discount:</strong> -$${Number(order.discount).toFixed(2)}</p>`
          : ""
      }
      <p style="font-size:16px"><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>
      <p><strong>Payment Method:</strong> ${
        order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method
      }</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0" />
      <p style="font-size:12px;color:#666">Shipping to: ${order.customer_name}, ${
    order.shipping_address?.address
  }, ${order.shipping_address?.city}, ${order.shipping_address?.country} ${
    order.shipping_address?.postal_code || ""
  }</p>
    </div>`;

  const text =
    `Thank you for your order, ${order.customer_name}!\n\n` +
    `Order Number: ${order.order_number}\n\n` +
    `Items:\n${formatItems(items)}\n\n` +
    `Subtotal: $${Number(order.subtotal).toFixed(2)}\n` +
    `Shipping: ${
      Number(order.shipping_cost) === 0
        ? "FREE"
        : "$" + Number(order.shipping_cost).toFixed(2)
    }\n` +
    (Number(order.discount) > 0
      ? `Discount: -$${Number(order.discount).toFixed(2)}\n`
      : "") +
    `Total: $${Number(order.total).toFixed(2)}\n` +
    `Payment Method: ${
      order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method
    }\n`;

  return { html, text };
}

/**
 * Send the customer order-confirmation email.
 */
export async function sendOrderConfirmation(order, items) {
  const { html, text } = buildCustomerEmail(order, items);

  const payload = {
    to_email: order.customer_email,
    to_name: order.customer_name,
    customer_name: order.customer_name,
    order_number: order.order_number,
    order_total: `$${Number(order.total).toFixed(2)}`,
    order_items: formatItems(items),
    message: text,
    subject: `Order Confirmation — ${order.order_number}`,
    html,
  };

  return sendEmail(payload, order.customer_email);
}

/**
 * Send the admin "new order" notification.
 */
export async function sendAdminOrderNotification(order, items) {
  const text =
    `New order placed!\n\n` +
    `Order Number: ${order.order_number}\n` +
    `Customer: ${order.customer_name} (${order.customer_email} / ${order.customer_phone})\n` +
    `Total: $${Number(order.total).toFixed(2)}\n\n` +
    `Items:\n${formatItems(items)}\n\n` +
    `Shipping Address: ${order.shipping_address?.address}, ${order.shipping_address?.city}, ${
      order.shipping_address?.country
    } ${order.shipping_address?.postal_code || ""}\n` +
    `Payment: ${
      order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method
    }`;

  const payload = {
    to_email: ADMIN_EMAIL,
    to_name: "Admin",
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    order_number: order.order_number,
    order_total: `$${Number(order.total).toFixed(2)}`,
    order_items: formatItems(items),
    message: text,
    subject: `🛒 New Order — ${order.order_number}`,
  };

  return sendEmail(payload, ADMIN_EMAIL);
}

/**
 * Low-level send that supports EmailJS and Resend (Edge Function).
 */
async function sendEmail(payload, toEmail) {
  // EmailJS (client-side)
  if (isEmailConfigured()) {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { ...payload, email: toEmail },
        EMAILJS_PUBLIC_KEY
      );
      return { ok: true, provider: "emailjs" };
    } catch (err) {
      console.error("EmailJS send failed:", err);
      return { ok: false, error: err?.message || "EmailJS failed" };
    }
  }

  // Resend via Edge Function
  if (RESEND_FUNCTION_URL) {
    try {
      const res = await fetch(RESEND_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, to: toEmail }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return { ok: true, provider: "resend" };
    } catch (err) {
      console.error("Resend send failed:", err);
      return { ok: false, error: err?.message || "Resend failed" };
    }
  }

  // Not configured — log for debugging, don't block checkout.
  console.info("[emailService] Email not configured. Payload:", payload);
  return { ok: true, provider: "none" };
}
