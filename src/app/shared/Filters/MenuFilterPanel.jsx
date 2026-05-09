import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Switch } from '@mui/material'
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

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

function MenuFilterPanel({ value, locations = [], categories = [], onChange, onClearAll, onClose }) {
  const handleRangeChange = (key) => (_, nextValue) => {
    onChange?.({
      ...value,
      [key]: nextValue,
    })
  }

  const handleLocationChange = (_, nextValue) => {
    onChange?.({
      ...value,
      location: nextValue ?? '',
    })
  }

  const handleCategoryChange = (_, nextValue) => {
    onChange?.({
      ...value,
      categories: nextValue,
    })
  }

  const handleVeganToggle = (_, checked) => {
    onChange?.({
      ...value,
      veganOnly: checked,
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
            Filters on Menues
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
              aria-label="Close menu filters"
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
          <Typography sx={sectionHeaderStyles}>Category</Typography>

          <Autocomplete
            multiple
            disableCloseOnSelect
            options={categories}
            value={value.categories}
            onChange={handleCategoryChange}
            popupIcon={null}
            renderTags={(selected, getTagProps) => {
              const visibleTags = selected.slice(0, 2)
              const hiddenCount = selected.length - visibleTags.length

              return [
                ...visibleTags.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    deleteIcon={<CloseRoundedIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      height: 26,
                      backgroundColor: COLORS.primary,
                      color: COLORS.surface,
                      borderRadius: '999px',
                      '& .MuiChip-deleteIcon': {
                        color: COLORS.surface,
                      },
                    }}
                  />
                )),
                ...(hiddenCount > 0
                  ? [
                      <Chip
                        key="hidden-count"
                        label={`+ ${hiddenCount} more`}
                        sx={{
                          height: 26,
                          backgroundColor: '#8b8b8b',
                          color: COLORS.surface,
                          borderRadius: '999px',
                        }}
                      />,
                    ]
                  : []),
              ]
            }}
            renderOption={(props, option, { selected }) => (
              <Box component="li" {...props} sx={{ fontSize: '0.9rem', color: COLORS.surface }}>
                {selected ? (
                  <CheckBoxIcon sx={{ mr: 1, color: COLORS.surface, fontSize: 18 }} />
                ) : (
                  <CheckBoxOutlineBlankIcon
                    sx={{ mr: 1, color: 'rgba(255,255,255,0.7)', fontSize: 18 }}
                  />
                )}
                {option}
              </Box>
            )}
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
              paper: {
                sx: {
                  mt: 0.5,
                  borderRadius: 0,
                  backgroundColor: '#5d96d6',
                  color: COLORS.surface,
                  boxShadow: '0 10px 24px rgba(15, 45, 75, 0.18)',
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select category"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    fontSize: '0.9rem',
                    minHeight: 42,
                    alignItems: 'flex-start',
                    '& fieldset': {
                      borderColor: COLORS.primary,
                    },
                  },
                }}
              />
            )}
          />
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center">
          <Switch
            checked={value.veganOnly}
            onChange={handleVeganToggle}
            size="small"
            sx={{
              ml: -0.6,
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: COLORS.primary,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: COLORS.primary,
                opacity: 1,
              },
            }}
          />
          <Typography sx={{ color: COLORS.primary, fontWeight: 700, fontSize: '0.95rem' }}>
            Show Vegan Options Only
          </Typography>
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
      </Stack>
    </Box>
  )
}

export default MenuFilterPanel
