import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function DeliveryAddressCard({ onSavedLocationsClick }) {
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
          <Box>
            <Typography sx={labelSx}>Location Name</Typography>
            <TextField
              fullWidth
              placeholder="e.g. Home, La Marina Venue"
              size="small"
              sx={fieldSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>City</Typography>
            <TextField fullWidth placeholder="e.g. Jounieh" size="small" sx={fieldSx} />
          </Box>

          <Box>
            <Typography sx={labelSx}>Street Adress</Typography>
            <TextField
              fullWidth
              placeholder="e.g. 45 Marina Road, Jounieh"
              size="small"
              sx={fieldSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Mobile Number</Typography>
            <TextField
              fullWidth
              placeholder="e.g. +961 70 123 456"
              size="small"
              sx={fieldSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Apartment / Floor (optional)</Typography>
            <TextField fullWidth placeholder="e.g. Apt. 3B, 2nd Floor" size="small" sx={fieldSx} />
          </Box>

          <Box>
            <Typography sx={labelSx}>ZIP / Postal Code</Typography>
            <TextField fullWidth placeholder="e.g. 1200" size="small" sx={fieldSx} />
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}

export default DeliveryAddressCard
