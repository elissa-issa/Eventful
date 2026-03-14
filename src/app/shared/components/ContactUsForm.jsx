import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

const fieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: COLORS.surface,
    '& fieldset': {
      borderColor: COLORS.borderStrong,
    },
    '&:hover fieldset': {
      borderColor: COLORS.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: COLORS.primary,
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: COLORS.textLight,
    opacity: 1,
  },
}

function ContactUsForm({ onSubmit }) {
  const handleSubmit = (event) => {
    event.preventDefault()

    if (onSubmit) {
      const formData = new FormData(event.currentTarget)

      onSubmit({
        fullName: formData.get('fullName')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? '',
        message: formData.get('message')?.toString() ?? '',
      })
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 720,
        mx: 'auto',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 3.5 },
        border: `2px solid ${COLORS.primary}`,
        borderRadius: 1.5,
        backgroundColor: COLORS.surface,
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, color: COLORS.primaryDark, fontWeight: 600 }}
            >
              Full Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="fullName"
              placeholder="Enter your full name"
              sx={fieldStyles}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ mb: 0.75, color: COLORS.primaryDark, fontWeight: 600 }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="email"
              type="email"
              placeholder="Enter your email address"
              sx={fieldStyles}
            />
          </Box>
        </Stack>

        <Box>
          <Typography
            variant="body2"
            sx={{ mb: 0.75, color: COLORS.primaryDark, fontWeight: 600 }}
          >
            Message
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="message"
            placeholder="Type your message here..."
            sx={fieldStyles}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          disableElevation
          sx={{
            alignSelf: 'center',
            minWidth: { xs: 200, sm: 165 },
            px: 4,
            py: 1.25,
            borderRadius: '999px',
            backgroundColor: COLORS.accent,
            color: COLORS.surface,
            fontWeight: 800,
            textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.accentHover,
              boxShadow: 'none',
            },
          }}
        >
          Send Message
        </Button>
      </Stack>
    </Box>
  )
}

export default ContactUsForm
