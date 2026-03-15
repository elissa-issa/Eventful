import { useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { ENTERTAINMENT_ITEMS } from '../constants/entertainmentItems'
import { LEBANESE_CITIES } from '../constants/lebaneseCities'
import { MENU_ITEMS } from '../constants/menuItems'
import { VENUE_ITEMS } from '../constants/venueItems'
import { COLORS } from '../constants/colors'
import DecorationFilterPanel from '../shared/Filters/DecorationFilterPanel'
import EntertainmentFilterPanel from '../shared/Filters/EntertainmentFilterPanel'
import MenuFilterPanel from '../shared/Filters/MenuFilterPanel'
import VenueFilterPanel from '../shared/Filters/VenueFilterPanel'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import ServiceCard from '../shared/components/ServiceCard'
import ServicesSubnav from '../shared/navigation/ServicesSubnav'

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

function ServicesPage() {
  const isLoggedIn = false
  const location = useLocation()
  const navigate = useNavigate()
  const [favoriteItems, setFavoriteItems] = useState({})
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedServiceItem, setSelectedServiceItem] = useState(null)
  const [venueFilters, setVenueFilters] = useState(DEFAULT_VENUE_FILTERS)
  const [menuFilters, setMenuFilters] = useState(DEFAULT_MENU_FILTERS)
  const [decorationFilters, setDecorationFilters] = useState(DEFAULT_DECORATION_FILTERS)
  const [entertainmentFilters, setEntertainmentFilters] = useState(
    DEFAULT_ENTERTAINMENT_FILTERS
  )

  const activeSection = location.hash.replace('#', '') || 'menus'

  const handleProtectedAction = () => {
    if (!isLoggedIn) {
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

  const itemsBySection = {
    bundles: BUNDLE_CARDS,
    menus: MENU_ITEMS,
    venues: VENUE_ITEMS,
    decorations: DECORATION_ITEMS,
    entertainment: ENTERTAINMENT_ITEMS,
  }

  const activeItems = itemsBySection[activeSection] || []
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
  const selectedGalleryImages =
    selectedServiceItem == null
      ? []
      : [
          {
            src: selectedServiceItem.imageSrc,
            alt: selectedServiceItem.imageAlt,
          },
          ...displayedItems
            .filter((item) => item.id !== selectedServiceItem.id && item.imageSrc !== selectedServiceItem.imageSrc)
            .map((item) => ({
              src: item.imageSrc,
              alt: item.imageAlt,
            })),
        ]

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
        {isVenueFilterOpen ? (
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

        {isMenuFilterOpen ? (
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

        {isDecorationFilterOpen ? (
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

        {isEntertainmentFilterOpen ? (
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
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: isVenueFilterOpen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
              xl: isVenueFilterOpen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2.25,
          }}
        >
          {isBundleSection
          ? displayedItems.map((item, index) => {
              const itemKey = `${item.id}-${index}`

              return (
                <BundleCard
                  key={itemKey}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  isFavorite={Boolean(favoriteItems[itemKey])}
                  onFavoriteToggle={() => handleFavoriteToggle(itemKey)}
                  leftText={item.leftText}
                  rightText={item.rightText}
                  primaryButtonLabel={item.primaryButtonLabel}
                  onPrimaryButtonClick={() => console.log(`View plan clicked: ${itemKey}`)}
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
            })
          : displayedItems.map((item) => (
              <ServiceCard
                key={item.id}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                title={item.title}
                description={item.description}
                guestText={item.guestText}
                priceText={item.priceText}
                discountLabel={item.discountLabel}
                vendorLogoSrc={item.vendorLogoSrc}
                vendorLogoAlt={item.vendorLogoAlt}
                isFavorite={Boolean(favoriteItems[item.id])}
                onFavoriteToggle={() => handleFavoriteToggle(item.id)}
                onViewButtonClick={() => navigate(`/services/${activeSection}/${item.id}`)}
                onCartButtonClick={handleProtectedAction}
              />
            ))}
        </Box>
      </Box>

      <AlertDialog
        open={isSignInDialogOpen}
        onClose={() => setIsSignInDialogOpen(false)}
        title="Sign in to continue"
        titleColor={COLORS.primary}
        description="To be able to add items to your cart or favorites please sign in now"
        primaryButtonText="Sign in"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={() => setIsSignInDialogOpen(false)}
        secondaryActionText="Back to guest mode"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={() => setIsSignInDialogOpen(false)}
      />
    </>
  )
}

export default ServicesPage
