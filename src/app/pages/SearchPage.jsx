import { useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { COLORS } from '../constants/colors'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import SearchEmptyState from '../shared/components/SearchEmptyState'
import ServiceCard from '../shared/components/ServiceCard'

const ITEMS_BY_SECTION = {
  bundles: BUNDLE_CARDS,
  menus: MENU_ITEMS,
  venues: VENUE_ITEMS,
  decorations: DECORATION_ITEMS,
  entertainment: ENTERTAINMENT_ITEMS,
}

const SEARCHABLE_SECTIONS = ['bundles', 'venues', 'menus', 'decorations', 'entertainment']

const getSearchableText = (item, section) => {
  const baseFields = [
    item.title,
    item.description,
    item.detailsDescription,
    item.vendorName,
    item.vendorLocation,
    item.location,
    item.category,
    item.guestText,
    item.priceText,
    section,
  ]

  if (section === 'bundles') {
    return [
      ...baseFields,
      item.leftText,
      item.rightText,
      ...(item.planItems || []).flatMap((planItem) => [
        planItem.title,
        planItem.metaText,
        planItem.priceText,
      ]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
  }

  return baseFields.filter(Boolean).join(' ').toLowerCase()
}

function SearchPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [favoriteItems, setFavoriteItems] = useState({})
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() || ''
  const normalizedSearchQuery = searchQuery.toLowerCase()

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

  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      setIsSignInDialogOpen(true)
      return true
    }

    return false
  }

  const handleFavoriteToggle = (itemId) => {
    if (handleProtectedAction()) {
      return
    }

    setFavoriteItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }))
  }

  const searchResults = useMemo(
    () =>
      SEARCHABLE_SECTIONS.flatMap((section) =>
        (ITEMS_BY_SECTION[section] || [])
          .filter((item) => getSearchableText(item, section).includes(normalizedSearchQuery))
          .map((item, index) => ({
            ...item,
            resultSection: section,
            resultKey: `${section}-${item.id}-${index}`,
            isBundle: section === 'bundles',
          }))
      ),
    [normalizedSearchQuery]
  )

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
              ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for "${searchQuery}"`
              : `No matches for "${searchQuery}"`}
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
              if (item.isBundle) {
                return (
                  <BundleCard
                    key={item.resultKey}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    isFavorite={Boolean(favoriteItems[item.resultKey])}
                    onFavoriteToggle={() => handleFavoriteToggle(item.resultKey)}
                    leftText={item.leftText}
                    rightText={item.rightText}
                    primaryButtonLabel={item.primaryButtonLabel}
                    onPrimaryButtonClick={() => navigate(`/services/bundles/${item.id}`)}
                    secondaryButtonLabel={item.secondaryButtonLabel}
                    onSecondaryButtonClick={handleProtectedAction}
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
                  vendorLogoSrc={item.vendorLogoSrc}
                  vendorLogoAlt={item.vendorLogoAlt}
                  isFavorite={Boolean(favoriteItems[item.resultKey])}
                  onFavoriteToggle={() => handleFavoriteToggle(item.resultKey)}
                  onViewButtonClick={() => navigate(`/services/${item.resultSection}/${item.id}`)}
                  onCartButtonClick={handleProtectedAction}
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
    </>
  )
}

export default SearchPage
