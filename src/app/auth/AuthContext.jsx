import { useMemo, useState } from 'react'
import {
  clearStoredAuth,
  getStoredAuth,
  persistAuth,
  persistStoredAuth,
  persistStoredUser,
} from './storage'
import AuthContext from './authContextValue'

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

  const updateUser = (userUpdates) => {
    setAuthState((currentState) => {
      if (!currentState.user) {
        return currentState
      }

      const nextUser = {
        ...currentState.user,
        ...userUpdates,
      }

      persistStoredUser(nextUser)

      return {
        ...currentState,
        user: nextUser,
      }
    })
  }

  const replaceAuth = (authData) => {
    persistStoredAuth(authData)
    setAuthState({
      token: authData.token,
      user: authData.user,
    })
  }

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token && authState.user),
      login,
      logout,
      updateUser,
      replaceAuth,
    }),
    [authState.token, authState.user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
