import { useState } from 'react'
import { Send, Mic2, Copy, RotateCcw } from 'lucide-react'
import { useAppStore } from '../store'

export default function TranslateScreen() {
  const { translation, addTranslationHistory } = useAppStore()
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  ]

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    // Simulate translation delay
    setTimeout(() => {
      const mockTranslations = {
        'hello': 'hola',
        'good morning': 'buenos días',
        'how are you': '¿cómo estás?',
        'thank you': 'gracias',
        'goodbye': 'adiós',
      }

      const translated = mockTranslations[sourceText.toLowerCase()] || sourceText + ' (translated)'
      setTranslatedText(translated)
      addTranslationHistory({
        source: sourceText,
        translated,
        from: 'en',
        to: 'es',
        timestamp: new Date(),
      })
      setIsTranslating(false)
    }, 500)
  }

  const handleSwapLanguages = () => {
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Real-time Translation</h2>

      {/* Language Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">From</label>
          <select className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-purple-500 focus:outline-none">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">To</label>
          <select defaultValue="es" className="w-full bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:border-purple-500 focus:outline-none">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Enter text to translate..."
          className="w-full bg-slate-600 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          <Mic2 size={20} />
          {isListening ? 'Listening...' : 'Voice Input'}
        </button>

        <button
          onClick={handleSwapLanguages}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-3 rounded-lg font-medium transition-colors"
        >
          ⇅ Swap
        </button>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
        >
          <Send size={20} />
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
      </div>

      {/* Output Area */}
      {translatedText && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold">Translation</h3>
            <button className="text-purple-200 hover:text-white transition-colors p-1">
              <Copy size={20} />
            </button>
          </div>
          <p className="text-white text-lg">{translatedText}</p>
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-white font-bold mb-3">Recent Translations</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer">
              <div className="text-slate-300 text-sm">Example translation {i}</div>
              <div className="text-white text-sm mt-1">Ejemplo de traducción {i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
