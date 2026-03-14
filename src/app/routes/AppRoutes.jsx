import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../shared/layout/MainLayout'
import ServicesPage from '../pages/ServicesPage'
import CustomizePage from '../pages/CustomizePage'
import ContactUsPage from '../pages/ContactUsPage'
import VendorsPage from '../pages/VendorsPage'
import LoginPage from '../pages/LoginPage'
import SignUpPage from '../pages/SignUpPage'
import HomePage from '../pages/HomePage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes
