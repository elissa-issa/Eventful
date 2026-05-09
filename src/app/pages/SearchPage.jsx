import { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { useServicesData } from '../hooks/useServicesData'
import { getUnavailableServicesByDate } from '../services/services'
import { useToast } from '../toast/useToast'
import { getServiceMongoId, getServicePayload } from '../utils/servicePayload'
import { getSearchMatchScore } from '../utils/searchMatching'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import SearchEmptyState from '../shared/components/SearchEmptyState'
import ServiceCard from '../shared/components/ServiceCard'

const SEARCHABLE_SECTIONS = ['bundles', 'venues', 'menus', 'decorations', 'entertainment']

const getNumericValue = (value) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

const getGuestCapacityFromText = (value = '') => {
  const match = String(value).match(/guests?:\s*(\d+)(?:\s*-\s*(\d+))?/i)

  if (!match) {
    return null
  }

  return Number(match[2] || match[1])
}

const getGuestCapacity = (item) => {
  const maxGuests = getNumericValue(item.maxGuests)

  if (maxGuests !== null) {
    return maxGuests
  }

  const guestTextCapacity = getGuestCapacityFromText(item.guestText)

  if (guestTextCapacity !== null) {
    return guestTextCapacity
  }

  const planItemCapacities = (item.planItems || [])
    .map((planItem) => getGuestCapacityFromText(planItem.metaText))
    .filter((capacity) => capacity !== null)

  return planItemCapacities.length > 0 ? Math.min(...planItemCapacities) : null
}

const canHostGuests = (item, guests) => {
  if (!guests) {
    return true
  }

  const capacity = getGuestCapacity(item)

  return capacity === null || guests <= capacity
}

const getSearchGuestCounts = (searchParams) => ({
  adults: Math.max(0, Number(searchParams.get('adults') || 0)) || 0,
  teenagers: Math.max(0, Number(searchParams.get('teenagers') || 0)) || 0,
  children: Math.max(0, Number(searchParams.get('children') || 0)) || 0,
  infants: Math.max(0, Number(searchParams.get('infants') || 0)) || 0,
})

const hasAgeBadge = (item, badge) =>
  (item.badgeLabels || []).some((label) => String(label).toLowerCase() === badge)

const isAgeAppropriate = (item, guestCounts) => {
  const hasGuestBreakdown = Object.values(guestCounts).some((count) => count > 0)

  if (!hasGuestBreakdown) {
    return true
  }

  const underTwelveGuests = guestCounts.children + guestCounts.infants
  const underEighteenGuests = underTwelveGuests + guestCounts.teenagers
  const adultOnlySearch =
    guestCounts.adults > 0 &&
    guestCounts.teenagers === 0 &&
    guestCounts.children === 0 &&
    guestCounts.infants === 0

  if (hasAgeBadge(item, '18+') && underEighteenGuests > 0) {
    return false
  }

  if (hasAgeBadge(item, '12+') && underTwelveGuests > 0) {
    return false
  }

  if (hasAgeBadge(item, 'kids') && adultOnlySearch) {
    return false
  }

  return true
}

function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { itemsBySection } = useServicesData()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [unavailableServiceKeys, setUnavailableServiceKeys] = useState(new Set())
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() || ''
  const selectedDate = searchParams.get('date')?.trim() || ''
  const selectedGuests = Math.max(0, Number(searchParams.get('guests') || 0)) || 0
  const selectedGuestCounts = getSearchGuestCounts(searchParams)

  useEffect(() => {
    let isMounted = true

    if (!selectedDate) {
      return undefined
    }

    getUnavailableServicesByDate(selectedDate)
      .then((unavailableServices) => {
        if (!isMounted) {
          return
        }

        setUnavailableServiceKeys(
          new Set(
            unavailableServices.map(
              (service) => `${service.serviceType}:${service.serviceId}`,
            ),
          ),
        )
      })
      .catch(() => {
        if (isMounted) {
          setUnavailableServiceKeys(new Set())
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedDate])

  const handleCloseSignInDialog = () => {
    setIsSignInDialogOpen(false)
  }

  const handleLoginRedirect = () => {
    handleCloseSignInDialog()
    navigate('/login', {
      state: {
        from: `${location.pathname}${location.search}${location.hash}`,
      },
    })
  }

  const handleProtectedAction = async (action) => {
    if (!isAuthenticated) {
      setIsSignInDialogOpen(true)
      return true
    }

    if (action) {
      try {
        await action()
      } catch (error) {
        showToast(error.message, 'error')
      }
    }

    return false
  }

  const handleFavoriteToggle = (item, serviceType) => {
    const payload = getServicePayload(item, serviceType)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      const isFavorite = await toggleFavoriteItem(payload)
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    })
  }

  const handleAddToCart = (event, item, serviceType) => {
    const payload = getServicePayload(item, serviceType)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      openCollectionPicker(event, item, serviceType)
    })
  }

  const searchResults = useMemo(
    () =>
      SEARCHABLE_SECTIONS.flatMap((section) =>
        (itemsBySection[section] || [])
          .map((item, index) => ({
            item,
            index,
            matchScore: getSearchMatchScore(item, section, searchQuery),
          }))
          .filter(({ matchScore }) => matchScore !== null)
          .filter(({ item }) => canHostGuests(item, selectedGuests))
          .filter(({ item }) => isAgeAppropriate(item, selectedGuestCounts))
          .filter(({ item }) => {
            if (!selectedDate) {
              return true
            }

            const serviceId = getServiceMongoId(item)

            return !serviceId || !unavailableServiceKeys.has(`${section}:${serviceId}`)
          })
          .map(({ item, index, matchScore }) => ({
            ...item,
            resultSection: section,
            resultKey: `${section}-${item.id}-${index}`,
            isBundle: section === 'bundles',
            matchScore,
          }))
      ).sort((firstItem, secondItem) => firstItem.matchScore - secondItem.matchScore),
    [itemsBySection, searchQuery, selectedDate, selectedGuests, selectedGuestCounts, unavailableServiceKeys]
  )
  const guestSummary = selectedGuests > 0 ? `${selectedGuests} guests` : ''
  const searchSummaryTarget = [searchQuery, selectedDate, guestSummary].filter(Boolean).join(' on ')

  return (
    <>
      <Box
        sx={{
          pt: 4,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.25,
        }}
      >
        <Stack spacing={0.5}>
          <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.9rem' }}>
            Search Results
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, fontSize: '1rem' }}>
            {searchResults.length > 0
              ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${searchSummaryTarget || 'all services'}"`
              : `No available matches for "${searchSummaryTarget || 'all services'}"`}
          </Typography>
        </Stack>

        {searchResults.length === 0 ? (
          <SearchEmptyState query={searchQuery} />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2.25,
            }}
          >
            {searchResults.map((item) => {
              const serviceId = getServicePayload(item, item.resultSection).serviceId
              const favoriteKey = serviceId
                ? getFavoriteKey(item.resultSection, serviceId)
                : item.resultKey

              if (item.isBundle) {
                return (
                  <BundleCard
                    key={item.resultKey}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    isFavorite={Boolean(favoriteItems[favoriteKey])}
                    onFavoriteToggle={() => handleFavoriteToggle(item, item.resultSection)}
                    leftText={item.leftText}
                    rightText={item.rightText}
                    primaryButtonLabel={item.primaryButtonLabel}
                    onPrimaryButtonClick={() => navigate(`/services/bundles/${item.id}`)}
                    secondaryButtonLabel={item.secondaryButtonLabel}
                    onSecondaryButtonClick={(event) => handleAddToCart(event, item, item.resultSection)}
                    maxWidth={400}
                    imageHeight={312}
                    cardBorderRadius={2}
                    contentPaddingX={0.5}
                    contentPaddingTop={1.8}
                    contentPaddingBottom={12.8}
                  />
                )
              }

              return (
                <ServiceCard
                  key={item.resultKey}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  description={item.description}
                  guestText={item.guestText}
                  priceText={item.priceText}
                  discountLabel={item.discountLabel}
                  badgeLabels={item.badgeLabels}
                  vendorLogoSrc={item.vendorLogoSrc}
                  vendorLogoAlt={item.vendorLogoAlt}
                  isFavorite={Boolean(favoriteItems[favoriteKey])}
                  onFavoriteToggle={() => handleFavoriteToggle(item, item.resultSection)}
                  onViewButtonClick={() => navigate(`/services/${item.resultSection}/${item.id}`)}
                  onCartButtonClick={(event) => handleAddToCart(event, item, item.resultSection)}
                />
              )
            })}
          </Box>
        )}
      </Box>

      <AlertDialog
        open={isSignInDialogOpen}
        onClose={handleCloseSignInDialog}
        title="Sign in to continue"
        titleColor={COLORS.primary}
        description="To be able to add items to your cart or favorites please sign in now"
        primaryButtonText="Sign in"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={handleLoginRedirect}
        secondaryActionText="Back to guest mode"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={handleCloseSignInDialog}
      />
      {collectionPickerDialog}
    </>
  )
}

export default SearchPage
