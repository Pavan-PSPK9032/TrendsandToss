import firebaseAdmin from '../config/firebase.js';
import User from '../models/User.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { sendWhatsAppTextMessage } from '../utils/whatsappService.js';

export const firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify Firebase ID token
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, firebase: firebaseData } = decoded;

    // Determine provider
    const provider = firebaseData?.sign_in_provider === 'google.com' ? 'google' : 'email';

    // Find existing user or create new one
    let user = await User.findOne({ firebaseUid: uid });
    let isNewUser = false;

    if (!user) {
      // Also check by email (user may have been created with different provider)
      user = await User.findOne({ email });
      
      if (user) {
        // Link Firebase UID to existing user
        user.firebaseUid = uid;
        if (!user.provider) user.provider = provider;
        await user.save();
      } else {
        // Create new user
        isNewUser = true;
        user = await User.create({
          firebaseUid: uid,
          name: name || email?.split('@')[0] || 'User',
          email,
          photo: picture || '',
          provider,
        });
      }
    }

    // Send welcome email for new users
    if (isNewUser) {
      console.log('📧 Sending welcome email to new user:', user.email);
      sendWelcomeEmail(user).then(result => {
        if (result.success) {
          console.log('✅ Welcome email sent successfully');
        } else {
          console.error('❌ Welcome email failed:', result.error);
        }
      }).catch((err) =>
        console.error('❌ Welcome email error:', err)
      );

      // Send WhatsApp welcome message if phone number exists
      if (user.phone) {
        console.log('📱 Sending WhatsApp welcome to:', user.phone);
        const welcomeMessage = `Welcome to Trends & Toss, ${user.name}! 🎉\n\nThank you for joining us. Start exploring our amazing collection and enjoy exclusive deals!\n\n🎁 Special Welcome Offer:\nUse code: WELCOME10 for 10% off your first order!\n\nHappy Shopping! 🛍️`;
        
        sendWhatsAppTextMessage(user.phone, welcomeMessage).then(result => {
          if (result.success) {
            console.log('✅ Welcome WhatsApp sent successfully');
          } else {
            console.error('❌ Welcome WhatsApp failed:', result.error);
          }
        }).catch(err => console.error('❌ WhatsApp error:', err));
      }
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        photo: user.photo,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (err) {
    console.error('Firebase login error:', err);
    res.status(500).json({ error: err.message });
  }
};
