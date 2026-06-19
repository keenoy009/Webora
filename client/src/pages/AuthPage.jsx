import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin 
        ? { email, password } 
        : { name, email, password }

      const response = await axios.post(`http://localhost:5000${endpoint}`, payload)

      login(response.data.user, response.data.token)
      navigate('/')

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">

      <Link to="/" className="flex items-center gap-2 mb-8">
        <Zap className="text-blue-500 w-6 h-6" />
        <span className="text-white font-bold text-xl">Webora</span>
      </Link>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <h2 className="text-2xl font-bold text-white mb-1">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {isLogin ? 'Welcome back to Webora!' : 'Create your Webora account'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {!isLogin && (
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium mt-2 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

        </div>

        <p className="text-gray-400 text-sm text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-400 transition"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

      </div>
    </div>
  )
}

export default AuthPage