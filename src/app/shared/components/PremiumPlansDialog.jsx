import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { COLORS } from '../../constants/colors'
import { upgradeToPremium } from '../../services/auth'
import { useToast } from '../../toast/useToast'

const PLAN_OPTIONS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For planning one event with the essential tools.',
    features: [
      'Create customized event plans',
      'Browse venues, menus, decoration, and entertainment',
      'Preview limited top picks',
      'Save favorites and collections',
    ],
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'For unlocking richer recommendations and premium vendors.',
    highlighted: true,
    features: [
      'Unlimited top pick recommendations',
      'Premium templates and curated bundles',
      'Direct access to premium vendors',
      'Exclusive event inspiration boards',
      'Priority planning support',
    ],
  },
]

function PremiumPlansDialog({ open, onClose }) {
  const { isAuthenticated, user, replaceAuth } = useAuth()
  const { showToast } = useToast()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const isPremiumUser = Boolean(user?.isPremium)

  const handleChoosePremium = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to upgrade to premium', 'error')
      return
    }

    if (isPremiumUser || isUpgrading) {
      return
    }

    setIsUpgrading(true)

    try {
      const result = await upgradeToPremium()
      replaceAuth(result.data)
      showToast('Premium plan activated')
      onClose?.()
    } catch (error) {
      showToast(error.message || 'Could not activate premium plan', 'error')
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'rgba(234, 122, 36, 0.14)',
                color: COLORS.accent,
                '& svg': { fontSize: 42 },
              }}
            >
              <WorkspacePremiumRoundedIcon />
            </Box>
            <Typography
              sx={{
                color: COLORS.primaryDark,
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.25rem' },
                lineHeight: 1.1,
              }}
            >
              Choose Your Plan
            </Typography>
            <Typography sx={{ color: COLORS.textLight, fontWeight: 600, maxWidth: 560 }}>
              Compare what is included in Free and Premium before upgrading.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {PLAN_OPTIONS.map((plan) => (
              <Stack
                key={plan.name}
                spacing={2}
                sx={{
                  minHeight: 360,
                  borderRadius: 2,
                  border: `2px solid ${plan.highlighted ? COLORS.accent : COLORS.borderStrong}`,
                  backgroundColor: plan.highlighted ? '#fff8f3' : COLORS.surface,
                  p: { xs: 2.2, sm: 2.75 },
                  position: 'relative',
                }}
              >
                {plan.highlighted ? (
                  <Typography
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: 999,
                      backgroundColor: COLORS.accent,
                      color: COLORS.surface,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      px: 1.4,
                      py: 0.45,
                      textTransform: 'uppercase',
                    }}
                  >
                    Recommended
                  </Typography>
                ) : null}

                <Stack spacing={0.8}>
                  <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, fontSize: '1.45rem' }}>
                    {plan.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="baseline">
                    <Typography sx={{ color: COLORS.primary, fontWeight: 900, fontSize: '2.4rem', lineHeight: 1 }}>
                      {plan.price}
                    </Typography>
                    <Typography sx={{ color: COLORS.textLight, fontWeight: 700 }}>
                      {plan.period}
                    </Typography>
                  </Stack>
                  <Typography sx={{ color: COLORS.textMuted, fontWeight: 600, lineHeight: 1.45 }}>
                    {plan.description}
                  </Typography>
                </Stack>

                <Stack spacing={1.15} sx={{ flex: 1 }}>
                  {plan.features.map((feature) => (
                    <Stack key={feature} direction="row" spacing={1} alignItems="flex-start">
                      <CheckRoundedIcon
                        sx={{
                          mt: 0.15,
                          color: plan.highlighted ? COLORS.accent : COLORS.primary,
                          fontSize: 20,
                        }}
                      />
                      <Typography sx={{ color: COLORS.textMuted, fontWeight: 700, lineHeight: 1.35 }}>
                        {feature}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Button
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  disabled={plan.highlighted && (isUpgrading || isPremiumUser)}
                  onClick={plan.highlighted ? handleChoosePremium : onClose}
                  sx={{
                    borderRadius: 999,
                    py: 1.1,
                    textTransform: 'none',
                    fontWeight: 800,
                    borderColor: plan.highlighted ? COLORS.accent : COLORS.primary,
                    backgroundColor: plan.highlighted ? COLORS.accent : COLORS.surface,
                    color: plan.highlighted ? COLORS.surface : COLORS.primary,
                    '&:hover': {
                      borderColor: plan.highlighted ? COLORS.accentHover : COLORS.primaryHover,
                      backgroundColor: plan.highlighted ? COLORS.accentHover : COLORS.primarySoft,
                    },
                  }}
                >
                  {plan.highlighted
                    ? isPremiumUser
                      ? 'Current Plan'
                      : isUpgrading
                        ? 'Upgrading...'
                        : 'Choose Premium'
                    : 'Stay Free'}
                </Button>
              </Stack>
            ))}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default PremiumPlansDialog
