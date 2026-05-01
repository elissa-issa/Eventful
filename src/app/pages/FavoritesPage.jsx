import { useEffect, useState } from 'react'
import { Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { getFavorites, removeFavorite } from '../services/favorites'
import { useToast } from '../toast/useToast'
import FavoriteItemCard from '../shared/components/FavoriteItemCard'

function FavoritesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadFavorites = () => {
    let isMounted = true

    getFavorites()
      .then((result) => {
        if (isMounted) {
          setFavorites(result.data?.items || [])
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }

  useEffect(loadFavorites, [])

  const handleRemoveFavorite = async (item) => {
    try {
      await removeFavorite({
        serviceId: item.serviceId,
        serviceType: item.serviceType,
      })
      setFavorites((current) =>
        current.filter(
          (favorite) =>
            !(
              favorite.serviceId === item.serviceId &&
              favorite.serviceType === item.serviceType
            )
        )
      )
      showToast('Removed from favorites')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleAddToCart = async (item) => {
    try {
      openCollectionPicker(
        {
          ...item.service,
          id: item.service?.id || item.serviceId,
          mongoId: item.serviceId,
        },
        item.serviceType,
      )
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  return (
    <Stack spacing={2.2} sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 800 }}>
        My Favorites
      </Typography>

      {isLoading ? (
        <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>
          Loading favorites...
        </Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{errorMessage}</Typography>
      ) : null}

      {!isLoading && favorites.length === 0 ? (
        <Typography sx={{ color: COLORS.textLight }}>
          You do not have any favorite services yet.
        </Typography>
      ) : null}

      {favorites.map((item) => (
        <FavoriteItemCard
          key={`${item.serviceType}:${item.serviceId}`}
          imageSrc={item.service?.imageSrc}
          imageAlt={item.service?.imageAlt}
          title={item.service?.title || 'Service'}
          subtitle={item.serviceType}
          vendorLogoSrc={item.service?.vendorLogoSrc}
          vendorLogoAlt={item.service?.vendorLogoAlt}
          description={item.service?.priceText || ''}
          detailText={item.service?.id || item.serviceId}
          priceText={item.service?.priceText || `$${item.service?.priceValue || 0}`}
          onDelete={() => handleRemoveFavorite(item)}
          onView={() => navigate(`/services/${item.serviceType}/${item.service?.id || item.serviceId}`)}
          onAddToCart={() => handleAddToCart(item)}
        />
      ))}
      {collectionPickerDialog}
    </Stack>
  )
}

export default FavoritesPage
