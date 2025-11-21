'use client'

interface CommunicationPreferencesProps {
  message: string
  communicationPrefs: {
    phone: boolean
    email: boolean
    sms: boolean
  }
  isSavingPrefs: boolean
  onPrefsChange: (prefs: { phone: boolean; email: boolean; sms: boolean }) => void
  onSavePreferences: () => void
}

export default function CommunicationPreferences({
  message,
  communicationPrefs,
  isSavingPrefs,
  onPrefsChange,
  onSavePreferences
}: CommunicationPreferencesProps) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md text-black">
      <h3 className="border-b text-responsive-lg font-bold pb-4 md:pb-6">Communication Preferences</h3>
      
      {message && !message.includes('successfully') && (
        <div className={`mb-4 p-3 rounded bg-red-100 text-red-700`}>
          {message}
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        <div className="border-b pb-3 md:pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="pt-4 md:pt-6 font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">Phone Notifications</h4>
              <p className="text-responsive-sm text-gray-600">Receive calls and voice messages on your phone number</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPrefs.phone}
                onChange={(e) => onPrefsChange({...communicationPrefs, phone: e.target.checked})}
                className="w-4 h-4 md:w-5 md:h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
        
        <div className="border-b pb-3 md:pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">Email Notifications</h4>
              <p className="text-responsive-sm text-gray-600">Receive updates and notifications via email</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPrefs.email}
                onChange={(e) => onPrefsChange({...communicationPrefs, email: e.target.checked})}
                className="w-4 h-4 md:w-5 md:h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
        
        <div className="border-b pb-3 md:pb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800 text-responsive-sm md:text-responsive-base">SMS Notifications</h4>
              <p className="text-responsive-sm text-gray-600">Receive text messages on your mobile phone</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPrefs.sms}
                onChange={(e) => onPrefsChange({...communicationPrefs, sms: e.target.checked})}
                className="w-4 h-4 md:w-5 md:h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6 md:mt-8">
          <button
            onClick={() => onPrefsChange({phone: false, email: false, sms: false})}
            className="btn-secondary-sm"
            disabled={isSavingPrefs}
          >
            Reset
          </button>
          <button
            className="btn-primary-sm"
            onClick={onSavePreferences}
            disabled={isSavingPrefs}
          >
            {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
