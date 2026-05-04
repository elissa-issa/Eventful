import { useEffect, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { INSPIRATION_THEMES } from '../constants/inspirationThemes'
import AlertDialog from '../shared/components/AlertDialog'
import HeroCarousel from '../shared/components/HeroCarousel'
import InspirationThemeCard from '../shared/components/InspirationThemeCard'
import PremiumPlansDialog from '../shared/components/PremiumPlansDialog'
import ServiceCard from '../shared/components/ServiceCard'
import { INSPIRATION_HERO_SLIDES } from '../constants/inspirationHeroSlides'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { useTopPicks } from '../hooks/useTopPicks'
import { generateInspirationPlan } from '../services/aiPlanner'
import { addItemToCollection, createCollection } from '../services/collections'
import { addItemToCustomizedPlan, createCustomizedPlan } from '../services/customizedPlans'
import { useToast } from '../toast/useToast'
import { isPremiumUser as getIsPremiumUser } from '../utils/premium'
import { getServicePayload } from '../utils/servicePayload'

function PremiumUpgradeCard({ onUpgradeClick }) {
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
          onClick={onUpgradeClick}
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
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const { collectionPickerDialog, openCollectionPicker } = useCollectionCartAction()
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'))
  const isSmallUp = useMediaQuery(theme.breakpoints.up('sm'))
  const featureTheme = INSPIRATION_THEMES.find((theme) => theme.layout === 'feature')
  const sideTheme = INSPIRATION_THEMES.find((theme) => theme.layout === 'side')
  const standardThemes = INSPIRATION_THEMES.filter((theme) => theme.layout === 'standard')
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)
  const [isPlansDialogOpen, setIsPlansDialogOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [aiMessage, setAiMessage] = useState('')
  const [aiMessageError, setAiMessageError] = useState('')
  const [aiPlan, setAiPlan] = useState(null)
  const [aiPlanError, setAiPlanError] = useState('')
  const [isGeneratingAiPlan, setIsGeneratingAiPlan] = useState(false)
  const [isSavingAiPlan, setIsSavingAiPlan] = useState(false)
  const [isAddingAiCollection, setIsAddingAiCollection] = useState(false)
  const isPremiumUser = getIsPremiumUser(user)
  const visibleTopPicks = isLargeUp ? 3 : isSmallUp ? 2 : 1
  const {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  } = useTopPicks(visibleTopPicks, !isPremiumUser)

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

  const handleOpenPremiumDialog = () => {
    setIsPremiumDialogOpen(true)
  }

  const handleClosePremiumDialog = () => {
    setIsPremiumDialogOpen(false)
  }

  const handleExploreTheme = (theme) => {
    if (!isPremiumUser) {
      handleOpenPremiumDialog()
      return
    }

    setSelectedTheme(theme)
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

  const handleAddToCart = (event, item) => {
    const payload = getServicePayload(item, item.section)

    if (!payload.serviceId) {
      return
    }

    handleProtectedAction(async () => {
      openCollectionPicker(event, item, item.section)
    })
  }

  const getAiItemPayload = (item) => ({
    section: item.serviceType,
    itemId: item.itemId,
    quantity: 1,
  })

  const handleGenerateAiPlan = async () => {
    const trimmedMessage = aiMessage.trim()

    if (!trimmedMessage) {
      setAiMessageError('Tell us what you want for your event.')
      return
    }

    setAiMessageError('')
    setAiPlanError('')
    setIsGeneratingAiPlan(true)

    try {
      const result = await generateInspirationPlan(trimmedMessage)
      const plan = result.data

      if (!plan?.recommendedItems?.length) {
        setAiPlan(null)
        setAiPlanError("We couldn't find enough matching services. Try adding more details.")
        return
      }

      setAiPlan(plan)
    } catch (error) {
      const message = error.message || ''
      setAiPlanError(
        message.includes('No matching') || message.includes('not found')
          ? "We couldn't find enough matching services. Try adding more details."
          : message || 'Could not create an AI plan right now.',
      )
    } finally {
      setIsGeneratingAiPlan(false)
    }
  }

  const handleSaveAiPlan = async () => {
    if (!aiPlan?.recommendedItems?.length) {
      return
    }

    setIsSavingAiPlan(true)

    try {
      const createdPlan = await createCustomizedPlan({
        name: aiPlan.title,
        description: aiPlan.summary,
      })
      const planId = createdPlan.data?.id

      await Promise.all(
        aiPlan.recommendedItems.map((item) =>
          addItemToCustomizedPlan(planId, getAiItemPayload(item)),
        ),
      )

      showToast('AI plan saved as a customized plan')
      navigate(`/customize?planId=${planId}`)
    } catch (error) {
      showToast(error.message || 'Could not save AI plan', 'error')
    } finally {
      setIsSavingAiPlan(false)
    }
  }

  const handleAddAiItemsToCollection = async () => {
    if (!aiPlan?.recommendedItems?.length) {
      return
    }

    setIsAddingAiCollection(true)

    try {
      const createdCollection = await createCollection({
        name: aiPlan.title,
        description: aiPlan.summary,
      })
      const collectionId = createdCollection.data?.id

      await Promise.all(
        aiPlan.recommendedItems.map((item) =>
          addItemToCollection(collectionId, getAiItemPayload(item)),
        ),
      )

      showToast('AI plan items added to a collection')
      navigate('/collections')
    } catch (error) {
      showToast(error.message || 'Could not add AI items to a collection', 'error')
    } finally {
      setIsAddingAiCollection(false)
    }
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

  useEffect(() => {
    if (location.hash !== '#ai-planner') {
      return
    }

    window.setTimeout(() => {
      document.getElementById('ai-planner')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 0)
  }, [location.hash])

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
            onCtaClick={() => handleExploreTheme(featureTheme)}
          />
        ) : null}

        {sideTheme ? (
          <InspirationThemeCard
            title={sideTheme.title}
            ctaLabel={sideTheme.ctaLabel}
            imageSrc={sideTheme.imageSrc}
            imageAlt={sideTheme.imageAlt}
            onCtaClick={() => handleExploreTheme(sideTheme)}
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
            onCtaClick={() => handleExploreTheme(theme)}
          />
        ))}
      </Box>

      <Box
        id="ai-planner"
        sx={{
          borderRadius: 3,
          border: `1px solid ${COLORS.borderStrong}`,
          backgroundColor: COLORS.surface,
          p: { xs: 2.2, md: 3 },
          boxShadow: '0 18px 34px rgba(15, 45, 75, 0.06)',
        }}
      >
        {isPremiumUser ? (
          <Stack spacing={2.2}>
            <Stack spacing={0.65}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.8rem' }}>
                AI Event Planner
              </Typography>
              <Typography sx={{ color: COLORS.textLight, fontSize: '1rem' }}>
                Tell us what you want, and we&apos;ll build a plan using Eventful services.
              </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.4} alignItems="flex-start">
              <Box sx={{ flex: 1, width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={aiMessage}
                  onChange={(event) => {
                    setAiMessage(event.target.value)
                    if (event.target.value.trim()) {
                      setAiMessageError('')
                    }
                  }}
                  placeholder="Example: I want a birthday with floral decorations, beach venue, burgers, and live music."
                  error={Boolean(aiMessageError)}
                  helperText={aiMessageError}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={handleGenerateAiPlan}
                disabled={isGeneratingAiPlan}
                sx={{
                  minWidth: { xs: '100%', md: 170 },
                  borderRadius: 999,
                  py: 1.15,
                  textTransform: 'none',
                  fontWeight: 800,
                  backgroundColor: COLORS.accent,
                  '&:hover': { backgroundColor: COLORS.accentHover },
                }}
              >
                {isGeneratingAiPlan ? 'Creating your plan...' : 'Generate Plan'}
              </Button>
            </Stack>

            {aiPlanError ? (
              <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>{aiPlanError}</Typography>
            ) : null}

            {aiPlan ? (
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, fontSize: '1.35rem' }}>
                    {aiPlan.title}
                  </Typography>
                  <Typography sx={{ color: COLORS.textMuted, lineHeight: 1.5, mt: 0.4 }}>
                    {aiPlan.summary}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                  }}
                >
                  {aiPlan.recommendedItems.map((item) => (
                    <Box
                      key={`${item.serviceType}:${item.itemId}`}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${COLORS.border}`,
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                      }}
                    >
                      {item.service?.imageSrc ? (
                        <Box
                          component="img"
                          src={item.service.imageSrc}
                          alt={item.service.imageAlt || item.service.title}
                          sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }}
                        />
                      ) : null}
                      <Stack spacing={0.6} sx={{ p: 1.5 }}>
                        <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800 }}>
                          {item.service?.title || item.itemId}
                        </Typography>
                        <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.86rem' }}>
                          {item.serviceType}
                        </Typography>
                        <Typography sx={{ color: COLORS.textMuted, lineHeight: 1.45 }}>
                          {item.reason}
                        </Typography>
                        <Typography sx={{ color: COLORS.accent, fontWeight: 800 }}>
                          {item.service?.priceText || `$${Number(item.service?.priceValue || 0).toFixed(2)}`}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Box>

                <Stack spacing={0.8}>
                  <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800 }}>
                    Estimated total: ${Number(aiPlan.estimatedTotal || 0).toFixed(2)}
                  </Typography>
                  {aiPlan.planningTips?.length ? (
                    <Stack spacing={0.45}>
                      <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800 }}>
                        Planning tips
                      </Typography>
                      {aiPlan.planningTips.map((tip) => (
                        <Typography key={tip} sx={{ color: COLORS.textMuted }}>
                          - {tip}
                        </Typography>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  <Button
                    variant="contained"
                    onClick={handleSaveAiPlan}
                    disabled={isSavingAiPlan || isAddingAiCollection}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 800,
                      backgroundColor: COLORS.accent,
                      '&:hover': { backgroundColor: COLORS.accentHover },
                    }}
                  >
                    {isSavingAiPlan ? 'Saving...' : 'Save as Customized Plan'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddAiItemsToCollection}
                    disabled={isSavingAiPlan || isAddingAiCollection}
                    sx={{
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 800,
                      backgroundColor: COLORS.primary,
                      '&:hover': { backgroundColor: COLORS.primaryHover },
                    }}
                  >
                    {isAddingAiCollection ? 'Adding...' : 'Add Items to Collection'}
                  </Button>
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <Stack spacing={0.6} sx={{ flex: 1 }}>
              <Typography sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '1.8rem' }}>
                AI Event Planner
              </Typography>
              <Typography sx={{ color: COLORS.textLight }}>
                Upgrade to Premium to generate plans from Eventful services with AI.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={handleOpenPremiumDialog}
              sx={{
                borderRadius: 999,
                px: 2.4,
                py: 1.05,
                textTransform: 'none',
                fontWeight: 800,
                backgroundColor: COLORS.accent,
                '&:hover': { backgroundColor: COLORS.accentHover },
              }}
            >
              Upgrade to Premium
            </Button>
          </Stack>
        )}
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
              <PremiumUpgradeCard key={item.id} onUpgradeClick={handleOpenPremiumDialog} />
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
                onCartButtonClick={(event) => handleAddToCart(event, item)}
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

      <AlertDialog
        open={isPremiumDialogOpen}
        onClose={handleClosePremiumDialog}
        icon={<WorkspacePremiumRoundedIcon />}
        iconBackgroundColor="rgba(234, 122, 36, 0.14)"
        iconColor={COLORS.accent}
        title="Upgrade to Premium"
        titleColor={COLORS.primaryDark}
        description="Exploring curated inspiration boards is available on the premium plan. Upgrade to unlock more event ideas and recommendations."
        primaryButtonText="Upgrade Now"
        primaryButtonColor={COLORS.accent}
        onPrimaryButtonClick={() => {
          handleClosePremiumDialog()
          setIsPlansDialogOpen(true)
        }}
        secondaryActionText="Maybe later"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={handleClosePremiumDialog}
      />

      <PremiumPlansDialog
        open={isPlansDialogOpen}
        onClose={() => setIsPlansDialogOpen(false)}
      />

      <Dialog
        open={Boolean(selectedTheme)}
        onClose={() => setSelectedTheme(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
          },
        }}
      >
        {selectedTheme ? (
          <DialogContent sx={{ p: 0 }}>
            <Box
              component="img"
              src={selectedTheme.imageSrc}
              alt={selectedTheme.imageAlt}
              sx={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
            />
            <Stack spacing={1.2} sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, fontSize: '1.55rem' }}>
                {selectedTheme.title}
              </Typography>
              <Typography sx={{ color: COLORS.textMuted, fontWeight: 600, lineHeight: 1.5 }}>
                Premium inspiration board unlocked. Use this theme as a starting point for your
                next Eventful plan.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedTheme(null)
                  navigate('/customize')
                }}
                sx={{
                  alignSelf: 'flex-start',
                  mt: 0.8,
                  borderRadius: 999,
                  px: 2.25,
                  textTransform: 'none',
                  fontWeight: 800,
                  backgroundColor: COLORS.accent,
                  '&:hover': { backgroundColor: COLORS.accentHover },
                }}
              >
                Start Planning
              </Button>
            </Stack>
          </DialogContent>
        ) : null}
      </Dialog>

      {collectionPickerDialog}
    </Stack>
  )
}

export default InspirationPage
