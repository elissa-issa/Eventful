import { useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import { Box, Button, Checkbox, IconButton, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

const FALLBACK_CART_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <rect width="240" height="240" rx="24" fill="#eaf3ff" />
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
  showQuantityStepper = false,
  isFavorite = false,
  quantity = 1,
  onCheckedChange,
  onModify,
  onItemClick,
  onQuantityChange,
  onFavorite,
  onDelete,
}) {
  const [resolvedImageSrc, setResolvedImageSrc] = useState(imageSrc || fallbackImageSrc)

  const visibleDetails = details.filter(
    (detail) => !String(detail).toLowerCase().startsWith('type:'),
  )

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ width: '100%' }}
    >
      {showCheckbox ? (
        <Checkbox
          checked={checked}
          onChange={onCheckedChange}
          sx={{
            p: 0,
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
        onClick={onItemClick}
        onError={() => {
          if (resolvedImageSrc !== fallbackImageSrc) {
            setResolvedImageSrc(fallbackImageSrc)
          }
        }}
        sx={{
          width: 90,
          height: 90,
          borderRadius: 1.5,
          objectFit: 'cover',
          flexShrink: 0,
          cursor: onItemClick ? 'pointer' : 'default',
          ...(imageSx || {}),
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 90,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            onClick={onItemClick}
            sx={{
              color: COLORS.primary,
              fontSize: '1.1rem',
              fontWeight: 700,
              lineHeight: 1.15,
              textTransform: 'capitalize',
              mb: 0.4,
              cursor: onItemClick ? 'pointer' : 'default',
              '&:hover': onItemClick
                ? { textDecoration: 'underline' }
                : undefined,
            }}
          >
            {title}
          </Typography>

          <Stack spacing={0.2} marginTop={1}>
            {visibleDetails.map((detail) => (
              <Typography
                key={detail}
                sx={{
                  color: COLORS.textLight,
                  fontSize: '0.76rem',
                  lineHeight: 1.2,
                }}
              >
                {detail}
              </Typography>
            ))}
          </Stack>

        </Box>

        <Stack
          justifyContent="space-between"
          alignItems="flex-end"
          sx={{
            minHeight: 90,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={0.5}>
            <IconButton
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={onFavorite}
              sx={{
                color: isFavorite ? '#ff1f1f' : '#1f1f1f',
                p: 0.2,
              }}
            >
              {isFavorite ? (
                <FavoriteRoundedIcon sx={{ fontSize: 19 }} />
              ) : (
                <FavoriteBorderRoundedIcon sx={{ fontSize: 19 }} />
              )}
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

          <Typography
            sx={{
              color: COLORS.accent,
              fontSize: '1rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {price}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default CartItemRow