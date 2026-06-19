import { createContext, useState, useContext } from 'react'

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

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}