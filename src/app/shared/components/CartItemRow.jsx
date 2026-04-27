import { useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import { Box, Button, Checkbox, IconButton, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

const FALLBACK_CART_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <rect width="240" height="240" rx="24" fill="#eaf3ff" />
    <rect x="70" y="54" width="20" height="96" rx="10" fill="#f3e4b8" />
    <rect x="108" y="42" width="24" height="116" rx="12" fill="#fff0c9" />
    <rect x="152" y="66" width="18" height="84" rx="9" fill="#e8d7a5" />
    <circle cx="80" cy="50" r="5" fill="#f39a4a" />
    <circle cx="120" cy="36" r="6" fill="#f39a4a" />
    <circle cx="161" cy="61" r="4.5" fill="#f39a4a" />
    <text x="120" y="196" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" fill="#2b78cc">
      Image unavailable
    </text>
  </svg>
`)}` 

function CartItemRow({
  checked = true,
  imageSrc,
  imageAlt,
  imageSx,
  fallbackImageSrc = FALLBACK_CART_IMAGE,
  title,
  details = [],
  price,
  modifyLabel = 'Modify',
  showCheckbox = true,
  onCheckedChange,
  onModify,
  onFavorite,
  onDelete,
}) {
  const [resolvedImageSrc, setResolvedImageSrc] = useState(imageSrc || fallbackImageSrc)

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2, sm: 2.25 }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      sx={{
        width: '100%',
      }}
    >
      {showCheckbox ? (
        <Checkbox
          checked={checked}
          onChange={onCheckedChange}
          sx={{
            p: 0,
            mt: { xs: 0.25, sm: 0 },
            color: COLORS.primary,
            '&.Mui-checked': {
              color: COLORS.primary,
            },
          }}
        />
      ) : null}

      <Box
        component="img"
        src={resolvedImageSrc}
        alt={imageAlt}
        onError={() => {
          if (resolvedImageSrc !== fallbackImageSrc) {
            setResolvedImageSrc(fallbackImageSrc)
          }
        }}
        sx={{
          width: { xs: '100%', sm: 90 },
          maxWidth: { xs: 220, sm: 90 },
          height: { xs: 140, sm: 90 },
          borderRadius: 1.5,
          objectFit: 'cover',
          display: 'block',
          flexShrink: 0,
          ...(imageSx || {}),
        }}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.75, md: 2 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-start' }}
        sx={{ flex: 1, minWidth: 0, width: '100%' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: COLORS.primary,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 700,
              lineHeight: 1.15,
              textTransform: 'capitalize',
              mb: 0.4,
            }}
          >
            {title}
          </Typography>

          <Stack spacing={0.2}>
            {details.map((detail) => (
              <Typography
                key={detail}
                sx={{
                  color: COLORS.textLight,
                  fontSize: { xs: '0.82rem', sm: '0.76rem' },
                  lineHeight: 1.2,
                }}
              >
                {detail}
              </Typography>
            ))}
          </Stack>

          <Typography
            sx={{
              mt: 0.7,
              color: COLORS.accent,
              fontSize: { xs: '1rem', sm: '1.08rem' },
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            {price}
          </Typography>
        </Box>

        <Stack
          spacing={{ xs: 1.25, sm: 2.5 }}
          alignItems={{ xs: 'flex-start', md: 'flex-end' }}
          justifyContent="space-between"
          sx={{
            width: { xs: '100%', md: 'auto' },
            minHeight: { md: 90 },
            flexShrink: 0,
          }}
        >
          <Button
            disableElevation
            onClick={onModify}
            sx={{
              minWidth: 72,
              px: 1.6,
              py: 0.62,
              borderRadius: 999,
              backgroundColor: COLORS.primary,
              color: COLORS.surface,
              fontSize: '0.78rem',
              fontWeight: 500,
              lineHeight: 1,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.primaryHover,
                boxShadow: 'none',
              },
            }}
          >
            {modifyLabel}
          </Button>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              aria-label="Add to favorites"
              onClick={onFavorite}
            sx={{
              color: '#1f1f1f',
              p: 0.2,
            }}
          >
              <FavoriteBorderRoundedIcon sx={{ fontSize: 19 }} />
            </IconButton>

            <IconButton
              aria-label="Remove from cart"
              onClick={onDelete}
            sx={{
              color: '#1f1f1f',
              p: 0.2,
            }}
          >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default CartItemRow
