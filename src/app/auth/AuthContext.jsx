import { useMemo, useState } from 'react'
import { clearStoredAuth, getStoredAuth, persistAuth } from './storage'
import AuthContext from './authContext'

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const storedAuth = getStoredAuth()

    return {
      token: storedAuth?.token ?? null,
      user: storedAuth?.user ?? null,
    }
  })

  const login = (authData, rememberUser = false) => {
    persistAuth(authData, rememberUser)
    setAuthState({
      token: authData.token,
      user: authData.user,
    })
  }

  const logout = () => {
    clearStoredAuth()
    setAuthState({
      token: null,
      user: null,
    })
  }

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token && authState.user),
      login,
      logout,
    }),
    [authState.token, authState.user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
