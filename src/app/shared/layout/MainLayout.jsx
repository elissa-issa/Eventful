import { Box, Container } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import Footer from './Footer'
import Navbar from '../navigation/Navbar'

function MainLayout() {
  const location = useLocation()
  const isAuthPage =
    location.pathname === '/sign-up' || location.pathname === '/login'
  const isHomePage = location.pathname === '/home' || location.pathname === '/'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: COLORS.surface,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container maxWidth="lg" sx={{ pt: 0, pb: isAuthPage || isHomePage ? 0 : 5, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}

export default MainLayout
