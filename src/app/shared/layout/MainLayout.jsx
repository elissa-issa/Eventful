import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import Footer from './Footer'
import Navbar from '../navigation/Navbar'

function MainLayout() {
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
      <Container maxWidth="lg" sx={{ py: 5, flexGrow: 1 }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}

export default MainLayout
