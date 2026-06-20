import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function CommunityPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublishedProjects()
  }, [])

  const fetchPublishedProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/community')
      setProjects(response.data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10 w-full">

        <h1 className="text-2xl font-bold text-white mb-8">Published Projects</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No published projects yet!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate('/editor', { state: { code: project.code, prompt: project.prompt } })}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 transition cursor-pointer"
              >
                <div className="h-40 bg-gray-800 overflow-hidden relative">
                  <iframe
                    srcDoc={project.code}
                    className="w-[400%] h-[400%] scale-[0.25] origin-top-left pointer-events-none"
                    title={project.title}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm capitalize">{project.title}</h3>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                      Website
                    </span>
                  </div>

                 

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {project.user?.name?.[0] || 'U'}
                      </div>
                      <span className="text-gray-400 text-xs">{project.user?.name || 'User'}</span>
                    </div>
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

export default CommunityPage