import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
        {/* Mobile Layout - More Compact */}
        <div className="block md:hidden">
          {/* Company Info - Compact */}
          <div className="mb-4">
            <h3 className="text-white font-bold text-base mb-2">Forever Elite</h3>
            <div className="space-y-1 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>79 Old Church Road E1 0QB, United Kingdom</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3 flex-shrink-0" />
                +44 7718 624609
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3 h-3 flex-shrink-0" />
                runner4ever1@gmail.com
              </p>
            </div>
          </div>

          {/* Three Columns for Mobile */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Legal</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/policies/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/policies/marketing-policy" className="hover:text-white transition">
                    Marketing Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Support</h4>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/dashboard?section=support" className="hover:text-white transition">
                    Get Help
                  </Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">Follow Us</h4>
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/_ozcansonmez/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/stresozcan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/@JohnisHeree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Keep Original */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-responsive-xl mb-6">Forever Elite</h3>
            <div className="space-y-4">
              <p className="flex items-start gap-3 text-responsive-base">
                <MapPin className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <span>79 Old Church Road E1 0QB, United Kingdom</span>
              </p>
              <p className="flex items-center gap-3 text-responsive-base">
                <Phone className="w-6 h-6 flex-shrink-0" />
                +44 7718 624609
              </p>
              <p className="flex items-center gap-3 text-responsive-base">
                <Mail className="w-6 h-6 flex-shrink-0" />
                runner4ever1@gmail.com
              </p>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="grid grid-cols-1 gap-0">
            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-responsive-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/policies/privacy" className="hover:text-white transition text-responsive-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="hover:text-white transition text-responsive-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/policies/marketing-policy" className="hover:text-white transition text-responsive-sm">
                    Marketing Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Social */}
            <div className="mt-6">
              <h3 className="text-white font-bold text-responsive-lg mb-4">Support</h3>
              <ul className="space-y-2 mb-4">
                <li>
                  <Link href="/dashboard?section=support" className="hover:text-white transition text-responsive-sm">
                    Get Help
                  </Link>
                </li>
              </ul>
              
              <h3 className="text-white font-bold text-responsive-lg mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/_ozcansonmez/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/stresozcan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://www.youtube.com/@JohnisHeree"
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

        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-responsive-sm">&copy; {new Date().getFullYear()} Forever Elite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 