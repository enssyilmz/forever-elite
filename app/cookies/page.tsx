export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. What Are Cookies</h2>
            <p>Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us make your experience better by remembering your preferences and how you use our site.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. How We Use Cookies</h2>
            <p className="mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To keep you signed in to your account</li>
              <li>To remember your preferences and settings</li>
              <li>To understand how you use our website</li>
              <li>To improve our services and website performance</li>
              <li>To provide personalized content and recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Essential Cookies</h3>
                <p>Required for the website to function properly. You can't disable these.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Performance Cookies</h3>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Functionality Cookies</h3>
                <p>Remember your preferences and settings.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Marketing Cookies</h3>
                <p>Used to deliver relevant advertisements and track their effectiveness.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Managing Cookies</h2>
            <p className="mb-4">You can control cookies through your browser settings:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chrome: Settings → Privacy and Security → Cookies</li>
              <li>Firefox: Options → Privacy & Security → Cookies</li>
              <li>Safari: Preferences → Privacy → Cookies</li>
              <li>Edge: Settings → Privacy & Security → Cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Third-Party Cookies</h2>
            <p>Some cookies are placed by third-party services that appear on our pages. We use these services to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyze site traffic (Google Analytics)</li>
              <li>Process payments (Stripe)</li>
              <li>Provide social media features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Contact Us</h2>
            <p>If you have questions about our cookie policy, please contact us at:</p>
            <p className="mt-2">
              Email: privacy@ozcanfit.com<br />
              Address: 123 Oxford Street, London W1D 2LG, United Kingdom<br />
              Phone: +44 20 1234 5678
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 