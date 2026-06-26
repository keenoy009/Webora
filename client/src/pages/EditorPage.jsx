import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Send, Save, Download, Eye, Globe, Monitor, Tablet, Smartphone, Code, X, Undo2, Redo2, ImagePlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { editorScript } from '../editorScript'

const previewBlockerScript = `
<script>
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.length > 1 && href.startsWith('#')) {
        try {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (err) {
          console.log('Invalid selector:', href);
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
  
  const { token, refreshUser } = useAuth()
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
  const [showCode, setShowCode] = useState(false)
  const [websiteTitle, setWebsiteTitle] = useState('My Website')
  const [websiteDescription, setWebsiteDescription] = useState('A custom website')
  const [uploadedImages, setUploadedImages] = useState([])
  const [draftLoaded, setDraftLoaded] = useState(false)

  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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
      setHistory([savedCode])
      setHistoryIndex(0)
      setDraftLoaded(true)
    } else if (initialPrompt) {
      setInput(initialPrompt)
      setDraftLoaded(true)
    } else {
      const cached = localStorage.getItem('webora_draft')
      if (cached) {
        try {
          const draft = JSON.parse(cached)
          setGeneratedCode(draft.code || '')
          setMessages(draft.messages || [{ role: 'assistant', content: 'Hi! Describe your website and I will generate it for you!' }])
          setWebsiteTitle(draft.title || 'My Website')
          setWebsiteDescription(draft.description || 'A custom website')
          setProjectId(draft.projectId || null)
          setHistory(draft.code ? [draft.code] : [])
          setHistoryIndex(draft.code ? 0 : -1)
        } catch (err) {
          console.log('No valid draft found')
        }
      }
      setDraftLoaded(true)
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'CONTENT_UPDATED') {
        pushToHistory(event.data.html)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [history, historyIndex])

  useEffect(() => {
    if (draftLoaded && generatedCode) {
      localStorage.setItem('webora_draft', JSON.stringify({
        code: generatedCode,
        messages,
        title: websiteTitle,
        description: websiteDescription,
        projectId
      }))
    }
  }, [generatedCode, messages, websiteTitle, websiteDescription, projectId, draftLoaded])

  const pushToHistory = (newCode) => {
    setGeneratedCode(newCode)
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, newCode]
    })
    setHistoryIndex(prev => prev + 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setGeneratedCode(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setGeneratedCode(history[newIndex])
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImages(prev => [...prev, { name: file.name, url: reader.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSend = () => {
    if (!input.trim()) return

    if (!token) {
      navigate('/auth')
      return
    }

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const currentPrompt = input
    setInput('')
    setIsGenerating(true)

    axios.post('http://localhost:5000/api/generate', {
      prompt: currentPrompt,
      existingCode: generatedCode || null,
      images: uploadedImages
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        pushToHistory(response.data.code)

        if (response.data.title) {
          setWebsiteTitle(response.data.title)
        }
        if (response.data.description) {
          setWebsiteDescription(response.data.description)
        }

        const aiMessage = {
          role: 'assistant',
          content: generatedCode 
            ? 'I have updated your website with the requested changes!'
            : 'I have created your website! You can now preview it and request any changes.'
        }
        setMessages(prev => [...prev, aiMessage])
        setIsGenerating(false)
        refreshUser()
      })
      .catch((error) => {
        console.error(error)
        const errorMsg = error.response?.data?.message || 'Sorry, something went wrong. Please try again!'
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }])
        setIsGenerating(false)
      })
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
          { code: generatedCode, prompt: websiteDescription },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/projects',
          { title: websiteTitle, prompt: websiteDescription, code: generatedCode },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setProjectId(response.data._id)
      }

      alert('Project saved successfully!')
      localStorage.removeItem('webora_draft')

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
          <Link 
            to="/" 
            onClick={(e) => {
              if (isGenerating) {
                const confirmLeave = window.confirm('Your website is still generating. If you leave now, you may lose this generation. Continue anyway?')
                if (!confirmLeave) {
                  e.preventDefault()
                }
              }
            }}
            className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          >
            W
          </Link>
          <div>
            <p className="text-white text-sm font-medium capitalize">{websiteTitle}</p>
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
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg transition text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg transition text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
              showCode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            View Code
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

          {uploadedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img.url} className="w-12 h-12 rounded object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
              <label className="cursor-pointer text-gray-400 hover:text-white transition">
                <ImagePlus className="w-4 h-4" />
                <input type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
              </label>
              <textarea
                className="flex-1 bg-transparent text-white text-sm outline-none resize-none placeholder-gray-500"
                placeholder="Describe your website or request changes..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
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

        {/* MIDDLE - Preview */}
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

        {/* RIGHT - Code Panel */}
        {showCode && (
          <div className="w-[500px] bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-white text-sm font-medium">Source Code</h3>
              <button
                onClick={() => setShowCode(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs text-gray-300 whitespace-pre-wrap">
              <code>{generatedCode || 'No code generated yet'}</code>
            </pre>
          </div>
        )}

      </div>
    </div>
  )
}

export default EditorPage