import { Stack, Typography } from '@mui/material'
import { COLORS } from '../constants/colors'

function CartPage() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
      <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 800 }}>
        Cart
      </Typography>
    </Stack>
  )
}

export default CartPage
