import { Link, useNavigate } from 'react-router-dom'
import { Zap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-gray-950 border-b border-gray-800">
      
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
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Credits: <span className="text-blue-500 font-medium">{user.credits}</span></span>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.name[0]}
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
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