import { createContext, useState, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('webora_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('webora_token') || null
  })

  const login = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('webora_user', JSON.stringify(userData))
    localStorage.setItem('webora_token', userToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('webora_user')
    localStorage.removeItem('webora_token')
  }

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('webora_token')
    if (!currentToken) return

    try {
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      })
      setUser(response.data)
      localStorage.setItem('webora_user', JSON.stringify(response.data))
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}