import { useEffect, useRef, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { BUNDLE_CARDS } from '../constants/bundleCards'
import { CATEGORY_CARDS } from '../constants/categoryCards'
import { COLORS } from '../constants/colors'
import { VENDOR_CARDS } from '../constants/vendorCards'
import BundleCard from '../shared/components/BundleCard'
import CategoryCard from '../shared/components/CategoryCard'
import HomeHero from '../shared/components/HomeHero'
import VendorCard from '../shared/components/VendorCard'

function HomePage() {
  const [favoriteCards, setFavoriteCards] = useState({})
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false)
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false)
  const [canScrollVendorsLeft, setCanScrollVendorsLeft] = useState(false)
  const [canScrollVendorsRight, setCanScrollVendorsRight] = useState(false)
  const cardsRowRef = useRef(null)
  const categoriesRowRef = useRef(null)
  const vendorsRowRef = useRef(null)

  const handleFavoriteToggle = (cardId) => {
    setFavoriteCards((current) => ({
      ...current,
      [cardId]: !current[cardId],
    }))
  }

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
  }, [])

  return (
    <Stack spacing={3} sx={{ backgroundColor: COLORS.surface }}>
      <HomeHero />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
        {BUNDLE_CARDS.map((card) => (
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
              isFavorite={Boolean(favoriteCards[card.id])}
              onFavoriteToggle={() => handleFavoriteToggle(card.id)}
              leftText={card.leftText}
              rightText={card.rightText}
              primaryButtonLabel={card.primaryButtonLabel}
              onPrimaryButtonClick={() => console.log(`View plan clicked: ${card.id}`)}
              secondaryButtonLabel={card.secondaryButtonLabel}
              onSecondaryButtonClick={() =>
                console.log(`Add to cart clicked: ${card.id}`)
              }
            />
          </Box>
        ))}
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
              onButtonClick={() => console.log(`View category clicked: ${card.id}`)}
              imageSrc={card.imageSrc}
              imageAlt={card.imageAlt}
            />
          </Box>
        ))}
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

      <Stack direction="row" alignItems="center" justifyContent="space-between">
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
          gap: 2,
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
        {VENDOR_CARDS.map((vendor) => (
          <Box
            key={vendor.id}
            sx={{
              flex: '0 0 auto',
              width: { xs: 250, sm: 280 },
              scrollSnapAlign: 'start',
            }}
          >
            <VendorCard imageSrc={vendor.imageSrc} imageAlt={vendor.imageAlt} />
          </Box>
        ))}
      </Box>
    </Stack>
  )
}

export default HomePage
