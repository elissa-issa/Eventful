import { useEffect, useMemo, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import { Box, Dialog, IconButton, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function ServiceItemGalleryDialog({
  open,
  onClose,
  title,
  images = [],
  discountLabel,
  isFavorite = false,
  onFavoriteToggle,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [open, title])

  const activeImage = images[currentIndex] || images[0]

  const thumbnailImages = useMemo(
    () => images.filter((_, index) => index !== currentIndex).slice(0, 4),
    [currentIndex, images]
  )

  const handlePrevious = () => {
    setCurrentIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  const handleNext = () => {
    setCurrentIndex((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  const handleThumbnailClick = (thumbnailSrc) => {
    const nextIndex = images.findIndex((image) => image.src === thumbnailSrc)

    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: COLORS.surface,
          boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
        },
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2.25 } }}>
        {title ? (
          <Typography
            variant="h6"
            sx={{ mb: 1.5, color: COLORS.primaryDark, fontWeight: 800 }}
          >
            {title}
          </Typography>
        ) : null}

        <Box
          sx={{
            position: 'relative',
            height: { xs: 260, sm: 380, md: 470 },
            borderRadius: 2.5,
            overflow: 'hidden',
            backgroundColor: '#eef4fb',
          }}
        >
          {activeImage ? (
            <Box
              component="img"
              src={activeImage.src}
              alt={activeImage.alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : null}

          {discountLabel ? (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                px: 1.5,
                py: 0.75,
                borderRadius: '999px',
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1 }}>
                {discountLabel}
              </Typography>
            </Box>
          ) : null}

          <IconButton
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={onFavoriteToggle}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 38,
              height: 38,
              color: isFavorite ? COLORS.accent : 'rgba(255, 255, 255, 0.9)',
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

        {images.length > 1 ? (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 2, overflow: 'hidden' }}
          >
            <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
              {thumbnailImages.map((image) => (
                <Box
                  key={image.src}
                  component="button"
                  type="button"
                  onClick={() => handleThumbnailClick(image.src)}
                  sx={{
                    flex: '1 1 0',
                    minWidth: 0,
                    p: 0,
                    border: 'none',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={image.src}
                    alt={image.alt}
                    sx={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              ))}
            </Stack>

            <IconButton
              aria-label="Show previous image"
              onClick={handlePrevious}
              sx={{
                width: 44,
                height: 44,
                backgroundColor: '#8eb8ea',
                color: COLORS.surface,
                '&:hover': {
                  backgroundColor: '#75a7e2',
                },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton
              aria-label="Show next image"
              onClick={handleNext}
              sx={{
                width: 44,
                height: 44,
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                '&:hover': {
                  backgroundColor: COLORS.primaryHover,
                },
              }}
            >
              <ArrowForwardIosRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        ) : null}
      </Box>
    </Dialog>
  )
}

export default ServiceItemGalleryDialog
