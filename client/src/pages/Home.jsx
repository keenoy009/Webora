import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Sparkles } from 'lucide-react'

function Home() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()

  const handleGenerate = () => {
    if (!prompt.trim()) return
    navigate('/editor', { state: { prompt } })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">

        

        <h1 className="text-6xl font-bold text-white leading-tight mb-4">
          Turn thoughts into
          <span className="text-blue-500"> websites </span>
          instantly.
        </h1>

        <p className="text-gray-400 text-lg mb-10 max-w-xl">
          Create, customize and publish websites faster than ever with our AI powered website builder.
        </p>

        <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <textarea
  className="w-full bg-transparent text-white placeholder-gray-500 outline-none resize-none text-sm h-28"
  placeholder="Describe your website in detail..."
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }}
/>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              Create with AI
            </button>
          </div>
        </div>

        <div className="flex items-center gap-10 mt-16 opacity-40">
          <span className="text-white font-semibold">Framer</span>
          <span className="text-white font-semibold">Shopify</span>
          <span className="text-white font-semibold">Microsoft</span>
          <span className="text-white font-semibold">Notion</span>
          <span className="text-white font-semibold">Walmart</span>
        </div>

      </div>
    </div>
  )
}

export default Home