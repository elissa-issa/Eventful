import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'
import LocationForm from './LocationForm'

const dialogFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: COLORS.surface,
  },
}

function AddLocationDialog({
  open,
  onClose,
  title = 'Add New Location',
  values,
  onChange,
  onSubmit,
  submitLabel = 'Add Location',
  loading = false,
  error = '',
}) {
  const handleClose = () => {
    onClose?.()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.22)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ px: { xs: 2.5, md: 4.5 }, py: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={3}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography
              sx={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.2rem' },
            }}
          >
              {title}
            </Typography>

            <IconButton
              aria-label="Close add location dialog"
              onClick={handleClose}
              sx={{ color: COLORS.primary, mt: -0.5, mr: -0.5 }}
            >
              <CloseRoundedIcon sx={{ fontSize: 42 }} />
            </IconButton>
          </Stack>

          <LocationForm
            values={values}
            onChange={onChange}
            onSubmit={onSubmit}
            submitLabel={submitLabel}
            loading={loading}
            error={error}
            fieldStyles={dialogFieldStyles}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default AddLocationDialog
