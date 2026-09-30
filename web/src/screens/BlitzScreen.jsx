import { useState } from 'react'
import { Zap, Users, MapPin, Volume2 } from 'lucide-react'

export default function BlitzScreen() {
  const [showDiscovery, setShowDiscovery] = useState(true)
  const [sessionActive, setSessionActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)

  const nearbyUsers = [
    {
      id: 1,
      name: 'Maria',
      avatar: '👩',
      language: 'Spanish',
      level: 'Intermediate',
      distance: 2.3,
      status: 'Looking to practice',
    },
    {
      id: 2,
      name: 'José',
      avatar: '👨',
      language: 'Spanish',
      level: 'Advanced',
      distance: 5.1,
      status: 'Available now',
    },
    {
      id: 3,
      name: 'Sofia',
      avatar: '👧',
      language: 'Spanish',
      level: 'Beginner',
      distance: 8.4,
      status: 'In session',
    },
  ]

  const startSession = (user) => {
    setShowDiscovery(false)
    setSessionActive(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Blitz Mode</h2>
      <p className="text-slate-400 mb-6">30-second language practice with real users nearby</p>

      {sessionActive ? (
        // Active Session
        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl font-bold text-white mb-2">{timeLeft}s</div>
            <p className="text-yellow-100">Speaking with Sofia...</p>
          </div>

          {/* Audio Visualization */}
          <div className="flex justify-center items-end gap-2 h-20 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-full opacity-70"
                style={{
                  width: '8px',
                  height: `${20 + i * 10}px`,
                  animation: 'pulse 0.5s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}
          </div>

          <div className="space-y-2 text-white mb-6">
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-sm text-yellow-100">You:</p>
              <p className="text-lg">"Hola, ¿cómo estás?"</p>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-sm text-yellow-100">Sofia:</p>
              <p className="text-lg">"¡Muy bien, gracias!"</p>
            </div>
          </div>

          <button
            onClick={() => setSessionActive(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            End Session
          </button>
        </div>
      ) : showDiscovery ? (
        // Discovery
        <div>
          {/* Filter */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <select className="bg-slate-700 text-white rounded-lg p-3 border border-slate-600">
              <option>All Languages</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
            <select className="bg-slate-700 text-white rounded-lg p-3 border border-slate-600">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {nearbyUsers.map((user) => (
              <div key={user.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{user.avatar}</span>
                      <div>
                        <h3 className="text-white font-bold">{user.name}</h3>
                        <p className="text-sm text-slate-400">{user.status}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                        {user.language}
                      </span>
                      <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                        {user.level}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin size={14} />
                        {user.distance} km away
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startSession(user)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-colors ml-4"
                  >
                    <Zap size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          <div className="mt-8 text-center py-8">
            <p className="text-slate-400 mb-4">No users available right now</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
              Notify Me When Ready
            </button>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
      `}</style>
    </div>
  )
}
