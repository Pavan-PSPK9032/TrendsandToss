import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // 🔧 YOUR DETAILS - Already Updated
  const contactInfo = {
    phone: '+91 7396020978',
    whatsapp: '919032339653', // Numbers only for wa.me links
    email: 'tosstrend6@gmail.com',
    address: '8-28/2 Jayaram Nagar, Quthbullapur, Hyderabad - 500055'
  }

  const socialLinks = {
    instagram: 'https://www.instagram.com/trends___toss?igsh=MWJkcnptMnVzbnRpMw==',
    whatsapp: 'https://wa.me/919032339653' // Direct chat link
  }

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/' },
    { name: 'Cart', path: '/cart' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' }
  ]

  const customerService = [
    { name: 'Contact Us', path: '#' },
    { name: 'Shipping Info', path: '#' },
    { name: 'Returns', path: '#' },
    { name: 'FAQ', path: '#' },
    { name: 'Privacy Policy', path: '#' }
  ]

  return (
    <footer className="bg-slate-900 text-white mt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <h3 className="text-2xl font-light tracking-widest uppercase">Trends&Toss</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premium quality products curated for the modern lifestyle. 
              Experience luxury at affordable prices.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 pt-2">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-slate-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors text-xs font-medium">
                  Insta
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 bg-slate-800 hover:bg-amber-500 rounded-full flex items-center justify-center transition-colors text-xs font-medium">
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Customer Service</h4>
            <ul className="space-y-2">
              {customerService.map(link => (
                <li key={link.name}>
                  <a href={link.path} className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-amber-400">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-amber-400">📞</span>
                <div>
                  <p className="text-slate-400">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-white hover:text-amber-400 transition">
                    {contactInfo.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">💬</span>
                <div>
                  <p className="text-slate-400">WhatsApp</p>
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" 
                     className="text-white hover:text-amber-400 transition">
                    Chat on WhatsApp
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✉️</span>
                <div>
                  <p className="text-slate-400">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-white hover:text-amber-400 transition">
                    {contactInfo.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">📍</span>
                <p className="text-slate-400 leading-relaxed">{contactInfo.address}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              © {currentYear} Trends&Toss. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-sm">We Accept:</span>
              <div className="flex gap-2 text-xl">
                <span>💳</span>
                <span>🏦</span>
                <span>📱</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}