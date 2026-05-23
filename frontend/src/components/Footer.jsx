import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const contactInfo = {
    phone: '+91 7396020978',
    whatsapp: '919032339653',
    email: 'tosstrend6@gmail.com',
    address: '8-28/2 Jayaram Nagar, Quthbullapur, Hyderabad - 500055'
  }

  const socialLinks = {
    instagram: 'https://www.instagram.com/trends___toss?igsh=MWJkcnptMnVzbnRpMw==',
    whatsapp: 'https://wa.me/919032339653'
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
    <footer className="bg-navy text-white mt-20">
      {/* Gold top accent line */}
      <div className="h-px bg-gold w-full"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand & About */}
          <div className="space-y-5">
            <h3 className="font-playfair text-2xl font-semibold tracking-widest text-white">Trends&amp;Toss</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Premium jewellery curated for the modern lifestyle.
              Experience luxury at every price.
            </p>
            <div className="flex gap-3 pt-1">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 border border-white/20 hover:border-gold hover:text-gold flex items-center justify-center transition-colors text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  IG
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 border border-white/20 hover:border-gold hover:text-gold flex items-center justify-center transition-colors text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  WA
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/50 hover:text-gold transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-gold">Customer Service</h4>
            <ul className="space-y-3">
              {customerService.map(link => (
                <li key={link.name}>
                  <a href={link.path} className="text-white/50 hover:text-gold transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-gold">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Phone</p>
                <a href={`tel:${contactInfo.phone}`} className="text-white/80 hover:text-gold transition">
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">WhatsApp</p>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="text-white/80 hover:text-gold transition">
                  Chat with us
                </a>
              </li>
              <li>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${contactInfo.email}`} className="text-white/80 hover:text-gold transition">
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Address</p>
                <p className="text-white/60 leading-relaxed">{contactInfo.address}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/30 text-xs tracking-wider">
              &copy; {currentYear} Trends&amp;Toss. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs tracking-wider">Secure Payments</span>
              <span className="w-px h-3 bg-white/20"></span>
              <span className="text-white/30 text-xs tracking-wider">UPI &bull; Cards &bull; Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
