import { useEffect, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, IconButton, Popover, Stack, Typography } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { COLORS } from '../../constants/colors'
import { HERO_SLIDES } from '../../constants/heroSlides'
import { LEBANESE_CITIES } from '../../constants/lebaneseCities'
import HeroCarousel from './HeroCarousel'

function HomeHero() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [searchFields, setSearchFields] = useState({
    where: '',
    when: '',
  })
  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    teenagers: 0,
    children: 0,
    infants: 0,
  })
  const [whereAnchorEl, setWhereAnchorEl] = useState(null)
  const [whenAnchorEl, setWhenAnchorEl] = useState(null)
  const [whoAnchorEl, setWhoAnchorEl] = useState(null)

  const handleSlideChange = (direction) => {
    setActiveSlideIndex((current) => {
      if (direction === 'left') {
        return current === 0 ? HERO_SLIDES.length - 1 : current - 1
      }

      return current === HERO_SLIDES.length - 1 ? 0 : current + 1
    })
  }

  const handleSearch = () => {
    console.log('Homepage search submitted', {
      ...searchFields,
      guests: guestCounts,
    })
  }

  const handleWherePickerOpen = (event) => {
    setWhereAnchorEl(event.currentTarget)
  }

  const handleWherePickerClose = () => {
    setWhereAnchorEl(null)
  }

  const handleWhereSelect = (cityName) => {
    setSearchFields((current) => ({
      ...current,
      where: cityName,
    }))
    handleWherePickerClose()
  }

  const handleWhenPickerOpen = (event) => {
    setWhenAnchorEl(event.currentTarget)
  }

  const handleWhenPickerClose = () => {
    setWhenAnchorEl(null)
  }

  const handleWhenChange = (value) => {
    setSearchFields((current) => ({
      ...current,
      when: value ? value.format('YYYY-MM-DD') : '',
    }))

    if (value) {
      handleWhenPickerClose()
    }
  }

  const handleWhoPickerOpen = (event) => {
    setWhoAnchorEl(event.currentTarget)
  }

  const handleWhoPickerClose = () => {
    setWhoAnchorEl(null)
  }

  const handleGuestCountChange = (guestType, direction) => {
    setGuestCounts((current) => ({
      ...current,
      [guestType]:
        direction === 'increase'
          ? current[guestType] + 1
          : Math.max(0, current[guestType] - 1),
    }))
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((current) => (current === HERO_SLIDES.length - 1 ? 0 : current + 1))
    }, 6000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const activeSlide = HERO_SLIDES[activeSlideIndex]
  const whereLabel = searchFields.where || 'Search destinations'
  const formattedWhen = searchFields.when ? dayjs(searchFields.when).format('MMM D') : 'Add dates'
  const whenValue = searchFields.when ? dayjs(searchFields.when) : null
  const totalGuests =
    guestCounts.adults + guestCounts.teenagers + guestCounts.children + guestCounts.infants
  const guestLabel = totalGuests > 0 ? `${totalGuests} guests` : 'Add guests'

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <HeroCarousel
        slides={HERO_SLIDES}
        activeSlideIndex={activeSlideIndex}
        onSlideChange={handleSlideChange}
        onSlideSelect={setActiveSlideIndex}
        minHeight={{ xs: 380, md: 470 }}
        fullBleed
        marginTop="-50px"
      >
        <Stack
          sx={{
            minHeight: { xs: 380, md: 470 },
            px: { xs: 2, sm: 3, md: 5 },
            py: { xs: 8, md: 9 },
            justifyContent: 'center',
          }}
        >
          <Stack
            spacing={2.5}
            sx={{
              maxWidth: 860,
              width: '100%',
              mx: 'auto',
              alignItems: 'center',
            }}
          >
            <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Typography
                variant="overline"
                sx={{
                  color: 'rgba(255, 255, 255, 0.82)',
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                }}
              >
                {activeSlide.eyebrow}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: COLORS.surface,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  fontSize: { xs: '1.9rem', md: '3.25rem' },
                  maxWidth: 760,
                }}
              >
                {activeSlide.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontSize: { xs: '0.95rem', md: '1.02rem' },
                  maxWidth: 620,
                }}
              >
                {activeSlide.description}
              </Typography>
            </Stack>

            <Box
              sx={{
                width: '100%',
                maxWidth: 860,
                p: { xs: 1, md: 1.1 },
                borderRadius: { xs: 4, md: '999px' },
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                boxShadow: '0 18px 45px rgba(15, 45, 75, 0.2)',
                mx: 'auto',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Stack sx={{ flex: 1, px: 2.25, py: { xs: 1.25, md: 0.75 } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.primaryDark,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    Where
                  </Typography>
                  <Box
                    onClick={handleWherePickerOpen}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleWherePickerOpen(event)
                      }
                    }}
                    sx={{
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      color: searchFields.where ? COLORS.primaryDark : COLORS.textLight,
                      fontSize: '1.05rem',
                      fontWeight: searchFields.where ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography component="span" sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                      {whereLabel}
                    </Typography>
                  </Box>
                </Stack>

                <Stack sx={{ flex: 1, px: 2.25, py: { xs: 1.25, md: 0.75 } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.primaryDark,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    When
                  </Typography>
                  <Box
                    onClick={handleWhenPickerOpen}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleWhenPickerOpen(event)
                      }
                    }}
                    sx={{
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      color: searchFields.when ? COLORS.primaryDark : COLORS.textLight,
                      fontSize: '1.05rem',
                      fontWeight: searchFields.when ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography component="span" sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                      {formattedWhen}
                    </Typography>
                  </Box>
                </Stack>

                <Stack sx={{ flex: 1, px: 2.25, py: { xs: 1.25, md: 0.75 } }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: COLORS.primaryDark,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    Who
                  </Typography>
                  <Box
                    onClick={handleWhoPickerOpen}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleWhoPickerOpen(event)
                      }
                    }}
                    sx={{
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      color: totalGuests > 0 ? COLORS.primaryDark : COLORS.textLight,
                      fontSize: '1.05rem',
                      fontWeight: totalGuests > 0 ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    <Typography component="span" sx={{ color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit' }}>
                      {guestLabel}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ p: { xs: 1, md: 0.5 } }}>
                  <IconButton
                    aria-label="Search events"
                    onClick={handleSearch}
                    sx={{
                      width: 58,
                      height: 58,
                      color: COLORS.surface,
                      backgroundColor: COLORS.accent,
                      '&:hover': {
                        backgroundColor: COLORS.accentHover,
                      },
                    }}
                  >
                    <SearchRoundedIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Box>

            <Popover
              open={Boolean(whereAnchorEl)}
              anchorEl={whereAnchorEl}
              onClose={handleWherePickerClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 420,
                  maxWidth: 'calc(100vw - 24px)',
                  maxHeight: 420,
                  overflowY: 'auto',
                  borderRadius: 4,
                  p: 1.5,
                },
              }}
            >
              <Stack spacing={0.5}>
                {LEBANESE_CITIES.map((city, index) => (
                  <Box
                    key={city.id}
                    component="button"
                    type="button"
                    onClick={() => handleWhereSelect(city.name)}
                    sx={{
                      width: '100%',
                      border: 0,
                      borderRadius: 3,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      px: 1,
                      py: 1.25,
                      transition: 'background-color 180ms ease',
                      '&:hover': {
                        backgroundColor: COLORS.primarySoft,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          backgroundColor:
                            index % 2 === 0 ? 'rgba(234, 122, 36, 0.12)' : 'rgba(43, 120, 204, 0.12)',
                          color: index % 2 === 0 ? COLORS.accent : COLORS.primary,
                          flexShrink: 0,
                        }}
                      >
                        <LocationOnRoundedIcon />
                      </Box>
                      <Box>
                        <Typography sx={{ color: '#2d2d2d', fontWeight: 700, fontSize: '1rem' }}>
                          {city.name}
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.95rem' }}>
                          {city.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Popover>

            <Popover
              open={Boolean(whenAnchorEl)}
              anchorEl={whenAnchorEl}
              onClose={handleWhenPickerClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  p: 2,
                  borderRadius: 4,
                },
              }}
            >
              <DatePicker
                value={whenValue}
                onChange={handleWhenChange}
                minDate={dayjs().startOf('day')}
                slotProps={{
                  textField: {
                    sx: {
                      width: 260,
                    },
                  },
                }}
              />
            </Popover>

            <Popover
              open={Boolean(whoAnchorEl)}
              anchorEl={whoAnchorEl}
              onClose={handleWhoPickerClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  width: 420,
                  maxWidth: 'calc(100vw - 24px)',
                  borderRadius: 4,
                  px: 3,
                  py: 2.5,
                },
              }}
            >
              <Stack spacing={2.5}>
                {[
                  { key: 'adults', title: 'Adults', subtitle: 'Ages 13 or above' },
                  { key: 'teenagers', title: 'Teenagers', subtitle: 'Ages 13 - 17' },
                  { key: 'children', title: 'Children', subtitle: 'Ages 2 - 12' },
                  { key: 'infants', title: 'Infants', subtitle: 'Under 2' },
                ].map((guestType, index, guestTypes) => (
                  <Box key={guestType.key}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography sx={{ color: '#2d2d2d', fontWeight: 700, fontSize: '1rem' }}>
                          {guestType.title}
                        </Typography>
                        <Typography sx={{ color: COLORS.textLight, fontSize: '0.95rem' }}>
                          {guestType.subtitle}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconButton
                          aria-label={`Decrease ${guestType.title.toLowerCase()}`}
                          onClick={() => handleGuestCountChange(guestType.key, 'decrease')}
                          disabled={guestCounts[guestType.key] === 0}
                          sx={{
                            width: 32,
                            height: 32,
                            border: '1px solid #b8b8b8',
                            color: '#5d5d5d',
                          }}
                        >
                          <RemoveRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Typography sx={{ minWidth: 18, textAlign: 'center', color: '#2d2d2d', fontSize: '1.1rem' }}>
                          {guestCounts[guestType.key]}
                        </Typography>
                        <IconButton
                          aria-label={`Increase ${guestType.title.toLowerCase()}`}
                          onClick={() => handleGuestCountChange(guestType.key, 'increase')}
                          sx={{
                            width: 32,
                            height: 32,
                            border: '1px solid #b8b8b8',
                            color: '#5d5d5d',
                          }}
                        >
                          <AddRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                    {index < guestTypes.length - 1 ? (
                      <Box
                        sx={{
                          mt: 2.5,
                          borderBottom: '1px solid #ececec',
                        }}
                      />
                    ) : null}
                  </Box>
                ))}
              </Stack>
            </Popover>
          </Stack>
        </Stack>
      </HeroCarousel>
    </LocalizationProvider>
  )
}

export default HomeHero
