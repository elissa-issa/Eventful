import { Box, Radio, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function PaymentMethodOptionCard({
  title,
  selected = false,
  description,
  fields = [],
  values = {},
  errors = {},
  onSelect,
  onFieldChange,
}) {
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 36,
      borderRadius: 0.6,
      backgroundColor: '#f7f7f7',
      fontSize: '0.82rem',
      '& fieldset': {
        borderColor: '#f0a36e',
      },
      '&:hover fieldset': {
        borderColor: '#eb914f',
      },
      '&.Mui-focused fieldset': {
        borderColor: COLORS.accent,
      },
    },
    '& .MuiOutlinedInput-input': {
      px: 1.1,
      py: 1,
    },
    '& .MuiFormHelperText-root': {
      mx: 0,
      mt: 0.35,
      fontSize: '0.72rem',
    },
  }

  return (
    <Box
      onClick={onSelect}
      sx={{
        borderRadius: 1.2,
        border: `1px solid ${selected ? COLORS.accent : '#f0a36e'}`,
        backgroundColor: COLORS.surface,
        px: { xs: 1.2, sm: 1.4 },
        py: { xs: 1.05, sm: 1.2 },
        cursor: 'pointer',
      }}
    >
      <Stack spacing={description ? 0.35 : 1.25}>
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <Radio
            checked={selected}
            onChange={onSelect}
            value={title}
            size="small"
            sx={{
              p: 0,
              color: COLORS.accent,
              '&.Mui-checked': {
                color: COLORS.accent,
              },
            }}
          />

          <Typography
            sx={{
              color: '#2a2a2a',
              fontSize: '0.95rem',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {description ? (
          <Typography
            sx={{
              pl: 3.4,
              color: '#6b6b6b',
              fontSize: '0.88rem',
              fontWeight: 400,
              lineHeight: 1.35,
              maxWidth: 520,
            }}
          >
            {description}
          </Typography>
        ) : null}

        {fields.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.25,
              pt: 0.2,
            }}
          >
            {fields.map((field) => (
              <Box key={field.id}>
                <Typography
                  sx={{
                    color: '#2f2f2f',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    mb: 0.45,
                  }}
                >
                  {field.label}
                </Typography>

                <TextField
                  fullWidth
                  required
                  size="small"
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ''}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => onFieldChange?.(field.id, event.target.value)}
                  error={Boolean(errors[field.id])}
                  helperText={errors[field.id] || ''}
                  sx={fieldSx}
                />
              </Box>
            ))}
          </Box>
        ) : null}
      </Stack>
    </Box>
  )
}

export default PaymentMethodOptionCard
