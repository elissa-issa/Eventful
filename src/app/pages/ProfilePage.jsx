import { Stack, Typography } from '@mui/material'
import { COLORS } from '../constants/colors'

function ProfilePage() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 320 }}>
      <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 800 }}>
        Profile
      </Typography>
    </Stack>
  )
}

export default ProfilePage
