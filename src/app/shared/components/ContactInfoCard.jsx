import { Box, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function ContactInfoCard({ icon, title, description }) {
  const IconComponent = icon

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.25 },
        borderRadius: '999px',
        backgroundColor: COLORS.surface,
        boxShadow: '0 8px 18px rgba(15, 45, 75, 0.12)',
      }}
    >
      <Stack direction="row" spacing={1.75} alignItems="flex-start">
        <IconComponent
          sx={{
            mt: 0.2,
            color: COLORS.primary,
            fontSize: 38,
            flexShrink: 0,
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              color: '#222222',
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '1.1rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#7a7a7a',
              whiteSpace: 'pre-line',
              lineHeight: 1.25,
              fontSize: { xs: '1rem', sm: '0.98rem' },
            }}
          >
            {description}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

export default ContactInfoCard
