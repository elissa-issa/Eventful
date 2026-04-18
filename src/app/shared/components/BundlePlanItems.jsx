import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import { Box, Button, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function BundlePlanItems({ items = [], selectedImageSrc, onItemSelect }) {
  return (
    <Stack spacing={1.35}>
      {items.map((item) => {
        const isActive = item.imageSrc === selectedImageSrc

        return (
          <Box
            key={item.id}
            component="button"
            type="button"
            onClick={() => onItemSelect?.(item.imageSrc)}
            sx={{
              width: '100%',
              p: 0,
              borderRadius: 2,
              border: `1px solid ${isActive ? COLORS.primary : '#d9e5f6'}`,
              backgroundColor: COLORS.surface,
              boxShadow: '0 2px 10px rgba(15, 45, 75, 0.06)',
              cursor: 'pointer',
              textAlign: 'left',
              overflow: 'hidden',
            }}
          >
            <Stack direction="row" spacing={1.4} sx={{ p: 1.2 }}>
              <Box
                component="img"
                src={item.imageSrc}
                alt={item.imageAlt}
                sx={{
                  width: 96,
                  height: 78,
                  borderRadius: 1.5,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <Stack spacing={0.45} sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography
                    sx={{
                      color: COLORS.primary,
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Button
                    size="small"
                    disableElevation
                    sx={{
                      minWidth: 0,
                      px: 1.1,
                      py: 0.2,
                      borderRadius: '999px',
                      backgroundColor: COLORS.primary,
                      color: COLORS.surface,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      '&:hover': {
                        backgroundColor: COLORS.primaryHover,
                      },
                    }}
                  >
                    Modify
                  </Button>
                </Stack>

                {item.metaText ? (
                  <Typography sx={{ color: COLORS.textLight, fontSize: '0.82rem' }}>
                    {item.metaText}
                  </Typography>
                ) : null}

                <Typography
                  sx={{
                    color: COLORS.accent,
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    mt: 'auto',
                  }}
                >
                  {item.priceText}
                </Typography>

                <Stack direction="row" spacing={0.9} justifyContent="flex-end" sx={{ mt: 0.1 }}>
                  <FavoriteBorderRoundedIcon sx={{ fontSize: 18, color: COLORS.primaryDark }} />
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18, color: COLORS.primaryDark }} />
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )
      })}
    </Stack>
  )
}

export default BundlePlanItems
