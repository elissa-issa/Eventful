import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { Box, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

const CHECKOUT_STEPS = [
  { key: 'cart', label: 'Cart' },
  { key: 'delivery', label: 'Delivery Address' },
  { key: 'payment', label: 'Payment Method' },
]

function ActiveStepIcon() {
  const dots = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI * 2) / 8
    const radius = 10
    const dotSize = index === 0 ? 4.5 : 3.5

    return (
      <Box
        key={index}
        sx={{
          position: 'absolute',
          top: `calc(50% + ${Math.sin(angle) * radius}px - ${dotSize / 2}px)`,
          left: `calc(50% + ${Math.cos(angle) * radius}px - ${dotSize / 2}px)`,
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: COLORS.primary,
          opacity: index === 0 ? 1 : 0.72 - index * 0.06,
        }}
      />
    )
  })

  return (
    <Box
      sx={{
        position: 'relative',
        width: 30,
        height: 30,
        flexShrink: 0,
      }}
    >
      {dots}
    </Box>
  )
}

function InactiveStepIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: `3px solid ${COLORS.favorite}`,
        backgroundColor: COLORS.surface,
        flexShrink: 0,
      }}
    />
  )
}

function CompletedStepIcon() {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: '#20c288',
        color: COLORS.surface,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <CheckRoundedIcon sx={{ fontSize: 16 }} />
    </Box>
  )
}

function CheckoutProgressStepper({ activeStep = 0 }) {
  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        pb: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={{ xs: 2.5, md: 4.5 }}
        sx={{
          minWidth: 660,
        }}
      >
        {CHECKOUT_STEPS.map((step, index) => {
          const isActive = index === activeStep
          const isCompleted = index < activeStep
          const connectorColor = isCompleted ? '#20c288' : isActive ? COLORS.primary : '#8b8b8b'

          return (
            <Box key={step.key} sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                {isCompleted ? (
                  <CompletedStepIcon />
                ) : isActive ? (
                  <ActiveStepIcon />
                ) : (
                  <InactiveStepIcon />
                )}

                <Box
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: connectorColor,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.8,
                  ml: isCompleted ? 3.8 : isActive ? 4.6 : 4.2,
                  color: COLORS.textMuted,
                  fontSize: '0.95rem',
                  fontWeight: isActive || isCompleted ? 500 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

export default CheckoutProgressStepper
