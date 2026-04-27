import { useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../constants/colors'
import { DECORATION_ITEMS } from '../constants/decorationItems'
import { MY_COLLECTIONS } from '../constants/myCollections'
import { VENUE_ITEMS } from '../constants/venueItems'
import { useTopPicks } from '../hooks/useTopPicks'
import CartItemRow from '../shared/components/CartItemRow'
import CollectionsList from '../shared/components/CollectionsList'
import CreateCollectionCard from '../shared/components/CreateCollectionCard'

const selectedVenue = VENUE_ITEMS.find((item) => item.id === 'garden-jbeil') ?? VENUE_ITEMS[0]
const selectedDecoration =
  DECORATION_ITEMS.find((item) => item.id === 'flower-bouquet') ?? DECORATION_ITEMS[0]

const PLAN_SECTIONS = [
  {
    id: 'venues',
    title: 'Venues',
    items: [
      {
        ...selectedVenue,
        title: 'Outdoor venue in jbeil',
        details: ['Date: 20 Jun, 2026', 'Time: 5pm to 10pm', 'Guests: 350'],
        price: '$2500',
      },
    ],
  },
  { id: 'menus', title: 'Menus', items: [] },
  {
    id: 'decorations',
    title: 'Decoration',
    items: [
      {
        ...selectedDecoration,
        title: 'Flowers Bouquet',
        details: ['Date: 20 Jun, 2026', 'Time: 5pm', 'Quantity: 10 pcs'],
        price: '$320',
      },
    ],
  },
  { id: 'entertainment', title: 'Entertainment', items: [] },
]

function PlanSection({ section }) {
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

        <Typography
          sx={{
            color: COLORS.primary,
            fontSize: '1.9rem',
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          -
        </Typography>
      </Stack>

      {section.items.map((item) => (
        <CartItemRow
          key={item.id}
          showCheckbox={false}
          imageSrc={item.imageSrc}
          imageAlt={item.imageAlt}
          imageSx={{
            width: { xs: '100%', sm: 130 },
            maxWidth: { xs: 220, sm: 130 },
            height: { xs: 140, sm: 120 },
          }}
          title={item.title}
          details={item.details}
          price={item.price}
          modifyLabel="Modify"
          onModify={() => {}}
          onFavorite={() => {}}
          onDelete={() => {}}
        />
      ))}
    </Stack>
  )
}

function TopPickTile({ item, onClick }) {
  if (item.isUpgrade) {
    return (
      <Box
        sx={{
          minHeight: 172,
          borderRadius: 2,
          backgroundColor: COLORS.primarySoft,
          display: 'grid',
          placeItems: 'center',
          px: 2,
          textAlign: 'center',
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

function CreatePlanView({ onChooseTemplate }) {
  const navigate = useNavigate()
  const {
    maxTopPicksIndex,
    rightArrowClickCount,
    topPicksIndex,
    topPicksToRender,
    handleTopPicksNext,
    handleTopPicksPrevious,
  } = useTopPicks(4)

  return (
    <Stack spacing={2.2} sx={{ py: { xs: 3, md: 2.5 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography
          sx={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.15rem' },
            lineHeight: 1.05,
          }}
        >
          Create Plan
        </Typography>

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
        <Box
          sx={{
            border: `2px solid ${COLORS.primary}`,
            borderRadius: 1,
            px: { xs: 2, md: 4 },
            py: { xs: 2.2, md: 2.8 },
          }}
        >
          <Stack spacing={1.45}>
            {PLAN_SECTIONS.map((section) => (
              <PlanSection key={section.id} section={section} />
            ))}
          </Stack>
        </Box>

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
                    if (item.targetPath) {
                      navigate(item.targetPath)
                    }
                  }}
                />
              ))}
            </Box>
          </Stack>
        </Box>
      </Box>

      <Button
        variant="contained"
        sx={{
          alignSelf: { xs: 'stretch', md: 'center' },
          minWidth: { md: 236 },
          borderRadius: 999,
          backgroundColor: COLORS.accent,
          boxShadow: 'none',
          color: COLORS.surface,
          fontSize: '1.25rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          '&:hover': { backgroundColor: COLORS.accentHover, boxShadow: 'none' },
        }}
      >
        Add Plan
      </Button>
    </Stack>
  )
}

function CustomizePage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState(MY_COLLECTIONS)
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)

  const handleDeletePlan = (planId) => {
    setPlans((currentPlans) => currentPlans.filter((plan) => plan.id !== planId))
  }

  if (isCreatingPlan) {
    return <CreatePlanView onChooseTemplate={() => setIsCreatingPlan(false)} />
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
            onViewCollection={(planId) => navigate(`/cart?collection=${planId}`)}
            onDeleteCollection={handleDeletePlan}
            getCollectionSelected={() => false}
            cardSpacing={1.05}
            viewLabel="View Plan"
            sx={{ display: 'contents' }}
          />

          <CreateCollectionCard
            label="Create New Plan"
            minHeight={{ xs: 320, sm: 347 }}
            onClick={() => setIsCreatingPlan(true)}
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default CustomizePage
