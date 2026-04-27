import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'
import { addLocationFields } from '../../constants/profilePage'

const defaultFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: COLORS.surface,
  },
}

function LocationForm({
  values,
  onChange,
  onSubmit,
  submitLabel = 'Save Location',
  loading = false,
  error = '',
  fieldStyles = defaultFieldStyles,
  buttonSx,
  dense = false,
}) {
  const handleChange = (fieldId) => (event) => {
    onChange(fieldId, event.target.value)
  }

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Grid container spacing={dense ? 1.2 : { xs: 2, md: 2.5 }}>
        {addLocationFields.map((field) => (
          <Grid key={field.id} size={{ xs: 12, md: 6 }}>
            <Box>
              <Typography
                sx={{
                  mb: dense ? 0.45 : 0.8,
                  color: COLORS.primary,
                  fontWeight: dense ? 500 : 700,
                  fontSize: dense ? '0.86rem' : '1rem',
                }}
              >
                {field.label}
              </Typography>
              <TextField
                fullWidth
                required={field.required !== false}
                size="small"
                placeholder={field.placeholder}
                type={field.type || 'text'}
                value={values[field.id] || ''}
                onChange={handleChange(field.id)}
                slotProps={{
                  htmlInput: {
                    inputMode: field.inputMode,
                    maxLength: field.maxLength,
                    pattern: field.pattern,
                  },
                }}
                sx={fieldStyles}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      {error ? (
        <Typography
          sx={{
            mt: 1.5,
            color: '#d93a2e',
            fontSize: '0.9rem',
            fontWeight: 700,
            textAlign: 'center',
          }}
        >
          {error}
        </Typography>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{
          display: 'flex',
          mt: dense ? 1.4 : 3,
          mx: 'auto',
          minWidth: { xs: '100%', sm: dense ? 180 : 280 },
          borderRadius: 1,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: '1rem',
          py: 1,
          backgroundColor: COLORS.accent,
          '&:hover': {
            backgroundColor: COLORS.accentHover,
          },
          ...buttonSx,
        }}
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>
    </Box>
  )
}

export default LocationForm
