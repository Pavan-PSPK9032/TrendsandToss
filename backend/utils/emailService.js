import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD // Your Gmail App Password (NOT regular password)
    }
  });
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Trends & Toss',
        address: process.env.EMAIL_USER
      },
      to: order.user.email,
      subject: `✅ Order Confirmed - #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Thank you for shopping with Trends & Toss</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            <p><strong>Payment Status:</strong> <span style="color: ${order.isPaid ? '#10b981' : '#ef4444'}; font-weight: bold;">${order.isPaid ? '✅ Paid' : '⏳ Pending'}</span></p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Items Ordered:</h3>
              ${order.items.map(item => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                  <p style="margin: 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity} × ₹${item.price}</p>
                </div>
              `).join('')}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Delivery Address:</h3>
              <p style="margin: 0; line-height: 1.6;">
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                Phone: ${order.shippingAddress.phone}
              </p>
            </div>
            
            <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Subtotal:</span>
                <span>₹${order.itemsPrice}</span>
              </div>
              ${order.shippingPrice > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Shipping:</span>
                  <span>₹${order.shippingPrice}</span>
                </div>
              ` : ''}
              ${order.discountPrice > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #10b981;">
                  <span>Discount:</span>
                  <span>-₹${order.discountPrice}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; border-top: 2px solid white; padding-top: 10px; margin-top: 10px;">
                <span>Total:</span>
                <span>₹${order.totalPrice}</span>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              You will receive a WhatsApp message with tracking updates.<br>
              For any queries, contact us at ${process.env.EMAIL_USER}
            </p>
          </div>
          
          <div style="background: #1f2937; color: white; text-align: center; padding: 20px; border-radius: 0 0 10px 10px;">
            <p style="margin: 0;">© 2026 Trends & Toss. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Trends & Toss',
        address: process.env.EMAIL_USER
      },
      to: user.email,
      subject: '🎉 Welcome to Trends & Toss!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome, ${user.name}! 🎊</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Thank you for joining Trends & Toss! We're excited to have you on board.</p>
            <p style="font-size: 16px; color: #333;">Start exploring our amazing collection and enjoy exclusive deals!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">🎁 Special Welcome Offer</h3>
              <p style="font-size: 24px; font-weight: bold; color: #667eea;">Use code: WELCOME10</p>
              <p style="color: #666;">Get 10% off on your first order!</p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return { success: false, error: error.message };
  }
};
