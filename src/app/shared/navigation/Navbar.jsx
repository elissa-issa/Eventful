import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link as RouterLink, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
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
  const location = useLocation()
  const isServicesPage = location.pathname === '/services'
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const avatarLabel = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.trim() || 'U'
  const [hoveredItem, setHoveredItem] = useState(null)
  const [searchValue, setSearchValue] = useState(() => {
    const params = new URLSearchParams(location.search)

    return params.get('q') || ''
  })

  const handleFilterToggle = () => {
    const params = new URLSearchParams(location.search)
    const nextHash = location.hash || '#venues'

    if (params.get('filters') === 'open') {
      params.delete('filters')
    } else {
      params.set('filters', 'open')
    }

    navigate({
      pathname: location.pathname,
      hash: nextHash,
      search: params.toString() ? `?${params.toString()}` : '',
    })
  }

  const handleSearchSubmit = () => {
    const trimmedSearchValue = searchValue.trim()
    const params = new URLSearchParams()

    if (trimmedSearchValue) {
      params.set('q', trimmedSearchValue)
    }

    navigate({
      pathname: '/search',
      search: params.toString() ? `?${params.toString()}` : '',
    })
  }

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
            component={RouterLink}
            to="/home"
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mr: 4,
              textDecoration: 'none',
              cursor: 'pointer',
              color: 'inherit',
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
            sx={{
              display: { xs: 'none', md: 'flex' },
              mr: 3,
              alignItems: 'center',
              minHeight: 64,
            }}
          >
            {navItems.map(({ label, path, children }) => {
              if (!children) {
                return (
                  <NavLink
                    key={path}
                    to={path}
                    style={{
                      ...getLinkStyles({ isActive: location.pathname === path }),
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: 64,
                    }}
                  >
                    {label}
                  </NavLink>
                )
              }

              const isActive = location.pathname === path
              const isOpen = hoveredItem === path

              return (
                <Box
                  key={path}
                  onMouseEnter={() => setHoveredItem(path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 64,
                    '&::after': isOpen
                      ? {
                          content: '""',
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          width: '100%',
                          height: 14,
                        }
                      : undefined,
                  }}
                >
                  <NavLink
                    to={path}
                    style={() => ({
                      color: isActive ? COLORS.primary : COLORS.primaryHover,
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderBottom: isActive
                        ? `2px solid ${COLORS.primary}`
                        : '2px solid transparent',
                      paddingBottom: '2px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      minHeight: 64,
                    })}
                  >
                    {label}
                  </NavLink>

                  {isOpen ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 'calc(100% - 2px)',
                        left: -16,
                        minWidth: 144,
                        pt: 1.75,
                        pb: 1.25,
                        px: 2,
                        borderRadius: 1.25,
                        backgroundColor: COLORS.surface,
                        border: `1px solid ${COLORS.borderStrong}`,
                        boxShadow: '0 6px 18px rgba(15, 45, 75, 0.18)',
                        zIndex: 20,
                      }}
                    >
                      <Stack spacing={1.1}>
                        {children.map((child) => (
                          <Box
                            key={child.hash}
                            component={RouterLink}
                            to={{ pathname: path, hash: child.hash }}
                            sx={{
                              color:
                                location.pathname === path && location.hash === child.hash
                                  ? COLORS.primary
                                  : COLORS.primaryHover,
                              textDecoration: 'none',
                              fontSize: '0.92rem',
                              fontWeight: 500,
                              lineHeight: 1.1,
                              py: 0.15,
                              '&:hover': {
                                color: COLORS.primary,
                              },
                            }}
                          >
                            {child.label}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : null}
                </Box>
              )
            })}
          </Stack>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <OutlinedInput
              size="small"
              placeholder="Search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSearchSubmit()
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  <IconButton
                    aria-label="Search services"
                    onClick={handleSearchSubmit}
                    edge="start"
                    sx={{ color: COLORS.textLight, p: 0.25 }}
                  >
                    <SearchRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
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
                onClick={handleFilterToggle}
                sx={{ color: COLORS.primary }}
              >
                <TuneRoundedIcon />
              </IconButton>
            ) : null}

            {isAuthenticated ? (
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
                  onClick={() => navigate('/collections')}
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
                    src={user?.avatarSrc || undefined}
                    sx={{ width: 28, height: 28, bgcolor: COLORS.accent }}
                  >
                    {avatarLabel}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/sign-up')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '999px',
                    px: 2,
                    backgroundColor: COLORS.accent,
                    '&:hover': {
                      backgroundColor: COLORS.accentHover,
                    },
                  }}
                >
                  Sign up
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
