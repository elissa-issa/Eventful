import { useCallback, useEffect, useMemo, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { useTopPicks } from '../hooks/useTopPicks'
import { getFavoriteKey, useFavoriteActions } from '../hooks/useFavoriteActions'
import { useToast } from '../toast/useToast'
import { createCartFromPlan } from '../services/cart'
import { isPremiumUser as getIsPremiumUser } from '../utils/premium'
import {
  createCustomizedPlan,
  deleteCustomizedPlan,
  getCustomizedPlan,
  getCustomizedPlans,
  removeItemFromCustomizedPlan,
  updateCustomizedPlan,
} from '../services/customizedPlans'
import AlertDialog from '../shared/components/AlertDialog'
import CartItemRow from '../shared/components/CartItemRow'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'
import PremiumPlansDialog from '../shared/components/PremiumPlansDialog'

const PLAN_SECTION_CONFIG = [
  { id: 'venues', title: 'Venues' },
  { id: 'menus', title: 'Menus' },
  { id: 'decorations', title: 'Decoration' },
  { id: 'entertainment', title: 'Entertainment' },
]

function formatPlanItemDetails(item) {
  const details = []
  const selectedOptions = item.selectedOptions || {}

  if (selectedOptions.selectedDate) {
    const startDateText = new Date(selectedOptions.selectedDate).toLocaleDateString()
    const endDateText = selectedOptions.selectedEndDate
      ? new Date(selectedOptions.selectedEndDate).toLocaleDateString()
      : ''

    details.push(endDateText ? `Dates: ${startDateText} - ${endDateText}` : `Date: ${startDateText}`)
  }

  if (selectedOptions.selectedTime) {
    details.push(`Time: ${selectedOptions.selectedTime}`)
  }

  details.push(`Quantity: ${item.quantity || 1}`)

  return details
}

function getPlanItemPrice(item) {
  const priceValue = item.pricingSnapshot?.priceValue ?? item.service?.priceValue
  const quantity = item.section === 'venues' ? 1 : item.quantity || 1
  const selectedOptions = item.selectedOptions || {}
  const startDate = selectedOptions.selectedDate ? new Date(selectedOptions.selectedDate) : null
  const endDate = selectedOptions.selectedEndDate ? new Date(selectedOptions.selectedEndDate) : startDate
  const dayCount =
    (item.section === 'venues' || item.section === 'entertainment') &&
    startDate &&
    endDate &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate >= startDate
      ? Math.round((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1
      : 1

  if (Number.isFinite(Number(priceValue))) {
    return `$${Number(priceValue) * quantity * dayCount}`
  }

  return item.priceTextSnapshot || item.service?.priceText || ''
}

function PlanSection({
  section,
  collapsed,
  onToggle,
  onAddNew,
  onModify,
  onFavorite,
  onDelete,
  isItemFavorite,
}) {
  return (
    <Stack spacing={1.05}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={0.6} alignItems="baseline">
          <Typography
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '1.25rem', md: '1.35rem' },
              lineHeight: 1,
            }}
          >
            {section.title}
          </Typography>
          <Button
            onClick={onAddNew}
            sx={{
              minWidth: 0,
              p: 0,
              color: COLORS.accent,
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
            }}
          >
            + add new
          </Button>
        </Stack>

        <Button
          onClick={onToggle}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${section.title}`}
          sx={{
            minWidth: 0,
            p: 0,
            color: COLORS.primary,
            fontSize: '1.9rem',
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {collapsed ? '+' : '-'}
        </Button>
      </Stack>

      {!collapsed && section.items.length === 0 ? (
        <Typography sx={{ color: COLORS.textLight, fontSize: '0.9rem', fontWeight: 600 }}>
          No items added yet.
        </Typography>
      ) : null}

      {!collapsed
        ? section.items.map((item) => (
            <CartItemRow
              key={item.id}
              showCheckbox={false}
              imageSrc={item.service?.imageSrc || item.imageSnapshot}
              imageAlt={item.service?.imageAlt || item.titleSnapshot}
              imageSx={{
                width: { xs: '100%', sm: 130 },
                maxWidth: { xs: 220, sm: 130 },
                height: { xs: 140, sm: 120 },
              }}
              title={item.service?.title || item.titleSnapshot}
              details={formatPlanItemDetails(item)}
              price={getPlanItemPrice(item)}
              modifyLabel="Modify"
              isFavorite={isItemFavorite(item)}
              onModify={() => onModify(item)}
              onFavorite={() => onFavorite(item)}
              onDelete={() => onDelete(item)}
            />
          ))
        : null}
    </Stack>
  )
}

function TopPickTile({ item, onClick }) {
  if (item.isUpgrade) {
    return (
      <Box
        component="button"
        type="button"
        onClick={onClick}
        sx={{
          width: '100%',
          minHeight: 172,
          border: 0,
          borderRadius: 2,
          backgroundColor: COLORS.primarySoft,
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          px: 2,
          textAlign: 'center',
          font: 'inherit',
          '&:hover': {
            backgroundColor: 'rgba(43, 120, 204, 0.14)',
          },
          '&:focus-visible': {
            outline: `3px solid ${COLORS.accent}`,
            outlineOffset: 3,
          },
        }}
      >
        <Typography sx={{ color: COLORS.primary, fontWeight: 800 }}>
          Upgrade to view more
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        p: 0,
        border: 0,
        background: 'transparent',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <Box
        component="img"
        src={item.imageSrc}
        alt={item.imageAlt}
        sx={{
          width: '100%',
          aspectRatio: '1 / 1.04',
          objectFit: 'cover',
          display: 'block',
          borderRadius: 2,
          backgroundColor: COLORS.border,
        }}
      />
      <Typography
        sx={{
          mt: 1,
          color: COLORS.primary,
          fontWeight: 800,
          fontSize: { xs: '0.95rem', md: '1rem' },
          lineHeight: 1.1,
          textTransform: 'capitalize',
        }}
      >
        {item.title?.toLowerCase()}
      </Typography>
    </Box>
  )
}

function CreatePlanView({ plan, onChooseTemplate, onBackToPlans, onRefreshPlan, onRenamePlan }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { favoriteItems, toggleFavoriteItem } = useFavoriteActions()
  const [collapsedSections, setCollapsedSections] = useState({})
  const [isRenaming, setIsRenaming] = useState(false)
  const [planName, setPlanName] = useState(plan?.name || '')
  const [isSavingName, setIsSavingName] = useState(false)
  const [pendingRemoveItem, setPendingRemoveItem] = useState(null)
  const [isRemovingItem, setIsRemovingItem] = useState(false)
  const [isCreatingCart, setIsCreatingCart] = useState(false)
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false)
  const [isPlansDialogOpen, setIsPlansDialogOpen] = useState(false)
  const isPremiumUser = getIsPremiumUser(user)
  const {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  } = useTopPicks(4, !isPremiumUser)

  const sections = useMemo(
    () =>
      PLAN_SECTION_CONFIG.map((section) => ({
        ...section,
        items: (plan?.items || []).filter((item) => item.section === section.id),
      })),
    [plan],
  )

  useEffect(() => {
    setPlanName(plan?.name || '')
  }, [plan?.name])

  const handleFavoriteItem = async (item) => {
    const serviceId = item.service?.mongoId

    if (!serviceId) {
      showToast('Could not update this favorite', 'error')
      return
    }

    try {
      const isFavorite = await toggleFavoriteItem({
        serviceId,
        serviceType: item.section,
      })
      showToast(isFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      showToast(error.message || 'Could not update favorite', 'error')
    }
  }

  const isPlanItemFavorite = (item) => {
    const serviceId = item.service?.mongoId

    return serviceId ? Boolean(favoriteItems[getFavoriteKey(item.section, serviceId)]) : false
  }

  const handleConfirmRemoveItem = async () => {
    if (!pendingRemoveItem || isRemovingItem) {
      return
    }

    setIsRemovingItem(true)
    try {
      await removeItemFromCustomizedPlan(
        plan.id,
        pendingRemoveItem.section,
        pendingRemoveItem.itemId,
      )
      showToast('Item removed from plan')
      setPendingRemoveItem(null)
      await onRefreshPlan()
    } catch (error) {
      showToast(error.message || 'Could not remove item', 'error')
    } finally {
      setIsRemovingItem(false)
    }
  }

  const navigateToService = (section, itemId) => {
    navigate(`/services/${section}/${itemId}?planId=${plan.id}`)
  }

  const handleSaveName = async () => {
    const nextName = planName.trim()

    if (!nextName) {
      showToast('Plan name is required', 'error')
      return
    }

    setIsSavingName(true)
    try {
      await onRenamePlan(nextName)
      setIsRenaming(false)
    } finally {
      setIsSavingName(false)
    }
  }

  const handleGoToCheckout = async () => {
    if (!plan?.items?.length || isCreatingCart) {
      return
    }

    setIsCreatingCart(true)
    try {
      await createCartFromPlan(plan.id)
      showToast('Plan copied to cart')
      navigate('/cart')
    } catch (error) {
      showToast(error.message || 'Could not prepare checkout', 'error')
    } finally {
      setIsCreatingCart(false)
    }
  }

  return (
    <>
    <Stack spacing={2.2} sx={{ py: { xs: 3, md: 2.5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack spacing={0.35}>
          <Button
            onClick={onBackToPlans}
            sx={{
              alignSelf: 'flex-start',
              minWidth: 0,
              p: 0,
              color: COLORS.textLight,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Back to plans
          </Button>
          {isRenaming ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <TextField
                size="small"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                autoFocus
                inputProps={{ maxLength: 80 }}
                sx={{
                  minWidth: { xs: '100%', sm: 280 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    backgroundColor: COLORS.surface,
                  },
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  disabled={isSavingName}
                  onClick={handleSaveName}
                  sx={{
                    backgroundColor: COLORS.primary,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: COLORS.primaryHover },
                  }}
                >
                  {isSavingName ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  disabled={isSavingName}
                  onClick={() => {
                    setPlanName(plan?.name || '')
                    setIsRenaming(false)
                  }}
                  sx={{ color: COLORS.textLight, textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
              <Typography
                sx={{
                  color: COLORS.primary,
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.15rem' },
                  lineHeight: 1.05,
                }}
              >
                {plan?.name || 'Create Plan'}
              </Typography>
              {/* <Button
                onClick={() => setIsRenaming(true)}
                sx={{
                  minWidth: 0,
                  p: 0,
                  color: COLORS.accent,
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Rename
              </Button>  */}
            </Stack>
          )}
        </Stack>

        <Button
          variant="contained"
          onClick={onChooseTemplate}
          sx={{
            borderRadius: 1,
            backgroundColor: COLORS.accent,
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 800,
            px: 2.3,
            '&:hover': { backgroundColor: COLORS.accentHover, boxShadow: 'none' },
          }}
        >
          Choose Template
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.5fr) minmax(340px, 1fr)' },
          gap: { xs: 2.5, lg: 4 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              border: `2px solid ${COLORS.primary}`,
              borderRadius: 1,
              px: { xs: 2, md: 4 },
              py: { xs: 2.2, md: 2.8 },
            }}
          >
            <Stack spacing={1.45}>
              {sections.map((section) => (
                <PlanSection
                  key={section.id}
                  section={section}
                  collapsed={Boolean(collapsedSections[section.id])}
                  onToggle={() =>
                    setCollapsedSections((current) => ({
                      ...current,
                      [section.id]: !current[section.id],
                    }))
                  }
                  onAddNew={() => navigate(`/services?planId=${plan.id}#${section.id}`)}
                onModify={(item) => navigateToService(item.section, item.itemId)}
                onFavorite={handleFavoriteItem}
                onDelete={setPendingRemoveItem}
                isItemFavorite={isPlanItemFavorite}
              />
              ))}
            </Stack>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent={{ xs: 'stretch', md: 'center' }}
          >
            <Button
              variant="contained"
              onClick={onBackToPlans}
              sx={{
                minWidth: { sm: 210 },
                borderRadius: 999,
                backgroundColor: COLORS.accent,
                boxShadow: 'none',
                color: COLORS.surface,
                fontSize: '1.05rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                '&:hover': { backgroundColor: COLORS.accentHover, boxShadow: 'none' },
              }}
            >
              Save Plan
            </Button>
            <Button
              variant="contained"
              disabled={!plan?.items?.length || isCreatingCart}
              onClick={handleGoToCheckout}
              sx={{
                minWidth: { sm: 210 },
                borderRadius: 999,
                backgroundColor: COLORS.primary,
                boxShadow: 'none',
                color: COLORS.surface,
                fontSize: '1.05rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                '&:hover': { backgroundColor: COLORS.primaryHover, boxShadow: 'none' },
                '&.Mui-disabled': {
                  backgroundColor: COLORS.border,
                  color: COLORS.textLight,
                },
              }}
            >
              {isCreatingCart ? 'Preparing...' : 'Go To Checkout'}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 1,
            px: { xs: 2, md: 2.2 },
            py: { xs: 2, md: 2.2 },
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography
                sx={{
                  color: COLORS.primary,
                  fontWeight: 800,
                  fontSize: { xs: '1.35rem', md: '1.45rem' },
                  lineHeight: 1,
                }}
              >
                Top Picks For You
              </Typography>

              <Stack direction="row" spacing={2}>
                <IconButton
                  aria-label="Show previous top picks"
                  onClick={handleTopPicksPrevious}
                  disabled={topPicksIndex === 0}
                  sx={{ color: topPicksIndex === 0 ? COLORS.textLight : COLORS.primary, p: 0.4 }}
                >
                  <ArrowBackIosNewRoundedIcon />
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
                    p: 0.4,
                  }}
                >
                  <ArrowForwardIosRoundedIcon />
                </IconButton>
              </Stack>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: { xs: 2, md: 2.25 },
              }}
            >
              {topPicksToRender.map((item) => (
                <TopPickTile
                  key={item.id}
                  item={item}
                  onClick={() => {
                    if (item.isUpgrade) {
                      setIsPremiumDialogOpen(true)
                      return
                    }

                    if (item.targetPath) {
                      const params = new URLSearchParams({ planId: plan.id })

                      navigate(`${item.targetPath}?${params.toString()}`)
                    }
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Box>
      </Box>

    </Stack>
    <AlertDialog
      open={Boolean(pendingRemoveItem)}
      onClose={() => {
        if (!isRemovingItem) {
          setPendingRemoveItem(null)
        }
      }}
      title="Remove item?"
      titleColor={COLORS.primary}
      description="Are you sure u want to remove this item?"
      primaryButtonText={isRemovingItem ? 'Removing...' : 'Remove'}
      primaryButtonColor="#f44336"
      onPrimaryButtonClick={handleConfirmRemoveItem}
      secondaryActionText="Cancel"
      secondaryActionColor={COLORS.primary}
      onSecondaryActionClick={() => setPendingRemoveItem(null)}
      disableBackdropClick={isRemovingItem}
    />
    <AlertDialog
      open={isPremiumDialogOpen}
      onClose={() => setIsPremiumDialogOpen(false)}
      icon={<WorkspacePremiumRoundedIcon />}
      iconBackgroundColor="rgba(234, 122, 36, 0.14)"
      iconColor={COLORS.accent}
      title="Upgrade to Premium"
      titleColor={COLORS.primaryDark}
      description="Top pick recommendations beyond this preview are available on the premium plan. Upgrade to unlock more tailored event ideas."
      primaryButtonText="Upgrade Now"
      primaryButtonColor={COLORS.accent}
      onPrimaryButtonClick={() => {
        setIsPremiumDialogOpen(false)
        setIsPlansDialogOpen(true)
      }}
      secondaryActionText="Maybe later"
      secondaryActionColor={COLORS.primary}
      onSecondaryActionClick={() => setIsPremiumDialogOpen(false)}
    />
    <PremiumPlansDialog
      open={isPlansDialogOpen}
      onClose={() => setIsPlansDialogOpen(false)}
    />
    </>
  )
}

function CustomizePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const activePlanId = searchParams.get('planId')
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlanLoading, setIsPlanLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  const loadPlans = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await getCustomizedPlans()
      setPlans(result.data || [])
    } catch (error) {
      setErrorMessage(error.message || 'Could not load customized plans')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadActivePlan = useCallback(async () => {
    if (!activePlanId) {
      setActivePlan(null)
      return
    }

    setIsPlanLoading(true)
    setErrorMessage('')

    try {
      const result = await getCustomizedPlan(activePlanId)
      setActivePlan(result.data)
    } catch (error) {
      setErrorMessage(error.message || 'Could not load plan')
    } finally {
      setIsPlanLoading(false)
    }
  }, [activePlanId])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  useEffect(() => {
    loadActivePlan()
  }, [loadActivePlan])

  const handleDeletePlan = async (planId) => {
    try {
      await deleteCustomizedPlan(planId)
      setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId))
      showToast('Plan deleted')
    } catch (error) {
      showToast(error.message || 'Could not delete plan', 'error')
    }
  }

  const handleCreatePlan = async () => {
    const name = newPlanName.trim()

    if (!name) {
      showToast('Plan name is required', 'error')
      return
    }

    setIsCreatingPlan(true)
    try {
      const result = await createCustomizedPlan({
        name,
        description: 'Customized event plan',
      })
      setPlans((current) => [result.data, ...current])
      setNewPlanName('')
      setIsCreateDialogOpen(false)
      setSearchParams({ planId: result.data.id })
    } catch (error) {
      showToast(error.message || 'Could not create plan', 'error')
    } finally {
      setIsCreatingPlan(false)
    }
  }

  const handleRenamePlan = async (name) => {
    try {
      const result = await updateCustomizedPlan(activePlanId, { name })
      setActivePlan(result.data)
      setPlans((currentPlans) =>
        currentPlans.map((plan) => (plan.id === result.data.id ? result.data : plan)),
      )
      showToast('Plan renamed')
    } catch (error) {
      showToast(error.message || 'Could not rename plan', 'error')
      throw error
    }
  }

  if (activePlanId) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 180px)' }}>
        {isPlanLoading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={34} sx={{ color: COLORS.primary }} />
          </Box>
        ) : null}

        {!isPlanLoading && errorMessage ? (
          <Typography sx={{ color: '#d93a2e', fontWeight: 700, py: 4 }}>
            {errorMessage}
          </Typography>
        ) : null}

        {!isPlanLoading && activePlan ? (
          <CreatePlanView
            plan={activePlan}
            onChooseTemplate={() => navigate(`/services?planId=${activePlan.id}#bundles`)}
            onBackToPlans={() => {
              setSearchParams({})
              loadPlans()
            }}
            onRefreshPlan={loadActivePlan}
            onRenamePlan={handleRenamePlan}
          />
        ) : null}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 180px)',
        py: { xs: 3.5, md: 4 },
      }}
    >
      <Stack spacing={2.8}>
        <Typography
          sx={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.25rem' },
            lineHeight: 1.1,
          }}
        >
          My Customized Plans
        </Typography>

        {isLoading ? (
          <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={34} sx={{ color: COLORS.primary }} />
          </Box>
        ) : null}

        {!isLoading && errorMessage ? (
          <Typography sx={{ color: '#d93a2e', fontWeight: 700 }}>
            {errorMessage}
          </Typography>
        ) : null}

        {!isLoading && !errorMessage ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
              gap: { xs: 4, md: 5, lg: 6 },
              alignItems: 'stretch',
            }}
          >
            <CollectionsList
              collections={plans}
              onViewCollection={(planId) => setSearchParams({ planId })}
              onDeleteCollection={handleDeletePlan}
              getCollectionSelected={() => false}
              cardSpacing={1.05}
              viewLabel="View Plan"
              sx={{ display: 'contents' }}
            />

            <CreateCollectionCard
              label="Create New Plan"
              minHeight={{ xs: 320, sm: 347 }}
              onClick={() => setIsCreateDialogOpen(true)}
            />
          </Box>
        ) : null}
      </Stack>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => {
          if (!isCreatingPlan) {
            setIsCreateDialogOpen(false)
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.2}>
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: '1.65rem',
                lineHeight: 1.1,
              }}
            >
              Name Your Plan
            </Typography>
            <TextField
              fullWidth
              autoFocus
              label="Plan name"
              value={newPlanName}
              onChange={(event) => setNewPlanName(event.target.value)}
              inputProps={{ maxLength: 80 }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCreatePlan()
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                },
              }}
            />
            <Stack direction="row" spacing={1.2} justifyContent="flex-end">
              <Button
                disabled={isCreatingPlan}
                onClick={() => setIsCreateDialogOpen(false)}
                sx={{
                  color: COLORS.primary,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                disabled={isCreatingPlan}
                onClick={handleCreatePlan}
                sx={{
                  backgroundColor: COLORS.accent,
                  textTransform: 'none',
                  fontWeight: 800,
                  '&:hover': { backgroundColor: COLORS.accentHover },
                }}
              >
                {isCreatingPlan ? 'Creating...' : 'Create Plan'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default CustomizePage
