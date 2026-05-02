import { Box, Button, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function OrderSummaryCard({
  title,
  retailPrice,
  promotions,
  totalPrice,
  savedText,
  rewardedText,
  checkoutLabel = 'Checkout Now!',
  onCheckout,
  secondaryActionLabel,
  onSecondaryAction,
}) {
  return (
    <Stack spacing={1.9}>
      <Box
        sx={{
          borderRadius: 1,
          border: `2px solid ${COLORS.primary}`,
          backgroundColor: COLORS.surface,
          px: { xs: 2.2, sm: 2.5 },
          py: { xs: 2.4, sm: 2.7 },
        }}
      >
        <Stack spacing={2.1}>
          <Typography
            sx={{
              color: COLORS.primary,
              fontSize: { xs: '1.35rem', sm: '1.48rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: '#2d2d2d',
              fontSize: '1.08rem',
              fontWeight: 700,
            }}
          >
            Order Summary
          </Typography>

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.92rem', fontWeight: 700 }}>
                Retail Price:
              </Typography>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.92rem', fontWeight: 700 }}>
                {retailPrice}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.92rem', fontWeight: 700 }}>
                Promotions:
              </Typography>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.92rem', fontWeight: 700 }}>
                {promotions}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ height: 1, backgroundColor: '#cfcfcf' }} />

          <Stack spacing={0.6}>
            <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
              <Typography sx={{ color: '#3b3b3b', fontSize: '1rem', fontWeight: 700 }}>
                Total Price:
              </Typography>
              <Typography
                sx={{
                  color: COLORS.accent,
                  fontSize: '1.32rem',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {totalPrice}
              </Typography>
            </Stack>

            <Typography
              sx={{
                color: COLORS.accent,
                fontSize: '0.76rem',
                fontWeight: 500,
                textAlign: 'right',
              }}
            >
              {savedText}
            </Typography>

            <Typography
              sx={{
                color: COLORS.primary,
                fontSize: '0.76rem',
                fontWeight: 500,
                textAlign: 'right',
              }}
            >
              {rewardedText}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Button
        disableElevation
        variant="contained"
        onClick={onCheckout}
        sx={{
          alignSelf: 'center',
          minWidth: 156,
          borderRadius: 999,
          backgroundColor: COLORS.accent,
          color: COLORS.surface,
          fontSize: '0.98rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: COLORS.accentHover,
            boxShadow: 'none',
          },
        }}
      >
        {checkoutLabel}
      </Button>

      {secondaryActionLabel ? (
        <Button
          onClick={onSecondaryAction}
          sx={{
            alignSelf: 'center',
            minWidth: 120,
            p: 0,
            color: COLORS.primary,
            fontSize: '0.95rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          {secondaryActionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}

export default OrderSummaryCard
