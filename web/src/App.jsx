import { useState } from 'react'
import { BookOpen, Mic2, Zap, Wallet, User, Home } from 'lucide-react'
import LearnScreen from './screens/LearnScreen'
import TranslateScreen from './screens/TranslateScreen'
import BlitzScreen from './screens/BlitzScreen'
import CryptoScreen from './screens/CryptoScreen'
import ProfileScreen from './screens/ProfileScreen'

export default function App() {
  const [activeTab, setActiveTab] = useState('translate')

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'translate', label: 'Translate', icon: Mic2 },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'blitz', label: 'Blitz', icon: Zap },
    { id: 'crypto', label: 'Crypto', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />
      case 'translate':
        return <TranslateScreen />
      case 'learn':
        return <LearnScreen />
      case 'blitz':
        return <BlitzScreen />
      case 'crypto':
        return <CryptoScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
        <h1 className="text-2xl font-bold">🚀 GrokAIr</h1>
        <p className="text-sm text-purple-100">Real-time Language Translation & Learning</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-slate-800 border-t border-slate-700 px-2 py-3">
        <div className="grid grid-cols-6 gap-2 max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function HomeScreen() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">1,240 XP</div>
          <p className="text-blue-100">Experience Points</p>
          <div className="w-full bg-blue-400 rounded-full h-2 mt-4">
            <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="text-4xl font-bold mb-2">12 Days 🔥</div>
          <p className="text-orange-100">Current Streak</p>
          <p className="text-sm text-orange-100 mt-2">Keep it up!</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          icon="🎤"
          title="Real-time Translation"
          description="Instant speech-to-speech translation powered by Grok AI"
        />
        <FeatureCard
          icon="📚"
          title="Learn Languages"
          description="Interactive lessons from beginner to advanced"
        />
        <FeatureCard
          icon="⚡"
          title="Blitz Mode"
          description="Quick 30-second practice sessions with real users"
        />
        <FeatureCard
          icon="💰"
          title="Crypto Rewards"
          description="Earn and spend with Ethereum, Polygon, and Solana"
        />
      </div>

      {/* Welcome Message */}
      <div className="bg-slate-700 rounded-xl p-6 mt-6 text-white">
        <h2 className="text-xl font-bold mb-2">Welcome back, Alex!</h2>
        <p className="text-slate-300">Ready to improve your language skills today?</p>
        <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors">
          Continue Learning
        </button>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-white font-bold">{title}</h3>
      <p className="text-slate-300 text-sm mt-1">{description}</p>
    </div>
  )
}
