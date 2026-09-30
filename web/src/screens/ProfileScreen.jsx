import { useState } from 'react'
import { Settings, LogOut, Bell, Lock, Globe } from 'lucide-react'
import { useAppStore } from '../store'

export default function ProfileScreen() {
  const { user } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 mb-6 text-center text-white">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
        <p className="text-purple-100 mb-4">{user.email}</p>
        <div className="flex justify-center gap-6">
          <div>
            <div className="text-3xl font-bold">{user.xp}</div>
            <p className="text-sm text-purple-200">Experience Points</p>
          </div>
          <div>
            <div className="text-3xl font-bold">{user.streak}</div>
            <p className="text-sm text-purple-200">Day Streak 🔥</p>
          </div>
          <div>
            <div className="text-xl font-bold capitalize">{user.tier}</div>
            <p className="text-sm text-purple-200">Subscription</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Lessons Completed" value="24" />
        <StatCard label="Total Translations" value="847" />
        <StatCard label="Languages Learning" value="3" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Learning Settings */}
        <SettingsSection
          icon={<Globe size={20} />}
          title="Learning Preferences"
          items={[
            { label: 'Native Language', value: 'English' },
            { label: 'Learning Language', value: 'Spanish' },
            { label: 'Preferred Difficulty', value: 'Intermediate' },
          ]}
        />

        {/* Sound & Voice */}
        <SettingsSection
          icon={<Settings size={20} />}
          title="Sound & Voice"
          items={[
            { label: 'Voice Provider', value: 'Grok AI' },
            { label: 'Voice Gender', value: 'Female' },
            { label: 'Notification Sounds', value: 'On', toggle: true },
          ]}
        />

        {/* Notifications */}
        <SettingsSection
          icon={<Bell size={20} />}
          title="Notifications"
          items={[
            { label: 'Daily Reminders', value: 'On', toggle: true },
            { label: 'Streak Alerts', value: 'On', toggle: true },
            { label: 'Friend Requests', value: 'On', toggle: true },
          ]}
        />

        {/* Privacy & Security */}
        <SettingsSection
          icon={<Lock size={20} />}
          title="Privacy & Security"
          items={[
            { label: 'Profile Visibility', value: 'Public' },
            { label: 'Allow Blitz Invites', value: 'On', toggle: true },
            { label: 'Data Collection', value: 'Minimal' },
          ]}
        />
      </div>

      {/* Account Actions */}
      <div className="mt-8 space-y-3">
        <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
          <Settings size={20} />
          Account Settings
        </button>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-slate-400 text-sm">
        <p>GrokAIr Version 1.0.0</p>
        <p className="mt-2 space-x-4">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-white">Contact Support</a>
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-700 rounded-lg p-4">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function SettingsSection({ icon, title, items }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-600 transition-colors"
      >
        <div className="flex items-center gap-3 text-white font-bold">
          {icon}
          {title}
        </div>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-600 px-4 py-3 space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-slate-300">{item.label}</span>
              {item.toggle ? (
                <button className="bg-purple-600 hover:bg-purple-700 w-10 h-6 rounded-full transition-colors" />
              ) : (
                <span className="text-slate-400 text-sm">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
