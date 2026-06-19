import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Send, Save, Download, Eye, Globe, Monitor, Tablet, Smartphone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { editorScript } from '../editorScript'

const previewBlockerScript = `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });

  document.addEventListener('submit', function(e) {
    e.preventDefault();
  });
</script>
`

function EditorPage() {
  const location = useLocation()
  const initialPrompt = location.state?.prompt || ''
  const savedCode = location.state?.code || ''
  const savedProjectId = location.state?.projectId || null
  
  const { token } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! Describe your website and I will generate it for you!'
    }
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [device, setDevice] = useState('desktop')
  const [isSaving, setIsSaving] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (savedCode) {
      setGeneratedCode(savedCode)
      setProjectId(savedProjectId)
      setMessages([
        {
          role: 'assistant',
          content: 'Welcome back! Here is your saved website.'
        }
      ])
    } else if (initialPrompt) {
      setInput(initialPrompt)
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'CONTENT_UPDATED') {
        setGeneratedCode(event.data.html)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const currentPrompt = input
    setInput('')
    setIsGenerating(true)

    try {
      const response = await axios.post('http://localhost:5000/api/generate', {
        prompt: currentPrompt
      })

      setGeneratedCode(response.data.code)

      const aiMessage = {
        role: 'assistant',
        content: 'I have created your website! You can now preview it and request any changes.'
      }
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error(error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, something went wrong while generating your website. Please try again!'
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleSave = async () => {
    if (!token) {
      navigate('/auth')
      return
    }

    if (!generatedCode) {
      alert('Please generate a website first!')
      return
    }

    setIsSaving(true)

    try {
      if (projectId) {
        await axios.put(
          `http://localhost:5000/api/projects/${projectId}`,
          { code: generatedCode, prompt: initialPrompt },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/projects',
          { title: initialPrompt.slice(0, 50), prompt: initialPrompt, code: generatedCode },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setProjectId(response.data._id)
      }

      alert('Project saved successfully!')

    } catch (error) {
      console.error(error)
      alert('Error saving project')
    }

    setIsSaving(false)
  }

  const handleDownload = () => {
    if (!generatedCode) {
      alert('Please generate a website first!')
      return
    }

    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'website.html'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handlePreview = () => {
    if (!generatedCode) {
      alert('Please generate a website first!')
      return
    }

    const blob = new Blob([generatedCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const handlePublish = async () => {
    if (!token) {
      navigate('/auth')
      return
    }

    if (!projectId) {
      alert('Please save your project first before publishing!')
      return
    }

    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Project published successfully! It will now show in Community.')

    } catch (error) {
      console.error(error)
      alert('Error publishing project')
    }
  }

  const handleDeviceChange = (newDevice) => {
    if (document.activeElement) {
      document.activeElement.blur()
    }
    setDevice(newDevice)
  }

  const getDeviceWidth = () => {
    if (device === 'mobile') return 'w-96'
    if (device === 'tablet') return 'w-[768px]'
    return 'w-full'
  }

  const getPreviewCode = () => {
    if (!generatedCode) return ''
    
    if (isEditMode) {
      const scriptWithTag = editorScript.replace('<script>', '<script data-editor-script="true">')
      return generatedCode.replace('</body>', scriptWithTag + '</body>')
    }
    
    return generatedCode.replace('</body>', previewBlockerScript + '</body>')
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">

      {/* TOP NAVBAR */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div>
            <p className="text-white text-sm font-medium">My Website</p>
            <p className="text-gray-500 text-xs">Previewing last saved version</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
              isEditMode ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {isEditMode ? 'Editing ON' : 'Edit Mode'}
          </button>

          <button
            onClick={() => handleDeviceChange('desktop')}
            className={`p-2 rounded-lg transition ${device === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeviceChange('tablet')}
            className={`p-2 rounded-lg transition ${device === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeviceChange('mobile')}
            className={`p-2 rounded-lg transition ${device === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-2 rounded-lg transition"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
          >
            <Globe className="w-4 h-4" />
            Publish
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR - Chat */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-2xl text-sm">
                  Generating your website...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
              <textarea
                className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500"
                placeholder="Describe your website or request changes..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE - Preview */}
        <div className="flex-1 bg-gray-950 flex items-center justify-center overflow-auto">
          {generatedCode ? (
            <div className={`${getDeviceWidth()} h-full transition-all duration-300`}>
              <iframe
                srcDoc={getPreviewCode()}
                className="w-full h-full border-0"
                title="preview"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg font-medium">No website generated yet</p>
              <p className="text-gray-600 text-sm mt-1">Describe your website in the chat to get started!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default EditorPage