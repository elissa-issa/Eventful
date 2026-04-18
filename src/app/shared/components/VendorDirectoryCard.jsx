import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function VendorDirectoryCard({
  imageSrc,
  imageAlt,
  title,
  description,
  location,
  serviceType,
  logoText,
  contactButtonLabel = 'Contact Vendor',
  itemsButtonLabel = 'View Items',
  onContactButtonClick,
  onItemsButtonClick,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.surface,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 18px 34px rgba(15, 45, 75, 0.06)',
      }}
    >
      <Box sx={{ position: 'relative', height: 220 }}>
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            borderRadius: '999px',
            backgroundColor: COLORS.surface,
            px: 1.4,
            py: 0.7,
            boxShadow: '0 8px 18px rgba(15, 45, 75, 0.1)',
          }}
        >
          <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.72rem', lineHeight: 1 }}>
            {serviceType}
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          px: 1.6,
          pt: 1.6,
          pb: 1.6,
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <Stack spacing={0.55} sx={{ width: '100%', flexGrow: 1 }}>
          <Typography
            sx={{
              color: COLORS.primaryDark,
              fontWeight: 800,
              fontSize: '1.25rem',
              lineHeight: 1.1,
              minHeight: 28,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: COLORS.textMuted,
              fontSize: '0.95rem',
              lineHeight: 1.45,
              height: '2.8rem',
              display: '-webkit-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {description}
          </Typography>

          <Typography sx={{ color: COLORS.textLight, fontSize: '0.92rem', minHeight: 18 }}>
            {location}
          </Typography>

          <Stack direction="row" spacing={1.2} sx={{ pt: 1, mt: 'auto' }}>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={onContactButtonClick}
              sx={{
                borderRadius: 1.25,
                backgroundColor: COLORS.accent,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1.05,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: COLORS.accentHover,
                  boxShadow: 'none',
                },
              }}
            >
              {contactButtonLabel}
            </Button>

            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={onItemsButtonClick}
              sx={{
                borderRadius: 1.25,
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1.05,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: COLORS.primaryHover,
                  boxShadow: 'none',
                },
              }}
            >
              {itemsButtonLabel}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default VendorDirectoryCard
