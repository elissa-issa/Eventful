import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function FavoriteItemCard({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  vendorLogoSrc,
  vendorLogoAlt = 'Vendor logo',
  description,
  detailText,
  priceText,
  onDelete,
  onView,
  onAddToCart,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        border: `1px solid ${COLORS.primary}`,
        borderRadius: 2,
        backgroundColor: COLORS.surface,
        px: { xs: 1.1, md: 1.35 },
        py: { xs: 1.1, md: 1.35 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.35, sm: 1.4, md: 1.6 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          sx={{
            width: { xs: '100%', sm: 180, md: 190 },
            height: { xs: 190, sm: 110, md: 112 },
            objectFit: 'cover',
            borderRadius: 1.5,
            flexShrink: 0,
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '1.45rem', sm: '1.05rem', md: '1.1rem' },
              textTransform: 'uppercase',
              lineHeight: 1.1,
              mb: 0.4,
            }}
          >
            {title}
          </Typography>

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.35 }}>
            <Typography sx={{ color: '#6f6f6f', fontSize: { xs: '0.95rem', sm: '0.86rem' } }}>
              {subtitle}
            </Typography>
            {vendorLogoSrc ? (
              <Box
                component="img"
                src={vendorLogoSrc}
                alt={vendorLogoAlt}
                sx={{ width: 34, height: 16, objectFit: 'contain' }}
              />
            ) : null}
          </Stack>

          <Typography
            sx={{
              color: '#737373',
              fontSize: { xs: '0.9rem', sm: '0.78rem' },
              lineHeight: 1.35,
              mb: 0.35,
            }}
          >
            {description}
          </Typography>

          <Typography sx={{ color: '#7e7e7e', fontSize: { xs: '0.88rem', sm: '0.76rem' } }}>
            {detailText}
          </Typography>

          <Typography
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '1.05rem', sm: '0.95rem' },
              mt: 0.25,
            }}
          >
            {priceText}
          </Typography>
        </Box>

        <Stack
          spacing={1}
          alignItems="flex-end"
          justifyContent="center"
          sx={{ width: { xs: '100%', sm: 140 }, flexShrink: 0 }}
        >
          <Stack direction="row" spacing={0.5}>
            <IconButton aria-label="Favorite item" sx={{ color: '#ff1f1f', p: 0.5 }}>
              <FavoriteRoundedIcon />
            </IconButton>
            <IconButton
              aria-label="Delete favorite item"
              onClick={onDelete}
              sx={{ color: '#303030', p: 0.5 }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Stack>

          <Button
            fullWidth
            disableElevation
            variant="contained"
            onClick={onView}
            sx={{
              backgroundColor: COLORS.accent,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accent,
                boxShadow: 'none',
              },
            }}
          >
            View Item
          </Button>

          <Button
            fullWidth
            disableElevation
            variant="contained"
            onClick={onAddToCart}
            sx={{
              backgroundColor: COLORS.primary,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.primary,
                boxShadow: 'none',
              },
            }}
          >
            Add to Cart
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default FavoriteItemCard
