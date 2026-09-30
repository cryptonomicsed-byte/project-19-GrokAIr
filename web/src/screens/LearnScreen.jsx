import { Play, Lock, CheckCircle } from 'lucide-react'

export default function LearnScreen() {
  const lessons = [
    {
      id: 1,
      title: 'Greetings & Introductions',
      language: 'Spanish',
      difficulty: 'Beginner',
      duration: 15,
      completed: true,
      xp: 100,
    },
    {
      id: 2,
      title: 'Numbers & Counting',
      language: 'Spanish',
      difficulty: 'Beginner',
      duration: 12,
      completed: true,
      xp: 100,
    },
    {
      id: 3,
      title: 'Common Phrases',
      language: 'Spanish',
      difficulty: 'Beginner',
      duration: 20,
      completed: false,
      xp: 150,
    },
    {
      id: 4,
      title: 'Restaurant Ordering',
      language: 'Spanish',
      difficulty: 'Intermediate',
      duration: 25,
      completed: false,
      xp: 200,
      locked: true,
    },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400'
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'Advanced':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Learn Spanish</h2>
      <p className="text-slate-400 mb-6">Master language skills with interactive lessons</p>

      {/* Progress */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">Progress</span>
          <span className="text-slate-400">2/4 lessons completed</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-3">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`bg-slate-700 rounded-lg p-4 transition-all ${
              lesson.locked
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-slate-600 cursor-pointer'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-bold">{lesson.title}</h3>
                  {lesson.completed && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                  {lesson.locked && (
                    <Lock size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex gap-3 flex-wrap mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                    {lesson.difficulty}
                  </span>
                  <span className="text-xs text-slate-400">⏱ {lesson.duration} min</span>
                  <span className="text-xs text-yellow-400">⭐ +{lesson.xp} XP</span>
                </div>
              </div>

              <button
                disabled={lesson.locked}
                className={`ml-4 p-2 rounded-lg transition-colors ${
                  lesson.locked
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : lesson.completed
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6">
        <h3 className="text-white font-bold mb-2">Next Recommended</h3>
        <p className="text-purple-100 mb-4">Continue with "Common Phrases" to unlock intermediate lessons</p>
        <button className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-bold transition-colors">
          Start Lesson
        </button>
      </div>
    </div>
  )
}
