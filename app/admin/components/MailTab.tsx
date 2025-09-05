'use client'

export default function MailTab({ logs }: { logs: Array<{ id: string, subject: string, body: string, recipients: string[], sent_count: number, created_at: string }> }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <p className="text-responsive-sm text-gray-600">Total Sent: <span className="font-semibold">{logs.length}</span></p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-responsive-sm text-left text-gray-600">
          <thead className="text-responsive-sm text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Body</th>
              <th className="px-6 py-3">Recipients</th>
              <th className="px-6 py-3">Count</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No emails sent yet</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{log.subject}</td>
                  <td className="px-6 py-4 max-w-xl truncate" title={log.body}>{log.body}</td>
                  <td className="px-6 py-4 max-w-md">
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-auto">
                      {(log.recipients || []).slice(0, 50).map((e) => (
                        <span key={e} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">{e}</span>
                      ))}
                      {log.recipients && log.recipients.length > 50 && (
                        <span className="text-xs text-gray-500">+{log.recipients.length - 50} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{log.sent_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


