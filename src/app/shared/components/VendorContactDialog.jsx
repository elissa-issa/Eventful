import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { COLORS } from '../../constants/colors'

function ContactRow({ icon, label, value }) {
  if (!value) {
    return null
  }

  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: COLORS.primarySoft,
          color: COLORS.primary,
          flexShrink: 0,
          '& svg': { fontSize: 19 },
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.2}>
        <Typography sx={{ color: COLORS.textLight, fontSize: '0.82rem', fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  )
}

function VendorContactDialog({ open, vendor, onClose }) {
  const phone = vendor?.phone || vendor?.vendorPhone || ''
  const email = vendor?.email || vendor?.vendorEmail || ''

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 60px rgba(15, 45, 75, 0.22)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative' }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: COLORS.textMuted,
            '&:hover': {
              backgroundColor: COLORS.primarySoft,
              color: COLORS.primary,
            },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <Stack spacing={2.2}>
          <Stack spacing={0.45} sx={{ pr: 4 }}>
            <Typography sx={{ color: COLORS.primaryDark, fontWeight: 800, fontSize: '1.45rem' }}>
              Contact Details
            </Typography>
          </Stack>

          <Stack spacing={1.45}>
            <ContactRow icon={<PhoneRoundedIcon />} label="Phone number" value={phone} />
            <ContactRow icon={<EmailRoundedIcon />} label="Email address" value={email} />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: 2.5,
          pt: 0,
          gap: 1.2,
        }}
      >
        <Button
          fullWidth
          disableElevation
          component="a"
          href={phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined}
          disabled={!phone}
          variant="contained"
          sx={{
            borderRadius: 1.25,
            backgroundColor: COLORS.accent,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            py: 1.05,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.accentHover,
              boxShadow: 'none',
            },
          }}
        >
          Call Vendor
        </Button>
        <Button
          fullWidth
          disableElevation
          component="a"
          href={email ? `mailto:${email}` : undefined}
          disabled={!email}
          variant="contained"
          sx={{
            borderRadius: 1.25,
            backgroundColor: COLORS.primary,
            color: COLORS.surface,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            py: 1.05,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.primaryHover,
              boxShadow: 'none',
            },
          }}
        >
          Email Vendor
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VendorContactDialog
