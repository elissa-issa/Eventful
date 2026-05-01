import { useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LEBANESE_CITIES } from '../constants/lebaneseCities'
import { COLORS } from '../constants/colors'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useServicesData } from '../hooks/useServicesData'
import { useToast } from '../toast/useToast'
import { getServicePayload } from '../utils/servicePayload'
import DecorationFilterPanel from '../shared/Filters/DecorationFilterPanel'
import EntertainmentFilterPanel from '../shared/Filters/EntertainmentFilterPanel'
import MenuFilterPanel from '../shared/Filters/MenuFilterPanel'
import VenueFilterPanel from '../shared/Filters/VenueFilterPanel'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import SearchEmptyState from '../shared/components/SearchEmptyState'
import ServiceCard from '../shared/components/ServiceCard'
import ServicesSubnav from '../shared/navigation/ServicesSubnav'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'

const DEFAULT_VENUE_FILTERS = {
  priceRange: [0, 100],
  quantityRange: [1, 500],
  location: '',
  placement: {
    indoor: true,
    outdoor: true,
  },
  time: {
    day: true,
    night: true,
  },
}

const DEFAULT_MENU_FILTERS = {
  priceRange: [0, 100],
  quantityRange: [1, 500],
  location: '',
  categories: [],
  veganOnly: false,
}

const DEFAULT_DECORATION_FILTERS = {
  priceRange: [0, 100],
  quantityRange: [1, 500],
  categories: [],
}

