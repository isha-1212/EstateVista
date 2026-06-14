import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-walnut-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teak-500 to-walnut-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cream-50" />
              </div>
              <span className="text-xl font-serif font-semibold text-cream-50">
                Estate<span className="text-teak-400">Vista</span>
              </span>
            </Link>
            <p className="text-walnut-300 text-sm leading-relaxed">
              Discover premium India properties with timeless elegance. From heritage villas to modern apartments,
              find your dream home in God's Own Country.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-walnut-800 flex items-center justify-center hover:bg-teak-600 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-walnut-800 flex items-center justify-center hover:bg-teak-600 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-walnut-800 flex items-center justify-center hover:bg-teak-600 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-walnut-800 flex items-center justify-center hover:bg-teak-600 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cream-50 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Buy Property', path: '/properties?listingType=sale' },
                { label: 'Rent Property', path: '/properties?listingType=rent' },
                { label: 'Villas', path: '/properties?propertyType=villa' },
                { label: 'Apartments', path: '/properties?propertyType=apartment' },
                { label: 'Commercial', path: '/properties?propertyType=commercial' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-walnut-300 hover:text-teak-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cream-50 mb-6">Company</h3>
            <ul className="space-y-3">
              {[
                { label: 'About Us', path: '/#about' },
                { label: 'Our Team', path: '/#about' },
                { label: 'Careers', path: '#' },
                { label: 'Privacy Policy', path: '#' },
                { label: 'Terms of Service', path: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-walnut-300 hover:text-teak-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-cream-50 mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teak-400 mt-0.5 flex-shrink-0" />
                <span className="text-walnut-300 text-sm">
                  G Tower, MG Road,<br />
                  Mumbai, India 682016
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-teak-400 flex-shrink-0" />
                <span className="text-walnut-300 text-sm">+91 484 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-teak-400 flex-shrink-0" />
                <span className="text-walnut-300 text-sm">info@estatevista.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-walnut-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-walnut-400 text-sm">
            &copy; {currentYear} EstateVista. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-walnut-400">
            <Link to="#" className="hover:text-teak-400 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-teak-400 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-teak-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
