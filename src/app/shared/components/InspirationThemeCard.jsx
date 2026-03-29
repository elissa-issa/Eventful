import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function InspirationThemeCard({ title, subtitle, ctaLabel, imageSrc, imageAlt, large = false }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        minHeight: large ? { xs: 280, md: 360 } : { xs: 220, md: 240 },
        backgroundColor: COLORS.primaryDark,
        boxShadow: '0 18px 40px rgba(15, 45, 75, 0.16)',
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={imageAlt}
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          objectFit: 'cover',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            large
              ? 'linear-gradient(180deg, rgba(15, 45, 75, 0.1) 0%, rgba(15, 45, 75, 0.65) 68%, rgba(15, 45, 75, 0.9) 100%)'
              : 'linear-gradient(180deg, rgba(15, 45, 75, 0.06) 0%, rgba(15, 45, 75, 0.6) 62%, rgba(15, 45, 75, 0.88) 100%)',
        }}
      />

      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          justifyContent: 'flex-end',
          height: '100%',
          p: { xs: 2, md: 2.5 },
        }}
      >
        {subtitle ? (
          <Chip
            icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 16 }} />}
            label={subtitle}
            sx={{
              alignSelf: 'flex-start',
              mb: 1.5,
              height: 28,
              backgroundColor: 'rgba(51, 136, 224, 0.92)',
              color: COLORS.surface,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              '& .MuiChip-label': {
                px: 1.2,
                fontSize: '0.72rem',
              },
              '& .MuiChip-icon': {
                color: COLORS.surface,
                ml: 0.75,
              },
            }}
          />
        ) : null}

        <Typography
          sx={{
            color: COLORS.surface,
            fontWeight: 800,
            fontSize: large ? { xs: '1.8rem', md: '2rem' } : { xs: '1.3rem', md: '1.45rem' },
            lineHeight: 1.05,
            maxWidth: large ? 280 : 220,
            mb: 1.6,
            textShadow: '0 6px 22px rgba(15, 45, 75, 0.42)',
          }}
        >
          {title}
        </Typography>

        <Button
          variant="contained"
          endIcon={<ArrowOutwardRoundedIcon />}
          sx={{
            alignSelf: 'flex-start',
            px: 2.1,
            py: 0.85,
            borderRadius: '999px',
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: COLORS.accent,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.accentHover,
              boxShadow: 'none',
            },
          }}
        >
          {ctaLabel}
        </Button>
      </Stack>
    </Box>
  )
}

export default InspirationThemeCard
