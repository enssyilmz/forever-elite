export default function RefundPolicy() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Digital Products</h2>
            <p className="mb-4">For our digital fitness programs:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You have 14 days from the date of purchase to request a refund</li>
              <li>Refund requests must be submitted in writing to support@ozcanfit.com</li>
              <li>We may ask for feedback on why you're requesting a refund to help improve our services</li>
              <li>Refunds will be processed using the original payment method</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Refund Eligibility</h2>
            <p className="mb-4">Refunds may be granted in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Technical issues preventing access to the program</li>
              <li>Program content significantly different from description</li>
              <li>Medical condition preventing program completion (documentation required)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Non-Refundable Items</h2>
            <p className="mb-4">The following are not eligible for refund:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Programs accessed or downloaded more than 25%</li>
              <li>Customized or personalized training programs</li>
              <li>Programs purchased during special promotions or sales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Refund Process</h2>
            <p className="mb-4">Our refund process includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review of refund request within 2 business days</li>
              <li>Refund processing within 5-7 business days if approved</li>
              <li>Email confirmation of refund status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Contact Us</h2>
            <p>If you have questions about our refund policy or need to request a refund, please contact us at:</p>
            <p className="mt-2">
              Email: support@ozcanfit.com<br />
              Address: 123 Oxford Street, London W1D 2LG, United Kingdom<br />
              Phone: +44 20 1234 5678
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 