import DoneRoundedIcon from '@mui/icons-material/DoneRounded'
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function AlertDialog({
  open,
  onClose,
  icon,
  useCheckIcon = false,
  iconBackgroundColor = COLORS.primary,
  iconColor = COLORS.surface,
  title,
  titleColor = COLORS.primary,
  description,
  descriptionColor = COLORS.textLight,
  primaryButtonText,
  primaryButtonColor = COLORS.accent,
  primaryButtonTextColor = COLORS.surface,
  onPrimaryButtonClick,
  secondaryActionText,
  secondaryActionColor = COLORS.primary,
  onSecondaryActionClick,
  disableBackdropClick = false,
}) {
  const handleClose = (_, reason) => {
    if (disableBackdropClick && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return
    }

    onClose?.()
  }

  const resolvedIcon = useCheckIcon ? <DoneRoundedIcon /> : icon

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          px: { xs: 1, sm: 2 },
          py: 2,
          boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
        },
      }}
    >
      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Stack spacing={resolvedIcon ? 2.25 : 1.5} alignItems="center" textAlign="center">
          {resolvedIcon ? (
            <Box
              sx={{
                width: { xs: 92, sm: 104 },
                height: { xs: 92, sm: 104 },
                borderRadius: '50%',
                backgroundColor: iconBackgroundColor,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': {
                  fontSize: { xs: 58, sm: 64 },
                },
              }}
            >
              {resolvedIcon}
            </Box>
          ) : null}

          <Stack spacing={1} sx={{ maxWidth: 360 }}>
            <Typography
              variant="h5"
              sx={{
                color: titleColor,
                fontWeight: 800,
                fontSize: { xs: '1.7rem', sm: '2rem' },
                lineHeight: 1.1,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: descriptionColor,
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.45,
              }}
            >
              {description}
            </Typography>
          </Stack>

          <Stack spacing={1} sx={{ width: '100%', alignItems: 'center', pt: 1 }}>
            <Button
              disableElevation
              variant="contained"
              onClick={onPrimaryButtonClick}
              sx={{
                minWidth: { xs: 220, sm: 270 },
                borderRadius: '999px',
                backgroundColor: primaryButtonColor,
                color: primaryButtonTextColor,
                textTransform: 'uppercase',
                fontWeight: 800,
                fontSize: '0.95rem',
                py: 1.35,
                px: 4,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: primaryButtonColor,
                  opacity: 0.92,
                  boxShadow: 'none',
                },
              }}
            >
              {primaryButtonText}
            </Button>

            {secondaryActionText ? (
              <Button
                variant="text"
                onClick={onSecondaryActionClick}
                sx={{
                  minHeight: 0,
                  color: secondaryActionColor,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  p: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {secondaryActionText}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default AlertDialog
