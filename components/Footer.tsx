import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-white font-bold text-responsive-xl mb-6">Ozcan Fit</h3>
            <div className="space-y-4">
              <p className="flex items-center gap-3 text-responsive-base">
                <MapPin className="w-6 h-6 flex-shrink-0" />
                123 Oxford Street, London W1D 2LG, United Kingdom
              </p>
              <p className="flex items-center gap-3 text-responsive-base">
                <Phone className="w-6 h-6 flex-shrink-0" />
                +44 20 1234 5678
              </p>
              <p className="flex items-center gap-3 text-responsive-base">
                <Mail className="w-6 h-6 flex-shrink-0" />
                contact@ozcanfit.com
              </p>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-responsive-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="text-white font-bold text-responsive-lg mb-4">Support</h3>
              <ul className="space-y-2 mb-4">
                <li>
                  <Link href="/support" className="hover:text-white transition">
                    Get Help
                  </Link>
                </li>
              </ul>
              
              <h3 className="text-white font-bold text-responsive-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://facebook.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://youtube.com/ozcanfit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Ozcan Fit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 