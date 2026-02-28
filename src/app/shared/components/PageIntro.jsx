import { Card, CardContent, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function PageIntro({ title, description, icon }) {
  const IconComponent = icon

  return (
    <Card sx={{ borderRadius: 2.5, border: `1px solid ${COLORS.border}` }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconComponent sx={{ color: COLORS.primary, fontSize: 32 }} />
          <Typography variant="h4" sx={{ color: COLORS.primaryDark, fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body1" sx={{ color: COLORS.textMuted }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default PageIntro
