import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import Person from '@mui/icons-material/Person'
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { NavLink, useNavigate } from 'react-router-dom'
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
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mr: 4 }}>
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
            sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}
          >
            {navItems.map(({ label, path }) => (
              <NavLink key={path} to={path} style={getLinkStyles}>
                {label}
              </NavLink>
            ))}
          </Stack>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          <Button
            variant="contained"
            size="small"
            startIcon={<Person />}
            onClick={() => navigate('/sign-up')}
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
            }}
          >
            Sign Up
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
