import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { COLORS } from '../../constants/colors'

function formatLocationAddress(location) {
  return [
    location.streetAddress,
    location.apartmentFloor,
    location.city,
    location.zipPostalCode,
  ]
    .filter(Boolean)
    .join(', ')
}

function SavedLocationsDialog({
  open,
  onClose,
  locations = [],
  loading = false,
  error = '',
  onAdd,
  onEdit,
  onDelete,
  onSelect,
}) {
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
              All Locations({locations.length})
            </Typography>

            <Button
              type="button"
              onClick={onAdd}
              sx={{
                minWidth: 0,
                p: 0,
                color: COLORS.accent,
                fontSize: '0.84rem',
                fontWeight: 500,
                textTransform: 'none',
              }}
            >
              + Add location
            </Button>
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
            {loading ? (
              <Box sx={{ height: 150, display: 'grid', placeItems: 'center' }}>
                <CircularProgress size={28} sx={{ color: COLORS.primary }} />
              </Box>
            ) : null}

            {!loading && error ? (
              <Typography sx={{ color: '#d93a2e', fontWeight: 700, fontSize: '0.9rem' }}>
                {error}
              </Typography>
            ) : null}

            {!loading && !error && locations.length === 0 ? (
              <Typography sx={{ color: COLORS.textLight, fontWeight: 600, fontSize: '0.9rem' }}>
                No saved locations yet.
              </Typography>
            ) : null}

            {!loading && !error ? (
              <Stack spacing={1.2}>
                {locations.map((location) => (
                <Box
                  key={location.id}
                  component="button"
                  type="button"
                  onClick={() => onSelect?.(location)}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: 1,
                    border: '1px solid #e5e5e5',
                    backgroundColor: COLORS.surface,
                    px: 1.5,
                    py: 1.2,
                    cursor: 'pointer',
                    transition: 'border-color 160ms ease, box-shadow 160ms ease',
                    '&:hover': {
                      borderColor: COLORS.primary,
                      boxShadow: '0 2px 8px rgba(15, 45, 75, 0.08)',
                    },
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
                        {location.locationName}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#2f2f2f',
                          fontSize: '0.88rem',
                          fontWeight: 400,
                        }}
                      >
                        {formatLocationAddress(location)}
                      </Typography>

                      <Typography
                        sx={{
                          color: COLORS.textLight,
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          mt: 0.35,
                        }}
                      >
                        {location.mobileNumber}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.3} sx={{ mt: 1.4, ml: 1 }}>
                      <IconButton
                        aria-label={`Edit ${location.locationName} location`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit?.(location)
                        }}
                        sx={{ p: 0.25 }}
                      >
                        <EditOutlinedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${location.locationName} location`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete?.(location)
                        }}
                        sx={{ p: 0.25 }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
                ))}
              </Stack>
            ) : null}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default SavedLocationsDialog
