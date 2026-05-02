import { useEffect, useMemo, useRef, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { CATEGORY_CARDS } from '../constants/categoryCards'
import { COLORS } from '../constants/colors'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { useServicesData } from '../hooks/useServicesData'
import { useToast } from '../toast/useToast'
import { getServicePayload } from '../utils/servicePayload'
import AlertDialog from '../shared/components/AlertDialog'
import BundleCard from '../shared/components/BundleCard'
import CategoryCard from '../shared/components/CategoryCard'
import HomeHero from '../shared/components/HomeHero'
import NewsletterCTA from '../shared/components/NewsletterCTA'
import VendorCard from '../shared/components/VendorCard'

const FEATURED_PARTNER_LOGO_STYLES = {
  'the led store': {
    transform: 'scale(1.9)',
  },
  'the balloon event company': {
    transform: 'scale(1.55)',
  },
  'willow & hive': {
    transform: 'scale(1.85)',
  },
}

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { itemsBySection } = useServicesData()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false)
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false)
  const [canScrollVendorsLeft, setCanScrollVendorsLeft] = useState(false)
  const [canScrollVendorsRight, setCanScrollVendorsRight] = useState(false)
  const [signInRedirectPath, setSignInRedirectPath] = useState('')
  const cardsRowRef = useRef(null)
  const categoriesRowRef = useRef(null)
  const vendorsRowRef = useRef(null)

  const bundleCards = itemsBySection.bundles || BUNDLE_CARDS
  const uniquePartners = useMemo(() => {
    const allServices = [
      ...(itemsBySection.venues || []),
      ...(itemsBySection.menus || []),
      ...(itemsBySection.decorations || []),
      ...(itemsBySection.entertainment || []),
    ]
    const partnersByKey = new Map()
    const seenVendorNames = new Set()

    allServices
      .filter((item) => item.vendorLogoSrc)
      .forEach((item) => {
        const vendorNameKey = item.vendorName?.trim().toLowerCase()

        if (vendorNameKey && seenVendorNames.has(vendorNameKey)) {
          return
        }

        partnersByKey.set(item.vendorLogoSrc, {
          name: item.vendorName,
          logoSrc: item.vendorLogoSrc,
        })

        if (vendorNameKey) {
          seenVendorNames.add(vendorNameKey)
        }
      })

    return Array.from(partnersByKey.values())
  }, [itemsBySection])

  const handleFavoriteToggle = (card) => {
    if (!isAuthenticated) {
      setSignInRedirectPath('')
      setIsSignInDialogOpen(true)
      return
    }

    const payload = getServicePayload(card, 'bundles')

    if (payload.serviceId) {
      toggleFavoriteItem(payload)
        .then((isFavorite) => {
          showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
        })
        .catch((error) => showToast(error.message, 'error'))
    }
  }

  const handleAddToCartClick = (event, card) => {
    if (!isAuthenticated) {
      setSignInRedirectPath('')
      setIsSignInDialogOpen(true)
      return
    }

    const payload = getServicePayload(card, 'bundles')

    if (payload.serviceId) {
      openCollectionPicker(event, card, 'bundles')
    }
  }

  const handleCloseSignInDialog = () => {
    setIsSignInDialogOpen(false)
    setSignInRedirectPath('')
  }

  const handleLoginRedirect = () => {
    const from = signInRedirectPath || `${location.pathname}${location.search}${location.hash}`

    handleCloseSignInDialog()
    navigate('/login', {
      state: {
        from,
      },
    })
  }

  const handleCustomizeClick = () => {
    if (!isAuthenticated) {
      setSignInRedirectPath('/customize')
      setIsSignInDialogOpen(true)
      return
    }

    navigate('/customize')
  }

  const signInDialogDescription =
    signInRedirectPath === '/customize'
      ? 'To be able to customize your own event please sign in now'
      : 'To be able to add items to your cart or favorites please sign in now'

  const updateScrollState = () => {
    const container = cardsRowRef.current

    if (!container) {
      return
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < maxScrollLeft - 1)
  }

  const handleArrowClick = (direction) => {
    const container = cardsRowRef.current

    if (!container) {
      return
    }

    const scrollAmount = Math.max(container.clientWidth * 0.85, 280)

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const updateCategoryScrollState = () => {
    const container = categoriesRowRef.current

    if (!container) {
      return
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth

    setCanScrollCategoriesLeft(container.scrollLeft > 0)
    setCanScrollCategoriesRight(container.scrollLeft < maxScrollLeft - 1)
  }

  const handleCategoryArrowClick = (direction) => {
    const container = categoriesRowRef.current

    if (!container) {
      return
    }

    const scrollAmount = Math.max(container.clientWidth * 0.8, 360)

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const updateVendorScrollState = () => {
    const container = vendorsRowRef.current

    if (!container) {
      return
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth

    setCanScrollVendorsLeft(container.scrollLeft > 0)
    setCanScrollVendorsRight(container.scrollLeft < maxScrollLeft - 1)
  }

  const handleVendorArrowClick = (direction) => {
    const container = vendorsRowRef.current

    if (!container) {
      return
    }

    const scrollAmount = Math.max(container.clientWidth * 0.75, 260)

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handlePartnerClick = (vendorName) => {
    const params = new URLSearchParams({ vendor: vendorName })

    navigate(`/vendors?${params.toString()}`)
  }

  useEffect(() => {
    updateScrollState()
    updateCategoryScrollState()
    updateVendorScrollState()

    const bundleContainer = cardsRowRef.current
    const categoryContainer = categoriesRowRef.current
    const vendorContainer = vendorsRowRef.current

    if (!bundleContainer || !categoryContainer || !vendorContainer) {
      return undefined
    }

    const handleResize = () => {
      updateScrollState()
      updateCategoryScrollState()
      updateVendorScrollState()
    }

    bundleContainer.addEventListener('scroll', updateScrollState)
    categoryContainer.addEventListener('scroll', updateCategoryScrollState)
    vendorContainer.addEventListener('scroll', updateVendorScrollState)
    window.addEventListener('resize', handleResize)

    return () => {
      bundleContainer.removeEventListener('scroll', updateScrollState)
      categoryContainer.removeEventListener('scroll', updateCategoryScrollState)
      vendorContainer.removeEventListener('scroll', updateVendorScrollState)
      window.removeEventListener('resize', handleResize)
    }
  }, [uniquePartners.length])

  return (
    <Stack spacing={3} sx={{ backgroundColor: COLORS.surface }}>
      <HomeHero />

      <Box sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 800 }}>
            Most Popular Plans
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Scroll bundle cards left"
              disabled={!canScrollLeft}
              onClick={() => handleArrowClick('left')}
              sx={{
                color: canScrollLeft ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              aria-label="Scroll bundle cards right"
              disabled={!canScrollRight}
              onClick={() => handleArrowClick('right')}
              sx={{
                color: canScrollRight ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={cardsRowRef}
          sx={{
            bgcolor: COLORS.surface,
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            pb: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {bundleCards.map((card) => {
            const serviceId = getServicePayload(card, 'bundles').serviceId
            const favoriteKey = serviceId ? getFavoriteKey('bundles', serviceId) : card.id

            return (
            <Box
              key={card.id}
              sx={{
                flex: '0 0 auto',
                width: { xs: '100%', sm: 320 },
                scrollSnapAlign: 'start',
              }}
            >
              <BundleCard
                imageSrc={card.imageSrc}
                imageAlt={card.imageAlt}
                title={card.title}
                isFavorite={Boolean(favoriteItems[favoriteKey])}
                onFavoriteToggle={() => handleFavoriteToggle(card)}
                leftText={card.leftText}
                rightText={card.rightText}
                primaryButtonLabel={card.primaryButtonLabel}
                onPrimaryButtonClick={() => navigate(`/services/bundles/${card.id}`)}
                secondaryButtonLabel={card.secondaryButtonLabel}
                onSecondaryButtonClick={(event) => handleAddToCartClick(event, card)}
              />
            </Box>
            )
          })}
        </Box>
      </Box>

      <Box sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 800 }}>
            Categories
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Scroll categories left"
              disabled={!canScrollCategoriesLeft}
              onClick={() => handleCategoryArrowClick('left')}
              sx={{
                color: canScrollCategoriesLeft ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              aria-label="Scroll categories right"
              disabled={!canScrollCategoriesRight}
              onClick={() => handleCategoryArrowClick('right')}
              sx={{
                color: canScrollCategoriesRight ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={categoriesRowRef}
          sx={{
            bgcolor: COLORS.surface,
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            pb: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORY_CARDS.map((card) => (
            <Box
              key={card.id}
              sx={{
                flex: '0 0 auto',
                width: { xs: 300, sm: 440 },
                scrollSnapAlign: 'start',
              }}
            >
              <CategoryCard
                title={card.title}
                description={card.description}
                buttonLabel={card.buttonLabel}
                onButtonClick={() => navigate(`/services${card.targetHash}`)}
                imageSrc={card.imageSrc}
                imageAlt={card.imageAlt}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 320, md: 420 },
          width: '100vw',
          left: '50%',
          transform: 'translateX(-50%)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 4 },
          backgroundImage:
            "linear-gradient(rgba(15, 45, 75, 0.28), rgba(15, 45, 75, 0.28)), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 540,
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: `${COLORS.primary}B3`,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 18px 40px ${COLORS.shadow}`,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: COLORS.surface,
              fontWeight: 800,
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            Need something specific?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: COLORS.surface,
              opacity: 0.95,
              maxWidth: 420,
              mx: 'auto',
              mb: 3,
            }}
          >
            Now you can customize your own event to your specific needs and wants!
          </Typography>
          <Button
            disableElevation
            variant="contained"
            onClick={handleCustomizeClick}
            sx={{
              minWidth: 160,
              borderRadius: '999px',
              backgroundColor: COLORS.accent,
              textTransform: 'uppercase',
              fontWeight: 800,
              px: 4,
              py: 1.25,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accentHover,
                boxShadow: 'none',
              },
            }}
          >
            Customize
          </Button>
        </Box>
      </Box>

      <Box sx={{ py: { xs: 4, md: 5.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 800 }}>
            Partners
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Scroll vendor cards left"
              disabled={!canScrollVendorsLeft}
              onClick={() => handleVendorArrowClick('left')}
              sx={{
                color: canScrollVendorsLeft ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              aria-label="Scroll vendor cards right"
              disabled={!canScrollVendorsRight}
              onClick={() => handleVendorArrowClick('right')}
              sx={{
                color: canScrollVendorsRight ? COLORS.primary : COLORS.textLight,
                backgroundColor: COLORS.surface,
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          ref={vendorsRowRef}
          sx={{
            bgcolor: COLORS.surface,
            display: 'flex',
            gap: 2.5,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            pb: 1,
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
          }}
        >
          {uniquePartners.map((vendor) => (
            <Box
              key={vendor.logoSrc}
              sx={{
                flex: '0 0 auto',
                width: { xs: 280, sm: 320 },
                scrollSnapAlign: 'start',
              }}
            >
              <VendorCard
                imageSrc={vendor.logoSrc}
                imageAlt={`${vendor.name} logo`}
                imageSx={FEATURED_PARTNER_LOGO_STYLES[vendor.name?.trim().toLowerCase()]}
                onClick={() => handlePartnerClick(vendor.name)}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <NewsletterCTA fullBleed backgroundImage="/assets/other/outdoorgathering.webp" />

      <AlertDialog
        open={isSignInDialogOpen}
        onClose={handleCloseSignInDialog}
        iconBackgroundColor={COLORS.primary}
        title="Sign in to continue"
        titleColor={COLORS.primary}
        description={signInDialogDescription}
        primaryButtonText="Sign in"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={handleLoginRedirect}
        secondaryActionText="Back to guest mode"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={handleCloseSignInDialog}
      />
      {collectionPickerDialog}
    </Stack>
  )
}

export default HomePage
