import { Box, Chip, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function VendorFeatureCard({ vendor, large = false, onViewItemsClick }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: large ? { xs: 260, md: 360 } : { xs: 220, md: 260 },
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: COLORS.primaryDark,
        boxShadow: '0 20px 40px rgba(15, 45, 75, 0.12)',
      }}
    >
      <Box
        component="img"
        src={vendor.imageSrc}
        alt={vendor.imageAlt}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            large
              ? 'linear-gradient(180deg, rgba(15, 45, 75, 0.12) 0%, rgba(15, 45, 75, 0.45) 58%, rgba(15, 45, 75, 0.86) 100%)'
              : 'linear-gradient(180deg, rgba(15, 45, 75, 0.18) 0%, rgba(15, 45, 75, 0.78) 100%)',
        }}
      />
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          justifyContent: 'flex-end',
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Typography
          sx={{
            color: COLORS.surface,
            fontWeight: 800,
            fontSize: large ? { xs: '1.8rem', md: '2rem' } : { xs: '1.4rem', md: '1.55rem' },
            lineHeight: 1.05,
            mb: 1,
          }}
        >
          {vendor.title}
        </Typography>
        <Typography
          sx={{
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: '0.98rem',
            lineHeight: 1.45,
            maxWidth: large ? 420 : 280,
            mb: 1.5,
          }}
        >
          {vendor.description}
        </Typography>
        <Typography
          onClick={onViewItemsClick}
          sx={{
            color: COLORS.surface,
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: onViewItemsClick ? 'pointer' : 'default',
            width: 'fit-content',
          }}
        >
          {vendor.ctaLabel} →
        </Typography>
      </Stack>
    </Box>
  )
}

export default VendorFeatureCard