const DEFAULT_ENTERTAINMENT_FILTERS = {
  priceRange: [0, 100],
  location: '',
  categories: [],
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

function ServicesPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { itemsBySection } = useServicesData()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
   const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [venueFilters, setVenueFilters] = useState(DEFAULT_VENUE_FILTERS)
  const [menuFilters, setMenuFilters] = useState(DEFAULT_MENU_FILTERS)
  const [decorationFilters, setDecorationFilters] = useState(DEFAULT_DECORATION_FILTERS)
  const [entertainmentFilters, setEntertainmentFilters] = useState(
    DEFAULT_ENTERTAINMENT_FILTERS
  )

  const activeSection = location.hash.replace('#', '') || 'menus'
  const searchQuery = searchParams.get('q')?.trim() || ''
  const planId = searchParams.get('planId')
  const isPlanMode = Boolean(planId)
  const normalizedSearchQuery = searchQuery.toLowerCase()
  const isSearchMode = normalizedSearchQuery.length > 0

  const getDetailPath = (serviceType, id) =>
    `/services/${serviceType}/${id}${isPlanMode ? `?planId=${planId}` : ''}`

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
      if (isPlanMode) {
        navigate(getDetailPath(serviceType, item.id))
        return
      }

      openCollectionPicker(event, item, serviceType)
    })
  }

  const activeItems = useMemo(
    () => itemsBySection[activeSection] || [],
    [activeSection, itemsBySection]
  )
  const isBundleSection = activeSection === 'bundles'
  const isDecorationSection = activeSection === 'decorations'
  const isEntertainmentSection = activeSection === 'entertainment'
  const isMenuSection = activeSection === 'menus'
  const isVenueSection = activeSection === 'venues'
  const isFilterOpen = searchParams.get('filters') === 'open'
  const isDecorationFilterOpen = isDecorationSection && isFilterOpen
  const isEntertainmentFilterOpen = isEntertainmentSection && isFilterOpen
  const isVenueFilterOpen = isVenueSection && isFilterOpen
  const isMenuFilterOpen = isMenuSection && isFilterOpen
  const searchResults = useMemo(
    () =>
      SEARCHABLE_SECTIONS.flatMap((section) =>
        (itemsBySection[section] || [])
          .filter((item) => getSearchableText(item, section).includes(normalizedSearchQuery))
          .map((item, index) => ({
            ...item,
            resultSection: section,
            resultKey: `${section}-${item.id}-${index}`,
            isBundle: section === 'bundles',
          }))
      ),
    [itemsBySection, normalizedSearchQuery]
  )
  const locationOptions = useMemo(
    () => LEBANESE_CITIES.map((city) => city.name.split(',')[0]),
    []
  )
  const menuCategoryOptions = useMemo(
    () => ['Lebanese', 'Salads', 'Fast Food', 'Bakeries', 'Sandwiches', 'Sushi'],
    []
  )
  const decorationCategoryOptions = useMemo(
    () => [
      'Flowers & Greenery',
      'Lighting',
      'Confetti & Balloons',
      'Wall & Ceiling Decor',
      'Table Decorations',
      'Party Props & Accessories',
    ],
    []
  )
  const entertainmentCategoryOptions = useMemo(
    () => ['Music', 'Dancing', 'Animation'],
    []
  )
  const filteredVenueItems = useMemo(() => {
    if (!isVenueSection) {
      return activeItems
    }

    const normalizedLocation = venueFilters.location.trim().toLowerCase()
    const selectedPlacements = Object.entries(venueFilters.placement)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key)
    const selectedTimes = Object.entries(venueFilters.time)
      .filter(([, isSelected]) => isSelected)
      .map(([key]) => key)

    return activeItems.filter((item) => {
      const priceMatches =
        item.priceValue >= venueFilters.priceRange[0] * 10 &&
        item.priceValue <= venueFilters.priceRange[1] * 10
      const quantityMatches =
        item.maxGuests >= venueFilters.quantityRange[0] &&
        item.minGuests <= venueFilters.quantityRange[1]
      const locationMatches =
        normalizedLocation.length === 0 ||
        item.location.toLowerCase().includes(normalizedLocation)
      const placementMatches =
        selectedPlacements.length === 0 || selectedPlacements.includes(item.placement)
      const timeMatches = selectedTimes.length === 0 || selectedTimes.includes(item.time)

      return (
        priceMatches &&
        quantityMatches &&
        locationMatches &&
        placementMatches &&
        timeMatches
      )
    })
  }, [activeItems, isVenueSection, venueFilters])
  const filteredMenuItems = useMemo(() => {
    if (!isMenuSection) {
      return activeItems
    }

    return activeItems.filter((item) => {
      const priceMatches =
        item.priceValue >= menuFilters.priceRange[0] &&
        item.priceValue <= menuFilters.priceRange[1]
      const quantityMatches =
        item.maxGuests >= menuFilters.quantityRange[0] &&
        item.minGuests <= menuFilters.quantityRange[1]
      const categoryMatches =
        menuFilters.categories.length === 0 || menuFilters.categories.includes(item.category)
      const locationMatches =
        menuFilters.location.trim().length === 0 ||
        item.location.toLowerCase().includes(menuFilters.location.trim().toLowerCase())
      const veganMatches = !menuFilters.veganOnly || item.isVegan

      return priceMatches && quantityMatches && categoryMatches && locationMatches && veganMatches
    })
  }, [activeItems, isMenuSection, menuFilters])
  const filteredDecorationItems = useMemo(() => {
    if (!isDecorationSection) {
      return activeItems
    }

    return activeItems.filter((item) => {
      const priceMatches =
        item.priceValue >= decorationFilters.priceRange[0] &&
        item.priceValue <= decorationFilters.priceRange[1]
      const quantityMatches =
        item.maxQuantity >= decorationFilters.quantityRange[0] &&
        item.minQuantity <= decorationFilters.quantityRange[1]
      const categoryMatches =
        decorationFilters.categories.length === 0 ||
        decorationFilters.categories.includes(item.category)

      return priceMatches && quantityMatches && categoryMatches
    })
  }, [activeItems, decorationFilters, isDecorationSection])
  const filteredEntertainmentItems = useMemo(() => {
    if (!isEntertainmentSection) {
      return activeItems
    }

    return activeItems.filter((item) => {
      const priceMatches =
        item.priceValue >= entertainmentFilters.priceRange[0] &&
        item.priceValue <= entertainmentFilters.priceRange[1] * 10
      const locationMatches =
        entertainmentFilters.location.trim().length === 0 ||
        item.location
          .toLowerCase()
          .includes(entertainmentFilters.location.trim().toLowerCase())
      const categoryMatches =
        entertainmentFilters.categories.length === 0 ||
        entertainmentFilters.categories.includes(item.category)

      return priceMatches && locationMatches && categoryMatches
    })
  }, [activeItems, entertainmentFilters, isEntertainmentSection])
  const displayedItems = isVenueSection
    ? filteredVenueItems
    : isMenuSection
      ? filteredMenuItems
      : isDecorationSection
        ? filteredDecorationItems
        : isEntertainmentSection
          ? filteredEntertainmentItems
          : activeItems
  const resultsToRender = isSearchMode ? searchResults : displayedItems
  const shouldShowEmptyState = isSearchMode && resultsToRender.length === 0
  const handleCloseVenueFilter = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('filters')
    setSearchParams(nextParams)
  }

  return (
    <>
      <ServicesSubnav />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 0,
          pt: 2.5,
          pb: 2,
          pl: { lg: 2 },
        }}
      >
        {!isSearchMode && isVenueFilterOpen ? (
          <Box
            sx={{
              width: { xs: '100%', lg: 280 },
              flexShrink: 0,
              mr: { lg: 2.5 },
              mb: { xs: 2.5, lg: 0 },
              position: { lg: 'sticky' },
              top: { lg: 84 },
              alignSelf: 'flex-start',
              zIndex: 1,
            }}
          >
            <VenueFilterPanel
              value={venueFilters}
              locations={locationOptions}
              onChange={setVenueFilters}
              onClearAll={() => setVenueFilters(DEFAULT_VENUE_FILTERS)}
              onClose={handleCloseVenueFilter}
            />
          </Box>
        ) : null}

        {!isSearchMode && isMenuFilterOpen ? (
          <Box
            sx={{
              width: { xs: '100%', lg: 280 },
              flexShrink: 0,
              mr: { lg: 2.5 },
              mb: { xs: 2.5, lg: 0 },
              position: { lg: 'sticky' },
              top: { lg: 84 },
              alignSelf: 'flex-start',
              zIndex: 1,
            }}
          >
            <MenuFilterPanel
              value={menuFilters}
              locations={locationOptions}
              categories={menuCategoryOptions}
              onChange={setMenuFilters}
              onClearAll={() => setMenuFilters(DEFAULT_MENU_FILTERS)}
              onClose={handleCloseVenueFilter}
            />
          </Box>
        ) : null}

        {!isSearchMode && isDecorationFilterOpen ? (
          <Box
            sx={{
              width: { xs: '100%', lg: 280 },
              flexShrink: 0,
              mr: { lg: 2.5 },
              mb: { xs: 2.5, lg: 0 },
              position: { lg: 'sticky' },
              top: { lg: 84 },
              alignSelf: 'flex-start',
              zIndex: 1,
            }}
          >
            <DecorationFilterPanel
              value={decorationFilters}
              categories={decorationCategoryOptions}
              onChange={setDecorationFilters}
              onClearAll={() => setDecorationFilters(DEFAULT_DECORATION_FILTERS)}
              onClose={handleCloseVenueFilter}
            />
          </Box>
        ) : null}

        {!isSearchMode && isEntertainmentFilterOpen ? (
          <Box
            sx={{
              width: { xs: '100%', lg: 280 },
              flexShrink: 0,
              mr: { lg: 2.5 },
              mb: { xs: 2.5, lg: 0 },
              position: { lg: 'sticky' },
              top: { lg: 84 },
              alignSelf: 'flex-start',
              zIndex: 1,
            }}
          >
            <EntertainmentFilterPanel
              value={entertainmentFilters}
              locations={locationOptions}
              categories={entertainmentCategoryOptions}
              onChange={setEntertainmentFilters}
              onClearAll={() => setEntertainmentFilters(DEFAULT_ENTERTAINMENT_FILTERS)}
              onClose={handleCloseVenueFilter}
            />
          </Box>
        ) : null}

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25,
          }}
        >
          {isSearchMode ? (
            <Stack spacing={0.5}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.35rem' }}>
                Search Results
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontSize: '0.98rem' }}>
                {resultsToRender.length > 0
                  ? `${resultsToRender.length} result${resultsToRender.length === 1 ? '' : 's'} for "${searchQuery}"`
                  : `No matches for "${searchQuery}"`}
              </Typography>
            </Stack>
          ) : null}

          {shouldShowEmptyState ? (
            <SearchEmptyState query={searchQuery} />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg:
                    !isSearchMode && isVenueFilterOpen
                      ? 'repeat(2, minmax(0, 1fr))'
                      : 'repeat(3, minmax(0, 1fr))',
                  xl:
                    !isSearchMode && isVenueFilterOpen
                      ? 'repeat(2, minmax(0, 1fr))'
                      : 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2.25,
              }}
            >
              {resultsToRender.map((item, index) => {
                const itemSection = item.resultSection || activeSection
                const favoriteKey = item.resultKey || item.id || `${itemSection}-${index}`
                const serviceId = getServicePayload(item, itemSection).serviceId
                const backendFavoriteKey = serviceId
                  ? getFavoriteKey(itemSection, serviceId)
                  : favoriteKey

                if (item.isBundle || (!isSearchMode && isBundleSection)) {
                  return (
                    <BundleCard
                      key={favoriteKey}
                      imageSrc={item.imageSrc}
                      imageAlt={item.imageAlt}
                      title={item.title}
                      isFavorite={Boolean(favoriteItems[backendFavoriteKey])}
                      onFavoriteToggle={() => handleFavoriteToggle(item, itemSection)}
                      leftText={item.leftText}
                      rightText={item.rightText}
                      primaryButtonLabel={isPlanMode ? 'Choose Template' : item.primaryButtonLabel}
                      onPrimaryButtonClick={() => navigate(getDetailPath('bundles', item.id))}
                      secondaryButtonLabel={isPlanMode ? 'Add to Plan' : item.secondaryButtonLabel}
                      onSecondaryButtonClick={(event) =>
                        handleAddToCart(event, item, itemSection)
                      }
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
                    key={favoriteKey}
                    imageSrc={item.imageSrc}
                    imageAlt={item.imageAlt}
                    title={item.title}
                    description={item.description}
                    guestText={item.guestText}
                    priceText={item.priceText}
                    discountLabel={item.discountLabel}
                    vendorLogoSrc={item.vendorLogoSrc}
                    vendorLogoAlt={item.vendorLogoAlt}
                    isFavorite={Boolean(favoriteItems[backendFavoriteKey])}
                    onFavoriteToggle={() => handleFavoriteToggle(item, itemSection)}
                    onViewButtonClick={() => navigate(getDetailPath(itemSection, item.id))}
                    cartButtonLabel={isPlanMode ? 'Add to Plan' : 'Add to Cart'}
                    onCartButtonClick={(event) => handleAddToCart(event, item, itemSection)}
                  />
                )
              })}
            </Box>
          )}
        </Box>
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

export default ServicesPage
