import { useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'
import { addLocationFields } from '../../constants/profilePage'

const initialFormValues = addLocationFields.reduce((values, field) => {
  values[field.id] = ''
  return values
}, {})

const dialogFieldStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1,
    backgroundColor: COLORS.surface,
  },
}

function AddLocationDialog({ open, onClose }) {
  const [formValues, setFormValues] = useState(initialFormValues)

  const handleChange = (fieldId) => (event) => {
    setFormValues((current) => ({
      ...current,
      [fieldId]: event.target.value,
    }))
  }

  const handleClose = () => {
    onClose?.()
  }

  const handleSubmit = () => {
    handleClose()
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
              Add New Location
            </Typography>

            <IconButton
              aria-label="Close add location dialog"
              onClick={handleClose}
              sx={{ color: COLORS.primary, mt: -0.5, mr: -0.5 }}
            >
              <CloseRoundedIcon sx={{ fontSize: 42 }} />
            </IconButton>
          </Stack>

          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {addLocationFields.map((field) => (
              <Grid key={field.id} size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography
                    sx={{
                      mb: 0.8,
                      color: COLORS.primary,
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    {field.label}
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={field.placeholder}
                    value={formValues[field.id]}
                    onChange={handleChange(field.id)}
                    sx={dialogFieldStyles}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              alignSelf: 'center',
              minWidth: { xs: '100%', sm: 280 },
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              py: 1,
              backgroundColor: COLORS.accent,
              '&:hover': {
                backgroundColor: COLORS.accentHover,
              },
            }}
          >
            Add Location
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default AddLocationDialog
