'use client'

interface Purchase {
  id: string
  user_email: string
  user_name: string | null
  package_name: string
  amount: number
  currency: string
  status: string
  created_at: string
  stripe_session_id: string
}

export default function PurchasesTab({ purchases }: { purchases: Purchase[] }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-responsive-sm text-gray-600">Total Purchases: <span className="font-semibold">{purchases.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-responsive-sm text-left text-gray-600">
          <thead className="text-responsive-sm text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">User Email</th>
              <th className="px-6 py-3">User Name</th>
              <th className="px-6 py-3">Package</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Currency</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created At</th>
              <th className="px-6 py-3">Stripe Session ID</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No purchases found</td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{purchase.user_email}</td>
                  <td className="px-6 py-4">{purchase.user_name || 'N/A'}</td>
                  <td className="px-6 py-4">{purchase.package_name}</td>
                  <td className="px-6 py-4">{purchase.amount}</td>
                  <td className="px-6 py-4">{purchase.currency}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      purchase.status === 'succeeded' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(purchase.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{purchase.stripe_session_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


