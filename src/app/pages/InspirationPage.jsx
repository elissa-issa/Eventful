import { useEffect, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import {
  Box,
  Button,
  Chip,
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
import AlertDialog from '../shared/components/AlertDialog'
import HeroCarousel from '../shared/components/HeroCarousel'
import PremiumPlansDialog from '../shared/components/PremiumPlansDialog'
import ServiceCard from '../shared/components/ServiceCard'
import { INSPIRATION_HERO_SLIDES } from '../constants/inspirationHeroSlides'
import { useFavoriteActions, getFavoriteKey } from '../hooks/useFavoriteActions'
import { useCollectionCartAction } from '../hooks/useCollectionCartAction'
import { useServicesData } from '../hooks/useServicesData'
import { useTopPicks } from '../hooks/useTopPicks'
import { generateInspirationPlan } from '../services/aiPlanner'
import { addItemToCollection, createCollection } from '../services/collections'
import { addItemToCustomizedPlan, createCustomizedPlan } from '../services/customizedPlans'
import { useToast } from '../toast/useToast'
import { isPremiumUser as getIsPremiumUser } from '../utils/premium'
import { getServicePayload } from '../utils/servicePayload'
import { getServiceItemRoute } from '../utils/serviceRoutes'

const AI_PLANNER_STORAGE_KEY = 'eventful.aiPlanner.lastResult'

const PLANNER_STOP_WORDS = new Set([
  'i',
  'me',
  'my',
  'we',
  'us',
  'our',
  'want',
  'need',
  'would',
  'like',
  'looking',
  'for',
  'with',
  'and',
  'or',
  'a',
  'an',
  'the',
  'to',
  'of',
  'in',
  'on',
  'at',
  'by',
  'from',
  'as',
  'is',
  'are',
  'be',
  'have',
  'has',
  'had',
  'event',
  'events',
  'party',
  'parties',
  'please',
  'plan',
  'planning',
  'make',
  'create',
  'organize',
  'that',
  'this',
  'it',
  'some',
  'any',
  'also',
])

const PLANNER_KEYWORD_ALIASES = {
  seafront: ['seaside', 'sea view', 'sea-facing', 'beach', 'waterfront', 'ocean view'],
  seaview: ['sea view', 'sea-facing', 'seaside', 'beachfront', 'beach', 'waterfront', 'ocean view'],
  beach: ['seaside', 'sea view', 'sea-facing', 'waterfront'],
  'beach venue': ['seaside', 'sea view', 'sea-facing', 'waterfront'],
  candles: ['candle', 'candle set'],
  candle: ['candles', 'candle set'],
  flowers: ['flower', 'floral', 'floral decoration'],
  'flower decoration': ['flowers', 'floral', 'floral decoration'],
  floral: ['flower', 'flowers', 'flowers greenery'],
  pianist: ['piano', 'live piano', 'music', 'musician'],
  'birthday cake': ['cake', 'chocolate cake'],
  venue: ['venues', 'location', 'place'],
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeKeywordToken(token) {
  if (token.length > 4 && token.endsWith('ies')) {
    return `${token.slice(0, -3)}y`
  }

  if (token.length > 3 && token.endsWith('s')) {
    return token.slice(0, -1)
  }

  return token
}

function tokenizePlannerText(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token && !PLANNER_STOP_WORDS.has(token) && token.length > 1)
}

function toSearchTokens(value) {
  return normalizeText(value)
    .split(' ')
    .filter(Boolean)
    .map(normalizeKeywordToken)
}

function buildSearchableServiceText(item = {}, section = item.serviceType) {
  return [
    item.title,
    item.category,
    item.serviceType || section,
    item.description,
    item.detailsDescription,
    item.location,
    item.vendorLocation,
    item.vendorName,
    item.detailBadgeText,
    item.placement,
    item.priceText,
    item.guestText,
    Array.isArray(item.tags) ? item.tags.join(' ') : item.tags,
  ]
    .filter(Boolean)
    .join(' ')
}

function createSearchEntry(searchableValue) {
  const searchableText = normalizeText(searchableValue)

  return {
    searchableText,
    tokenSet: new Set(toSearchTokens(searchableText)),
  }
}

function getAllServiceEntries(itemsBySection = {}) {
  return Object.entries(itemsBySection).flatMap(([section, items = []]) =>
    items.map((item) => ({
      item,
      section,
      itemId: item.id || item.itemId,
      serviceType: item.serviceType || section,
      ...createSearchEntry(buildSearchableServiceText(item, section)),
    })),
  )
}

function expandKeywordWithSynonyms(keyword) {
  const normalizedKeyword = normalizeText(keyword)
  const aliasMatches = PLANNER_KEYWORD_ALIASES[normalizedKeyword] || []

  return [normalizedKeyword, ...aliasMatches].map(normalizeText).filter(Boolean)
}

function keywordMatchesText(keyword, searchEntry) {
  return expandKeywordWithSynonyms(keyword).some((phrase) => {
    const phraseTokens = toSearchTokens(phrase)

    return (
      searchEntry.searchableText.includes(phrase) ||
      (phraseTokens.length > 0 && phraseTokens.every((token) => searchEntry.tokenSet.has(token)))
    )
  })
}

function getKeywordAvailability(keyword, searchEntries) {
  return searchEntries.some((entry) => keywordMatchesText(keyword, entry))
}

function extractPlannerKeywords(message, searchEntries = []) {
  const tokens = tokenizePlannerText(message)
  const keywordLabels = []
  const usedTokenIndexes = new Set()

  tokens.forEach((_, index) => {
    if (usedTokenIndexes.has(index)) {
      return
    }

    for (let size = Math.min(4, tokens.length - index); size > 1; size -= 1) {
      const phrase = tokens.slice(index, index + size).join(' ')

      if (
        PLANNER_KEYWORD_ALIASES[phrase] ||
        (searchEntries.length > 0 && getKeywordAvailability(phrase, searchEntries))
      ) {
        keywordLabels.push(phrase)
        for (let offset = 0; offset < size; offset += 1) {
          usedTokenIndexes.add(index + offset)
        }
        return
      }
    }
  })

  tokens.forEach((token, index) => {
    if (!usedTokenIndexes.has(index)) {
      keywordLabels.push(token)
    }
  })

  return Array.from(new Set(keywordLabels)).slice(0, 12)
}

function resolveRecommendedService(recommendedItem, serviceEntries) {
  const serviceType = recommendedItem.serviceType
  const itemId = recommendedItem.itemId
  const matchedEntry = serviceEntries.find(
    (entry) =>
      entry.serviceType === serviceType &&
      (entry.itemId === itemId || entry.item?.itemId === itemId || entry.item?.id === itemId),
  )

  return matchedEntry?.item || recommendedItem.service || null
}

function getRecommendedSearchEntries(generatedPlan, serviceEntries) {
  if (!generatedPlan?.recommendedItems?.length) {
    return []
  }

  return generatedPlan.recommendedItems.map((recommendedItem) => {
    const resolvedService = resolveRecommendedService(recommendedItem, serviceEntries)
    const searchableText = [
      buildSearchableServiceText(
        {
          ...(resolvedService || {}),
          ...(recommendedItem.service || {}),
          serviceType: recommendedItem.serviceType,
        },
        recommendedItem.serviceType,
      ),
      recommendedItem.reason,
    ].join(' ')

    return createSearchEntry(searchableText)
  })
}

function getKeywordChipsAfterPlan(prompt, generatedPlan, itemsBySection = {}) {
  const serviceEntries = getAllServiceEntries(itemsBySection)
  const recommendedEntries = getRecommendedSearchEntries(generatedPlan, serviceEntries)
  const matchingEntries = [...recommendedEntries, ...serviceEntries]
  const keywords = extractPlannerKeywords(prompt, matchingEntries)

  return keywords.map((label) => ({
    label,
    isAvailable: getKeywordAvailability(label, matchingEntries),
  }))
}

function saveAiPlannerResult({ prompt, generatedPlan, keywordChips }) {
  if (!prompt || !generatedPlan) {
    return
  }

  try {
    window.sessionStorage.setItem(
      AI_PLANNER_STORAGE_KEY,
      JSON.stringify({
        prompt,
        generatedPlan,
        keywordChips,
        recommendedItems: generatedPlan.recommendedItems || [],
        createdAt: Date.now(),
      }),
    )
  } catch {
    // Session storage is a convenience for route restoration; planning still works without it.
  }
}

function loadAiPlannerResult() {
  try {
    const storedValue = window.sessionStorage.getItem(AI_PLANNER_STORAGE_KEY)

    if (!storedValue) {
      return null
    }

    const parsedValue = JSON.parse(storedValue)

    if (!parsedValue?.prompt || !parsedValue?.generatedPlan) {
      return null
    }

    return parsedValue
  } catch {
    return null
  }
}

function findServiceFromPlanItem(planItem, itemsBySection = {}) {
  const section = planItem.serviceType
  const itemId = planItem.itemId
  const sectionItems = itemsBySection[section] || []

  return (
    sectionItems.find((item) => item.routeId === itemId || item.itemId === itemId || item.id === itemId) ||
    planItem.service ||
    null
  )
}

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
  const { itemsBySection } = useServicesData()
  const isLargeUp = useMediaQuery(theme.breakpoints.up('lg'))
  const isSmallUp = useMediaQuery(theme.breakpoints.up('sm'))
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)
  const [isPlansDialogOpen, setIsPlansDialogOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiMessageError, setAiMessageError] = useState('')
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [plannerKeywordChips, setPlannerKeywordChips] = useState([])
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

  const handleAiRecommendedItemClick = (item) => {
    const service = findServiceFromPlanItem(item, itemsBySection)
    const detailPath = getServiceItemRoute(
      {
        ...(service || {}),
        routeId: service?.routeId || item.itemId,
        itemId: service?.itemId || item.itemId,
        serviceType: item.serviceType,
      },
      item.serviceType,
    )

    if (detailPath) {
      saveAiPlannerResult({
        prompt: submittedPrompt || aiMessage.trim(),
        generatedPlan: aiPlan,
        keywordChips: plannerKeywordChips,
      })
      navigate(detailPath, {
        state: {
          returnTo: '/inspiration#ai-planner',
        },
      })
    }
  }

  const handleGenerateAiPlan = async () => {
    const trimmedMessage = aiMessage.trim()

    if (!trimmedMessage) {
      setAiMessageError('Tell us what you want for your event.')
      return
    }

    setAiMessageError('')
    setAiPlanError('')
    setSubmittedPrompt(trimmedMessage)
    setPlannerKeywordChips([])
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
      const keywordChips = getKeywordChipsAfterPlan(trimmedMessage, plan, itemsBySection)
      setPlannerKeywordChips(keywordChips)
      saveAiPlannerResult({
        prompt: trimmedMessage,
        generatedPlan: plan,
        keywordChips,
      })
    } catch (error) {
      const message = error.message || ''
      setPlannerKeywordChips([])
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
    const savedResult = loadAiPlannerResult()

    if (!savedResult) {
      return
    }

    setAiMessage(savedResult.prompt)
    setSubmittedPrompt(savedResult.prompt)
    setAiPlan(savedResult.generatedPlan)
    setPlannerKeywordChips(savedResult.keywordChips || [])
  }, [])

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
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ flexWrap: 'wrap' }}
              >
                <Typography
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    fontSize: '1.8rem',
                    lineHeight: 1.15,
                    mr: { sm: 0.5 },
                  }}
                >
                  AI Event Planner
                </Typography>

                {plannerKeywordChips.length ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.75,
                      minWidth: 0,
                    }}
                  >
                    {plannerKeywordChips.map(({ label, isAvailable }) => (
                      <Chip
                        key={`${submittedPrompt}-${label}-${isAvailable ? 'available' : 'missing'}`}
                        label={label}
                        size="small"
                        sx={{
                          bgcolor: isAvailable ? 'success.main' : 'error.main',
                          borderColor: isAvailable ? 'success.main' : 'error.main',
                          borderRadius: 999,
                          color: '#fff',
                          fontWeight: 600,
                          '& .MuiChip-label': {
                            color: '#fff',
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : null}
              </Stack>
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
                    setSubmittedPrompt('')
                    setPlannerKeywordChips([])
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
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAiRecommendedItemClick(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleAiRecommendedItemClick(item)
                        }
                      }}
                      sx={{
                        borderRadius: 2,
                        border: `1px solid ${COLORS.border}`,
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                        '&:hover': {
                          borderColor: COLORS.primary,
                          boxShadow: '0 14px 28px rgba(15, 45, 75, 0.12)',
                          transform: 'translateY(-2px)',
                        },
                        '&:focus-visible': {
                          outline: `3px solid ${COLORS.primary}`,
                          outlineOffset: 3,
                        },
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

      {collectionPickerDialog}
    </Stack>
  )
}

export default InspirationPage
