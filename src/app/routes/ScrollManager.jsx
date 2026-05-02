import { useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const scrollPositions = new Map()

function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const previousKeyRef = useRef(location.key)

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    const previousKey = previousKeyRef.current

    scrollPositions.set(previousKey, window.scrollY)
    previousKeyRef.current = location.key

    if (navigationType === 'POP') {
      window.scrollTo({ top: scrollPositions.get(location.key) || 0, left: 0 })
      return
    }

    if (location.hash && location.pathname === '/services') {
      window.scrollTo({ top: 0, left: 0 })
      return
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [location.hash, location.key, location.pathname, navigationType])

  return null
}

export default ScrollManager
