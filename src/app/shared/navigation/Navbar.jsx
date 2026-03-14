import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import MicRoundedIcon from '@mui/icons-material/MicRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Link,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import { navItems } from './navItems'

const getLinkStyles = ({ isActive }) => ({
  color: isActive ? COLORS.primary : COLORS.primaryHover,
  textDecoration: 'none',
  fontSize: '0.9rem',
  fontWeight: 700,
  borderBottom: isActive ? `2px solid ${COLORS.primary}` : '2px solid transparent',
  paddingBottom: '2px',
})

function Navbar() {
  const isLoggedIn = true
  const isServicesPage = useLocation().pathname === '/services'
  const navigate = useNavigate()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: COLORS.surface,
        color: COLORS.primaryMuted,
        borderBottom: `2px solid ${COLORS.borderStrong}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: 64, px: { xs: 0, sm: 1 } }}>
          <Stack
            component={Link}
            to="/home"
            underline="none"
            color="inherit"
            component={RouterLink}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mr: 4,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <EventAvailableIcon sx={{ color: COLORS.primary }} />
            <Typography
              variant="h6"
              sx={{ color: COLORS.primary, fontWeight: 800, letterSpacing: 0.2 }}
            >
              eventful
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={3}
            sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}
          >
            {navItems.map(({ label, path }) => (
              <NavLink key={path} to={path} style={getLinkStyles}>
                {label}
              </NavLink>
            ))}
          </Stack>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <OutlinedInput
              size="small"
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: COLORS.textLight, fontSize: 18 }} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <MicRoundedIcon sx={{ color: COLORS.textLight, fontSize: 18 }} />
                </InputAdornment>
              }
              sx={{
                display: { xs: 'none', md: 'flex' },
                mr: 2,
                width: 300,
                height: 36,
                borderRadius: '999px',
                backgroundColor: '#f6f6f8',
                color: COLORS.textMuted,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            />
          </Box>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              ml: 0.5,
              color: COLORS.primary,
            }}
          >
            {isServicesPage ? (
              <IconButton
                aria-label="Open filters"
                sx={{ color: COLORS.primary }}
              >
                <TuneRoundedIcon />
              </IconButton>
            ) : null}

            {isLoggedIn ? (
              <>
                <IconButton
                  aria-label="Open favorites"
                  onClick={() => navigate('/favorites')}
                  sx={{ color: COLORS.primary }}
                >
                  <FavoriteBorderRoundedIcon />
                </IconButton>

                <IconButton
                  aria-label="Open cart"
                  onClick={() => navigate('/cart')}
                  sx={{ color: COLORS.primary }}
                >
                  <ShoppingCartOutlinedIcon />
                </IconButton>

                <IconButton
                  aria-label="Open profile"
                  onClick={() => navigate('/profile')}
                  sx={{ p: 0.5, ml: 0.25 }}
                >
                  <Avatar
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
                    alt="Profile"
                    sx={{ width: 28, height: 28 }}
                  />
                </IconButton>
              </>
            ) : null}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
