import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function NewsletterCTA({
  title = 'Stay ahead of the trends.',
  description = 'Get monthly inspiration, venue discounts, and planning checklists delivered to your inbox.',
  placeholder = 'Your email address',
  buttonLabel = 'Subscribe',
  fullBleed = false,
  backgroundImage,
}) {
  const hasBackgroundImage = Boolean(backgroundImage)

  return (
    <Box
      sx={{
        width: '100%',
        px: fullBleed ? 0 : { xs: 2, md: 0 },
        position: 'relative',
        left: fullBleed ? '50%' : 'auto',
        transform: fullBleed ? 'translateX(-50%)' : 'none',
        width: fullBleed ? '100vw' : '100%',
        py: fullBleed ? { xs: 6, md: 8 } : 0,
        backgroundImage: hasBackgroundImage
          ? `linear-gradient(rgba(15, 45, 75, 0.44), rgba(15, 45, 75, 0.44)), url(${backgroundImage})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 980,
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 4.5, md: 5.5 },
          borderRadius: 4,
          background: hasBackgroundImage
            ? 'linear-gradient(135deg, rgba(63, 132, 213, 0.92) 0%, rgba(52, 120, 201, 0.92) 100%)'
            : 'linear-gradient(135deg, #3f84d5 0%, #3478c9 100%)',
          boxShadow: '0 24px 50px rgba(43, 120, 204, 0.18)',
          textAlign: 'center',
        }}
      >
        <Stack spacing={1.4} alignItems="center">
          <Typography
            sx={{
              color: COLORS.surface,
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1.05,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.78)',
              fontSize: { xs: '0.98rem', md: '1.05rem' },
              lineHeight: 1.55,
              maxWidth: 520,
            }}
          >
            {description}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              width: '100%',
              maxWidth: 520,
              pt: 1.2,
            }}
          >
            <TextField
              fullWidth
              placeholder={placeholder}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 50,
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: COLORS.surface,
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.72)',
                    opacity: 1,
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              disableElevation
              sx={{
                minWidth: 150,
                height: 50,
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: COLORS.surface,
                color: COLORS.primary,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#f4f7fb',
                  boxShadow: 'none',
                },
              }}
            >
              {buttonLabel}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default NewsletterCTA
