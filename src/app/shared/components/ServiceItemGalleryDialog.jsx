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
  InputBase,
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

function parseInitialTime(value) {
  if (!value) {
    return null
  }

  const [hours, minutes] = String(value).split(':').map(Number)

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null
  }

  return dayjs().hour(hours).minute(minutes).second(0).millisecond(0)
}

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
  detailBadgeText,
  supportingInfoText,
  showPeopleSelector = true,
  peopleLabel = 'Number of people',
  datePlaceholder = 'Select Delivery Date',
  timePlaceholder = 'Select Delivery Time',
  actionButtonText = 'Add to Cart',
  initialQuantity,
  initialDate,
  initialTime,
  pricing,
  selectedImageSrc,
  onSelectedImageChange,
  onAddToCart,
  onBack,
  belowGalleryContent,
  leftBottomContent,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [peopleCount, setPeopleCount] = useState(() => initialQuantity ?? pricing?.defaultQuantity ?? 1)
  const [deliveryDate, setDeliveryDate] = useState(() =>
    initialDate && dayjs(initialDate).isValid() ? dayjs(initialDate) : null
  )
  const [deliveryTime, setDeliveryTime] = useState(() => parseInitialTime(initialTime))

  const activeIndex = useMemo(() => {
    if (selectedImageSrc) {
      const nextIndex = images.findIndex((image) => image.src === selectedImageSrc)

      if (nextIndex !== -1) {
        return nextIndex
      }
    }

    return currentIndex
  }, [currentIndex, images, selectedImageSrc])
  const activeImage = images[activeIndex] || images[0]
  const today = dayjs().startOf('day')
  const minimumAllowedTime = dayjs().add(2, 'hour').startOf('minute')
  const isTodaySelected =
    deliveryDate != null && dayjs(deliveryDate).isSame(dayjs(), 'day')

  const thumbnailImages = useMemo(
    () => images.filter((_, index) => index !== activeIndex).slice(0, 4),
    [activeIndex, images]
  )

  const setActiveImageByIndex = (nextIndex) => {
    const boundedIndex =
      nextIndex < 0 ? images.length - 1 : nextIndex >= images.length ? 0 : nextIndex
    const nextImage = images[boundedIndex]

    if (!nextImage) {
      return
    }

    if (onSelectedImageChange) {
      onSelectedImageChange(nextImage.src)
      return
    }

    setCurrentIndex(boundedIndex)
  }

  const handlePrevious = () => {
    setActiveImageByIndex(activeIndex - 1)
  }

  const handleNext = () => {
    setActiveImageByIndex(activeIndex + 1)
  }

  const handleThumbnailClick = (thumbnailSrc) => {
    const nextIndex = images.findIndex((image) => image.src === thumbnailSrc)

    if (nextIndex !== -1) {
      setActiveImageByIndex(nextIndex)
    }
  }

  const handlePeopleChange = (direction) => {
    setPeopleCount((current) =>
      direction === 'increase' ? current + 1 : Math.max(1, current - 1)
    )
  }

  const handlePeopleInputChange = (event) => {
    const nextValue = event.target.value.replace(/\D/g, '')

    if (nextValue === '') {
      setPeopleCount(1)
      return
    }

    setPeopleCount(Math.max(1, Number(nextValue)))
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

  const formatPrice = (value) => {
    if (!Number.isFinite(value)) {
      return '$0'
    }

    const roundedValue =
      Math.abs(value - Math.round(value)) < 0.001 ? Math.round(value).toString() : value.toFixed(2)

    return `$${roundedValue}`
  }

  const quantityForPricing = showPeopleSelector ? peopleCount : (pricing?.defaultQuantity ?? 1)
  const baseAmount = pricing?.baseAmount ?? 0
  const calculationType = pricing?.calculationType ?? 'flat'
  const rawTotal =
    calculationType === 'per_unit' ? baseAmount * Math.max(quantityForPricing, 0) : baseAmount

  let discountedTotal = rawTotal
  let savingsAmount = 0
  let appliedDiscountLabel = ''

  if (pricing?.discount && quantityForPricing > 0) {
    const { discount } = pricing

    if (
      discount.type === 'percentage' &&
      quantityForPricing >= discount.minQuantity
    ) {
      discountedTotal = rawTotal * (1 - discount.value / 100)
      savingsAmount = rawTotal - discountedTotal
      appliedDiscountLabel =
        discount.label || `${discount.value}% off for ${discount.minQuantity}+`
    }

    if (
      discount.type === 'free_units' &&
      quantityForPricing >= discount.minQuantity &&
      calculationType === 'per_unit'
    ) {
      const bundleSize = discount.buyQuantity + discount.freeQuantity
      const fullBundles = Math.floor(quantityForPricing / bundleSize)
      const remainingUnits = quantityForPricing % bundleSize
      const chargedUnits =
        fullBundles * discount.buyQuantity + Math.min(remainingUnits, discount.buyQuantity)

      discountedTotal = chargedUnits * baseAmount
      savingsAmount = rawTotal - discountedTotal
      appliedDiscountLabel =
        discount.label ||
        `Buy ${discount.buyQuantity} get ${discount.freeQuantity} free`
    }
  }

  const hasDiscount = savingsAmount > 0.001
  const estimateLabel =
    calculationType === 'per_unit'
      ? `Estimated total for ${quantityForPricing} ${pricing?.unitLabel || 'units'}`
      : `Estimated total`

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

          {belowGalleryContent ? <Box sx={{ mt: 2.25 }}>{belowGalleryContent}</Box> : null}

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
              <Stack spacing={0.6}>
                {detailBadgeText ? (
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1.2,
                      py: 0.45,
                      borderRadius: 1,
                      backgroundColor: 'rgba(43, 120, 204, 0.12)',
                      color: COLORS.primary,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1 }}>
                      {detailBadgeText}
                    </Typography>
                  </Box>
                ) : null}

                <Typography
                  variant="h4"
                  sx={{ color: COLORS.primary, fontWeight: 800, fontSize: '2rem' }}
                >
                  {priceText}
                </Typography>

                {supportingInfoText ? (
                  <Typography
                    variant="body1"
                    sx={{ color: COLORS.textLight, fontSize: '0.98rem', fontWeight: 500 }}
                  >
                    {supportingInfoText}
                  </Typography>
                ) : null}

                <Box
                  sx={{
                    mt: 0.65,
                    px: 1.35,
                    py: 1.1,
                    borderRadius: 1.5,
                    backgroundColor: 'rgba(43, 120, 204, 0.08)',
                    border: `1px solid ${COLORS.borderStrong}`,
                  }}
                >
                  <Stack spacing={0.35}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Typography
                        variant="body2"
                        sx={{ color: COLORS.textLight, fontSize: '0.9rem', fontWeight: 600 }}
                      >
                        {estimateLabel}
                      </Typography>

                      <Typography
                        sx={{
                          color: COLORS.primary,
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          lineHeight: 1.1,
                          textAlign: 'right',
                        }}
                      >
                        {formatPrice(discountedTotal)}
                      </Typography>
                    </Stack>

                    {hasDiscount ? (
                      <Stack spacing={0.2}>
                        <Typography
                          sx={{
                            color: COLORS.textLight,
                            fontSize: '0.95rem',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatPrice(rawTotal)}
                        </Typography>
                        <Typography
                          sx={{
                            color: COLORS.accent,
                            fontSize: '0.9rem',
                            fontWeight: 600,
                          }}
                        >
                          Save {formatPrice(savingsAmount)}{appliedDiscountLabel ? ` with ${appliedDiscountLabel}` : ''}
                        </Typography>
                      </Stack>
                    ) : null}
                  </Stack>
                </Box>
              </Stack>
            ) : null}

            <Stack spacing={1}>
              {showPeopleSelector ? (
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1" sx={{ color: COLORS.textLight, fontSize: '1rem' }}>
                    {peopleLabel}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton
                      aria-label="Decrease people count"
                      onClick={() => handlePeopleChange('decrease')}
                      disabled={peopleCount <= 1}
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        backgroundColor: COLORS.footer,
                        color: COLORS.surface,
                        '&:hover': {
                          backgroundColor: COLORS.primary,
                        },
                        '&.Mui-disabled': {
                          backgroundColor: COLORS.border,
                          color: COLORS.textLight,
                        },
                      }}
                    >
                      <RemoveRoundedIcon />
                    </IconButton>

                    <InputBase
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        min: 0,
                        'aria-label': peopleLabel,
                      }}
                      value={peopleCount}
                      onChange={handlePeopleInputChange}
                      sx={{
                        width: 54,
                        height: 34,
                        px: 1,
                        borderRadius: 1.2,
                        border: `1px solid ${COLORS.borderStrong}`,
                        backgroundColor: COLORS.surface,
                        color: COLORS.textMuted,
                        fontWeight: 700,
                        '& input': {
                          p: 0,
                          textAlign: 'center',
                        },
                      }}
                    />

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
              ) : null}

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
                    placeholder: datePlaceholder,
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
                    placeholder: timePlaceholder,
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
              onClick={(event) =>
                onAddToCart?.({
                  event,
                  quantity: Math.max(quantityForPricing || 1, 1),
                  selectedDate: deliveryDate ? dayjs(deliveryDate).toISOString() : undefined,
                  customOptions: deliveryTime
                    ? { selectedTime: dayjs(deliveryTime).format('HH:mm') }
                    : undefined,
                })
              }
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
              {actionButtonText}
            </Button>
          </Stack>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default ServiceItemGalleryDialog
