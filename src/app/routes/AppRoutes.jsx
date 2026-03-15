import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../shared/layout/MainLayout'
import CartPage from '../pages/CartPage'
import ServiceItemPage from '../pages/ServiceItemPage'
import ServicesPage from '../pages/ServicesPage'
import CustomizePage from '../pages/CustomizePage'
import ContactUsPage from '../pages/ContactUsPage'
import FavoritesPage from '../pages/FavoritesPage'
import ProfilePage from '../pages/ProfilePage'
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
        <Route path="/services/:section/:itemId" element={<ServiceItemPage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes
