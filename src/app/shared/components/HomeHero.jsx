import { useEffect, useMemo, useState } from 'react'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Box,
  ClickAwayListener,
  IconButton,
  InputBase,
  Paper,
  Popover,
  Popper,
  Stack,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import { HERO_SLIDES } from '../../constants/heroSlides'
import { LEBANESE_CITIES } from '../../constants/lebaneseCities'
import HeroCarousel from './HeroCarousel'

const DATE_INPUT_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

const getDateFromInput = (value) => {
  const match = value.trim().match(DATE_INPUT_PATTERN)

  if (!match) {
    return null
  }

  const [, month, day, year] = match
  const parsedDate = dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)

  if (
    !parsedDate.isValid() ||
    parsedDate.year() !== Number(year) ||
    parsedDate.month() + 1 !== Number(month) ||
    parsedDate.date() !== Number(day)
  ) {
    return null
  }

  return parsedDate
}

function HomeHero() {
  const navigate = useNavigate()
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
  const [dateInputValue, setDateInputValue] = useState('')
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
    const query = searchFields.where.trim()
    const params = new URLSearchParams()

    if (query) {
      params.set('q', query)
    }

    if (searchFields.when) {
      params.set('date', searchFields.when)
    }

    if (totalGuests > 0) {
      params.set('guests', String(totalGuests))
      Object.entries(guestCounts).forEach(([guestType, count]) => {
        if (count > 0) {
          params.set(guestType, String(count))
        }
      })
    }

    if (!params.toString()) {
      navigate('/services')
      return
    }

    navigate(`/search?${params.toString()}`)
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

  const handleWhereChange = (event) => {
    setSearchFields((current) => ({
      ...current,
      where: event.target.value,
    }))

    if (!whereAnchorEl) {
      setWhereAnchorEl(event.currentTarget)
    }
  }

  const handleWhereKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleWherePickerClose()
      handleSearch()
    }
  }

  const handleWhenPickerOpen = (event) => {
    setDateInputValue(searchFields.when ? dayjs(searchFields.when).format('MM/DD/YYYY') : '')
    setWhenAnchorEl(event.currentTarget)
  }

  const handleWhenPickerClose = () => {
    setWhenAnchorEl(null)
  }

  const handleWhenChange = (value) => {
    setDateInputValue(value ? value.format('MM/DD/YYYY') : '')
    setSearchFields((current) => ({
      ...current,
      when: value ? value.format('YYYY-MM-DD') : '',
    }))
  }

  const handleDateInputChange = (event) => {
    const nextValue = event.target.value
    setDateInputValue(nextValue)

    if (!nextValue.trim()) {
      handleWhenChange(null)
      return
    }

    const parsedDate = getDateFromInput(nextValue)

    if (parsedDate) {
      setSearchFields((current) => ({
        ...current,
        when: parsedDate.format('YYYY-MM-DD'),
      }))
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

  const handleGuestCountInputChange = (guestType, value) => {
    const nextValue = Number(value)

    setGuestCounts((current) => ({
      ...current,
      [guestType]: Number.isFinite(nextValue) ? Math.max(0, Math.floor(nextValue)) : 0,
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
  const formattedWhen = searchFields.when ? dayjs(searchFields.when).format('MMM D, YYYY') : 'Add dates'
  const whenValue = searchFields.when ? dayjs(searchFields.when) : null
  const typedDate = getDateFromInput(dateInputValue)
  const isDateInputInvalid =
    dateInputValue.trim().length >= 10 &&
    !typedDate
  const totalGuests =
    guestCounts.adults + guestCounts.teenagers + guestCounts.children + guestCounts.infants
  const guestLabel = totalGuests > 0 ? `${totalGuests} guests` : 'Add guests'
  const normalizedWhere = searchFields.where.trim().toLowerCase()
  const suggestedCities = useMemo(
    () =>
      normalizedWhere
        ? LEBANESE_CITIES.filter((city) =>
            `${city.name} ${city.description}`.toLowerCase().includes(normalizedWhere),
          )
        : LEBANESE_CITIES,
    [normalizedWhere],
  )

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
                  <InputBase
                    fullWidth
                    value={searchFields.where}
                    placeholder="Search destinations"
                    onClick={handleWherePickerOpen}
                    onFocus={handleWherePickerOpen}
                    onChange={handleWhereChange}
                    onKeyDown={handleWhereKeyDown}
                    inputProps={{
                      'aria-label': 'Search destinations',
                    }}
                    sx={{
                      minHeight: 32,
                      color: searchFields.where ? COLORS.primaryDark : COLORS.textLight,
                      fontSize: '1.05rem',
                      fontWeight: searchFields.where ? 700 : 400,
                      '& input': {
                        p: 0,
                      },
                      '& input::placeholder': {
                        color: COLORS.textLight,
                        opacity: 1,
                      },
                    }}
                  />
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

            <Popper
              open={Boolean(whereAnchorEl)}
              anchorEl={whereAnchorEl}
              placement="bottom-start"
              sx={{ zIndex: 1300 }}
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, 12],
                  },
                },
              ]}
            >
              <ClickAwayListener onClickAway={handleWherePickerClose}>
                <Paper
                  elevation={8}
                  sx={{
                    width: 420,
                    maxWidth: 'calc(100vw - 24px)',
                    borderRadius: 4,
                    p: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -0.5 }}>
                      <IconButton
                        aria-label="Close destination picker"
                        onClick={handleWherePickerClose}
                        sx={{
                          width: 32,
                          height: 32,
                          color: COLORS.textLight,
                          '&:hover': {
                            backgroundColor: COLORS.primarySoft,
                            color: COLORS.primary,
                          },
                        }}
                      >
                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                    <Stack
                      spacing={0.5}
                      sx={{
                        maxHeight: 360,
                        overflowY: 'auto',
                        pr: 0.75,
                        '&::-webkit-scrollbar': {
                          width: 8,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          borderRadius: 999,
                          backgroundColor: 'rgba(15, 45, 75, 0.32)',
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {suggestedCities.map((city, index) => (
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
                      {suggestedCities.length === 0 && searchFields.where.trim() ? (
                        <Box
                          component="button"
                          type="button"
                          onClick={() => handleWhereSelect(searchFields.where.trim())}
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
                                backgroundColor: 'rgba(234, 122, 36, 0.12)',
                                color: COLORS.accent,
                                flexShrink: 0,
                              }}
                            >
                              <LocationOnRoundedIcon />
                            </Box>
                            <Box>
                              <Typography sx={{ color: '#2d2d2d', fontWeight: 700, fontSize: '1rem' }}>
                                {searchFields.where.trim()}
                              </Typography>
                              <Typography sx={{ color: COLORS.textLight, fontSize: '0.95rem' }}>
                                Use this custom destination
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ) : null}
                    </Stack>
                  </Stack>
                </Paper>
              </ClickAwayListener>
            </Popper>

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
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -0.5 }}>
                  <IconButton
                    aria-label="Close date picker"
                    onClick={handleWhenPickerClose}
                    sx={{
                      width: 32,
                      height: 32,
                      color: COLORS.textLight,
                      '&:hover': {
                        backgroundColor: COLORS.primarySoft,
                        color: COLORS.primary,
                      },
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
                <InputBase
                  value={dateInputValue}
                  placeholder="MM/DD/YYYY"
                  onChange={handleDateInputChange}
                  inputProps={{
                    'aria-label': 'Date in MM/DD/YYYY format',
                  }}
                  sx={{
                    mx: 1,
                    px: 1.75,
                    minHeight: 48,
                    borderRadius: 2,
                    border: `1px solid ${isDateInputInvalid ? '#d32f2f' : 'rgba(15, 45, 75, 0.22)'}`,
                    color: COLORS.primaryDark,
                    fontSize: '1rem',
                    '& input': {
                      p: 0,
                    },
                    '& input::placeholder': {
                      color: COLORS.textLight,
                      opacity: 1,
                    },
                  }}
                />
                <StaticDatePicker
                  value={whenValue}
                  onChange={handleWhenChange}
                  slotProps={{
                    actionBar: {
                      actions: [],
                    },
                  }}
                />
              </Stack>
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: -1 }}>
                  <IconButton
                    aria-label="Close guest picker"
                    onClick={handleWhoPickerClose}
                    sx={{
                      width: 32,
                      height: 32,
                      color: COLORS.textLight,
                      '&:hover': {
                        backgroundColor: COLORS.primarySoft,
                        color: COLORS.primary,
                      },
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
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
                        <InputBase
                          value={guestCounts[guestType.key]}
                          type="number"
                          inputProps={{
                            min: 0,
                            'aria-label': `${guestType.title} count`,
                          }}
                          onChange={(event) =>
                            handleGuestCountInputChange(guestType.key, event.target.value)
                          }
                          sx={{
                            width: 42,
                            height: 32,
                            color: '#2d2d2d',
                            fontSize: '1.1rem',
                            '& input': {
                              p: 0,
                              textAlign: 'center',
                              MozAppearance: 'textfield',
                            },
                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                              WebkitAppearance: 'none',
                              m: 0,
                            },
                          }}
                        />
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
