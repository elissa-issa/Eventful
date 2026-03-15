import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { COLORS } from '../constants/colors'
import {
  profileFields,
  profileFieldStyles,
  profileLocations,
  profileOrders,
  profileSectionTitleStyles,
} from '../constants/profilePage'

function ProfilePage() {
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
                  sx={{
                    width: 116,
                    height: 116,
                    mt: 2.5,
                    mb: 2,
                    backgroundColor: '#bdbdbd',
                  }}
                >
                  <PersonOutlineRoundedIcon sx={{ fontSize: 88, color: COLORS.surface }} />
                </Avatar>

                <Typography
                  sx={{
                    color: COLORS.primary,
                    fontWeight: 800,
                    fontSize: '2rem',
                  }}
                >
                  John Doe
                </Typography>

                <Stack direction="row" spacing={2.5} sx={{ mt: 1.75, mb: 4 }}>
                  <FavoriteRoundedIcon sx={{ color: '#ff1f1f', fontSize: 40 }} />
                  <ShoppingCartRoundedIcon sx={{ color: COLORS.accent, fontSize: 40 }} />
                </Stack>

                <Stack spacing={1.3} sx={{ width: '100%', maxWidth: 250 }}>
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      backgroundColor: COLORS.primary,
                    }}
                  >
                    Upload Image
                  </Button>
                  <Button
                    variant="contained"
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
                    Switch Account
                  </Button>
                  <Button
                    variant="contained"
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
                    Delete
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
                    sx={{
                      borderRadius: '999px',
                      textTransform: 'none',
                      px: 2.25,
                      py: 0.5,
                      backgroundColor: COLORS.accent,
                      '&:hover': {
                        backgroundColor: COLORS.accentHover,
                      },
                    }}
                  >
                    Edit profile
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2.5, borderColor: '#cfcfcf' }} />

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
                        disabled
                        value={field.value}
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
                    <Divider sx={{ flex: 1, borderColor: COLORS.primary }} />
                    <Typography sx={{ fontSize: '0.95rem' }}>View All</Typography>
                    <Divider sx={{ flex: 1, borderColor: COLORS.primary }} />
                  </Stack>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ ...profileSectionTitleStyles, mb: 2.2 }}>
                  Saved Locations
                </Typography>
                <Divider sx={{ mb: 2.8, borderColor: '#cfcfcf' }} />

                <Grid container spacing={2.5}>
                  {profileLocations.map((location) => (
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
                            fontWeight: 500,
                            fontSize: '1rem',
                          }}
                        >
                          {location.label}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}

                  <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Stack spacing={1.2} alignItems="center">
                      <Box
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
    </Box>
  )
}

export default ProfilePage