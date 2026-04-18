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
          borderRadius: 1.5,
          border: `1px solid ${COLORS.primary}`,
          backgroundColor: COLORS.surface,
          px: { xs: 2, sm: 2.2 },
          py: { xs: 2.1, sm: 2.3 },
        }}
      >
        <Stack spacing={2.1}>
          <Typography
            sx={{
              color: COLORS.primary,
              fontSize: { xs: '1.2rem', sm: '1.38rem' },
              fontWeight: 700,
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
              fontSize: '1.02rem',
              fontWeight: 600,
            }}
          >
            Order Summary
          </Typography>

          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.88rem', fontWeight: 500 }}>
                Retail Price:
              </Typography>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.88rem', fontWeight: 500 }}>
                {retailPrice}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.88rem', fontWeight: 500 }}>
                Promotions:
              </Typography>
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.88rem', fontWeight: 500 }}>
                {promotions}
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ height: 1, backgroundColor: '#cfcfcf' }} />

          <Stack spacing={0.6}>
            <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
              <Typography sx={{ color: '#3b3b3b', fontSize: '0.96rem', fontWeight: 600 }}>
                Total Price:
              </Typography>
              <Typography
                sx={{
                  color: COLORS.accent,
                  fontSize: '1.28rem',
                  fontWeight: 600,
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
