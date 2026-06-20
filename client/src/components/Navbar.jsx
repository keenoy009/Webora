import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-gray-950 border-b border-gray-800 relative">
      
      <Link to="/" className="flex items-center gap-2">
        <Zap className="text-blue-500 w-6 h-6" />
        <span className="text-white font-bold text-xl">Webora</span>
      </Link>

      <div className="flex items-center gap-8">
        <Link to="/" className="text-gray-400 hover:text-white transition">Home</Link>
        <Link to="/projects" className="text-gray-400 hover:text-white transition">My Projects</Link>
        <Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link>
        <Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link>
      </div>

      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
          >
            {user.name[0]}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-white transition text-sm px-3 py-2 rounded-lg hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-gray-400 hover:text-white transition">Sign In</Link>
          <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Get Started</Link>
        </div>
      )}

    </nav>
  )
}

export default Navbar