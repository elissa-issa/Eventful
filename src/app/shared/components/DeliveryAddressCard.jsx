import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'
import { addLocationFields } from '../../constants/profilePage'

function DeliveryAddressCard({ values, onFieldChange, onSavedLocationsClick }) {
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 36,
      borderRadius: 0.6,
      backgroundColor: '#f3f3f3',
      fontSize: '0.82rem',
      '& fieldset': {
        borderColor: '#dddddd',
      },
      '&:hover fieldset': {
        borderColor: '#d3d3d3',
      },
      '&.Mui-focused fieldset': {
        borderColor: COLORS.primary,
      },
    },
    '& .MuiOutlinedInput-input': {
      px: 1.1,
      py: 1,
    },
    '& .MuiInputLabel-root': {
      display: 'none',
    },
  }

  const labelSx = {
    color: COLORS.primary,
    fontSize: '0.86rem',
    fontWeight: 500,
    mb: 0.45,
  }

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${COLORS.primary}`,
        backgroundColor: COLORS.surface,
        px: { xs: 1.4, sm: 1.7 },
        py: { xs: 1.4, sm: 1.55 },
      }}
    >
      <Stack spacing={1.4}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Typography
            sx={{
              color: COLORS.primary,
              fontSize: { xs: '1.2rem', sm: '1.05rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            Delivery Address
          </Typography>

          <Button
            disableElevation
            variant="contained"
            onClick={onSavedLocationsClick}
            sx={{
              minWidth: 104,
              px: 1.4,
              py: 0.55,
              borderRadius: 0.8,
              backgroundColor: COLORS.accent,
              color: COLORS.surface,
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.accentHover,
                boxShadow: 'none',
              },
            }}
          >
            Saved Locations
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.2,
          }}
        >
          {addLocationFields.map((field) => (
            <Box key={field.id}>
              <Typography sx={labelSx}>{field.label}</Typography>
              <TextField
                fullWidth
                required={field.required !== false}
                placeholder={field.placeholder}
                size="small"
                type={field.type || 'text'}
                value={values[field.id] || ''}
                onChange={(event) => onFieldChange(field.id, event.target.value)}
                slotProps={{
                  htmlInput: {
                    inputMode: field.inputMode,
                    maxLength: field.maxLength,
                    pattern: field.pattern,
                  },
                }}
                sx={fieldSx}
              />
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}

export default DeliveryAddressCard
