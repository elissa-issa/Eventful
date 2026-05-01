import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import { updateProfile } from '../services/auth'
import AddLocationDialog from '../shared/components/AddLocationDialog'
import AlertDialog from '../shared/components/AlertDialog'
import {
  emptyLocationValues,
  getLocationValidationError,
  normalizeLocationValues,
} from '../shared/utils/locationForm'
import {
  createSavedLocation,
  deleteSavedLocation,
  getSavedLocations,
  updateSavedLocation,
} from '../services/savedLocations'
import {
  profileFieldStyles,
  profileOrders,
  profileSectionTitleStyles,
} from '../constants/profilePage'

function formatLocationSubtitle(location) {
  return [location.streetAddress, location.city, location.zipPostalCode].filter(Boolean).join(', ')
}

function formatBirthdayInputValue(birthday) {
  if (!birthday) {
    return ''
  }

  const birthdayDate = new Date(birthday)

  if (Number.isNaN(birthdayDate.getTime())) {
    return ''
  }

  return birthdayDate.toISOString().slice(0, 10)
}

function getProfileFormValues(user) {
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    password: '..............',
    birthday: formatBirthdayInputValue(user?.birthday),
  }
}

function OrderHistoryDialog({ open, onClose, orders = [] }) {
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 760,
          maxHeight: 'min(88vh, 760px)',
          borderRadius: 2.5,
          overflow: 'hidden',
          backgroundColor: COLORS.surface,
        },
      }}
    >
      <Stack sx={{ px: { xs: 2, sm: 3 }, py: 2, minHeight: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ gap: 2, mb: 1.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              color: COLORS.primary,
              fontWeight: 800,
              fontSize: { xs: '1.7rem', md: '1.9rem' },
            }}
          >
            Order History
          </Typography>

          <IconButton
            aria-label="Close order history"
            onClick={onClose}
            sx={{ color: COLORS.primary, p: 0.25 }}
          >
            <CloseRoundedIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Stack>

        <Divider sx={{ borderColor: COLORS.borderStrong, mb: 1.5 }} />

        <Typography sx={{ color: COLORS.accent, fontSize: '1.02rem', fontWeight: 500, mb: 1.75 }}>
          All Orders ({orders.length})
        </Typography>

        <Box sx={{ maxHeight: '62vh', overflowY: 'auto', pr: 1, pb: 0.5 }}>
          <Stack spacing={1.5}>
            {orders.map((order) => (
              <Box
                key={order.id}
                sx={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 2,
                  px: { xs: 1.2, md: 1.5 },
                  py: 1,
                  boxShadow: `0 1px 4px ${COLORS.shadow}`,
                }}
              >
                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 106,
                          height: 74,
                          borderRadius: 1.5,
                          backgroundColor: '#000',
                          color: COLORS.surface,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 900,
                          fontSize: '2rem',
                          letterSpacing: '-0.06em',
                          flexShrink: 0,
                        }}
                      >
                        RODGE
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: COLORS.primary,
                            fontWeight: 800,
                            fontSize: '1.05rem',
                          }}
                        >
                          {order.item}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            mt: 1,
                            borderRadius: '999px',
                            textTransform: 'none',
                            backgroundColor: COLORS.accent,
                            minWidth: 0,
                            px: 1.3,
                            fontSize: '0.72rem',
                            '&:hover': {
                              backgroundColor: COLORS.accentHover,
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      sx={{
                        color: order.statusColor,
                        fontWeight: 800,
                        textAlign: { xs: 'left', md: 'center' },
                      }}
                    >
                      {order.status}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography
                      sx={{
                        color: COLORS.primary,
                        fontWeight: 800,
                        textAlign: 'right',
                        fontSize: '1.05rem',
                      }}
                    >
                      {order.total}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Dialog>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const { token, user, logout, replaceAuth } = useAuth()
  const profileImageInputRef = useRef(null)
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [profileFormValues, setProfileFormValues] = useState(() => getProfileFormValues(user))
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [savedLocations, setSavedLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(false)
  const [locationsError, setLocationsError] = useState('')
  const [locationFormValues, setLocationFormValues] = useState(emptyLocationValues)
  const [editingLocation, setEditingLocation] = useState(null)
  const [pendingDeleteLocation, setPendingDeleteLocation] = useState(null)
  const [locationFormError, setLocationFormError] = useState('')
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationDeleting, setLocationDeleting] = useState(false)
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'
  const avatarLabel =
    `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.trim() || 'U'
  const profileFields = useMemo(
    () => [
      { id: 'firstName', label: 'First Name', size: { xs: 12, md: 6 } },
      { id: 'lastName', label: 'Last Name', size: { xs: 12, md: 6 } },
      {
        id: 'username',
        label: 'Username',
        size: { xs: 12, md: 6 },
      },
      { id: 'email', label: 'Email', size: { xs: 12, md: 6 }, type: 'email' },
      { id: 'password', label: 'Password', size: { xs: 12, md: 6 }, type: 'password' },
      {
        id: 'birthday',
        label: 'Birthday',
        size: { xs: 12, md: 6 },
        type: 'date',
      },
    ],
    [],
  )

  useEffect(() => {
    if (!isEditingProfile) {
      setProfileFormValues(getProfileFormValues(user))
    }
  }, [isEditingProfile, user])

  const loadSavedLocations = useCallback(async () => {
    if (!token) {
      return
    }

    setLocationsLoading(true)
    setLocationsError('')

    try {
      const result = await getSavedLocations(token)
      setSavedLocations(result.data || [])
    } catch (error) {
      setLocationsError(error.message || 'Could not load saved locations')
    } finally {
      setLocationsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSavedLocations()
  }, [loadSavedLocations])

  const handleLogout = () => {
    logout()
    navigate('/home', { replace: true })
  }

  const handleSwitchAccount = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleProfileFieldChange = (fieldId, value) => {
    setProfileFormValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }))
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
  }

  const saveProfileUpdates = async (updates = {}) => {
    setProfileSaving(true)
    setProfileError('')

    try {
      const result = await updateProfile({
        firstName: profileFormValues.firstName,
        lastName: profileFormValues.lastName,
        email: profileFormValues.email,
        birthday: profileFormValues.birthday || null,
        avatarSrc: user?.avatarSrc || '',
        ...updates,
      })

      replaceAuth({
        token: result.data.token,
        user: {
          ...result.data.user,
          username: profileFormValues.username.trim(),
        },
      })
      setIsEditingProfile(false)
    } catch (error) {
      setProfileError(error.message || 'Could not save profile changes')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveProfile = () => {
    saveProfileUpdates()
  }

  const handleUploadImageClick = () => {
    profileImageInputRef.current?.click()
  }

  const handleProfileImageChange = (event) => {
    const [file] = event.target.files || []

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose an image file')
      event.target.value = ''
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Please choose an image smaller than 2MB')
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      saveProfileUpdates({ avatarSrc: reader.result })
      event.target.value = ''
    }

    reader.onerror = () => {
      setProfileError('Could not read the selected image')
      event.target.value = ''
    }

    reader.readAsDataURL(file)
  }

  const openAddLocationDialog = () => {
    setEditingLocation(null)
    setLocationFormValues(emptyLocationValues)
    setLocationFormError('')
    setIsAddLocationDialogOpen(true)
  }

  const openEditLocationDialog = (location) => {
    setEditingLocation(location)
    setLocationFormValues(normalizeLocationValues(location))
    setLocationFormError('')
    setIsAddLocationDialogOpen(true)
  }

  const closeLocationDialog = () => {
    setIsAddLocationDialogOpen(false)
    setEditingLocation(null)
    setLocationFormValues(emptyLocationValues)
    setLocationFormError('')
  }

  const handleLocationFormChange = (fieldId, value) => {
    setLocationFormValues((current) => ({
      ...current,
      [fieldId]: value,
    }))
  }

  const handleLocationSubmit = async (event) => {
    event.preventDefault()

    const validationError = getLocationValidationError(locationFormValues)

    if (validationError) {
      setLocationFormError(validationError)
      return
    }

    setLocationSaving(true)
    setLocationFormError('')

    try {
      if (editingLocation) {
        await updateSavedLocation(editingLocation.id, locationFormValues, token)
      } else {
        await createSavedLocation(locationFormValues, token)
      }

      closeLocationDialog()
      await loadSavedLocations()
    } catch (error) {
      setLocationFormError(error.message || 'Could not save location')
    } finally {
      setLocationSaving(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!pendingDeleteLocation) {
      return
    }

    setLocationDeleting(true)
    try {
      await deleteSavedLocation(pendingDeleteLocation.id, token)
      setPendingDeleteLocation(null)
      await loadSavedLocations()
    } catch (error) {
      setLocationsError(error.message || 'Could not delete location')
    } finally {
      setLocationDeleting(false)
    }
  }

  return (
    <Box
      sx={{
        py: { xs: 4, md: 5 },
      }}
    >
      <Box
        sx={{
          backgroundColor: COLORS.surface,
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Grid container spacing={0}>
          <Grid size={{ xs: 12, md: 3.2 }}>
            <Box
              sx={{
                position: { xs: 'static', md: 'sticky' },
                top: 24,
                pr: { xs: 0, md: 4 },
                height: 'fit-content',
              }}
            >
              <Stack
                alignItems="center"
                sx={{
                  height: '100%',
                }}
              >
                <Typography
                  sx={{ ...profileSectionTitleStyles, alignSelf: { md: 'flex-start' } }}
                >
                  Profile
                </Typography>

                <Avatar
                  src={user?.avatarSrc || undefined}
                  sx={{
                    width: 116,
                    height: 116,
                    mt: 2.5,
                    mb: 2,
                    backgroundColor: COLORS.accent,
                    fontSize: '2.5rem',
                    fontWeight: 800,
                  }}
                >
                  {avatarLabel}
                </Avatar>

                <Typography
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    fontSize: '2rem',
                  }}
                >
                  {displayName}
                </Typography>

                <Stack direction="row" spacing={2.5} sx={{ mt: 1.75, mb: 4 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate('/favorites')}
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      p: 0,
                      border: 0,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <FavoriteRoundedIcon sx={{ color: '#ff1f1f', fontSize: 40 }} />
                  </Box>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate('/collections')}
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      p: 0,
                      border: 0,
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <ShoppingCartRoundedIcon sx={{ color: COLORS.accent, fontSize: 40 }} />
                  </Box>
                </Stack>

                <Stack spacing={1.3} sx={{ width: '100%', maxWidth: 250 }}>
                  <Box
                    component="input"
                    ref={profileImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    sx={{ display: 'none' }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleUploadImageClick}
                    disabled={profileSaving}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      backgroundColor: COLORS.primary,
                      '&:hover': {
                        backgroundColor: COLORS.primaryHover,
                      },
                    }}
                  >
                    {profileSaving ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSwitchAccount}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      backgroundColor: COLORS.accent,
                      '&:hover': {
                        backgroundColor: COLORS.accentHover,
                      },
                    }}
                  >
                    Switch account
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      backgroundColor: '#f44336',
                      '&:hover': {
                        backgroundColor: '#d93a2e',
                      },
                    }}
                  >
                    Log out
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid
            size={{ xs: 12, md: 8.8 }}
            sx={{
              borderLeft: { xs: 'none', md: '1px solid #cfcfcf' },
              pl: { xs: 0, md: 4 },
              mt: { xs: 4, md: 0 },
            }}
          >
            <Stack spacing={4.5}>
              <Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mb: 2.2 }}
                >
                  <Typography sx={profileSectionTitleStyles}>Basic Info</Typography>
                  <Button
                    variant="contained"
                    disabled={profileSaving}
                    onClick={isEditingProfile ? handleSaveProfile : handleEditProfile}
                    sx={{
                      borderRadius: '999px',
                      textTransform: 'none',
                      px: 2.25,
                      py: 0.5,
                      backgroundColor: isEditingProfile ? COLORS.primary : COLORS.accent,
                      '&:hover': {
                        backgroundColor: isEditingProfile ? COLORS.primaryHover : COLORS.accentHover,
                      },
                    }}
                  >
                    {profileSaving
                      ? 'Saving...'
                      : isEditingProfile
                        ? 'Save changes'
                        : 'Edit profile'}
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2.5, borderColor: '#cfcfcf' }} />

                {profileError ? (
                  <Typography sx={{ color: '#d93a2e', fontWeight: 700, mb: 2 }}>
                    {profileError}
                  </Typography>
                ) : null}

                <Grid container spacing={2}>
                  {profileFields.map((field) => (
                    <Grid key={field.label} size={field.size}>
                      <Typography
                        sx={{
                          mb: 0.7,
                          color: '#b8b8b8',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          fontSize: '0.92rem',
                        }}
                      >
                        {field.label}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        disabled={!isEditingProfile}
                        type={field.type || 'text'}
                        value={profileFormValues[field.id] || ''}
                        onChange={(event) => handleProfileFieldChange(field.id, event.target.value)}
                        inputProps={field.type === 'date' ? { max: '9999-12-31' } : undefined}
                        sx={profileFieldStyles}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box>
                <Typography sx={{ ...profileSectionTitleStyles, mb: 2.2 }}>
                  Order History
                </Typography>

                <Box
                  sx={{
                    border: `1.5px solid ${COLORS.primary}`,
                    borderRadius: 2,
                    px: { xs: 1.5, md: 2 },
                    py: 1.75,
                  }}
                >
                  <Grid
                    container
                    sx={{
                      px: 1,
                      pb: 1.5,
                      color: COLORS.primary,
                      fontWeight: 800,
                    }}
                  >
                    <Grid size={{ xs: 5.5, md: 6 }}>
                      <Typography sx={{ fontWeight: 800 }}>Item</Typography>
                    </Grid>
                    <Grid size={{ xs: 3, md: 3 }}>
                      <Typography sx={{ fontWeight: 800 }}>Status</Typography>
                    </Grid>
                    <Grid size={{ xs: 3.5, md: 3 }}>
                      <Typography sx={{ fontWeight: 800, textAlign: 'right' }}>Total</Typography>
                    </Grid>
                  </Grid>

                  <Stack spacing={1.5}>
                    {profileOrders.map((order) => (
                      <Box
                        key={order.id}
                        sx={{
                          border: '1px solid #e2e2e2',
                          borderRadius: 2,
                          px: { xs: 1, md: 1.5 },
                          py: 1,
                          boxShadow: '0 2px 8px rgba(15, 45, 75, 0.05)',
                        }}
                      >
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Box
                                sx={{
                                  width: 106,
                                  height: 74,
                                  borderRadius: 1.5,
                                  backgroundColor: '#000',
                                  color: COLORS.surface,
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 900,
                                  fontSize: '2rem',
                                  letterSpacing: '-0.06em',
                                  flexShrink: 0,
                                }}
                              >
                                RODGE
                              </Box>
                              <Box>
                                <Typography
                                  sx={{
                                    color: COLORS.primary,
                                    fontWeight: 800,
                                    fontSize: '1.05rem',
                                  }}
                                >
                                  {order.item}
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    mt: 1,
                                    borderRadius: '999px',
                                    textTransform: 'none',
                                    backgroundColor: COLORS.accent,
                                    minWidth: 0,
                                    px: 1.3,
                                    fontSize: '0.72rem',
                                    '&:hover': {
                                      backgroundColor: COLORS.accentHover,
                                    },
                                  }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Stack>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography
                              sx={{
                                color: order.statusColor,
                                fontWeight: 800,
                                textAlign: { xs: 'left', md: 'center' },
                              }}
                            >
                              {order.status}
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography
                              sx={{
                                color: COLORS.primary,
                                fontWeight: 800,
                                textAlign: 'right',
                                fontSize: '1.05rem',
                              }}
                            >
                              {order.total}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 2, color: COLORS.primary }}
                  >
                    <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
                    <Button
                      variant="text"
                      onClick={() => setIsOrderHistoryOpen(true)}
                      sx={{
                        minWidth: 0,
                        p: 0,
                        color: COLORS.accent,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      View All
                    </Button>
                    <Divider sx={{ flex: 1, borderColor: COLORS.accent }} />
                  </Stack>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ ...profileSectionTitleStyles, mb: 2.2 }}>
                  Saved Locations
                </Typography>
                <Divider sx={{ mb: 2.8, borderColor: '#cfcfcf' }} />

                <Grid container spacing={2.5}>
                  {locationsLoading ? (
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}>
                        <CircularProgress size={32} sx={{ color: COLORS.primary }} />
                      </Box>
                    </Grid>
                  ) : null}

                  {!locationsLoading && locationsError ? (
                    <Grid size={{ xs: 12 }}>
                      <Typography sx={{ color: '#d93a2e', fontWeight: 700 }}>
                        {locationsError}
                      </Typography>
                    </Grid>
                  ) : null}

                  {!locationsLoading && !locationsError && savedLocations.map((location) => (
                    <Grid key={location.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Stack spacing={1.2} alignItems="center">
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 210,
                            aspectRatio: '1 / 1',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid #d6d6d6',
                            position: 'relative',
                            backgroundColor: '#f2f2f2',
                            backgroundImage: `
                              linear-gradient(90deg, rgba(255,255,255,0.72) 0 12%, transparent 12% 22%, rgba(255,255,255,0.72) 22% 34%, transparent 34% 100%),
                              linear-gradient(0deg, rgba(255,255,255,0.75) 0 14%, transparent 14% 27%, rgba(255,255,255,0.75) 27% 40%, transparent 40% 100%),
                              radial-gradient(circle at 62% 68%, rgba(137, 214, 122, 0.55) 0 18%, transparent 18%),
                              radial-gradient(circle at 74% 38%, rgba(231, 145, 203, 0.45) 0 9%, transparent 9%)
                            `,
                            backgroundSize: 'cover',
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                            }}
                          >
                            <IconButton
                              aria-label={`Edit ${location.locationName} location`}
                              onClick={() => openEditLocationDialog(location)}
                              sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: 'rgba(255,255,255,0.92)',
                                '&:hover': { backgroundColor: COLORS.surface },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                            </IconButton>
                            <IconButton
                              aria-label={`Delete ${location.locationName} location`}
                              onClick={() => setPendingDeleteLocation(location)}
                              sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: 'rgba(255,255,255,0.92)',
                                '&:hover': { backgroundColor: COLORS.surface },
                              }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 17, color: '#1f1f1f' }} />
                            </IconButton>
                          </Stack>

                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '52%',
                              width: 18,
                              height: 18,
                              transform: 'translate(-50%, -60%)',
                              borderRadius: '50% 50% 50% 0',
                              rotate: '-45deg',
                              backgroundColor: '#ef3d32',
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 'calc(50% - 2px)',
                              left: 'calc(52% - 1px)',
                              width: 7,
                              height: 7,
                              transform: 'translate(-50%, -50%)',
                              borderRadius: '50%',
                              backgroundColor: COLORS.surface,
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: COLORS.primary,
                            fontWeight: 800,
                            fontSize: '1rem',
                            textAlign: 'center',
                          }}
                        >
                          {location.locationName}
                        </Typography>
                        <Typography
                          sx={{
                            color: COLORS.textLight,
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            textAlign: 'center',
                            maxWidth: 230,
                          }}
                        >
                          {formatLocationSubtitle(location)}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}

                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Stack spacing={1.2} alignItems="center">
                      <Box
                        component="button"
                        type="button"
                        onClick={openAddLocationDialog}
                        sx={{
                          width: '100%',
                          maxWidth: 210,
                          aspectRatio: '1 / 1',
                          borderRadius: 2,
                          backgroundColor: '#bfbfbf',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1.5,
                          border: 0,
                          cursor: 'pointer',
                          transition: 'transform 180ms ease, background-color 180ms ease',
                          '&:hover': {
                            backgroundColor: '#b4b4b4',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: '50%',
                            border: `3px solid ${COLORS.primary}`,
                            display: 'grid',
                            placeItems: 'center',
                            color: COLORS.primary,
                          }}
                        >
                          <AddRoundedIcon sx={{ fontSize: 40 }} />
                        </Box>
                        <Typography sx={{ color: COLORS.primary, fontWeight: 700 }}>
                          Add New Location
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <AddLocationDialog
        open={isAddLocationDialogOpen}
        onClose={closeLocationDialog}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        values={locationFormValues}
        onChange={handleLocationFormChange}
        onSubmit={handleLocationSubmit}
        submitLabel={editingLocation ? 'Update Location' : 'Add Location'}
        loading={locationSaving}
        error={locationFormError}
      />

      <OrderHistoryDialog
        open={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={profileOrders}
      />

      <AlertDialog
        open={Boolean(pendingDeleteLocation)}
        onClose={() => {
          if (!locationDeleting) {
            setPendingDeleteLocation(null)
          }
        }}
        title="Delete location?"
        titleColor="#d93a2e"
        description={
          pendingDeleteLocation
            ? `Do you want to delete ${pendingDeleteLocation.locationName}?`
            : ''
        }
        primaryButtonText={locationDeleting ? 'Deleting...' : 'Delete'}
        primaryButtonColor="#f44336"
        onPrimaryButtonClick={handleDeleteLocation}
        secondaryActionText="Cancel"
        secondaryActionColor={COLORS.primary}
        onSecondaryActionClick={() => setPendingDeleteLocation(null)}
        disableBackdropClick={locationDeleting}
      />
    </Box>
  )
}

export default ProfilePage
