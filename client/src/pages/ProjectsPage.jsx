import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Plus, Globe, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function ProjectsPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjects(prev => prev.filter(p => p._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 w-full">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No projects yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 transition cursor-pointer"
              >
                <div
                  onClick={() => navigate('/editor', { state: { projectId: project._id, prompt: project.prompt, code: project.code } })}
                  className="h-40 bg-gray-800 flex items-center justify-center"
                >
                  <Globe className="w-10 h-10 text-gray-600" />
                </div>

                <div className="p-4">
                  <h3 className="text-white font-medium mb-1">{project.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 truncate">{project.prompt}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleDelete(project._id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ProjectsPage