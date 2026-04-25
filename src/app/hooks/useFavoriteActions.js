import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { getFavorites, toggleFavorite } from '../services/favorites'

export function getFavoriteKey(serviceType, serviceId) {
  return `${serviceType}:${serviceId}`
}

export function useFavoriteActions() {
  const { isAuthenticated } = useAuth()
  const [favoriteItems, setFavoriteItems] = useState({})

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteItems({})
      return
    }

    const result = await getFavorites()
    const nextFavorites = {}

    ;(result.data?.items || []).forEach((item) => {
      nextFavorites[getFavoriteKey(item.serviceType, item.serviceId)] = true
    })

    setFavoriteItems(nextFavorites)
  }, [isAuthenticated])

  useEffect(() => {
    Promise.resolve().then(refreshFavorites).catch(() => {
      setFavoriteItems({})
    })
  }, [refreshFavorites])

  const toggleFavoriteItem = useCallback(async ({ serviceId, serviceType }) => {
    const result = await toggleFavorite({ serviceId, serviceType })
    const nextFavorites = {}

    ;(result.data?.favorites?.items || []).forEach((item) => {
      nextFavorites[getFavoriteKey(item.serviceType, item.serviceId)] = true
    })

    setFavoriteItems(nextFavorites)
    return result.data?.isFavorite
  }, [])

  return useMemo(
    () => ({
      favoriteItems,
      refreshFavorites,
      toggleFavoriteItem,
    }),
    [favoriteItems, refreshFavorites, toggleFavoriteItem]
  )
}
