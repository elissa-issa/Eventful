const TOKEN_KEY = 'eventful_token'
const USER_KEY = 'eventful_user'

function readStoredAuth(storage) {
  if (!storage) {
    return null
  }

  const token = storage.getItem(TOKEN_KEY)
  const rawUser = storage.getItem(USER_KEY)

  if (!token || !rawUser) {
    return null
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    }
  } catch {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
    return null
  }
}

export function getStoredAuth() {
  if (typeof window === 'undefined') {
    return null
  }

  return readStoredAuth(window.localStorage) || readStoredAuth(window.sessionStorage)
}

export function persistAuth(authData, rememberUser = false) {
  if (typeof window === 'undefined') {
    return
  }

  const targetStorage = rememberUser ? window.localStorage : window.sessionStorage
  const otherStorage = rememberUser ? window.sessionStorage : window.localStorage

  otherStorage.removeItem(TOKEN_KEY)
  otherStorage.removeItem(USER_KEY)

  targetStorage.setItem(TOKEN_KEY, authData.token)
  targetStorage.setItem(USER_KEY, JSON.stringify(authData.user))
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}
