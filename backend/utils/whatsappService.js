import dotenv from 'dotenv';

dotenv.config();

// WhatsApp Business Cloud API integration
export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Format phone number (remove spaces, add country code if not present)
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // Add India country code
    }

    // WhatsApp Business Cloud API endpoint
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'template',
        template: {
          name: 'order_confirmation',
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: message.parameters
            }
          ]
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ WhatsApp API Error:', data.error);
      return { success: false, error: data.error.message };
    }

    console.log('✅ WhatsApp message sent:', data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('❌ WhatsApp sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation via WhatsApp
export const sendOrderConfirmationWhatsApp = async (order) => {
  try {
    const phone = order.shippingAddress.phone || order.user.phone;
    
    if (!phone) {
      console.warn('⚠️ No phone number found for order:', order._id);
      return { success: false, error: 'No phone number available' };
    }

    const itemsList = order.items
      .map(item => `• ${item.name} (x${item.quantity})`)
      .join('\n');

    const message = {
      parameters: [
        { type: 'text', text: order.user.name },
        { type: 'text', text: order._id.toString().slice(-6) }, // Last 6 chars of order ID
        { type: 'text', text: `₹${order.totalPrice}` },
        { type: 'text', text: new Date(order.createdAt).toLocaleDateString('en-IN') }
      ]
    };

    return await sendWhatsAppMessage(phone, message);
  } catch (error) {
    console.error('❌ Order WhatsApp notification failed:', error);
    return { success: false, error: error.message };
  }
};

// Simple text message (fallback if templates not set up)
export const sendWhatsAppTextMessage = async (phoneNumber, text) => {
  try {
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: 'text',
        text: {
          body: text
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ WhatsApp Text API Error:', data.error);
      return { success: false, error: data.error.message };
    }

    console.log('✅ WhatsApp text sent:', data.messages?.[0]?.id);
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    console.error('❌ WhatsApp text sending failed:', error);
    return { success: false, error: error.message };
  }
};
