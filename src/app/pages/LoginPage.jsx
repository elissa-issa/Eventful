import { useMemo, useState } from 'react'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import facebookIcon from '../../assets/facebookicon.svg'
import googleIcon from '../../assets/Google.svg'
import { useAuth } from '../auth/useAuth'
import { COLORS } from '../constants/colors'
import {
  signUpBackgroundImage,
  signUpTextFieldStyles,
} from '../constants/signUpPage'
import { loginUser } from '../services/auth'

function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [stayLoggedIn, setStayLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const redirectPath = location.state?.from || '/profile'

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const result = await loginUser({
        email,
        password,
      })

      login(result.data, stayLoggedIn)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          maxWidth: 470,
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
          Login
        </Typography>

        <Stack component="form" spacing={1} onSubmit={handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            fullWidth
            size="small"
            placeholder="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            sx={signUpTextFieldStyles}
          />

          <TextField
            fullWidth
            size="small"
            placeholder="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            slotProps={{ input: { endAdornment: passwordAdornment } }}
            sx={signUpTextFieldStyles}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={stayLoggedIn}
                onChange={(event) => setStayLoggedIn(event.target.checked)}
                size="small"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  '&.Mui-checked': {
                    color: COLORS.surface,
                  },
                }}
              />
            }
            label="Stay logged in"
            sx={{
              mx: 0,
              justifyContent: 'flex-end',
              width: '100%',
              mt: -1.25,
              color: COLORS.surface,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
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
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          <Link
            component={RouterLink}
            to="/home"
            underline="always"
            sx={{
              alignSelf: 'flex-end',
              color: COLORS.surface,
              fontSize: '0.88rem',
              mt: -1.25,
            }}
          >
            Forgot password?
          </Link>

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
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/sign-up"
            underline="always"
            sx={{ color: COLORS.surface, fontWeight: 700 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default LoginPage
