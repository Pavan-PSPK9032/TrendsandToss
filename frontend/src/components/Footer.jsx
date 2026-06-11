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
    { name: 'Products', path: '/products' },
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
    <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)' }}>
      <div style={{ height: '1px', background: 'var(--theme-primary)', opacity: 0.5 }} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <h3 className="font-heading text-2xl font-semibold tracking-widest" style={{ color: 'var(--footer-text)' }}>
              Trends&amp;Toss
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Premium jewellery curated for the modern lifestyle.
              Experience luxury at every price.
            </p>
            <div className="flex gap-3 pt-1">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 flex items-center justify-center transition-colors text-[10px] font-semibold uppercase tracking-wider"
                   style={{
                     border: '1px solid rgba(255,255,255,0.2)',
                     color: 'rgba(255,255,255,0.6)'
                   }}
                   onMouseEnter={e => { e.target.style.borderColor = 'var(--theme-primary)'; e.target.style.color = 'var(--theme-primary)' }}
                   onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  IG
                </a>
              )}
              {socialLinks.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 flex items-center justify-center transition-colors text-[10px] font-semibold uppercase tracking-wider"
                   style={{
                     border: '1px solid rgba(255,255,255,0.2)',
                     color: 'rgba(255,255,255,0.6)'
                   }}
                   onMouseEnter={e => { e.target.style.borderColor = 'var(--theme-primary)'; e.target.style.color = 'var(--theme-primary)' }}
                   onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgba(255,255,255,0.6)' }}
                >
                  WA
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--theme-primary)' }}>Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--theme-primary)' }}>Customer Service</h4>
            <ul className="space-y-3">
              {customerService.map(link => (
                <li key={link.name}>
                  <a href={link.path} className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'var(--theme-primary)' }}>Contact</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Phone</p>
                <a href={`tel:${contactInfo.phone}`} className="transition"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>WhatsApp</p>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="transition"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  Chat with us
                </a>
              </li>
              <li>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</p>
                <a href={`mailto:${contactInfo.email}`} className="transition"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--theme-primary)'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Address</p>
                <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{contactInfo.address}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>
              &copy; {currentYear} Trends&amp;Toss. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Secure Payments</span>
              <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.2)' }}></span>
              <span className="text-xs tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>UPI • Cards • Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
