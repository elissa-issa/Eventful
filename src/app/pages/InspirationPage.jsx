import { useEffect, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import { Box, Button, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { INSPIRATION_THEMES } from '../constants/inspirationThemes'
import AlertDialog from '../shared/components/AlertDialog'
import HeroCarousel from '../shared/components/HeroCarousel'
import InspirationThemeCard from '../shared/components/InspirationThemeCard'
import NewsletterCTA from '../shared/components/NewsletterCTA'
import ServiceCard from '../shared/components/ServiceCard'
import { INSPIRATION_HERO_SLIDES } from '../constants/inspirationHeroSlides'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useTopPicks } from '../hooks/useTopPicks'
import { addCartItem } from '../services/cart'
import { useToast } from '../toast/useToast'
import { getServicePayload } from '../utils/servicePayload'

function PremiumUpgradeCard() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minWidth: 0,
        borderRadius: 3,
        justifyContent: 'center',
        p: 3,
        maxHeight: 475,
        background:
          'linear-gradient(180deg, rgba(234, 122, 36, 0.08) 0%, rgba(43, 120, 204, 0.08) 100%)',
        border: '1px solid rgba(234, 122, 36, 0.35)',
        boxShadow: '0 18px 36px rgba(15, 45, 75, 0.08)',
      }}
    >
      <Stack spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(234, 122, 36, 0.16)',
            color: COLORS.accent,
          }}
        >
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography
          sx={{
            color: COLORS.primaryDark,
            fontSize: '1.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          Upgrade to Premium to View More
        </Typography>
        <Typography
          sx={{
            color: COLORS.textMuted,
            fontSize: '1rem',
            lineHeight: 1.45,
          }}
        >
          Unlock additional curated recommendations, premium bundles, and more tailored inspiration
          for your event planning.
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowOutwardRoundedIcon />}
          sx={{
            alignSelf: 'flex-start',
            borderRadius: '999px',
            px: 2.25,
            py: 0.9,
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: COLORS.accent,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.accentHover,
              boxShadow: 'none',
            },
          }}
        >
          Upgrade
        </Button>
      </Stack>
    </Box>
  )
}

