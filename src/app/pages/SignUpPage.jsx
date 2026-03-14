import { useMemo, useState } from 'react'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import { Link as RouterLink } from 'react-router-dom'
import facebookIcon from '../../assets/facebookicon.svg'
import googleIcon from '../../assets/Google.svg'
import { COLORS } from '../constants/colors'
import {
  signUpBackgroundImage,
  signUpTextFieldStyles,
} from '../constants/signUpPage'

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [birthday, setBirthday] = useState(null)

  const passwordAdornment = useMemo(
    () => (
      <InputAdornment position="end">
        <IconButton
          edge="end"
          onClick={() => setShowPassword((value) => !value)}
          sx={{ color: 'rgba(28, 53, 85, 0.7)' }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
    [showPassword],
  )

  const confirmPasswordAdornment = useMemo(
    () => (
      <InputAdornment position="end">
        <IconButton
          edge="end"
          onClick={() => setShowConfirmPassword((value) => !value)}
          sx={{ color: 'rgba(28, 53, 85, 0.7)' }}
        >
          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
    [showConfirmPassword],
  )

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          minHeight: { xs: 'calc(100vh - 180px)', md: 'calc(100vh - 150px)' },
          width: '100vw',
          left: '50%',
          position: 'relative',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, md: 6 },
          overflow: 'hidden',
          backgroundImage: `linear-gradient(${COLORS.overlay}, ${COLORS.overlay}), url(${signUpBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 580,
            mx: 'auto',
            px: { xs: 2.5, sm: 4 },
            py: { xs: 4, md: 5 },
            borderRadius: 3,
            backdropFilter: 'blur(8px)',
            background:
              'linear-gradient(180deg, rgba(55, 130, 211, 0.78) 0%, rgba(63, 142, 226, 0.68) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
          }}
        >
            <Typography
              variant="h3"
              align="center"
              sx={{
                color: COLORS.surface,
                fontWeight: 800,
                fontSize: { xs: '2.1rem', md: '2.6rem' },
                mb: 4,
              }}
            >
              Signup
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="First Name"
                  variant="outlined"
                  sx={signUpTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Last Name"
                  variant="outlined"
                  sx={signUpTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  enableAccessibleFieldDOMStructure={false}
                  value={birthday}
                  onChange={(value) => setBirthday(value)}
                  maxDate={dayjs()}
                  format="MM/DD/YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      placeholder: 'Birthday (Optional)',
                      variant: 'outlined',
                      sx: signUpTextFieldStyles,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Email"
                  type="email"
                  variant="outlined"
                  sx={signUpTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  slotProps={{ input: { endAdornment: passwordAdornment } }}
                  sx={signUpTextFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  slotProps={{ input: { endAdornment: confirmPasswordAdornment } }}
                  sx={signUpTextFieldStyles}
                />
              </Grid>
            </Grid>

            <Stack spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 1.1,
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 800,
                  color: COLORS.primary,
                  backgroundColor: COLORS.surface,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  },
                }}
              >
                Signup
              </Button>

              <Button
                fullWidth
                startIcon={
                  <Box
                    component="img"
                    src={googleIcon}
                    alt="Google"
                    sx={{ width: 18, height: 18 }}
                  />
                }
                sx={{
                  py: 0.9,
                  borderRadius: 1,
                  textTransform: 'none',
                  position: 'relative',
                  justifyContent: 'flex-start',
                  color: 'rgba(255, 255, 255, 0.86)',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  '& .MuiButton-startIcon': {
                    ml: 1,
                    mr: 3,
                  },
                  '&:hover': {
                    backgroundColor: COLORS.surface,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(60, 89, 120, 0.65)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Login with Google
                </Box>
              </Button>

              <Button
                fullWidth
                startIcon={
                  <Box
                    component="img"
                    src={facebookIcon}
                    alt="Facebook"
                    sx={{ width: 18, height: 18 }}
                  />
                }
                sx={{
                  py: 0.9,
                  borderRadius: 1,
                  textTransform: 'none',
                  position: 'relative',
                  justifyContent: 'flex-start',
                  color: 'rgba(255, 255, 255, 0.86)',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  '& .MuiButton-startIcon': {
                    ml: 1,
                    mr: 2,
                  },
                  '&:hover': {
                    backgroundColor: COLORS.surface,
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(60, 89, 120, 0.65)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Login with Facebook
                </Box>
              </Button>
            </Stack>

            <Typography
              align="center"
              sx={{
                mt: 2.5,
                color: 'rgba(255, 255, 255, 0.92)',
                fontSize: '0.9rem',
              }}
            >
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/home"
                underline="always"
                sx={{ color: COLORS.surface, fontWeight: 700 }}
              >
                Login
              </Link>
            </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default SignUpPage
