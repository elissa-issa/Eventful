import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Autocomplete,
  Box,
  Checkbox,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

const checkboxIcons = {
  checked: <CheckBoxIcon sx={{ color: COLORS.primary, fontSize: 20 }} />,
  unchecked: <CheckBoxOutlineBlankIcon sx={{ color: '#d9d9d9', fontSize: 20 }} />,
}

const sectionHeaderStyles = {
  color: COLORS.primary,
  fontWeight: 700,
  fontSize: '1rem',
}

const rangeCaptionStyles = {
  color: '#8f8f8f',
  fontSize: '0.78rem',
  lineHeight: 1,
}

function VenueFilterPanel({ value, locations = [], onChange, onClearAll, onClose }) {
  const handleRangeChange = (key) => (_, nextValue) => {
    onChange?.({
      ...value,
      [key]: nextValue,
    })
  }

  const handleToggle = (group, option) => (_, checked) => {
    onChange?.({
      ...value,
      [group]: {
        ...value[group],
        [option]: checked,
      },
    })
  }

  const handleLocationChange = (_, nextValue) => {
    onChange?.({
      ...value,
      location: nextValue ?? '',
    })
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 280,
        border: `1px solid ${COLORS.primary}`,
        borderRadius: 2,
        backgroundColor: COLORS.surface,
        alignSelf: 'flex-start',
        boxShadow: '0 10px 24px rgba(15, 45, 75, 0.08)',
      }}
    >
      <Stack spacing={3} sx={{ px: 2.25, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.92rem' }}>
            Filters on Venues
          </Typography>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Typography
              component="button"
              type="button"
              onClick={onClearAll}
              sx={{
                border: 'none',
                background: 'transparent',
                color: '#8f8f8f',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontFamily: 'inherit',
                p: 0,
              }}
            >
              Clear All
            </Typography>
            <IconButton
              aria-label="Close venue filters"
              onClick={onClose}
              size="small"
              sx={{ color: '#8f8f8f', p: 0.25 }}
            >
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography sx={sectionHeaderStyles}>Price Range</Typography>

          <Stack direction="row" justifyContent="space-between">
            <Typography sx={rangeCaptionStyles}>{value.priceRange[0]}$</Typography>
            <Typography sx={rangeCaptionStyles}>{value.priceRange[1]}$</Typography>
          </Stack>

          <Slider
            value={value.priceRange}
            onChange={handleRangeChange('priceRange')}
            min={0}
            max={100}
            step={5}
            sx={{
              color: COLORS.primary,
              py: 0,
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
              },
              '& .MuiSlider-rail': {
                color: '#b8b8b8',
                opacity: 1,
              },
            }}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography sx={sectionHeaderStyles}>Quantity</Typography>

          <Stack direction="row" justifyContent="space-between">
            <Typography sx={rangeCaptionStyles}>{value.quantityRange[0]} pers</Typography>
            <Typography sx={rangeCaptionStyles}>{value.quantityRange[1]} pers</Typography>
          </Stack>

          <Slider
            value={value.quantityRange}
            onChange={handleRangeChange('quantityRange')}
            min={1}
            max={500}
            step={5}
            sx={{
              color: COLORS.primary,
              py: 0,
              '& .MuiSlider-thumb': {
                width: 10,
                height: 10,
              },
              '& .MuiSlider-rail': {
                color: '#b8b8b8',
                opacity: 1,
              },
            }}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography sx={sectionHeaderStyles}>Location</Typography>

          <Autocomplete
            freeSolo
            options={locations}
            value={value.location}
            onChange={handleLocationChange}
            onInputChange={handleLocationChange}
            slotProps={{
              popper: {
                placement: 'bottom-start',
                modifiers: [
                  {
                    name: 'flip',
                    enabled: false,
                  },
                ],
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Beirut"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: '0.9rem',
                    minHeight: 42,
                    '& fieldset': {
                      borderColor: COLORS.primary,
                    },
                  },
                }}
              />
            )}
            clearIcon={<CloseRoundedIcon sx={{ color: '#8f8f8f', fontSize: 15 }} />}
            forcePopupIcon={false}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography sx={sectionHeaderStyles}>Placement</Typography>

          <Stack direction="row" spacing={1.1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Checkbox
              checked={value.placement.indoor}
              onChange={handleToggle('placement', 'indoor')}
              icon={checkboxIcons.unchecked}
              checkedIcon={checkboxIcons.checked}
              sx={{ p: 0 }}
            />
            <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.8rem' }}>
              Indoor
            </Typography>

            <Checkbox
              checked={value.placement.outdoor}
              onChange={handleToggle('placement', 'outdoor')}
              icon={checkboxIcons.unchecked}
              checkedIcon={checkboxIcons.checked}
              sx={{ p: 0, ml: 1 }}
            />
            <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.9rem' }}>
              Outdoor
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography sx={sectionHeaderStyles}>Time</Typography>

          <Stack direction="row" spacing={1.1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Checkbox
              checked={value.time.day}
              onChange={handleToggle('time', 'day')}
              icon={checkboxIcons.unchecked}
              checkedIcon={checkboxIcons.checked}
              sx={{ p: 0 }}
            />
            <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.9rem' }}>
              Day
            </Typography>

            <Checkbox
              checked={value.time.night}
              onChange={handleToggle('time', 'night')}
              icon={checkboxIcons.unchecked}
              checkedIcon={checkboxIcons.checked}
              sx={{ p: 0, ml: 2 }}
            />
            <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.9rem' }}>
              Night
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default VenueFilterPanel
