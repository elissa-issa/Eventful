import { useMemo, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import {
  Box,
  Button,
  IconButton,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import dayjs from 'dayjs'
import { COLORS } from '../../constants/colors'

function ServiceItemGalleryDialog({
  title,
  images = [],
  discountLabel,
  isFavorite = false,
  onFavoriteToggle,
  vendorName,
  vendorLocation,
  vendorLogoSrc,
  vendorLogoAlt = 'Vendor logo',
  ratingValue = 4.5,
  reviewCount = 120,
  description,
  priceText,
  onAddToCart,
  onBack,
  leftBottomContent,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [peopleCount, setPeopleCount] = useState(0)
  const [deliveryDate, setDeliveryDate] = useState(null)
  const [deliveryTime, setDeliveryTime] = useState(null)

  const activeImage = images[currentIndex] || images[0]
  const today = dayjs().startOf('day')
  const minimumAllowedTime = dayjs().add(2, 'hour').startOf('minute')
  const isTodaySelected =
    deliveryDate != null && dayjs(deliveryDate).isSame(dayjs(), 'day')

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

  const handlePeopleChange = (direction) => {
    setPeopleCount((current) =>
      direction === 'increase' ? current + 1 : Math.max(0, current - 1)
    )
  }

  const shouldDisableDate = (value) => {
    if (!value) {
      return false
    }

    return dayjs(value).isBefore(today, 'day')
  }

  const shouldDisableTime = (value, view) => {
    if (!value || !isTodaySelected) {
      return false
    }

    if (view === 'hours') {
      return dayjs(value).hour() < minimumAllowedTime.hour()
    }

    if (view === 'minutes' && dayjs(value).hour() === minimumAllowedTime.hour()) {
      return dayjs(value).minute() < minimumAllowedTime.minute()
    }

    return false
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          py: { xs: 2, md: 3 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(320px, 0.95fr)' },
          gap: { xs: 2.5, md: 2.5 },
          alignItems: 'start',
        }}
      >
        <Box>
          <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
            <IconButton
              aria-label="Go back"
              onClick={onBack}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                mt: 1,
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                '&:hover': {
                  backgroundColor: COLORS.primaryHover,
                },
              }}
            >
              <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Box
              sx={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
                height: { xs: 280, sm: 420, md: 500 },
                borderRadius: 2.5,
                overflow: 'hidden',
                backgroundColor: COLORS.primarySoft,
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
                  color: isFavorite ? COLORS.accent : COLORS.footerText,
                  backgroundColor: COLORS.glass,
                  backdropFilter: 'blur(6px)',
                  '&:hover': {
                    backgroundColor: COLORS.overlay,
                  },
                }}
              >
                {isFavorite ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
              </IconButton>
            </Box>
          </Stack>

          {images.length > 1 ? (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mt: 2,
                ml: { xs: 0, sm: '54px' },
                overflow: 'hidden',
              }}
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
                      maxWidth: 150,
                      maxHeight: 150,
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
                        height: '100%',
                        maxHeight: 150,
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
                  backgroundColor: COLORS.footer,
                  color: COLORS.surface,
                  '&:hover': {
                    backgroundColor: COLORS.primary,
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

          {leftBottomContent ? (
            <Box sx={{ mt: 2.25 }}>
              {leftBottomContent}
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            position: { md: 'sticky' },
            top: { md: 88 },
            alignSelf: 'start',
            px: { xs: 0, md: 1 },
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', md: '2rem' },
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {title}
                </Typography>
                {vendorName || vendorLocation ? (
                  <Typography
                    variant="body1"
                    sx={{ mt: 0.6, color: COLORS.textLight, fontSize: '1rem' }}
                  >
                    By {vendorName || 'Pain d’Or'}
                    {vendorLocation ? ` - ${vendorLocation}` : ''}
                  </Typography>
                ) : null}
              </Box>

              {vendorLogoSrc ? (
                <Box
                  component="img"
                  src={vendorLogoSrc}
                  alt={vendorLogoAlt}
                  sx={{
                    width: 78,
                    height: 34,
                    objectFit: 'contain',
                    flexShrink: 0,
                    mt: 0.4,
                  }}
                />
              ) : null}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Rating
                value={ratingValue}
                precision={0.5}
                readOnly
                icon={<StarRoundedIcon fontSize="inherit" />}
                emptyIcon={<StarRoundedIcon fontSize="inherit" />}
                sx={{
                  color: COLORS.accent,
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: COLORS.textLight, fontWeight: 600 }}>
                {ratingValue} stars ({reviewCount} reviews)
              </Typography>
            </Stack>

            {description ? (
              <Typography
                variant="body1"
                sx={{ color: COLORS.textMuted, fontSize: '1rem', lineHeight: 1.35 }}
              >
                {description}
              </Typography>
            ) : null}

            {priceText ? (
              <Typography
                variant="h4"
                sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '2rem' }}
              >
                {priceText}
              </Typography>
            ) : null}

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body1" sx={{ color: COLORS.textLight, fontSize: '1rem' }}>
                  Number of people
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    aria-label="Decrease people count"
                    onClick={() => handlePeopleChange('decrease')}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      backgroundColor: COLORS.footer,
                      color: COLORS.surface,
                      '&:hover': {
                        backgroundColor: COLORS.primary,
                      },
                    }}
                  >
                    <RemoveRoundedIcon />
                  </IconButton>

                  <Box
                    sx={{
                      minWidth: 34,
                      textAlign: 'center',
                      color: COLORS.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    {peopleCount}
                  </Box>

                  <IconButton
                    aria-label="Increase people count"
                    onClick={() => handlePeopleChange('increase')}
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      backgroundColor: COLORS.primary,
                      color: COLORS.surface,
                      '&:hover': {
                        backgroundColor: COLORS.primaryHover,
                      },
                    }}
                  >
                    <AddRoundedIcon />
                  </IconButton>
                </Stack>
              </Stack>

              <DatePicker
                value={deliveryDate}
                onChange={(value) => {
                  const nextDate = value && dayjs(value).isValid() ? value : null
                  setDeliveryDate(nextDate)

                  if (
                    nextDate &&
                    dayjs(nextDate).isSame(dayjs(), 'day') &&
                    deliveryTime &&
                    dayjs(deliveryTime).isBefore(minimumAllowedTime)
                  ) {
                    setDeliveryTime(null)
                  }
                }}
                format="DD/MM/YYYY"
                minDate={today}
                shouldDisableDate={shouldDisableDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Select Delivery Date',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    backgroundColor: COLORS.surface,
                  },
                }}
              />

              <TimePicker
                value={deliveryTime}
                onChange={(value) => {
                  const nextTime = value && dayjs(value).isValid() ? value : null

                  if (nextTime && isTodaySelected && nextTime.isBefore(minimumAllowedTime)) {
                    setDeliveryTime(null)
                    return
                  }

                  setDeliveryTime(nextTime)
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                }}
                minTime={isTodaySelected ? minimumAllowedTime : undefined}
                shouldDisableTime={shouldDisableTime}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: 'Select Delivery Time',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    backgroundColor: COLORS.surface,
                  },
                }}
              />
            </Stack>

            <Button
              fullWidth
              disableElevation
              variant="contained"
              onClick={onAddToCart}
              sx={{
                borderRadius: 1.5,
                backgroundColor: COLORS.accent,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                py: 1.2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: COLORS.accentHover,
                  boxShadow: 'none',
                },
              }}
            >
              Add to Cart
            </Button>
          </Stack>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default ServiceItemGalleryDialog
