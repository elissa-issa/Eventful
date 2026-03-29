import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

const SAVED_LOCATIONS = [
  {
    id: 'home',
    name: 'Home',
    address: '45 Marina Road, Jbeil, Lebanon 1200',
  },
  {
    id: 'venue',
    name: 'Venue',
    address: 'La Marina Hall, Jounieh Highway, 1101',
  },
  {
    id: 'office',
    name: 'Office',
    address: 'Fouad Chehab Avenue, Hazmieh, Beirut 2034',
  },
  {
    id: 'garden',
    name: 'Garden',
    address: 'Pine Residence, Faqra Main Road, Keserwan 1188',
  },
  {
    id: 'beach-house',
    name: 'Beach House',
    address: 'Seaside Road, Amchit Waterfront, Jbeil 1402',
  },
  {
    id: 'rooftop',
    name: 'Rooftop',
    address: 'Downtown Block C, Beirut Central District 2011',
  },
]

function SavedLocationsDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          border: `1px solid ${COLORS.primary}`,
          boxShadow: '0 16px 40px rgba(15, 45, 75, 0.18)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ px: { xs: 2, md: 2.6 }, py: { xs: 1.8, md: 2 } }}>
        <Stack spacing={1.6}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Typography
              sx={{
                color: COLORS.primary,
                fontSize: { xs: '1.7rem', md: '1.05rem' },
                fontWeight: 800,
              }}
            >
              Saved Locations
            </Typography>

            <IconButton
              aria-label="Close saved locations dialog"
              onClick={onClose}
              sx={{ color: COLORS.primary, p: 0.1, mt: -0.25, mr: -0.2 }}
            >
              <CloseRoundedIcon sx={{ fontSize: 34 }} />
            </IconButton>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Typography
              sx={{
                color: COLORS.accent,
                fontSize: '0.84rem',
                fontWeight: 500,
              }}
            >
              All Locations({SAVED_LOCATIONS.length})
            </Typography>

            <Typography
              sx={{
                color: COLORS.accent,
                fontSize: '0.84rem',
                fontWeight: 500,
              }}
            >
              + Add location
            </Typography>
          </Stack>

          <Box
            sx={{
              height: 178,
              overflowY: 'scroll',
              pr: 0.5,
              scrollbarWidth: 'thin',
              scrollbarColor: '#b8b8b8 #ffffff',
              '&::-webkit-scrollbar': {
                width: 14,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#ffffff',
                borderRadius: 999,
                border: '1px solid #bfbfbf',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#b8b8b8',
                borderRadius: 999,
                border: '2px solid #ffffff',
              },
            }}
          >
            <Stack spacing={1.2}>
              {SAVED_LOCATIONS.map((location) => (
                <Box
                  key={location.id}
                  sx={{
                    borderRadius: 1,
                    border: '1px solid #e5e5e5',
                    backgroundColor: COLORS.surface,
                    px: 1.5,
                    py: 1.2,
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography
                        sx={{
                          color: '#2c2c2c',
                          fontSize: '0.98rem',
                          fontWeight: 500,
                          mb: 0.4,
                        }}
                      >
                        {location.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#2f2f2f',
                          fontSize: '0.88rem',
                          fontWeight: 400,
                        }}
                      >
                        {location.address}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.3} sx={{ mt: 1.4, ml: 1 }}>
                      <IconButton aria-label={`Edit ${location.name} location`} sx={{ p: 0.25 }}>
                        <EditOutlinedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                      </IconButton>
                      <IconButton aria-label={`Delete ${location.name} location`} sx={{ p: 0.25 }}>
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default SavedLocationsDialog
