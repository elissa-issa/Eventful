import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { COLORS } from '../../constants/colors'
import Navbar from '../navigation/Navbar'
function MainLayout() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
export default MainLayout
