import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-responsive-lg md:text-responsive-xl mb-4 md:mb-6">Ozcan Fit</h3>
            <div className="space-y-3 md:space-y-4">
              <p className="flex items-start gap-2 md:gap-3 text-responsive-sm md:text-responsive-base">
                <MapPin className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0 mt-0.5" />
                <span>123 Oxford Street, London W1D 2LG, United Kingdom</span>
              </p>
              <p className="flex items-center gap-2 md:gap-3 text-responsive-sm md:text-responsive-base">
                <Phone className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" />
                +44 20 1234 5678
              </p>
              <p className="flex items-center gap-2 md:gap-3 text-responsive-sm md:text-responsive-base">
                <Mail className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" />
                contact@ozcanfit.com
              </p>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6 md:gap-0">
            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-responsive-sm md:text-responsive-lg mb-3 md:mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="hover:text-white transition text-responsive-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition text-responsive-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/marketing-policy" className="hover:text-white transition text-responsive-sm">
                    Marketing Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Social */}
            <div className="md:mt-6">
              <h3 className="text-white font-bold text-responsive-sm md:text-responsive-lg mb-3 md:mb-4">Support</h3>
              <ul className="space-y-2 mb-4 md:mb-4">
                <li>
                  <Link href="/support" className="hover:text-white transition text-responsive-sm">
                    Get Help
                  </Link>
                </li>
              </ul>
              
              <h3 className="text-white font-bold text-responsive-sm md:text-responsive-lg mb-3 md:mb-4">Follow Us</h3>
              <div className="flex gap-3 md:gap-4">
                <a
                  href="https://instagram.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Instagram className="w-5 h-5 md:w-6 md:h-6" />
                </a>
                <a
                  href="https://facebook.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Facebook className="w-5 h-5 md:w-6 md:h-6" />
                </a>
                <a
                  href="https://youtube.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Youtube className="w-5 h-5 md:w-6 md:h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-responsive-sm">&copy; {new Date().getFullYear()} Ozcan Fit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 