import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded'
import { Box, IconButton, Stack } from '@mui/material'
import { COLORS } from '../../constants/colors'

function HeroCarousel({
  slides,
  activeSlideIndex,
  onSlideChange,
  onSlideSelect,
  minHeight = { xs: 380, md: 470 },
  fullBleed = false,
  marginTop = 0,
  borderRadius = 5,
  overlayGradient = 'linear-gradient(120deg, rgba(15, 45, 75, 0.75), rgba(15, 45, 75, 0.2))',
  children,
}) {
  const activeSlide = slides[activeSlideIndex]

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight,
        width: fullBleed ? '100vw' : '100%',
        left: fullBleed ? '50%' : 'auto',
        transform: fullBleed ? 'translateX(-50%)' : 'none',
        mt: marginTop,
        overflow: 'hidden',
        borderRadius: fullBleed ? 0 : borderRadius,
        boxShadow: `0 24px 60px ${COLORS.shadow}`,
      }}
    >
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: index === activeSlideIndex ? 1 : 0,
            transform: index === activeSlideIndex ? 'scale(1)' : 'scale(1.04)',
            transition: 'opacity 450ms ease, transform 450ms ease',
            backgroundImage: `${overlayGradient}, url(${slide.imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}

      <IconButton
        aria-label="Show previous slide"
        onClick={() => onSlideChange('left')}
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 28 },
          left: { xs: 20, md: 28 },
          zIndex: 2,
          width: 48,
          height: 48,
          color: COLORS.surface,
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.28)',
          },
        }}
      >
        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <IconButton
        aria-label="Show next slide"
        onClick={() => onSlideChange('right')}
        sx={{
          position: 'absolute',
          top: { xs: 20, md: 28 },
          right: { xs: 20, md: 28 },
          zIndex: 2,
          width: 48,
          height: 48,
          color: COLORS.surface,
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.28)',
          },
        }}
      >
        <ArrowForwardIosRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Box sx={{ position: 'relative', zIndex: 1, minHeight }}>
        {typeof children === 'function' ? children(activeSlide) : children}
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: { xs: 18, md: 22 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          justifyContent: 'center',
        }}
      >
        {slides.map((slide, index) => (
          <Box
            key={slide.id}
            component="button"
            type="button"
            aria-label={`Show slide ${index + 1}`}
            onClick={() => onSlideSelect(index)}
            sx={{
              border: 0,
              p: 0,
              width: index === activeSlideIndex ? 34 : 10,
              height: 10,
              borderRadius: '999px',
              backgroundColor:
                index === activeSlideIndex ? COLORS.surface : 'rgba(255, 255, 255, 0.45)',
              cursor: 'pointer',
              transition: 'all 250ms ease',
            }}
          />
        ))}
      </Stack>
    </Box>
  )
}

export default HeroCarousel
