import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import { Box, Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function ServiceCard({
  imageSrc,
  imageAlt,
  title,
  description,
  guestText,
  priceText,
  discountLabel,
  vendorLogoSrc,
  vendorLogoAlt = 'Vendor logo',
  isFavorite = false,
  onFavoriteToggle,
  viewButtonLabel = 'View Item',
  onViewButtonClick,
  cartButtonLabel = 'Add to Cart',
  onCartButtonClick,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 400,
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: COLORS.surface,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ position: 'relative', height: 312 }}>
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

        {discountLabel ? (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              borderRadius: '999px',
              backgroundColor: COLORS.primary,
              color: COLORS.surface,
              px: 1.6,
              py: 0.75,
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1 }}>
              {discountLabel}
            </Typography>
          </Box>
        ) : null}

        <IconButton
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={onFavoriteToggle}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: isFavorite ? COLORS.accent : 'rgba(255, 255, 255, 0.88)',
            backgroundColor: 'rgba(15, 45, 75, 0.16)',
            backdropFilter: 'blur(6px)',
            '&:hover': {
              backgroundColor: 'rgba(15, 45, 75, 0.28)',
            },
          }}
        >
          {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
        </IconButton>
      </Box>

      <CardContent
        sx={{
          px: 0.5,
          pt: 1.8,
          pb: 1.6,
          flexGrow: 1,
          display: 'flex',
        }}
      >
        <Stack spacing={1.3} sx={{ flexGrow: 1, width: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Typography
              variant="h6"
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: '1.05rem',
                textTransform: 'uppercase',
                lineHeight: 1.15,
              }}
            >
              {title}
            </Typography>

            {vendorLogoSrc ? (
              <Box
                component="img"
                src={vendorLogoSrc}
                alt={vendorLogoAlt}
                sx={{
                  width: 62,
                  height: 28,
                  objectFit: 'contain',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              />
            ) : null}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: '#7b7b7b',
              fontSize: '0.95rem',
              lineHeight: 1.25,
              height: '2.5rem',
              display: '-webkit-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
            }}
          >
            {description || ''}
          </Typography>

          {guestText ? (
            <Typography
              variant="body2"
              sx={{
                color: '#7b7b7b',
                fontSize: '0.95rem',
                lineHeight: 1,
              }}
            >
              {guestText}
            </Typography>
          ) : null}

          <Typography
            variant="h6"
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: '1rem',
              lineHeight: 1.1,
            }}
          >
            {priceText}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ pt: 0.6, mt: 'auto' }}>
            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={onViewButtonClick}
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
              {viewButtonLabel}
            </Button>

            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={onCartButtonClick}
              sx={{
                borderRadius: 1.25,
                backgroundColor: COLORS.primary,
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
              {cartButtonLabel}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ServiceCard