function InspirationPage() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'))
  const isSmallUp = useMediaQuery(theme.breakpoints.up('sm'))
  const featureTheme = INSPIRATION_THEMES.find((theme) => theme.layout === 'feature')
  const sideTheme = INSPIRATION_THEMES.find((theme) => theme.layout === 'side')
  const standardThemes = INSPIRATION_THEMES.filter((theme) => theme.layout === 'standard')
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const visibleTopPicks = isLargeUp ? 3 : isSmallUp ? 2 : 1
  const {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  } = useTopPicks(visibleTopPicks)

  const handleHeroSlideChange = (direction) => {
    setActiveHeroSlideIndex((current) => {
      if (direction === 'left') {
        return current === 0 ? INSPIRATION_HERO_SLIDES.length - 1 : current - 1
      }

      return current === INSPIRATION_HERO_SLIDES.length - 1 ? 0 : current + 1
    })
  }

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

  const handleFavoriteToggle = (item) => {
    const payload = getServicePayload(item, item.section)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      const isFavorite = await toggleFavoriteItem(payload)
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    })
  }

  const handleAddToCart = (item) => {
    const payload = getServicePayload(item, item.section)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      await addCartItem({ ...payload, quantity: 1 })
      showToast('Added to cart')
    })
  }

  const activeHeroSlide = INSPIRATION_HERO_SLIDES[activeHeroSlideIndex]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHeroSlideIndex((current) =>
        current === INSPIRATION_HERO_SLIDES.length - 1 ? 0 : current + 1
      )
    }, 6000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <Stack spacing={6} sx={{ pt: 0, pb: 2 }}>
      <HeroCarousel
        slides={INSPIRATION_HERO_SLIDES}
        activeSlideIndex={activeHeroSlideIndex}
        onSlideChange={handleHeroSlideChange}
        onSlideSelect={setActiveHeroSlideIndex}
        minHeight={{ xs: 420, md: 500 }}
        fullBleed
        borderRadius={4}
        overlayGradient="linear-gradient(180deg, rgba(15, 45, 75, 0.22) 0%, rgba(15, 45, 75, 0.5) 46%, rgba(15, 45, 75, 0.82) 100%)"
      >
        <Stack
          sx={{
            minHeight: { xs: 420, md: 500 },
            px: { xs: 3, md: 6 },
            py: { xs: 8, md: 9 },
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack spacing={2.25} sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 760 }}>
            <Typography
              sx={{
                color: COLORS.surface,
                fontWeight: 800,
                lineHeight: 1.02,
                fontSize: { xs: '2.3rem', md: '4rem' },
                textWrap: 'balance',
              }}
            >
              {activeHeroSlide.title}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.88)',
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.5,
                maxWidth: 620,
              }}
            >
              {activeHeroSlide.description}
            </Typography>
          </Stack>
        </Stack>
      </HeroCarousel>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Stack spacing={0.8}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', md: '2rem' },
                lineHeight: 1.05,
              }}
            >
              Trending Themes
            </Typography>
          <Typography sx={{ color: COLORS.textLight, fontSize: '1rem' }}>
            The most sought-after concepts this season in Lebanon.
          </Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.8fr 1fr' },
          gap: 2,
        }}
      >
        {featureTheme ? (
          <InspirationThemeCard
            title={featureTheme.title}
            subtitle={featureTheme.subtitle}
            ctaLabel={featureTheme.ctaLabel}
            imageSrc={featureTheme.imageSrc}
            imageAlt={featureTheme.imageAlt}
            large
          />
        ) : null}

        {sideTheme ? (
          <InspirationThemeCard
            title={sideTheme.title}
            ctaLabel={sideTheme.ctaLabel}
            imageSrc={sideTheme.imageSrc}
            imageAlt={sideTheme.imageAlt}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {standardThemes.map((theme) => (
          <InspirationThemeCard
            key={theme.id}
            title={theme.title}
            ctaLabel={theme.ctaLabel}
            imageSrc={theme.imageSrc}
            imageAlt={theme.imageAlt}
          />
        ))}
      </Box>

      <Stack spacing={2.25} sx={{ pt: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Stack spacing={0.7}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: { xs: '1.75rem', md: '1.95rem' },
                lineHeight: 1.05,
              }}
            >
              Top Picks For You
            </Typography>
            <Typography sx={{ color: COLORS.textLight, fontSize: '1rem' }}>
              Curated standouts from each service section. After the third swipe, you will reach a premium upgrade card for more recommendations.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              aria-label="Show previous top picks"
              onClick={handleTopPicksPrevious}
              disabled={topPicksIndex === 0}
              sx={{
                color: topPicksIndex === 0 ? COLORS.textLight : COLORS.primary,
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              aria-label="Show next top picks"
              onClick={handleTopPicksNext}
              disabled={topPicksIndex >= maxTopPicksIndex && rightArrowClickCount > 2}
              sx={{
                color:
                  topPicksIndex >= maxTopPicksIndex && rightArrowClickCount > 2
                    ? COLORS.textLight
                    : COLORS.primary,
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            alignItems: 'stretch',
            gridAutoRows: '1fr',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {topPicksToRender.map((item) => (
            item.isUpgrade ? (
              <PremiumUpgradeCard key={item.id} />
            ) : (
              (() => {
                const serviceId = getServicePayload(item, item.section).serviceId
                const favoriteKey = serviceId ? getFavoriteKey(item.section, serviceId) : item.id

                return (
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
                isFavorite={Boolean(favoriteItems[favoriteKey])}
                onFavoriteToggle={() => handleFavoriteToggle(item)}
                onViewButtonClick={() => navigate(item.targetPath)}
                onCartButtonClick={() => handleAddToCart(item)}
              />
                )
              })()
            )
          ))}
        </Box>
      </Stack>

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

      <NewsletterCTA
        fullBleed
        backgroundImage="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=80"
      />
    </Stack>
  )
}

export default InspirationPage
